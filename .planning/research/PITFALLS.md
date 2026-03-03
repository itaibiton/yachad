# Pitfalls Research

**Domain:** Real-time crisis-response platform (wartime evacuation, Israeli diaspora)
**Researched:** 2026-03-03
**Confidence:** MEDIUM-HIGH (WebSearch verified against official docs for most items)

---

## Critical Pitfalls

### Pitfall 1: Convex List Subscription Bandwidth Explosion

**What goes wrong:**
Any update to a single document in a list causes Convex to re-transmit the entire query result to every subscribed client — not just the changed row. A community feed with 200 posts updating every few seconds means every connected client gets the full 200-post payload on each update. At 500K concurrent users this does not scale: one developer hit the 1 GB/month bandwidth cap during *pre-production* with a small dataset.

**Why it happens:**
Convex's reactive engine tracks query dependencies at the function level. When any document in a query's result set changes, the entire query re-runs and the full result is re-sent. This is by design for correctness but catastrophic for wide-result queries under high write frequency.

**How to avoid:**
- Paginate every list query aggressively: `paginationQuery` with small page sizes (20-50 items)
- Never subscribe to unbounded lists. Always index and filter to a narrow slice
- Split "hot" frequently-updated fields (view counts, like counts, `updatedAt`) into a *separate table* from the main document. A document changed in the hot table does not invalidate queries touching only the cold table
- For the social feed, news, and chat: use cursor-based pagination — clients subscribe to a windowed page, not the entire collection
- Monitor bandwidth from day one using Convex dashboard metrics; set alerts before hitting plan limits

**Warning signs:**
- Convex dashboard shows bandwidth climbing much faster than user count
- Queries returning 50+ documents subscribed by many clients
- Feed or chat mutations are frequent and users are subscribed to the full list

**Phase to address:** Phase 1 (Database schema design) — data model decisions are near-impossible to fix post-launch without full migrations. Hot/cold table separation must be designed before writing a single query.

---

### Pitfall 2: Convex OCC Conflicts on Hot Documents Under High Write Contention

**What goes wrong:**
Convex uses Optimistic Concurrency Control (OCC). When two mutations read the same document and one commits first, the other is retried automatically. Under high write rates to the same document ("hot document"), this creates a cascade of retries that collapses throughput. Benchmarks show OCC systems degrade from 438 TPS to 58 TPS (87% degradation) under Zipfian access patterns with hot accounts.

**Why it happens:**
A crisis platform has natural hot spots: the global emergency chat room, the urgent news alerts document, "flights available" counters, and the admin moderation queue. Every user reads and writes to these. With 50K concurrent users all hitting the same document, conflicts multiply exponentially.

**How to avoid:**
- **Counter pattern**: Never store running counts in the main document. Use sharded counters or compute counts from index scans
- **Queue pattern**: For the flight listings and reservation feeds, use a queue index where writes append to the tail and reads pull from the head — no two mutations touch the same range
- **Predicate locking**: Scope mutations to narrow index ranges (e.g., "flights departing today from $country") instead of reading all flights
- **Chat rooms**: Partition country-based chat channels into sub-channels or buckets so not all writes contend on a single "messages" table scan
- Design mutation functions to read the absolute minimum number of documents needed

**Warning signs:**
- Convex logs show repeated "write conflict" or "transaction retry" errors
- Mutation latency spikes under load even though per-mutation logic is simple
- Operations on global state (alerts, news, chat room membership) start failing under concurrent load

**Phase to address:** Phase 1 (Schema) + Phase 3 (Real-time features). Schema must avoid hot document patterns from the start. Chat and feed performance must be load-tested before launch.

---

### Pitfall 3: Clerk Auth Not Enforced in Convex Backend Functions

**What goes wrong:**
Developers secure the Next.js middleware and client components with Clerk, then assume Convex is protected. But Convex functions are a public API — any authenticated request with a valid Convex token can call any mutation, including agent-only and admin-only functions. Forgetting `ctx.auth.getUserIdentity()` checks inside Convex functions means a regular user can call `createFlight()` or `approveAgent()` directly by crafting a request.

**Why it happens:**
The Clerk + Convex auth flow creates a false sense of security at the middleware layer. Multi-layer auth (middleware → client → Convex backend) feels redundant so developers skip the Convex layer. Additionally, the `useConvexAuth()` hook can complete *before* the Clerk session token is fully propagated, allowing unauthenticated requests to slip through the client layer.

**How to avoid:**
- Every Convex mutation and query that touches sensitive data must call `ctx.auth.getUserIdentity()` and throw if the user is unauthenticated
- Role checks (agent, admin) must be enforced *inside* Convex functions, not only in middleware. Store the Clerk role in Convex user records and verify it on every write
- Use `"skip"` in `useQuery` to prevent queries from firing before `isAuthenticated` is confirmed in `useConvexAuth()`
- For admin and agent operations, prefer Convex `internalMutation` — functions not callable from client code at all
- JWT template in Clerk must be named exactly `"convex"` — any other name silently breaks authentication

**Warning signs:**
- Convex functions accessible without error when called with a fresh auth token from a non-agent user
- Client components rendering before `isAuthenticated` is true (check for flash of content)
- Tests pass in dev but auth breaks in production after deploying (often a JWT template misconfiguration)

**Phase to address:** Phase 1 (Auth scaffolding). Role-based guards in Convex functions must be established as part of the base infrastructure, not added retroactively.

---

### Pitfall 4: RTL Is Not "Add dir=rtl" — Full Interface Mirror Required

**What goes wrong:**
Developers add `<html dir="rtl">` or set CSS `direction: rtl` and consider RTL done. In practice, dozens of component behaviors are wrong: navigation menus stay left-aligned, back arrows point the wrong way, animations slide in the wrong direction, `padding-left` and `margin-right` values don't flip, icon positions are mirrored incorrectly, and progress bars fill right-to-left when they shouldn't.

**Why it happens:**
CSS `direction: rtl` only flips *text* flow. Physical CSS properties (`margin-left`, `padding-right`, `left`, `right`, `border-left`) are *not* automatically mirrored. Standard UI libraries (shadcn/ui, Radix) are built LTR-first with physical properties throughout.

**How to avoid:**
- Use CSS **logical properties** throughout the entire codebase: `padding-inline-start` instead of `padding-left`, `margin-inline-end` instead of `margin-right`, `inset-inline-start` instead of `left`. This enables correct RTL/LTR flipping via a single `dir` attribute
- Audit every shadcn/ui component for physical CSS overrides — many will need RTL-specific adjustments
- Set `dir="rtl"` on the `<html>` tag dynamically based on locale, not on individual components
- Test with **real Hebrew content** — not placeholder text. Hebrew words are longer/shorter than English equivalents in ways that break flexible layouts
- Map positions: sidebar moves right, breadcrumbs reverse, notification bell is on the left, sort chevrons flip
- Use Storybook or similar to validate each component in both LTR and RTL before shipping

**Warning signs:**
- Any use of `pl-`, `pr-`, `ml-`, `mr-` Tailwind classes without a corresponding `rtl:` variant
- UI screenshots that look identical in both locales
- Components using `left-0` or `right-0` for absolute positioning without RTL awareness

**Phase to address:** Phase 1 (Foundation). RTL must be baked into the design system from the first component. Retrofitting RTL onto a completed LTR codebase is a multi-week rewrite.

---

### Pitfall 5: Google Maps Places API Cost Explosion Without Budgeting

**What goes wrong:**
The March 2025 Google Maps Platform pricing overhaul replaced the flat $200/month credit with per-SKU free tiers and tiered billing. The Nearby Search (New) API costs significantly more per request than the legacy version. Using Pro-tier fields (photos, reviews, opening hours) in a Place Details request causes billing at the Pro SKU rate even if you only needed the address. At 500K users browsing the Jewish services map, API costs can reach thousands of dollars per day.

**Why it happens:**
Developers use the Places API (New) without field masks, fetching all available fields by default. Every map view triggers fresh API calls. No caching layer sits between the client and Google's API. Emergency usage spikes are not planned for.

**How to avoid:**
- **Always use field masks**: Request only the fields you display (`displayName`, `formattedAddress`, `location`, `types`). Never request photo or review fields unless displaying them
- **Cache Place Details aggressively**: Jewish community locations (Chabad, synagogues, kosher restaurants, embassies) don't move daily. Cache in Convex with a 24-hour TTL. One API call serves thousands of users
- **Set hard billing budget alerts** in Google Cloud Console before launch. Set a monthly cap that triggers an alert at 50% and a hard cutoff at 100%
- **Batch and deduplicate**: On the server side, batch nearby search requests for the same area — don't let 1,000 users in Paris each trigger independent Places API searches for "Chabad Paris"
- Use the autocomplete session token pattern (currently free) for the reservation location field

**Warning signs:**
- Google Cloud billing climbing faster than user growth
- Place Details requests appearing in logs without field mask parameters
- No caching layer — every map interaction triggers a live API call

**Phase to address:** Phase 2 (Map module). Implement server-side caching of Places data before the map feature goes live. Set billing alerts on day one of API key creation.

---

### Pitfall 6: Misinformation in the News Feed During Active Crisis

**What goes wrong:**
An RSS aggregator is a trust-laundering machine during wartime. Official-looking accounts from government ministries and established news organizations have been documented publishing wartime misinformation (repurposed old content with false implications, panic-inducing unverified reports). If the platform auto-publishes RSS feeds without editorial oversight, it becomes a misinformation amplifier during the exact moments users most need accurate information.

**Why it happens:**
RSS aggregation feels low-risk ("we're just pulling official sources"). But Israeli-context wartime news is uniquely susceptible: sources post in Hebrew with political framing, satire and sarcasm are indistinguishable from news headlines to automated systems, and information moves faster than verification.

**How to avoid:**
- **Curated allowlist only**: Never open RSS import to user-submitted sources. Admin must manually approve each RSS feed
- **Manual urgent alerts**: The "urgent alert banner" (the most-seen UI element) must be admin-triggered only — never auto-promoted from RSS
- **Timestamp display**: Show publication time prominently so users can see if an article is hours or days old (repurposed old content)
- **Source attribution always visible**: Never strip source name from news items
- **Moderation queue**: Auto-flag items from sources that were previously flagged for bad content
- **Retraction support**: Build the ability to delete/flag a news item platform-wide with a visible correction notice from day one

**Warning signs:**
- Admin panel allows adding RSS sources without review
- Alert banners can be triggered automatically from RSS item metadata
- No mechanism to retract or correct a published news item

**Phase to address:** Phase 2 (News module). The moderation workflow must be designed before the first RSS feed is added. No RSS source goes live before admin approval.

---

### Pitfall 7: Unverified Flight Agents List Fake Flights

**What goes wrong:**
During wartime, desperate people are easy marks for fraud. An unverified "flight agent" lists extraction flights that don't exist, collects contact information and deposits (even informal ones), then disappears. The platform becomes complicit in fraud and loses all trust. Even legitimate agents posting incorrect information (wrong departure time, wrong capacity) can strand people.

**Why it happens:**
Agent onboarding is often the last thing built and the first thing cut for launch speed. Approval workflows are seen as admin overhead, not safety infrastructure.

**How to avoid:**
- **Zero agent self-activation**: No flight listing is published until a human admin explicitly approves the agent's identity. Agents register, upload credentials, and wait for approval — listings are created as drafts invisible to users until agent is approved
- **Verification badge**: Display a visible "Verified Agent" badge on every flight listing, tied to admin approval in the database (not client-side)
- **Convex backend enforcement**: `createFlight` mutation must check agent approval status in the database — not just the Clerk role. A Clerk role alone can be escalated; the database approval flag requires admin action
- **Rapid suspension**: Admin can one-click suspend an agent, which immediately hides all their listings
- **Contact trail**: Log every agent-user interaction (expressed interest in a flight) so there's a record if fraud is reported

**Warning signs:**
- Agent approval is a client-side check only
- Listings go live immediately after agent self-registration
- No admin dashboard showing pending agent approvals on first login

**Phase to address:** Phase 1 (Auth) + Phase 4 (Agent portal). Agent verification must be part of the auth schema design. The approval workflow must be tested before onboarding the first real agent.

---

### Pitfall 8: Next.js App Router Layout Auth Bypass

**What goes wrong:**
A developer protects a route by checking `auth()` in a layout component. They ship. Users report they can navigate directly to `/agent/dashboard` without being agents. The issue: Next.js App Router layouts do *not* re-render on in-subtree navigation. A user authenticated as a regular user who deep-links to `/agent/dashboard` gets the layout's cached auth state, bypassing the agent check.

Additionally, the CVE-2025-29927 vulnerability allowed attackers to bypass Next.js middleware by adding the `x-middleware-subrequest` header — any auth check relying solely on middleware could be bypassed.

**Why it happens:**
The mental model from Pages Router (middleware = complete protection) does not translate 1:1 to App Router. Layout-level auth checks are not re-evaluated on every navigation. Middleware is not a complete security boundary.

**How to avoid:**
- Auth checks must happen at three independent layers: (1) clerkMiddleware in `proxy.ts` (Next.js 16) for route protection, (2) Server Component auth check on each page (not just layout), (3) Convex backend function auth validation
- Never rely on any single layer as the sole security gate
- Strip or block `x-middleware-subrequest` at the CDN/edge before requests reach Next.js
- Route-protect in `clerkMiddleware` using explicit route matchers, not default-public behavior (Clerk middleware makes all routes public by default — opt-in protection is a footgun)
- Test auth by making unauthenticated requests directly to protected API routes and Convex functions, not just by navigating through the UI

**Warning signs:**
- Only one auth check exists for protected routes
- Clerk middleware is present but uses default configuration (all routes public)
- Agent or admin pages accessible via direct URL when logged in as regular user

**Phase to address:** Phase 1 (Auth infrastructure). The three-layer auth pattern must be established before any protected routes are built.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Unbounded list queries in Convex | Simpler code | Bandwidth explosion at scale; entire list re-sent on any item update | Never — use pagination from day one |
| Storing all user data in one Convex document | One fetch for everything | Hot document OCC conflicts; bandwidth waste on partial updates | Never for frequently-updated fields |
| RTL as a CSS afterthought | Ship faster in LTR first | Multi-week retrofit; every component needs physical-to-logical property audit | Never — Hebrew is the primary language |
| Google Maps client-side fetch per user | Simple implementation | Cost explosion; no caching possible | Only for MVP with <100 users and billing cap |
| Agent role from Clerk metadata alone | Fast to implement | Bypassed if Convex backend doesn't double-check DB approval status | Never for security-critical role checks |
| Single `proxy.ts` auth layer | Less code | Single point of failure; bypassed by direct API/Convex calls | Never — defense in depth required |
| Auto-publish all RSS items | Zero admin overhead | Misinformation laundering; no retraction path | Never during active crisis |
| English-first UI with Hebrew "translation" | Faster development | RTL layout breaks everywhere; Hebrew content overflows LTR containers | Never — Hebrew-first means Hebrew-first |

---

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Clerk + Convex | Use Clerk's `useAuth()` to check auth state before Convex queries | Use `useConvexAuth()` — it waits for the Convex token to be fetched and validated, not just the Clerk session |
| Clerk + Convex | Name the JWT template anything other than `"convex"` | The template must be named exactly `"convex"` — ConvexProviderWithClerk hardcodes this name |
| Clerk + Next.js | Assume `clerkMiddleware()` protects all routes | By default, clerkMiddleware makes ALL routes public. Explicitly protect routes with `createRouteMatcher` |
| Clerk webhooks | Use an outdated `@clerk/nextjs` version | Versions before 6.23.3 have CVE-2025-53548 — webhook signature verification bypass. Always pin to current version |
| Convex + Server Components | Fetch Convex data in a Server Component via `fetchQuery` and pass to client components, then subscribe | `fetchQuery` in Server Components returns a snapshot (non-reactive). Must use `preloadQuery` + `usePreloadedQuery` to hand off reactivity to client |
| Google Maps Places (New) | Use the pre-March 2025 legacy API keys | Keys created before March 2025 use the legacy Places API. New keys use Places API (New). Billing models differ significantly |
| Google Maps Places | Request all fields in Place Details | Requesting Pro-tier fields (photos, reviews) bills at Pro SKU rate for the entire request. Use field masks |
| RSS Aggregation | Trust `pubDate` from RSS feeds for ordering | RSS pubDate is self-reported and often wrong/spoofed. Store server-side ingestion time and display both |

---

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Subscribing many clients to a large unfiltered Convex query | Bandwidth cost spikes; slow updates for users | Paginate all lists; use compound indexes to narrow result sets | ~1,000 concurrent subscribers to a 100+ item list |
| Hot document (e.g., global alert state) written by many mutations | OCC conflict errors in Convex logs; mutation latency spikes | Separate hot fields into own table; use sharded counters | ~100 concurrent writers to same document |
| Google Maps Places API called per user request, no server cache | API billing spikes with user growth; Google rate limits | Server-side cache in Convex with 24h TTL for static location data | ~500 unique map sessions/day |
| All 7 modules loading on initial page render | LCP > 3s; Time-to-interactive > 5s on mobile; Hebrew users on 3G connections lose access | Route-based code splitting; defer non-critical modules (chat, feed) behind lazy imports | All page loads for users in crisis-affected regions with poor connectivity |
| No index on Convex queries filtering by country + timestamp | Full table scan; query execution limit hit | Always create compound indexes for every filter combination used in production queries | ~10,000 documents in the table |
| Optimistic UI updates applied incorrectly in chat | Messages appear, disappear, reappear ("flicker") | Implement `withOptimisticUpdate` correctly; timestamp optimistic messages with server-expected ordering | Any chat with >10 messages per second |

---

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Trusting Clerk role metadata for agent/admin checks in Convex without DB verification | Privilege escalation — user manipulates their own Clerk metadata to become an agent | Store and enforce agent approval status in Convex DB, checked in every relevant mutation |
| Exposing user location data from the map without consent | Privacy violation; users stranded abroad don't want their location broadcast | Never store user GPS coordinates in Convex; location searches are client-side only against Google Maps |
| No rate limiting on feed posts, chat messages, or flight contact requests | Spam flooding during crisis by bad actors; platform becomes unusable | Implement Convex rate limiter component on all write mutations; different limits for verified vs. unverified users |
| Flight contact information (phone/email of agent) visible to non-authenticated users | Agent personal info harvested by bots; phishing attacks targeting stranded users | Flight contact details behind auth wall; never in public Convex queries |
| Admin panel accessible via direct URL without Convex backend auth check | Admin functions callable by authenticated non-admin users | Admin operations use Convex `internalMutation` or explicit admin role check in every function |
| Clerk webhook events processed without signature verification | Fake webhook events trigger agent approvals or admin grants | Always verify Svix signature; use `@clerk/nextjs` >= 6.23.3 (CVE-2025-53548 patch) |
| User-generated content (posts, chat) served without sanitization | XSS via Hebrew RTL override characters or markdown injection | Sanitize all UGC before storing; use a safe renderer on display; strip HTML/script from feed content |

---

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Information across multiple tabs/sections (flights on one page, map on another, news elsewhere) | Users in crisis cross-reference multiple sources and lose time; exactly what the LA wildfire app failures showed | Single dashboard view with all critical info visible without navigation |
| Delayed or stale data without a "last updated" timestamp | Users don't know if the flight status or news is current; they may act on hours-old information | Every time-sensitive piece of data shows a relative timestamp ("3 minutes ago") updated in real-time via Convex subscription |
| Complex onboarding flow before users can see flight options | Stranded users abandon before seeing if help is available | Show flight listings and map without authentication; require auth only to contact agent or post |
| Error messages in English only | Hebrew-first users in crisis don't understand what went wrong | All error states, loading states, and empty states must have Hebrew translations |
| No offline/degraded state handling | User loses connection (common in crisis zones); blank screen instead of last-seen data | Cache critical data (flight listings, map data) in browser storage; show "offline — showing cached data" banner |
| Alerts and notifications that can't be dismissed | Users habituate to noise and miss genuine urgent alerts | Distinguish urgent (non-dismissible, high contrast) from informational (dismissible) alerts with distinct visual treatment |
| RTL layout with LTR icons and animations | Cognitive friction; the interface feels "foreign" to Hebrew-speaking users | Mirror all directional icons; ensure animations (slide-in, slide-out) follow RTL direction |

---

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Clerk Auth**: Middleware set up and login flow works — verify that `clerkMiddleware` explicitly protects routes (default is public). Verify Convex backend functions check `ctx.auth.getUserIdentity()` independently.
- [ ] **Agent Portal**: Agents can log in and see a dashboard — verify agents cannot publish flights until admin approval is set in the Convex DB (not just Clerk role).
- [ ] **Hebrew i18n**: All static strings translated — verify RTL layout with actual Hebrew content, especially: navigation direction, icon mirroring, text overflow in fixed-width containers, number formatting (phone numbers, dates, prices).
- [ ] **Real-time feed**: Feed updates in real-time — verify pagination is implemented (not a single unbounded query). Verify bandwidth usage under simulated concurrent load.
- [ ] **News aggregator**: RSS feeds are pulling and displaying — verify admin approval workflow exists before any source is added. Verify urgent alerts are admin-triggered only.
- [ ] **Google Maps**: Location pins appear on map — verify server-side caching is in place. Verify field masks are applied to all Places API requests. Check billing dashboard.
- [ ] **Admin moderation**: Admin can delete posts — verify admin role is checked in the Convex mutation, not only in the UI. Verify suspension of agents immediately hides their listings.
- [ ] **Chat rooms**: Messages appear in real-time — verify chat queries are paginated and bounded. Verify messages are rate-limited per user. Verify content sanitization.
- [ ] **Reservations marketplace**: Users can list cancelled reservations — verify no payment processing path exists (v1 is contact-only). Verify listings can be removed by owner or admin.

---

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Convex bandwidth explosion from unbounded queries | HIGH | Migrate affected queries to paginated versions; requires data model changes; production downtime risk if schema migration needed |
| Hot document OCC collapse | MEDIUM | Add sharded counter table alongside existing table; backfill; deploy hot/cold table split; no downtime but requires careful migration |
| RTL layout broken after launch | HIGH | Audit and replace all physical CSS with logical properties; component-by-component retrofit; estimate 2-4 weeks for 7-module app |
| Google Maps cost overrun | LOW-MEDIUM | Add server-side caching immediately; set billing hard cap; request quota increase from Google; retroactive caching does not reduce accrued costs |
| Fraudulent flight agent listed fake flights | HIGH (trust) | Immediate agent suspension (one Convex mutation); hide all listings; public statement; contact affected users who expressed interest; implement retroactive two-person approval rule |
| Misinformation published via RSS | MEDIUM-HIGH (trust) | Delete item; publish correction banner; audit source; suspend source if repeated; add platform-wide notice about the correction |
| Auth bypass discovered in production | CRITICAL | Immediately restrict affected routes; audit Convex function logs for unauthorized calls; patch all three auth layers simultaneously; force re-authentication for all sessions |

---

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Convex list subscription bandwidth explosion | Phase 1: Schema design | Load test with 1,000 concurrent subscribers to a 100-item paginated feed; confirm bandwidth stays under projections |
| OCC conflicts on hot documents | Phase 1: Schema design | Write concurrent mutation test that fires 100 mutations against same document; confirm retry count stays low |
| Clerk auth not enforced in Convex backend | Phase 1: Auth scaffolding | Write direct HTTP requests to Convex mutations as unauthorized user; confirm all sensitive operations reject |
| RTL incomplete | Phase 1: Design system | Screenshot every component in RTL; review with Hebrew speaker; confirm no physical CSS properties remain |
| Google Maps cost explosion | Phase 2: Map module | Deploy map with field masks + cache; run 1,000 simulated searches; check Google Cloud billing; confirm cost per user is within budget |
| RSS misinformation | Phase 2: News module | Attempt to publish item from unapproved source; confirm admin approval gate blocks it; confirm alert banner requires manual trigger |
| Unverified flight agents | Phase 1 (schema) + Phase 4 (agent portal) | Attempt to create flight listing as non-approved agent; confirm Convex mutation rejects; confirm admin approval flow works end-to-end |
| Next.js App Router layout auth bypass | Phase 1: Auth scaffolding | Direct URL navigation to protected routes as wrong role; confirm redirect or error at every layer |

---

## Sources

- [Convex Bandwidth Concern Issue #95 — get-convex/convex-backend GitHub](https://github.com/get-convex/convex-backend/issues/95)
- [Convex Production Limits Documentation](https://docs.convex.dev/production/state/limits)
- [Convex OCC and Atomicity Documentation](https://docs.convex.dev/database/advanced/occ)
- [Optimize Transaction Throughput: Patterns for Scaling with Convex](https://stack.convex.dev/high-throughput-mutations-via-precise-queries)
- [Convex Rate Limiting Documentation](https://docs.convex.dev/agents/rate-limiting)
- [Authentication Best Practices: Convex, Clerk and Next.js](https://stack.convex.dev/authentication-best-practices-convex-clerk-and-nextjs)
- [Clerk CVE-2025-53548 — Webhook Signature Bypass](https://clerk.com/changelog/2025-07-09-cve-2025-53548)
- [Clerk clerkMiddleware() Documentation](https://clerk.com/docs/reference/nextjs/clerk-middleware)
- [Common Mistakes with Next.js App Router — Vercel Blog](https://vercel.com/blog/common-mistakes-with-the-next-js-app-router-and-how-to-fix-them)
- [6 React Server Component Performance Pitfalls — LogRocket](https://blog.logrocket.com/react-server-components-performance-mistakes)
- [Google Maps Platform Pricing — March 2025 Changes](https://developers.google.com/maps/documentation/places/web-service/usage-and-billing)
- [True Cost of Google Maps API 2026 — Radar Blog](https://radar.com/blog/google-maps-api-cost)
- [RTL in React: Developer's Guide — LeanCode](https://leancode.co/blog/right-to-left-in-react)
- [20 i18n Mistakes in React Apps — Translated Right](https://www.translatedright.com/blog/20-i18n-mistakes-developers-make-in-react-apps-and-how-to-fix-them/)
- [UX Design for Crisis Situations: Lessons from LA Wildfires — UXmatters](https://www.uxmatters.com/mt/archives/2025/03/ux-design-for-crisis-situations-lessons-from-the-los-angeles-wildfires.php)
- [WebSockets at Scale: Lessons from Real-World Implementation — Medium](https://medium.com/@kanishks772/websockets-at-scale-lessons-from-real-world-implementation-3e706b3b31de)
- [Airline Fraud Prevention and Verification — Sumsub](https://sumsub.com/blog/airline-fraud-prevention-user-verification-guide/)
- [Too Little, Too Late: Moderation During Russo-Ukrainian Conflict — ACM Web Science 2025](https://dl.acm.org/doi/10.1145/3717867.3717876)
- [Convex vs Supabase 2025 — Makers' Den](https://makersden.io/blog/convex-vs-supabase-2025)

---
*Pitfalls research for: Real-time crisis-response platform (Yachad — wartime evacuation, Israeli diaspora)*
*Researched: 2026-03-03*
