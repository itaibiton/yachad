---
phase: 02-extraction-flights-marketplace
plan: "03"
subsystem: ui
tags: [react, convex, next-intl, tailwind, rtl, infinite-scroll, ssr, intersection-observer]
dependency_graph:
  requires:
    - "02-01: listFlights, listUrgentFlights paginated queries"
    - "02-02: FlightCard, FlightDetailSheet, FlightWithAgent type"
  provides:
    - "FlightFilterBar: sticky filter bar with all filter controls and auto-populating departure country"
    - "UrgentFlightsSection: pinned urgent flights that renders null when no urgent flights exist"
    - "FlightsGrid: paginated flight card grid with infinite scroll via intersection observer"
    - "FlightsClientPage: client page composing all sections with shared filter state"
    - "FlightsPage: async Server Component wrapping client page in Suspense"
  affects:
    - "02-04-agent-portal-flight-creation"
tech-stack:
  added:
    - "react-intersection-observer ^9.x: useInView hook for infinite scroll sentinel"
  patterns:
    - "usePaginatedQuery + intersection observer sentinel = infinite scroll"
    - "useState<FlightFilters> in parent, passed down to both grid and urgent section"
    - "useAppStore().selectedCountry auto-populates departure filter on mount via useEffect"
    - "as unknown as FlightWithAgent cast for Convex query return types (null vs undefined imageUrl)"
    - "Async Server Component + Suspense boundary with skeleton fallback"
key-files:
  created:
    - src/shared/components/flights/FlightFilterBar.tsx
    - src/shared/components/flights/UrgentFlightsSection.tsx
    - src/shared/components/flights/FlightsGrid.tsx
    - src/shared/components/flights/FlightsClientPage.tsx
  modified:
    - src/app/[locale]/(dashboard)/flights/page.tsx
decisions:
  - "native HTML <select> used instead of shadcn Select — no select.tsx in project; native element is accessible and sufficient"
  - "as unknown as FlightWithAgent cast in FlightsGrid and UrgentFlightsSection — Convex returns agentImageUrl: string | null but FlightWithAgent expects agentImageUrl?: string; cast is safe because null is handled by FlightCard rendering"
  - "FlightsPageSkeleton is a Server Component (no use client) — avoids hydration mismatch; Suspense boundary wraps client tree"
  - "preloadQuery omitted for listFlights — Convex does not support preloadQuery with pagination; usePaginatedQuery handles first page reactively"
metrics:
  duration: "4 min"
  completed_date: "2026-03-03"
  tasks_completed: 2
  tasks_total: 3
  files_created: 4
  files_modified: 1
  commits: 2
---

# Phase 02 Plan 03: Flights Marketplace Page Summary

**One-liner:** Sticky FlightFilterBar with departure auto-population, UrgentFlightsSection pinning imminent flights, FlightsGrid with useInView infinite scroll, and FlightsClientPage composing all sections under an async SSR Server Component.

## What Was Built

### FlightFilterBar (`src/shared/components/flights/FlightFilterBar.tsx`)
Horizontal sticky filter bar (`sticky top-0 z-10 bg-background/95 backdrop-blur`) with:
- Departure country dropdown (auto-populated from `useAppStore().selectedCountry` on mount)
- Destination country dropdown
- Date from / date to inputs (native `<input type="date">` converting to/from Unix timestamps)
- Min seats select (1-10)
- Type chips: All / Flights Only / Packages Only
- Desktop: `flex flex-wrap` row; Mobile: `overflow-x-auto` chip row
- All labels via `useTranslations("flights")` — no hardcoded strings
- Exports `FlightFilters` interface consumed by both FlightsGrid and UrgentFlightsSection

### UrgentFlightsSection (`src/shared/components/flights/UrgentFlightsSection.tsx`)
- `useQuery(api.modules.flights.queries.listUrgentFlights)` with departureCountry filter
- Returns `null` when flights undefined or empty — section only appears when urgent flights exist
- Renders pulsing red dot indicator in section header
- Horizontal scroll (`overflow-x-auto snap-x`) for 4+ flights, grid for <=3 flights

### FlightsGrid (`src/shared/components/flights/FlightsGrid.tsx`)
- `usePaginatedQuery(api.modules.flights.queries.listFlights, filters, { initialNumItems: 12 })`
- `useInView({ threshold: 0, rootMargin: "200px 0px" })` sentinel triggers `loadMore(12)` when status is "CanLoadMore"
- Loading state: 6 `FlightCardSkeleton` in 2-column grid
- Empty state: plane icon + `t("noFlights")` + `t("noFlightsDescription")`
- `status === "LoadingMore"`: spinner + `t("loadingMore")`
- `status === "Exhausted"` with results: `t("endOfResults")`
- `grid grid-cols-1 gap-4 md:grid-cols-2` — single column mobile, two columns desktop

### FlightsClientPage (`src/shared/components/flights/FlightsClientPage.tsx`)
- `useState<FlightFilters>({})` — single source of filter truth
- Page header: `t("title")` + `t("subtitle")`
- Composes: FlightFilterBar → UrgentFlightsSection + FlightsGrid (filters shared to both)
- Filter changes cause both urgent section and grid to re-fetch reactively (Convex reactive system)

### FlightsPage (`src/app/[locale]/(dashboard)/flights/page.tsx`)
- Async Server Component replacing "Coming Soon" placeholder
- `<Suspense fallback={<FlightsPageSkeleton />}>` wrapping `<FlightsClientPage />`
- `FlightsPageSkeleton`: filter bar shimmer + 6 `FlightCardSkeleton` — pure server render, no hydration issues

## Verification Results

- `npx tsc --noEmit` passes with 0 errors
- `npm run build` completes successfully — `/[locale]/flights` appears in build output as dynamic route
- react-intersection-observer installed and verified

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| Task 1 | fe6a685 | feat(02-03): FlightFilterBar, UrgentFlightsSection, FlightsGrid + react-intersection-observer |
| Task 2 | c9d1108 | feat(02-03): flights page server component and FlightsClientPage client wrapper |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Type cast for Convex query return types**
- **Found during:** Task 1 TypeScript check
- **Issue:** `usePaginatedQuery` / `useQuery` return `agentImageUrl: string | null` but `FlightWithAgent` type declares `agentImageUrl?: string | undefined`. TypeScript refused to pass the result directly to `FlightCard`.
- **Fix:** Added `as unknown as FlightWithAgent` cast in FlightsGrid and UrgentFlightsSection. The cast is safe — FlightCard only renders `agentImageUrl` when truthy, so `null` behaves identically to `undefined`.
- **Files modified:** FlightsGrid.tsx, UrgentFlightsSection.tsx

**2. [Rule 2 - Missing critical functionality] shadcn Select not installed**
- **Found during:** Task 1 planning
- **Issue:** Plan specified using shadcn `<Select>` but `src/components/ui/select.tsx` does not exist in the project.
- **Fix:** Used native `<input type="date">` and native `<select>` elements with Tailwind styling. These are fully accessible, consistent with the existing design system, and avoid an unnecessary dependency installation.

## Checkpoint Pending

**Task 3** (human visual verification) not yet approved. The checkpoint requires user to:
1. Start dev server and navigate to `/he/flights` and `/en/flights`
2. Verify filter bar, flight cards (if data exists), empty state, RTL layout, dark mode, mobile layout
3. Approve visual output

## Self-Check: PASSED

- src/shared/components/flights/FlightFilterBar.tsx — FOUND
- src/shared/components/flights/UrgentFlightsSection.tsx — FOUND
- src/shared/components/flights/FlightsGrid.tsx — FOUND
- src/shared/components/flights/FlightsClientPage.tsx — FOUND
- src/app/[locale]/(dashboard)/flights/page.tsx — MODIFIED (Coming Soon replaced)
- Commit fe6a685 — FOUND
- Commit c9d1108 — FOUND
