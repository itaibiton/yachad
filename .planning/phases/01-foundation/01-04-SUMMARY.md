---
phase: 01-foundation
plan: 04
subsystem: ui
tags: [next-intl, i18n, rtl, localization, hebrew, routing, next.js]

# Dependency graph
requires:
  - phase: 01-01
    provides: Next.js scaffold with next-intl plugin in next.config.ts and ConvexClientProvider
  - phase: 01-03
    provides: proxy.ts middleware that imports routing from @/i18n/routing

provides:
  - i18n/routing.ts — locale routing config with Hebrew default and English support
  - i18n/request.ts — getRequestConfig for SSR translations
  - messages/he.json — 65 Phase 1 UI strings in Hebrew
  - messages/en.json — matching English translations with identical key structure
  - src/app/[locale]/layout.tsx — locale layout with dir/lang attrs and NextIntlClientProvider
  - src/app/[locale]/page.tsx — temporary landing page with translations
  - src/app/[locale]/(dashboard)/layout.tsx — dashboard route group with Clerk auth guard

affects:
  - 01-05a, 01-05b, all future UI plans that consume next-intl translations and RTL/LTR layout

# Tech tracking
tech-stack:
  added: [next-intl v4 locale routing, next-intl getRequestConfig, NextIntlClientProvider]
  patterns:
    - Pass-through root layout (app/layout.tsx without html/body) enabling locale-specific html dir/lang
    - defineRouting with localePrefix always for canonical locale URLs
    - RTL_LOCALES array pattern for dir attribute resolution
    - Async params pattern (await params) for Next.js 16 compatibility

key-files:
  created:
    - i18n/routing.ts
    - i18n/request.ts
    - messages/he.json
    - messages/en.json
    - src/app/[locale]/layout.tsx
    - src/app/[locale]/page.tsx
    - src/app/[locale]/(dashboard)/layout.tsx
  modified:
    - src/app/layout.tsx

key-decisions:
  - "Root app/layout.tsx updated to pass-through (no html/body) so locale layout can own html dir and lang attributes — official next-intl App Router pattern"
  - "Toaster position adapts to locale direction: top-left for RTL (Hebrew), top-right for LTR (English)"
  - "localePrefix: always ensures canonical /he/ and /en/ URL prefixes — no ambiguous root URLs"
  - "Inter font loaded in locale layout (not root layout) to keep font variable scoped to locale html element"

patterns-established:
  - "Pass-through root layout: app/layout.tsx wraps in providers only, locale layout owns html element"
  - "RTL resolution: RTL_LOCALES array check, dir passed to html element and Toaster position"
  - "Locale validation: routing.locales.includes check with notFound() for unknown locales"
  - "Async params: always await params in locale layouts for Next.js 16 compatibility"

requirements-completed: [FOUN-07]

# Metrics
duration: 2min
completed: 2026-03-03
---

# Phase 1 Plan 04: i18n Locale Routing and Bilingual Messages Summary

**next-intl v4 locale routing with Hebrew default (/he RTL) and English (/en LTR), 65-key bilingual message files, and locale layout with dynamic dir/lang attributes**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-03T15:35:36Z
- **Completed:** 2026-03-03T15:37:46Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Locale routing configured: / redirects to /he (Hebrew default), /en accessible with LTR
- Bilingual message files with 65 UI strings covering all Phase 1 features (nav, topbar, auth, dashboard, emergency, common, errors)
- Locale layout dynamically sets dir="rtl" for Hebrew and dir="ltr" for English on the html element
- Root layout converted to pass-through pattern enabling locale-owned html element
- Dashboard route group created with Clerk auth guard

## Task Commits

Each task was committed atomically:

1. **Task 1: Create i18n routing config and message files** - `79a7f6a` (feat)
2. **Task 2: Create locale layout with RTL dir attribute and dashboard route group** - `9cb0fee` (feat)

**Plan metadata:** (docs commit — pending)

## Files Created/Modified
- `i18n/routing.ts` — defineRouting with locales ["he","en"], defaultLocale "he", localePrefix "always"
- `i18n/request.ts` — getRequestConfig loading locale-specific messages for SSR
- `messages/he.json` — Hebrew UI strings (65 keys across 8 namespaces)
- `messages/en.json` — English UI strings matching identical key structure
- `src/app/layout.tsx` — Updated to pass-through provider wrapper (removed html/body)
- `src/app/[locale]/layout.tsx` — Locale layout with lang, dir, suppressHydrationWarning, NextIntlClientProvider
- `src/app/[locale]/page.tsx` — Temporary landing page using useTranslations
- `src/app/[locale]/(dashboard)/layout.tsx` — Dashboard route group with Clerk auth guard

## Decisions Made
- Root `app/layout.tsx` converted to a pass-through that wraps children in ConvexClientProvider only — no html/body tags. This lets `app/[locale]/layout.tsx` own the `<html>` element so it can set `lang` and `dir` per locale. This is the official next-intl App Router pattern.
- Toaster position adapts to locale: `top-left` for RTL (Hebrew), `top-right` for LTR (English), ensuring notifications appear in the visually correct corner.
- `localePrefix: "always"` ensures all URLs have a locale prefix, avoiding ambiguous routing and enabling clean redirects from /.
- Inter font variable moved from root layout to locale layout to maintain proper scoping on the html element.

## Deviations from Plan

None - plan executed exactly as written. The root layout pass-through update was explicitly specified in Task 2 action steps.

## Issues Encountered
None - TypeScript check showed pre-existing Convex `_generated/` module errors (expected until `npx convex dev` runs), zero errors in `src/` directory.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Locale routing is fully wired: / -> /he, /he and /en both accessible
- Translation messages available for all Phase 1 UI strings
- Dashboard route group ready for the sidebar/topbar shell (Plan 01-05b)
- Both `app/layout.tsx` pass-through and `[locale]/layout.tsx` with providers are in place for all downstream plans

---
*Phase: 01-foundation*
*Completed: 2026-03-03*
