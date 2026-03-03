---
phase: 01-foundation
plan: 05a
subsystem: ui
tags: [zustand, sidebar, topbar, rtl, i18n, emergency, geolocation, skeleton, error-boundary, next-intl, next-themes, clerk]

# Dependency graph
requires:
  - phase: 01-01
    provides: Next.js scaffold, shadcn/ui components (Button, Skeleton, DropdownMenu, Sheet, Sidebar, Tooltip, Avatar, Badge, Separator, ScrollArea), ThemeProvider
  - phase: 01-03
    provides: Clerk auth (useUser, useClerk) for ProfileMenu
  - phase: 01-04
    provides: next-intl routing, useTranslations, messages/he.json + en.json with all UI namespaces

provides:
  - src/stores/appStore.ts — Zustand persisted store: selectedCountry, hasCompletedOnboarding, sidebarCollapsed
  - src/shared/components/sidebar/AppSidebar.tsx — Desktop sidebar with 7 modules in crisis priority order, collapsible
  - src/shared/components/sidebar/SidebarNavItem.tsx — Active-state nav item with tooltip when collapsed
  - src/shared/components/sidebar/MobileBottomNav.tsx — Mobile bottom tab navigation with 6 modules, safe-area-inset
  - src/shared/components/topbar/TopBar.tsx — Composed top bar with all controls
  - src/shared/components/topbar/SearchButton.tsx — Expand/collapse search input
  - src/shared/components/topbar/CountrySelector.tsx — Country dropdown with 30 countries + flag emoji
  - src/shared/components/topbar/CountryOnboardingModal.tsx — First-login modal with IP geolocation auto-detect
  - src/shared/components/topbar/EmergencyButton.tsx — Red emergency button + mobile FAB with 4-option dropdown
  - src/shared/components/topbar/LanguageToggle.tsx — he/en locale switcher via next-intl useRouter
  - src/shared/components/topbar/ThemeToggle.tsx — system/light/dark theme cycler via next-themes
  - src/shared/components/topbar/NotificationBell.tsx — Bell with placeholder coming-soon dropdown
  - src/shared/components/topbar/ProfileMenu.tsx — Clerk user avatar + profile/settings/signout dropdown
  - src/shared/components/DashboardShell.tsx — Master layout composing sidebar + topbar + content + mobile nav
  - src/shared/components/ErrorBoundary.tsx — App Router error.tsx component with bilingual messages
  - src/shared/components/LoadingSkeleton.tsx — CardSkeleton, ListSkeleton, PageSkeleton, SidebarSkeleton, FlightCardSkeleton, PostSkeleton
  - src/shared/data/countries.ts — 30-country list with flag, name, Hebrew name, embassy phone

affects:
  - 01-05b (wires DashboardShell into dashboard layout and pages)
  - All future UI phases that use sidebar, topbar, error boundaries, or skeleton loading

# Tech tracking
tech-stack:
  added:
    - zustand/middleware persist (client-side state persistence to localStorage)
    - ipapi.co (free IP geolocation API for country auto-detect)
    - shadcn/ui dialog component (added via npx shadcn add dialog)
    - createNavigation from next-intl/navigation (locale-aware Link, useRouter, usePathname)
  patterns:
    - Zustand persist pattern: yachad-app-state key in localStorage for selectedCountry + hasCompletedOnboarding + sidebarCollapsed
    - RTL-safe CSS: all logical properties (ps-, pe-, ms-, me-, start-, end-) — zero physical directional utilities
    - Emergency FAB pattern: EmergencyButton renders as fixed bottom-20 end-4 FAB on mobile only via isFAB prop
    - Country onboarding gate: modal blocks all interaction until country selected (onInteractOutside + onEscapeKeyDown preventDefault)

key-files:
  created:
    - src/stores/appStore.ts
    - src/shared/components/sidebar/AppSidebar.tsx
    - src/shared/components/sidebar/SidebarNavItem.tsx
    - src/shared/components/sidebar/MobileBottomNav.tsx
    - src/shared/components/topbar/TopBar.tsx
    - src/shared/components/topbar/SearchButton.tsx
    - src/shared/components/topbar/CountrySelector.tsx
    - src/shared/components/topbar/CountryOnboardingModal.tsx
    - src/shared/components/topbar/EmergencyButton.tsx
    - src/shared/components/topbar/LanguageToggle.tsx
    - src/shared/components/topbar/ThemeToggle.tsx
    - src/shared/components/topbar/NotificationBell.tsx
    - src/shared/components/topbar/ProfileMenu.tsx
    - src/shared/components/DashboardShell.tsx
    - src/shared/components/ErrorBoundary.tsx
    - src/shared/components/LoadingSkeleton.tsx
    - src/shared/data/countries.ts
    - src/components/ui/dialog.tsx
  modified:
    - i18n/routing.ts (added createNavigation exports: Link, useRouter, usePathname, redirect)
    - src/i18n/routing.ts (re-export updated to include navigation utilities)
    - src/app/globals.css (added --brand and --brand-foreground CSS variables for Israeli blue #0038b8)

key-decisions:
  - "createNavigation added to i18n/routing.ts so @/i18n/routing exports locale-aware Link and useRouter — plan referenced these exports but they were missing from the file"
  - "CountryOnboardingModal uses ipapi.co free API with 5s timeout and graceful fallback to manual selection only"
  - "EmergencyButton uses isFAB prop to render either as top-bar icon button or mobile FAB — single component for both contexts"
  - "Israeli brand blue represented as oklch(0.35 0.2 264) in light mode, oklch(0.55 0.2 264) in dark mode — closest oklch match to #0038b8"
  - "countries.ts shared data file created for both CountrySelector and CountryOnboardingModal to avoid duplication"

patterns-established:
  - "Shared data pattern: /src/shared/data/ directory for country lists and other cross-component data"
  - "Emergency dual-render pattern: single EmergencyButton component with isFAB prop for top-bar vs mobile FAB"
  - "Country gate pattern: onboarding modal blocks all interaction (no backdrop dismiss, no ESC key) until country selected"
  - "Zustand persist pattern: useAppStore with yachad-app-state localStorage key for user preferences"

requirements-completed: [FOUN-09, FOUN-10]

# Metrics
duration: 8min
completed: 2026-03-03
---

# Phase 1 Plan 05a: Shared Dashboard Components Summary

**Zustand-persisted app state, RTL-safe sidebar + mobile bottom nav, full top bar with IP-geolocated country onboarding modal, emergency button with mobile FAB, theme/language toggles, and bilingual error boundary + 6-variant skeleton loading**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-03T15:42:22Z
- **Completed:** 2026-03-03T15:50:31Z
- **Tasks:** 3
- **Files modified:** 20

## Accomplishments
- Zustand store (appStore) with persisted selectedCountry, hasCompletedOnboarding, and sidebarCollapsed state
- Desktop sidebar with 7 crisis-priority modules (Home, Flights, News, Map, Feed, Chat, Reservations), collapsible to icons-only with tooltip labels
- Mobile bottom tab navigation with 6 modules, safe-area-inset-bottom for notched phones
- Country onboarding modal with IP geolocation auto-detect (ipapi.co) + manual override — not dismissable without selection
- Emergency button with 4-option dropdown (Call Embassy, Share Location, Emergency Chat, Report Danger) + mobile FAB
- Language toggle switching he/en via next-intl useRouter.replace
- Dark mode ThemeToggle cycling system/light/dark via next-themes
- DashboardShell composing all layout elements (sidebar, topbar, content, mobile nav, emergency FAB)
- ErrorBoundary with bilingual messages (error type detection: notFound, unauthorized, network, generic)
- 6 LoadingSkeleton variants: CardSkeleton, ListSkeleton, PageSkeleton, SidebarSkeleton, FlightCardSkeleton, PostSkeleton

## Task Commits

Each task was committed atomically:

1. **Task 1: Build Zustand store and sidebar components** - `cf597ed` (feat)
2. **Task 2: Build top bar components and DashboardShell** - `4664310` (feat)
3. **Task 3: Build error boundary and skeleton loading components** - `c3e7e28` (feat)

**Plan metadata:** (docs commit — pending)

## Files Created/Modified
- `src/stores/appStore.ts` — Zustand persist store: selectedCountry, hasCompletedOnboarding, sidebarCollapsed
- `src/shared/components/sidebar/AppSidebar.tsx` — 7-module desktop sidebar, collapsible, brand logo
- `src/shared/components/sidebar/SidebarNavItem.tsx` — Active-state nav item with tooltip when collapsed
- `src/shared/components/sidebar/MobileBottomNav.tsx` — Mobile 6-tab bottom nav with active indicator
- `src/shared/components/topbar/TopBar.tsx` — Composed top bar, sticky, blur backdrop
- `src/shared/components/topbar/SearchButton.tsx` — Expand/collapse search input
- `src/shared/components/topbar/CountrySelector.tsx` — 30-country dropdown, triggers onboarding modal
- `src/shared/components/topbar/CountryOnboardingModal.tsx` — First-login modal with ipapi.co + manual override
- `src/shared/components/topbar/EmergencyButton.tsx` — Red button + mobile FAB with 4-option dropdown
- `src/shared/components/topbar/LanguageToggle.tsx` — he/en toggle via next-intl useRouter.replace
- `src/shared/components/topbar/ThemeToggle.tsx` — system/light/dark cycler via next-themes useTheme
- `src/shared/components/topbar/NotificationBell.tsx` — Bell with placeholder "coming soon" dropdown
- `src/shared/components/topbar/ProfileMenu.tsx` — Clerk avatar, initials fallback, signOut
- `src/shared/components/DashboardShell.tsx` — Master layout: AppSidebar + TopBar + main + MobileBottomNav + FAB
- `src/shared/components/ErrorBoundary.tsx` — App Router error.tsx with bilingual error messages
- `src/shared/components/LoadingSkeleton.tsx` — 6 skeleton variants for all data-fetching patterns
- `src/shared/data/countries.ts` — 30-country list with flag, nameHe, embassy phone
- `src/components/ui/dialog.tsx` — shadcn Dialog component (added via npx shadcn add)
- `i18n/routing.ts` — Added createNavigation exports (Link, useRouter, usePathname, redirect)
- `src/app/globals.css` — Added --brand CSS variable (Israeli blue oklch approximation)

## Decisions Made
- **createNavigation added to i18n/routing.ts:** The plan referenced `Link from "@/i18n/routing"` and `useRouter from next-intl/navigation` but the routing file only exported `routing`. Added createNavigation(routing) exports to the file, updated the src/i18n/routing.ts re-export to include them.
- **ipapi.co for geolocation:** Free, no-API-key service with 5s AbortSignal timeout and graceful fallback to manual-only mode if the API fails or returns an error.
- **isFAB prop on EmergencyButton:** Rather than two separate components, a single EmergencyButton component accepts `isFAB` to render as fixed bottom-20 FAB (mobile) vs icon button (desktop) — keeps emergency dropdown logic in one place.
- **oklch for brand color:** globals.css uses oklch color space. Israeli blue #0038b8 maps to approximately oklch(0.35 0.2 264) in light mode.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added createNavigation exports to i18n/routing.ts**
- **Found during:** Task 1 (SidebarNavItem and MobileBottomNav creation)
- **Issue:** Plan references `Link from "@/i18n/routing"` and `useRouter from next-intl/navigation`, but i18n/routing.ts only exported `routing` config — no navigation utilities
- **Fix:** Added `createNavigation(routing)` call to i18n/routing.ts exporting Link, useRouter, usePathname, redirect; updated src/i18n/routing.ts re-export to include all navigation utilities
- **Files modified:** i18n/routing.ts, src/i18n/routing.ts
- **Verification:** Imports resolve correctly in all components
- **Committed in:** cf597ed (Task 1 commit)

**2. [Rule 3 - Blocking] Installed missing shadcn dialog component**
- **Found during:** Task 2 (CountryOnboardingModal creation)
- **Issue:** CountryOnboardingModal uses Dialog component from shadcn/ui, but dialog.tsx was not in src/components/ui/ — only 13 base components were installed in Plan 01-01
- **Fix:** Ran `npx shadcn@latest add dialog --yes` to install the Dialog component
- **Files modified:** src/components/ui/dialog.tsx (created)
- **Verification:** Dialog renders correctly with showCloseButton={false} prop
- **Committed in:** 4664310 (Task 2 commit)

**3. [Rule 2 - Missing Critical] Created shared countries.ts data file**
- **Found during:** Task 2 (both CountrySelector and CountryOnboardingModal need country list)
- **Issue:** Plan specified a "top 30 countries" list in both CountrySelector and CountryOnboardingModal — duplicating this would create maintenance burden and inconsistency
- **Fix:** Created src/shared/data/countries.ts with Country interface, 30-country array, and getCountryByCode helper — both components import from this shared file
- **Files modified:** src/shared/data/countries.ts (created)
- **Verification:** Both components import and use the shared list correctly
- **Committed in:** 4664310 (Task 2 commit)

---

**Total deviations:** 3 auto-fixed (2 blocking, 1 missing critical)
**Impact on plan:** All auto-fixes necessary for correctness and functionality. No scope change — the shared countries.ts file and navigation exports were implied by the plan's references.

## Issues Encountered
None beyond the auto-fixed deviations above.

## User Setup Required
None — no external service configuration required for this plan.
The IP geolocation API (ipapi.co) requires no API key for basic use.

## Next Phase Readiness
- All shared dashboard components are built and export correctly
- DashboardShell is ready to be used in the dashboard route group layout (Plan 01-05b)
- CountryOnboardingModal will fire automatically on first authenticated page load
- Emergency button is accessible from every screen via DashboardShell
- ErrorBoundary can be used as error.tsx in any route group
- All 6 skeleton variants ready for use in data-fetching pages across all phases

## Self-Check: PASSED

All 18 created files verified present on disk. All 3 task commits verified in git log (cf597ed, 4664310, c3e7e28).

---
*Phase: 01-foundation*
*Completed: 2026-03-03*
