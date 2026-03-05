import { mutation } from "../../_generated/server";
import { v } from "convex/values";
import { requireUser } from "../../lib/auth";

/**
 * createPost — creates a new community post.
 *
 * Requires authentication. Validates content length.
 */
export const createPost = mutation({
  args: {
    content: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
    country: v.optional(v.string()),
    city: v.optional(v.string()),
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
    const user = await requireUser(ctx);

    if (args.content.trim().length === 0) {
      throw new Error("Post content cannot be empty");
    }
    if (args.content.length > 2000) {
      throw new Error("Post content cannot exceed 2000 characters");
    }

    const postId = await ctx.db.insert("posts", {
      authorId: user._id,
      content: args.content.trim(),
      imageStorageId: args.imageStorageId,
      country: args.country,
      city: args.city,
      category: args.category,
    });

    return postId;
  },
});

/**
 * editPost — edits a post's content. Author-only.
 */
export const editPost = mutation({
  args: {
    postId: v.id("posts"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const post = await ctx.db.get(args.postId);
    if (!post || post.isDeleted === true) {
      throw new Error("Post not found");
    }
    if (post.authorId !== user._id) {
      throw new Error("You can only edit your own posts");
    }

    if (args.content.trim().length === 0) {
      throw new Error("Post content cannot be empty");
    }
    if (args.content.length > 2000) {
      throw new Error("Post content cannot exceed 2000 characters");
    }

    await ctx.db.patch(args.postId, { content: args.content.trim() });
  },
});

/**
 * deletePost — soft-deletes a post. Author-only.
 */
export const deletePost = mutation({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const post = await ctx.db.get(args.postId);
    if (!post || post.isDeleted === true) {
      throw new Error("Post not found");
    }
    if (post.authorId !== user._id) {
      throw new Error("You can only delete your own posts");
    }

    await ctx.db.patch(args.postId, { isDeleted: true });
  },
});

/**
 * toggleLike — idempotent like toggle using by_user_post index.
 *
 * Same pattern as toggleSaveFlight.
 */
export const toggleLike = mutation({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const existing = await ctx.db
      .query("postLikes")
      .withIndex("by_user_post", (q) =>
        q.eq("userId", user._id).eq("postId", args.postId)
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { liked: false };
    }

    await ctx.db.insert("postLikes", {
      userId: user._id,
      postId: args.postId,
    });
    return { liked: true };
  },
});

/**
 * addComment — adds a comment to a post.
 */
export const addComment = mutation({
  args: {
    postId: v.id("posts"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    if (args.content.trim().length === 0) {
      throw new Error("Comment cannot be empty");
    }
    if (args.content.length > 1000) {
      throw new Error("Comment cannot exceed 1000 characters");
    }

    const post = await ctx.db.get(args.postId);
    if (!post || post.isDeleted === true) {
      throw new Error("Post not found");
    }

    const commentId = await ctx.db.insert("postComments", {
      postId: args.postId,
      authorId: user._id,
      content: args.content.trim(),
    });

    return commentId;
  },
});

/**
 * deleteComment — soft-deletes a comment. Author-only.
 */
export const deleteComment = mutation({
  args: {
    commentId: v.id("postComments"),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const comment = await ctx.db.get(args.commentId);
    if (!comment || comment.isDeleted === true) {
      throw new Error("Comment not found");
    }
    if (comment.authorId !== user._id) {
      throw new Error("You can only delete your own comments");
    }

    await ctx.db.patch(args.commentId, { isDeleted: true });
  },
});

/**
 * repost — creates a new post referencing the original.
 */
export const repost = mutation({
  args: {
    postId: v.id("posts"),
    content: v.optional(v.string()),
    country: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const original = await ctx.db.get(args.postId);
    if (!original || original.isDeleted === true) {
      throw new Error("Original post not found");
    }

    // Don't allow reposting a repost — repost the original instead
    const repostOfId = original.repostOfId ?? original._id;

    const newPostId = await ctx.db.insert("posts", {
      authorId: user._id,
      content: args.content?.trim() ?? "",
      country: args.country,
      repostOfId,
    });

    return newPostId;
  },
});
