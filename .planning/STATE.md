---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: unknown
last_updated: "2026-03-05T10:57:45Z"
progress:
  total_phases: 3
  completed_phases: 3
  total_plans: 12
  completed_plans: 12
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-03)

**Core value:** Get stranded Israelis home safely by connecting them with extraction flights, critical local services, and each other in real time.
**Current focus:** Phase 4 — News Aggregator (COMPLETE)

## Current Position

Phase: 4 (News Aggregator) — Complete
Plan: 3 of 3 complete (04-03 done)
Status: Phase 4 fully complete. AlertBanner wired into DashboardShell, NewsClientPage replaces Coming Soon.
Last activity: 2026-03-05 — Phase 4 Plan 03 complete (AlertBanner, DashboardShell integration, NewsClientPage, news page + loading skeleton).

Progress: [██████████] 100%

## Performance Metrics

**Velocity:**
- Total plans completed: 6
- Average duration: 6 min
- Total execution time: ~0.6 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation | 6 | 36 min | 6 min |

**Recent Trend:**
- Last 6 plans: 01-01 (5 min), 01-02 (6 min), 01-03 (6 min), 01-04 (2 min), 01-05a (8 min), 01-05b (7 min)
- Trend: Stable

*Updated after each plan completion*
| Phase 01-foundation P03 | 3 | 2 tasks | 10 files |
| Phase 01-foundation P05a | 8 | 3 tasks | 20 files |
| Phase 01-foundation P05b | 7 | 2 tasks | 26 files |
| Phase 02-extraction-flights-marketplace P01 | 2 | 2 tasks | 4 files |
| Phase 02 P02 | 3 | 2 tasks | 3 files |
| Phase 02 P03 | 4 | 2 tasks | 5 files |
| Phase 04-news-aggregator P01 | 12 | 2 tasks | 8 files |
| Phase 04-news-aggregator P02 | 4 | 2 tasks | 7 files |
| Phase 04-news-aggregator P03 | 2 | 2 tasks | 5 files |

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

Plan 01-02 decisions:
- [01-02]: Agent isApproved checked in Convex DB on every requireAgent() call — Clerk publicMetadata.role alone is insufficient for wartime fraud prevention
- [01-02]: deleteFromClerk soft-deletes via isBanned: true — preserves audit trail for all associated flights, posts, and messages
- [01-02]: postLikes in separate table (not counter on posts) — avoids OCC contention on heavily-liked posts
- [01-02]: convex.config.ts required to register @convex-dev/rate-limiter as a Convex component before RateLimiter can be instantiated

Plan 01-04 decisions:
- [01-04]: Root app/layout.tsx updated to pass-through (no html/body) so locale layout can own html dir and lang attributes — official next-intl App Router pattern
- [01-04]: Toaster position adapts to locale direction: top-left for RTL (Hebrew), top-right for LTR (English)
- [01-04]: localePrefix: "always" ensures canonical /he/ and /en/ URL prefixes — no ambiguous root URLs
- [01-04]: Inter font variable moved to locale layout to stay scoped to the locale html element
- [Phase 01-03]: proxy.ts imports @/i18n/routing via src/i18n/routing.ts re-export — root i18n/routing.ts stays canonical for next.config.ts while src/ files use @/ alias
- [Phase 01-03]: intlMiddleware called before auth.protect() — ensures locale detection fires on every request including the sign-in redirect itself
- [Phase 01-03]: Clerk redirect URLs set without locale prefix — proxy.ts locale redirect prepends /{locale} so users land on /{locale}/sign-in without hardcoding locale in Clerk dashboard
- [Phase 01-05a]: createNavigation added to i18n/routing.ts so @/i18n/routing exports locale-aware Link and useRouter — plan referenced these exports but they were missing from the file
- [Phase 01-05a]: EmergencyButton uses isFAB prop to render as mobile FAB (fixed bottom-20 end-4) or top-bar icon — single component for both contexts
- [Phase 01-05a]: countries.ts shared data file in /src/shared/data/ created for CountrySelector and CountryOnboardingModal to share 30-country list
- [Phase 01-foundation]: modules.comingSoon i18n namespace added to messages — plan required all text via useTranslations() but placeholder pages needed a coming soon string not previously in the message files
- [Phase 01-foundation]: Per-module error isolation pattern established: each (dashboard)/[module]/error.tsx wraps ErrorBoundary preventing single-module failures from crashing the entire dashboard
- [Phase 02-01]: convex-helpers filter() used for listFlights to avoid undersized pagination pages when used before .paginate()
- [Phase 02-01]: by_country_departure index does not constrain status — status===available additionally filtered in TS when departureCountry provided
- [Phase 02-01]: getFlightWithAgent includes agentEmail for detail panel; list queries omit it to keep card payload minimal
- [Phase 02-02]: Relative convex import path used in src/ files (../../../../convex/_generated/) — no tsconfig alias exists for convex/ root directory
- [Phase 02-02]: Sheet side='right' kept static — SheetContent uses logical end-0/start-0 per research finding; no dynamic RTL switching needed
- [Phase 02-02]: WhatsApp message always in Hebrew — both users and agents are Israeli per CONTEXT.md
- [Phase 02-02]: Phone reveal calls incrementContactCount best-effort — still shows phone even if mutation throws
- [Phase 02-03]: native HTML select used instead of shadcn Select — no select.tsx in project; accessible and consistent with design system
- [Phase 02-03]: as unknown as FlightWithAgent cast in FlightsGrid/UrgentFlightsSection — Convex returns agentImageUrl: string | null vs optional in type; null and undefined both falsy so cast is safe
- [Phase 02-03]: preloadQuery omitted for listFlights — Convex does not support preloadQuery with pagination; usePaginatedQuery handles first page reactively
- [Phase 04-01]: listActiveSources exported as internalQuery — only called by fetchRssFeeds action, not public-facing
- [Phase 04-01]: actions.ts isolated with use node directive — Convex restriction: node-runtime files contain only actions; queries and mutations in separate V8 files
- [Phase 04-01]: upsertArticles accepts sourceId as string from Node.js action, cast to Id<newsSources> at insert time — bridges node/V8 runtime type boundary
- [Phase 04-02]: FeaturedNewsSection wraps NewsCard in ring-2 ring-amber-500/30 div to distinguish featured from regular cards without forking NewsCard
- [Phase 04-02]: NewsGrid pull-to-refresh resets seenCount to null rather than calling Convex refetch — usePaginatedQuery is already reactive
- [Phase 04-02]: NewsCard uses block anchor tag instead of onClick+window.open — allows native browser behaviors like middle-click
- [Phase 04-03]: AlertBanner sessionStorage read in useEffect only — avoids hydration mismatch since sessionStorage is not available on server
- [Phase 04-03]: AlertBanner returns null when visibleAlerts is empty — DashboardShell needs no conditional logic; zero space consumed when no active alerts
- [Phase 04-03]: NewsClientPage uses simple scrollable layout (no -m-4/-m-6 height hack) — news is a standard page, not a map-split layout
- [Phase 04-03]: news/page.tsx is a pure server component with no async — Convex handles data reactively client-side via subscriptions

### Roadmap Evolution

- Phase 01.1 inserted after Phase 01: Ultimate landing page with Google Places API and feature showcase (URGENT)

### Pending Todos

None yet.

### Blockers/Concerns

- [Phase 5]: Google Places New API (PlaceAutocompleteElement + useMapsLibrary) has limited production examples. Budget extra time. Reference vis.gl GitHub discussion #707 before starting.
- [Phase 7]: Convex presence patterns for typing indicators and online user counts need prototype before full integration. OCC avoidance in high-frequency chat requires careful schema attention.

## Session Continuity

Last session: 2026-03-05
Stopped at: Completed 04-03-PLAN.md — AlertBanner, DashboardShell wiring, NewsClientPage, news page. Phase 4 fully complete.
Resume file: None
