import { RateLimiter, MINUTE, HOUR } from "@convex-dev/rate-limiter";
import { components } from "../_generated/api";

/**
 * Application-level rate limiter using @convex-dev/rate-limiter component.
 *
 * Usage pattern:
 *   await rateLimiter.limit(ctx, "createPost", { key: userId });
 *   // Throws ConvexError if rate limit is exceeded
 *
 * All named limits here must match the write mutation types in the application.
 */
export const rateLimiter = new RateLimiter(components.rateLimiter, {
  // Community Feed — prevent spam posting
  createPost: {
    kind: "token bucket",
    rate: 10,
    period: MINUTE,
    capacity: 20,
  },

  // Chat — allow burst but throttle sustained spam
  sendMessage: {
    kind: "token bucket",
    rate: 30,
    period: MINUTE,
    capacity: 60,
  },

  // Flight listings — agents can create a few per hour
  createFlight: {
    kind: "token bucket",
    rate: 5,
    period: HOUR,
  },

  // Hotel reservations — sellers can list several per hour
  createReservation: {
    kind: "token bucket",
    rate: 10,
    period: HOUR,
  },

  // Content reporting — prevent abuse of the report system
  reportContent: {
    kind: "fixed window",
    rate: 5,
    period: HOUR,
  },

  // Editing flight or reservation listings
  editListing: {
    kind: "token bucket",
    rate: 20,
    period: HOUR,
  },

  // Post comments — moderate burst allowed
  createComment: {
    kind: "token bucket",
    rate: 20,
    period: MINUTE,
    capacity: 40,
  },
});
