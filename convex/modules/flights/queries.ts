import { query } from "../../_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { filter } from "convex-helpers/server/filter";
import { requireAgent, requireUser } from "../../lib/auth";

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
    sort: v.optional(
      v.union(
        v.literal("soonest"),
        v.literal("newest"),
        v.literal("price_asc"),
        v.literal("price_desc")
      )
    ),
  },
  handler: async (ctx, args) => {
    const sort = args.sort ?? "soonest";
    let baseQuery;

    if (args.departureCountry) {
      // Country-scoped: pick index by sort
      if (sort === "newest") {
        baseQuery = ctx.db
          .query("flights")
          .withIndex("by_country_creation", (q) =>
            q.eq("departureCountry", args.departureCountry!)
          )
          .order("desc");
      } else if (sort === "price_asc") {
        baseQuery = ctx.db
          .query("flights")
          .withIndex("by_country_price", (q) =>
            q.eq("departureCountry", args.departureCountry!)
          )
          .order("asc");
      } else if (sort === "price_desc") {
        baseQuery = ctx.db
          .query("flights")
          .withIndex("by_country_price", (q) =>
            q.eq("departureCountry", args.departureCountry!)
          )
          .order("desc");
      } else {
        // soonest (default)
        baseQuery = ctx.db
          .query("flights")
          .withIndex("by_country_departure", (q) =>
            q.eq("departureCountry", args.departureCountry!)
          )
          .order("asc");
      }
    } else {
      // No country: status-scoped indexes
      if (sort === "newest") {
        baseQuery = ctx.db
          .query("flights")
          .withIndex("by_status_creation", (q) =>
            q.eq("status", "available")
          )
          .order("desc");
      } else if (sort === "price_asc") {
        baseQuery = ctx.db
          .query("flights")
          .withIndex("by_status_price", (q) =>
            q.eq("status", "available")
          )
          .order("asc");
      } else if (sort === "price_desc") {
        baseQuery = ctx.db
          .query("flights")
          .withIndex("by_status_price", (q) =>
            q.eq("status", "available")
          )
          .order("desc");
      } else {
        // soonest (default)
        baseQuery = ctx.db
          .query("flights")
          .withIndex("by_status_departure", (q) =>
            q.eq("status", "available")
          )
          .order("asc");
      }
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
          whatsappNumber: agent?.whatsappNumber || flight.whatsappNumber,
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
          whatsappNumber: agent?.whatsappNumber || flight.whatsappNumber,
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
 * listFlightDestinations — Lightweight query returning unique destination tuples.
 *
 * Used by the map sidebar to draw route lines from the departure country
 * to every available destination. Returns deduped {destination, destinationAirport,
 * destinationCity} tuples. Flight count is low enough for .collect() + dedup.
 */
export const listFlightDestinations = query({
  args: {
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
      baseQuery = ctx.db
        .query("flights")
        .withIndex("by_country_departure", (q) =>
          q.eq("departureCountry", args.departureCountry!)
        );
    } else {
      baseQuery = ctx.db
        .query("flights")
        .withIndex("by_status_departure", (q) =>
          q.eq("status", "available")
        );
    }

    const filtered = filter(baseQuery, (flight) => {
      if (flight.isDeleted === true) return false;
      if (flight.approvalStatus !== "approved") return false;
      if (args.departureCountry && flight.status !== "available") return false;
      if (
        args.destination !== undefined &&
        args.destination !== "" &&
        !flight.destination
          .toLowerCase()
          .includes(args.destination.toLowerCase())
      )
        return false;
      if (args.dateFrom !== undefined && flight.departureDate < args.dateFrom)
        return false;
      if (args.dateTo !== undefined && flight.departureDate > args.dateTo)
        return false;
      if (args.minSeats !== undefined && flight.seats < args.minSeats)
        return false;
      if (args.isPackage !== undefined && (flight.isPackage ?? false) !== args.isPackage)
        return false;
      return true;
    });

    const flights = await filtered.collect();

    // Dedup by destination country code
    const seen = new Set<string>();
    const destinations: {
      destination: string;
      destinationAirport?: string;
      destinationCity?: string;
    }[] = [];

    for (const f of flights) {
      if (!seen.has(f.destination)) {
        seen.add(f.destination);
        destinations.push({
          destination: f.destination,
          destinationAirport: f.destinationAirport,
          destinationCity: f.destinationCity,
        });
      }
    }

    return destinations;
  },
});

/**
 * listFlightRoutes — Returns unique departure→destination route pairs.
 *
 * Used by the map sidebar when no specific departure country is selected ("All").
 * Returns deduped {departureCountry, destination, airports} tuples so the map
 * can draw route lines for all available flights.
 */
export const listFlightRoutes = query({
  args: {
    destination: v.optional(v.string()),
    dateFrom: v.optional(v.number()),
    dateTo: v.optional(v.number()),
    minSeats: v.optional(v.number()),
    isPackage: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const baseQuery = ctx.db
      .query("flights")
      .withIndex("by_status_departure", (q) =>
        q.eq("status", "available")
      );

    const filtered = filter(baseQuery, (flight) => {
      if (flight.isDeleted === true) return false;
      if (flight.approvalStatus !== "approved") return false;
      if (
        args.destination !== undefined &&
        args.destination !== "" &&
        !flight.destination
          .toLowerCase()
          .includes(args.destination.toLowerCase())
      )
        return false;
      if (args.dateFrom !== undefined && flight.departureDate < args.dateFrom)
        return false;
      if (args.dateTo !== undefined && flight.departureDate > args.dateTo)
        return false;
      if (args.minSeats !== undefined && flight.seats < args.minSeats)
        return false;
      if (args.isPackage !== undefined && (flight.isPackage ?? false) !== args.isPackage)
        return false;
      return true;
    });

    const flights = await filtered.collect();

    // Dedup by departure+destination pair
    const seen = new Set<string>();
    const routes: {
      departureCountry: string;
      departureAirport?: string;
      destination: string;
      destinationAirport?: string;
    }[] = [];

    for (const f of flights) {
      const key = `${f.departureCountry}→${f.destination}`;
      if (!seen.has(key)) {
        seen.add(key);
        routes.push({
          departureCountry: f.departureCountry,
          departureAirport: f.departureAirport,
          destination: f.destination,
          destinationAirport: f.destinationAirport,
        });
      }
    }

    return routes;
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
      whatsappNumber: agent?.whatsappNumber || flight.whatsappNumber,
      agentName: agent?.name ?? "Unknown Agent",
      agentIsVerified: agent?.isApproved === true,
      agentImageUrl: agent?.imageUrl ?? null,
      agentEmail: agent?.email ?? null,
    };
  },
});

/**
 * listAgentFlights — returns the current agent's own flights.
 *
 * Uses the by_agent index for efficient lookup. Returns all flights
 * (including non-available) so agents can see their full listing history.
 * Sorted by creation time (desc) so newest appear first.
 */
export const listAgentFlights = query({
  args: {},
  handler: async (ctx, _args) => {
    const agent = await requireAgent(ctx);

    const flights = await ctx.db
      .query("flights")
      .withIndex("by_agent", (q) => q.eq("agentId", agent._id))
      .order("desc")
      .filter((q) => q.neq(q.field("isDeleted"), true))
      .collect();

    return flights;
  },
});

/**
 * getAgentFlightStats — returns aggregate stats for the current agent's flights.
 *
 * Uses the by_agent index. Returns counts, totals, and the most common currency.
 */
export const getAgentFlightStats = query({
  args: {},
  handler: async (ctx, _args) => {
    const agent = await requireAgent(ctx);

    const flights = await ctx.db
      .query("flights")
      .withIndex("by_agent", (q) => q.eq("agentId", agent._id))
      .filter((q) => q.neq(q.field("isDeleted"), true))
      .collect();

    const activeFlights = flights.filter((f) => f.status === "available");

    const totalSeats = activeFlights.reduce((sum, f) => sum + f.seats, 0);
    const totalContacts = flights.reduce(
      (sum, f) => sum + (f.contactCount ?? 0),
      0
    );

    // Average price of active flights
    const avgPrice =
      activeFlights.length > 0
        ? Math.round(
            activeFlights.reduce((sum, f) => sum + f.pricePerSeat, 0) /
              activeFlights.length
          )
        : 0;

    // Most common currency among active flights
    const currencyCounts: Record<string, number> = {};
    for (const f of activeFlights) {
      currencyCounts[f.currency] = (currencyCounts[f.currency] ?? 0) + 1;
    }
    const primaryCurrency =
      Object.entries(currencyCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ??
      "USD";

    return {
      totalFlights: flights.length,
      activeFlights: activeFlights.length,
      totalSeats,
      totalContacts,
      avgPrice,
      primaryCurrency,
    };
  },
});

/**
 * listSavedFlightIds — returns the set of flight IDs saved by the current user.
 *
 * Returns an array of flight ID strings for efficient client-side lookups.
 * Returns null if the user is not authenticated (allows unauthenticated browsing).
 */
export const listSavedFlightIds = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return null;

    const saved = await ctx.db
      .query("savedFlights")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return saved.map((s) => s.flightId);
  },
});
