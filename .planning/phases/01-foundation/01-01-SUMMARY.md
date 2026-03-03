---
phase: 01-foundation
plan: 01
subsystem: ui
tags: [nextjs, tailwindcss, shadcn, clerk, convex, next-themes, rtl, typescript, next-intl]

# Dependency graph
requires: []
provides:
  - Next.js 16.1.6 project scaffolded with TypeScript and TailwindCSS v4
  - shadcn/ui initialized with RTL flag (logical CSS properties enforced from day one)
  - All Phase 1 dependencies installed (convex, clerk, next-intl, next-themes, zustand, etc.)
  - Provider hierarchy: ClerkProvider -> ConvexProviderWithClerk -> ThemeProvider
  - Root layout with suppressHydrationWarning and Toaster for toast notifications
  - Dark mode via next-themes with class-based toggling
  - cn() utility at @/lib/utils (shadcn canonical) and @/shared/lib/utils (project alias)
  - .env.example with all required environment variable placeholders documented
affects: [01-02, 01-03, 01-04, 01-05a, 01-05b, all-phases]

# Tech tracking
tech-stack:
  added:
    - next@16.1.6
    - convex + convex-helpers + @convex-dev/rate-limiter
    - "@clerk/nextjs"
    - next-intl
    - next-themes
    - zustand
    - svix
    - react-hook-form + zod + @hookform/resolvers
    - lucide-react + clsx + tailwind-merge + date-fns + sonner
    - prettier + prettier-plugin-tailwindcss
    - shadcn/ui (new-york style, RTL enabled)
  patterns:
    - RTL-safe CSS: use logical properties (ms-, me-, ps-, pe-, start-, end-, text-start, text-end) exclusively
    - Provider hierarchy must always be ClerkProvider -> ConvexProviderWithClerk -> ThemeProvider
    - Root layout is Server Component; locale/dir attributes deferred to [locale]/layout.tsx
    - cn() utility combines clsx + tailwind-merge for conditional class composition

key-files:
  created:
    - package.json
    - tsconfig.json
    - next.config.ts
    - components.json
    - src/app/globals.css
    - src/app/layout.tsx
    - src/providers/ConvexClientProvider.tsx
    - src/providers/ThemeProvider.tsx
    - src/lib/utils.ts
    - src/shared/lib/utils.ts
    - src/components/ui/ (14 shadcn components)
    - .env.example
    - .env.local
    - .prettierrc
    - .gitignore
  modified:
    - next.config.ts (added next-intl plugin + image remotePatterns)
    - src/app/layout.tsx (replaced scaffold default with Yachad provider shell)
    - .gitignore (added .env.example exclusion, convex/_generated)

key-decisions:
  - "shadcn utils kept at @/lib/utils (shadcn canonical path) to avoid breaking 14 component files; re-export added at @/shared/lib/utils for project module convention"
  - "Inter font chosen for root layout as base font (plan said Inter; Geist removed from scaffold)"
  - "next-env.d.ts excluded from git commit (already in .gitignore by Next.js scaffold)"
  - "RTL validation: animation direction classes (slide-in-from-left, etc.) are acceptable — only layout margin/padding directional utilities are forbidden"

patterns-established:
  - "RTL Pattern: All layout spacing uses logical CSS (ms-/me-/ps-/pe-/start-/end-). Animation direction utilities are exempt."
  - "Provider Pattern: ConvexClientProvider wraps all three providers in correct nesting order"
  - "Font Pattern: Inter variable font loaded in root layout via next/font/google with CSS variable"
  - "Dark Mode Pattern: ThemeProvider with attribute='class' enables CSS-class-based dark mode toggling"

requirements-completed: [FOUN-01, FOUN-06, FOUN-08]

# Metrics
duration: 5min
completed: 2026-03-03
---

# Phase 1 Plan 01: Foundation Scaffold Summary

**Next.js 16.1.6 scaffolded with RTL-safe shadcn/ui, Clerk+Convex+Theme provider hierarchy, and full Phase 1 dependency set**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-03T15:25:20Z
- **Completed:** 2026-03-03T15:29:55Z
- **Tasks:** 2
- **Files modified:** 35

## Accomplishments
- Next.js 16.1.6 project with TypeScript, TailwindCSS v4, App Router fully scaffolded
- shadcn/ui initialized with `--rtl` flag ensuring all 14 base components use logical CSS properties (no physical ml-/mr-/pl-/pr-)
- Complete Phase 1 dependency set installed: convex, @clerk/nextjs, next-intl, next-themes, zustand, react-hook-form, zod, sonner, svix, and more
- Provider hierarchy wired: ClerkProvider -> ConvexProviderWithClerk -> ThemeProvider -> children
- Root layout configured as Server Component with suppressHydrationWarning, Inter font, Toaster

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold Next.js 16 project and install all dependencies** - `f8c9e0b` (feat)
2. **Task 2: Create provider hierarchy and root layout** - `4f53036` (feat)

**Plan metadata:** _(created next)_

## Files Created/Modified
- `package.json` - Next.js 16.1.6 with all Phase 1 dependencies
- `next.config.ts` - next-intl plugin + Convex/Clerk image remotePatterns
- `components.json` - shadcn/ui config with `"rtl": true`
- `src/app/globals.css` - TailwindCSS v4 + shadcn CSS variables
- `src/app/layout.tsx` - Root layout: Inter font, ConvexClientProvider, Toaster, suppressHydrationWarning
- `src/providers/ConvexClientProvider.tsx` - Combined Clerk+Convex+Theme provider (client component)
- `src/providers/ThemeProvider.tsx` - next-themes wrapper with class-based dark mode
- `src/lib/utils.ts` - cn() utility (clsx + tailwind-merge, shadcn canonical path)
- `src/shared/lib/utils.ts` - Re-export of cn() at project module convention path
- `src/components/ui/` - 14 shadcn components (button, skeleton, sonner, dropdown-menu, sheet, sidebar, navigation-menu, tooltip, avatar, badge, separator, scroll-area, input + hooks/use-mobile)
- `.env.example` - All required env vars documented (Clerk + Convex)
- `.env.local` - Placeholder env file (gitignored, user fills in)
- `.prettierrc` - Prettier config with tailwind plugin
- `.gitignore` - Updated: .env.example excluded from ignore, convex/_generated added

## Decisions Made
- **shadcn utils path:** shadcn placed utils at `@/lib/utils` (not `@/shared/lib/utils` as planned). Kept shadcn's canonical path to avoid updating all 14 component imports; added re-export at `@/shared/lib/utils` for project convention. components.json `aliases.utils` is `@/lib/utils`.
- **RTL animation exemption:** Animation direction classes (`slide-in-from-left`, `slide-out-to-right`) are not layout utilities — they describe animation travel direction. Only layout spacing properties (margin, padding) must use logical equivalents.
- **Inter font:** Replaced Geist (scaffold default) with Inter as root base font per plan.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Used /tmp scaffold directory due to npm naming restriction**
- **Found during:** Task 1 (scaffold step)
- **Issue:** `_temp_scaffold` name rejected by npm naming restrictions (cannot start with underscore)
- **Fix:** Scaffolded into `/tmp/yachad-scaffold`, then rsync'd files to project root preserving .git and .planning
- **Files modified:** All scaffold files (equivalent outcome)
- **Verification:** Next.js 16.1.6 installed, all files present
- **Committed in:** f8c9e0b (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** No scope change — alternative scaffold method achieved identical result.

## Issues Encountered
- TypeScript node --input-type flag needed for inline node verification scripts due to Node.js v24 TypeScript-aware runtime changes

## User Setup Required

**External services require manual configuration before the app will run:**

### Clerk Setup
1. Create a Clerk application at [clerk.com](https://clerk.com)
2. Get API keys from Clerk Dashboard -> API Keys:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
3. Create a JWT template named exactly `convex`:
   - Clerk Dashboard -> JWT Templates -> New Template -> Convex
   - Set template body to: `{"metadata": "{{user.public_metadata}}"}`
4. Get the webhook signing secret after creating a webhook endpoint:
   - `CLERK_WEBHOOK_SECRET`

### Convex Setup
1. Run `npx convex dev` to create a Convex project (sets `NEXT_PUBLIC_CONVEX_URL`)
2. Get the Clerk JWT issuer URL from Clerk Dashboard -> JWT Templates -> convex -> Issuer URL:
   - `CLERK_JWT_ISSUER_DOMAIN`

Fill in all values in `.env.local`.

## Next Phase Readiness
- Foundation scaffold complete — all other Phase 1 plans can build on this base
- Provider hierarchy ready for Convex schema (Plan 01-02) and auth middleware (Plan 01-03)
- RTL enforcement established from day one — no migration needed later
- next-intl plugin configured but i18n/request.ts not yet created (Plan 01-04 creates it)

---
*Phase: 01-foundation*
*Completed: 2026-03-03*
