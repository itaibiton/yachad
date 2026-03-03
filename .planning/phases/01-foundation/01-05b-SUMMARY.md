---
phase: 01-foundation
plan: 05b
subsystem: ui
tags: [next.js, clerk, dashboard, layout, i18n, rtl, error-boundary, skeleton, lucide-react, placeholder-pages]

# Dependency graph
requires:
  - phase: 01-04
    provides: next-intl locale layout, messages/he.json and messages/en.json with all UI namespaces
  - phase: 01-05a
    provides: DashboardShell, ErrorBoundary, LoadingSkeleton variants, all shared sidebar/topbar components

provides:
  - src/app/[locale]/(dashboard)/layout.tsx — Auth-gated dashboard layout wrapping all pages in DashboardShell
  - src/app/[locale]/(dashboard)/page.tsx — Overview home page with 4 summary cards (flights, alerts, posts, services)
  - src/app/[locale]/error.tsx — Locale-level error boundary using ErrorBoundary component
  - src/app/[locale]/loading.tsx — Locale-level loading skeleton using PageSkeleton
  - src/app/[locale]/not-found.tsx — Bilingual 404 page with home navigation link
  - src/app/[locale]/(dashboard)/flights/page.tsx — Extraction Flights placeholder page with Plane icon
  - src/app/[locale]/(dashboard)/flights/error.tsx — Per-module isolated error boundary
  - src/app/[locale]/(dashboard)/flights/loading.tsx — FlightCardSkeleton loading state
  - src/app/[locale]/(dashboard)/news/page.tsx — News placeholder page with Newspaper icon
  - src/app/[locale]/(dashboard)/news/error.tsx — Per-module isolated error boundary
  - src/app/[locale]/(dashboard)/news/loading.tsx — ListSkeleton loading state
  - src/app/[locale]/(dashboard)/map/page.tsx — Services Map placeholder page with MapPin icon
  - src/app/[locale]/(dashboard)/map/error.tsx — Per-module isolated error boundary
  - src/app/[locale]/(dashboard)/map/loading.tsx — PageSkeleton loading state
  - src/app/[locale]/(dashboard)/feed/page.tsx — Community Feed placeholder page with Users icon
  - src/app/[locale]/(dashboard)/feed/error.tsx — Per-module isolated error boundary
  - src/app/[locale]/(dashboard)/feed/loading.tsx — PostSkeleton loading state
  - src/app/[locale]/(dashboard)/chat/page.tsx — Chat placeholder page with MessageSquare icon
  - src/app/[locale]/(dashboard)/chat/error.tsx — Per-module isolated error boundary
  - src/app/[locale]/(dashboard)/chat/loading.tsx — ListSkeleton loading state
  - src/app/[locale]/(dashboard)/reservations/page.tsx — Hotels/Reservations placeholder page with Hotel icon
  - src/app/[locale]/(dashboard)/reservations/error.tsx — Per-module isolated error boundary
  - src/app/[locale]/(dashboard)/reservations/loading.tsx — CardSkeleton loading state

affects:
  - All future feature phases (02+) that implement the 6 module pages
  - Phase 01 checkpoint verification (Task 3)

# Tech tracking
tech-stack:
  added:
    - tw-animate-css (installed — was in package.json but missing from node_modules)
    - shadcn (installed — was referenced in globals.css but missing from node_modules)
  patterns:
    - Per-module error isolation pattern: each module directory has its own error.tsx that wraps ErrorBoundary, preventing single-module failures from crashing the entire dashboard
    - Skeleton selection pattern: loading.tsx imports the most semantically appropriate skeleton variant (FlightCardSkeleton for flights, PostSkeleton for feed, ListSkeleton for news/chat, CardSkeleton for reservations, PageSkeleton for map)
    - Shared translation namespace: modules.comingSoon and modules.comingSoonDescription added to messages for placeholder pages

key-files:
  created:
    - src/app/[locale]/(dashboard)/layout.tsx
    - src/app/[locale]/(dashboard)/page.tsx
    - src/app/[locale]/error.tsx
    - src/app/[locale]/loading.tsx
    - src/app/[locale]/not-found.tsx
    - src/app/[locale]/(dashboard)/flights/page.tsx
    - src/app/[locale]/(dashboard)/flights/error.tsx
    - src/app/[locale]/(dashboard)/flights/loading.tsx
    - src/app/[locale]/(dashboard)/news/page.tsx
    - src/app/[locale]/(dashboard)/news/error.tsx
    - src/app/[locale]/(dashboard)/news/loading.tsx
    - src/app/[locale]/(dashboard)/map/page.tsx
    - src/app/[locale]/(dashboard)/map/error.tsx
    - src/app/[locale]/(dashboard)/map/loading.tsx
    - src/app/[locale]/(dashboard)/feed/page.tsx
    - src/app/[locale]/(dashboard)/feed/error.tsx
    - src/app/[locale]/(dashboard)/feed/loading.tsx
    - src/app/[locale]/(dashboard)/chat/page.tsx
    - src/app/[locale]/(dashboard)/chat/error.tsx
    - src/app/[locale]/(dashboard)/chat/loading.tsx
    - src/app/[locale]/(dashboard)/reservations/page.tsx
    - src/app/[locale]/(dashboard)/reservations/error.tsx
    - src/app/[locale]/(dashboard)/reservations/loading.tsx
  modified:
    - src/app/[locale]/(dashboard)/layout.tsx (wired DashboardShell, was pass-through)
    - messages/en.json (added modules.comingSoon and modules.comingSoonDescription)
    - messages/he.json (added modules.comingSoon and modules.comingSoonDescription)

key-decisions:
  - "modules.comingSoon i18n namespace added to messages — plan required all text via useTranslations() but placeholder pages needed a 'coming soon' string not previously in the message files"
  - "Dashboard home page uses inline color utility classes (bg-blue-50, text-blue-600 etc.) for summary card icons — acceptable since these are decorative, not directional"
  - "Per-module error.tsx wraps ErrorBoundary (default export) directly — provides route-level error isolation without duplicating ErrorBoundary logic"

patterns-established:
  - "Per-module error isolation: each (dashboard)/[module]/error.tsx wraps ErrorBoundary for isolated error handling"
  - "Skeleton semantic matching: loading.tsx uses the most appropriate skeleton variant matching the module's future data shape"
  - "Dashboard overview grid: 2-column md:grid-cols-2 with card icon + title + empty-state message pattern"

requirements-completed: [FOUN-12, FOUN-13]

# Metrics
duration: 7min
completed: 2026-03-03
---

# Phase 1 Plan 05b: Dashboard Pages and Module Routes Summary

**Auth-gated DashboardShell layout, overview home with 4 summary cards, and 6 module placeholder pages each with per-module error isolation and semantically-matched skeleton loading states**

## Performance

- **Duration:** 7 min
- **Started:** 2026-03-03T15:56:26Z
- **Completed:** 2026-03-03T16:03:00Z
- **Tasks:** 2 of 3 (Task 3 is a human-verify checkpoint)
- **Files modified:** 26

## Accomplishments
- Dashboard layout updated to wrap all authenticated pages in DashboardShell with Clerk auth guard
- Overview home page with 4 summary cards (Latest Flights, Urgent Alerts, Recent Posts, Nearby Services) in 2-column responsive grid
- Locale-level error.tsx, loading.tsx, and bilingual not-found.tsx at the [locale] level
- 6 module placeholder pages with correct Lucide icons: Plane, Newspaper, MapPin, Users, MessageSquare, Hotel
- Per-module error.tsx for isolated error boundaries (error in flights doesn't crash chat)
- Per-module loading.tsx with semantically appropriate skeleton variants
- Added modules.comingSoon and modules.comingSoonDescription to both he.json and en.json

## Task Commits

Each task was committed atomically:

1. **Task 1: Wire dashboard layout and create overview home page** - `2a8996f` (feat)
2. **Task 2: Create all module placeholder pages with error and loading files** - `587ee3b` (feat)

**Plan metadata:** (docs commit — pending)

## Files Created/Modified
- `src/app/[locale]/(dashboard)/layout.tsx` — Auth-gated layout wrapping children in DashboardShell (updated)
- `src/app/[locale]/(dashboard)/page.tsx` — Overview home with 4 summary cards (created)
- `src/app/[locale]/error.tsx` — Locale-level error boundary (created)
- `src/app/[locale]/loading.tsx` — Locale-level PageSkeleton (created)
- `src/app/[locale]/not-found.tsx` — Bilingual 404 with home link (created)
- `src/app/[locale]/(dashboard)/flights/page.tsx` — Flights placeholder with Plane icon
- `src/app/[locale]/(dashboard)/flights/error.tsx` — Isolated error boundary
- `src/app/[locale]/(dashboard)/flights/loading.tsx` — FlightCardSkeleton x3
- `src/app/[locale]/(dashboard)/news/page.tsx` — News placeholder with Newspaper icon
- `src/app/[locale]/(dashboard)/news/error.tsx` — Isolated error boundary
- `src/app/[locale]/(dashboard)/news/loading.tsx` — ListSkeleton rows=6
- `src/app/[locale]/(dashboard)/map/page.tsx` — Map placeholder with MapPin icon
- `src/app/[locale]/(dashboard)/map/error.tsx` — Isolated error boundary
- `src/app/[locale]/(dashboard)/map/loading.tsx` — PageSkeleton
- `src/app/[locale]/(dashboard)/feed/page.tsx` — Community placeholder with Users icon
- `src/app/[locale]/(dashboard)/feed/error.tsx` — Isolated error boundary
- `src/app/[locale]/(dashboard)/feed/loading.tsx` — PostSkeleton x3
- `src/app/[locale]/(dashboard)/chat/page.tsx` — Chat placeholder with MessageSquare icon
- `src/app/[locale]/(dashboard)/chat/error.tsx` — Isolated error boundary
- `src/app/[locale]/(dashboard)/chat/loading.tsx` — ListSkeleton rows=8
- `src/app/[locale]/(dashboard)/reservations/page.tsx` — Hotels placeholder with Hotel icon
- `src/app/[locale]/(dashboard)/reservations/error.tsx` — Isolated error boundary
- `src/app/[locale]/(dashboard)/reservations/loading.tsx` — CardSkeleton x3
- `messages/en.json` — Added modules.comingSoon and modules.comingSoonDescription
- `messages/he.json` — Added modules.comingSoon and modules.comingSoonDescription

## Decisions Made
- **modules.comingSoon namespace:** Plan required all text via useTranslations(), but no existing key matched "coming soon". Added modules.comingSoon and modules.comingSoonDescription to both locale files to maintain zero-hardcoded-strings requirement.
- **Inline color utilities in home page:** Summary cards use bg-blue-50, text-blue-600 etc. for icon backgrounds — these are non-directional decorative classes, not layout directional properties, so they don't violate the RTL logical CSS rule.
- **ErrorBoundary is default export:** The ErrorBoundary component uses `export default` (not named export). All error.tsx files import it as default (`import ErrorBoundary from "@/shared/components/ErrorBoundary"`).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added modules.comingSoon to messages files**
- **Found during:** Task 2 (module placeholder pages)
- **Issue:** Plan specified all text must use useTranslations(), but the messages files had no "coming soon" key. Placeholder pages need this text.
- **Fix:** Added `modules.comingSoon` and `modules.comingSoonDescription` to messages/en.json and messages/he.json
- **Files modified:** messages/en.json, messages/he.json
- **Verification:** All 6 module pages use tModules("comingSoon") and tModules("comingSoonDescription")
- **Committed in:** 587ee3b (Task 2 commit)

**2. [Rule 3 - Blocking] Installed missing tw-animate-css package**
- **Found during:** Task 3 build verification
- **Issue:** globals.css imports tw-animate-css but the package was missing from node_modules (was in package.json but not installed)
- **Fix:** Ran `npm install tw-animate-css`
- **Files modified:** package-lock.json, node_modules/
- **Verification:** Build proceeded past this error
- **Committed in:** package-lock.json changes (part of Task 3 fix)

**3. [Rule 3 - Blocking] Installed missing shadcn package**
- **Found during:** Task 3 build verification
- **Issue:** globals.css imports `shadcn/tailwind.css` but shadcn package was missing from node_modules
- **Fix:** Ran `npm install shadcn`
- **Files modified:** package-lock.json, node_modules/
- **Verification:** Build compiled successfully (CSS resolved)
- **Committed in:** package-lock.json changes (part of Task 3 fix)

---

**Total deviations:** 3 auto-fixed (1 missing critical, 2 blocking)
**Impact on plan:** All auto-fixes necessary. Translation addition required for zero-hardcoded-strings compliance. Package installs required for build to succeed.

## Issues Encountered
- **Pre-existing: Convex _generated/ directory missing** — The TypeScript build fails because convex/_generated/ doesn't exist (requires `npx convex dev` to run and generate types). This is unrelated to plan 01-05b changes and was a pre-existing condition. The CSS compilation succeeds; only the TypeScript type-check fails for Convex files. Visual verification via `npm run dev` is unaffected.

## User Setup Required
None — no external service configuration required for this plan.

## Next Phase Readiness
- Dashboard layout is complete — all routes render within DashboardShell
- All 6 module routes exist as navigable placeholders — ready for Phase 2+ feature implementation
- Error boundaries at locale and module level — every route group is protected
- Loading skeletons matched to future data shapes — no skeleton changes needed when real data arrives
- Checkpoint Task 3 remains open for human visual verification of the complete dashboard shell

---
*Phase: 01-foundation*
*Completed: 2026-03-03*
