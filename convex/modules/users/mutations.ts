import { internalMutation, mutation } from "../../_generated/server";
import { v } from "convex/values";
import { requireUser } from "../../lib/auth";

/**
 * getOrCreateUser — auto-creates a Convex user from the JWT identity.
 *
 * Called from the client on app load. If the user already exists, returns it.
 * If not, creates a new "user" role record from the JWT claims.
 * No webhook needed — this is the simpler JWT-only sync pattern.
 */
export const getOrCreateUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (existing) return existing._id;

    const id = await ctx.db.insert("users", {
      clerkId: identity.subject,
      email: identity.email ?? "",
      name: identity.name ?? identity.email ?? "User",
      imageUrl: identity.pictureUrl,
      role: "user",
      isApproved: false,
      isBanned: false,
    });

    return id;
  },
});

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

/**
 * registerAsAgentWithFlights — atomically registers user as agent AND creates flights.
 *
 * Solves the chicken-and-egg problem: createFlight requires requireAgent()
 * but user isn't an agent during registration. This mutation does both
 * in a single transaction.
 *
 * The caller must also hit /api/register-agent to update Clerk metadata.
 */
export const registerAsAgentWithFlights = mutation({
  args: {
    phone: v.string(),
    whatsappNumber: v.string(),
    country: v.string(),
    websiteUrl: v.optional(v.string()),
    companyName: v.optional(v.string()),
    flights: v.optional(
      v.array(
        v.object({
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
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    if (user.role === "agent") {
      throw new Error("User is already an agent");
    }

    // 1. Upgrade user to agent
    await ctx.db.patch(user._id, {
      role: "agent",
      isApproved: true,
      phone: args.phone,
      whatsappNumber: args.whatsappNumber,
      country: args.country,
      websiteUrl: args.websiteUrl || undefined,
      companyName: args.companyName || undefined,
    });

    // 2. Create flights atomically
    const flights = args.flights ?? [];
    let createdCount = 0;
    for (const flight of flights) {
      if (flight.seats < 1) {
        throw new Error("Seats must be at least 1");
      }
      if (flight.pricePerSeat < 0) {
        throw new Error("Price cannot be negative");
      }
      if (flight.departureDate < Date.now() - 60 * 60 * 1000) {
        throw new Error("Departure date cannot be in the past");
      }

      await ctx.db.insert("flights", {
        agentId: user._id,
        departureCountry: flight.departureCountry,
        departureCity: flight.departureCity,
        departureAirport: flight.departureAirport,
        destination: flight.destination,
        destinationCity: flight.destinationCity,
        destinationAirport: flight.destinationAirport,
        departureDate: flight.departureDate,
        arrivalDate: flight.arrivalDate,
        seats: flight.seats,
        pricePerSeat: flight.pricePerSeat,
        currency: flight.currency,
        description: flight.description,
        whatsappNumber: flight.whatsappNumber,
        phoneNumber: flight.phoneNumber,
        checkedBagKg: flight.checkedBagKg,
        carryOnAllowed: flight.carryOnAllowed,
        personalItemAllowed: flight.personalItemAllowed,
        stops: flight.stops,
        isPackage: flight.isPackage,
        hotelIncluded: flight.hotelIncluded,
        transferIncluded: flight.transferIncluded,
        insuranceIncluded: flight.insuranceIncluded,
        status: "available",
        approvalStatus: "approved",
        contactCount: 0,
      });
      createdCount++;
    }

    return { createdCount };
  },
});

/**
 * registerAsAgent — upgrades the current user to an agent.
 *
 * Sets role to "agent", isApproved to true (auto-approved), and saves
 * agent-specific profile fields. The caller must also hit the
 * /api/register-agent Next.js route to update Clerk metadata so the
 * JWT claims reflect the new role on next session refresh.
 */
export const registerAsAgent = mutation({
  args: {
    phone: v.string(),
    whatsappNumber: v.string(),
    country: v.string(),
    websiteUrl: v.optional(v.string()),
    companyName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    if (user.role === "agent") {
      throw new Error("User is already an agent");
    }

    await ctx.db.patch(user._id, {
      role: "agent",
      isApproved: true,
      phone: args.phone,
      whatsappNumber: args.whatsappNumber,
      country: args.country,
      websiteUrl: args.websiteUrl || undefined,
      companyName: args.companyName || undefined,
    });
  },
});
