import { mutation } from "../../_generated/server";
import { v } from "convex/values";
import { requireUser } from "../../lib/auth";

/**
 * sendMessage — sends a message to a chat room.
 *
 * Requires authentication. Updates presence as side effect.
 */
export const sendMessage = mutation({
  args: {
    roomId: v.id("chatRooms"),
    content: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    if (args.content.trim().length === 0 && !args.imageStorageId) {
      throw new Error("Message cannot be empty");
    }
    if (args.content.length > 5000) {
      throw new Error("Message cannot exceed 5000 characters");
    }

    const room = await ctx.db.get(args.roomId);
    if (!room) {
      throw new Error("Room not found");
    }

    // For DM/group rooms, verify user is a participant
    if (room.type === "dm" || room.type === "group") {
      if (!room.participantIds?.includes(user._id)) {
        throw new Error("You are not a participant of this room");
      }
    }

    const messageId = await ctx.db.insert("chatMessages", {
      roomId: args.roomId,
      authorId: user._id,
      content: args.content.trim(),
      imageStorageId: args.imageStorageId,
    });

    // Update presence (stop typing)
    const presence = await ctx.db
      .query("chatPresence")
      .withIndex("by_user_room", (q) =>
        q.eq("userId", user._id).eq("roomId", args.roomId)
      )
      .unique();

    if (presence) {
      await ctx.db.patch(presence._id, {
        lastSeen: Date.now(),
        isTyping: false,
      });
    } else {
      await ctx.db.insert("chatPresence", {
        userId: user._id,
        roomId: args.roomId,
        lastSeen: Date.now(),
        isTyping: false,
      });
    }

    return messageId;
  },
});

/**
 * deleteMessage — soft-deletes a chat message. Author-only.
 */
export const deleteMessage = mutation({
  args: {
    messageId: v.id("chatMessages"),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const message = await ctx.db.get(args.messageId);
    if (!message || message.isDeleted === true) {
      throw new Error("Message not found");
    }
    if (message.authorId !== user._id) {
      throw new Error("You can only delete your own messages");
    }

    await ctx.db.patch(args.messageId, { isDeleted: true });
  },
});

/**
 * createDM — finds existing DM between two users or creates one.
 */
export const createDM = mutation({
  args: {
    otherUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    if (args.otherUserId === user._id) {
      throw new Error("Cannot create a DM with yourself");
    }

    const otherUser = await ctx.db.get(args.otherUserId);
    if (!otherUser) {
      throw new Error("User not found");
    }

    // Check for existing DM
    const allDMs = await ctx.db
      .query("chatRooms")
      .withIndex("by_type", (q) => q.eq("type", "dm"))
      .collect();

    const existingDM = allDMs.find((room) => {
      const ids = room.participantIds ?? [];
      return (
        ids.length === 2 &&
        ids.includes(user._id) &&
        ids.includes(args.otherUserId)
      );
    });

    if (existingDM) {
      return existingDM._id;
    }

    // Create new DM room
    const roomId = await ctx.db.insert("chatRooms", {
      name: `${user.name} & ${otherUser.name}`,
      type: "dm",
      participantIds: [user._id, args.otherUserId],
    });

    return roomId;
  },
});

/**
 * createGroupChat — creates a new group chat room.
 */
export const createGroupChat = mutation({
  args: {
    name: v.string(),
    participantIds: v.array(v.id("users")),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    if (args.name.trim().length === 0) {
      throw new Error("Group name cannot be empty");
    }

    // Ensure the creator is included in participants
    const allParticipants = Array.from(
      new Set([user._id, ...args.participantIds])
    );

    const roomId = await ctx.db.insert("chatRooms", {
      name: args.name.trim(),
      type: "group",
      participantIds: allParticipants,
    });

    return roomId;
  },
});

/**
 * addGroupMember — adds a user to a group chat.
 */
export const addGroupMember = mutation({
  args: {
    roomId: v.id("chatRooms"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const room = await ctx.db.get(args.roomId);
    if (!room || room.type !== "group") {
      throw new Error("Group not found");
    }
    if (!room.participantIds?.includes(user._id)) {
      throw new Error("You are not a member of this group");
    }

    const currentParticipants = room.participantIds ?? [];
    if (currentParticipants.includes(args.userId)) {
      return; // Already a member
    }

    await ctx.db.patch(args.roomId, {
      participantIds: [...currentParticipants, args.userId],
    });
  },
});

/**
 * removeGroupMember — removes a user from a group chat.
 */
export const removeGroupMember = mutation({
  args: {
    roomId: v.id("chatRooms"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const room = await ctx.db.get(args.roomId);
    if (!room || room.type !== "group") {
      throw new Error("Group not found");
    }
    if (!room.participantIds?.includes(user._id)) {
      throw new Error("You are not a member of this group");
    }

    const currentParticipants = room.participantIds ?? [];
    const updated = currentParticipants.filter((id) => id !== args.userId);

    await ctx.db.patch(args.roomId, {
      participantIds: updated,
    });
  },
});

/**
 * toggleReaction — idempotent emoji reaction toggle on a message.
 */
export const toggleReaction = mutation({
  args: {
    messageId: v.id("chatMessages"),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    // Check for existing reaction with same emoji from same user
    const existingReactions = await ctx.db
      .query("chatReactions")
      .withIndex("by_user_message", (q) =>
        q.eq("userId", user._id).eq("messageId", args.messageId)
      )
      .collect();

    const existing = existingReactions.find((r) => r.emoji === args.emoji);

    if (existing) {
      await ctx.db.delete(existing._id);
      return { reacted: false };
    }

    await ctx.db.insert("chatReactions", {
      userId: user._id,
      messageId: args.messageId,
      emoji: args.emoji,
    });
    return { reacted: true };
  },
});

/**
 * updatePresence — heartbeat for typing/online status.
 */
export const updatePresence = mutation({
  args: {
    roomId: v.id("chatRooms"),
    isTyping: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const existing = await ctx.db
      .query("chatPresence")
      .withIndex("by_user_room", (q) =>
        q.eq("userId", user._id).eq("roomId", args.roomId)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        lastSeen: Date.now(),
        isTyping: args.isTyping ?? false,
      });
    } else {
      await ctx.db.insert("chatPresence", {
        userId: user._id,
        roomId: args.roomId,
        lastSeen: Date.now(),
        isTyping: args.isTyping ?? false,
      });
    }
  },
});
