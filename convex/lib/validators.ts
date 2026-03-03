import { v } from "convex/values";

// ============================================================
// Shared type aliases
// ============================================================

export type UserRole = "user" | "agent" | "admin";

// ============================================================
// Shared Convex validators used across modules
// ============================================================

/** User role validator — use in mutation args or schema fields */
export const userRoleValidator = v.union(
  v.literal("user"),
  v.literal("agent"),
  v.literal("admin")
);

/** Pagination args compatible with usePaginatedQuery */
export const paginationArgs = {
  paginationOpts: v.object({
    numItems: v.number(),
    cursor: v.union(v.string(), v.null()),
    endCursor: v.optional(v.union(v.string(), v.null())),
    maximumRowsRead: v.optional(v.number()),
    maximumBytesRead: v.optional(v.number()),
    id: v.optional(v.number()),
  }),
};

/** Country code validator — ISO 3166-1 alpha-2 or 3 */
export const countryValidator = v.optional(v.string());

/** Currency code validator — ISO 4217 */
export const currencyValidator = v.string();

/** Unix timestamp validator */
export const timestampValidator = v.number();
