# Phase 1: Foundation - Research

**Researched:** 2026-03-03
**Domain:** Next.js 16 scaffold + Convex schema + Clerk three-layer auth + next-intl v4 RTL + dashboard shell
**Confidence:** HIGH (primary findings verified against official docs, Next.js 16 release notes, and Convex/Clerk official documentation)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Dashboard Layout**
- Icon + label sidebar, collapsible to icons-only on mobile
- Bottom tab navigation on mobile (like WhatsApp/Instagram), sidebar on desktop
- Module order follows crisis priority: Flights → News → Map → Feed → Chat → Reservations
- Home page is an overview dashboard with summary cards: latest flights, urgent alerts, recent posts, nearby services
- Top bar includes: Yachad logo + search icon that expands, country selector, emergency button, language toggle, notifications, profile

**Visual Identity**
- Primary brand color: Israeli blue (#0038b8) — inspired by the Israeli flag
- UI feel: Warm + community — friendly, rounded corners, modern social app feel
- Red for urgent alerts and emergency elements
- Dark mode must maintain the warm community feel

**Emergency Button**
- Behavior: Quick menu dropdown with options — Call Embassy, Share Location, Emergency Chat, Report Danger
- Visibility: Both — red icon in top bar on desktop, red floating action button (FAB) on mobile
- Always accessible from every screen

**Country Selector**
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

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FOUN-01 | App initializes with Next.js 16+ App Router (Turbopack default), TypeScript, TailwindCSS v4, and shadcn/ui | Next.js 16 release confirms Turbopack is now stable default; shadcn CLI supports Tailwind v4 and React 19 with `npx shadcn@latest init` |
| FOUN-02 | Convex database configured with schema, indexes, and real-time subscriptions | `defineSchema` + `defineTable` + chained `.index()` pattern documented; all 7 module tables must be defined in single `convex/schema.ts` |
| FOUN-03 | Clerk authentication with three roles: user, flight_agent, admin | Clerk RBAC via `publicMetadata.role`; JWT template exposes role in sessionClaims; checked in proxy.ts + Convex functions |
| FOUN-04 | Clerk-Convex webhook sync via Svix for user data in Convex | HTTP action at `/clerk-users-webhook` with Svix signature verification; `internalMutation` for upsertFromClerk |
| FOUN-05 | Role-based proxy.ts (Next.js 16) protecting agent and admin routes | `clerkMiddleware()` in `proxy.ts`; `sessionClaims?.metadata?.role` check; `createRouteMatcher` for route patterns |
| FOUN-06 | Hebrew-first RTL layout with `dir="rtl"` and logical CSS properties throughout | `dir` on `<html>` element in `[locale]/layout.tsx`; shadcn/ui `--rtl` flag auto-converts physical to logical CSS |
| FOUN-07 | English + Hebrew i18n via next-intl v4 with locale-based routing | `defineRouting` in `i18n/routing.ts`; `createMiddleware(routing)` in `proxy.ts`; `[locale]` dynamic segment |
| FOUN-08 | Dark mode with system preference detection and manual toggle | `next-themes` ThemeProvider with `attribute="class"`; shadcn/ui dark mode integration; toggle persists to localStorage |
| FOUN-09 | Fully responsive mobile-first design across all modules | Tailwind responsive prefixes; shadcn Sidebar shows persistent desktop / Sheet drawer mobile; bottom tab nav for mobile |
| FOUN-10 | Dashboard layout with sidebar navigation (all 7 modules), top bar (country selector, emergency button, language toggle, notifications, profile) | shadcn/ui Sidebar + composable top bar components; emergency button as DropdownMenu |
| FOUN-11 | Rate limiting on all write operations via @convex-dev/rate-limiter | `RateLimiter` component with token bucket or fixed window; `rateLimiter.limit(ctx, "name")` at start of each mutation |
| FOUN-12 | Error boundaries with user-friendly Hebrew/English error messages | React `error.tsx` in App Router; `next-intl` `useTranslations()` for bilingual error strings |
| FOUN-13 | Loading states with skeleton screens on all data-fetching components | shadcn/ui `Skeleton` component; `loading.tsx` in App Router; conditional render when Convex `useQuery` returns `undefined` |
</phase_requirements>

---

## Summary

Phase 1 is a greenfield Next.js 16 project setup. The stack is fixed by prior research decisions: Next.js 16 with Turbopack (default), TypeScript, Tailwind CSS v4, shadcn/ui, Clerk v6, Convex 1.32+, and next-intl v4. All technologies are current, stable, and well-documented. The largest implementation risks in this phase are (1) the three-layer auth arrangement between proxy.ts, Server Component guards, and Convex function-level checks, (2) RTL-first CSS discipline using logical properties exclusively, and (3) defining all Convex schemas with production indexes before any data is written.

The key architectural insight from prior research is that Next.js 16 renamed `middleware.ts` to `proxy.ts` and changed the exported function name from `middleware` to `proxy`. This affects both the Clerk integration pattern and the next-intl routing middleware export. The shadcn/ui CLI now supports an `--rtl` flag (released January 2026) that automatically converts physical CSS classes to logical equivalents across all installed components — this is a significant time-saver that must be used from initial `init`.

A potential pitfall requires validation: Tailwind CSS v4's logical property utilities (`ms-*`, `me-*`, `ps-*`, `pe-*`) had issues with Turbopack in Next.js 15.5. These issues were attributed to Turbopack's CSS transpilation, not Tailwind itself. Next.js 16 ships Turbopack as stable, but the fix status of this specific issue with Next.js 16 is unconfirmed. The mitigation strategy is to use `next build --webpack` if logical properties break under Turbopack, and to test RTL layout early in the phase.

**Primary recommendation:** Initialize with `npx create-next-app@latest` for Next.js 16, then `npx shadcn@latest init --rtl` to get RTL-safe logical CSS from all components, followed by `npx convex dev` to scaffold the Convex backend. Write all 7 module schemas before any mutations — retrofitting indexes post-launch is high-risk.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.x | Full-stack React framework | Turbopack default, `proxy.ts` convention, App Router, React 19.2, required by project decisions |
| TypeScript | 5.9.x | Type safety | Required by Next.js 16 (min TS 5.1), next-intl v4, and Convex for schema types |
| TailwindCSS | 4.2.x | Utility-first CSS with logical props | Logical properties built-in (no plugin needed); CSS-first config (no tailwind.config.js) |
| shadcn/ui | latest CLI | Component library | Copy-paste model, full Tailwind v4 support, `--rtl` flag auto-converts to logical CSS (January 2026) |
| Clerk (`@clerk/nextjs`) | 6.39+ | Auth, roles, three-layer RBAC | v6.35+ required for Next.js 16; `clerkMiddleware()` used in `proxy.ts` |
| Convex (`convex`) | 1.32.x | Database, real-time, backend functions | Reactive subscriptions, TypeScript-first schema, `ConvexProviderWithClerk` |
| next-intl | 4.8.x | i18n routing, Server Component translations | App Router native, `defineRouting` + `createMiddleware`, Hebrew/RTL support |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `next-themes` | 0.4.6+ | Dark mode persistence with zero flicker | Always — prevents SSR hydration flash; persists to localStorage |
| `convex-helpers` | 0.1.114 | Zod validators, CRUD helpers, custom mutations | Always — `customMutation` for `agentMutation` wrapper pattern |
| `@convex-dev/rate-limiter` | 0.3.x | Application-layer rate limiting in Convex | Required on all write mutations |
| `svix` | 1.86+ | Clerk webhook signature verification | Required for Clerk → Convex user sync HTTP action |
| `lucide-react` | 0.476+ | Icon library | Always — shadcn/ui's standard icon set |
| `clsx` + `tailwind-merge` | 2.1.x / 3.5.x | Conditional class merging (`cn()` utility) | Always — shadcn/ui uses this internally |
| Zustand | 5.x | Client-side UI state | For modal visibility, country selector state, map viewport |
| `date-fns` | 4.x | Date formatting | Relative timestamps ("3 minutes ago") on posts, flights, messages |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `next-intl` v4 | `react-i18next` | Never for this stack — react-i18next requires complex SSR bridging in App Router |
| Tailwind v4 built-in logical props | `tailwindcss-rtl` plugin | Never on v4 — the plugin targets v3's utility model and conflicts |
| `next-themes` | DIY cookie-based theme | DIY causes SSR hydration flash; next-themes injects blocking script |
| `convex/react-clerk` bridge | Custom JWT handling | Never — ConvexProviderWithClerk handles token refresh automatically |

**Installation:**

```bash
# 1. Scaffold Next.js 16 project
npx create-next-app@latest yachad-global --typescript --tailwind --app --src-dir --import-alias "@/*"

# 2. Initialize shadcn/ui WITH RTL flag — critical for logical CSS from day one
npx shadcn@latest init --rtl

# 3. Core platform dependencies
npm install convex @clerk/nextjs next-intl next-themes zustand

# 4. Convex ecosystem
npm install convex-helpers @convex-dev/rate-limiter

# 5. Webhook verification
npm install svix

# 6. UI utilities
npm install lucide-react clsx tailwind-merge date-fns sonner

# 7. Forms + validation (needed for onboarding flow)
npm install react-hook-form zod @hookform/resolvers

# 8. Dev dependencies
npm install -D @types/node @types/react @types/react-dom prettier prettier-plugin-tailwindcss

# 9. Initialize Convex backend
npx convex dev
```

---

## Architecture Patterns

### Recommended Project Structure

```
yachad-global/
├── convex/
│   ├── schema.ts                    # ALL 7 module tables — single source of truth
│   ├── auth.config.ts               # Clerk JWT issuer domain
│   ├── _generated/                  # Auto-generated types (never edit)
│   ├── crons.ts                     # Scheduled jobs (Phase 4+)
│   ├── http.ts                      # HTTP router (Clerk webhook endpoint)
│   ├── lib/
│   │   ├── auth.ts                  # requireUser(), requireAgent(), requireAdmin()
│   │   ├── validators.ts            # Shared Convex validators
│   │   └── rateLimit.ts             # RateLimiter instance + named limits
│   └── modules/
│       ├── flights/   queries.ts  mutations.ts  helpers.ts
│       ├── feed/      queries.ts  mutations.ts
│       ├── chat/      queries.ts  mutations.ts
│       ├── news/      queries.ts  mutations.ts  actions.ts
│       ├── reservations/ queries.ts  mutations.ts
│       ├── map/       queries.ts  actions.ts
│       ├── admin/     queries.ts  mutations.ts
│       └── users/     mutations.ts  (webhook upsert, upsertFromClerk)
│
├── src/
│   ├── app/
│   │   ├── layout.tsx               # Root: ConvexClientProvider + ThemeProvider (Server Component shell)
│   │   └── [locale]/
│   │       ├── layout.tsx           # Locale layout: <html lang dir> + NextIntlClientProvider
│   │       ├── (public)/            # Landing, sign-in, sign-up (unauthenticated)
│   │       │   ├── page.tsx
│   │       │   └── sign-in/[[...sign-in]]/page.tsx
│   │       ├── (dashboard)/         # Authenticated user routes
│   │       │   ├── layout.tsx       # DashboardShell (sidebar + top bar)
│   │       │   ├── page.tsx         # Overview home (summary cards)
│   │       │   ├── flights/         page.tsx + [id]/page.tsx
│   │       │   ├── news/            page.tsx
│   │       │   ├── map/             page.tsx
│   │       │   ├── feed/            page.tsx + [id]/page.tsx
│   │       │   ├── chat/            page.tsx + [roomId]/page.tsx
│   │       │   └── reservations/    page.tsx + [id]/page.tsx
│   │       ├── (agent)/             # Flight agent portal
│   │       │   └── agent/
│   │       │       ├── layout.tsx   # Agent auth guard (Server Component check)
│   │       │       └── ...
│   │       └── (admin)/             # Admin panel
│   │           └── admin/
│   │               ├── layout.tsx   # Admin auth guard (Server Component check)
│   │               └── ...
│   │
│   ├── providers/
│   │   ├── ConvexClientProvider.tsx # "use client" — ClerkProvider + ConvexProviderWithClerk
│   │   └── ThemeProvider.tsx        # "use client" — next-themes ThemeProvider
│   │
│   ├── modules/                     # Feature modules (mirrors convex/modules/)
│   │   └── [module]/
│   │       ├── components/
│   │       ├── hooks/
│   │       └── index.ts
│   │
│   ├── shared/
│   │   ├── components/              # DashboardShell, Sidebar, TopBar, EmergencyButton, etc.
│   │   ├── hooks/                   # useLocale(), useTheme(), useCountry()
│   │   └── lib/
│   │       ├── convex.ts            # ConvexReactClient singleton
│   │       └── i18n.ts              # next-intl request config
│   │
│   └── proxy.ts                     # Clerk clerkMiddleware() + next-intl createMiddleware()
│
├── i18n/
│   └── routing.ts                   # defineRouting({ locales: ['he', 'en'], defaultLocale: 'he' })
│
├── messages/
│   ├── he.json                      # Hebrew translations
│   └── en.json                      # English translations
│
└── public/                          # Static assets (logo, favicon)
```

### Pattern 1: proxy.ts — Clerk Auth + next-intl Locale (Combined)

**What:** A single `proxy.ts` file (Next.js 16 convention replacing `middleware.ts`) handles both Clerk authentication guards and next-intl locale routing. Both libraries export middleware factories that can be composed.

**When to use:** The only proxy file in the project. Must handle locale redirect before auth guard fires, otherwise unauthenticated users get redirected to `/sign-in` instead of `/he/sign-in`.

**Key detail:** The exported function must be named `proxy` (not `middleware`) in Next.js 16. The `config.matcher` must exclude static files and API routes.

**Example:**
```typescript
// Source: https://nextjs.org/docs/app/api-reference/file-conventions/proxy
// Source: https://next-intl.dev/docs/routing/middleware
// src/proxy.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

const isAgentRoute = createRouteMatcher(["/:locale/agent(.*)"]);
const isAdminRoute = createRouteMatcher(["/:locale/admin(.*)"]);
const isDashboardRoute = createRouteMatcher(["/:locale/(dashboard)(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // Run next-intl locale detection first
  const intlResponse = intlMiddleware(req);

  // Check auth for protected routes
  if (isDashboardRoute(req) || isAgentRoute(req) || isAdminRoute(req)) {
    await auth.protect();
  }

  // RBAC: agent and admin route enforcement
  const { sessionClaims } = await auth();
  const role = sessionClaims?.metadata?.role as string | undefined;

  if (isAgentRoute(req) && role !== "agent" && role !== "admin") {
    return Response.redirect(new URL("/", req.url));
  }
  if (isAdminRoute(req) && role !== "admin") {
    return Response.redirect(new URL("/", req.url));
  }

  return intlResponse;
});

export const config = {
  matcher: [
    // Exclude static files, _next internals, API routes
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

### Pattern 2: Convex Three-Layer Auth

**What:** Every Convex mutation and sensitive query begins with a `requireUser()` / `requireAgent()` / `requireAdmin()` call. These are defined once in `convex/lib/auth.ts` and imported everywhere. This is the authoritative security gate — middleware is defense-in-depth only.

**When to use:** Every Convex mutation. Every query that returns user-specific or sensitive data.

**Example:**
```typescript
// Source: https://stack.convex.dev/authentication-best-practices-convex-clerk-and-nextjs
// convex/lib/auth.ts
import { QueryCtx, MutationCtx } from "../_generated/server";

export async function requireUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthenticated");
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();
  if (!user) throw new Error("User not found in database");
  return user;
}

export async function requireAgent(ctx: MutationCtx) {
  const user = await requireUser(ctx);
  // Check DB approval status — not just Clerk role (wartime fraud prevention)
  if (user.role !== "agent" && user.role !== "admin") {
    throw new Error("Requires agent role");
  }
  if (user.role === "agent" && !user.isApproved) {
    throw new Error("Agent not yet approved");
  }
  return user;
}

export async function requireAdmin(ctx: MutationCtx) {
  const user = await requireUser(ctx);
  if (user.role !== "admin") throw new Error("Requires admin role");
  return user;
}
```

### Pattern 3: Convex Schema — All 7 Modules Up Front

**What:** All tables for all 7 modules defined in a single `convex/schema.ts` before any code is written. Indexes defined at schema design time, not when queries start timing out.

**When to use:** Phase 1 only. Schema is frozen before Phase 2 begins. Adding indexes to populated tables later requires careful migration.

**Example (abbreviated — 7 module tables):**
```typescript
// Source: https://docs.convex.dev/database/schemas
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // users — synced from Clerk via webhook
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
    role: v.union(v.literal("user"), v.literal("agent"), v.literal("admin")),
    isApproved: v.optional(v.boolean()),       // agent approval flag
    country: v.optional(v.string()),            // ISO country code
    isBanned: v.optional(v.boolean()),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  // flights — Module 1
  flights: defineTable({
    agentId: v.id("users"),
    departureCountry: v.string(),
    destination: v.string(),
    departureDate: v.number(),                  // Unix timestamp
    seats: v.number(),
    pricePerSeat: v.number(),
    currency: v.string(),
    status: v.union(v.literal("available"), v.literal("full"), v.literal("cancelled")),
    isDeleted: v.optional(v.boolean()),
  })
    .index("by_agent", ["agentId"])
    .index("by_status_departure", ["status", "departureDate"])
    .index("by_country_departure", ["departureCountry", "departureDate"]),

  // feed posts — Module 4
  posts: defineTable({
    authorId: v.id("users"),
    content: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
    country: v.optional(v.string()),
    category: v.optional(v.union(
      v.literal("help_needed"), v.literal("offering_help"),
      v.literal("info"), v.literal("warning"), v.literal("safety_check")
    )),
    isPinned: v.optional(v.boolean()),
    isDeleted: v.optional(v.boolean()),
  })
    .index("by_country_time", ["country", "_creationTime"])
    .index("by_author", ["authorId"]),

  // Post likes — hot/cold split to avoid OCC
  postLikes: defineTable({
    postId: v.id("posts"),
    userId: v.id("users"),
  })
    .index("by_post", ["postId"])
    .index("by_user_post", ["userId", "postId"]),

  // chat rooms + messages — Module 5
  chatRooms: defineTable({
    country: v.optional(v.string()),
    name: v.string(),
    type: v.union(v.literal("country"), v.literal("emergency"), v.literal("dm")),
  })
    .index("by_country", ["country"])
    .index("by_type", ["type"]),

  chatMessages: defineTable({
    roomId: v.id("chatRooms"),
    authorId: v.id("users"),
    content: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
    isDeleted: v.optional(v.boolean()),
  })
    .index("by_room_time", ["roomId", "_creationTime"]),

  // news + alerts — Module 3
  newsArticles: defineTable({
    sourceId: v.id("newsSources"),
    title: v.string(),
    url: v.string(),
    description: v.optional(v.string()),
    language: v.union(v.literal("he"), v.literal("en")),
    publishedAt: v.number(),
    isFeatured: v.optional(v.boolean()),
    isDeleted: v.optional(v.boolean()),
  })
    .index("by_source", ["sourceId"])
    .index("by_published", ["publishedAt"])
    .index("by_language_published", ["language", "publishedAt"]),

  newsSources: defineTable({
    url: v.string(),
    name: v.string(),
    language: v.union(v.literal("he"), v.literal("en")),
    trustTier: v.union(v.literal("official"), v.literal("verified"), v.literal("community")),
    isActive: v.boolean(),
  }).index("by_active", ["isActive"]),

  alerts: defineTable({
    title: v.string(),
    content: v.string(),
    severity: v.union(v.literal("info"), v.literal("urgent")),
    authorId: v.id("users"),
    isActive: v.boolean(),
  }).index("by_active_severity", ["isActive", "severity"]),

  // reservations — Module 6
  reservations: defineTable({
    sellerId: v.id("users"),
    hotelName: v.string(),
    country: v.string(),
    city: v.string(),
    checkIn: v.number(),
    checkOut: v.number(),
    originalPrice: v.number(),
    askingPrice: v.number(),
    currency: v.string(),
    cancellationPolicy: v.union(
      v.literal("full"), v.literal("partial"), v.literal("none")
    ),
    isSold: v.optional(v.boolean()),
    isDeleted: v.optional(v.boolean()),
  })
    .index("by_country_checkin", ["country", "checkIn"])
    .index("by_seller", ["sellerId"]),

  // map services cache — Module 2 (populated by Convex Action from Google Places)
  services: defineTable({
    placeId: v.string(),
    name: v.string(),
    country: v.string(),
    type: v.union(
      v.literal("chabad"), v.literal("synagogue"), v.literal("kosher"),
      v.literal("embassy"), v.literal("consulate"), v.literal("jcc")
    ),
    lat: v.number(),
    lng: v.number(),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    syncedAt: v.number(),
  })
    .index("by_country_type", ["country", "type"])
    .index("by_place_id", ["placeId"]),

  // admin audit log — Module 7 (Phase 9)
  auditLog: defineTable({
    adminId: v.id("users"),
    action: v.string(),
    targetId: v.optional(v.string()),
    targetType: v.optional(v.string()),
    metadata: v.optional(v.any()),
  }).index("by_admin", ["adminId"]),
});
```

### Pattern 4: Clerk → Convex Webhook User Sync

**What:** An HTTP action at `/clerk-users-webhook` receives Clerk user lifecycle events, verifies the Svix signature, and calls an `internalMutation` to upsert the user into the Convex `users` table.

**When to use:** Phase 1 setup. Every user sign-up and profile update flows through this.

**Example:**
```typescript
// Source: https://docs.convex.dev/auth/database-auth
// convex/http.ts
import { httpRouter } from "convex/server";
import { httpAction, internalMutation } from "./_generated/server";
import { Webhook } from "svix";
import { v } from "convex/values";

const http = httpRouter();

http.route({
  path: "/clerk-users-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) throw new Error("CLERK_WEBHOOK_SECRET not set");

    const svix_id = request.headers.get("svix-id");
    const svix_timestamp = request.headers.get("svix-timestamp");
    const svix_signature = request.headers.get("svix-signature");

    const body = await request.text();
    const wh = new Webhook(webhookSecret);
    let evt: any;

    try {
      evt = wh.verify(body, {
        "svix-id": svix_id!,
        "svix-timestamp": svix_timestamp!,
        "svix-signature": svix_signature!,
      });
    } catch {
      return new Response("Invalid webhook signature", { status: 400 });
    }

    const { type, data } = evt;
    if (type === "user.created" || type === "user.updated") {
      await ctx.runMutation(internal.modules.users.mutations.upsertFromClerk, {
        clerkId: data.id,
        email: data.email_addresses[0]?.email_address ?? "",
        name: `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim(),
        imageUrl: data.image_url,
        role: (data.public_metadata?.role as string) ?? "user",
      });
    }
    if (type === "user.deleted") {
      await ctx.runMutation(internal.modules.users.mutations.deleteFromClerk, {
        clerkId: data.id,
      });
    }

    return new Response(null, { status: 200 });
  }),
});

export default http;
```

### Pattern 5: Clerk JWT Template for Convex

**What:** A custom JWT template named exactly `"convex"` (hardcoded in `ConvexProviderWithClerk`) exposes `publicMetadata` in session claims so Convex functions and `proxy.ts` can read the user's role without a database round-trip.

**When to use:** Must be configured in Clerk Dashboard before any auth code is tested.

**Setup (Clerk Dashboard → JWT Templates → New → Convex):**
```json
{
  "metadata": "{{user.public_metadata}}"
}
```

**TypeScript global types file:**
```typescript
// src/types/globals.d.ts
export type UserRole = "user" | "agent" | "admin";

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: UserRole;
    };
  }
}
```

**convex/auth.config.ts:**
```typescript
// Source: https://docs.convex.dev/auth/clerk
import { AuthConfig } from "convex/server";

export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: "convex",  // MUST be "convex" — hardcoded in ConvexProviderWithClerk
    },
  ],
} satisfies AuthConfig;
```

### Pattern 6: Provider Hierarchy (Root Layout)

**What:** Providers nest in a specific order — `ClerkProvider` wraps `ConvexProviderWithClerk` which wraps everything. `ThemeProvider` from next-themes can wrap the Convex provider. Both are Client Components so they live in a dedicated `ConvexClientProvider.tsx` file.

**When to use:** `app/layout.tsx` (Server Component) imports the client provider wrapper.

**Example:**
```typescript
// Source: https://docs.convex.dev/auth/clerk
// src/providers/ConvexClientProvider.tsx
"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { ThemeProvider } from "./ThemeProvider";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
```

### Pattern 7: next-intl Locale Layout with RTL dir Attribute

**What:** The `[locale]/layout.tsx` Server Component sets the `<html lang dir>` attributes and provides translations to the component tree via `NextIntlClientProvider`.

**When to use:** The single locale layout that all authenticated and public pages inherit.

**Example:**
```typescript
// Source: https://next-intl.dev/docs/getting-started/app-router
// src/app/[locale]/layout.tsx
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";

const RTL_LOCALES = ["he"];

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;  // async params required in Next.js 16

  if (!routing.locales.includes(locale as any)) notFound();

  const messages = await getMessages();
  const dir = RTL_LOCALES.includes(locale) ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

### Pattern 8: Rate Limiter Setup

**What:** A single `RateLimiter` instance configured with named limits for each write operation type. Called at the start of each write mutation.

**When to use:** All write mutations from Phase 1 onward.

**Example:**
```typescript
// Source: https://stack.convex.dev/rate-limiting
// convex/lib/rateLimit.ts
import { RateLimiter } from "@convex-dev/rate-limiter";
import { components } from "../_generated/api";

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

export const rateLimiter = new RateLimiter(components.rateLimiter, {
  createPost:    { kind: "token bucket", rate: 10,  period: MINUTE, capacity: 20 },
  sendMessage:   { kind: "token bucket", rate: 30,  period: MINUTE, capacity: 60 },
  createFlight:  { kind: "token bucket", rate: 5,   period: HOUR },
  createReservation: { kind: "token bucket", rate: 10, period: HOUR },
  reportContent: { kind: "fixed window", rate: 5,   period: HOUR },
});

// Usage in any mutation:
// const { ok, retryAfter } = await rateLimiter.limit(ctx, "createPost", { key: userId });
// if (!ok) throw new Error(`Rate limited. Retry after ${retryAfter}ms`);
```

### Pattern 9: shadcn/ui RTL Init

**What:** The `--rtl` flag on `npx shadcn@latest init` adds `"rtl": true` to `components.json`, which causes the CLI to automatically convert physical CSS classes (`ml-*`, `pl-*`, `left-*`, `text-left`) to their logical equivalents (`ms-*`, `ps-*`, `start-*`, `text-start`) whenever a component is added via `npx shadcn@latest add [component]`.

**When to use:** Must be used at project initialization. Running it after installing components requires `npx shadcn@latest migrate rtl` to retroactively convert.

```bash
# At init
npx shadcn@latest init --rtl

# For existing projects
npx shadcn@latest migrate rtl
```

### Anti-Patterns to Avoid

- **Auth only in proxy.ts:** Clerk middleware is UI protection only; Convex functions are the authoritative gate. Always add `requireUser()` in every sensitive Convex mutation.
- **JWT template named anything other than "convex":** `ConvexProviderWithClerk` hardcodes the template name. Any other name silently breaks Convex auth.
- **Physical CSS properties anywhere:** `ml-`, `mr-`, `pl-`, `pr-`, `left-`, `right-` must never appear in component code. Use `ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`.
- **Skipping schema indexes in Phase 1:** Adding indexes later to populated tables is risky. Define all indexes before writing any data.
- **Checking agent role via Clerk publicMetadata alone in Convex:** Must also verify `user.isApproved` in the Convex `users` table — Clerk metadata can be escalated; DB approval requires admin action.
- **Calling `useQuery` before `isAuthenticated` is confirmed:** Always use the `"skip"` pattern: `useQuery(api.x, isAuthenticated ? args : "skip")`.
- **Using `fetchQuery` in Server Components without `preloadQuery`:** `fetchQuery` returns a static snapshot with no real-time subscription. Use `preloadQuery` + `usePreloadedQuery` for live updates.
- **`params` accessed synchronously in Next.js 16:** All route params and `cookies()`/`headers()` calls must be awaited: `const { locale } = await params`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Webhook signature verification | Custom HMAC validation | `svix` Webhook class | Timing attack risks; Svix handles edge cases |
| Rate limiting in Convex | Custom token bucket with DB writes | `@convex-dev/rate-limiter` | OCC conflicts; token bucket math; fair bursting |
| Dark mode with zero flicker | Cookie + SSR theme reading | `next-themes` | Hydration mismatch is subtle; next-themes injects blocking script |
| Locale routing and detection | Custom middleware locale negotiation | `next-intl createMiddleware()` | Accept-Language header parsing, cookie precedence, redirect logic |
| RTL class conversion | Manual audit of all shadcn components | `shadcn --rtl` flag | 200+ component files; easy to miss one |
| Convex auth helpers | Per-function auth checks | `convex/lib/auth.ts` shared helpers | DRY violations create security holes when one check differs |
| JWT template custom claims | Direct Clerk API calls in Convex | JWT template + `getUserIdentity()` | Token claims are available without network round-trips |

**Key insight:** The hardest part of this phase is not writing code — it is making correct configuration choices (JWT template name, provider order, RTL flag, schema indexes) that are invisible in the code but silently break entire systems if wrong.

---

## Common Pitfalls

### Pitfall 1: Next.js 16 Breaking Changes (async params, proxy.ts)

**What goes wrong:** Code written with Next.js 15 conventions breaks in Next.js 16: synchronous `params` access throws, `middleware.ts` still works but is deprecated, route params in layouts must be awaited.

**Why it happens:** Next.js 16 enforces async params, removes `experimental.dynamicIO` in favor of `cacheComponents`, and renames `middleware.ts` to `proxy.ts`.

**How to avoid:** Run `npx @next/codemod@canary upgrade latest` before writing any layout code. Always `await params` in layouts, pages, and Server Components. Use `proxy.ts` with exported function named `proxy`.

**Warning signs:** TypeScript error "params is not awaitable" — this means you have sync access in a page/layout.

### Pitfall 2: Turbopack + Tailwind v4 Logical Properties

**What goes wrong:** Tailwind CSS v4 logical property utilities (`ms-*`, `me-*`, `ps-*`, `pe-*`) may not work correctly when Turbopack processes CSS, generating invalid `:lang()` pseudo-selectors that break responsive variants.

**Why it happens:** Issue #18810 was reported against Next.js 15.5 + Tailwind v4.1.10. Turbopack applies excessive transpilation to logical property CSS. The Tailwind team closed the issue as a Turbopack bug. The fix must come from Turbopack.

**Status as of research date (2026-03-03):** A separate Turbopack build failure with Tailwind v4.1.18 + Next.js 16 (issue #88443) was resolved in Tailwind. However, the logical property `:lang()` issue resolution with Next.js 16's Turbopack is unconfirmed — this requires early-phase validation.

**How to avoid:**
1. Test RTL layout with real Hebrew content in the first sprint, before building all 5 plans
2. If logical properties break under Turbopack: fall back to webpack for the build (`next build --webpack`) while the issue is tracked
3. Monitor `tailwindcss` GitHub for issue #18810 follow-up

**Warning signs:** RTL layout looks identical to LTR layout despite `dir="rtl"` on `<html>`.

### Pitfall 3: Clerk JWT Template Name Mismatch

**What goes wrong:** Auth appears to work (user can sign in) but Convex functions cannot read `getUserIdentity()`, or return `null` for authenticated users.

**Why it happens:** `ConvexProviderWithClerk` hardcodes the JWT template name as `"convex"`. If the template in the Clerk Dashboard is named anything else (e.g., `"yachad"` or `"default"`), the token passed to Convex will not contain the expected claims.

**How to avoid:** In Clerk Dashboard → JWT Templates → the template MUST be named exactly `"convex"`. The issuer domain from this template goes into `convex/auth.config.ts`.

**Warning signs:** `ctx.auth.getUserIdentity()` returns `null` for signed-in users; Convex dashboard shows auth errors.

### Pitfall 4: ClerkProvider / ConvexProviderWithClerk Order

**What goes wrong:** Convex cannot access the Clerk auth context; `useAuth` from Clerk is undefined inside Convex hooks.

**Why it happens:** `ConvexProviderWithClerk` requires `ClerkProvider` to already be mounted in the tree. If `ConvexProviderWithClerk` wraps `ClerkProvider`, the dependency is inverted.

**How to avoid:** Always: `<ClerkProvider> → <ConvexProviderWithClerk> → children`. Never reverse this.

### Pitfall 5: next-intl Middleware Export in proxy.ts

**What goes wrong:** next-intl locale routing doesn't fire; all routes go to the default locale regardless of URL prefix.

**Why it happens:** `createMiddleware(routing)` from next-intl returns a function that must be called with the request. If you compose Clerk middleware and next-intl middleware incorrectly, the next-intl response gets discarded.

**How to avoid:** Call `intlMiddleware(req)` inside the `clerkMiddleware()` handler and return its result when no Clerk redirect is needed. Check the `matcher` config includes all locale-prefixed routes.

### Pitfall 6: Convex Schema Indexes Not Defined Before Phase 2

**What goes wrong:** Phase 2 queries against large tables (flights, posts) timeout or hit Convex query limits because indexes aren't defined.

**Why it happens:** Developers defer index creation until queries are slow. In Convex, adding an index to a table with existing documents triggers a background backfill — during which the index is not queryable. In production with 50K+ documents, this backfill takes minutes to hours and blocks dependent queries.

**How to avoid:** Define all indexes in `schema.ts` during Phase 1 before any documents are inserted. Follow the schema example above exactly. Add indexes for every query pattern that appears in any of the 7 modules.

### Pitfall 7: Missing `isApproved` Check for Agent Mutations

**What goes wrong:** An unapproved agent (who has `role: "agent"` set in Clerk but is not yet approved) can create flight listings.

**Why it happens:** The `requireAgent()` helper only checks the Clerk role if it doesn't also verify `user.isApproved` from the Convex database.

**How to avoid:** `requireAgent()` in `convex/lib/auth.ts` must check both `user.role === "agent"` AND `user.isApproved === true`. The approval flag is set by admin action only — Clerk role alone is not sufficient.

---

## Code Examples

Verified patterns from official sources:

### i18n Routing Config (routing.ts)

```typescript
// Source: https://next-intl.dev/docs/routing/setup
// i18n/routing.ts
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["he", "en"],
  defaultLocale: "he",
  localePrefix: "always",  // Always show /he/ or /en/ prefix
});
```

### next-intl Request Config (i18n/request.ts)

```typescript
// Source: https://next-intl.dev/docs/getting-started/app-router
// i18n/request.ts
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
```

### next.config.ts with next-intl Plugin

```typescript
// Source: https://next-intl.dev/docs/getting-started/app-router
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // Turbopack is default in Next.js 16 — no config needed
  images: {
    remotePatterns: [
      { hostname: "*.convex.cloud" },  // Convex file storage
    ],
  },
};

export default withNextIntl(nextConfig);
```

### Dashboard Shell Sidebar (shadcn/ui Sidebar Component)

```bash
# Install shadcn sidebar component
npx shadcn@latest add sidebar
npx shadcn@latest add navigation-menu
npx shadcn@latest add dropdown-menu  # For emergency button + profile menu
npx shadcn@latest add skeleton        # For loading states
npx shadcn@latest add sonner          # For toast notifications
npx shadcn@latest add button
npx shadcn@latest add sheet           # For mobile sidebar drawer
```

### Convex Auth Skip Pattern for Client Components

```typescript
// Source: https://stack.convex.dev/authentication-best-practices-convex-clerk-and-nextjs
"use client";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function FlightList() {
  const { isAuthenticated } = useConvexAuth();
  const flights = useQuery(
    api.modules.flights.queries.list,
    isAuthenticated ? {} : "skip"  // Skip until Convex token is ready
  );
  if (!flights) return <FlightSkeleton />;
  return <>{flights.map(f => <FlightCard key={f._id} flight={f} />)}</>;
}
```

### Server Component Page with preloadQuery

```typescript
// Source: https://docs.convex.dev/client/nextjs/app-router/server-rendering
// src/app/[locale]/(dashboard)/flights/page.tsx
import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { FlightList } from "@/modules/flights";

export default async function FlightsPage() {
  // SSR data preload — hands off subscription to Client Component
  const preloaded = await preloadQuery(api.modules.flights.queries.list, {});
  return <FlightList preloaded={preloaded} />;
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `middleware.ts` with `export function middleware()` | `proxy.ts` with `export function proxy()` (or `export default`) | Next.js 16 (Oct 2025) | Must rename file and function; old name deprecated |
| `clerkMiddleware()` protecting all routes by default | `clerkMiddleware()` makes ALL routes public by default; must opt-in with `createRouteMatcher` | Clerk v6 | Easy to forget; unprotected routes are a security footgun |
| Tailwind v3 with `tailwindcss-rtl` plugin | Tailwind v4 built-in logical properties; no plugin needed | TailwindCSS v4 (Jan 2025) | Plugin conflicts with v4; must use `ms-`, `me-`, `ps-`, `pe-` natively |
| shadcn/ui manual RTL audit | `npx shadcn@latest init --rtl` converts all components | January 2026 | Eliminates weeks of manual component RTL work |
| `middleware.ts` at Edge runtime | `proxy.ts` defaults to Node.js runtime | Next.js 16 | `rss-parser`, `svix`, `web-push` can now run in proxy; no separate API routes needed for Node-only libs |
| Sync `params` in layouts/pages | Must `await params` in Next.js 16 | Next.js 16 (Oct 2025) | Build-time error if not awaited |
| `experimental.dynamicIO` flag | `cacheComponents: true` in next.config.ts | Next.js 16 | Rename; old flag removed |
| Legacy Places API (`Autocomplete` class) | Places API New (`PlaceAutocompleteElement`) | March 1, 2025 | New Google Cloud accounts cannot use legacy API at all |

**Deprecated/outdated:**
- `middleware.ts`: Still works in Next.js 16 but deprecated; will be removed in future version
- `tailwindcss-rtl` plugin: Conflicts with Tailwind v4; do not install
- `next-i18next`: Pages Router only; no App Router support

---

## Open Questions

1. **Turbopack + Tailwind v4 Logical Properties (Next.js 16)**
   - What we know: Issue #18810 was filed against Next.js 15.5 + Tailwind v4.1.10 where Turbopack generates `:lang()` selectors that break logical property responsive variants. Closed as a Turbopack bug.
   - What's unclear: Whether Next.js 16's stable Turbopack has resolved this specific issue. A separate build failure (#88443 with Tailwind v4.1.18 + Next.js 16) was resolved in Tailwind itself.
   - Recommendation: Build a minimal RTL test in the first task of Plan 01-01. If `ms-4`, `ps-6` fail to apply in RTL context under Turbopack, add `--webpack` to the build script immediately and file an issue. Do not block the phase on this — the workaround is stable.

2. **Clerk + next-intl Middleware Composition in proxy.ts**
   - What we know: Both `clerkMiddleware()` and `createMiddleware(routing)` from next-intl need to run for every request. They need to be composed, not simply exported one-or-the-other.
   - What's unclear: The exact composition pattern when Clerk auth.protect() needs to fire AND next-intl locale detection needs to fire for the same request, with locale-prefixed redirect URLs in the Clerk redirect target.
   - Recommendation: In Plan 01-03, test the auth redirect URL — it must redirect to `/{locale}/sign-in`, not `/sign-in`. Clerk's `auth.protect()` `unauthorizedUrl` option may need to include the locale prefix.

3. **IP Geolocation for Country Selector Onboarding**
   - What we know: The country selector onboarding requires "auto-detect via IP geolocation." Vercel provides `req.geo` in Edge middleware, but `proxy.ts` now runs on Node.js runtime, not Edge.
   - What's unclear: How to access IP geolocation in Node.js proxy.ts. Options: pass geolocation from a separate Edge route, use a third-party IP geolocation API (ipapi.co), or use Vercel's `x-vercel-ip-country` header (available on Node.js functions too).
   - Recommendation: Use the `x-vercel-ip-country` request header in proxy.ts — Vercel injects this for all runtimes including Node.js. Pass it as a response header to the app. For non-Vercel dev: fall back to manual selection. Do not depend on browser geolocation in onboarding (requires permission prompt).

---

## Sources

### Primary (HIGH confidence)

- [Next.js 16 Release Blog](https://nextjs.org/blog/next-16) — proxy.ts rename, Turbopack stable default, breaking changes (async params, removed flags), React 19.2
- [Next.js proxy.ts File Convention Docs](https://nextjs.org/docs/app/api-reference/file-conventions/proxy) — exact export convention, matcher config, Node.js runtime confirmation
- [Convex + Clerk Official Integration](https://docs.convex.dev/auth/clerk) — auth.config.ts, ConvexProviderWithClerk, ctx.auth.getUserIdentity() pattern
- [Convex database-auth (webhook sync)](https://docs.convex.dev/auth/database-auth) — HTTP action setup, Svix signature verification, internalMutation upsert pattern
- [Clerk RBAC with publicMetadata](https://clerk.com/docs/guides/secure/basic-rbac) — JWT template setup, sessionClaims.metadata.role, checkRole pattern
- [Clerk clerkMiddleware() reference](https://clerk.com/docs/reference/nextjs/clerk-middleware) — proxy.ts export convention, matcher config
- [next-intl App Router getting started](https://next-intl.dev/docs/getting-started/app-router) — defineRouting, createMiddleware, getMessages, getTranslations
- [next-intl proxy/middleware docs](https://next-intl.dev/docs/routing/middleware) — createMiddleware(routing) export, matcher config for locale routing
- [Convex Schema docs](https://docs.convex.dev/database/schemas) — defineSchema, defineTable, chained .index() API
- [Convex rate limiting](https://stack.convex.dev/rate-limiting) — RateLimiter setup, token bucket / fixed window config, mutation usage
- [shadcn/ui RTL Support Changelog](https://ui.shadcn.com/docs/changelog/2026-01-rtl) — --rtl flag, migrate rtl command, logical property auto-conversion
- [shadcn/ui dark mode Next.js](https://ui.shadcn.com/docs/dark-mode/next) — next-themes ThemeProvider, attribute="class" config
- [TailwindCSS v4 Release](https://tailwindcss.com/blog/tailwindcss-v4) — logical properties built-in (ms-, me-, ps-, pe-), CSS-first config

### Secondary (MEDIUM confidence)

- [GitHub issue #18810: Logical properties not working with Turbopack](https://github.com/tailwindlabs/tailwindcss/issues/18810) — confirmed Turbopack-specific issue; workaround is --webpack; status with Next.js 16 unconfirmed
- [GitHub discussion #88443: Tailwind v4.1.18 + Next.js 16 Turbopack build failure](https://github.com/vercel/next.js/discussions/88443) — separate build failure, confirmed resolved in Tailwind
- [Clerk blog: Webhooks Data Sync with Convex](https://clerk.com/blog/webhooks-data-sync-convex) — webhook endpoint URL, Signing Secret setup, event types
- [Authentication Best Practices: Convex, Clerk, Next.js](https://stack.convex.dev/authentication-best-practices-convex-clerk-and-nextjs) — skip pattern, three-layer auth, role storage

### Tertiary (LOW confidence — flagged for validation)

- Turbopack + logical properties resolution in Next.js 16 — unconfirmed; requires hands-on testing in Plan 01-01

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all library choices verified against official docs and release notes
- Architecture: HIGH — provider order, proxy.ts pattern, and Convex schema patterns are from official documentation
- Pitfalls: HIGH — most pitfalls verified against official issue trackers or CVE disclosures; Turbopack issue is MEDIUM (open question)
- Code examples: HIGH — sourced from official documentation, not blog posts

**Research date:** 2026-03-03
**Valid until:** 2026-04-03 for stable items; 2026-03-17 for Turbopack + logical properties (fast-moving)
