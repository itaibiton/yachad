---
phase: 01-foundation
plan: 02
subsystem: database
tags: [convex, schema, auth, rate-limiting, clerk, webhook, svix]

# Dependency graph
requires:
  - phase: 01-foundation-plan-01
    provides: Next.js project scaffold with dependencies installed

provides:
  - Convex schema with 17 tables and 33 production indexes across all 7 modules
  - Three-layer auth helpers (requireUser, requireAgent, requireAdmin)
  - DB-level agent approval check (isApproved field, not just Clerk metadata)
  - Rate limiter with 7 named limits for all write operation types
  - Clerk webhook HTTP endpoint with Svix signature verification
  - User sync mutations (upsertFromClerk, deleteFromClerk) as internalMutation
  - convex.config.ts registering the rate-limiter component

affects:
  - all future phases — every module reads/writes tables defined in schema.ts
  - 01-03 (Clerk auth setup) — uses auth helpers and webhook endpoint
  - all module phases — use requireUser/requireAgent/requireAdmin in every mutation

# Tech tracking
tech-stack:
  added:
    - "@convex-dev/rate-limiter — application-layer rate limiting"
    - "svix — Clerk webhook signature verification"
    - "convex — real-time database and backend functions"
  patterns:
    - "Schema-first: all tables and indexes defined before any data is written"
    - "Three-layer auth: requireUser -> requireAgent -> requireAdmin (each builds on previous)"
    - "Soft delete: isBanned: true instead of document removal for audit trail"
    - "Hot/cold split: postLikes in separate table to avoid OCC on post documents"
    - "Internal mutations: webhook-triggered mutations use internalMutation (not client-accessible)"
    - "DB approval gate: agent isApproved checked in Convex DB on every mutation, not via JWT"

key-files:
  created:
    - convex/schema.ts
    - convex/auth.config.ts
    - convex/convex.config.ts
    - convex/tsconfig.json
    - convex/lib/auth.ts
    - convex/lib/validators.ts
    - convex/lib/rateLimit.ts
    - convex/http.ts
    - convex/modules/users/mutations.ts
  modified: []

key-decisions:
  - "Agent isApproved checked in Convex DB on every requireAgent() call — Clerk metadata alone is insufficient for wartime fraud prevention"
  - "Soft delete via isBanned: true for user.deleted webhook — preserves audit trail for all associated content"
  - "postLikes in separate table (not counter on posts) — avoids OCC contention on heavily-liked posts"
  - "chatMessages indexed by [roomId, _creationTime] — enables country-sharded paginated queries"
  - "convex.config.ts required to register @convex-dev/rate-limiter as a Convex component"
  - "deleteFromClerk silently no-ops if user not found — webhook delivery order is not guaranteed"

patterns-established:
  - "Auth pattern: always call requireUser first, then requireAgent/requireAdmin builds on top"
  - "Rate limit pattern: await rateLimiter.limit(ctx, 'operationName', { key: userId })"
  - "Index naming: by_[field] for single-field, by_[field1]_[field2] for compound indexes"
  - "Schema union: v.union(v.literal('a'), v.literal('b')) for all enum-style fields"

requirements-completed: [FOUN-02, FOUN-04, FOUN-11]

# Metrics
duration: 6min
completed: 2026-03-03
---

# Phase 1 Plan 02: Convex Backend Foundation Summary

**Convex schema with 17 tables and 33 production indexes, three-layer DB auth helpers (requireUser/requireAgent/requireAdmin with DB-level isApproved check), rate limiter with 7 named limits, and Clerk webhook sync via Svix signature verification**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-03T15:25:57Z
- **Completed:** 2026-03-03T15:31:30Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments

- Defined complete Convex schema covering all 7 modules with 17 tables and 33 production indexes — indexes established before any data is written
- Created three-layer auth helpers where requireAgent explicitly checks `isApproved` in the Convex DB (not just Clerk JWT claims) — critical wartime fraud prevention
- Configured rate limiter with 7 named limits (createPost, sendMessage, createFlight, createReservation, reportContent, editListing, createComment) using @convex-dev/rate-limiter component
- Implemented Clerk webhook HTTP endpoint with Svix signature verification that syncs user lifecycle events to Convex using internalMutation

## Task Commits

Each task was committed atomically:

1. **Task 1: Define Convex schema for all 7 modules with production indexes** - `d3401e3` (feat)
2. **Task 2: Create auth helpers, rate limiter, and Clerk webhook sync** - `d58ef36` (feat)

## Files Created/Modified

- `convex/schema.ts` - 17-table Convex schema with 33 indexes covering all 7 modules (users, flights, services, newsArticles, newsSources, alerts, posts, postLikes, postComments, chatRooms, chatMessages, chatReactions, chatPresence, reservations, reports, auditLog)
- `convex/auth.config.ts` - Clerk JWT issuer config with applicationID: "convex"
- `convex/convex.config.ts` - Registers @convex-dev/rate-limiter as a Convex component
- `convex/tsconfig.json` - TypeScript config for Convex backend with Bundler moduleResolution
- `convex/lib/auth.ts` - requireUser, requireAgent, requireAdmin helpers with DB-level approval check
- `convex/lib/validators.ts` - Shared validators: UserRole type, paginationArgs, common field validators
- `convex/lib/rateLimit.ts` - RateLimiter instance with 7 named limits for all write operation types
- `convex/http.ts` - HTTP router with Clerk webhook endpoint, Svix signature verification, user sync routing
- `convex/modules/users/mutations.ts` - upsertFromClerk and deleteFromClerk as internalMutation

## Decisions Made

- Agent approval is checked in the Convex DB (`isApproved === true`) on every `requireAgent()` call — Clerk publicMetadata.role alone is insufficient because metadata can be stale or tampered with in wartime fraud scenarios
- `deleteFromClerk` soft-deletes via `isBanned: true` rather than removing the document — preserves the audit trail for all associated flights, posts, and messages
- `postLikes` is a separate table with its own indexes rather than a counter on the `posts` document — avoids OCC contention on heavily-liked posts
- `convex.config.ts` is required to register @convex-dev/rate-limiter as a Convex component before the RateLimiter class can be instantiated

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- `npx convex init` is deprecated — the replacement `npx convex dev --once --configure=new` requires interactive terminal input. Created all Convex files manually without needing to run `convex dev` during this plan. The `_generated/` folder will be created by `npx convex dev` during setup (handled in plan 01-03).
- Used `DataModelFromSchemaDefinition` type utility from `convex/server` in auth.ts instead of importing from `_generated/server` (which doesn't exist yet) — the types will be equivalent once Convex is initialized.

## Next Phase Readiness

- All 7 module tables are defined with production indexes — ready for data operations in all module phases
- Auth helpers ready for use in all future mutations — import from `convex/lib/auth`
- Rate limiter ready for use — import `rateLimiter` from `convex/lib/rateLimit`
- Clerk webhook endpoint is defined — needs CLERK_WEBHOOK_SECRET env var and Clerk dashboard webhook registration (plan 01-03)
- `npx convex dev` must be run once with valid Clerk credentials to generate the `_generated/` folder and validate the schema compiles

---
## Self-Check: PASSED

All created files verified present on disk. Both task commits verified in git log.

- FOUND: convex/schema.ts
- FOUND: convex/auth.config.ts
- FOUND: convex/convex.config.ts
- FOUND: convex/tsconfig.json
- FOUND: convex/lib/auth.ts
- FOUND: convex/lib/validators.ts
- FOUND: convex/lib/rateLimit.ts
- FOUND: convex/http.ts
- FOUND: convex/modules/users/mutations.ts
- FOUND commit: d3401e3 (Task 1)
- FOUND commit: d58ef36 (Task 2)

*Phase: 01-foundation*
*Completed: 2026-03-03*
