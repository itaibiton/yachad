# Requirements: Yachad (יחד)

**Defined:** 2026-03-03
**Core Value:** Get stranded Israelis home safely by connecting them with extraction flights, critical local services, and each other in real time.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Foundation

- [x] **FOUN-01**: App initializes with Next.js 16+ App Router (Turbopack default), TypeScript, TailwindCSS v4, and shadcn/ui
- [x] **FOUN-02**: Convex database configured with schema, indexes, and real-time subscriptions
- [x] **FOUN-03**: Clerk authentication with three roles: user, flight_agent, admin
- [x] **FOUN-04**: Clerk-Convex webhook sync via Svix for user data in Convex
- [x] **FOUN-05**: Role-based proxy.ts (Next.js 16) protecting agent and admin routes
- [x] **FOUN-06**: Hebrew-first RTL layout with `dir="rtl"` and logical CSS properties throughout
- [x] **FOUN-07**: English + Hebrew i18n via next-intl v4 with locale-based routing
- [x] **FOUN-08**: Dark mode with system preference detection and manual toggle
- [x] **FOUN-09**: Fully responsive mobile-first design across all modules
- [x] **FOUN-10**: Dashboard layout with sidebar navigation (all 7 modules), top bar (country selector, emergency button, language toggle, notifications, profile)
- [x] **FOUN-11**: Rate limiting on all write operations via @convex-dev/rate-limiter
- [ ] **FOUN-12**: Error boundaries with user-friendly Hebrew/English error messages
- [ ] **FOUN-13**: Loading states with skeleton screens on all data-fetching components

### Extraction Flights

- [ ] **FLIT-01**: User can search and filter flights by departure country, destination, date range, and seats available
- [ ] **FLIT-02**: User can view clear pricing per seat with currency display
- [ ] **FLIT-03**: User can see flight status indicator (available / full / cancelled)
- [ ] **FLIT-04**: User can contact agent via WhatsApp click-to-chat or phone number reveal
- [ ] **FLIT-05**: User can see seat availability counter ("X seats left")
- [ ] **FLIT-06**: User can see listing creation date and "updated X ago" timestamp
- [ ] **FLIT-07**: User can view mobile-first RTL flight cards scannable in 3 seconds
- [ ] **FLIT-08**: User can view package bundles (flight + hotel + transfer + insurance) as single listings
- [ ] **FLIT-09**: User can see urgency badge on flights departing in less than 24 hours
- [ ] **FLIT-10**: User can see default sort by soonest departure date
- [ ] **FLIT-11**: User can see verified agent badge on admin-approved agents
- [ ] **FLIT-12**: User can see destination country flag and city on each listing

### Flight Agent Portal

- [ ] **AGNT-01**: Agent can create a new flight listing with departure/arrival, price, seats, contact, and departure date
- [ ] **AGNT-02**: Agent can create package listing with flight + hotel + transfer + insurance components
- [ ] **AGNT-03**: Agent can edit any field on their existing listings
- [ ] **AGNT-04**: Agent can delete their listings (soft delete)
- [ ] **AGNT-05**: Agent can mark a flight as "Full" with one tap
- [ ] **AGNT-06**: Agent can view dashboard of all their listings with status badges
- [ ] **AGNT-07**: Agent can see contact inquiry count per listing (how many users clicked contact)

### Jewish Services Locator

- [ ] **MAPS-01**: User can view a Google Maps embed with location pins for Jewish services
- [ ] **MAPS-02**: User can filter map by type: Chabad, Synagogue, Kosher Store, Mikveh, Embassy, Israeli Consulate, Jewish Community Center
- [ ] **MAPS-03**: User's current location auto-detected via browser geolocation
- [ ] **MAPS-04**: User can view place details: address, phone, hours, website
- [ ] **MAPS-05**: User can tap "Get directions" to open Google Maps navigation
- [ ] **MAPS-06**: User can see embassy contact info for top 30 countries
- [ ] **MAPS-07**: User can use mobile-optimized map with Hebrew controls
- [ ] **MAPS-08**: User can see curated Chabad house list supplementing Google Places results
- [ ] **MAPS-09**: User can see emergency services overlay (hospitals, police) toggled on/off
- [ ] **MAPS-10**: User can call a place directly via one-tap phone button
- [ ] **MAPS-11**: User can save up to 5 locations for offline access via localStorage
- [ ] **MAPS-12**: Map clusters pins at low zoom levels for readability

### Live News Aggregator

- [ ] **NEWS-01**: User can view chronological news feed from multiple Israeli sources
- [ ] **NEWS-02**: User can see source attribution (outlet name + favicon) on each article
- [ ] **NEWS-03**: User can see urgent alert banner pinned above the news feed (admin-created, dismissible)
- [ ] **NEWS-04**: System aggregates 10-20 RSS feeds with deduplication
- [ ] **NEWS-05**: User can tap article to open original source in new tab
- [ ] **NEWS-06**: User can see Hebrew and English sources with language badge
- [ ] **NEWS-07**: News feed auto-refreshes every 5-10 minutes with "last updated" indicator
- [ ] **NEWS-08**: Admin can promote/pin stories marked as "Important" with badge
- [ ] **NEWS-09**: Each source displays trust tier badge: Official / Verified / Community
- [ ] **NEWS-10**: User can filter news by country relevance

### Social Community Feed

- [ ] **FEED-01**: User can create text posts (up to 1000 characters)
- [ ] **FEED-02**: User can upload images with posts via Convex file storage
- [ ] **FEED-03**: User can like posts
- [ ] **FEED-04**: User can comment on posts (flat comments)
- [ ] **FEED-05**: Feed updates in real-time via Convex subscriptions
- [ ] **FEED-06**: User can see post author display name and avatar
- [ ] **FEED-07**: User can see relative timestamps on posts ("3 minutes ago")
- [ ] **FEED-08**: User can delete their own posts
- [ ] **FEED-09**: User can report posts for misinformation or spam
- [ ] **FEED-10**: User can tag posts with location (country/city) and filter feed by location
- [ ] **FEED-11**: User can tag posts with category: Help Needed / Offering Help / Info / Warning
- [ ] **FEED-12**: User can create "I am safe in [city]" safety check posts
- [ ] **FEED-13**: Admin can pin posts to top of feed

### Chat System

- [ ] **CHAT-01**: User auto-joins country-based group chat on signup based on location
- [ ] **CHAT-02**: Emergency all-users channel exists for critical announcements
- [ ] **CHAT-03**: User can send direct messages (1:1 DMs)
- [ ] **CHAT-04**: Chat message history is persistent and loads with pagination
- [ ] **CHAT-05**: User can see typing indicator when someone is composing
- [ ] **CHAT-06**: User can see unread message count badge per channel
- [ ] **CHAT-07**: Messages display relative timestamps
- [ ] **CHAT-08**: User can add emoji reactions to messages
- [ ] **CHAT-09**: User can share images in chat
- [ ] **CHAT-10**: Admin can broadcast a message to all channels simultaneously
- [ ] **CHAT-11**: Admin or user can pin one message per channel
- [ ] **CHAT-12**: User can see online user count per channel

### Cancelled Reservation Marketplace

- [ ] **RESV-01**: User can post hotel reservation listing (hotel name, dates, room type, prices, location)
- [ ] **RESV-02**: User can browse and search reservation listings
- [ ] **RESV-03**: User can filter listings by destination country/city
- [ ] **RESV-04**: User can contact seller via WhatsApp or email after auth
- [ ] **RESV-05**: Seller can mark listing as "Sold / No Longer Available"
- [ ] **RESV-06**: Listing displays original price vs asking price with savings percentage
- [ ] **RESV-07**: Listings auto-expire when check-in date has passed
- [ ] **RESV-08**: Listings with less than 48 hours to check-in display "Urgent" badge
- [ ] **RESV-09**: Seller can specify cancellation policy: fully refundable / partial / non-refundable
- [ ] **RESV-10**: User can view available accommodations on Google Maps

### Admin Panel

- [ ] **ADMN-01**: Admin can view and process moderation queue of reported posts/messages/listings
- [ ] **ADMN-02**: Admin can remove any post, message, or listing (soft delete)
- [ ] **ADMN-03**: Admin can ban users from the platform
- [ ] **ADMN-04**: Admin can approve or reject flight agent applications
- [ ] **ADMN-05**: Admin can create, edit, and delete urgent news alerts
- [ ] **ADMN-06**: Admin can manage RSS feed sources (add/remove/toggle active)
- [ ] **ADMN-07**: Admin can view platform statistics (users, listings, posts, messages)
- [ ] **ADMN-08**: Admin can broadcast a message to all users (pinned banner + feed post)
- [ ] **ADMN-09**: System logs all admin actions in an audit trail (who, what, when, target)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Notifications

- **NOTF-01**: User receives web push notifications for urgent alerts
- **NOTF-02**: User receives push notification for new DMs
- **NOTF-03**: User receives push notification for comments on own posts
- **NOTF-04**: User can configure notification preferences

### Enhanced Features

- **ENHC-01**: AI-generated article summaries for news items
- **ENHC-02**: Agent bulk flight upload via CSV
- **ENHC-03**: Full-text search within chat channels
- **ENHC-04**: Feed full-text search by keyword
- **ENHC-05**: Agent listing performance analytics (views, contacts)
- **ENHC-06**: Misinformation strike system (warn → suspend → ban)
- **ENHC-07**: Geo-targeted alerts (notify users in specific countries only)
- **ENHC-08**: Agent package builder with visual composer

### Bonus Features

- **BNUS-01**: SOS one-click location share
- **BNUS-02**: Embassy auto-contact
- **BNUS-03**: Crisis heatmap
- **BNUS-04**: Volunteer network matching
- **BNUS-05**: Ride-sharing coordination
- **BNUS-06**: Telegram bot integration
- **BNUS-07**: SMS alerts via Twilio
- **BNUS-08**: PWA installable app with offline support

## Out of Scope

| Feature | Reason |
|---------|--------|
| In-app payments / escrow | Requires PCI compliance, escrow, dispute resolution — months of work. Users arrange payment externally. |
| Native mobile app (iOS/Android) | Doubles development time; responsive web covers mobile needs. |
| Video posts in feed | Storage/bandwidth costs prohibitive; encoding complexity. Link to YouTube instead. |
| Voice/video chat | WebRTC complexity; WhatsApp/Zello already serve this need. |
| Algorithmic feed ranking | Crisis misinformation spreads fastest when engagement-ranked. Chronological only. |
| Anonymous posts | Accountability critical in crisis; anonymous = spam vector. |
| Custom user chat channels | Creates fragmentation; admin-created country channels only. |
| Real-time Twitter/X integration | X API costs prohibitive; curate RSS from official feeds instead. |
| User-submitted news tips | Misinformation vector; community feed handles UGC, news is curated-only. |
| Full article text re-hosting | Copyright violations; show title + description + link to original. |
| Hotel booking verification | Impossible without hotel API integration; user responsibility disclaimer. |
| Languages beyond Hebrew + English | Two languages sufficient for Israeli user base. |
| End-to-end encryption for chat | Conflicts with moderation requirements. Server-side encryption at rest. |
| User reviews/ratings on agents | Too little volume at launch; invites gaming. Add after 3 months. |
| Thread replies in chat (Slack-style) | Creates conversation fragmentation; flat stream for crisis simplicity. |
| GDS flight inventory integration | Amadeus/Sabre costs and certification; agents manually list. |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUN-01 | Phase 1 | Complete |
| FOUN-02 | Phase 1 | Complete |
| FOUN-03 | Phase 1 | Complete |
| FOUN-04 | Phase 1 | Complete |
| FOUN-05 | Phase 1 | Complete |
| FOUN-06 | Phase 1 | Complete |
| FOUN-07 | Phase 1 | Complete |
| FOUN-08 | Phase 1 | Complete |
| FOUN-09 | Phase 1 | Complete |
| FOUN-10 | Phase 1 | Complete |
| FOUN-11 | Phase 1 | Complete |
| FOUN-12 | Phase 1 | Pending |
| FOUN-13 | Phase 1 | Pending |
| FLIT-01 | Phase 2 | Pending |
| FLIT-02 | Phase 2 | Pending |
| FLIT-03 | Phase 2 | Pending |
| FLIT-04 | Phase 2 | Pending |
| FLIT-05 | Phase 2 | Pending |
| FLIT-06 | Phase 2 | Pending |
| FLIT-07 | Phase 2 | Pending |
| FLIT-08 | Phase 2 | Pending |
| FLIT-09 | Phase 2 | Pending |
| FLIT-10 | Phase 2 | Pending |
| FLIT-11 | Phase 2 | Pending |
| FLIT-12 | Phase 2 | Pending |
| AGNT-01 | Phase 3 | Pending |
| AGNT-02 | Phase 3 | Pending |
| AGNT-03 | Phase 3 | Pending |
| AGNT-04 | Phase 3 | Pending |
| AGNT-05 | Phase 3 | Pending |
| AGNT-06 | Phase 3 | Pending |
| AGNT-07 | Phase 3 | Pending |
| MAPS-01 | Phase 5 | Pending |
| MAPS-02 | Phase 5 | Pending |
| MAPS-03 | Phase 5 | Pending |
| MAPS-04 | Phase 5 | Pending |
| MAPS-05 | Phase 5 | Pending |
| MAPS-06 | Phase 5 | Pending |
| MAPS-07 | Phase 5 | Pending |
| MAPS-08 | Phase 5 | Pending |
| MAPS-09 | Phase 5 | Pending |
| MAPS-10 | Phase 5 | Pending |
| MAPS-11 | Phase 5 | Pending |
| MAPS-12 | Phase 5 | Pending |
| NEWS-01 | Phase 4 | Pending |
| NEWS-02 | Phase 4 | Pending |
| NEWS-03 | Phase 4 | Pending |
| NEWS-04 | Phase 4 | Pending |
| NEWS-05 | Phase 4 | Pending |
| NEWS-06 | Phase 4 | Pending |
| NEWS-07 | Phase 4 | Pending |
| NEWS-08 | Phase 4 | Pending |
| NEWS-09 | Phase 4 | Pending |
| NEWS-10 | Phase 4 | Pending |
| FEED-01 | Phase 6 | Pending |
| FEED-02 | Phase 6 | Pending |
| FEED-03 | Phase 6 | Pending |
| FEED-04 | Phase 6 | Pending |
| FEED-05 | Phase 6 | Pending |
| FEED-06 | Phase 6 | Pending |
| FEED-07 | Phase 6 | Pending |
| FEED-08 | Phase 6 | Pending |
| FEED-09 | Phase 6 | Pending |
| FEED-10 | Phase 6 | Pending |
| FEED-11 | Phase 6 | Pending |
| FEED-12 | Phase 6 | Pending |
| FEED-13 | Phase 6 | Pending |
| CHAT-01 | Phase 7 | Pending |
| CHAT-02 | Phase 7 | Pending |
| CHAT-03 | Phase 7 | Pending |
| CHAT-04 | Phase 7 | Pending |
| CHAT-05 | Phase 7 | Pending |
| CHAT-06 | Phase 7 | Pending |
| CHAT-07 | Phase 7 | Pending |
| CHAT-08 | Phase 7 | Pending |
| CHAT-09 | Phase 7 | Pending |
| CHAT-10 | Phase 7 | Pending |
| CHAT-11 | Phase 7 | Pending |
| CHAT-12 | Phase 7 | Pending |
| RESV-01 | Phase 8 | Pending |
| RESV-02 | Phase 8 | Pending |
| RESV-03 | Phase 8 | Pending |
| RESV-04 | Phase 8 | Pending |
| RESV-05 | Phase 8 | Pending |
| RESV-06 | Phase 8 | Pending |
| RESV-07 | Phase 8 | Pending |
| RESV-08 | Phase 8 | Pending |
| RESV-09 | Phase 8 | Pending |
| RESV-10 | Phase 8 | Pending |
| ADMN-01 | Phase 9 | Pending |
| ADMN-02 | Phase 9 | Pending |
| ADMN-03 | Phase 9 | Pending |
| ADMN-04 | Phase 9 | Pending |
| ADMN-05 | Phase 9 | Pending |
| ADMN-06 | Phase 9 | Pending |
| ADMN-07 | Phase 9 | Pending |
| ADMN-08 | Phase 9 | Pending |
| ADMN-09 | Phase 9 | Pending |

**Coverage:**
- v1 requirements: 87 total
- Mapped to phases: 87
- Unmapped: 0

---
*Requirements defined: 2026-03-03*
*Last updated: 2026-03-03 — Traceability completed after roadmap creation*
