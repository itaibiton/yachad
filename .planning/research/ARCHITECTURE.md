# Architecture Research

**Domain:** Real-time crisis-response platform (Next.js + Convex + Clerk)
**Researched:** 2026-03-03
**Confidence:** HIGH (Convex/Clerk official docs + Next.js official docs + verified patterns)

---

## Standard Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          VERCEL EDGE NETWORK                             │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────────────┐ │
│  │ Clerk        │  │ Next.js      │  │ Edge Middleware                 │ │
│  │ Middleware   │→ │ App Router   │  │ (auth guard, locale, rate limit)│ │
│  └──────────────┘  └──────┬───────┘  └────────────────────────────────┘ │
└─────────────────────────── │ ────────────────────────────────────────────┘
                             │
          ┌──────────────────┼──────────────────┐
          ▼                  ▼                  ▼
┌─────────────────┐ ┌───────────────┐ ┌────────────────────┐
│ Server          │ │ Client        │ │ Next.js Route      │
│ Components      │ │ Components    │ │ Handlers / Server  │
│ (RSC)           │ │ (interactivity│ │ Actions            │
│                 │ │  + realtime)  │ │                    │
│ fetchQuery()    │ │ useQuery()    │ │ fetchMutation()    │
│ preloadQuery()  │ │ useMutation() │ │ fetchAction()      │
└────────┬────────┘ └───────┬───────┘ └────────┬───────────┘
         │                  │                   │
         └──────────────────┼───────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                         CONVEX BACKEND                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────────┐   │
│  │ Sync Worker  │  │ Function     │  │ Database                      │   │
│  │ (WebSocket   │  │ Runner       │  │ (append-only transaction log, │   │
│  │  sessions)   │  │ (V8 runtime  │  │  auto-indexed, reactive)      │   │
│  │              │  │  transactions│  │                               │   │
│  └──────────────┘  └──────────────┘  └──────────────────────────────┘   │
│                                                                          │
│  convex/                                                                 │
│  ├── schema.ts         (single source of truth for all tables)           │
│  ├── _generated/       (auto-typed API surface)                          │
│  ├── auth.config.ts    (Clerk JWT validation)                            │
│  ├── modules/          (feature-organized functions)                     │
│  │   ├── flights/      queries.ts  mutations.ts  helpers.ts              │
│  │   ├── feed/         queries.ts  mutations.ts                          │
│  │   ├── chat/         queries.ts  mutations.ts                          │
│  │   ├── news/         queries.ts  actions.ts  (HTTP fetch allowed)      │
│  │   ├── reservations/ queries.ts  mutations.ts                          │
│  │   ├── map/          queries.ts  actions.ts                            │
│  │   └── admin/        queries.ts  mutations.ts                          │
│  └── lib/              (shared helpers: auth, roles, validators)         │
└──────────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                     EXTERNAL INTEGRATIONS                                │
│  ┌─────────────┐  ┌─────────────────┐  ┌────────────────────────────┐   │
│  │ Clerk       │  │ Google Maps /   │  │ News RSS Feeds             │   │
│  │ (auth +     │  │ Places API      │  │ (fetched via Convex        │   │
│  │  roles)     │  │ (map module)    │  │  Actions or edge route)    │   │
│  └─────────────┘  └─────────────────┘  └────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────┘
```

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| Clerk Proxy (`proxy.ts`) | Route protection, role enforcement before page renders (Node.js runtime in Next.js 16) | Next.js router, Clerk JWT |
| Next.js Server Components (RSC) | Initial HTML render, preload data for hydration, SEO | Convex `fetchQuery` / `preloadQuery`, Clerk `auth()` |
| Next.js Client Components | Interactivity, real-time subscriptions, forms, maps | Convex `useQuery` / `useMutation`, Zustand, Browser APIs |
| Next.js Server Actions | Validated mutations from forms, thin orchestration layer | Convex `fetchMutation` / `fetchAction` |
| Convex Sync Worker | Manage persistent WebSocket connections per client | Convex Function Runner, clients |
| Convex Function Runner | Execute queries/mutations/actions in V8 transactions | Convex Database, External APIs (actions only) |
| Convex Database | Append-only transaction log, reactive subscriptions, indexes | Function Runner, Subscription Manager |
| Convex Actions | Unrestricted JS (can `fetch`): RSS feeds, Google Places, emails | External APIs, Convex mutations |
| Convex `convex/lib/auth.ts` | Shared auth helpers: `getUser()`, `requireRole()`, `requireAdmin()` | Used by all module functions |
| Google Maps API (Client) | Interactive map rendering, place search UI | Map Client Component only |
| Google Places API (Server/Action) | Fetch Jewish services data, cache results in Convex | Convex Action → Convex DB |
| Clerk (Auth Provider) | User identity, JWT issuance, `publicMetadata.role` | Middleware, ConvexProviderWithClerk |

---

## Recommended Project Structure

```
yachad-global/
├── convex/                          # Convex backend (single deployment)
│   ├── schema.ts                    # ALL table definitions — single source of truth
│   ├── auth.config.ts               # Clerk JWT issuer domain
│   ├── _generated/                  # Auto-generated by Convex CLI (never edit)
│   ├── lib/
│   │   ├── auth.ts                  # getUser(), requireUser(), requireAgent(), requireAdmin()
│   │   ├── validators.ts            # Shared argument validators (v.string(), etc.)
│   │   └── pagination.ts            # Cursor pagination helpers
│   └── modules/
│       ├── flights/
│       │   ├── queries.ts           # listFlights, getFlightById, getAgentFlights
│       │   ├── mutations.ts         # createFlight, updateFlight, markFull, deleteFlight
│       │   └── helpers.ts           # flight-specific business logic
│       ├── feed/
│       │   ├── queries.ts           # listPosts, getPost, getFeedByCountry
│       │   └── mutations.ts         # createPost, deletePost, likePost, reportPost
│       ├── chat/
│       │   ├── queries.ts           # listMessages, getRoom, getDMs
│       │   └── mutations.ts         # sendMessage, createRoom, joinRoom
│       ├── news/
│       │   ├── queries.ts           # listArticles, getAlerts
│       │   ├── mutations.ts         # publishAlert, featureArticle (admin)
│       │   └── actions.ts           # fetchRSSFeeds (external HTTP, scheduled)
│       ├── reservations/
│       │   ├── queries.ts           # listReservations, getReservation
│       │   └── mutations.ts         # createReservation, claimReservation
│       ├── map/
│       │   ├── queries.ts           # getNearbyServices (from cached DB)
│       │   └── actions.ts           # syncPlacesFromGoogle (scheduled)
│       └── admin/
│           ├── queries.ts           # getDashboardStats, getPendingAgents
│           └── mutations.ts         # approveAgent, moderatePost, banUser
│
├── src/
│   ├── app/                         # Next.js App Router (routing only)
│   │   ├── layout.tsx               # Root layout (ConvexClientProvider + ThemeProvider)
│   │   ├── [locale]/                # next-intl locale routing (he / en)
│   │   │   ├── layout.tsx           # Locale layout (dir="rtl"/"ltr", i18n provider)
│   │   │   ├── (public)/            # Unauthenticated pages
│   │   │   │   ├── page.tsx         # Landing
│   │   │   │   └── sign-in/
│   │   │   ├── (dashboard)/         # Authenticated user routes
│   │   │   │   ├── layout.tsx       # Dashboard shell (nav, sidebar)
│   │   │   │   ├── flights/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/page.tsx
│   │   │   │   ├── map/page.tsx
│   │   │   │   ├── feed/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/page.tsx
│   │   │   │   ├── chat/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [roomId]/page.tsx
│   │   │   │   ├── news/page.tsx
│   │   │   │   └── reservations/
│   │   │   │       ├── page.tsx
│   │   │   │       └── [id]/page.tsx
│   │   │   ├── (agent)/             # Flight agent portal
│   │   │   │   └── agent/
│   │   │   │       ├── layout.tsx   # Agent auth guard
│   │   │   │       ├── page.tsx
│   │   │   │       └── flights/
│   │   │   └── (admin)/             # Admin panel
│   │   │       └── admin/
│   │   │           ├── layout.tsx   # Admin auth guard
│   │   │           ├── page.tsx
│   │   │           ├── posts/
│   │   │           ├── agents/
│   │   │           └── alerts/
│   │   └── api/
│   │       └── news-ingest/route.ts # Optional: webhook for news push
│   │
│   ├── providers/
│   │   ├── ConvexClientProvider.tsx # "use client" — ClerkProvider + ConvexProviderWithClerk
│   │   └── ThemeProvider.tsx        # Dark mode
│   │
│   ├── modules/                     # Feature modules (mirrors convex/modules/)
│   │   ├── flights/
│   │   │   ├── components/          # FlightCard, FlightList, AgentFlightForm
│   │   │   ├── hooks/               # useFlights(), useAgentFlights()
│   │   │   └── index.ts             # Public API for this module
│   │   ├── feed/
│   │   │   ├── components/          # PostCard, PostForm, CommentList
│   │   │   ├── hooks/               # useFeed(), usePost()
│   │   │   └── index.ts
│   │   ├── chat/
│   │   │   ├── components/          # ChatRoom, MessageList, DMThread
│   │   │   ├── hooks/               # useChat(), useMessages()
│   │   │   └── index.ts
│   │   ├── news/
│   │   │   ├── components/          # NewsCard, AlertBanner, NewsList
│   │   │   ├── hooks/               # useNews(), useAlerts()
│   │   │   └── index.ts
│   │   ├── map/
│   │   │   ├── components/          # MapView, ServicePopup, SearchBar
│   │   │   ├── hooks/               # useMap(), useNearbyServices()
│   │   │   └── index.ts
│   │   ├── reservations/
│   │   │   ├── components/          # ReservationCard, ClaimForm
│   │   │   ├── hooks/               # useReservations()
│   │   │   └── index.ts
│   │   └── admin/
│   │       ├── components/          # AgentApproval, PostModeration, AlertEditor
│   │       ├── hooks/               # useDashboardStats(), usePendingAgents()
│   │       └── index.ts
│   │
│   ├── shared/
│   │   ├── components/              # Shared UI: Button, Card, Modal, AlertBanner
│   │   ├── hooks/                   # useLocale(), useTheme(), useAuth()
│   │   ├── lib/
│   │   │   ├── convex.ts            # ConvexReactClient singleton
│   │   │   └── i18n.ts              # next-intl config
│   │   └── types/                   # Shared TypeScript types (from convex/_generated)
│   │
│   └── proxy.ts                     # Clerk auth guard + locale redirect (Next.js 16)
│
├── messages/
│   ├── he.json                      # Hebrew translations
│   └── en.json                      # English translations
│
└── public/                          # Static assets
```

### Structure Rationale

- **`convex/modules/`:** Mirrors the 7 feature modules on the frontend. Each module owns its queries, mutations, and actions. They all read from the shared `schema.ts` — no per-module schemas, one unified database.
- **`convex/lib/auth.ts`:** Central auth helpers prevent duplicated role checks. Every function that needs auth calls `requireUser()` or `requireAdmin()` from this file.
- **`src/app/[locale]/(groups)/`:** Route groups separate public, dashboard, agent, and admin routes with independent layouts and auth guards — no auth logic bleeds into public pages.
- **`src/modules/`:** Each feature module exposes a public `index.ts`. Pages import from module boundaries, not internal paths. This is Feature-Sliced Design adapted for App Router.
- **`src/providers/`:** Isolated from the rest of app — only ConvexClientProvider and ThemeProvider live here. The entire app tree mounts into these.
- **`messages/`:** Flat key-value files per locale; next-intl loads them as Server Component async messages.

---

## Architectural Patterns

### Pattern 1: Server Preload + Client Reactivity (the Convex hybrid)

**What:** Server Component preloads data via `preloadQuery`, passes an opaque payload to a Client Component that subscribes with `usePreloadedQuery`. Initial render is SSR, subsequent updates are live.

**When to use:** Every page-level Convex read in this app — flights listing, feed, news, reservations. Gives SSR performance with real-time updates.

**Trade-offs:** Preloaded queries use `cache: 'no-store'` so cannot be statically cached. Acceptable for a crisis app where data changes constantly.

**Example:**
```typescript
// app/[locale]/(dashboard)/flights/page.tsx — Server Component
import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { FlightList } from "@/modules/flights";

export default async function FlightsPage() {
  const preloaded = await preloadQuery(api.modules.flights.queries.list, {});
  return <FlightList preloaded={preloaded} />;
}

// src/modules/flights/components/FlightList.tsx — Client Component
"use client";
import { usePreloadedQuery } from "convex/react";
import type { Preloaded } from "convex/react";

export function FlightList({ preloaded }: { preloaded: Preloaded<typeof api.modules.flights.queries.list> }) {
  const flights = usePreloadedQuery(preloaded); // Live updates
  return <>{flights.map(f => <FlightCard key={f._id} flight={f} />)}</>;
}
```

### Pattern 2: Auth Layer in Every Convex Function

**What:** Every Convex query/mutation that touches protected data begins with an auth helper call. Middleware is a first-line guard only — Convex functions are the authoritative security gate.

**When to use:** All mutations and any query returning user-specific or sensitive data.

**Trade-offs:** Slightly more boilerplate per function. Non-negotiable for security on a public platform with role-based features.

**Example:**
```typescript
// convex/lib/auth.ts
import { QueryCtx, MutationCtx } from "./_generated/server";

export async function requireUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthenticated");
  const user = await ctx.db.query("users")
    .withIndex("by_clerk_id", q => q.eq("clerkId", identity.subject))
    .unique();
  if (!user) throw new Error("User not found");
  return user;
}

export async function requireAgent(ctx: MutationCtx) {
  const user = await requireUser(ctx);
  if (user.role !== "agent" && user.role !== "admin") throw new Error("Requires agent role");
  return user;
}

export async function requireAdmin(ctx: MutationCtx) {
  const user = await requireUser(ctx);
  if (user.role !== "admin") throw new Error("Requires admin role");
  return user;
}

// convex/modules/flights/mutations.ts
import { requireAgent } from "../../lib/auth";

export const createFlight = mutation({
  args: { /* ... */ },
  handler: async (ctx, args) => {
    const agent = await requireAgent(ctx); // Throws if not agent/admin
    return await ctx.db.insert("flights", { ...args, agentId: agent._id });
  },
});
```

### Pattern 3: Role Storage — Clerk `publicMetadata` + Convex `users` Table

**What:** Roles (`user` | `agent` | `admin`) live in two places: Clerk `publicMetadata.role` (for middleware/UI) and the Convex `users` table (for backend enforcement). The Clerk JWT carries `publicMetadata` into Convex via a custom JWT template.

**When to use:** All role-based access decisions. Admins set roles via the Clerk Dashboard or admin API; the Convex user record syncs on next login via a `upsertUser` mutation called from the app.

**Trade-offs:** Dual-write complexity, but provides fast proxy checks (Clerk) AND backend enforcement (Convex) without an extra DB round-trip on every request.

**Example:**
```typescript
// proxy.ts (Next.js 16 — replaces middleware.ts)
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isAgentRoute = createRouteMatcher(["/*/agent(.*)"]);
const isAdminRoute = createRouteMatcher(["/*/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { sessionClaims } = await auth();
  const role = sessionClaims?.publicMetadata?.role as string | undefined;

  if (isAgentRoute(req) && role !== "agent" && role !== "admin") {
    return Response.redirect(new URL("/", req.url));
  }
  if (isAdminRoute(req) && role !== "admin") {
    return Response.redirect(new URL("/", req.url));
  }
});
```

### Pattern 4: Convex Actions for External Integrations

**What:** Convex `actions` (not queries or mutations) are the only Convex primitives that can call `fetch`. RSS ingestion, Google Places sync, and any external API calls go through actions. Actions can call mutations to persist results into the Convex database.

**When to use:** News RSS fetching (scheduled every 5 minutes), Google Places data sync (scheduled hourly), emergency alert delivery.

**Trade-offs:** Actions are not transactional — they can call mutations but have no rollback. Wrap critical work in mutations called from the action.

**Example:**
```typescript
// convex/modules/news/actions.ts
export const ingestRSSFeeds = action({
  handler: async (ctx) => {
    const feeds = await ctx.runQuery(api.modules.news.queries.getActiveSources);
    for (const feed of feeds) {
      const articles = await fetchAndParseFeed(feed.url); // external fetch OK
      for (const article of articles) {
        await ctx.runMutation(api.modules.news.mutations.upsertArticle, article);
      }
    }
  },
});

// Schedule in convex/crons.ts
crons.interval("ingest-news", { minutes: 5 }, api.modules.news.actions.ingestRSSFeeds);
```

### Pattern 5: Client Component "Skip Pattern" for Auth-Gated Queries

**What:** Client Components skip Convex queries until authentication is confirmed. Prevents race conditions where queries fire before the auth token is available.

**When to use:** Every `useQuery` hook in a Client Component that requires authentication.

**Example:**
```typescript
"use client";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function ChatRoomList() {
  const { isAuthenticated } = useConvexAuth();
  const rooms = useQuery(
    api.modules.chat.queries.listRooms,
    isAuthenticated ? {} : "skip"  // Skip until authenticated
  );
  if (!rooms) return <Skeleton />;
  return <>{rooms.map(r => <RoomItem key={r._id} room={r} />)}</>;
}
```

---

## Data Flow

### Request Flow (Page Load — SSR + Real-Time Handoff)

```
User opens /he/flights
     ↓
Clerk Middleware (edge)
  → checks JWT, role in publicMetadata
  → allows through (authenticated user)
     ↓
Next.js Server Component (flights/page.tsx)
  → preloadQuery(api.modules.flights.queries.list)
  → fetchQuery returns snapshot of current flights data
  → renders HTML with data embedded
     ↓
Browser receives HTML (fast first paint, no loading spinner)
     ↓
React hydrates — Client Component (FlightList)
  → usePreloadedQuery() — reuses preloaded data
  → Convex WebSocket connection established
  → Convex Sync Worker registers subscription for flight list
     ↓
Flight agent updates a flight (Convex mutation)
  → Convex detects overlapping read set
  → Recomputes query, pushes delta via WebSocket
     ↓
FlightList re-renders with updated data (no page refresh)
```

### Mutation Flow (User Action)

```
User submits "Post to Feed" form
     ↓
Client Component calls useMutation(api.modules.feed.mutations.createPost)
     ↓
Convex Function Runner executes in transaction:
  → requireUser(ctx) → verifies identity, fetches user record
  → Anti-spam check (rate limit by userId)
  → ctx.db.insert("posts", { ... })
  → Transaction commits
     ↓
Subscription Manager detects feed query read set overlap
  → Pushes update to all clients subscribed to affected feed queries
     ↓
All connected users see the new post (live update)
```

### Real-Time Alert Flow (Admin Publishes Urgent Alert)

```
Admin publishes urgent alert in Admin Panel
     ↓
Convex mutation: admin/mutations.publishAlert
  → requireAdmin(ctx) → verifies admin role
  → ctx.db.insert("alerts", { severity: "urgent", ... })
     ↓
Subscription Manager: ALL clients subscribed to useQuery(getActiveAlerts)
  → Pushes update across all 500K WebSocket sessions
     ↓
AlertBanner Client Component re-renders globally
  → Urgent alert appears on every active screen in < 500ms
```

### News Ingestion Flow (Scheduled Background)

```
Convex cron (every 5 minutes)
  → triggers: ingestRSSFeeds action
     ↓
Action fetches external RSS URLs (HTTP allowed in actions)
  → Parses articles
  → Calls upsertArticle mutation for each new item
     ↓
News query subscriptions invalidated → clients update
```

### i18n + RTL Flow

```
Request hits /he/... or /en/...
     ↓
proxy.ts: detectLocale() → sets locale cookie
     ↓
app/[locale]/layout.tsx (Server Component)
  → getMessages(locale) → loads he.json or en.json
  → dir = locale === "he" ? "rtl" : "ltr"
  → <html lang={locale} dir={dir}>
     ↓
next-intl NextIntlClientProvider wraps app
  → All t("key") calls resolve to correct locale
  → CSS logical properties (margin-inline-start) handle RTL layout
```

---

## Scalability Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0–10K users | Default Convex deployment. No tuning needed. All 7 modules active. |
| 10K–50K users (day one target) | Convex auto-scales WebSocket worker pool. Add indexes for all high-traffic queries (flights by country, feed by timestamp, chat by room). Use `preloadQuery` on all server pages to reduce WebSocket cold-start time. |
| 50K–500K concurrent (target ceiling) | Convex's subscription manager aggregates subscriptions and avoids redundant log scans. The bottleneck at this scale is query fan-out: split the global feed into per-country feeds to reduce subscription overlap. Use Convex's scheduled cron for news instead of client-triggered refreshes. Edge middleware handles auth decisions without Convex round-trips. |

### Scaling Priorities

1. **First bottleneck — feed subscription fan-out:** A single global feed query subscribed to by 500K users means every new post triggers 500K client updates. Fix: shard feed by `country` field and have each client subscribe to only their country's feed.

2. **Second bottleneck — chat message volume:** High-frequency chat room mutations can stress the transaction log. Fix: apply per-room rate limiting in Convex mutations. Consider read replicas or pagination on history (only subscribe to last N messages).

3. **Third bottleneck — map/Places API costs:** Google Places charges per request. Fix: Convex Action syncs Places data into the Convex DB on a schedule (e.g., hourly). Clients query the cached Convex table, not Google directly.

4. **WebSocket connection limits:** Convex's sync worker handles persistent WebSocket connections with dynamic resource allocation. The architecture described (preloadQuery on server + useQuery on client) minimizes unnecessary subscriptions — only active components subscribe.

---

## Anti-Patterns

### Anti-Pattern 1: Fetching Convex Data Directly in Server Components Without Preload

**What people do:** Call `fetchQuery` in a server component and pass the raw data to a client component as props.

**Why it's wrong:** The client component receives static data — it has no real-time subscription and won't update when data changes.

**Do this instead:** Use `preloadQuery` in the server component and `usePreloadedQuery` in the client component. The preloaded payload establishes the subscription.

### Anti-Pattern 2: Auth Checks Only in Middleware

**What people do:** Protect routes via Clerk middleware and assume the Convex backend is safe.

**Why it's wrong:** Convex is a public API. Anyone with valid credentials can call mutations directly (e.g., via Convex dashboard or HTTP). Middleware guards UI, not data.

**Do this instead:** Enforce `requireUser()` / `requireAdmin()` at the start of every Convex mutation and sensitive query. Defense in depth: middleware + Convex function auth.

### Anti-Pattern 3: External HTTP Calls in Convex Queries or Mutations

**What people do:** Call `fetch()` inside a Convex query or mutation to fetch news or Google Places data inline.

**Why it's wrong:** Queries and mutations must be deterministic. Convex's runtime explicitly disallows external network calls in queries/mutations — this will throw at runtime.

**Do this instead:** Use Convex `actions` for any external HTTP calls. Actions call mutations to persist results into the DB.

### Anti-Pattern 4: One Giant Convex Schema File With Unindexed Tables

**What people do:** Define all tables in schema.ts but only add indexes when queries start timing out.

**Why it's wrong:** At 10K+ users, unindexed queries on large tables (feed posts, chat messages) will full-scan the table on every subscription evaluation. The subscription manager re-runs queries on every mutation — unindexed full scans become catastrophic.

**Do this instead:** Add indexes at schema design time, not as a fix. For every query with `.filter()` or `.withIndex()`, define the corresponding index in `schema.ts` before shipping. For a crisis platform, do this in Phase 1.

### Anti-Pattern 5: Global Feed Without Country Segmentation

**What people do:** Create a single `posts` query for all feed items subscribed to by every client.

**Why it's wrong:** At 100K+ concurrent users, every post mutation invalidates every client's feed subscription — triggering hundreds of thousands of simultaneous re-evaluations.

**Do this instead:** Shard feed subscriptions by `country` (index on `country` field). Each user subscribes to their country's feed. Urgent cross-country posts use a separate high-priority `alerts` table with its own subscription.

### Anti-Pattern 6: Skipping `"use client"` Boundary on Convex Hooks

**What people do:** Call `useQuery()` in a Server Component or a component without `"use client"`.

**Why it's wrong:** React hooks cannot run in Server Components. Next.js will throw a build/runtime error.

**Do this instead:** Any component using Convex hooks (`useQuery`, `useMutation`, `useConvexAuth`) must be a Client Component with `"use client"` at the top. Server Components use `fetchQuery` or `preloadQuery`.

---

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Clerk | `ConvexProviderWithClerk` wraps app. Clerk JWT template adds `publicMetadata` to token claims. Convex reads identity via `ctx.auth.getUserIdentity()` | JWT template must be created in Clerk Dashboard and referenced in `convex/auth.config.ts` |
| Google Maps JS API | Client-side only. Loaded lazily in the Map module Client Component. Never server-side (requires browser). | Use `@vis.gl/react-google-maps` or `@react-google-maps/api`. Gate behind `useEffect` to prevent SSR errors. |
| Google Places API | Convex Action (server-side), fetched on schedule. Results cached in Convex `services` table. Clients query the cache, not Google directly. | Prevents API cost explosion at scale. Actions handle auth via server-side API key. |
| RSS News Sources | Convex Action on a 5-minute cron. Fetches, parses, deduplicates, stores in `articles` table. | Use `fast-xml-parser` or similar in the action. Never client-side — CORS blocks most RSS feeds from browsers. |
| Vercel (deployment) | Next.js deployed to Vercel edge network. Middleware runs at edge (Clerk auth + locale). Server Components run in Node.js runtime. Convex is a separate hosted service. | No WebSocket server needed on Vercel — Convex handles all WebSocket connections independently. |

### Internal Module Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| flights ↔ reservations | Shared `flightId` reference via Convex document ID. Reservations query flights for display context. | No direct import between modules — cross-module reads go through Convex queries. |
| feed ↔ admin | Admin mutations call the same underlying `posts` table. Admin module has its own mutations with `requireAdmin()` enforcement. | Admin does not import from feed module directly — separate function files, same DB table. |
| news ↔ admin | Admin can create/feature/delete articles. Uses separate admin mutations with elevated permissions. | |
| chat ↔ users | Chat queries join against the `users` table for display names and avatars. | Use denormalization: store `authorName` + `authorAvatar` in `messages` at write time to avoid expensive joins at read time. |
| map ↔ users | Map is entirely client-side UI. User location (if permitted) stays in browser only — not persisted in Convex. | Never persist browser geolocation in Convex — privacy risk and unnecessary. |
| all modules ↔ convex/lib/auth | All modules import `requireUser()` / `requireAgent()` / `requireAdmin()` from `convex/lib/auth.ts` | This is the single shared boundary. Modules do not import from each other. |

---

## Build Order Implications

The component dependency graph dictates this build sequence:

**Phase 1 — Foundation (blocks everything):**
1. Convex schema + indexes for all 7 modules (cannot add breaking index changes safely in production)
2. `convex/lib/auth.ts` (every module needs this)
3. Clerk + Convex provider setup + `proxy.ts` (all routes need auth)
4. next-intl + RTL layout (all pages need locale wrapping)

**Phase 2 — Core User Experience (drives adoption):**
5. Flights module (primary reason users come to the platform)
6. News + Alert module (keeps users informed, drive urgency)
7. Map module (helps users find services now)

**Phase 3 — Community Features:**
8. Feed module (social engagement)
9. Chat module (depends on users table established in Phase 1)
10. Reservations module (depends on users table)

**Phase 4 — Operations:**
11. Agent portal (builds on flights module data model)
12. Admin panel (builds on all modules, needs moderation for feed + news)

**Dependency rules:**
- Agent portal cannot be built before Flights module schema is stable
- Admin panel cannot be built before Feed + News modules (nothing to moderate)
- Chat rooms can reference country groups populated by users — users table must exist first
- All modules require auth foundation from Phase 1 before any backend logic is written

---

## Sources

- [Convex Next.js App Router integration docs](https://docs.convex.dev/client/nextjs/app-router/) — HIGH confidence
- [Convex server rendering patterns (preloadQuery)](https://docs.convex.dev/client/nextjs/app-router/server-rendering) — HIGH confidence
- [How Convex Works (sync worker, transaction log, subscriptions)](https://stack.convex.dev/how-convex-works) — HIGH confidence
- [Authentication best practices: Convex + Clerk + Next.js](https://stack.convex.dev/authentication-best-practices-convex-clerk-and-nextjs) — HIGH confidence
- [Convex & Clerk auth integration](https://docs.convex.dev/auth/clerk) — HIGH confidence
- [Clerk RBAC with publicMetadata](https://clerk.com/docs/guides/secure/basic-rbac) — HIGH confidence
- [Clerk clerkMiddleware() reference](https://clerk.com/docs/reference/nextjs/clerk-middleware) — HIGH confidence
- [Feature-Sliced Design for Next.js App Router](https://feature-sliced.design/blog/nextjs-app-router-guide) — MEDIUM confidence (community standard, not official spec)
- [Next.js App Router project structure (Makerkit)](https://makerkit.dev/blog/tutorials/nextjs-app-router-project-structure) — MEDIUM confidence (production SaaS template, widely referenced)
- [Building 70-module Convex backend](https://stack.convex.dev/tables-convex-modules-rest-apis) — HIGH confidence (official Convex team blog)
- [next-intl App Router i18n](https://next-intl.dev/docs/getting-started/app-router) — HIGH confidence
- [RTL support in Next.js i18n](https://lingo.dev/en/nextjs-i18n/right-to-left-languages) — MEDIUM confidence
- [Convex real-time subscriptions and scaling](https://stack.convex.dev/keeping-real-time-users-in-sync-convex) — HIGH confidence

---
*Architecture research for: real-time crisis-response platform (Yachad)*
*Researched: 2026-03-03*
