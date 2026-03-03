---
phase: 02-extraction-flights-marketplace
plan: "02"
subsystem: ui
tags: [react, convex, clerk, next-intl, shadcn, rtl, tailwind, date-fns]

# Dependency graph
requires:
  - phase: 02-01
    provides: "listFlights/getFlightWithAgent queries and incrementContactCount mutation, FlightWithAgent shape with denormalized agent fields"

provides:
  - "FlightCard component: scannable card with flags, urgency banner, seats/price/status, agent verified badge, package icons, WhatsApp button"
  - "FlightDetailSheet component: slide-over panel with full flight details, agent profile, package breakdown, auth-gated contact (WhatsApp + phone reveal)"
  - "flight-utils.ts: buildWhatsAppUrl, getUrgencyInfo, getStatusVariant, formatFlightPrice, FlightWithAgent type"

affects:
  - 02-03-flights-grid-and-page
  - 02-04-agent-portal-flight-creation

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Auth-gated contact buttons via useAuth().isSignedIn from @clerk/nextjs"
    - "Convex mutation via useMutation(api.modules.flights.mutations.incrementContactCount)"
    - "Sheet side='right' kept static — SheetContent uses logical end-0/start-0 internally for RTL"
    - "formatDistanceToNow from date-fns with he locale for Hebrew relative timestamps"
    - "Intl.NumberFormat with he-IL locale + try/catch fallback for unknown currencies"
    - "Urgency banner: red bg for <2h, orange bg for 2-24h — conditional on departure proximity"

key-files:
  created:
    - src/shared/components/flights/flight-utils.ts
    - src/shared/components/flights/FlightCard.tsx
    - src/shared/components/flights/FlightDetailSheet.tsx
  modified: []

key-decisions:
  - "Relative convex import path (../../../../convex/_generated/dataModel) used in src/ files — no tsconfig alias exists for convex/ root directory"
  - "Sheet kept at side='right' always — SheetContent uses logical end-0/start-0 per research finding; no dynamic RTL switching needed"
  - "WhatsApp message pre-filled in Hebrew always — both users and agents are Israeli per CONTEXT.md"
  - "Phone reveal increments contactCount via mutation (best-effort: still reveals even if mutation throws)"

patterns-established:
  - "Convex generated types referenced via relative path from src/: ../../../../convex/_generated/"
  - "Contact buttons always auth-gated: check isSignedIn, fallback to /sign-in link"
  - "Urgency state drives both banner color (red < 2h, orange 2-24h) and the urgency banner strip at card top"
  - "Package component details shown inline (Hotel/Bus/Shield icons) on card, full breakdown rows in sheet"

requirements-completed:
  - FLIT-02
  - FLIT-03
  - FLIT-04
  - FLIT-05
  - FLIT-06
  - FLIT-07
  - FLIT-08
  - FLIT-09
  - FLIT-11
  - FLIT-12

# Metrics
duration: 3min
completed: 2026-03-03
---

# Phase 02 Plan 02: FlightCard, FlightDetailSheet, and Flight Utilities Summary

**RTL-aware FlightCard with urgency banners and WhatsApp contact, FlightDetailSheet slide-over with phone reveal + Convex contactCount mutation, and shared flight-utils.ts helpers**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-03T21:44:05Z
- **Completed:** 2026-03-03T21:47:xx Z
- **Tasks:** 2
- **Files created:** 3

## Accomplishments

- FlightCard component with all essential info at a glance: departure/destination country flags, date/time, seats left, price per seat, status badge, urgency banner (red/orange based on imminence), agent verified badge, package component icons (Hotel/Bus/Shield), and WhatsApp contact button — all auth-gated
- FlightDetailSheet slide-over panel with full flight details, agent avatar + profile, itemized package breakdown rows, phone number reveal that calls `incrementContactCount` Convex mutation for agent analytics, auth-gated contact section
- flight-utils.ts with four pure utility functions: buildWhatsAppUrl (Hebrew message, encodeURIComponent), getUrgencyInfo (24h window), getStatusVariant (Badge variants), formatFlightPrice (Intl + fallback); FlightWithAgent type extending Convex Doc<"flights"> with denormalized agent fields

## Task Commits

1. **Task 1: flight-utils.ts utilities** - `2cca327` (feat)
2. **Task 2: FlightCard and FlightDetailSheet components** - `655c248` (feat)

## Files Created/Modified

- `src/shared/components/flights/flight-utils.ts` - Utility functions (buildWhatsAppUrl, getUrgencyInfo, getStatusVariant, formatFlightPrice) and FlightWithAgent type
- `src/shared/components/flights/FlightCard.tsx` - Flight listing card with all display fields and contact actions
- `src/shared/components/flights/FlightDetailSheet.tsx` - Slide-over Sheet panel with full details, agent profile, and contact options

## Decisions Made

- **Relative convex import path:** src/ files use `../../../../convex/_generated/dataModel` relative path because tsconfig has no alias for the convex/ root directory. This is the simplest correct approach.
- **Sheet side always "right":** Per 02-RESEARCH.md finding, SheetContent uses logical `end-0`/`start-0` CSS so it automatically slides from the correct side in both RTL and LTR. No dynamic switching needed.
- **Hebrew WhatsApp message:** Always in Hebrew — users and agents are Israeli per CONTEXT.md decision.
- **Phone reveal best-effort:** Still reveals phone number even if `incrementContactCount` mutation throws — user experience takes priority over analytics tracking.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

- **TypeScript path for Convex types:** `import { Doc } from "convex/_generated/dataModel"` failed because tsconfig has no module alias for the root `convex/` directory. Fixed with relative path `../../../../convex/_generated/dataModel`. (Rule 3 auto-fix — blocking import)

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- FlightCard and FlightDetailSheet are ready to be consumed by Plan 02-03 (FlightsGrid and FlightsPage)
- Both components accept FlightWithAgent prop matching the shape returned by Plan 02-01 queries
- All translation keys already exist in en.json and he.json — no i18n additions needed

---
*Phase: 02-extraction-flights-marketplace*
*Completed: 2026-03-03*
