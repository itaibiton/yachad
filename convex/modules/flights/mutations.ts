import { mutation } from "../../_generated/server";
import { v } from "convex/values";
import { requireUser } from "../../lib/auth";

/**
 * incrementContactCount — atomically increments the contact count on a flight.
 *
 * Called when a user reveals a phone number on a flight listing.
 * Requires authentication — anonymous users cannot reveal contact info.
 *
 * The contactCount field tracks how many users have requested contact
 * details, giving agents signal on listing interest.
 */
export const incrementContactCount = mutation({
  args: {
    flightId: v.id("flights"),
  },
  handler: async (ctx, args) => {
    // Must be authenticated — anonymous users cannot reveal contact info
    await requireUser(ctx);

    const flight = await ctx.db.get(args.flightId);
    if (!flight) {
      throw new Error("Flight not found");
    }

    await ctx.db.patch(args.flightId, {
      contactCount: (flight.contactCount ?? 0) + 1,
    });
  },
});
