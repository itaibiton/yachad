import { mutation } from "../../_generated/server";
import { v } from "convex/values";
import { requireUser } from "../../lib/auth";

/**
 * createReservation — creates a new hotel reservation listing.
 *
 * Any authenticated user (not just agents) can list a reservation.
 */
export const createReservation = mutation({
  args: {
    hotelName: v.string(),
    country: v.string(),
    city: v.string(),
    checkIn: v.number(),
    checkOut: v.number(),
    roomType: v.optional(v.string()),
    numberOfRooms: v.optional(v.number()),
    numberOfGuests: v.optional(v.number()),
    originalPrice: v.number(),
    askingPrice: v.number(),
    currency: v.string(),
    cancellationPolicy: v.union(
      v.literal("full"),
      v.literal("partial"),
      v.literal("none")
    ),
    contactWhatsapp: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    description: v.optional(v.string()),
    imageStorageIds: v.optional(v.array(v.id("_storage"))),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    if (args.checkOut <= args.checkIn) {
      throw new Error("Check-out must be after check-in");
    }
    if (args.originalPrice < 0 || args.askingPrice < 0) {
      throw new Error("Prices cannot be negative");
    }
    if (args.checkIn < Date.now() - 60 * 60 * 1000) {
      throw new Error("Check-in date cannot be in the past");
    }
    if (args.imageStorageIds && args.imageStorageIds.length > 5) {
      throw new Error("Maximum 5 images allowed");
    }

    const reservationId = await ctx.db.insert("reservations", {
      sellerId: user._id,
      hotelName: args.hotelName,
      country: args.country,
      city: args.city,
      checkIn: args.checkIn,
      checkOut: args.checkOut,
      roomType: args.roomType,
      numberOfRooms: args.numberOfRooms,
      numberOfGuests: args.numberOfGuests,
      originalPrice: args.originalPrice,
      askingPrice: args.askingPrice,
      currency: args.currency,
      cancellationPolicy: args.cancellationPolicy,
      contactWhatsapp: args.contactWhatsapp,
      contactEmail: args.contactEmail,
      description: args.description,
      imageStorageIds: args.imageStorageIds,
      contactCount: 0,
    });

    return reservationId;
  },
});

/**
 * deleteReservation — soft-deletes a reservation listing. Owner-only.
 */
export const deleteReservation = mutation({
  args: {
    reservationId: v.id("reservations"),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const reservation = await ctx.db.get(args.reservationId);
    if (!reservation || reservation.isDeleted === true) {
      throw new Error("Reservation not found");
    }
    if (reservation.sellerId !== user._id) {
      throw new Error("You can only delete your own reservations");
    }

    await ctx.db.patch(args.reservationId, { isDeleted: true });
  },
});

/**
 * markAsSold — marks a reservation as sold. Owner-only.
 */
export const markAsSold = mutation({
  args: {
    reservationId: v.id("reservations"),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const reservation = await ctx.db.get(args.reservationId);
    if (!reservation || reservation.isDeleted === true) {
      throw new Error("Reservation not found");
    }
    if (reservation.sellerId !== user._id) {
      throw new Error("You can only update your own reservations");
    }

    await ctx.db.patch(args.reservationId, { isSold: true });
  },
});

/**
 * toggleSaveReservation — save or unsave a reservation for the current user.
 */
export const toggleSaveReservation = mutation({
  args: {
    reservationId: v.id("reservations"),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const existing = await ctx.db
      .query("savedReservations")
      .withIndex("by_user_reservation", (q) =>
        q.eq("userId", user._id).eq("reservationId", args.reservationId)
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { saved: false };
    }

    await ctx.db.insert("savedReservations", {
      userId: user._id,
      reservationId: args.reservationId,
    });
    return { saved: true };
  },
});

/**
 * incrementContactCount — atomically increments the contact count on a reservation.
 */
export const incrementContactCount = mutation({
  args: {
    reservationId: v.id("reservations"),
  },
  handler: async (ctx, args) => {
    await requireUser(ctx);

    const reservation = await ctx.db.get(args.reservationId);
    if (!reservation) {
      throw new Error("Reservation not found");
    }

    await ctx.db.patch(args.reservationId, {
      contactCount: (reservation.contactCount ?? 0) + 1,
    });
  },
});
