---
phase: 01-foundation
plan: 05b
type: execute
wave: 4
depends_on: ["01-04", "01-05a"]
files_modified:
  - src/app/[locale]/(dashboard)/layout.tsx
  - src/app/[locale]/(dashboard)/page.tsx
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
  - src/app/[locale]/error.tsx
  - src/app/[locale]/loading.tsx
  - src/app/[locale]/not-found.tsx
autonomous: false
requirements:
  - FOUN-12
  - FOUN-13
# scope_exemption: Task 2 creates 18 files (6 modules x 3 files: page/error/loading)
# but complexity is O(1) per module — same 3-file template pattern repeated 6 times.
# Each file is a minimal stub (5-15 lines). Not 23 unique implementations.

must_haves:
  truths:
    - "Dashboard layout wraps all authenticated pages in DashboardShell"
    - "All module pages show skeleton loading states while data is loading"
    - "Error boundary catches errors and displays user-friendly bilingual messages"
    - "Layout is fully responsive: sidebar on desktop, bottom nav on mobile"
    - "Overview home page shows summary card grid for 4 categories"
    - "All 7 module routes have placeholder pages"
  artifacts:
    - path: "src/app/[locale]/(dashboard)/layout.tsx"
      provides: "Dashboard layout wrapping children in DashboardShell with auth guard"
      contains: "DashboardShell"
    - path: "src/app/[locale]/(dashboard)/page.tsx"
      provides: "Overview home page with summary cards"
      contains: "useTranslations"
    - path: "src/app/[locale]/error.tsx"
      provides: "Locale-level error boundary page"
      contains: "ErrorBoundary"
    - path: "src/app/[locale]/loading.tsx"
      provides: "Locale-level loading skeleton page"
      contains: "PageSkeleton"
    - path: "src/app/[locale]/not-found.tsx"
      provides: "Bilingual 404 page"
      contains: "notFound"
  key_links:
    - from: "src/app/[locale]/(dashboard)/layout.tsx"
      to: "src/shared/components/DashboardShell.tsx"
      via: "imports and renders DashboardShell wrapping children"
      pattern: "DashboardShell"
    - from: "src/app/[locale]/(dashboard)/page.tsx"
      to: "next-intl"
      via: "useTranslations for dashboard card titles"
      pattern: "useTranslations"
    - from: "src/app/[locale]/error.tsx"
      to: "src/shared/components/ErrorBoundary.tsx"
      via: "renders ErrorBoundary component"
      pattern: "ErrorBoundary"
---

<objective>
Wire the dashboard layout with DashboardShell, create the overview home page with summary cards, create all 7 module placeholder pages, and add error/loading pages at locale and per-module levels.

Purpose: Connect the shared components from Plan 01-05a into the actual page tree. After this plan, every route renders within the dashboard shell and has proper error/loading handling.
Output: A navigable dashboard where all 7 module routes render placeholder pages within the DashboardShell, with error boundaries and loading skeletons at every route level.
</objective>

<execution_context>
@/Users/Kohelet/.claude/get-shit-done/workflows/execute-plan.md
@/Users/Kohelet/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/01-foundation/01-RESEARCH.md
@.planning/phases/01-foundation/01-CONTEXT.md
@.planning/phases/01-foundation/01-01-SUMMARY.md
@.planning/phases/01-foundation/01-03-SUMMARY.md
@.planning/phases/01-foundation/01-04-SUMMARY.md
@.planning/phases/01-foundation/01-05a-SUMMARY.md

Depends on Plan 01-04 (i18n, locale layout) and Plan 01-05a (all shared components).

<interfaces>
From src/shared/components/DashboardShell.tsx (created in Plan 01-05a):
```typescript
export function DashboardShell({ children }: { children: React.ReactNode }): JSX.Element;
```

From src/shared/components/ErrorBoundary.tsx (created in Plan 01-05a):
```typescript
// "use client" component accepting { error, reset } props for App Router error.tsx
export function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }): JSX.Element;
```

From src/shared/components/LoadingSkeleton.tsx (created in Plan 01-05a):
```typescript
export function PageSkeleton(): JSX.Element;
export function CardSkeleton(): JSX.Element;
export function ListSkeleton(): JSX.Element;
```

From messages/he.json and messages/en.json (created in Plan 01-04):
- dashboard.title, dashboard.latestFlights, dashboard.urgentAlerts, dashboard.recentPosts, dashboard.nearbyServices
- dashboard.noFlights, dashboard.noAlerts, dashboard.noPosts, dashboard.noServices
- nav.home, nav.flights, nav.news, nav.map, nav.feed, nav.chat, nav.reservations
- errors.generic, errors.notFound
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Wire dashboard layout and create overview home page</name>
  <files>
    src/app/[locale]/(dashboard)/layout.tsx
    src/app/[locale]/(dashboard)/page.tsx
    src/app/[locale]/error.tsx
    src/app/[locale]/loading.tsx
    src/app/[locale]/not-found.tsx
  </files>
  <action>
1. Update src/app/[locale]/(dashboard)/layout.tsx:
   - Import DashboardShell from @/shared/components/DashboardShell
   - Import auth from @clerk/nextjs/server
   - Check authentication (redirect to sign-in if not authenticated)
   - Wrap children in DashboardShell:
     ```typescript
     import { auth } from "@clerk/nextjs/server";
     import { redirect } from "next/navigation";
     import { DashboardShell } from "@/shared/components/DashboardShell";

     export default async function DashboardLayout({
       children,
       params,
     }: {
       children: React.ReactNode;
       params: Promise<{ locale: string }>;
     }) {
       const { userId } = await auth();
       const { locale } = await params;

       if (!userId) {
         redirect(`/${locale}/sign-in`);
       }

       return <DashboardShell>{children}</DashboardShell>;
     }
     ```

2. Create src/app/[locale]/(dashboard)/page.tsx (Overview Home per CONTEXT.md):
   - Home page is an overview dashboard with summary cards (per CONTEXT.md)
   - Cards for: Latest Flights, Urgent Alerts, Recent Posts, Nearby Services
   - Each card shows a placeholder/skeleton state since no data exists yet
   - Use useTranslations("dashboard") for all text
   - Grid layout: 2 columns on desktop, 1 on mobile
   - Each card: rounded-xl, shadow-sm, warm styling
   - Each card has its module icon and "no data" message from translations
   - Use logical CSS properties only

3. Create src/app/[locale]/error.tsx ("use client"):
   - Import and render ErrorBoundary from @/shared/components/ErrorBoundary
   - Receives error and reset props from Next.js
   - Logs error to console (error reporting integration is future)

4. Create src/app/[locale]/loading.tsx:
   - Import and render PageSkeleton from @/shared/components/LoadingSkeleton
   - Shows full-page skeleton loading state

5. Create src/app/[locale]/not-found.tsx:
   - Bilingual "Page not found" message using useTranslations("errors")
   - Link to navigate back to home
   - Friendly, warm design consistent with brand

CRITICAL: All text must use useTranslations() -- no hardcoded strings.
  </action>
  <verify>
    <automated>cd /Users/Kohelet/Code/yachad-global && grep -q "DashboardShell" "src/app/[locale]/(dashboard)/layout.tsx" && echo "Dashboard layout uses shell" && test -f "src/app/[locale]/(dashboard)/page.tsx" && echo "Dashboard home exists" && test -f "src/app/[locale]/error.tsx" && test -f "src/app/[locale]/loading.tsx" && test -f "src/app/[locale]/not-found.tsx" && echo "Error/loading/not-found pages exist"</automated>
  </verify>
  <done>Dashboard layout wraps all authenticated pages in DashboardShell. Overview home shows summary card grid. Error, loading, and not-found pages exist at locale level.</done>
</task>

<task type="auto" template-boilerplate="true">
  <!-- scope_exemption: 18 files = 6 modules x 3 identical-pattern files (page/error/loading).
       Each file is a minimal stub (5-15 lines) following the same template.
       Complexity is O(1) per module, not O(n) unique implementations. -->
  <name>Task 2: Create all module placeholder pages with per-module error and loading files</name>
  <files>
    src/app/[locale]/(dashboard)/flights/page.tsx
    src/app/[locale]/(dashboard)/flights/error.tsx
    src/app/[locale]/(dashboard)/flights/loading.tsx
    src/app/[locale]/(dashboard)/news/page.tsx
    src/app/[locale]/(dashboard)/news/error.tsx
    src/app/[locale]/(dashboard)/news/loading.tsx
    src/app/[locale]/(dashboard)/map/page.tsx
    src/app/[locale]/(dashboard)/map/error.tsx
    src/app/[locale]/(dashboard)/map/loading.tsx
    src/app/[locale]/(dashboard)/feed/page.tsx
    src/app/[locale]/(dashboard)/feed/error.tsx
    src/app/[locale]/(dashboard)/feed/loading.tsx
    src/app/[locale]/(dashboard)/chat/page.tsx
    src/app/[locale]/(dashboard)/chat/error.tsx
    src/app/[locale]/(dashboard)/chat/loading.tsx
    src/app/[locale]/(dashboard)/reservations/page.tsx
    src/app/[locale]/(dashboard)/reservations/error.tsx
    src/app/[locale]/(dashboard)/reservations/loading.tsx
  </files>
  <action>
1. Create 6 module placeholder pages (each in its own directory):
   - src/app/[locale]/(dashboard)/flights/page.tsx
   - src/app/[locale]/(dashboard)/news/page.tsx
   - src/app/[locale]/(dashboard)/map/page.tsx
   - src/app/[locale]/(dashboard)/feed/page.tsx
   - src/app/[locale]/(dashboard)/chat/page.tsx
   - src/app/[locale]/(dashboard)/reservations/page.tsx

   Each placeholder page:
   - Uses useTranslations("nav") for the module name
   - Shows a card with the module icon (from lucide-react) and "Coming in Phase X" message
   - Uses the correct lucide icon: Plane (flights), Newspaper (news), MapPin (map), Users (feed), MessageSquare (chat), Hotel (reservations)
   - Warm, rounded-xl card styling
   - All text via i18n translations -- no hardcoded strings

2. Create per-module error.tsx files for each of the 6 module directories:
   - Each is a "use client" component that imports and re-exports ErrorBoundary from @/shared/components/ErrorBoundary
   - Receives { error, reset } props from Next.js
   - This provides per-module error isolation (an error in flights doesn't crash chat)

3. Create per-module loading.tsx files for each of the 6 module directories:
   - Each imports the appropriate skeleton variant from @/shared/components/LoadingSkeleton
   - flights/loading.tsx -> FlightCardSkeleton or CardSkeleton
   - news/loading.tsx -> ListSkeleton
   - map/loading.tsx -> PageSkeleton
   - feed/loading.tsx -> PostSkeleton or ListSkeleton
   - chat/loading.tsx -> ListSkeleton
   - reservations/loading.tsx -> CardSkeleton

CRITICAL: All text must use useTranslations() -- no hardcoded strings.
  </action>
  <verify>
    <automated>cd /Users/Kohelet/Code/yachad-global && test -f "src/app/[locale]/(dashboard)/flights/page.tsx" && test -f "src/app/[locale]/(dashboard)/flights/error.tsx" && test -f "src/app/[locale]/(dashboard)/flights/loading.tsx" && test -f "src/app/[locale]/(dashboard)/news/page.tsx" && test -f "src/app/[locale]/(dashboard)/map/page.tsx" && test -f "src/app/[locale]/(dashboard)/feed/page.tsx" && test -f "src/app/[locale]/(dashboard)/chat/page.tsx" && test -f "src/app/[locale]/(dashboard)/reservations/page.tsx" && test -f "src/app/[locale]/(dashboard)/reservations/error.tsx" && test -f "src/app/[locale]/(dashboard)/reservations/loading.tsx" && echo "All module placeholders with error/loading exist"</automated>
  </verify>
  <done>All 6 module routes have placeholder pages with correct icons. Each module has its own error.tsx and loading.tsx for isolated error handling and loading states.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 3: Verify dashboard shell, RTL, dark mode, and responsive layout</name>
  <files>No files modified — visual verification only</files>
  <action>
    This is a human verification checkpoint. The user visually inspects the running application.

    What was built (across Plans 01-05a and 01-05b):
    - Complete dashboard shell with sidebar (7 module links, desktop), bottom tab nav (mobile)
    - Top bar with all controls (search, country, emergency, language, theme, notifications, profile)
    - Country onboarding modal on first login with IP geolocation auto-detect
    - Emergency button dropdown + mobile FAB
    - Dark mode toggle, language switcher (Hebrew RTL / English LTR)
    - Skeleton loading states, error boundary, overview home, all 7 module placeholders

    How to verify:
    1. Run `npm run dev` and open http://localhost:3000
    2. Verify redirect to /he (Hebrew default)
    3. Sign in with a test Clerk account
    4. Verify the country onboarding modal appears on first login ("Where are you now?") with auto-detected location
    5. Select a country and confirm -- modal closes and country shows in top bar
    6. Verify the dashboard shell renders: sidebar on desktop with 7 modules in order (Home, Flights, News, Map, Feed, Chat, Reservations), top bar with all controls
    7. Click emergency button -- verify dropdown with 4 options
    8. Click language toggle -- verify switch to English, layout to LTR
    9. Click theme toggle -- verify dark mode activates, persists on refresh
    10. Resize to mobile (375px): sidebar hides, bottom nav appears, red emergency FAB appears
    11. Navigate to each module page -- verify placeholder renders
    12. Check no visual broken layout in RTL mode
  </action>
  <verify>
    <automated>cd /Users/Kohelet/Code/yachad-global && npm run build 2>&1 | tail -5</automated>
  </verify>
  <done>User has visually confirmed: dashboard shell renders correctly in both RTL/LTR, country onboarding works, dark mode works, emergency button accessible, mobile layout correct, all module routes reachable</done>
</task>

</tasks>

<verification>
1. Dashboard layout imports and renders DashboardShell
2. Overview home page has 4 summary cards with i18n translations
3. All 6 module routes have placeholder pages with correct icons
4. Each module has error.tsx and loading.tsx for per-module error isolation
5. Locale-level error.tsx, loading.tsx, and not-found.tsx exist
6. All text uses useTranslations() -- no hardcoded strings
7. No physical directional CSS utilities in any page component
</verification>

<success_criteria>
- Dashboard layout wraps all pages in DashboardShell with auth guard
- Overview home renders 4 summary cards
- All 7 module routes are navigable with placeholder content
- Error boundaries at locale and per-module level catch and display errors
- Loading skeletons render at locale and per-module level
- 404 page is bilingual
- Zero physical CSS directional utilities
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation/01-05b-SUMMARY.md`
</output>
