# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-03)

**Core value:** Get stranded Israelis home safely by connecting them with extraction flights, critical local services, and each other in real time.
**Current focus:** Phase 1 — Foundation

## Current Position

Phase: 1 of 9 (Foundation)
Plan: 1 of 5 in current phase
Status: Executing — Plan 01-01 complete
Last activity: 2026-03-03 — Plan 01-01 (Foundation Scaffold) complete. Next.js 16.1.6 with RTL-safe shadcn/ui, Clerk+Convex+Theme providers.

Progress: [█░░░░░░░░░] 2%

## Performance Metrics

**Velocity:**
- Total plans completed: 1
- Average duration: 5 min
- Total execution time: 0.1 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation | 1 | 5 min | 5 min |

**Recent Trend:**
- Last 5 plans: 01-01 (5 min)
- Trend: —

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions logged in PROJECT.md Key Decisions table.
Critical research decisions affecting all phases:

- [Research]: RTL cannot be retrofitted — TailwindCSS v4 logical properties (ms-, me-, ps-, pe-) must be used exclusively from the first component in Phase 1. No physical directional utilities anywhere.
- [Research]: Three-layer auth is mandatory — Clerk middleware + page guards + Convex requireUser/requireAgent/requireAdmin. Middleware alone is bypassable (CVE-2025-29927).
- [Research]: Convex schema indexes must be defined in Phase 1 before any data is written. Cannot safely add indexes to large production tables later.
- [Research]: Agent approval status must be checked in Convex DB on every createFlight mutation, not only via Clerk publicMetadata.role — wartime fraud prevention.
- [Research]: Google Places must use new API (PlaceAutocompleteElement, AutocompleteSuggestion) — legacy Autocomplete unavailable for new API keys since March 2025.
- [Research]: All list queries must use usePaginatedQuery. Feed and chat must be country-sharded. Like counts in separate hot table to avoid OCC and subscription bandwidth explosion.

Plan 01-01 decisions:
- [01-01]: shadcn utils canonical path is @/lib/utils (not @/shared/lib/utils) — kept to avoid updating 14 component imports; re-export added at @/shared/lib/utils
- [01-01]: RTL animation direction classes (slide-in-from-left etc.) are exempt from logical CSS rule — only layout margin/padding must use logical equivalents
- [01-01]: Inter font chosen over Geist scaffold default as base font for Hebrew readability

### Pending Todos

None yet.

### Blockers/Concerns

- [Phase 5]: Google Places New API (PlaceAutocompleteElement + useMapsLibrary) has limited production examples. Budget extra time. Reference vis.gl GitHub discussion #707 before starting.
- [Phase 7]: Convex presence patterns for typing indicators and online user counts need prototype before full integration. OCC avoidance in high-frequency chat requires careful schema attention.

## Session Continuity

Last session: 2026-03-03
Stopped at: Completed 01-01-PLAN.md (Foundation Scaffold)
Resume file: None
