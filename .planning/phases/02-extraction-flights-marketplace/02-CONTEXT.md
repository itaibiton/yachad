# Phase 2: Extraction Flights Marketplace - Context

**Gathered:** 2026-03-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can browse, search, and filter extraction flights, read all listing details, and initiate contact with verified agents. This is the core crisis capability — the #1 reason users open the app. No flight creation (Phase 3), no admin approval workflows (Phase 9).

</domain>

<decisions>
## Implementation Decisions

### Flight card layout
- Full cards showing all key info at a glance — no click needed for essentials
- Each card displays: departure/destination with country flags, date/time, seats left, price per seat with currency, status badge (available/full/cancelled), urgency badge for flights departing within 24h, agent name with verified badge
- Two-column grid on desktop, single column on mobile
- WhatsApp contact button directly on card for one-tap access
- Tapping the card body opens a slide-over detail panel (Sheet component) with full description, agent profile, all contact options

### Urgency treatment
- Flights departing within 24 hours: pinned to top of results regardless of sort order
- Red/orange urgency banner strip at top of card with countdown text (e.g., "Departs in 8 hours")
- Maximum visual priority — impossible to miss in the grid

### Filter & search UX
- Horizontal sticky filter bar at top of flights list, always visible
- Dropdowns: departure country, destination, date range, seat availability
- Sort control: default to soonest departure; other options available
- Departure country auto-populates from user's selected country (useAppStore().selectedCountry) — user can clear or change
- Type filter chip: All / Flights Only / Packages Only
- Mobile: scrollable chip row, tap chip to open its dropdown

### Contact flow
- WhatsApp button on card: one tap opens WhatsApp with pre-filled Hebrew message including flight route and date
- Phone number hidden by default; "Show Phone" button reveals it on tap (increments contactCount for agent analytics)
- Contact requires authentication — non-authenticated users see "Sign in to contact" prompt
- Detail panel (Sheet slide-over from right/RTL-aware) shows full description, agent profile, all contact options

### Package presentation
- Package listings displayed in same grid as simple flights — no separate tab
- "Package Deal" badge on card, plus small icons showing included components (hotel, bus/ferry transfer, insurance)
- Detail panel shows itemized breakdown: each component as a row with icon, name, brief details
- One bundled pricePerSeat — no individual component pricing
- Type filter allows isolating packages from simple flights

### Claude's Discretion
- Exact card spacing, shadows, typography, and responsive breakpoints
- Loading skeleton animation details (FlightCardSkeleton already exists)
- Empty state design (no flights matching filters)
- Error state handling
- Exact urgency countdown format and refresh interval
- Filter dropdown styling and interaction details
- Detail panel layout and spacing
- Sort option labels and additional sort options beyond soonest departure

</decisions>

<specifics>
## Specific Ideas

- WhatsApp pre-filled message should be in Hebrew — users and agents are Israeli
- Crisis urgency drives all design: speed > aesthetics, one-tap > multi-step
- Contact tracking via contactCount field enables agent analytics in Phase 3
- Slide-over panel keeps the flight grid visible behind it — user doesn't lose context

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `FlightCardSkeleton` (src/shared/components/LoadingSkeleton.tsx): Pre-built loading skeleton for flight cards with departure/destination/details layout
- `Badge` component (src/components/ui/badge.tsx): Variants for status, urgency, verified, and package badges
- `Button` component: Multiple sizes including xs for card actions
- `Sheet` component (src/components/ui/sheet.tsx): Slide-over panel for flight detail view
- `Skeleton` component: Base loading state
- `countries.ts` (src/shared/data/countries.ts): 30 countries with code, name, Hebrew name, flag emoji — for departure/destination display
- `useAppStore` (Zustand): selectedCountry for auto-filtering, useIsMobile for responsive behavior
- `useDirection`: RTL/LTR detection for Sheet direction

### Established Patterns
- Dashboard pages use async params (Next.js 16), auth check via Clerk, useTranslations() for i18n
- RTL-first: all layout uses logical CSS properties (ms-, me-, ps-, pe-)
- Error boundaries per module: each page has its own error.tsx
- Convex paginationArgs validator available for paginated queries
- requireUser() auth helper in Convex for mutation/query guards

### Integration Points
- `/src/app/[locale]/(dashboard)/flights/page.tsx`: Currently "Coming Soon" placeholder — will be replaced
- Sidebar nav already links to /flights with correct icon and i18n label
- Convex flights table schema defined with all needed fields and indexes (by_status_departure, by_country_departure)
- `contactCount` field in flights schema for tracking contact inquiries
- i18n keys exist: nav.flights, dashboard.latestFlights, dashboard.noFlights

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-extraction-flights-marketplace*
*Context gathered: 2026-03-03*
