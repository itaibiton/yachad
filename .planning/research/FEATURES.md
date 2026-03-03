# Feature Research

**Domain:** Crisis-response / emergency community platform for Israelis abroad
**Researched:** 2026-03-03
**Confidence:** MEDIUM (crisis-response domain well-documented; extraction flight marketplace is a novel vertical)

---

## Context

Yachad has 7 modules. This document analyzes each module's feature landscape independently, then summarizes cross-cutting concerns. Research drawn from:
- Crisis app design (Facebook Safety Check, FEMA app, Zello, Everbridge, RedFlag, CrisisGo, PulsePoint)
- Air charter marketplaces (Avinode, Air Charter Service, Jettly)
- Hotel resale marketplaces (Roomer, SpareFare, PlansChange)
- B2B travel portals (Trawex, FlightsLogic, FlyBlaze)
- Community platforms (Nextdoor, Mighty Networks, Chime.In)
- Content moderation platforms (ActiveFence, CommentGuard, Planable)

---

## Module 1: Extraction Flights Marketplace

Agents list flights and packages; users browse and contact agents.

### Table Stakes (Users Expect These)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Search + filter by destination, date, seats | Any marketplace without search is unusable | LOW | Filter by: departure country, destination, date range, seats available |
| Clear pricing display | Users in crisis cannot tolerate ambiguity on cost | LOW | Show price per seat, total package price, currency |
| Flight status indicator (available / full / cancelled) | Users need to know if a flight is bookable | LOW | Enum field on listing; agents toggle manually |
| Agent contact info (WhatsApp / phone) | No in-app payments in v1 — contact is the conversion action | LOW | Click-to-WhatsApp, phone number reveal |
| Seat availability counter | Prevents wasted contact attempts on full flights | LOW | Agent-updated; show "X seats left" |
| Listing creation date / last updated | Crisis data goes stale fast; users distrust old listings | LOW | Auto-timestamp, show "Updated 2h ago" |
| Mobile-first flight card layout | Hebrew-speaking mobile-heavy users | LOW | RTL card with key info scannable in 3 seconds |

### Differentiators (Competitive Advantage)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Package bundles (flight + hotel + transfer + insurance) | Agents already offer these; single listing beats searching 4 sites | MEDIUM | Structured data: flight leg, hotel nights, transfer type, insurance Y/N |
| "Mark flight full" one-tap for agents | Reduces stale listings, increases trust in the marketplace | LOW | Single button in agent dashboard; updates all user views instantly |
| Urgency signal — "Departing in < 24h" badge | Crisis users need to prioritize; time-sensitivity is core | LOW | Computed from departure datetime |
| Destination country flag + city display | Fast visual scanning in a list of many options | LOW | ISO country code → flag emoji, no API needed |
| Agent credibility score / verification badge | Users trusting strangers with crisis extraction need trust signals | MEDIUM | Admin-approved badge; count of completed flights listed |
| Smart sort: soonest departure first (default) | The most time-critical sort order for crisis context | LOW | Override default "newest listing" with "soonest departure" |
| Wishlist / save flight | Users scout before committing; reduces re-searching | LOW | LocalStorage or DB; requires auth |

### Anti-Features (Deliberately NOT Build)

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| In-app booking / payment | Requires PCI compliance, escrow, dispute resolution — months of work | External contact (WhatsApp/phone); note "payment arranged with agent" |
| Seat reservation hold / lock | Creates inventory complexity, expires, frustrates agents | "Contact agent to reserve" model; no holds |
| Flight review / rating system | Too little volume to be meaningful at launch; invites gaming | Add after 3 months and >50 completed extractions |
| Real-time GDS flight inventory | Integrating Amadeus/Sabre costs $$$, needs certification | Agents manually list — this is a human marketplace, not a GDS aggregator |
| Automated flight alerts via SMS | Nice idea, requires SMS infrastructure (Twilio), adds cost | Push notifications on web; SMS is v2 |

### Feature Dependencies — Module 1

```
Agent Auth (Clerk role: flight_agent)
    └──required by──> Listing CRUD
                          └──required by──> Marketplace browse
                                                └──enhances──> Search/filter

Admin Approval workflow
    └──required by──> Agent verification badge

Flight status (available/full/cancelled)
    └──required by──> Urgency badge
    └──required by──> Seat counter display
```

---

## Module 2: Jewish Services Locator

Chabad, synagogues, kosher restaurants, embassies via Google Maps/Places.

### Table Stakes (Users Expect These)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Map view with pins | Any locator without a map is broken | LOW | Google Maps JavaScript API |
| Place search by type (Chabad / synagogue / kosher / embassy) | Users have specific needs; category filter is core | LOW | Places API type filter + keyword |
| Current location detection | "Near me" is the primary use case in a foreign city | LOW | Browser geolocation API; fallback to manual city input |
| Place details (address, phone, hours, website) | Users need to know how to get there and when it's open | LOW | Google Places Details API |
| "Get directions" handoff to Google Maps | Don't build navigation; hand off to Maps app | LOW | `maps.google.com/?daddr=` deep link |
| Embassy contact info display | In a national emergency, embassy is a critical resource | LOW | Hardcode for top 30 countries + pull from Places API |
| Mobile-optimized map | Mobile-heavy user base in crisis; map must work on small screens | MEDIUM | Google Maps has mobile-responsive embed; custom controls needed for Hebrew |

### Differentiators (Competitive Advantage)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Curated Chabad house list (not just Google) | Google Places misses many Chabad houses; curated list is more complete | MEDIUM | Seed DB from Chabad.org directory; supplement with Places API |
| Hebrew-language place names + descriptions | Users are Israeli; Hebrew labels reduce cognitive load in a crisis | LOW | Request Hebrew language parameter in Places API (`language=he`) |
| Emergency services overlay (hospitals, police) | Crisis context demands more than just Jewish services | LOW | Additional Places API categories; toggle on/off |
| "Call directly" button | One tap to phone an embassy or Chabad house | LOW | `tel:` protocol link from Places phone field |
| Offline-capable saved locations | Network unreliable in crisis; save 3-5 key places to localStorage | MEDIUM | Service worker + localStorage; progressive enhancement |
| Cluster pins at low zoom | Many pins at low zoom = unusable map | LOW | Google Maps MarkerClusterer library |

### Anti-Features (Deliberately NOT Build)

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| User-submitted place edits | Misinformation risk in crisis; someone submits fake embassy | Admin-only edits to curated list; rely on Google Places for community-verified data |
| Custom reviews / ratings | Google already has reviews; duplicate effort; moderation burden | Link to Google Maps listing which has reviews |
| Building a full POI database | Google Places already has it; rebuilding is wasted months | Use Places API as primary source; curated list only for Chabad/synagogues |
| Real-time capacity / wait time | Would require integrations with each place — impossible to maintain | Omit; user calls ahead |

### Feature Dependencies — Module 2

```
Google Maps API key (project setup)
    └──required by──> Map embed
    └──required by──> Places API search
    └──required by──> Geolocation + current location

Curated Chabad DB (seeded manually)
    └──enhances──> Places API results (fill gaps)

Hebrew locale setting
    └──enhances──> Places API language parameter
```

---

## Module 3: Live News Aggregator

RSS feeds, government alerts, embassy notices. Urgent alert banners.

### Table Stakes (Users Expect These)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Chronological news feed | Users expect latest news first; any other default is wrong | LOW | Sort by pubDate from RSS |
| Source attribution (which outlet) | Users need to evaluate credibility of each item | LOW | Display feed source name + favicon |
| Urgent alert banner (pinned top) | This is a crisis platform — alerts must be unmissable | LOW | Admin-created; pinned above feed; dismissible per-session |
| Multi-source aggregation | Single source = single point of failure + bias | MEDIUM | Parse 10-20 RSS feeds; deduplicate similar stories |
| Article link → external source | Yachad doesn't host articles; links open originals | LOW | `target="_blank"` with `rel="noopener noreferrer"` |
| Hebrew and English sources | Primary user base reads Hebrew; some only English | LOW | Tag feeds by language; separate tabs or mixed feed with lang badge |
| Auto-refresh interval | Crisis news moves fast; stale feed = useless | LOW | Polling every 5-10 minutes; show "last updated X min ago" |

### Differentiators (Competitive Advantage)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Admin-promoted story (pinned, marked "Important") | Admin can surface critical information above algorithmic noise | LOW | Admin toggle on any article; "Promoted by Yachad" badge |
| Source trust tiers (government / major outlet / blog) | In a crisis, misinformation is dangerous; trust signals matter | LOW | Tag each feed with tier: Official / Verified / Community |
| Country filter on news | User stranded in Thailand doesn't need news about Berlin | MEDIUM | Tag articles by country mention; geo-filter toggle |
| Breaking news push notification | First platform to notify user of critical update wins loyalty | HIGH | Requires push notification infrastructure (web push API + service worker) |
| Embassy notice parsing (separate section) | Embassy notices are highest-value content; bury them in feed = miss | MEDIUM | Dedicated section; scrape/RSS from target embassy sites |
| Article summary (AI) | Long articles are inaccessible in crisis; one-paragraph summary | HIGH | OpenAI API call per article; significant cost; defer post-launch |

### Anti-Features (Deliberately NOT Build)

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| User-submitted news tips | Misinformation vector; moderation burden | Community feed (Module 4) handles UGC; news is curated-only |
| Full article text scraping / re-hosting | Copyright violations; ToS issues with publishers | Link to originals; show title + description + source only |
| Comments on news articles | News sections with comments become misinformation amplifiers in crisis | Use community feed for discussion; news is read-only |
| Real-time Twitter/X stream integration | X API costs prohibitive ($$$); requires ToS compliance | Curate RSS from official government + major outlet feeds |
| Personalized algorithmic feed | In a crisis, the algorithm might hide critical information | Chronological + admin-promoted; never algorithmically ranked |

### Feature Dependencies — Module 3

```
RSS parser (server-side, edge function)
    └──required by──> News feed content
    └──required by──> Auto-refresh
    └──required by──> Country tagging

Admin alert creation
    └──required by──> Urgent alert banner
    └──required by──> Promoted story

Admin panel (Module 7)
    └──required by──> Manage RSS feed sources
    └──required by──> Create/edit/delete alerts
```

---

## Module 4: Social Community Feed

Facebook-style posts, real-time updates, location-based.

### Table Stakes (Users Expect These)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Create text post | The baseline of any social feed | LOW | Textarea + submit; 1000 char limit |
| Image upload on post | Users share photos of conditions, receipts, flight boards | MEDIUM | Convex file storage; image compression before upload |
| Like / reaction on post | Any social platform without reactions feels broken | LOW | Single like button; optionally 3 reactions (thumbs up, heart, alert) |
| Comment on post | Discussion is core; posts without comments have no engagement | LOW | Threaded or flat; flat is sufficient for MVP |
| Real-time feed updates | Crisis information is time-sensitive; stale feed = abandoned app | MEDIUM | Convex subscriptions handle this natively |
| Post author display (name, avatar) | Users need to evaluate who is posting | LOW | Pull from Clerk user profile |
| Timestamp on posts | "Posted 3 minutes ago" is critical for crisis context | LOW | Relative time (dayjs) |
| Delete own post | Users expect to correct mistakes | LOW | Own posts only; admin can delete any |
| Report post (misinformation / spam) | Community moderation is essential in crisis | LOW | Flag button → notifies admin queue |

### Differentiators (Competitive Advantage)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Location tag on posts (country/city) | Browse by "What's happening in Thailand right now" | MEDIUM | User selects from country/city dropdown on post creation; filter feed by location |
| Post categories (Help Needed / Offering Help / Info / Warning) | Structured tagging makes the feed scannable in chaos | LOW | Colored badge; filter feed by category |
| Pinned admin posts | Admin can pin official announcements to top of feed | LOW | Admin role toggle; always-top display |
| Safety check post type ("I am safe in [city]") | Reduces "is everyone okay" noise; structured status sharing | LOW | Dedicated post type; aggregated "X people safe in Bangkok" display |
| Emergency alert icon on high-urgency posts | Admins can flag posts as high-urgency; visual differentiation | LOW | Admin-only action; red border/icon on card |
| Search / filter feed by keyword | Crisis feeds get noisy fast; users need to find specific info | MEDIUM | Full-text search on Convex; or client-side filter for MVP |

### Anti-Features (Deliberately NOT Build)

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Video posts | Storage and bandwidth costs prohibitive; encoding complexity | Text + image only; link to YouTube if video needed |
| Algorithmic ranking (engagement-based sort) | Crisis misinformation spreads fastest when engagement-ranked | Chronological by default; category filter for curation |
| Anonymous posts | Accountability is critical in crisis; anonymous = spam vector | Require auth; display name always shown |
| Infinite nested comment threads | Reddit-style threading adds implementation complexity with little gain | Flat comments under post; 2 levels max if needed |
| Facebook-style reactions (6 types) | Over-engineered for crisis context | Like + 2 contextual reactions max; keep UI clean |
| User follow graph / friend connections | Social graph is out of scope; this is an emergency tool not a social network | Country/location grouping replaces follow graph |

### Feature Dependencies — Module 4

```
Auth (Clerk)
    └──required by──> Post creation
    └──required by──> Like / comment
    └──required by──> Report post

Convex real-time subscriptions
    └──required by──> Real-time feed updates
    └──required by──> New comment notification

Admin panel (Module 7)
    └──required by──> Pin post
    └──required by──> Flag as urgent
    └──required by──> Moderation queue (reported posts)

Location data (user profile or post-level)
    └──required by──> Location-based feed filter
```

---

## Module 5: Chat System

Country groups, emergency group, DMs.

### Table Stakes (Users Expect These)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Group channels by country | Primary segmentation for Israelis abroad; "I'm in Thailand, show me Thailand chat" | LOW | Pre-created rooms per country; user joins on profile setup |
| Emergency / all-users channel | Single channel where critical announcements reach everyone | LOW | Read-mostly; admins can post; users react/comment |
| Direct messages (DMs) | Users need to coordinate privately | MEDIUM | 1:1 only for MVP; group DMs are v2 |
| Message history (persistent) | Users rejoin chat expecting to see prior conversation | LOW | Convex stores all messages; paginated load |
| Typing indicator | Standard chat expectation; signals active conversation | LOW | Convex presence API |
| Unread message count badge | Users need to know where new activity is | LOW | Badge on channel name in sidebar |
| Message timestamps | Critical for crisis; "sent 4 minutes ago" matters | LOW | Relative time display |
| Emoji reactions on messages | Expected in any modern chat | LOW | Simple thumbs-up + few emojis; not a full emoji picker |
| Image sharing in chat | Users share flight boards, maps, conditions photos | MEDIUM | Same Convex file storage as feed; size limit |

### Differentiators (Competitive Advantage)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Admin broadcast to all channels | Single message from admin reaches every country channel simultaneously | MEDIUM | Admin writes once; fan-out to all channels; marked "Admin Broadcast" |
| Pinned message per channel | Pin the most important info (e.g., "Current flight options from Bangkok") | LOW | One pinned message per channel; replaces, not stacks |
| @admin mention that triggers notification | Users can escalate urgent situations to admins directly from chat | LOW | @admin mention → admin push notification |
| Online user count per channel | Shows "47 people in Thailand group" — signals activity | LOW | Convex presence aggregation |
| User mute / block in DMs | Prevents harassment without admin intervention | MEDIUM | User-level mute; blocked user cannot DM |
| Message search within channel | Find that flight info someone posted 3 hours ago | MEDIUM | Full-text search on Convex |

### Anti-Features (Deliberately NOT Build)

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Voice / video chat | WebRTC complexity; Zello / WhatsApp already exist | Link to WhatsApp group in channel description for voice coordination |
| Thread replies (Slack-style) | Threading creates parallel conversation fragmentation; hard to follow in crisis | Flat message stream; keep it simple |
| Custom channel creation by users | Creates fragmentation; 100 users create 50 channels, none monitored | Admin-created country channels + one emergency channel; no user channels |
| End-to-end encryption per message | Conflicts with moderation requirements; implementation complexity | Server-side encryption at rest; visible to admins for moderation |
| Read receipts (double-tick) | Privacy concerns; adds complexity | Unread count badge is sufficient |
| File attachments beyond images | PDFs, docs add storage complexity and attack surface | Images only; for docs, post to community feed |

### Feature Dependencies — Module 5

```
Auth (Clerk)
    └──required by──> Send message
    └──required by──> DMs (both parties must be authed)

Convex real-time subscriptions
    └──required by──> Live message delivery
    └──required by──> Typing indicators
    └──required by──> Online user count

Country/location (user profile)
    └──required by──> Auto-join country channel on signup

Admin panel (Module 7)
    └──required by──> Admin broadcast
    └──required by──> Pin message
    └──required by──> Ban user from channel

Image upload (shared infrastructure)
    └──shared with──> Module 4 (community feed)
```

---

## Module 6: Cancelled Reservation Marketplace

Hotel resale — no payments in v1; users contact sellers directly.

### Table Stakes (Users Expect These)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Post a listing (hotel name, dates, price, location) | The core supply-side action | LOW | Structured form: hotel name, check-in/out, price paid, asking price, room type |
| Browse listings (list + search) | The core demand-side action | LOW | Sort by date, location, price |
| Filter by destination country/city | Users need accommodation in their specific location | LOW | Country dropdown filter |
| Seller contact info (WhatsApp / email) | No payments in v1; contact is the conversion | LOW | Click-to-WhatsApp or email reveal after auth |
| Mark listing as "Sold / No Longer Available" | Prevents wasted contact attempts | LOW | Seller toggle; single click |
| Price comparison to original | Users want to know if it's a deal | LOW | "Original price: $300 / Asking: $180 (40% off)" display |
| Listing expiry (check-in date) | Listings for past dates are worthless; auto-expire | LOW | Cron job or query filter: hide listings where check-in < today |

### Differentiators (Competitive Advantage)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| "Urgent" tag for last-minute (< 48h check-in) | Time-critical resales need visual differentiation | LOW | Auto-badge based on check-in datetime |
| Hotel star rating display | Users want to know the quality tier | LOW | Seller inputs 1-5 stars; or pull from Google Places |
| Cancellation policy display | Crucial for buyers evaluating the deal | LOW | Seller selects from enum: fully refundable / partial / non-refundable |
| Bundle with flights (link to Module 1 listing) | Agent posts flight + hotel together as a package — cross-module value | MEDIUM | Optional link field on reservation listing pointing to a flight listing |
| Map view of available accommodations | Visual discovery beats scrolling a list | MEDIUM | Google Maps with accommodation pins; click to open listing |

### Anti-Features (Deliberately NOT Build)

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| In-app payments / escrow | Requires PCI, fraud protection, legal compliance — months of work | "Contact seller directly; payment arranged externally" |
| Hotel booking verification | Impossible to verify legitimacy without hotel API integration | User responsibility disclosure: "Verify reservation with hotel before payment" |
| Automated pricing suggestions | Algorithmic pricing creates expectation of optimization; misleads in thin market | Simple display of original vs asking price |
| User reviews of sellers | Too low transaction volume at launch for meaningful reviews | Trust through Clerk-verified identity display |
| Airbnb-style rental listings | Out of scope; this is specifically for stranded people reselling existing bookings | Hard limit to hotel reservations only; no new rental listings |

### Feature Dependencies — Module 6

```
Auth (Clerk) — required for posting listings
    └──required by──> Create / edit / delete listing
    └──required by──> Contact seller (reveal contact info)

Admin panel (Module 7)
    └──required by──> Remove fraudulent listings
    └──required by──> Approve listings (optional; could be self-serve)

Date utilities
    └──required by──> Auto-expire past check-in listings
    └──required by──> Urgent badge (< 48h to check-in)

Module 1 (Flights)
    └──optionally linked by──> Package bundle cross-reference
```

---

## Module 7: Admin Panel + Flight Agent Portal

Two separate portal surfaces for different roles.

### Admin Panel — Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Moderation queue (reported posts/messages) | Essential to process user reports | LOW | List of flagged items with approve/remove actions |
| Remove post / message / listing | Core moderation action | LOW | Soft delete + admin log |
| Ban user | Prevent bad actors | LOW | Clerk user metadata flag; middleware checks |
| Flight agent approval workflow | Agents must be vetted before listing flights | LOW | Admin reviews pending agents; approve/reject |
| Create/edit/delete news alerts | Module 3 urgent alerts require admin authoring | LOW | Rich text or markdown + publish/unpublish |
| Manage RSS news sources | Add/remove feeds from the aggregator | LOW | CRUD on feed URLs with active toggle |
| Platform stats overview | Know how many users, listings, posts exist | MEDIUM | Convex aggregation queries; basic dashboard |

### Admin Panel — Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Broadcast message to all users | One message reaches all users simultaneously | MEDIUM | Push notification + pinned banner + feed post |
| Geo-targeted alert (e.g., only users in Israel) | Alert only relevant users; reduces noise for others | MEDIUM | User location tag from profile + filter |
| Audit log (who did what) | Accountability for admin actions | LOW | Log admin_id, action, target_id, timestamp |
| Misinformation strike system | Warn → suspend → ban escalation | MEDIUM | Strike counter on user record; threshold triggers |
| Agent performance visibility | How many flights listed, how many contacts received | MEDIUM | Convex aggregation on agent_id |

### Flight Agent Portal — Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Create new flight / package listing | The core agent action | MEDIUM | Multi-step form: flight details, package components, seat count, price |
| Edit existing listing (price, seats, status) | Flights change; agents need to update | LOW | Edit form; all fields editable |
| Delete listing | Agent needs to remove cancelled flights | LOW | Soft delete; removes from public view |
| Mark flight as "Full" | Fast action to update capacity without deleting | LOW | Single button toggle on listing card |
| Dashboard: view all my listings | Agent needs overview of what they've posted | LOW | Filtered listing view by agent_id |
| Listing status (active / full / cancelled) | Clear state management for agent | LOW | Status enum; displayed as colored badge |

### Flight Agent Portal — Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Bulk listing upload (CSV) | Agents listing 20 flights don't want 20 form submissions | HIGH | CSV template + parse + validate + create batch |
| Contact inquiry tracker | How many users have asked about each flight | MEDIUM | Log WhatsApp/phone click events per listing; count display |
| Listing performance (views, contacts) | Agent sees which listings get attention | MEDIUM | View count + contact click count per listing |
| Notification when flight is inquired about | Agent knows when someone is interested | MEDIUM | Push notification or email on contact click |
| Package builder (visual) | Compose flight + hotel + transfer as one offering | HIGH | Multi-entity form; rich enough to be complex |

### Anti-Features — Admin + Agent

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Custom workflow builder for moderation | Too abstract; every workflow needs code anyway | Hardcode the moderation steps for v1 |
| Agent financial dashboard (revenue tracking) | No in-app payments; nothing to track | Link to external payment records if needed |
| Multi-admin role tiers (super-admin, moderator, viewer) | Over-engineering for a small admin team | Single admin role; differentiate in v2 if needed |
| Automated AI content moderation | AI moderation requires training data and tuning for Hebrew + crisis context | Manual moderation queue for v1; add AI flag later |

### Feature Dependencies — Module 7

```
Clerk roles (admin, flight_agent, user)
    └──required by──> Admin middleware protection
    └──required by──> Agent middleware protection
    └──required by──> All admin actions
    └──required by──> All agent actions

Module 3 (News)
    └──reads from──> Admin: manage RSS sources, create alerts

Module 4 (Feed)
    └──reads from──> Admin: moderation queue, pin posts

Module 5 (Chat)
    └──reads from──> Admin: moderation queue, broadcast

Module 1 (Flights)
    └──reads from──> Agent: create/edit/delete listings
    └──reads from──> Admin: approve agents who list flights

Module 6 (Reservations)
    └──reads from──> Admin: remove fraudulent listings
```

---

## Cross-Cutting Feature Landscape

### Table Stakes (Platform-Wide)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Authentication (sign up / sign in) | Every user action requires identity | LOW | Clerk; social login (Google) recommended for Israeli users |
| Hebrew RTL layout | Primary language of users; any LTR Hebrew feels broken | MEDIUM | TailwindCSS `dir="rtl"` + `font-family` for Hebrew; shadcn/ui RTL compatibility |
| Mobile-responsive UI | Mobile-heavy usage in crisis; desktop is secondary | MEDIUM | TailwindCSS responsive prefixes; test on iPhone |
| Role-based route protection | Agents and admins must not access each other's portals | LOW | Clerk middleware + Next.js middleware.ts |
| Dark mode | Project requirement; expected by Israeli tech users | LOW | Tailwind `dark:` classes + system preference detection |
| Loading states | Real-time app has latency; skeleton screens prevent "broken" perception | LOW | shadcn/ui Skeleton component |
| Error handling with user-friendly messages | Network failures happen; generic errors = panic in crisis | LOW | Error boundary + toast notifications |
| Rate limiting on writes | Anti-spam on posts, messages, listings | MEDIUM | Convex rate limiting or middleware |

### Differentiators (Platform-Wide)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Single-dashboard design (all 7 modules accessible from one screen) | Crisis users cannot navigate complex multi-page apps | MEDIUM | Sidebar nav with module icons; active module = main content area |
| Offline-graceful degradation (show cached data when offline) | Network unreliable in crisis zones | HIGH | Service worker + cache API; complex to implement correctly |
| Multi-language (Hebrew / English) toggle | English for diaspora Israelis who don't read Hebrew | MEDIUM | next-intl; all copy in both languages |
| Push notifications (web push) | Real-time alerts reach user even when app is not open | HIGH | Service worker + Web Push API + VAPID keys |
| Safety check mechanism (I am safe in [city]) | Gives families visibility into loved ones' status | LOW | Simple post type in feed; low implementation cost, high emotional value |

### Anti-Features (Platform-Wide)

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Native mobile app (iOS/Android) | Doubles development time; web app is sufficient | Responsive web; add PWA manifest for home screen install |
| User-to-user payment (Venmo/PayPal integration) | Legal, compliance, fraud liability | "Arrange payment directly" disclaimer on all marketplace contacts |
| Telegram bot / SMS notifications | Separate infrastructure stacks; not blocking launch | Web push notifications are sufficient for v1 |
| Verification of listings (flight actually exists) | Impossible without airline API integration | User disclaimer + reporting system + admin removal |
| Multilingual beyond Hebrew/English | Unnecessary for Israeli user base | Two languages only; translation keys ready for future |
| Real-time offline sync (conflict resolution) | PWA offline sync is a complex engineering problem | Cache for read; require network for writes |

---

## Feature Dependencies (Cross-Module)

```
Auth System (Clerk)
    └──required by──> ALL modules (posts, listings, messages, admin actions)

Convex real-time subscriptions
    └──required by──> Module 4 (feed), Module 5 (chat), Module 1 (flight status)

User profile (location / country)
    └──required by──> Module 4 (location-tagged posts)
    └──required by──> Module 5 (auto-join country channel)
    └──required by──> Module 7 (geo-targeted alerts)

Admin panel (Module 7)
    └──manages──> Module 1 (agent approval)
    └──manages──> Module 3 (news sources, alerts)
    └──manages──> Module 4 (post moderation)
    └──manages──> Module 5 (chat moderation)
    └──manages──> Module 6 (listing removal)

Shared file upload (Convex storage)
    └──used by──> Module 4 (feed images)
    └──used by──> Module 5 (chat images)
    └──used by──> Module 1 (flight listing images, optional)

Google Maps/Places API
    └──required by──> Module 2 (service locator)
    └──optionally used by──> Module 6 (hotel location map)
```

---

## MVP Definition

### Launch With (v1) — All 7 Modules Required

Per PROJECT.md, all modules ship together because the crisis demands the full feature set. Within each module, prioritize ruthlessly:

- [ ] Module 1: Listing creation + browse + filter + WhatsApp contact — no packages, no agent analytics
- [ ] Module 2: Map + current location + category filter + place details — no curated Chabad list, use Places API only
- [ ] Module 3: RSS aggregator + admin alert banner + source display — no push notifications, no AI summaries
- [ ] Module 4: Create post + image + like + comment + real-time + report — no location filter, no categories
- [ ] Module 5: Country group chats + emergency channel + DMs — no voice, no threading
- [ ] Module 6: Post listing + browse + filter + seller contact — no map view, no package bundles
- [ ] Module 7: Admin moderation queue + agent approval + news management + agent listing CRUD — no analytics

### Add After Validation (v1.x)

- [ ] Module 1: Package bundles (flight + hotel + transfer) — when agents confirm demand
- [ ] Module 2: Curated Chabad house DB — when community requests accuracy gaps
- [ ] Module 3: Web push notifications for breaking news — when infrastructure is stable
- [ ] Module 4: Location-based feed filter + post categories — when feed volume creates noise
- [ ] Module 5: Admin broadcast to all channels — after admin workflow validated
- [ ] Module 6: Map view of accommodations — after listing volume justifies it
- [ ] Module 7: Agent analytics (views, contacts) — after first wave of agent usage

### Future Consideration (v2+)

- [ ] AI article summaries in news — cost and complexity; validate user demand first
- [ ] Offline-capable PWA with service worker — after core app is stable
- [ ] Bulk CSV upload for agents — only if agents complain about manual entry volume
- [ ] SMS notifications — only if push notification engagement is insufficient
- [ ] Flight agent review/rating system — only after 50+ completed extractions
- [ ] Multilingual beyond Hebrew/English — only if non-Hebrew-speaking diaspora volume justifies it

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Flight listing + browse | HIGH | LOW | P1 |
| Agent WhatsApp contact | HIGH | LOW | P1 |
| Services map + current location | HIGH | LOW | P1 |
| Urgent alert banner | HIGH | LOW | P1 |
| News RSS feed | HIGH | MEDIUM | P1 |
| Country group chats | HIGH | MEDIUM | P1 |
| Real-time feed updates | HIGH | LOW (Convex) | P1 |
| Reservation listing + browse | HIGH | LOW | P1 |
| Admin moderation queue | HIGH | LOW | P1 |
| Agent approval workflow | HIGH | LOW | P1 |
| Hebrew RTL layout | HIGH | MEDIUM | P1 |
| Post categories + location tags | MEDIUM | LOW | P2 |
| Package bundles (flight + hotel) | MEDIUM | MEDIUM | P2 |
| Agent listing analytics | MEDIUM | MEDIUM | P2 |
| Curated Chabad DB | MEDIUM | MEDIUM | P2 |
| Web push notifications | HIGH | HIGH | P2 |
| Admin broadcast | HIGH | MEDIUM | P2 |
| Safety check post type | MEDIUM | LOW | P2 |
| Map view of accommodations | MEDIUM | MEDIUM | P2 |
| AI article summaries | LOW | HIGH | P3 |
| Offline PWA | MEDIUM | HIGH | P3 |
| Bulk CSV agent upload | LOW | HIGH | P3 |
| SMS notifications | MEDIUM | HIGH | P3 |
| Agent review/rating system | LOW | MEDIUM | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

---

## Competitor Feature Analysis

| Feature | Facebook Crisis Response | Roomer (hotel resale) | Avinode (charter) | Nextdoor (community) | Our Approach |
|---------|--------------------------|----------------------|-------------------|----------------------|--------------|
| Safety check / "I'm safe" | Yes — Safety Check tool | N/A | N/A | Loosely via posts | Simple post type; not a dedicated feature yet |
| Community help posts | Yes — structured ask/offer | N/A | N/A | Yes | Community feed with category tags |
| Group channels by geography | Groups (user-created) | N/A | N/A | By neighborhood | Admin-created country channels; no user-created channels |
| Flight listing marketplace | No | No | Yes (charter) | No | First mover: extraction flights for nationals |
| Hotel resale | No | Yes — core product | No | Occasionally via posts | Simplified version; no payments |
| Services locator | No | No | No | Partial (business listings) | Dedicated Jewish/Israeli services locator |
| News aggregation | No | No | No | No | Differentiated: curated crisis news for Israelis |
| Hebrew-first UI | No | No | No | No | Core differentiator; no competitor addresses Israeli diaspora specifically |

---

## Sources

- [Crisis Management Apps: 9 Life-Saving Features — 3 Sided Cube](https://3sidedcube.com/blog/disaster-management-apps-features-save-lives)
- [Top 8 Emergency Response Tools 2025 — Rocket.Chat](https://www.rocket.chat/blog/emergency-response-tools)
- [Facebook Safety Check — Wikipedia](https://en.wikipedia.org/wiki/Facebook_Safety_Check)
- [A New Center for Crisis Response on Facebook — Meta](https://about.fb.com/news/2017/09/a-new-center-for-crisis-response-on-facebook/)
- [Best Emergency Management Software 2026 — Coram.ai](https://www.coram.ai/post/best-emergency-management-software)
- [Sell Hotel Reservation — Roomer](https://www.roomertravel.com/sell)
- [Plans Change — Hotel Resale Platform](https://www.planschange.com/)
- [SpareFare — How to Sell Hotel Reservation](https://sparefare.net/blog/How_to_Sell_Your_Hotel_Reservation)
- [Private Air Charter Marketplace Trends 2025 — Avi-go](https://avi-go.com/newsroom/articles/private-air-charter-marketplace-trends-2025)
- [Emergency Response Charter — Air Charter Service USA](https://www.aircharterserviceusa.com/specialist-solutions/emergency-response)
- [B2B Travel Agent Portal Features — FlightsLogic](https://www.flightslogic.com/b2b-travel-agent-portal.php)
- [Google Places API Overview — Google Developers](https://developers.google.com/maps/documentation/places/web-service/overview)
- [Iran Conflict Strands Tens of Thousands Israelis Abroad — Times of Israel](https://www.timesofisrael.com/iran-conflict-strands-tens-of-thousands-of-israelis-abroad/)
- [Are You Safe? Facebook Safety Check and Emergency Management — Brookings](https://www.brookings.edu/articles/are-you-safe-facebooks-safety-check-and-the-future-of-emergency-management/)
- [Bridgefy: Offline Mesh Messaging App — Alchemist Accelerator](https://www.alchemistaccelerator.com/blog/bridgefy-the-offline-messaging-app-revolutionizing-crisis-communication-worldwide)
- [Social Media Use in Disaster Response — Tandfonline](https://www.tandfonline.com/doi/full/10.1080/17538947.2025.2521791)

---

*Feature research for: Crisis-response platform for Israelis abroad (Yachad)*
*Researched: 2026-03-03*
