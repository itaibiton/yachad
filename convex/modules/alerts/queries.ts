import { query } from "../../_generated/server";

/**
 * listActiveAlerts — Query for the alert banner.
 *
 * Returns up to 5 active alerts using the by_active_severity index.
 * Alerts are ordered by most recent creation time (desc) so the newest
 * urgent alerts surface first.
 *
 * No auth required — alerts are public crisis information for all users.
 */
export const listActiveAlerts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("alerts")
      .withIndex("by_active_severity", (q) => q.eq("isActive", true))
      .order("desc")
      .take(5);
  },
});
