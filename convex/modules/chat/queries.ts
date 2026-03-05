import { query } from "../../_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { requireUser } from "../../lib/auth";

/**
 * listRooms — Rooms for the current user.
 *
 * Returns country rooms matching the user's selected country,
 * DMs where the user is a participant, and group chats where
 * the user is a participant.
 */
export const listRooms = query({
  args: {
    country: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    // DMs and groups where user is a participant
    const allRooms = await ctx.db.query("chatRooms").collect();
    const userRooms = allRooms.filter((room) => {
      if (room.type === "dm" || room.type === "group") {
        return room.participantIds?.includes(user._id);
      }
      return false;
    });

    // Country rooms for the selected country
    let countryRooms: (typeof allRooms)[number][] = [];
    if (args.country) {
      countryRooms = allRooms.filter(
        (r) =>
          r.country === args.country &&
          (r.type === "country" || r.type === "emergency")
      );
    }

    const rooms = [...countryRooms, ...userRooms];

    // Deduplicate by room ID
    const seen = new Set<string>();
    const uniqueRooms = rooms.filter((r) => {
      if (seen.has(r._id)) return false;
      seen.add(r._id);
      return true;
    });

    // Enrich with last message preview
    const enriched = await Promise.all(
      uniqueRooms.map(async (room) => {
        const lastMessages = await ctx.db
          .query("chatMessages")
          .withIndex("by_room_time", (q) => q.eq("roomId", room._id))
          .order("desc")
          .take(1);

        const lastMessage = lastMessages[0];
        let lastMessagePreview = null;
        if (lastMessage && lastMessage.isDeleted !== true) {
          const author = await ctx.db.get(lastMessage.authorId);
          lastMessagePreview = {
            content: lastMessage.content.slice(0, 80),
            authorName: author?.name ?? "Unknown",
            createdAt: lastMessage._creationTime,
          };
        }

        // For DMs, resolve the other participant's name
        let displayName = room.name;
        if (room.type === "dm" && room.participantIds) {
          const otherId = room.participantIds.find((id: string) => id !== user._id);
          if (otherId) {
            const other = await ctx.db.get(otherId as any);
            displayName = (other as any)?.name ?? room.name;
          }
        }

        return {
          ...room,
          displayName,
          lastMessagePreview,
        };
      })
    );

    // Sort by last message time (most recent first)
    enriched.sort((a, b) => {
      const aTime = a.lastMessagePreview?.createdAt ?? a._creationTime;
      const bTime = b.lastMessagePreview?.createdAt ?? b._creationTime;
      return bTime - aTime;
    });

    return enriched;
  },
});

/**
 * listMessages — Paginated messages for a room.
 *
 * Uses by_room_time index, ordered desc so newest come first.
 * Client reverses for display (newest at bottom).
 */
export const listMessages = query({
  args: {
    roomId: v.id("chatRooms"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    await requireUser(ctx);

    const result = await ctx.db
      .query("chatMessages")
      .withIndex("by_room_time", (q) => q.eq("roomId", args.roomId))
      .order("desc")
      .paginate(args.paginationOpts);

    const enrichedPage = await Promise.all(
      result.page.map(async (msg) => {
        if (msg.isDeleted === true) {
          return {
            ...msg,
            content: "",
            authorName: "Unknown",
            authorImageUrl: null,
            reactions: [],
          };
        }

        const author = await ctx.db.get(msg.authorId);

        // Aggregate reactions
        const reactions = await ctx.db
          .query("chatReactions")
          .withIndex("by_message", (q) => q.eq("messageId", msg._id))
          .collect();

        // Group reactions by emoji
        const reactionMap = new Map<
          string,
          { emoji: string; count: number; userIds: string[] }
        >();
        for (const r of reactions) {
          const existing = reactionMap.get(r.emoji);
          if (existing) {
            existing.count++;
            existing.userIds.push(r.userId);
          } else {
            reactionMap.set(r.emoji, {
              emoji: r.emoji,
              count: 1,
              userIds: [r.userId],
            });
          }
        }

        return {
          ...msg,
          authorName: author?.name ?? "Unknown",
          authorImageUrl: author?.imageUrl ?? null,
          reactions: Array.from(reactionMap.values()),
        };
      })
    );

    return { ...result, page: enrichedPage };
  },
});

/**
 * getRoomInfo — Single room with metadata.
 */
export const getRoomInfo = query({
  args: {
    roomId: v.id("chatRooms"),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) return null;

    const participantCount = room.participantIds?.length ?? 0;

    // Resolve participant names for group/DM rooms
    let participants: { _id: string; name: string; imageUrl: string | null }[] =
      [];
    if (room.participantIds) {
      participants = await Promise.all(
        room.participantIds.map(async (id) => {
          const user = await ctx.db.get(id);
          return {
            _id: id,
            name: user?.name ?? "Unknown",
            imageUrl: user?.imageUrl ?? null,
          };
        })
      );
    }

    return {
      ...room,
      participantCount,
      participants,
    };
  },
});

/**
 * listPresence — Who's online/typing in a room.
 *
 * Only returns presence entries updated in the last 2 minutes.
 */
export const listPresence = query({
  args: {
    roomId: v.id("chatRooms"),
  },
  handler: async (ctx, args) => {
    const twoMinutesAgo = Date.now() - 2 * 60 * 1000;

    const presenceEntries = await ctx.db
      .query("chatPresence")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    const active = presenceEntries.filter((p) => p.lastSeen > twoMinutesAgo);

    const enriched = await Promise.all(
      active.map(async (p) => {
        const user = await ctx.db.get(p.userId);
        return {
          ...p,
          userName: user?.name ?? "Unknown",
        };
      })
    );

    return enriched;
  },
});

/**
 * searchUsers — Search users by name for creating DMs/groups.
 */
export const searchUsers = query({
  args: {
    search: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    if (args.search.trim().length === 0) return [];

    const results = await ctx.db
      .query("users")
      .withSearchIndex("search_name", (q) => q.search("name", args.search.trim()))
      .take(25);

    const matched = results.filter(
      (u) => u._id !== user._id && u.isBanned !== true
    );

    return matched.map((u) => ({
      _id: u._id,
      name: u.name,
      imageUrl: u.imageUrl ?? null,
    }));
  },
});
