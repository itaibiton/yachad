# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-03)

**Core value:** Get stranded Israelis home safely by connecting them with extraction flights, critical local services, and each other in real time.
**Current focus:** Phase 1 — Foundation

## Current Position

Phase: 1 of 9 (Foundation)
Plan: 0 of 5 in current phase
Status: Planned — ready to execute
Last activity: 2026-03-03 — Phase 1 plans created. 5 plans across 3 waves. All 13 FOUN requirements covered.

Progress: [░░░░░░░░░░] 0%

## Performance Metrics

**Velocity:**
- Total plans completed: 0
- Average duration: —
- Total execution time: 0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**
- Last 5 plans: none yet
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

### Pending Todos

None yet.

### Blockers/Concerns

- [Phase 5]: Google Places New API (PlaceAutocompleteElement + useMapsLibrary) has limited production examples. Budget extra time. Reference vis.gl GitHub discussion #707 before starting.
- [Phase 7]: Convex presence patterns for typing indicators and online user counts need prototype before full integration. OCC avoidance in high-frequency chat requires careful schema attention.

## Session Continuity

Last session: 2026-03-03
Stopped at: Phase 1 plans created (5 plans, 3 waves). Ready for /gsd:execute-phase.
Resume file: None
