---
phase: 01-foundation
plan: 03
subsystem: auth
tags: [clerk, next-intl, rbac, middleware, proxy, typescript, nextjs]

# Dependency graph
requires:
  - phase: 01-foundation-plan-01
    provides: Next.js 16 project scaffold with @clerk/nextjs and next-intl installed
  - phase: 01-foundation-plan-02
    provides: Convex auth helpers (requireUser, requireAgent, requireAdmin) as Layer 3

provides:
  - src/proxy.ts: Clerk clerkMiddleware + next-intl intlMiddleware composed in single proxy (Layer 1)
  - src/types/globals.d.ts: TypeScript globals for Clerk session claims (CustomJwtSessionClaims, UserRole)
  - src/i18n/routing.ts: Re-export of root i18n/routing.ts enabling @/i18n/routing alias in src/ files
  - Sign-in and sign-up pages with Clerk hosted UI components and Israeli blue branding
  - (agent)/agent/layout.tsx: Layer 2 Server Component guard checking role agent|admin via auth() sessionClaims
  - (admin)/admin/layout.tsx: Layer 2 Server Component guard checking role admin via auth() sessionClaims
  - (public)/layout.tsx: Centered unauthenticated layout for landing/auth pages
  - Placeholder agent and admin portal pages

affects:
  - 01-04 (i18n routing) — uses routing config from i18n/routing.ts via @/i18n/routing
  - 01-05 (dashboard layout) — builds on (public) and (dashboard) route group pattern
  - all-phases — three-layer auth is the security model for every protected route

# Tech tracking
tech-stack:
  added: []  # All deps already installed in Plan 01-01
  patterns:
    - "Layer 1 (Middleware): src/proxy.ts clerkMiddleware + intlMiddleware composed — locale detection runs before auth.protect()"
    - "Layer 2 (Server Component): layout.tsx auth guards check sessionClaims.metadata.role and redirect on mismatch"
    - "Layer 3 (Convex): requireUser/requireAgent/requireAdmin in every mutation (established Plan 01-02)"
    - "Route groups: (public) for unauthenticated, (dashboard) for general auth, (agent) and (admin) for role-gated routes"
    - "RBAC: proxy.ts checks role from sessionClaims for route-level enforcement; layouts double-check as defense-in-depth"

key-files:
  created:
    - src/proxy.ts
    - src/types/globals.d.ts
    - src/i18n/routing.ts
    - src/app/[locale]/(public)/layout.tsx
    - src/app/[locale]/(public)/sign-in/[[...sign-in]]/page.tsx
    - src/app/[locale]/(public)/sign-up/[[...sign-up]]/page.tsx
    - src/app/[locale]/(agent)/agent/layout.tsx
    - src/app/[locale]/(agent)/agent/page.tsx
    - src/app/[locale]/(admin)/admin/layout.tsx
    - src/app/[locale]/(admin)/admin/page.tsx
  modified:
    - .env.local (added NEXT_PUBLIC_CLERK_SIGN_IN_URL and related redirect vars)

key-decisions:
  - "proxy.ts imports @/i18n/routing via src/i18n/routing.ts re-export — root i18n/routing.ts stays canonical for next.config.ts while src/ files use @/ alias"
  - "Clerk sign-in/sign-up URLs set to /sign-in and /sign-up without locale prefix — proxy.ts locale redirect handles the prefix so users land on /{locale}/sign-in"
  - "intlMiddleware called before auth.protect() — ensures locale detection fires on every request including the sign-in redirect itself"

patterns-established:
  - "Three-layer auth: Layer 1 = proxy.ts (route guard), Layer 2 = layout.tsx auth() check, Layer 3 = Convex requireUser/Agent/Admin"
  - "Route group pattern: (public) for no-auth pages, (dashboard) for authenticated, (agent)/(admin) for role-gated"
  - "Defense-in-depth: Middleware bypass (CVE-2025-29927) mitigated by redundant Server Component guards in layout.tsx"

requirements-completed: [FOUN-03, FOUN-05]

# Metrics
duration: 3min
completed: 2026-03-03
---

# Phase 1 Plan 03: Clerk Three-Layer Auth Summary

**Clerk clerkMiddleware proxy.ts composing next-intl locale routing (Layer 1), Server Component session claim guards in agent/admin layouts (Layer 2), with defense-in-depth against CVE-2025-29927 middleware bypass**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-03T15:35:59Z
- **Completed:** 2026-03-03T15:38:58Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments
- Created proxy.ts composing Clerk auth with next-intl locale detection — locale resolution runs before auth.protect() so all redirects carry the correct locale prefix
- Implemented three distinct auth layers: proxy.ts route guards (L1), layout.tsx sessionClaims checks (L2), and Convex helpers from Plan 01-02 (L3)
- Established role-based route protection: agent routes require role agent|admin, admin routes require admin, all enforced at two independent layers
- Created sign-in and sign-up pages using Clerk hosted UI components with Israeli blue (#0038b8) brand customization

## Task Commits

Each task was committed atomically:

1. **Task 1: Create proxy.ts with Clerk + next-intl middleware composition** - `3ab48d1` (feat)
2. **Task 2: Create auth pages and role-gated route layouts** - `4246c0b` (feat)

**Plan metadata:** _(created next)_

## Files Created/Modified
- `src/proxy.ts` - Clerk clerkMiddleware + next-intl intlMiddleware composition; isPublicRoute/isAgentRoute/isAdminRoute matchers; RBAC enforcement; Next.js matcher config
- `src/types/globals.d.ts` - TypeScript UserRole type (user | agent | admin) and CustomJwtSessionClaims global interface extending Clerk session claims with metadata.role
- `src/i18n/routing.ts` - Re-export of root i18n/routing.ts to enable @/i18n/routing alias in src/ files
- `src/app/[locale]/(public)/layout.tsx` - Centered layout for unauthenticated pages (no sidebar/topbar)
- `src/app/[locale]/(public)/sign-in/[[...sign-in]]/page.tsx` - Clerk SignIn component with Israeli blue appearance customization
- `src/app/[locale]/(public)/sign-up/[[...sign-up]]/page.tsx` - Clerk SignUp component with Israeli blue appearance customization
- `src/app/[locale]/(agent)/agent/layout.tsx` - Layer 2 Server Component guard: auth() sessionClaims check, redirects to / if role is not agent or admin
- `src/app/[locale]/(agent)/agent/page.tsx` - Agent Portal placeholder page
- `src/app/[locale]/(admin)/admin/layout.tsx` - Layer 2 Server Component guard: auth() sessionClaims check, redirects to / if role is not admin
- `src/app/[locale]/(admin)/admin/page.tsx` - Admin Panel placeholder page
- `.env.local` - Added NEXT_PUBLIC_CLERK_SIGN_IN_URL, SIGN_UP_URL, AFTER_SIGN_IN_URL, AFTER_SIGN_UP_URL

## Decisions Made

- **i18n routing re-export:** Root `i18n/routing.ts` stays canonical for `next.config.ts` (`createNextIntlPlugin("./i18n/request.ts")`). Created `src/i18n/routing.ts` as a re-export so proxy.ts and locale layout can use `@/i18n/routing` path alias.
- **Clerk redirect URLs without locale prefix:** Set `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in` (no locale). Proxy.ts locale redirect handles prepending `/{locale}` so users land on `/{locale}/sign-in`. Avoids hardcoding a specific locale in the Clerk dashboard config.
- **intlMiddleware called before auth.protect():** Ensures locale detection/redirect fires on every request. If auth.protect() ran first, the sign-in redirect itself would lose the locale prefix.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None — all files created and verified on first pass.

## User Setup Required

None - no external service configuration required for this plan. Clerk keys and Convex URL from Plan 01-01 are sufficient.

## Next Phase Readiness
- Three-layer auth fully wired — all routes have defense-in-depth protection
- proxy.ts ready for Plan 01-04 (i18n routing) — i18n/routing.ts already referenced and working
- Sign-in/sign-up pages ready for end-to-end auth flow testing once Clerk credentials are filled in .env.local
- Agent and admin layouts in place — Plan 01-05 can add actual dashboard content inside these route groups

---
*Phase: 01-foundation*
*Completed: 2026-03-03*

## Self-Check: PASSED

All created files verified present on disk. Both task commits verified in git log.

- FOUND: src/proxy.ts
- FOUND: src/types/globals.d.ts
- FOUND: src/i18n/routing.ts
- FOUND: src/app/[locale]/(public)/layout.tsx
- FOUND: src/app/[locale]/(public)/sign-in/[[...sign-in]]/page.tsx
- FOUND: src/app/[locale]/(public)/sign-up/[[...sign-up]]/page.tsx
- FOUND: src/app/[locale]/(agent)/agent/layout.tsx
- FOUND: src/app/[locale]/(agent)/agent/page.tsx
- FOUND: src/app/[locale]/(admin)/admin/layout.tsx
- FOUND: src/app/[locale]/(admin)/admin/page.tsx
- FOUND commit: 3ab48d1 (Task 1)
- FOUND commit: 4246c0b (Task 2)
