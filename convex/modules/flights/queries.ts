import { query } from "../../_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { filter } from "convex-helpers/server/filter";

/**
 * listFlights — Paginated browse query with multi-field filtering.
 *
 * Uses:
 * - by_country_departure index when departureCountry is provided
 * - by_status_departure index otherwise (constrains to "available" status)
 *
 * Post-index filtering via convex-helpers filter (NOT built-in .filter())
 * to avoid undersized pagination pages.
 *
 * Agent data is denormalized via Promise.all to avoid N+1 queries.
 */
export const listFlights = query({
  args: {
    paginationOpts: paginationOptsValidator,
    departureCountry: v.optional(v.string()),
    destination: v.optional(v.string()),
    dateFrom: v.optional(v.number()),
    dateTo: v.optional(v.number()),
    minSeats: v.optional(v.number()),
    isPackage: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let baseQuery;

    if (args.departureCountry) {
      // Use country index — does not constrain status, so we filter status in TS
      baseQuery = ctx.db
        .query("flights")
        .withIndex("by_country_departure", (q) =>
          q.eq("departureCountry", args.departureCountry!)
        );
    } else {
      // Use status index — constrain to "available" at index level
      baseQuery = ctx.db
        .query("flights")
        .withIndex("by_status_departure", (q) =>
          q.eq("status", "available")
        );
    }

    // Use convex-helpers filter (not built-in .filter()) for correct pagination
    const filtered = filter(baseQuery, (flight) => {
      // Must be approved and not deleted
      if (flight.isDeleted === true) return false;
      if (flight.approvalStatus !== "approved") return false;

      // When using country index, status is not constrained at index level
      if (args.departureCountry && flight.status !== "available") return false;

      // Optional destination filter (case-sensitive string match)
      if (
        args.destination !== undefined &&
        args.destination !== "" &&
        !flight.destination
          .toLowerCase()
          .includes(args.destination.toLowerCase())
      )
        return false;

      // Date range filters
      if (args.dateFrom !== undefined && flight.departureDate < args.dateFrom)
        return false;
      if (args.dateTo !== undefined && flight.departureDate > args.dateTo)
        return false;

      // Minimum seats filter
      if (args.minSeats !== undefined && flight.seats < args.minSeats)
        return false;

      // Package type filter
      if (args.isPackage !== undefined && (flight.isPackage ?? false) !== args.isPackage)
        return false;

      return true;
    });

    const result = await filtered.paginate(args.paginationOpts);

    // Denormalize agent data via Promise.all — avoids N+1
    const enrichedPage = await Promise.all(
      result.page.map(async (flight) => {
        const agent = await ctx.db.get(flight.agentId);
        return {
          ...flight,
          agentName: agent?.name ?? "Unknown Agent",
          agentIsVerified: agent?.isApproved === true,
          agentImageUrl: agent?.imageUrl ?? null,
        };
      })
    );

    return { ...result, page: enrichedPage };
  },
});

/**
 * listUrgentFlights — Non-paginated query for flights departing within 24 hours.
 *
 * Uses by_status_departure index with a date range to efficiently find
 * flights departing soon. Capped at 10 results for the "urgent" pinned section.
 */
export const listUrgentFlights = query({
  args: {
    departureCountry: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const in24h = now + 24 * 60 * 60 * 1000;

    let q = ctx.db
      .query("flights")
      .withIndex("by_status_departure", (q) =>
        q.eq("status", "available").gte("departureDate", now).lte("departureDate", in24h)
      )
      .filter((q) =>
        q.and(
          q.eq(q.field("approvalStatus"), "approved"),
          q.neq(q.field("isDeleted"), true)
        )
      );

    if (args.departureCountry) {
      q = q.filter((q) =>
        q.eq(q.field("departureCountry"), args.departureCountry)
      );
    }

    const flights = await q.order("asc").take(10);

    // Denormalize agent data via Promise.all — avoids N+1
    const enrichedFlights = await Promise.all(
      flights.map(async (flight) => {
        const agent = await ctx.db.get(flight.agentId);
        return {
          ...flight,
          agentName: agent?.name ?? "Unknown Agent",
          agentIsVerified: agent?.isApproved === true,
          agentImageUrl: agent?.imageUrl ?? null,
        };
      })
    );

    return enrichedFlights;
  },
});

/**
 * getFlightWithAgent — Single flight with full agent info for the detail panel.
 *
 * Returns null if the flight is not found or has been soft-deleted.
 * Includes agentEmail for the detail view (not needed on list cards).
 */
export const getFlightWithAgent = query({
  args: {
    flightId: v.id("flights"),
  },
  handler: async (ctx, args) => {
    const flight = await ctx.db.get(args.flightId);

    if (!flight || flight.isDeleted === true) {
      return null;
    }

    const agent = await ctx.db.get(flight.agentId);

    return {
      ...flight,
      agentName: agent?.name ?? "Unknown Agent",
      agentIsVerified: agent?.isApproved === true,
      agentImageUrl: agent?.imageUrl ?? null,
      agentEmail: agent?.email ?? null,
    };
  },
});
