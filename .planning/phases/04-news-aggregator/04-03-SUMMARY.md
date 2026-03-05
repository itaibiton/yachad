---
phase: 04-news-aggregator
plan: "03"
subsystem: ui
tags: [react, convex, next-intl, date-fns, rtl, alerts, news, session-storage]

# Dependency graph
requires:
  - phase: 04-news-aggregator
    provides: "convex/modules/alerts/queries.ts — listActiveAlerts public query"
  - phase: 04-news-aggregator
    provides: "news UI components — NewsGrid, FeaturedNewsSection, NewsFilterBar, useNewsFilters"

provides:
  - "AlertBanner — cross-page urgent/info alert banner with real-time Convex subscription and sessionStorage dismiss"
  - "DashboardShell updated — AlertBanner wired between TopBar and main on ALL dashboard pages"
  - "NewsClientPage — news page orchestrator composing filter bar, featured section, and infinite scroll grid"
  - "news/page.tsx — server component replacing Coming Soon placeholder with NewsClientPage"
  - "news/loading.tsx — updated skeleton representing news card shapes"

affects: [09-admin-panel, future-alert-management]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "AlertBanner null-render pattern: renders null when no visible alerts — zero empty space when no active alerts"
    - "SessionStorage dismiss: useEffect-only sessionStorage read avoids SSR hydration mismatch"
    - "News page orchestrator: NewsClientPage follows FlightsClientPage pattern without map sidebar or full-height hack"
    - "Last-updated indicator: useState + 60s setInterval updated on mount, date-fns formatDistanceToNow with Hebrew locale"

key-files:
  created:
    - src/shared/components/AlertBanner.tsx
    - src/shared/components/news/NewsClientPage.tsx
  modified:
    - src/shared/components/DashboardShell.tsx
    - src/app/[locale]/(dashboard)/news/page.tsx
    - src/app/[locale]/(dashboard)/news/loading.tsx

key-decisions:
  - "AlertBanner sessionStorage read in useEffect only — avoids hydration mismatch since sessionStorage is not available on server"
  - "AlertBanner self-manages visibility (returns null) — no DashboardShell logic needed to show/hide the banner"
  - "NewsClientPage uses simple scrollable layout (no -m-4/-m-6 height hack) — news is a standard page, not a map-split layout"
  - "news/page.tsx is a pure server component with no async — Convex handles data reactively client-side via subscriptions"

patterns-established:
  - "Cross-page banner pattern: 'use client' component with Convex subscription renders null when empty, otherwise stacks vertically"
  - "News page orchestrator delegates all state and data to child components — page.tsx stays minimal"

requirements-completed: [NEWS-01, NEWS-03, NEWS-05, NEWS-07]

# Metrics
duration: 2min
completed: 2026-03-05
---

# Phase 4 Plan 03: News Page Wiring and Alert Banner Summary

**AlertBanner with sessionStorage dismiss wired into DashboardShell for all pages, plus NewsClientPage composing the full news feed replacing the Coming Soon placeholder**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-03-05T10:55:45Z
- **Completed:** 2026-03-05T10:57:45Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- AlertBanner subscribes to listActiveAlerts in real time — urgent alerts red, info alerts amber, stacked vertically newest-first
- Per-session dismiss via sessionStorage with useEffect-only read — no hydration mismatch on server render
- DashboardShell now renders AlertBanner between TopBar and main, ensuring every dashboard page shows active alerts
- NewsClientPage orchestrates NewsFilterBar + FeaturedNewsSection + NewsGrid with shared URL-synced filter state from useNewsFilters
- "Last updated X ago" indicator with 60-second refresh interval and Hebrew locale support via date-fns
- news/page.tsx no longer shows Coming Soon — renders NewsClientPage with live Convex data subscriptions

## Task Commits

Each task was committed atomically:

1. **Task 1: Create AlertBanner and integrate into DashboardShell** - `bb1a3d6` (feat)
2. **Task 2: Create NewsClientPage and update news route files** - `6ca2d11` (feat)

## Files Created/Modified

- `src/shared/components/AlertBanner.tsx` - Real-time alert banner with dismiss, sessionStorage persistence, red/amber severity styles
- `src/shared/components/DashboardShell.tsx` - Added AlertBanner import and placement between TopBar and main
- `src/shared/components/news/NewsClientPage.tsx` - News page orchestrator composing filter bar, featured section, infinite scroll grid
- `src/app/[locale]/(dashboard)/news/page.tsx` - Server component rendering NewsClientPage (replaced Coming Soon)
- `src/app/[locale]/(dashboard)/news/loading.tsx` - Updated skeleton with news card shapes (header, badges, text lines)

## Decisions Made

- AlertBanner reads sessionStorage in useEffect only — SSR does not have sessionStorage, so reading outside useEffect would cause hydration mismatch
- AlertBanner returns null when visibleAlerts is empty — DashboardShell needs no conditional logic; zero space consumed when no alerts
- NewsClientPage does not use the `-m-4 md:-m-6` full-height escape that FlightsClientPage uses — news is a simple scrollable page, no map sidebar requiring full viewport height
- news/page.tsx is not async — Convex subscriptions handle data fetching reactively in the client component

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None — all components compiled cleanly on first pass.

## User Setup Required

None - no external service configuration required. Alert banner activates automatically when alerts exist in the Convex database (insertable via Convex dashboard).

## Next Phase Readiness

- The complete news aggregator feature is fully wired: backend RSS ingestion (04-01) feeds data to UI components (04-02) composed into the live page (04-03)
- Alert banner is live on all dashboard pages — test by inserting an alert record in the Convex dashboard
- Phase 4 (News Aggregator) is fully complete — all 3 plans done

## Self-Check: PASSED

All created files verified present. All task commits verified in git log.

---
*Phase: 04-news-aggregator*
*Completed: 2026-03-05*
