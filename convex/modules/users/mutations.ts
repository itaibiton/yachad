import { internalMutation } from "../../_generated/server";
import { v } from "convex/values";

/**
 * upsertFromClerk — syncs a user from Clerk webhook events.
 *
 * Called by the Clerk webhook handler on user.created and user.updated events.
 * INTERNAL ONLY: not callable from the client.
 *
 * - If user exists: update email, name, imageUrl, and role
 * - If user is new: insert with role defaulting to "user" and isApproved: false
 */
export const upsertFromClerk = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existingUser) {
      // Update mutable fields from Clerk
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        name: args.name,
        imageUrl: args.imageUrl,
        // Only update role if it's a valid role, otherwise keep existing
        role: (args.role === "agent" || args.role === "admin")
          ? args.role
          : existingUser.role,
      });
    } else {
      // Create new user — always starts as "user" with unapproved status
      // Agent role must be approved via admin dashboard, not just Clerk metadata
      await ctx.db.insert("users", {
        clerkId: args.clerkId,
        email: args.email,
        name: args.name,
        imageUrl: args.imageUrl,
        role: "user",
        isApproved: false,
        isBanned: false,
      });
    }
  },
});

/**
 * deleteFromClerk — handles user.deleted webhook event from Clerk.
 *
 * Soft-deletes by setting isBanned: true rather than removing the document.
 * This preserves the audit trail for posts, messages, and flights associated
 * with the user account.
 *
 * INTERNAL ONLY: not callable from the client.
 */
export const deleteFromClerk = internalMutation({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (user) {
      // Soft delete — preserve user document for audit trail
      await ctx.db.patch(user._id, {
        isBanned: true,
      });
    }
    // If user not found, that's fine — webhook may arrive out of order
  },
});
