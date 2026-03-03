# Phase 1: Foundation - Context

**Gathered:** 2026-03-03
**Status:** Ready for planning

<domain>
## Phase Boundary

The entire platform infrastructure: Next.js 15 project scaffold, Convex schema for all 7 modules with production indexes, three-layer Clerk auth (middleware + page + Convex function), next-intl v4 Hebrew/English with RTL, dark mode, responsive dashboard shell with sidebar + top bar, rate limiting, error boundaries, and skeleton loading states.

</domain>

<decisions>
## Implementation Decisions

### Dashboard Layout
- Icon + label sidebar, collapsible to icons-only on mobile
- Bottom tab navigation on mobile (like WhatsApp/Instagram), sidebar on desktop
- Module order follows crisis priority: Flights → News → Map → Feed → Chat → Reservations
- Home page is an overview dashboard with summary cards: latest flights, urgent alerts, recent posts, nearby services
- Top bar includes: Yachad logo + search icon that expands, country selector, emergency button, language toggle, notifications, profile

### Visual Identity
- Primary brand color: Israeli blue (#0038b8) — inspired by the Israeli flag
- UI feel: Warm + community — friendly, rounded corners, modern social app feel
- Red for urgent alerts and emergency elements
- Dark mode must maintain the warm community feel

### Emergency Button
- Behavior: Quick menu dropdown with options — Call Embassy, Share Location, Emergency Chat, Report Danger
- Visibility: Both — red icon in top bar on desktop, red floating action button (FAB) on mobile
- Always accessible from every screen

### Country Selector
- Onboarding step on first login: "Where are you right now?" with auto-detect via IP geolocation + manual override
- User can change location anytime via top bar dropdown
- Location determines: feed sharding, chat channel auto-join, news country filter, map default center

### Claude's Discretion
- Exact spacing, typography, and component sizing
- Loading skeleton designs
- Error boundary UI treatment
- Exact dark mode color mappings
- Convex schema field naming conventions
- Rate limiting thresholds
- Sidebar collapse breakpoint

</decisions>

<specifics>
## Specific Ideas

- App name is "יחד" (Yachad) — "Together" in Hebrew
- Domain will be yachad.global
- Israeli flag blue as primary color — connects to national identity during crisis
- Emergency button must feel like a real emergency tool, not decorative
- Overview dashboard as home page — users need a bird's eye view across all modules when they land

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield project, no existing code

### Established Patterns
- None yet — Phase 1 establishes all patterns

### Integration Points
- Clerk provider wraps the app at root layout level
- ConvexProviderWithClerk wraps inside Clerk (provider order matters)
- next-intl locale routing uses [locale] dynamic segment in app directory
- RTL `dir` attribute set on `<html>` element based on locale

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-03-03*
