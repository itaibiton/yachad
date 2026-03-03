# Roadmap: Yachad (יחד)

## Overview

Yachad is built in nine phases, ordered by dependency. Phase 1 establishes the non-negotiable infrastructure — schema, auth, RTL, i18n — that every other phase builds on. Phases 2-5 deliver the read-heavy user-facing modules in priority order: flights first (the core crisis capability), then the agent portal that populates the flights marketplace, then news and map services. Phases 6-8 deliver the community layer: feed, chat, and reservations. Phase 9 delivers the operations layer (admin panel) last, when all content modules exist to moderate and manage. This ordering reflects the dependency graph: schema must precede all modules, agent portal must follow flights schema, admin panel must follow all content modules.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - Security, schema, auth, RTL design system, and i18n infrastructure (completed 2026-03-03)
- [ ] **Phase 2: Extraction Flights Marketplace** - Users can discover and contact agents for extraction flights
- [ ] **Phase 3: Flight Agent Portal** - Agents can manage their listings through a dedicated dashboard
- [ ] **Phase 4: News Aggregator** - Users can monitor live news and urgent crisis alerts
- [ ] **Phase 5: Jewish Services Map** - Users can locate Jewish services and embassies near their position
- [ ] **Phase 6: Social Community Feed** - Users can post, react, and coordinate in real time
- [ ] **Phase 7: Chat System** - Users can communicate via country group channels and direct messages
- [ ] **Phase 8: Reservations Marketplace** - Users can list and find cancelled hotel reservations
- [ ] **Phase 9: Admin Panel** - Admins can moderate content, manage agents, and broadcast alerts

## Phase Details

### Phase 1: Foundation
**Goal**: The entire platform infrastructure exists — auth enforced at three layers, all Convex schemas defined with production indexes, RTL design system with logical CSS throughout, Hebrew/English locale routing active, and the dashboard shell rendering correctly
**Depends on**: Nothing (first phase)
**Requirements**: FOUN-01, FOUN-02, FOUN-03, FOUN-04, FOUN-05, FOUN-06, FOUN-07, FOUN-08, FOUN-09, FOUN-10, FOUN-11, FOUN-12, FOUN-13
**Success Criteria** (what must be TRUE):
  1. A user can sign up, log in, and be redirected to the dashboard; an unauthenticated request to a protected route is redirected to sign-in
  2. The dashboard shell renders with RTL layout in Hebrew and switches to LTR in English — all spacing, padding, and directional elements flip correctly with no physical CSS violations
  3. Dark mode toggles and persists across page refreshes; mobile layout renders correctly at 375px viewport
  4. Clerk roles are enforced via `proxy.ts`: a regular user cannot access `/agent` or `/admin` routes; an unauthenticated API call to a Convex mutation requiring auth is rejected at the Convex function level
  5. All Convex schemas (for all 7 modules) exist with indexes defined; rate limiting is active and rejects write operations that exceed configured thresholds
**Plans**: 5 plans

Plans:
- [ ] 01-01-PLAN.md — Next.js 16 scaffold with Turbopack, TailwindCSS v4, shadcn/ui (--rtl), provider hierarchy (Clerk + Convex + Theme), dark mode [Wave 1]
- [ ] 01-02-PLAN.md — Convex schema for all 7 modules with production indexes, three-layer auth helpers, rate limiter, Clerk webhook sync [Wave 1]
- [ ] 01-03-PLAN.md — Clerk three-layer auth: proxy.ts route matchers, page guards, sign-in/sign-up pages, role-gated route layouts [Wave 2]
- [ ] 01-04-PLAN.md — next-intl v4 locale routing, Hebrew/English message files, locale layout with dir/lang attributes [Wave 2]
- [ ] 01-05-PLAN.md — Dashboard shell: sidebar (7 modules), top bar (all controls), mobile bottom nav, emergency button, error boundaries, skeleton screens [Wave 3]

### Phase 2: Extraction Flights Marketplace
**Goal**: Users can browse, search, and filter extraction flights, read all listing details, and initiate contact with verified agents
**Depends on**: Phase 1
**Requirements**: FLIT-01, FLIT-02, FLIT-03, FLIT-04, FLIT-05, FLIT-06, FLIT-07, FLIT-08, FLIT-09, FLIT-10, FLIT-11, FLIT-12
**Success Criteria** (what must be TRUE):
  1. A user can filter flights by departure country, destination, date range, and seat availability and see results update without a page reload
  2. Each flight card displays status badge (available/full/cancelled), seat counter, price per seat with currency, destination flag and city, creation timestamp and "updated X ago", and urgency badge for flights departing within 24 hours
  3. A user can tap the WhatsApp contact button or reveal a phone number to contact an agent directly from a listing
  4. Verified agents display a "verified" badge; listings are sorted by soonest departure by default
  5. Package listings (flight + hotel + transfer + insurance) display all components as a single bundled listing
**Plans**: TBD

Plans:
- [ ] 02-01: Convex queries for flights — paginated listing browse with search and filter (usePaginatedQuery, all indexes leveraged)
- [ ] 02-02: Flight card component — all display fields, status badge, urgency badge, seat counter, verified badge, RTL layout, mobile-first
- [ ] 02-03: Flights page — filter UI, sort control, infinite scroll via react-intersection-observer, preloadQuery + usePreloadedQuery for real-time status

### Phase 3: Flight Agent Portal
**Goal**: Flight agents can create, manage, and track their extraction flight listings through a private dashboard, and their listings remain invisible to users until admin approval
**Depends on**: Phase 2
**Requirements**: AGNT-01, AGNT-02, AGNT-03, AGNT-04, AGNT-05, AGNT-06, AGNT-07
**Success Criteria** (what must be TRUE):
  1. An agent can submit a new flight listing (or package listing) and the listing appears in their dashboard as a draft; it does not appear in the public marketplace until admin approval
  2. An agent can edit any field on an existing listing and see the change reflected immediately in their dashboard
  3. An agent can mark a flight as "Full" with one tap; the status badge updates immediately in the public marketplace
  4. An agent can soft-delete a listing; it disappears from the marketplace but is retained in the database
  5. An agent can see the contact inquiry count for each listing (how many users clicked contact)
**Plans**: TBD

Plans:
- [ ] 03-01: Agent Convex mutations — createFlight, createPackage, editListing, deleteListing (soft), markFull; all verify agent approval status in DB, not only in Clerk metadata
- [ ] 03-02: Agent portal UI — listing creation form (multi-step, Tiptap for description), package builder, listing dashboard with status badges and inquiry counts
- [ ] 03-03: Agent approval gate — draft visibility logic, admin-facing approval actions (built as stub here, completed in Phase 9)

### Phase 4: News Aggregator
**Goal**: Users can monitor a live, curated news feed from Israeli sources with urgent alert banners, source attribution, and automatic refresh
**Depends on**: Phase 1
**Requirements**: NEWS-01, NEWS-02, NEWS-03, NEWS-04, NEWS-05, NEWS-06, NEWS-07, NEWS-08, NEWS-09, NEWS-10
**Success Criteria** (what must be TRUE):
  1. The news feed displays articles from multiple sources in chronological order with source attribution (outlet name and favicon) and language badge (Hebrew/English)
  2. An urgent alert banner appears pinned above the feed when an admin has created an active alert; the user can dismiss it
  3. The feed auto-refreshes every 5-10 minutes and displays a "last updated X ago" indicator; no page reload is required
  4. Articles from promoted/pinned sources display an "Important" badge; each source has a trust tier badge (Official/Verified/Community)
  5. A user can filter news by country relevance and tap any article to open the original source in a new tab
**Plans**: TBD

Plans:
- [ ] 04-01: Convex Action + cron — RSS ingestion every 5 minutes via rss-parser (Node.js runtime), deduplication, server-side ingestion timestamp, admin source allowlist
- [ ] 04-02: News feed UI — article cards with attribution, language badge, trust tier, admin promote/pin, country filter, auto-refresh with last-updated indicator
- [ ] 04-03: Urgent alert banner — admin-created alert stored in Convex, pinned banner component, dismissible per session, real-time via subscription

### Phase 5: Jewish Services Map
**Goal**: Users can locate Jewish services, embassies, and emergency services near their current position, view place details, and get directions
**Depends on**: Phase 1
**Requirements**: MAPS-01, MAPS-02, MAPS-03, MAPS-04, MAPS-05, MAPS-06, MAPS-07, MAPS-08, MAPS-09, MAPS-10, MAPS-11, MAPS-12
**Success Criteria** (what must be TRUE):
  1. The map loads with the user's current location detected via browser geolocation and pins visible for Jewish services in the area
  2. A user can filter by service type (Chabad, Synagogue, Kosher Store, Mikveh, Embassy, Israeli Consulate, Jewish Community Center) and the map updates to show only matching pins
  3. Tapping a pin reveals place details (address, phone, hours, website) and a "Get Directions" button that opens Google Maps navigation
  4. Pins cluster at low zoom levels; emergency services (hospitals, police) can be toggled on/off as an overlay
  5. A user can save up to 5 locations to localStorage for offline access and can call any place via one-tap phone button
**Plans**: TBD

Plans:
- [ ] 05-01: Convex Action — Google Places New API (PlaceAutocompleteElement, AutocompleteSuggestion) with server-side caching (24h TTL), field masks to control billing, billing budget alerts configured
- [ ] 05-02: Map module UI — @vis.gl/react-google-maps embed, geolocation, category filter, pin clustering, Hebrew controls, emergency overlay toggle
- [ ] 05-03: Place details panel — address/phone/hours/website display, directions handoff, one-tap call button, save-to-localStorage (max 5), embassy contact data for top 30 countries, curated Chabad house list

### Phase 6: Social Community Feed
**Goal**: Users can post text and images, react to posts, comment, and coordinate with their community in a real-time, country-sharded feed
**Depends on**: Phase 1
**Requirements**: FEED-01, FEED-02, FEED-03, FEED-04, FEED-05, FEED-06, FEED-07, FEED-08, FEED-09, FEED-10, FEED-11, FEED-12, FEED-13
**Success Criteria** (what must be TRUE):
  1. A user can create a text post (up to 1000 characters) or upload an image with a post, and it appears in the feed in real time without a page reload
  2. A user can like a post and see the updated like count; a user can add a flat comment and see it appear immediately
  3. A user can tag a post with location (country/city) and category (Help Needed/Offering Help/Info/Warning) and filter the feed by those tags
  4. A user can create a "I am safe in [city]" safety check post with a distinct visual treatment
  5. A user can delete their own post and report any post for misinformation or spam; admins can pin a post to the top of the feed
**Plans**: TBD

Plans:
- [ ] 06-01: Feed Convex schema queries and mutations — paginated, country-sharded subscriptions; like counts in separate hot table (OCC avoidance); rate limiting on all writes
- [ ] 06-02: Post composer — text post (1000 char), image upload via Convex file storage, location tag, category tag, safety check post type
- [ ] 06-03: Feed UI — post cards with author display name/avatar, relative timestamps, like/comment actions, report button, admin pin, real-time updates via usePreloadedQuery, filter bar

### Phase 7: Chat System
**Goal**: Users can communicate in real time via country group channels, an emergency broadcast channel, and direct messages, with persistent history and unread tracking
**Depends on**: Phase 1, Phase 6
**Requirements**: CHAT-01, CHAT-02, CHAT-03, CHAT-04, CHAT-05, CHAT-06, CHAT-07, CHAT-08, CHAT-09, CHAT-10, CHAT-11, CHAT-12
**Success Criteria** (what must be TRUE):
  1. A user is automatically placed in their country's group channel on signup; the channel history loads with pagination on scroll
  2. A user can send a message and see it appear immediately (optimistic update); other users in the channel see it in real time
  3. Unread message count badges appear per channel; a typing indicator shows when another user is composing
  4. A user can add emoji reactions to messages, share images, and see online user count per channel
  5. Admins can broadcast a message to all channels simultaneously; any user or admin can pin one message per channel
**Plans**: TBD

Plans:
- [ ] 07-01: Chat Convex schema — messages table (country-sharded), DM threads table, presence table for typing indicators and online counts; paginated message queries
- [ ] 07-02: Channel UI — country group channels (auto-join), emergency channel, message list with pagination on scroll, optimistic message send, real-time updates, relative timestamps
- [ ] 07-03: Chat features — typing indicators via Convex presence, unread badge tracking, emoji reactions, image sharing via Convex file storage, DM thread UI, admin broadcast, channel pin

### Phase 8: Reservations Marketplace
**Goal**: Users can list cancelled hotel reservations and find accommodation in their destination country, with contact gated behind authentication
**Depends on**: Phase 1
**Requirements**: RESV-01, RESV-02, RESV-03, RESV-04, RESV-05, RESV-06, RESV-07, RESV-08, RESV-09, RESV-10
**Success Criteria** (what must be TRUE):
  1. A user can post a hotel reservation listing with hotel name, dates, room type, original price, asking price, and cancellation policy
  2. A user can browse and search listings, filtered by destination country/city, and see savings percentage between original and asking price
  3. Listings with less than 48 hours to check-in display an "Urgent" badge; listings whose check-in date has passed are automatically hidden
  4. An authenticated user can contact the seller via WhatsApp or email; a seller can mark their listing as "Sold / No Longer Available"
  5. Available accommodations can be viewed on a Google Maps overlay within the module
**Plans**: TBD

Plans:
- [ ] 08-01: Reservations Convex schema queries and mutations — listing CRUD, auto-expire via scheduled function, urgency badge logic, auth-gated contact reveal
- [ ] 08-02: Listing creation form — structured fields (hotel name, dates, room type, prices, cancellation policy, location), savings calculation display
- [ ] 08-03: Browse UI — search/filter by destination, listing cards with urgency badge and savings display, map overlay for available listings, mark-sold action

### Phase 9: Admin Panel
**Goal**: Admins can moderate all content, approve flight agents, manage news sources and alerts, broadcast messages, and audit all admin actions
**Depends on**: Phase 2, Phase 3, Phase 4, Phase 5, Phase 6, Phase 7, Phase 8
**Requirements**: ADMN-01, ADMN-02, ADMN-03, ADMN-04, ADMN-05, ADMN-06, ADMN-07, ADMN-08, ADMN-09
**Success Criteria** (what must be TRUE):
  1. An admin can view a moderation queue of reported posts, messages, and listings and can remove any item or dismiss the report
  2. An admin can approve or reject a flight agent application; approved agents' listings become visible in the marketplace immediately
  3. An admin can create, edit, and delete urgent news alert banners; the banner appears across the platform within seconds
  4. An admin can ban a user, broadcast a message to all channels and the feed simultaneously, and manage the RSS source allowlist
  5. Every admin action (who, what, when, target) is recorded in an append-only audit log viewable by admins
**Plans**: TBD

Plans:
- [ ] 09-01: Admin Convex internalMutations — requireAdmin() guard on all operations; moderation queue queries across posts/messages/listings; soft delete + user ban mutations; audit log append
- [ ] 09-02: Agent approval workflow — approve/reject with DB flag update, connect to draft visibility gate from Phase 3; platform statistics aggregation queries
- [ ] 09-03: Admin panel UI — moderation queue, agent approval, user management, RSS source management, alert create/edit/delete, broadcast composer, stats dashboard, audit log viewer

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 6/6 | Complete   | 2026-03-03 |
| 2. Extraction Flights Marketplace | 0/3 | Not started | - |
| 3. Flight Agent Portal | 0/3 | Not started | - |
| 4. News Aggregator | 0/3 | Not started | - |
| 5. Jewish Services Map | 0/3 | Not started | - |
| 6. Social Community Feed | 0/3 | Not started | - |
| 7. Chat System | 0/3 | Not started | - |
| 8. Reservations Marketplace | 0/3 | Not started | - |
| 9. Admin Panel | 0/3 | Not started | - |
