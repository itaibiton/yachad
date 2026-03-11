import { query } from "../../_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { filter } from "convex-helpers/server/filter";
import { requireUser } from "../../lib/auth";

/**
 * listReservations — Paginated browse query with multi-field filtering.
 *
 * Uses by_country_checkin index when country is provided,
 * by_checkin index otherwise. Post-index filtering via convex-helpers filter.
 */
export const listReservations = query({
  args: {
    paginationOpts: paginationOptsValidator,
    country: v.optional(v.string()),
    checkInFrom: v.optional(v.number()),
    checkInTo: v.optional(v.number()),
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

    if (args.country) {
      if (sort === "newest") {
        baseQuery = ctx.db
          .query("reservations")
          .withIndex("by_country_checkin", (q) =>
            q.eq("country", args.country!)
          )
          .order("desc");
      } else {
        // soonest, price_asc, price_desc all start from country+checkin
        baseQuery = ctx.db
          .query("reservations")
          .withIndex("by_country_checkin", (q) =>
            q.eq("country", args.country!)
          )
          .order(sort === "price_desc" ? "desc" : "asc");
      }
    } else {
      if (sort === "newest") {
        baseQuery = ctx.db
          .query("reservations")
          .withIndex("by_checkin")
          .order("desc");
      } else {
        baseQuery = ctx.db
          .query("reservations")
          .withIndex("by_checkin")
          .order(sort === "price_desc" ? "desc" : "asc");
      }
    }

    const filtered = filter(baseQuery, (reservation) => {
      if (reservation.isDeleted === true) return false;
      if (reservation.isSold === true) return false;

      if (
        args.checkInFrom !== undefined &&
        reservation.checkIn < args.checkInFrom
      )
        return false;
      if (args.checkInTo !== undefined && reservation.checkIn > args.checkInTo)
        return false;

      return true;
    });

    const result = await filtered.paginate(args.paginationOpts);

    // Denormalize seller data + resolve image URLs
    const enrichedPage = await Promise.all(
      result.page.map(async (reservation) => {
        const seller = await ctx.db.get(reservation.sellerId);

        // Resolve first image URL for card display (storage or external fallback)
        let imageUrl: string | null = null;
        if (
          reservation.imageStorageIds &&
          reservation.imageStorageIds.length > 0
        ) {
          imageUrl = await ctx.storage.getUrl(reservation.imageStorageIds[0]);
        } else if (reservation.imageUrl) {
          imageUrl = reservation.imageUrl;
        }

        return {
          ...reservation,
          sellerName: seller?.name ?? "Unknown",
          sellerIsVerified: seller?.isApproved === true,
          sellerImageUrl: seller?.imageUrl ?? null,
          imageUrl,
        };
      })
    );

    // Client-side sort for price when index doesn't natively support it
    if (sort === "price_asc") {
      enrichedPage.sort((a, b) => a.askingPrice - b.askingPrice);
    } else if (sort === "price_desc") {
      enrichedPage.sort((a, b) => b.askingPrice - a.askingPrice);
    }

    return { ...result, page: enrichedPage };
  },
});

/**
 * getReservationWithSeller — Single reservation with full seller info + all image URLs.
 */
export const getReservationWithSeller = query({
  args: {
    reservationId: v.id("reservations"),
  },
  handler: async (ctx, args) => {
    const reservation = await ctx.db.get(args.reservationId);

    if (!reservation || reservation.isDeleted === true) {
      return null;
    }

    const seller = await ctx.db.get(reservation.sellerId);

    // Resolve all image URLs (storage or external fallback)
    const imageUrls: string[] = [];
    if (reservation.imageStorageIds && reservation.imageStorageIds.length > 0) {
      for (const storageId of reservation.imageStorageIds) {
        const url = await ctx.storage.getUrl(storageId);
        if (url) imageUrls.push(url);
      }
    } else if (reservation.imageUrl) {
      imageUrls.push(reservation.imageUrl);
    }

    return {
      ...reservation,
      sellerName: seller?.name ?? "Unknown",
      sellerIsVerified: seller?.isApproved === true,
      sellerImageUrl: seller?.imageUrl ?? null,
      sellerEmail: seller?.email ?? null,
      imageUrls,
    };
  },
});

/**
 * listSavedReservationIds — returns saved reservation IDs for the current user.
 * Returns null if unauthenticated (allows anonymous browsing).
 */
export const listSavedReservationIds = query({
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
      .query("savedReservations")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return saved.map((s) => s.reservationId);
  },
});

/**
 * listUserReservations — returns the current user's own reservation listings.
 */
export const listUserReservations = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);

    const reservations = await ctx.db
      .query("reservations")
      .withIndex("by_seller", (q) => q.eq("sellerId", user._id))
      .order("desc")
      .filter((q) => q.neq(q.field("isDeleted"), true))
      .collect();

    return reservations;
  },
});
