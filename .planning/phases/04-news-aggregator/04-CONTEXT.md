# Phase 4: News Aggregator - Context

**Gathered:** 2026-03-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can monitor a live, curated news feed from Israeli sources with urgent alert banners, source attribution, and automatic refresh. No user-submitted news tips (out of scope). No full article text re-hosting — title + description + link to original only. Admin news source management and alert CRUD are stub actions here, completed in Phase 9.

</domain>

<decisions>
## Implementation Decisions

### Article card design
- Full cards showing all key info — headline, 2-3 line description snippet (150-200 chars, truncated with ellipsis), source favicon + name, trust tier badge, language badge, relative timestamp
- Tapping a card opens the original article URL in a new tab directly — no in-app preview sheet
- Source attribution: small favicon icon + source name text + colored trust tier chip (Official=Israeli blue, Verified=green, Community=gray)
- Language badge: small "HE" or "EN" chip in corner of card, subtle but visible
- Single column feed layout on both desktop and mobile — news is read top-to-bottom

### Urgent alert banner
- Full-width red/orange banner pinned above the feed, bold text with warning icon — unmissable emergency style
- Alert banner appears across ALL dashboard pages, not just the news page — urgent alerts are critical everywhere
- Dismiss per session — alert reappears on next visit while still active (sessionStorage)
- Multiple active alerts stack vertically, most recent on top

### Feed refresh & new content
- "N new articles" clickable banner at top when new content arrives — user controls when feed updates, doesn't disrupt reading position
- "Last updated X ago" indicator below the page header, subtle text
- Infinite scroll using usePaginatedQuery — consistent with flights module pattern
- Pull-to-refresh on mobile for manual feed update check

### Country filter & promoted articles
- Country filter auto-populates from useAppStore().selectedCountry — same pattern as flights module
- Promoted/pinned articles: dedicated "Important" section pinned above the main chronological feed, with "Important" badge — follows UrgentFlightsSection pattern from flights

### Initial RSS sources
- Seed 10-12 sources mixing Hebrew and English major outlets:
  - Hebrew: Ynet, Walla, Mako, Israel Hayom, Kan News
  - English: Times of Israel, Jerusalem Post, i24NEWS
  - Coverage of official + mainstream sources
- Trust tier badges: colored chip badges consistent with Badge component — Official (Israeli blue), Verified (green), Community (gray)

### Claude's Discretion
- Exact card spacing, shadows, typography, responsive breakpoints
- Loading skeleton design for news cards
- Empty state design (no news articles / no matching filters)
- Error state handling
- Exact "last updated" refresh interval and format
- RSS ingestion deduplication strategy
- Pull-to-refresh implementation approach
- Feed auto-refresh polling interval (within 5-10 min requirement)

</decisions>

<specifics>
## Specific Ideas

- Follow the established UrgentFlightsSection pattern for the "Important" pinned articles section
- WhatsApp pre-filled message convention (Hebrew-first) doesn't apply here — news is read-only, no contact flow
- Crisis urgency drives all design: users need reliable news fast during emergencies
- Trust tiers help users quickly identify reliable sources during crisis misinformation risk
- RSS source list is a seed — admin can add/remove/toggle sources in Phase 9

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Badge` component (src/components/ui/badge.tsx): variants for trust tier, language, and "Important" badges
- `FlightCard` pattern (src/shared/components/flights/FlightCard.tsx): card layout template to follow for news cards
- `UrgentFlightsSection` (src/shared/components/flights/UrgentFlightsSection.tsx): pattern for pinned/important content section above main feed
- `FlightFilterBar` (src/shared/components/flights/FlightFilterBar.tsx): horizontal filter bar pattern to reuse for news country/language filter
- `FlightsGrid` with infinite scroll: pagination pattern via usePaginatedQuery
- `countries.ts` (src/shared/data/countries.ts): 30 countries for country filter options
- `useAppStore`: selectedCountry for auto-filtering

### Established Patterns
- Dashboard pages: async params (Next.js 16), auth check via Clerk, useTranslations() for i18n
- RTL-first: all layout uses logical CSS properties (ms-, me-, ps-, pe-)
- Error boundaries per module: each page has its own error.tsx
- Convex paginationArgs validator for paginated queries
- Card-based UI with two-column grid on desktop (flights) — news will use single column

### Integration Points
- `/src/app/[locale]/(dashboard)/news/page.tsx`: Currently "Coming Soon" placeholder — will be replaced
- Sidebar nav already links to /news with correct icon and i18n label
- Convex `newsArticles` and `newsSources` tables already defined with indexes
- Convex `alerts` table defined with by_active_severity index
- i18n keys exist: nav.news, dashboard.urgentAlerts, dashboard.noAlerts
- Alert banner component will integrate into DashboardShell (all pages)

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-news-aggregator*
*Context gathered: 2026-03-05*
