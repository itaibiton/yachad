---
phase: 01-foundation
plan: 05a
type: execute
wave: 3
depends_on: ["01-01", "01-03", "01-04"]
files_modified:
  - src/shared/components/sidebar/AppSidebar.tsx
  - src/shared/components/sidebar/MobileBottomNav.tsx
  - src/shared/components/sidebar/SidebarNavItem.tsx
  - src/shared/components/topbar/TopBar.tsx
  - src/shared/components/topbar/CountrySelector.tsx
  - src/shared/components/topbar/CountryOnboardingModal.tsx
  - src/shared/components/topbar/EmergencyButton.tsx
  - src/shared/components/topbar/LanguageToggle.tsx
  - src/shared/components/topbar/ThemeToggle.tsx
  - src/shared/components/topbar/NotificationBell.tsx
  - src/shared/components/topbar/ProfileMenu.tsx
  - src/shared/components/topbar/SearchButton.tsx
  - src/shared/components/DashboardShell.tsx
  - src/shared/components/ErrorBoundary.tsx
  - src/shared/components/LoadingSkeleton.tsx
  - src/stores/appStore.ts
autonomous: true
requirements:
  - FOUN-09
  - FOUN-10

must_haves:
  truths:
    - "Dashboard renders with a sidebar showing 7 module navigation links in crisis priority order"
    - "On mobile (< 768px), sidebar is hidden and bottom tab navigation appears"
    - "Top bar displays: Yachad logo, search icon, country selector, emergency button, language toggle, notifications, profile"
    - "Emergency button opens a dropdown with 4 options: Call Embassy, Share Location, Emergency Chat, Report Danger"
    - "Dark mode toggles and persists across page refreshes"
    - "Language toggle switches between Hebrew and English, updating dir and all text"
    - "Emergency FAB (floating action button) appears on mobile in red"
    - "On first login (no country stored in appStore), a modal prompts 'Where are you right now?' with auto-detect via IP geolocation and manual country override"
    - "Error boundary catches errors and displays user-friendly bilingual messages"
    - "Skeleton loading components exist for all data-fetching patterns"
  artifacts:
    - path: "src/shared/components/DashboardShell.tsx"
      provides: "Main dashboard layout composing sidebar + top bar + content area"
      min_lines: 40
    - path: "src/shared/components/sidebar/AppSidebar.tsx"
      provides: "Desktop sidebar with 7 module links"
      min_lines: 50
    - path: "src/shared/components/sidebar/MobileBottomNav.tsx"
      provides: "Mobile bottom tab navigation"
      min_lines: 30
    - path: "src/shared/components/topbar/EmergencyButton.tsx"
      provides: "Emergency button with dropdown menu"
      contains: "DropdownMenu"
    - path: "src/shared/components/topbar/CountrySelector.tsx"
      provides: "Country selection dropdown"
      min_lines: 20
    - path: "src/shared/components/topbar/CountryOnboardingModal.tsx"
      provides: "First-login onboarding modal with IP geolocation auto-detect"
      contains: "useAppStore"
    - path: "src/shared/components/ErrorBoundary.tsx"
      provides: "Error boundary with bilingual error messages"
      contains: "useTranslations"
    - path: "src/shared/components/LoadingSkeleton.tsx"
      provides: "Reusable skeleton screen components"
      contains: "Skeleton"
    - path: "src/stores/appStore.ts"
      provides: "Zustand persisted store for client-side UI state"
      contains: "persist"
  key_links:
    - from: "src/shared/components/DashboardShell.tsx"
      to: "src/shared/components/sidebar/AppSidebar.tsx"
      via: "renders sidebar for desktop"
      pattern: "AppSidebar"
    - from: "src/shared/components/DashboardShell.tsx"
      to: "src/shared/components/topbar/TopBar.tsx"
      via: "renders top bar above content"
      pattern: "TopBar"
    - from: "src/shared/components/topbar/EmergencyButton.tsx"
      to: "shadcn/ui DropdownMenu"
      via: "renders emergency options in dropdown"
      pattern: "DropdownMenu"
    - from: "src/shared/components/topbar/LanguageToggle.tsx"
      to: "i18n/routing.ts"
      via: "useRouter from next-intl/navigation"
      pattern: "useRouter"
    - from: "src/shared/components/topbar/TopBar.tsx"
      to: "src/shared/components/topbar/CountrySelector.tsx"
      via: "renders CountrySelector in top bar end section"
      pattern: "CountrySelector"
    - from: "src/shared/components/topbar/CountryOnboardingModal.tsx"
      to: "src/stores/appStore.ts"
      via: "useAppStore to check/set selectedCountry"
      pattern: "useAppStore"
---

<objective>
Build all shared dashboard components: sidebar, top bar with all controls, mobile bottom nav, emergency button, country selector with first-login onboarding modal, error boundary, and skeleton loading components.

Purpose: Create the reusable UI components that form the dashboard shell. These are all shared components that Plan 01-05b will wire into the actual dashboard layout and pages.
Output: All shared components exist and export correctly. Country onboarding modal implements the CONTEXT.md decision for first-login geolocation prompt.
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

Depends on Plan 01-01 (shadcn/ui components, providers), Plan 01-03 (auth), Plan 01-04 (i18n, locale layout).

<interfaces>
From messages/he.json and messages/en.json (created in Plan 01-04):
- nav.home, nav.flights, nav.news, nav.map, nav.feed, nav.chat, nav.reservations
- topbar.search, topbar.country, topbar.emergency, topbar.language, topbar.notifications, topbar.profile
- emergency.title, emergency.callEmbassy, emergency.shareLocation, emergency.emergencyChat, emergency.reportDanger
- country.selectTitle, country.selectDescription, country.autoDetect, country.changeAnytime
- common.loading, common.error, common.retry
- errors.generic, errors.notFound, errors.unauthorized, errors.networkError

shadcn/ui components available (from Plan 01-01):
- Button, Skeleton, DropdownMenu, Sheet, Sidebar, NavigationMenu, Tooltip, Avatar, Badge, Separator, ScrollArea

From src/providers/ConvexClientProvider.tsx (Plan 01-01):
- ThemeProvider wraps the app with attribute="class"

From i18n/routing.ts (Plan 01-04):
- routing config with locales ["he", "en"], defaultLocale "he"
- useRouter and usePathname from next-intl/navigation for locale switching
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Build Zustand store and sidebar components</name>
  <files>
    src/stores/appStore.ts
    src/shared/components/sidebar/SidebarNavItem.tsx
    src/shared/components/sidebar/AppSidebar.tsx
    src/shared/components/sidebar/MobileBottomNav.tsx
  </files>
  <action>
ALL components must use logical CSS properties (ms-, me-, ps-, pe-, start-, end-). ZERO physical directional utilities (ml-, mr-, pl-, pr-, left-, right-). This is a non-negotiable constraint from research.

Brand colors per CONTEXT.md:
- Primary: Israeli blue #0038b8 (add to Tailwind theme via CSS variables in globals.css if not already present)
- Emergency: Red (use destructive variant)
- UI feel: Warm, community, friendly, rounded corners

1. Create src/stores/appStore.ts (Zustand store for client-side UI state):
   ```typescript
   import { create } from "zustand";
   import { persist } from "zustand/middleware";

   interface AppState {
     selectedCountry: string | null;
     hasCompletedOnboarding: boolean;
     sidebarCollapsed: boolean;
     setSelectedCountry: (country: string) => void;
     completeOnboarding: () => void;
     toggleSidebar: () => void;
   }

   export const useAppStore = create<AppState>()(
     persist(
       (set) => ({
         selectedCountry: null,
         hasCompletedOnboarding: false,
         sidebarCollapsed: false,
         setSelectedCountry: (country) => set({ selectedCountry: country }),
         completeOnboarding: () => set({ hasCompletedOnboarding: true }),
         toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
       }),
       { name: "yachad-app-state" }
     )
   );
   ```

2. Create src/shared/components/sidebar/SidebarNavItem.tsx ("use client"):
   - Props: href (string), icon (LucideIcon), label (string), active (boolean)
   - Use shadcn Button variant="ghost" for the nav item
   - Use `usePathname()` from next/navigation to detect active state
   - Apply active styling with brand blue accent
   - Use logical properties for all spacing (ps-3, pe-3, ms-2, etc.)
   - Use `Link` from next-intl (import { Link } from "@/i18n/routing" or next-intl's navigation)

3. Create src/shared/components/sidebar/AppSidebar.tsx ("use client"):
   - Use shadcn Sidebar component as the base
   - Module order per CONTEXT.md: Home (overview), Flights, News, Map, Feed, Chat, Reservations
   - Icons from lucide-react: Home, Plane, Newspaper, MapPin, Users, MessageSquare, Hotel
   - Icon + label display, collapsible to icons-only (per CONTEXT.md)
   - Use useAppStore for sidebar collapsed state
   - Hidden on mobile (below md breakpoint) -- mobile uses bottom nav instead
   - Add Yachad logo at top of sidebar

4. Create src/shared/components/sidebar/MobileBottomNav.tsx ("use client"):
   - Bottom tab navigation visible ONLY on mobile (below md breakpoint, hidden on md+)
   - Shows top 5-6 module icons as tabs (Home, Flights, News, Map, Feed, Chat)
   - WhatsApp/Instagram style bottom tabs with active indicator
   - Fixed position at bottom of viewport
   - Use safe-area-inset-bottom for notched phones

CRITICAL CONSTRAINTS:
- ALL spacing uses logical properties: ps-, pe-, ms-, me-, start-, end-
- NO physical directional: ml-, mr-, pl-, pr-, left-, right-, text-left, text-right
- Use rounded-lg or rounded-xl for the warm/friendly feel
- Use font-sans (Inter) as base font
- Ensure all interactive elements have appropriate hover/focus states
- All text uses useTranslations() from next-intl -- NO hardcoded strings
  </action>
  <verify>
    <automated>cd /Users/Kohelet/Code/yachad-global && test -f src/stores/appStore.ts && test -f src/shared/components/sidebar/SidebarNavItem.tsx && test -f src/shared/components/sidebar/AppSidebar.tsx && test -f src/shared/components/sidebar/MobileBottomNav.tsx && echo "Store and sidebar components exist" && grep -q "hasCompletedOnboarding" src/stores/appStore.ts && echo "Onboarding state in store" && grep -q "persist" src/stores/appStore.ts && echo "Zustand persist configured" && ! grep -rn "ml-\|mr-\|pl-\|pr-\| left-\| right-\|text-left\|text-right" src/shared/components/sidebar/ --include="*.tsx" 2>/dev/null && echo "No physical CSS directional classes in sidebar"</automated>
  </verify>
  <done>Zustand store created with selectedCountry, hasCompletedOnboarding, and sidebarCollapsed state. Sidebar components (AppSidebar, SidebarNavItem, MobileBottomNav) built with 7 module links in crisis priority order. No physical directional CSS utilities used.</done>
</task>

<task type="auto">
  <name>Task 2: Build top bar components and DashboardShell</name>
  <files>
    src/shared/components/topbar/SearchButton.tsx
    src/shared/components/topbar/CountrySelector.tsx
    src/shared/components/topbar/CountryOnboardingModal.tsx
    src/shared/components/topbar/EmergencyButton.tsx
    src/shared/components/topbar/LanguageToggle.tsx
    src/shared/components/topbar/ThemeToggle.tsx
    src/shared/components/topbar/NotificationBell.tsx
    src/shared/components/topbar/ProfileMenu.tsx
    src/shared/components/topbar/TopBar.tsx
    src/shared/components/DashboardShell.tsx
  </files>
  <action>
ALL components must use logical CSS properties (ms-, me-, ps-, pe-, start-, end-). ZERO physical directional utilities (ml-, mr-, pl-, pr-, left-, right-). This is a non-negotiable constraint from research.

1. Create src/shared/components/topbar/SearchButton.tsx ("use client"):
   - Search icon that expands to a search input on click (per CONTEXT.md)
   - For now, just the expand/collapse UI. Actual search functionality is per-module in later phases.

2. Create src/shared/components/topbar/CountrySelector.tsx ("use client"):
   - Dropdown showing country name and flag emoji
   - Uses useAppStore for selected country
   - List of key countries where Israelis might be stranded (top 30)
   - Shows "Select country" prompt if none selected
   - Renders CountryOnboardingModal when hasCompletedOnboarding is false in useAppStore

3. Create src/shared/components/topbar/CountryOnboardingModal.tsx ("use client"):
   CRITICAL — This implements the CONTEXT.md locked decision: "Onboarding step on first login: 'Where are you right now?' with auto-detect via IP geolocation + manual override"
   - Modal dialog that appears on first authenticated visit (when useAppStore.hasCompletedOnboarding === false)
   - Title: uses country.selectTitle translation ("Where are you now?" / "היכן אתה עכשיו?")
   - Subtitle: uses country.selectDescription translation
   - Auto-detect section:
     - On mount, call a free IP geolocation API (e.g., fetch("https://ipapi.co/json/") or "https://ip-api.com/json/")
     - Display the detected country with flag emoji and a "Use this location" button
     - Show loading state while detecting
     - Handle API failure gracefully (skip auto-detect, show manual selection only)
   - Manual override section:
     - Searchable country list (same top 30 countries as CountrySelector)
     - User can select a different country than auto-detected
   - On confirm:
     - Call useAppStore.setSelectedCountry(country)
     - Call useAppStore.completeOnboarding()
     - Modal closes
   - Use shadcn Dialog component for the modal
   - Use country.changeAnytime translation to reassure user they can change later
   - Modal is NOT dismissable without selecting a country (no close button, no backdrop dismiss)

4. Create src/shared/components/topbar/EmergencyButton.tsx ("use client"):
   - CRITICAL: Always accessible from every screen (per CONTEXT.md)
   - Desktop: Red icon button in top bar that opens a DropdownMenu
   - Mobile: Red floating action button (FAB) in addition to top bar icon
   - Dropdown options (per CONTEXT.md):
     - Call Embassy (phone icon, opens tel: link based on country)
     - Share Location (map-pin icon, uses navigator.share or copies coordinates)
     - Emergency Chat (message-circle icon, navigates to emergency chat room)
     - Report Danger (alert-triangle icon, opens report modal placeholder)
   - Use shadcn DropdownMenu for the menu
   - Red/destructive color treatment that stands out
   - The FAB on mobile should use fixed positioning with bottom-20 (above the bottom nav) and end-4 (logical property)

5. Create src/shared/components/topbar/LanguageToggle.tsx ("use client"):
   - Toggle button between Hebrew (he) and English (en)
   - Uses useRouter from next-intl/navigation (import from "@/i18n/routing" or "next-intl/navigation") and usePathname to switch locale
   - Shows current locale abbreviation (עב / EN)
   - On click, navigates to the same page with the alternate locale

6. Create src/shared/components/topbar/ThemeToggle.tsx ("use client"):
    - Import useTheme from next-themes
    - Cycle through: system -> light -> dark
    - Show Sun/Moon/Monitor icon based on current theme
    - Use shadcn Button variant="ghost" size="icon"

7. Create src/shared/components/topbar/NotificationBell.tsx ("use client"):
    - Bell icon with optional badge count
    - For now, static (no notification system yet -- that's v2)
    - Click opens a placeholder dropdown "Coming soon"

8. Create src/shared/components/topbar/ProfileMenu.tsx ("use client"):
    - User avatar (from Clerk) + dropdown menu
    - Import UserButton from @clerk/nextjs OR build custom with useUser()
    - Menu items: Profile, Settings, Sign Out
    - Use shadcn DropdownMenu

9. Create src/shared/components/topbar/TopBar.tsx ("use client"):
    - Compose all top bar components in order per CONTEXT.md:
      - Start: Yachad logo + SearchButton
      - End: CountrySelector, EmergencyButton, LanguageToggle, NotificationBell, ProfileMenu
    - Use flex with justify-between, items-center
    - Sticky/fixed at top
    - Responsive -- some items may collapse to a "more" menu on very small screens

10. Create src/shared/components/DashboardShell.tsx:
    - Compose AppSidebar (desktop) + TopBar + main content area + MobileBottomNav (mobile)
    - Main content area uses flex-1 with overflow-y-auto
    - Sidebar on the start side (automatically correct for RTL via logical properties)
    - Layout structure:
      ```
      <div className="flex min-h-screen">
        <AppSidebar />  {/* Hidden on mobile */}
        <div className="flex flex-1 flex-col">
          <TopBar />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            {children}
          </main>
        </div>
        <MobileBottomNav />  {/* Hidden on desktop */}
        <EmergencyFAB />  {/* Mobile-only floating button */}
      </div>
      ```

CRITICAL CONSTRAINTS:
- ALL spacing uses logical properties: ps-, pe-, ms-, me-, start-, end-
- NO physical directional: ml-, mr-, pl-, pr-, left-, right-, text-left, text-right
- Use rounded-lg or rounded-xl for the warm/friendly feel
- Use font-sans (Inter) as base font
- Ensure all interactive elements have appropriate hover/focus states
- All text uses useTranslations() from next-intl -- NO hardcoded strings
  </action>
  <verify>
    <automated>cd /Users/Kohelet/Code/yachad-global && test -f src/shared/components/DashboardShell.tsx && test -f src/shared/components/topbar/TopBar.tsx && test -f src/shared/components/topbar/EmergencyButton.tsx && test -f src/shared/components/topbar/CountrySelector.tsx && test -f src/shared/components/topbar/CountryOnboardingModal.tsx && test -f src/shared/components/topbar/LanguageToggle.tsx && test -f src/shared/components/topbar/ThemeToggle.tsx && test -f src/shared/components/topbar/SearchButton.tsx && test -f src/shared/components/topbar/NotificationBell.tsx && test -f src/shared/components/topbar/ProfileMenu.tsx && echo "All top bar and shell components exist" && grep -q "ipapi\|ip-api\|geolocation" src/shared/components/topbar/CountryOnboardingModal.tsx && echo "IP geolocation present" && grep -q "CountrySelector" src/shared/components/topbar/TopBar.tsx && echo "TopBar renders CountrySelector" && ! grep -rn "ml-\|mr-\|pl-\|pr-\| left-\| right-\|text-left\|text-right" src/shared/components/topbar/ src/shared/components/DashboardShell.tsx --include="*.tsx" 2>/dev/null && echo "No physical CSS directional classes found"</automated>
  </verify>
  <done>All top bar components built (SearchButton, CountrySelector, CountryOnboardingModal, EmergencyButton, LanguageToggle, ThemeToggle, NotificationBell, ProfileMenu, TopBar). DashboardShell composes sidebar + top bar + content + mobile nav. Country onboarding modal implements first-login geolocation prompt per CONTEXT.md locked decision. No physical directional CSS utilities used.</done>
</task>

<task type="auto">
  <name>Task 3: Build error boundary and skeleton loading components</name>
  <files>
    src/shared/components/ErrorBoundary.tsx
    src/shared/components/LoadingSkeleton.tsx
  </files>
  <action>
1. Create src/shared/components/ErrorBoundary.tsx:
   - A reusable error boundary component that catches React errors
   - Uses useTranslations("errors") from next-intl for bilingual error messages
   - Displays a friendly error card with:
     - Error icon (AlertTriangle from lucide-react)
     - Error message in current language
     - "Try Again" button that calls reset()
   - Warm, non-scary design (per brand guidelines -- community feel)
   - For the App Router error.tsx convention: create a "use client" component that receives { error, reset } props

2. Create src/shared/components/LoadingSkeleton.tsx:
   - Export multiple skeleton variants:
     - CardSkeleton: Rectangle with shimmer for card-shaped content
     - ListSkeleton: Multiple rows of skeleton lines
     - PageSkeleton: Full page loading state with header + content area skeletons
     - SidebarSkeleton: Navigation item-shaped skeletons
     - FlightCardSkeleton: Skeleton matching the flight card shape (for Phase 2)
     - PostSkeleton: Skeleton matching the feed post shape (for Phase 6)
   - Use shadcn Skeleton component as the primitive
   - All skeletons use logical properties

CRITICAL CONSTRAINTS:
- ALL spacing uses logical properties: ps-, pe-, ms-, me-, start-, end-
- NO physical directional: ml-, mr-, pl-, pr-, left-, right-, text-left, text-right
  </action>
  <verify>
    <automated>cd /Users/Kohelet/Code/yachad-global && test -f src/shared/components/ErrorBoundary.tsx && test -f src/shared/components/LoadingSkeleton.tsx && echo "Error/loading components exist" && grep -q "useTranslations" src/shared/components/ErrorBoundary.tsx && echo "ErrorBoundary uses i18n" && grep -q "Skeleton" src/shared/components/LoadingSkeleton.tsx && echo "LoadingSkeleton uses shadcn Skeleton"</automated>
  </verify>
  <done>Error boundary displays bilingual error messages with retry. Skeleton loading components exist for cards, lists, pages, sidebar, flight cards, and posts.</done>
</task>

</tasks>

<verification>
1. DashboardShell composes sidebar + top bar + content area + mobile bottom nav
2. Sidebar shows 7 modules in crisis priority order with correct icons
3. Emergency button has dropdown with 4 options and mobile FAB
4. Dark mode toggles (ThemeToggle using next-themes)
5. Language toggle switches locale via next-intl useRouter
6. Country onboarding modal appears on first login with IP geolocation auto-detect
7. Country onboarding modal requires country selection (not dismissable without it)
8. Skeleton screens use shadcn Skeleton component
9. Error boundary uses next-intl translations
10. No physical directional CSS utilities in any component
11. useAppStore has selectedCountry, hasCompletedOnboarding, and sidebarCollapsed state
</verification>

<success_criteria>
- All shared dashboard components export correctly and compile
- Country onboarding modal implements CONTEXT.md decision (first-login geolocation prompt)
- Emergency button is always accessible (top bar + mobile FAB)
- Dark mode and language switching components work
- RTL-safe: zero physical CSS directional utilities
- Error boundary and skeleton loading components exist with all variants
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation/01-05a-SUMMARY.md`
</output>
