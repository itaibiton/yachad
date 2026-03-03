---
phase: 02-extraction-flights-marketplace
plan: "01"
subsystem: convex-backend
tags: [convex, queries, mutations, i18n, flights, pagination]
dependency_graph:
  requires: [convex/schema.ts, convex/lib/auth.ts, convex-helpers]
  provides: [convex/modules/flights/queries.ts, convex/modules/flights/mutations.ts, messages/he.json#flights, messages/en.json#flights]
  affects: [02-02-PLAN.md, 02-03-PLAN.md]
tech_stack:
  added: [convex-helpers/server/filter]
  patterns: [paginated-query, agent-denormalization, Promise.all-join, auth-gated-mutation, i18n-namespace]
key_files:
  created:
    - convex/modules/flights/queries.ts
    - convex/modules/flights/mutations.ts
  modified:
    - messages/he.json
    - messages/en.json
decisions:
  - "convex-helpers filter() used for listFlights instead of built-in .filter() — built-in produces undersized pages when used before .paginate()"
  - "by_country_departure index does not constrain status so status===available is also checked in TS filter when departureCountry is provided"
  - "listUrgentFlights uses built-in .filter() (not convex-helpers) because it calls .take() not .paginate() — no pagination undersizing issue"
  - "getFlightWithAgent includes agentEmail for detail panel; list queries omit it to keep card payload minimal"
metrics:
  duration: "2 min"
  completed_date: "2026-03-03"
  tasks_completed: 2
  tasks_total: 2
  files_created: 2
  files_modified: 2
  commits: 2
---

# Phase 02 Plan 01: Extraction Flights Backend Queries, Mutations and i18n

**One-liner:** Convex data layer for extraction flights — paginated listFlights (convex-helpers filter), listUrgentFlights (24h window), getFlightWithAgent (detail), incrementContactCount (auth-gated), plus 47-key i18n namespaces in Hebrew and English.

## What Was Built

Three Convex query functions and one mutation for the extraction flights marketplace data layer:

- **`listFlights`** (`convex/modules/flights/queries.ts`): Paginated browse query using `by_country_departure` or `by_status_departure` index depending on filter args. Post-index filtering via `convex-helpers/server/filter` to avoid undersized pages. Supports: departureCountry, destination (substring match), dateFrom, dateTo, minSeats, isPackage. Agent data (name, isVerified, imageUrl) denormalized onto each page item via `Promise.all`.

- **`listUrgentFlights`** (`convex/modules/flights/queries.ts`): Non-paginated query for flights departing within 24 hours. Uses `by_status_departure` index with `.gte("departureDate", now).lte("departureDate", in24h)` range. Capped at 10 results. Optional `departureCountry` filter via chained `.filter()`. Agent data denormalized.

- **`getFlightWithAgent`** (`convex/modules/flights/queries.ts`): Single flight lookup for the detail panel. Returns null if not found or soft-deleted. Includes `agentEmail` in addition to name/isVerified/imageUrl (not on list queries to keep card payload lean).

- **`incrementContactCount`** (`convex/modules/flights/mutations.ts`): Auth-gated mutation. Calls `requireUser(ctx)` before patching. Atomically increments `contactCount` (handling null field with `?? 0`).

- **i18n** (`messages/he.json`, `messages/en.json`): Added `flights` namespace with 47 matching keys covering filter labels, sort options, seat counts, status badges, urgent/package badges, contact buttons, detail panel sections, and empty states. Hebrew and English key sets are identical (verified programmatically).

## Verification Results

- `npx convex typecheck` passes with exit code 0
- Both message files parse as valid JSON with 47 keys each in the `flights` namespace
- No key mismatch between `he.json` and `en.json`
- `filter` from `convex-helpers/server/filter` is used before `.paginate()` in `listFlights`
- `requireUser(ctx)` called before patch in `incrementContactCount`
- Agent joins use `Promise.all` in both list queries (no N+1)

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| Task 1 | 63674ea | feat(02-01): create Convex flight queries — listFlights, listUrgentFlights, getFlightWithAgent |
| Task 2 | f981fa1 | feat(02-01): add incrementContactCount mutation and flights i18n messages |

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- convex/modules/flights/queries.ts — FOUND
- convex/modules/flights/mutations.ts — FOUND
- messages/he.json (flights namespace) — FOUND (47 keys)
- messages/en.json (flights namespace) — FOUND (47 keys)
- Commit 63674ea — FOUND
- Commit f981fa1 — FOUND
