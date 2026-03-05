import { mutation } from "../../_generated/server";
import { v } from "convex/values";
import { requireUser, requireAgent } from "../../lib/auth";

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

/**
 * createFlight — creates a new flight listing.
 *
 * Requires the caller to be an approved agent. Sets the agentId from
 * the authenticated user, status to "available", and approvalStatus
 * to "approved" (auto-published).
 */
export const createFlight = mutation({
  args: {
    departureCountry: v.string(),
    departureCity: v.optional(v.string()),
    departureAirport: v.optional(v.string()),
    destination: v.string(),
    destinationCity: v.optional(v.string()),
    destinationAirport: v.optional(v.string()),
    departureDate: v.number(),
    arrivalDate: v.optional(v.number()),
    seats: v.number(),
    pricePerSeat: v.number(),
    currency: v.string(),
    description: v.optional(v.string()),
    whatsappNumber: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    checkedBagKg: v.optional(v.number()),
    carryOnAllowed: v.optional(v.boolean()),
    personalItemAllowed: v.optional(v.boolean()),
    luggage: v.optional(
      v.array(
        v.object({
          type: v.string(),
          weightKg: v.optional(v.number()),
        })
      )
    ),
    stops: v.optional(
      v.array(
        v.object({
          country: v.string(),
          city: v.optional(v.string()),
          durationMinutes: v.optional(v.number()),
        })
      )
    ),
    isPackage: v.optional(v.boolean()),
    hotelIncluded: v.optional(v.string()),
    transferIncluded: v.optional(v.string()),
    insuranceIncluded: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const agent = await requireAgent(ctx);

    if (args.seats < 1) {
      throw new Error("Seats must be at least 1");
    }
    if (args.pricePerSeat < 0) {
      throw new Error("Price cannot be negative");
    }
    if (args.departureDate < Date.now() - 60 * 60 * 1000) {
      throw new Error("Departure date cannot be in the past");
    }
    if (args.arrivalDate && args.arrivalDate < args.departureDate) {
      throw new Error("Arrival date cannot be before departure date");
    }

    const flightId = await ctx.db.insert("flights", {
      agentId: agent._id,
      departureCountry: args.departureCountry,
      departureCity: args.departureCity,
      departureAirport: args.departureAirport,
      destination: args.destination,
      destinationCity: args.destinationCity,
      destinationAirport: args.destinationAirport,
      departureDate: args.departureDate,
      arrivalDate: args.arrivalDate,
      seats: args.seats,
      pricePerSeat: args.pricePerSeat,
      currency: args.currency,
      description: args.description,
      whatsappNumber: args.whatsappNumber,
      phoneNumber: args.phoneNumber,
      checkedBagKg: args.checkedBagKg,
      carryOnAllowed: args.carryOnAllowed,
      personalItemAllowed: args.personalItemAllowed,
      luggage: args.luggage,
      stops: args.stops,
      isPackage: args.isPackage,
      hotelIncluded: args.hotelIncluded,
      transferIncluded: args.transferIncluded,
      insuranceIncluded: args.insuranceIncluded,
      status: "available",
      approvalStatus: "approved",
      contactCount: 0,
    });

    return flightId;
  },
});

/**
 * updateFlight — updates an existing flight listing.
 *
 * Requires the caller to be the owning agent. Only provided fields are patched.
 * Same validations as createFlight for seats/price.
 */
export const updateFlight = mutation({
  args: {
    flightId: v.id("flights"),
    departureCountry: v.optional(v.string()),
    departureCity: v.optional(v.string()),
    departureAirport: v.optional(v.string()),
    destination: v.optional(v.string()),
    destinationCity: v.optional(v.string()),
    destinationAirport: v.optional(v.string()),
    departureDate: v.optional(v.number()),
    arrivalDate: v.optional(v.number()),
    seats: v.optional(v.number()),
    pricePerSeat: v.optional(v.number()),
    currency: v.optional(v.string()),
    description: v.optional(v.string()),
    whatsappNumber: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    checkedBagKg: v.optional(v.number()),
    carryOnAllowed: v.optional(v.boolean()),
    personalItemAllowed: v.optional(v.boolean()),
    luggage: v.optional(
      v.array(
        v.object({
          type: v.string(),
          weightKg: v.optional(v.number()),
        })
      )
    ),
    stops: v.optional(
      v.array(
        v.object({
          country: v.string(),
          city: v.optional(v.string()),
          durationMinutes: v.optional(v.number()),
        })
      )
    ),
    isPackage: v.optional(v.boolean()),
    hotelIncluded: v.optional(v.string()),
    transferIncluded: v.optional(v.string()),
    insuranceIncluded: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const agent = await requireAgent(ctx);

    const flight = await ctx.db.get(args.flightId);
    if (!flight || flight.isDeleted === true) {
      throw new Error("Flight not found");
    }
    if (flight.agentId !== agent._id) {
      throw new Error("You can only edit your own flights");
    }

    if (args.seats !== undefined && args.seats < 1) {
      throw new Error("Seats must be at least 1");
    }
    if (args.pricePerSeat !== undefined && args.pricePerSeat < 0) {
      throw new Error("Price cannot be negative");
    }

    const { flightId: _, ...updates } = args;
    // Remove undefined values so patch only touches provided fields
    const cleanUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        cleanUpdates[key] = value;
      }
    }

    if (Object.keys(cleanUpdates).length > 0) {
      await ctx.db.patch(args.flightId, cleanUpdates);
    }
  },
});

/**
 * deleteFlight — soft-deletes a flight listing.
 *
 * Sets isDeleted: true. Requires the caller to be the owning agent.
 */
export const deleteFlight = mutation({
  args: {
    flightId: v.id("flights"),
  },
  handler: async (ctx, args) => {
    const agent = await requireAgent(ctx);

    const flight = await ctx.db.get(args.flightId);
    if (!flight || flight.isDeleted === true) {
      throw new Error("Flight not found");
    }
    if (flight.agentId !== agent._id) {
      throw new Error("You can only delete your own flights");
    }

    await ctx.db.patch(args.flightId, { isDeleted: true });
  },
});

/**
 * updateFlightStatus — changes the status of a flight.
 *
 * Requires the caller to be the owning agent.
 */
export const updateFlightStatus = mutation({
  args: {
    flightId: v.id("flights"),
    status: v.union(
      v.literal("available"),
      v.literal("full"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    const agent = await requireAgent(ctx);

    const flight = await ctx.db.get(args.flightId);
    if (!flight || flight.isDeleted === true) {
      throw new Error("Flight not found");
    }
    if (flight.agentId !== agent._id) {
      throw new Error("You can only update your own flights");
    }

    await ctx.db.patch(args.flightId, { status: args.status });
  },
});

/**
 * toggleSaveFlight — save or unsave a flight for the authenticated user.
 *
 * If the flight is already saved, removes it. Otherwise, saves it.
 * Returns { saved: boolean } indicating the new state.
 */
export const toggleSaveFlight = mutation({
  args: {
    flightId: v.id("flights"),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const existing = await ctx.db
      .query("savedFlights")
      .withIndex("by_user_flight", (q) =>
        q.eq("userId", user._id).eq("flightId", args.flightId)
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { saved: false };
    }

    await ctx.db.insert("savedFlights", {
      userId: user._id,
      flightId: args.flightId,
    });
    return { saved: true };
  },
});
