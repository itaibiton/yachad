import { type GenericQueryCtx, type GenericMutationCtx } from "convex/server";
import { type DataModelFromSchemaDefinition } from "convex/server";
import schema from "../schema";

// Types derived from the schema — narrowed once _generated/ is created by `npx convex dev`
type DataModel = DataModelFromSchemaDefinition<typeof schema>;
type QueryCtx = GenericQueryCtx<DataModel>;
type MutationCtx = GenericMutationCtx<DataModel>;

/**
 * requireUser — validates the caller is authenticated and not banned.
 *
 * Usage:
 *   const user = await requireUser(ctx);
 */
export async function requireUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthenticated");
  }

  // subject is the Clerk userId (e.g. "user_abc123")
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();

  if (!user) {
    throw new Error("User not found in database");
  }

  if (user.isBanned) {
    throw new Error("User is banned");
  }

  return user;
}

/**
 * requireAgent — validates the caller is an approved agent (or admin).
 *
 * CRITICAL: Checks isApproved in the Convex DB, NOT just the Clerk role claim.
 * This prevents revoked agents from posting flights during fraud/wartime scenarios.
 *
 * Usage:
 *   const agent = await requireAgent(ctx);
 */
export async function requireAgent(ctx: QueryCtx | MutationCtx) {
  const user = await requireUser(ctx);

  if (user.role !== "agent" && user.role !== "admin") {
    throw new Error("Requires agent or admin role");
  }

  // Agents must also be approved in the DB — admins bypass this check
  if (user.role === "agent" && user.isApproved !== true) {
    throw new Error("Agent account is pending approval");
  }

  return user;
}

/**
 * requireAdmin — validates the caller has the admin role.
 *
 * Usage:
 *   const admin = await requireAdmin(ctx);
 */
export async function requireAdmin(ctx: MutationCtx) {
  const user = await requireUser(ctx);

  if (user.role !== "admin") {
    throw new Error("Requires admin role");
  }

  return user;
}
