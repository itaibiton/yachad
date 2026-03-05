import { query } from "../../_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { filter } from "convex-helpers/server/filter";
import { requireUser } from "../../lib/auth";

/**
 * listPosts — Paginated feed query, filtered by country.
 *
 * Uses by_country_time index when country is provided, otherwise
 * scans all posts ordered by creation time (desc).
 *
 * Denormalizes author data and aggregates like/comment counts
 * from separate tables (OCC pattern).
 */
export const listPosts = query({
  args: {
    paginationOpts: paginationOptsValidator,
    country: v.optional(v.string()),
    category: v.optional(
      v.union(
        v.literal("help_needed"),
        v.literal("offering_help"),
        v.literal("info"),
        v.literal("warning"),
        v.literal("safety_check")
      )
    ),
  },
  handler: async (ctx, args) => {
    let baseQuery;

    if (args.country) {
      baseQuery = ctx.db
        .query("posts")
        .withIndex("by_country_time", (q) => q.eq("country", args.country!))
        .order("desc");
    } else {
      baseQuery = ctx.db.query("posts").order("desc");
    }

    const filtered = filter(baseQuery, (post) => {
      if (post.isDeleted === true) return false;
      if (args.category && post.category !== args.category) return false;
      return true;
    });

    const result = await filtered.paginate(args.paginationOpts);

    const enrichedPage = await Promise.all(
      result.page.map(async (post) => {
        const author = await ctx.db.get(post.authorId);
        const likes = await ctx.db
          .query("postLikes")
          .withIndex("by_post", (q) => q.eq("postId", post._id))
          .collect();
        const comments = await ctx.db
          .query("postComments")
          .withIndex("by_post", (q) => q.eq("postId", post._id))
          .collect();
        const activeComments = comments.filter((c) => c.isDeleted !== true);

        // If this is a repost, fetch the original post + its author
        let repostOf = null;
        if (post.repostOfId) {
          const original = await ctx.db.get(post.repostOfId);
          if (original && original.isDeleted !== true) {
            const originalAuthor = await ctx.db.get(original.authorId);
            repostOf = {
              ...original,
              authorName: originalAuthor?.name ?? "Unknown",
              authorImageUrl: originalAuthor?.imageUrl ?? null,
            };
          }
        }

        return {
          ...post,
          authorName: author?.name ?? "Unknown",
          authorImageUrl: author?.imageUrl ?? null,
          authorClerkId: author?.clerkId ?? null,
          authorRole: author?.role ?? "user",
          likeCount: likes.length,
          commentCount: activeComments.length,
          repostOf,
        };
      })
    );

    return { ...result, page: enrichedPage };
  },
});

/**
 * getPostWithDetails — Single post with author info, like count, and user's like status.
 */
export const getPostWithDetails = query({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post || post.isDeleted === true) return null;

    const author = await ctx.db.get(post.authorId);
    const likes = await ctx.db
      .query("postLikes")
      .withIndex("by_post", (q) => q.eq("postId", post._id))
      .collect();
    const comments = await ctx.db
      .query("postComments")
      .withIndex("by_post", (q) => q.eq("postId", post._id))
      .collect();
    const activeComments = comments.filter((c) => c.isDeleted !== true);

    // Check if current user has liked
    let hasLiked = false;
    const identity = await ctx.auth.getUserIdentity();
    if (identity) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
        .unique();
      if (user) {
        const userLike = await ctx.db
          .query("postLikes")
          .withIndex("by_user_post", (q) =>
            q.eq("userId", user._id).eq("postId", post._id)
          )
          .unique();
        hasLiked = !!userLike;
      }
    }

    let repostOf = null;
    if (post.repostOfId) {
      const original = await ctx.db.get(post.repostOfId);
      if (original && original.isDeleted !== true) {
        const originalAuthor = await ctx.db.get(original.authorId);
        repostOf = {
          ...original,
          authorName: originalAuthor?.name ?? "Unknown",
          authorImageUrl: originalAuthor?.imageUrl ?? null,
        };
      }
    }

    return {
      ...post,
      authorName: author?.name ?? "Unknown",
      authorImageUrl: author?.imageUrl ?? null,
      authorRole: author?.role ?? "user",
      likeCount: likes.length,
      commentCount: activeComments.length,
      hasLiked,
      repostOf,
    };
  },
});

/**
 * listPostComments — All comments for a post with author data.
 */
export const listPostComments = query({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("postComments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .order("asc")
      .collect();

    const enriched = await Promise.all(
      comments
        .filter((c) => c.isDeleted !== true)
        .map(async (comment) => {
          const author = await ctx.db.get(comment.authorId);
          return {
            ...comment,
            authorName: author?.name ?? "Unknown",
            authorImageUrl: author?.imageUrl ?? null,
          };
        })
    );

    return enriched;
  },
});

/**
 * hasUserLikedPost — Quick check for like button state.
 *
 * Returns null if user is not authenticated (allows unauthenticated browsing).
 */
export const hasUserLikedPost = query({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return null;

    const like = await ctx.db
      .query("postLikes")
      .withIndex("by_user_post", (q) =>
        q.eq("userId", user._id).eq("postId", args.postId)
      )
      .unique();

    return !!like;
  },
});
