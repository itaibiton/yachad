# Yachad (יחד)

## What This Is

A real-time crisis-response platform for Israelis stranded abroad during wartime. Yachad ("Together") connects stranded Israelis with extraction flights, Jewish community services, reliable news, and each other — all in one Hebrew-first dashboard. Built for an active crisis with tens of thousands of users at launch, scaling to 500K concurrent.

## Core Value

Get stranded Israelis home safely by connecting them with extraction flights, critical local services, and each other in real time.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Extraction flights marketplace with agent portal
- [ ] Jewish services locator (Chabad, synagogues, kosher, embassies) via Google Maps/Places
- [ ] Live news aggregator with urgent alert banners
- [ ] Social community feed (Facebook-style with real-time updates)
- [ ] Chat system (country-based groups, emergency group, DMs)
- [ ] Cancelled reservation marketplace (hotel resale, no payments in v1)
- [ ] Admin panel (moderation, agent approval, news management, alerts)
- [ ] Flight agent portal (dashboard, upload flights/packages, manage listings)
- [ ] Role-based auth (regular user, flight agent, admin) via Clerk
- [ ] Hebrew + English i18n with RTL support
- [ ] Dark mode
- [ ] Fully responsive / mobile-optimized
- [ ] Real-time updates via Convex subscriptions

### Out of Scope

- Payment processing — No in-app payments for v1; users arrange externally. May revisit for agent premium features.
- Mobile native app — Web-first, responsive design covers mobile needs.
- Languages beyond Hebrew + English — Two languages sufficient for Israeli user base.
- Video posts in feed — Storage/bandwidth complexity, defer post-launch.
- Telegram bot / SMS alerts — Bonus features, not blocking launch.
- PWA — Consider post-launch for offline access.

## Context

**Crisis context:** Active wartime situation. Israelis are stranded in various countries and need extraction. Flight agents are ready to list on the platform. The platform must feel reliable and authoritative — this is infrastructure for a national emergency.

**Domain:** yachad.global (to be purchased)

**Existing resources:**
- Clerk, Convex, and Google Maps/Places API accounts exist — need project creation
- Flight agents identified and ready to onboard
- News RSS sources need research/identification

**User demographics:**
- Primary: Israelis abroad (Hebrew-speaking, mobile-heavy usage)
- Secondary: Flight agents (professional users, need efficient dashboard)
- Tertiary: Admins (content moderation, platform management)

**User roles:**
1. **Regular User** — Israeli abroad. Can post, comment, like, share, join chats, browse flights, list cancelled reservations, view maps, see embassy info.
2. **Flight Agent** — Special Clerk role. Dashboard to upload flights and packages (flight + bus/ferry transfer + hotel + insurance combos), edit/delete listings, mark flights full.
3. **Admin** — Moderate posts, remove misinformation, approve flight agents, manage news sources, feature urgent alerts.

## Constraints

- **Tech Stack**: Next.js 16+ (App Router, Turbopack), TypeScript, TailwindCSS, shadcn/ui, Clerk, Convex, Google Maps/Places API, Zustand — all mandatory
- **Performance**: Must handle 10K-50K day-one users, architect for 500K concurrent
- **Language**: Hebrew-first design, full RTL support, English as secondary language
- **Urgency**: Active crisis — ship fast but build properly (no throwaway code)
- **Edge-ready**: Server components, edge functions for news, lazy loading for maps
- **Security**: Role-based middleware, agent verification, anti-spam, rate limiting, content moderation

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Convex for DB + realtime | Built-in subscriptions, serverless, scales well for real-time features | — Pending |
| Clerk for auth + roles | Handles user/agent/admin roles, middleware support, fast to implement | — Pending |
| No payments in v1 | Reduces complexity, users arrange payment externally for reservations | — Pending |
| Hebrew-first, English second | Primary user base is Hebrew-speaking Israelis | — Pending |
| All 7 modules for launch | Crisis demands full feature set — no partial launch | — Pending |
| Google Maps/Places for services | Best coverage for global Jewish services data | — Pending |

---
*Last updated: 2026-03-03 after initialization*
