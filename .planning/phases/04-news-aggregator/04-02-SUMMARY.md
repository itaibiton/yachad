---
phase: 04-news-aggregator
plan: 02
subsystem: ui
tags: [react, convex, nuqs, date-fns, infinite-scroll, pull-to-refresh, rtl, news]

# Dependency graph
requires:
  - phase: 04-news-aggregator
    provides: "convex/modules/news/queries.ts — listNewsArticles, listFeaturedArticles with source denormalization"
  - phase: 02-extraction-flights-marketplace
    provides: "FlightsGrid, UrgentFlightsSection, FlightFilterBar, useFlightFilters patterns to mirror"
provides:
  - "NewsCard — article card with favicon, trust tier badge, language badge, relative timestamp"
  - "NewsGrid — infinite scroll feed with new articles banner and mobile pull-to-refresh"
  - "FeaturedNewsSection — pinned Important articles section above feed"
  - "NewsFilterBar — language + country filter bar with URL-synced state"
  - "NewArticlesBanner — clickable banner when new content arrives"
  - "news-utils.ts — NewsArticleWithSource type, getTrustTierConfig, extractDomain"
  - "useNewsFilters — URL-synced filter state with useAppStore country auto-populate"
affects:
  - 04-news-aggregator
  - 04-03-page-wiring

# Tech tracking
tech-stack:
  added: [date-fns (formatDistanceToNow with Hebrew locale)]
  patterns:
    - "usePaginatedQuery + useInView infinite scroll (mirror of FlightsGrid)"
    - "useQuery non-paginated for featured section (mirror of UrgentFlightsSection)"
    - "useQueryStates (nuqs) for URL-synced filter state (mirror of useFlightFilters)"
    - "useState seenCount/pendingCount for new articles banner without scroll disruption"
    - "touchstart/touchmove/touchend pull-to-refresh at 80px threshold (mobile only)"
    - "Google S2 favicon fallback with onError first-letter fallback"

key-files:
  created:
    - src/shared/components/news/news-utils.ts
    - src/shared/components/news/NewsCard.tsx
    - src/shared/components/news/NewsGrid.tsx
    - src/shared/components/news/FeaturedNewsSection.tsx
    - src/shared/components/news/NewsFilterBar.tsx
    - src/shared/components/news/NewArticlesBanner.tsx
    - src/shared/hooks/useNewsFilters.ts
  modified: []

key-decisions:
  - "FeaturedNewsSection wraps NewsCard in a div with ring-2 ring-amber-500/30 to distinguish from regular feed cards — avoids forking NewsCard"
  - "NewsGrid pull-to-refresh resets seenCount to null rather than calling a Convex refetch — usePaginatedQuery is already reactive, so resetting baseline triggers re-baseline on next render"
  - "NewsCard uses as-block anchor tag wrapper instead of onClick+window.open to allow native browser behaviors (middle-click, copy link)"

patterns-established:
  - "News module mirrors flights module architecture exactly: utils/type file, card, grid, section, filter bar, hook"
  - "Single-column layout for news (flex flex-col gap-4) vs flights which uses xl:grid-cols-2"

requirements-completed: [NEWS-01, NEWS-02, NEWS-05, NEWS-06, NEWS-09, NEWS-10]

# Metrics
duration: 4min
completed: 2026-03-05
---

# Phase 04 Plan 02: News Feed UI Components Summary

**Seven news UI components — card, infinite-scroll grid, featured section, filter bar, new-articles banner, utils, and URL-synced filter hook — mirroring the flights module architecture**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-05T10:48:28Z
- **Completed:** 2026-03-05T10:52:28Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- NewsCard renders article with source favicon (Google S2 fallback), Official/Verified/Community trust tier badge (blue/green/gray), HE/EN language chip, and relative timestamp with Hebrew locale support
- NewsGrid delivers infinite scroll via usePaginatedQuery + useInView, new articles banner tracking (seenCount pattern), and mobile pull-to-refresh with 80px threshold
- FeaturedNewsSection displays pinned Important articles above the feed with amber ring styling, and disappears automatically when empty
- NewsFilterBar provides language select + country combobox both desktop and mobile scrollable layouts with URL-synced state
- useNewsFilters provides nuqs-backed URL state with useAppStore selectedCountry auto-populate and "_all" sentinel handling

## Task Commits

Each task was committed atomically:

1. **Task 1: news-utils.ts and useNewsFilters** - `98c1590` (feat)
2. **Task 2: NewsCard, NewsGrid, FeaturedNewsSection, NewsFilterBar, NewArticlesBanner** - `6e49217` (feat)

## Files Created/Modified

- `src/shared/components/news/news-utils.ts` - NewsArticleWithSource type, getTrustTierConfig, extractDomain
- `src/shared/components/news/NewsCard.tsx` - Clickable article card with source attribution, badges, relative time
- `src/shared/components/news/NewsGrid.tsx` - Infinite scroll feed with banner logic and pull-to-refresh
- `src/shared/components/news/FeaturedNewsSection.tsx` - Pinned Important articles with amber ring
- `src/shared/components/news/NewsFilterBar.tsx` - Language + country filters, desktop and mobile layouts
- `src/shared/components/news/NewArticlesBanner.tsx` - Animated banner for new incoming articles
- `src/shared/hooks/useNewsFilters.ts` - URL-synced filter state with nuqs and appStore integration

## Decisions Made

- FeaturedNewsSection wraps NewsCard in a div with ring-2 ring-amber-500/30 to add the "Important" visual indicator — avoids forking NewsCard component
- NewsGrid pull-to-refresh resets seenCount to null (re-baseline) rather than triggering a Convex refetch — usePaginatedQuery is already reactive, so the user sees new content naturally when it arrives
- NewsCard uses block anchor tag wrapper instead of onClick+window.open — allows native browser behaviors (middle-click to open in new tab, right-click copy link)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Confirmed news queries file already existed from partial Plan 04-01 execution**
- **Found during:** Pre-task setup
- **Issue:** The generated `convex/_generated/api.d.ts` already referenced `modules/news/queries.js` and `modules/alerts/queries.js`, and those source files already existed — Plan 04-01 had already been partially executed
- **Fix:** No action needed — files already in place. Proceeded directly to Plan 04-02 tasks.
- **Files modified:** None (pre-existing)
- **Verification:** TypeScript passed with no errors

---

**Total deviations:** 1 discovered (no action needed — files pre-existing)
**Impact on plan:** None — files already present, plan executed cleanly as written.

## Issues Encountered

None — all components compiled cleanly on first pass.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- All 7 news UI components are ready to be composed into the news page (Plan 04-03)
- Components accept props matching the convex query returns from Plan 04-01
- Filter state is URL-synced and ready for the page to pass to NewsGrid and FeaturedNewsSection

---
*Phase: 04-news-aggregator*
*Completed: 2026-03-05*
