# Project Research Summary

**Project:** Yachad (יחד) — Real-Time Crisis-Response Platform for Israelis Abroad
**Domain:** Crisis-response community platform / emergency evacuation coordination
**Researched:** 2026-03-03
**Confidence:** HIGH (stack and architecture verified via official docs; features and pitfalls via multiple concordant sources)

---

## Executive Summary

Yachad is a wartime evacuation coordination platform for Israelis stranded abroad, combining a flight-extraction marketplace, Jewish services locator, curated news aggregator, real-time social feed, group chat, hotel reservation resale, and an admin/agent operations portal — all in a single Hebrew-first, RTL-native interface. Expert precedent from comparable crisis platforms (Facebook Safety Check, Everbridge, Bridgefy) and travel marketplaces (Roomer, Avinode) shows this domain demands three non-negotiable properties: sub-second data freshness, defense-in-depth security, and full RTL fidelity from day one. The technology stack — Next.js 15 App Router, Convex, Clerk, TailwindCSS v4, and next-intl v4 — is purpose-fit for all three, provided it is wired together correctly. No single technology in this stack is a stretch; every choice has verified production precedent.

The recommended approach is a four-phase delivery that front-loads all security, database, and i18n infrastructure before writing a single feature component. The foundation phase is non-negotiable: Convex schema indexes, the three-layer auth pattern (middleware + page + Convex function), RTL design system, and hot/cold table separation must all be established before any module is implemented. Feature delivery then proceeds from highest user-value to lowest dependency: core user-facing features (flights, news, map) first, followed by community features (feed, chat, reservations), then the operations layer (agent portal, admin panel). This ordering mirrors both the dependency graph from architecture research and the feature priority matrix from feature research.

The top risks are all preventable in Phase 1 if addressed proactively. Convex's reactive subscription model can generate catastrophic bandwidth consumption if list queries are unbounded — every table must use paginated, indexed queries from schema design. RTL cannot be retrofitted: using TailwindCSS v4 logical properties (`ms-`, `me-`, `ps-`, `pe-`) throughout from the first component prevents a multi-week audit later. Auth must be enforced at three independent layers because Next.js middleware alone is bypassable (CVE-2025-29927 is documented). Flight agent verification must be enforced in the Convex database, not just via Clerk metadata, because fraud during a wartime crisis carries severe trust consequences. Teams that skip these Phase 1 safeguards routinely spend more time retrofitting them than they saved shipping faster.

---

## Key Findings

### Recommended Stack

The stack is Next.js 15 (App Router) + Convex 1.32 + Clerk 6 + TailwindCSS v4 + next-intl v4, deployed to Vercel (frontend) and Convex Cloud (backend). This combination is the de facto standard for Hebrew-first real-time Next.js applications in 2026: all packages ship first-class TypeScript types, integrate natively with each other, and have verified compatibility at the required versions. No viable alternatives exist for this combination — `react-i18next` cannot serve Server Components natively, `socket.io` is redundant with Convex, and the legacy Google Maps Places API is unavailable to new customers as of March 2025.

Three version-critical constraints must be respected: Clerk requires v6.39+ for Next.js 15 and React 19 compatibility; next-intl requires v4 (released March 2025) for App Router Server Component support and mandates TypeScript 5+; Google Places must use the new API (`PlaceAutocompleteElement`, `AutocompleteSuggestion`) because the legacy `Autocomplete` class is not available for new API key registrations. All other library choices (Zustand for client state, Zod+react-hook-form for validation, Tiptap for rich text, date-fns for dates, Sonner for toasts) are well-validated and low-risk.

**Core technologies:**
- **Next.js 15 (App Router):** Full-stack framework — RSC for SEO and SSR, Server Actions for form mutations, Edge middleware for auth and locale routing
- **Convex 1.32:** Database + real-time subscriptions + backend functions — replaces a database, a WebSocket server, and an API layer; TypeScript-first schema generates typed clients automatically
- **Clerk 6:** Auth, RBAC, and session management — `publicMetadata.role` drives middleware route protection; JWT template bridges Clerk identity into Convex
- **TailwindCSS v4 + shadcn/ui:** UI framework — v4 logical properties (`ms-`, `me-`) replace RTL plugin; shadcn copy-paste model avoids version lock-in
- **next-intl v4:** i18n routing and translations — App Router-native, Server Component support via `getTranslations()`, required for Hebrew/English locale switching
- **`@vis.gl/react-google-maps` 1.7:** Maps — Google's officially-endorsed React wrapper; use with new Places API only
- **`@convex-dev/rate-limiter`:** Application-layer rate limiting — mandatory for a crisis platform subject to spam and DDoS

### Expected Features

All 7 modules ship together at v1 — per project definition, the crisis demands the full feature set. Within each module the feature set is tiered. See `.planning/research/FEATURES.md` for the complete module-level breakdown.

**Must have (table stakes — all P1):**
- Extraction flights: listing CRUD, search/filter, WhatsApp contact, seat counter, flight status, urgency badge
- Services map: Google Maps embed, current location, category filter (Chabad/synagogue/kosher/embassy), place details, directions handoff
- News: RSS aggregator (admin-curated sources only), urgent alert banner (admin-triggered only), source attribution, auto-refresh
- Community feed: create/image post, like, comment, real-time updates, report post, delete own post
- Chat: country group channels, emergency channel, DMs, message history, typing indicator, unread badge
- Reservations: list/browse/filter cancelled hotel reservations, seller contact, mark sold, auto-expire
- Admin: moderation queue, agent approval workflow, news alert management, user ban, agent listing CRUD
- Platform-wide: Hebrew RTL layout, auth (Clerk + Google sign-in), mobile-responsive, role-based route protection, rate limiting

**Should have (P2 — add post-launch validation):**
- Package bundles (flight + hotel + transfer + insurance in one listing)
- Curated Chabad house database (supplementing Google Places gaps)
- Web push notifications for breaking news alerts
- Post location tags and category filters (help needed / offering help / info / warning)
- Admin broadcast to all country channels simultaneously
- Map view of available accommodations (Module 6)
- Agent listing analytics (views, contact clicks)
- Safety check post type ("I am safe in [city]")

**Defer to v2+:**
- AI article summaries (cost + complexity; validate demand first)
- Offline-capable PWA with full service worker (after core app is stable)
- Bulk CSV upload for agents (only if agents report manual entry volume as pain point)
- SMS notifications (only if web push engagement is insufficient)
- Flight agent review/rating system (only after 50+ completed extractions)
- Languages beyond Hebrew and English

**Deliberate anti-features (do not build):**
- In-app payments or escrow (PCI/legal complexity; contact-only model is intentional)
- Native iOS/Android apps (responsive web + PWA is sufficient)
- Algorithmic feed ranking (chronological is safer in crisis; engagement-rank spreads misinformation)
- User-submitted RSS sources (misinformation vector; admin allowlist only)
- Voice/video chat (Zello/WhatsApp already exist; link to WhatsApp group instead)
- End-to-end encryption per message (conflicts with moderation requirements)

### Architecture Approach

The architecture is a Convex-first hybrid SSR/real-time pattern: Next.js Server Components preload data via `preloadQuery` for fast initial HTML, then hand off live subscriptions to Client Components via `usePreloadedQuery`. This gives SSR performance with real-time updates without any loading spinners on page load. All 7 feature modules mirror each other on the frontend (`src/modules/`) and backend (`convex/modules/`), with a shared `convex/lib/auth.ts` as the only cross-module dependency. The i18n layer wraps the entire route tree via `app/[locale]/layout.tsx` which sets `dir="rtl"` or `dir="ltr"` at the `<html>` level.

**Major components:**
1. **Clerk Middleware (`middleware.ts`):** First auth layer at the Vercel edge — route protection and locale detection; does NOT substitute for Convex-level auth
2. **Convex Backend (`convex/modules/`):** Authoritative security gate — every mutation calls `requireUser()` / `requireAgent()` / `requireAdmin()` from `convex/lib/auth.ts`; external HTTP calls (RSS, Places) go through Convex Actions only
3. **Next.js Route Groups:** `(public)`, `(dashboard)`, `(agent)`, `(admin)` — independent layouts with independent auth guards; no auth logic bleeds between groups
4. **Convex Actions + Crons:** Background ingestion layer — RSS news fetched every 5 minutes, Google Places data cached hourly; clients query Convex, never Google directly
5. **`ConvexProviderWithClerk`:** Auth bridge — wraps the entire app, automatically passes Clerk JWT to Convex for server-side identity validation in all functions

### Critical Pitfalls

1. **Convex list subscription bandwidth explosion** — Any update to a list re-sends the full query result to every subscriber. Prevention: paginate every list query (20-50 items per page using `usePaginatedQuery`); separate "hot" fields (view counts, like counts) into a dedicated table so they don't invalidate the main list subscription. Must be designed into the schema before writing any query.

2. **Incomplete RTL — `dir="rtl"` is not sufficient** — CSS `direction: rtl` only flips text flow; physical CSS properties (`margin-left`, `padding-right`, `left`, `right`) are not mirrored. Prevention: use TailwindCSS v4 logical properties (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`) exclusively throughout the codebase from the first component. Audit every shadcn/ui component for physical CSS overrides. Test with real Hebrew content. Retrofitting this after launch is a multi-week rewrite.

3. **Auth enforced only in middleware, not in Convex functions** — Convex is a public API; Clerk middleware guards the UI, not the data layer. Prevention: every Convex mutation and sensitive query must call `ctx.auth.getUserIdentity()` independently. Agent and admin operations should use Convex `internalMutation`. The JWT template must be named exactly `"convex"` in Clerk Dashboard.

4. **Unverified flight agents listing fraudulent extraction flights** — In a wartime context, fraud targeting desperate people carries severe legal and trust consequences. Prevention: zero self-activation for agents — listings are drafts invisible to users until a human admin approves the agent's identity in the Convex DB. Agent approval status must be checked in every `createFlight` mutation against the database, not only against Clerk `publicMetadata.role`.

5. **Google Maps Places API cost explosion** — New per-SKU pricing (March 2025) means unbounded Place Details requests without field masks can reach thousands of dollars per day at scale. Prevention: implement server-side caching of Places data in Convex with a 24-hour TTL before the map module goes live; always use field masks; set hard billing budget alerts in Google Cloud Console before launch.

6. **Misinformation in the news feed during active crisis** — RSS aggregation from even "official" sources launders misinformation in wartime. Prevention: admin-only allowlist for RSS sources; urgent alert banners are admin-triggered exclusively; build article retraction/correction capability before the first RSS source goes live.

---

## Implications for Roadmap

Based on combined research, the build must proceed in a strict dependency order. Architecture research is explicit: the schema, auth, and i18n foundation blocks everything else. Pitfalls research confirms that skipping this foundation creates unrecoverable technical debt. Feature research confirms all 7 modules ship at v1 — the phasing is about build order, not feature gating.

### Phase 1: Foundation — Security, Schema, and Design System

**Rationale:** Every subsequent phase depends on the auth pattern, the database schema (indexes cannot be safely added to large production tables without migration), and the RTL design system. Pitfalls research shows that retrofitting any of these after launch costs more than doing them first. Architecture research explicitly calls these out as "blocks everything" dependencies.

**Delivers:**
- Convex schema for all 7 modules with all production indexes defined upfront
- `convex/lib/auth.ts` with `requireUser()`, `requireAgent()`, `requireAdmin()` helpers
- Three-layer auth: `clerkMiddleware()` with explicit route matchers + page-level auth checks + Convex function guards
- Clerk + Convex integration: `ConvexProviderWithClerk`, JWT template named `"convex"`, Clerk webhook → Convex user sync via Svix
- next-intl v4 locale routing (`[locale]` segment), Hebrew/English message files, `dir` attribute on `<html>`
- TailwindCSS v4 logical-property design system (zero physical directional utilities)
- shadcn/ui components audited for RTL correctness
- Dark mode via `ThemeProvider`
- Route group structure: `(public)`, `(dashboard)`, `(agent)`, `(admin)` with independent layouts

**Avoids:** Auth bypass (CVE-2025-29927, Pitfall 8), Convex bandwidth explosion (Pitfall 1, requires indexed schema), RTL retrofit cost (Pitfall 4), agent fraud via Convex DB approval status (Pitfall 7)

**Research flag:** Well-documented patterns — standard Convex/Clerk/next-intl integration. Skip per-phase research; use official docs directly. The Clerk webhook sync pattern (Svix signature verification) needs careful implementation; follow `stack.convex.dev/authentication-best-practices-convex-clerk-and-nextjs` exactly.

---

### Phase 2: Core User-Facing Modules — Flights, News, and Map

**Rationale:** These three modules deliver the primary reason users come to the platform in a crisis. Features research rates all their P1 features as HIGH user value / LOW-MEDIUM implementation cost. Architecture research places them in "Phase 2 — Core User Experience (drives adoption)." They have no inter-module dependencies on each other. Map module requires Google Places caching infrastructure that must be built before launch.

**Delivers:**
- Extraction Flights: marketplace browse + search/filter, flight card (status, seats, urgency badge, WhatsApp contact), preloadQuery + usePreloadedQuery pattern for real-time flight status updates
- News Aggregator: Convex cron action fetching RSS every 5 minutes, `rss-parser` in Convex Action (Node.js runtime), admin alert banner (admin-triggered only), source attribution with trust tier badges, admin UI for managing RSS allowlist
- Jewish Services Map: `@vis.gl/react-google-maps` with new Places API (`PlaceAutocompleteElement`), server-side Google Places caching in Convex (24h TTL), current location detection, category filter, directions handoff, billing alerts configured

**Uses:** Convex Actions for RSS and Places; `usePaginatedQuery` + `react-intersection-observer` for infinite scroll on flights; `rss-parser` in Node.js action runtime; Google Maps field masks to control billing

**Avoids:** Google Maps cost explosion (Pitfall 5 — server-side caching built before launch), RSS misinformation (Pitfall 6 — admin allowlist and manual alert triggers from day one)

**Research flag:** Google Places New API implementation needs research. The migration from legacy `Autocomplete` to `PlaceAutocompleteElement` / `AutocompleteSuggestion` via `useMapsLibrary('places')` is a newer pattern. Reference `@vis.gl/react-google-maps` GitHub discussion #707.

---

### Phase 3: Community Features — Feed, Chat, and Reservations

**Rationale:** These three modules depend on the users table and auth scaffolding from Phase 1. Feed and chat require real-time subscriptions that must be paginated and country-sharded to avoid bandwidth explosion at scale (Pitfall 1). Chat rooms require the country/location user profile field established in Phase 1. Architecture research places these in "Phase 3 — Community Features."

**Delivers:**
- Community Feed: create/image post, like, flat comments, real-time updates via `usePreloadedQuery`, report post, admin pin/flag-urgent, location tag, post categories — all queries paginated and country-sharded
- Chat System: pre-created country channels (auto-join on profile setup), emergency channel, 1:1 DMs, message history (paginated), typing indicators (Convex presence), unread badge, emoji reactions, image sharing via Convex file storage
- Reservations Marketplace: post listing (structured form), browse/filter by country/city, auto-expire past check-in dates, "urgent" badge for <48h listings, seller contact via WhatsApp (auth-gated), mark sold

**Uses:** `usePaginatedQuery` + country-sharded subscriptions for feed and chat; Convex file storage for chat and feed images; rate limiter on all write mutations; `useConvexAuth` skip pattern for auth-gated queries

**Avoids:** Subscription fan-out (feed and chat both sharded by country from schema design, Pitfall 1), OCC conflicts on hot documents (like counts and message view counts in separate table, Pitfall 2)

**Research flag:** Chat architecture at scale needs attention. Convex presence (typing indicators, online user count) patterns are documented but implementation subtleties exist. Chat message pagination and the optimistic UI update pattern for chat need careful implementation to avoid the "flicker" performance trap noted in pitfalls research.

---

### Phase 4: Operations Layer — Agent Portal and Admin Panel

**Rationale:** These portals build on all other modules — admin needs content to moderate (feed, news, chat all required), agent portal needs the flights data model from Phase 2. Architecture research explicitly places both in "Phase 4 — Operations." Agent verification workflow must be fully operational before the first real agent is onboarded.

**Delivers:**
- Flight Agent Portal: listing CRUD (multi-step form with rich text via Tiptap), mark-full one-tap, draft listings (invisible until agent approved), listing dashboard by agent ID, contact inquiry logging, listing status management
- Admin Panel: moderation queue (reported posts, messages, listings), agent approval workflow (approve/reject with DB flag, not just Clerk role), user ban/suspend, broadcast message to all channels, news source management (add/remove from RSS allowlist), alert create/edit/delete, platform stats (Convex aggregation queries), audit log (admin_id + action + target + timestamp)

**Avoids:** Agent fraud (Pitfall 7 — approval workflow tested end-to-end before first real agent); auth bypass on admin routes (Pitfall 8 — `internalMutation` for sensitive admin operations); misinformation via RSS (Pitfall 6 — admin RSS management built and tested in this phase)

**Research flag:** Standard patterns — admin CRUD with Convex `internalMutation` and `requireAdmin()` is well-documented. No additional research phase needed. Audit log implementation should follow append-only Convex document pattern.

---

### Phase Ordering Rationale

- Schema indexes cannot be safely added to large production tables without data migrations — all indexes must be defined in Phase 1 before any data is written.
- RTL layout is applied globally via `<html dir>` — individual components cannot opt in/out — so the design system must precede all component development.
- Convex's `convex/lib/auth.ts` is imported by every module's mutations; it must exist before any module backend function is written.
- Flights and news are the highest user-value, lowest dependency modules — they can be built immediately after foundation without waiting for feed or chat infrastructure.
- Feed and chat both require the `users` table with the `country` field (for channel auto-join and feed sharding), which is established in Phase 1.
- Admin panel requires content in the database to moderate; building it last (Phase 4) allows realistic testing.
- Agent portal requires the flights schema to be stable and migration-safe before the agent-facing forms are designed.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2 (Map module):** New Google Places API (`PlaceAutocompleteElement` + `AutocompleteSuggestion`) is a post-March 2025 migration with limited production examples. Reference vis.gl GitHub discussion #707 and Google's official migration guide before starting implementation.
- **Phase 3 (Chat):** Convex presence patterns for typing indicators and online user count have subtleties. OCC avoidance in high-frequency chat requires careful schema design for the messages table. Load test before launch.

Phases with standard, well-documented patterns (no additional research phase needed):
- **Phase 1 (Foundation):** Convex + Clerk + next-intl integration is thoroughly documented with official guides. Follow `stack.convex.dev/authentication-best-practices-convex-clerk-and-nextjs` exactly.
- **Phase 2 (Flights + News):** `usePaginatedQuery` and Convex Action RSS ingestion are documented Convex primitives. Standard patterns apply.
- **Phase 4 (Admin + Agent):** Convex `internalMutation` with role guards is a documented pattern. No research phase required.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All library versions verified against npm registry on 2026-03-03. Integration patterns from official Convex and Clerk docs. Version compatibility table explicitly validated. |
| Features | MEDIUM | Crisis-response domain patterns well-documented. Extraction flight marketplace is a novel vertical with no direct comparables — feature decisions are informed by analogous markets (hotel resale, charter brokers) rather than exact precedent. |
| Architecture | HIGH | Patterns from official Convex docs (preloadQuery, auth best practices, actions for external calls). Route group structure from production SaaS templates with verified Next.js App Router patterns. |
| Pitfalls | MEDIUM-HIGH | Convex bandwidth and OCC pitfalls from official Convex documentation and confirmed community issues (GitHub #95). Auth pitfalls from official Clerk CVE disclosures and documented Next.js App Router gotchas. RTL pitfall from multiple concordant sources. Google Maps pricing from official March 2025 documentation. |

**Overall confidence:** HIGH

### Gaps to Address

- **Google Places New API implementation details:** The `PlaceAutocompleteElement` + `useMapsLibrary('places')` pattern with `@vis.gl/react-google-maps` has limited production examples. Budget extra time in Phase 2 map implementation for API exploration.
- **Convex presence API for chat:** Typing indicators and online user counts via Convex presence are documented but less battle-tested than core query/mutation patterns. Prototype this in isolation before integrating into the full chat module.
- **Hebrew content layout edge cases:** Research used general RTL guidance; specific Hebrew typographic edge cases (mixed RTL/LTR numbers, phone formatting, date display in Hebrew locale) need validation with a Hebrew speaker reviewing real UI with real content during Phase 1.
- **RSS feed reliability:** RSS `pubDate` is self-reported and often wrong or spoofed. The news module should store server-side ingestion time and display both, as noted in pitfalls research. The curation of which specific Hebrew-language news sources to include (Ynet, Walla, Channel 12, etc.) is an editorial decision not covered in research.
- **Convex scalability ceiling:** Official Convex benchmarks confirm sub-50ms at 5K concurrent users; performance at 50K+ concurrent (the stated target ceiling) is documented architecturally but not with published benchmarks at that scale. The sharding strategies described in architecture research are the correct mitigation.

---

## Sources

### Primary (HIGH confidence)
- [Convex + Clerk official integration docs](https://docs.convex.dev/auth/clerk) — ConvexProviderWithClerk, JWT template, webhook pattern
- [Convex Next.js App Router docs](https://docs.convex.dev/client/nextjs/app-router/) — preloadQuery, usePreloadedQuery, Server Component patterns
- [Convex pagination docs](https://docs.convex.dev/database/pagination) — usePaginatedQuery pattern
- [Convex rate limiter](https://github.com/get-convex/rate-limiter) — @convex-dev/rate-limiter official package
- [Convex OCC documentation](https://docs.convex.dev/database/advanced/occ) — concurrency model and hot document avoidance
- [Authentication best practices: Convex + Clerk + Next.js](https://stack.convex.dev/authentication-best-practices-convex-clerk-and-nextjs)
- [Clerk RBAC with publicMetadata](https://clerk.com/docs/guides/secure/basic-rbac) — role implementation
- [Clerk clerkMiddleware() reference](https://clerk.com/docs/reference/nextjs/clerk-middleware) — route protection patterns
- [Clerk CVE-2025-53548](https://clerk.com/changelog/2025-07-09-cve-2025-53548) — webhook signature bypass; requires @clerk/nextjs >= 6.23.3
- [next-intl v4.0 release + App Router docs](https://next-intl.dev/docs/getting-started/app-router) — Server Component i18n
- [Google Maps Places deprecation page](https://developers.google.com/maps/deprecations) — new API requirements for post-March 2025 projects
- [Google Maps Platform pricing March 2025](https://developers.google.com/maps/documentation/places/web-service/usage-and-billing) — per-SKU billing model
- [Tailwind CSS v4 + shadcn official support](https://ui.shadcn.com/docs/tailwind-v4)
- [Convex Bandwidth Issue #95](https://github.com/get-convex/convex-backend/issues/95) — bandwidth explosion confirmation

### Secondary (MEDIUM confidence)
- [Feature-Sliced Design for Next.js App Router](https://feature-sliced.design/blog/nextjs-app-router-guide) — module boundary pattern
- [UX Design for Crisis Situations: LA Wildfires](https://www.uxmatters.com/mt/archives/2025/03/ux-design-for-crisis-situations-lessons-from-the-los-angeles-wildfires.php) — single dashboard UX finding
- [RTL in React — LeanCode](https://leancode.co/blog/right-to-left-in-react) — physical vs logical CSS properties
- [Radar: True Cost of Google Maps API 2026](https://radar.com/blog/google-maps-api-cost) — cost modeling
- [Private Air Charter Marketplace Trends 2025](https://avi-go.com/newsroom/articles/private-air-charter-marketplace-trends-2025) — marketplace feature patterns
- [Roomer Hotel Resale](https://www.roomertravel.com/sell) — resale marketplace feature benchmarks
- [WebSockets at Scale](https://medium.com/@kanishks772/websockets-at-scale-lessons-from-real-world-implementation-3e706b3b31de) — real-time scaling patterns

### Tertiary (LOW confidence)
- [Lingo.dev RTL Next.js guide](https://lingo.dev/en/nextjs-i18n/right-to-left-languages) — `dir` attribute implementation (third-party; verified against next-intl docs)
- [Convex scalability at 500K+ concurrent](https://docs.convex.world/docs/overview/performance) — official benchmark but not at the target ceiling scale

---

*Research completed: 2026-03-03*
*Ready for roadmap: yes*
