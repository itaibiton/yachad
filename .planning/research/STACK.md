# Stack Research

**Domain:** Real-time crisis-response platform (Israeli emergency services / evacuation coordination)
**Researched:** 2026-03-03
**Confidence:** HIGH (verified via npm registry, official docs, and multiple concordant sources)

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 16.x (App Router) | Full-stack React framework | Mandatory. App Router with Turbopack as default bundler, React Server Components, Cache Components, route-level streaming, and `proxy.ts` (replaces middleware.ts). Next.js 16 is stable and works with React 19.2. Use `next@latest`. |
| TypeScript | 5.9.x | Type safety | Mandatory. Convex, Clerk, and next-intl all ship first-class TypeScript types. Minimum TS 5 required for next-intl v4. |
| TailwindCSS | 4.2.x | Utility-first CSS | Mandatory. v4 is stable with shadcn and Next.js 16. Use CSS logical properties (`ms-`, `me-`, `ps-`, `pe-`) natively — no RTL plugin needed for v4. |
| shadcn/ui | latest CLI | Component library | Mandatory. Copy-paste component model, not a library dep. Install via `npx shadcn@latest init`. Use Tailwind v4 init path for new projects. |
| Clerk (`@clerk/nextjs`) | 6.x (6.39+) | Auth, roles, proxy | Mandatory. v6.35+ supports Next.js 16 and React 19.2. Provides `clerkMiddleware()` (used in `proxy.ts`), role-based RBAC via `publicMetadata`, JWT session tokens. ClerkProvider must wrap ConvexClientProvider. |
| Convex (`convex`) | 1.32.x | Database + realtime + backend functions | Mandatory. Built-in reactive subscriptions with sub-50ms latency. Scales to billions of docs. TypeScript-first schema and query definitions. Use `ConvexProviderWithClerk` from `convex/react-clerk`. |
| Zustand | 5.x | Client-side state | Mandatory. Zero-boilerplate atom-based state. Use for UI state (modal visibility, locale preference, map viewport state) not for server data (Convex handles that). |

### Authentication & Authorization

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@clerk/nextjs` | 6.39+ | Auth, sessions, organizations | Always — core dependency. Use `clerkMiddleware()` in `proxy.ts` (Next.js 16 convention, replaces `middleware.ts`) to protect routes. |
| `svix` | 1.86+ | Clerk webhook signature verification | Required. Clerk sends all webhooks through Svix. Use in Convex HTTP action to validate `svix-id`, `svix-timestamp`, `svix-signature` headers and sync users to Convex. |
| `convex/react-clerk` | (part of `convex` 1.32+) | Clerk-Convex bridge | Always. Exports `ConvexProviderWithClerk` which automatically passes Clerk JWT to Convex for auth validation. |

**RBAC implementation note:** Use `publicMetadata` on Clerk user objects to store roles (`role: "admin" | "agent" | "user"`). Expose the role in the JWT template so Convex functions can read `ctx.auth.getUserIdentity()` and enforce authorization server-side. Do NOT rely on client-side role checks alone.

### Internationalization (i18n) + RTL

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `next-intl` | 4.8.x | i18n routing, translations, formatting | Always. v4 (released March 2025) is App Router-first, supports Server Components natively via `getTranslations()`, strictly-typed locales, TypeScript 5+ required. |
| TailwindCSS v4 logical props | (built-in) | RTL layout directionality | Always. TailwindCSS v4 ships `ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-` utilities natively. These are CSS logical properties that automatically flip in RTL without any plugin. |
| `rtl-detect` (optional) | — | Locale-to-direction helper | Only if you need programmatic direction detection in JS/TS outside of template logic. |

**RTL implementation:** In your locale layout component, maintain an `rtlLocales = ['he']` array and conditionally set `<html dir={rtlLocales.includes(locale) ? 'rtl' : 'ltr'} lang={locale}>`. Browsers handle all rendering direction from the `dir` attribute. Use TailwindCSS logical properties throughout — avoid `ml-`, `mr-`, `pl-`, `pr-`, `left-`, `right-` in favor of their logical equivalents.

**Do NOT use a dedicated RTL Tailwind plugin** (`tailwindcss-rtl`, `tailwindcss-flip`) with Tailwind v4 — logical props are built in and those plugins target v3's utility model.

### Maps & Location

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@vis.gl/react-google-maps` | 1.7.x | Google Maps JavaScript API for React | Always. Officially endorsed by Google Maps Platform. Ships `<APIProvider>`, `<Map>`, `<Marker>`, `useMapsLibrary()`. Works in App Router Client Components. |
| `use-places-autocomplete` | 4.0.x | Places autocomplete with debounce and cache | For address search and service search inputs. Lightweight (use with the new Places API — see critical note below). |

**CRITICAL — Google Places API (as of March 1, 2025):** The legacy `google.maps.places.Autocomplete` class and `AutocompleteService` are **not available to new customers** as of 2025-03-01. Use `PlaceAutocompleteElement` (the new Web Component-based widget from the Places API New) or `AutocompleteSuggestion` instead. This project started after March 2025, so you must use the new Places API from day one. Enable "Places API (new)" in Google Cloud Console, NOT the legacy "Places API".

Practical approach with `@vis.gl/react-google-maps`: use `useMapsLibrary('places')` to load the Places library, then use `PlaceAutocompleteElement` or build a custom input with `AutocompleteSuggestion` from the new API. The library GitHub discussion #707 covers the migration pattern.

### Database & Real-time (Convex Ecosystem)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `convex` | 1.32.x | Core client + server SDK | Always. Includes `convex/react`, `convex/nextjs`, `convex/server`. |
| `convex-helpers` | 0.1.114 | Zod validators, CRUD helpers, session ID, custom functions | Always. First-party package from Convex team. Adds Zod schema validation for Convex args, row-level security helpers, and pagination utilities. |
| `@convex-dev/rate-limiter` | 0.3.x | Application-layer rate limiting in Convex functions | Required for crisis-scale platform. Prevents spam posts, DDoS via mutations, and abuse of agent-facing endpoints. Transactional, fair, configurable token-bucket or fixed-window algorithms. |

**Convex pagination pattern:** Use Convex's native `usePaginatedQuery` hook for infinite scroll (it manages cursor state automatically). For social feeds with real-time updates + pagination, this is the correct primitive. Do NOT attempt to use TanStack Query's `useInfiniteQuery` with Convex — the integration is partial and the community gap around `convexInfiniteQuery` is not production-ready as of early 2026.

### RSS Feed Parsing

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `rss-parser` | 3.13.x | Parse RSS/Atom feed URLs into JavaScript objects | Use in Next.js Route Handlers (server-side) for the live news aggregator. Supports both `parseURL()` and `parseString()`. |

**Architecture for RSS:** Fetch and cache RSS feeds in a Next.js Route Handler with `revalidate` (ISR) or a Convex scheduled action (cron). Do NOT fetch RSS on the client — CORS restrictions will block cross-origin feed URLs in the browser. Parse on the server, store normalized articles in Convex, and serve via `useQuery`.

### Image Handling & File Upload

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Convex File Storage (built-in) | — | Image + file upload and serving | Use for profile photos, post images, flight listing photos. Three-step flow: `generateUploadUrl()` mutation → POST file → save `storageId`. |
| `next/image` | (built-in) | Optimized image rendering | Always. Wrap all Convex-served images with `<Image>` for lazy loading and format optimization. Configure `convex.site` domain in `next.config.js`. |
| `sharp` | 0.34.x | Server-side image resizing (if needed) | Only if you need server-side resize before upload. Often unnecessary — Convex serves original files directly. |

**20MB limit note:** Convex HTTP actions have a 20MB request size limit. For larger files, use the `generateUploadUrl()` approach (uploads directly to Convex's storage endpoint, bypassing the HTTP action layer). Profile photos and standard post images are well under this limit; implement a client-side size check before upload.

### Notifications (In-App + Browser Push)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `sonner` | 2.0.x | In-app toast notifications | Always. shadcn/ui's official toast recommendation. Replaces react-hot-toast. Ships as a shadcn component via `npx shadcn add sonner`. |
| `web-push` | 3.6.x | Browser Web Push API for push notifications | Use for critical safety alerts (extraction available, area danger updates). Serverless-compatible, works on Vercel. Requires service worker. |

**Note on push notifications:** Browser push requires a service worker and VAPID keys. For a crisis platform where push is a safety-critical feature (not a nice-to-have), invest in proper setup. The `web-push` library handles VAPID signing. Alternatively defer to Phase 2 and use Convex subscriptions for in-session notifications in Phase 1.

### Rich Text

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@tiptap/react` | 3.20.x | Rich text editor (social feed posts, agent listings) | Use for social feed post creation and flight package descriptions. Headless, composable, shadcn-compatible. |
| `@tiptap/starter-kit` | 3.x | Tiptap extension bundle (bold, italic, lists, etc.) | Always with Tiptap. |

**RTL note for Tiptap:** Tiptap respects the document `dir` attribute for text direction. Hebrew text entered by users in an RTL context will display correctly without extra configuration.

### Forms & Validation

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `react-hook-form` | 7.71.x | Form state management | Always for complex forms (agent registration, flight listing). |
| `zod` | 3.x (3.24+) | Schema validation | Always. Validate on client and server. Use `convex-helpers` Zod integration to share schemas between frontend and Convex validators. |
| `@hookform/resolvers` | 3.x | Connect Zod to react-hook-form | Always when using both together. |

### UI Utilities

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `lucide-react` | 0.476+ | Icon library | Always — shadcn/ui's icon library. |
| `clsx` + `tailwind-merge` | 2.1.x / 3.5.x | Conditional class merging | Always. shadcn uses `cn()` utility built from these. |
| `date-fns` | 4.x | Date formatting and manipulation | For timestamps on posts, flight departure times. Lightweight, tree-shakeable. |
| `react-intersection-observer` | 10.0.x | Viewport intersection detection | For infinite scroll trigger (pair with `usePaginatedQuery`). |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| ESLint + `@typescript-eslint` | Linting | Next.js ships with ESLint preset. Add TypeScript rules. |
| Prettier | Code formatting | Add `prettier-plugin-tailwindcss` for consistent class ordering. |
| Convex CLI (`npx convex dev`) | Local Convex dev server + type generation | Run alongside `next dev`. Generates TypeScript types for all Convex functions automatically. |
| `npx shadcn@latest add` | Component installation | Copy-paste components into your codebase. Run per component as needed. |

---

## Installation

```bash
# Core framework (Next.js 16 + React 19.2 + TypeScript + Tailwind v4 + Turbopack)
npx create-next-app@latest yachad-global --typescript --tailwind --app --src-dir --import-alias "@/*"

# Initialize shadcn (Tailwind v4 path)
npx shadcn@latest init

# Core platform dependencies
npm install convex @clerk/nextjs zustand next-intl

# Maps
npm install @vis.gl/react-google-maps use-places-autocomplete

# Forms + validation
npm install react-hook-form zod @hookform/resolvers

# UI utilities
npm install lucide-react clsx tailwind-merge date-fns sonner

# Rich text
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder

# RSS
npm install rss-parser

# Webhooks (Clerk → Convex sync)
npm install svix

# Convex ecosystem
npm install convex-helpers @convex-dev/rate-limiter

# Infinite scroll trigger
npm install react-intersection-observer

# Dev dependencies
npm install -D @types/node @types/react @types/react-dom prettier prettier-plugin-tailwindcss

# Optional: Browser push notifications (Phase 2)
npm install web-push
npm install -D @types/web-push
```

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| `next-intl` v4 | `react-i18next` / `i18next` | Never for this project. next-intl is App Router-native with RSC support. react-i18next requires client-only or complex bridging. |
| `next-intl` v4 | `lingui` | If you need a message extraction workflow with PO files (agency translations). For this project, JSON messages are sufficient. |
| TailwindCSS v4 logical props (built-in) | `tailwindcss-rtl` / `tailwindcss-flip` | Only if using Tailwind v3. On v4, logical prop utilities are first-class. Avoid these plugins entirely on v4. |
| `@vis.gl/react-google-maps` | `google-map-react` | Never. `google-map-react` is abandoned (last release 2021). |
| `@vis.gl/react-google-maps` | `@react-google-maps/api` | Only if you need the legacy Places Autocomplete widget (deprecated for new customers March 2025). This library is less actively maintained than vis.gl. |
| Convex native file storage | AWS S3 / Cloudflare R2 | Only if files consistently exceed 20MB or you need CDN transformations. For v1 profile photos and post images, Convex storage is sufficient. |
| `rss-parser` | `fast-xml-parser` | If you need more control over HTTP layer or are in a Cloudflare Workers / Edge environment where Node.js compat is limited. `rss-parser` uses `node-fetch` internally. |
| `sonner` | `react-hot-toast` | If you want the absolute minimum bundle size. sonner is shadcn's official pick and should be preferred for this project. |
| `@tiptap/react` | `Quill` / `Draft.js` | Never. Both are legacy libraries with poor TypeScript support and maintenance issues. |
| Convex `usePaginatedQuery` | TanStack Query `useInfiniteQuery` + Convex | The `convexInfiniteQuery` pattern is a community gap as of early 2026 — no stable helper exists. Use `usePaginatedQuery` which is purpose-built for Convex cursors. |
| `web-push` (self-hosted VAPID) | Firebase Cloud Messaging (FCM) | If you need iOS push support beyond PWA mode. FCM reaches iOS via APNs. For browser push in a web-first platform, `web-push` is lighter and vendor-free. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `google-map-react` | Abandoned. Last release 2021. No App Router support. | `@vis.gl/react-google-maps` |
| `@react-google-maps/api` `Autocomplete` component | Wraps the legacy `google.maps.places.Autocomplete` class which is **not available to new Google Maps customers as of March 1, 2025**. Will fail to initialize for new projects. | `PlaceAutocompleteElement` via `useMapsLibrary('places')` in `@vis.gl/react-google-maps` |
| `react-i18next` / `i18next` | Requires client-only `useTranslation` or complex SSR bridging. In App Router with RSC, translations trigger client bundle inflation. next-intl is the standard for this stack. | `next-intl` v4 |
| `next-i18next` | Pages Router only. No App Router support at all. | `next-intl` v4 |
| `tailwindcss-rtl` or `tailwindcss-flip` plugins | Designed for Tailwind v3's directional utility model. Redundant and potentially conflicting with Tailwind v4's built-in logical properties. | Tailwind v4 logical props (`ms-`, `me-`, `start-`, `end-`) |
| `socket.io` | Unnecessary. Convex provides WebSocket-based reactive subscriptions built into the stack. Adding Socket.io creates a second real-time layer with its own server. | Convex `useQuery` subscriptions |
| Firebase (Firestore/Realtime DB) | Redundant. Convex is already the database and real-time layer. Adding Firebase creates dual-database complexity. | Convex |
| Prisma / Drizzle | Convex uses its own document/function model, not SQL. ORM is the wrong abstraction. | Convex schema + validators |
| Supabase | Redundant with Convex. | Convex |
| `Draft.js` / `Quill` | Legacy rich text editors with poor TypeScript support and maintenance concerns. Draft.js development appears to have stalled. | `@tiptap/react` |
| `moment.js` | 67KB + deprecated. No tree-shaking. | `date-fns` v4 |
| Redux / Redux Toolkit | Excessive for this stack. Convex handles server state reactively; Zustand handles the remaining client state needs. | Zustand |
| Client-side RSS fetching | CORS restrictions block cross-origin RSS feeds in the browser. Requests will fail for most news sources. | Next.js Route Handler or Convex scheduled action (server-side) |
| `Autocomplete` from legacy Places API | Unavailable to new Google Cloud customers since March 2025. | `PlaceAutocompleteElement` (new Places API) |

---

## Stack Patterns by Variant

**For real-time social feed (useQuery + infinite scroll):**
- Use `usePaginatedQuery` from `convex/react` for cursor-based pagination
- Trigger next page load with `react-intersection-observer` IntersectionObserver
- Do NOT use `useInfiniteQuery` from TanStack Query — the Convex adapter is incomplete for this pattern

**For server-rendered locale pages:**
- Use `getTranslations()` from `next-intl/server` in Server Components
- Use `useTranslations()` from `next-intl` in Client Components
- Set `dir` attribute at the `<html>` element level in `[locale]/layout.tsx`

**For authenticated Convex mutations:**
- Always use `ctx.auth.getUserIdentity()` inside mutations and queries to enforce auth server-side
- Do NOT add `auth: "required"` only at the proxy level — Convex functions must also verify

**For agent-only actions (flight listings):**
- Check `publicMetadata.role === 'agent'` inside the Convex mutation after `getUserIdentity()`
- Use `convex-helpers` `customMutation` to create a reusable `agentMutation` wrapper

**For RSS news ingestion:**
- Use a Convex scheduled action (cron every 5 minutes) to fetch, parse, and upsert news items
- `rss-parser` runs in Node.js context — Convex actions support Node.js runtime
- Store normalized articles in Convex with `_creationTime` for ordering

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| `next@16.x` | `react@19.2.x`, `react-dom@19.2.x` | App Router, React 19.2, Turbopack default, stable as of Oct 2025. |
| `@clerk/nextjs@6.x` | `next@16.x`, `react@19.2.x` | v6.35+ required for Next.js 16. Use `clerkMiddleware()` in `proxy.ts`. |
| `convex@1.32.x` | `next@16.x`, `@clerk/nextjs@6.x` | `ConvexProviderWithClerk` from `convex/react-clerk`. Requires `useAuth` from `@clerk/nextjs`. |
| `next-intl@4.x` | `next@16.x`, `typescript@5+` | v4 requires TypeScript 5+. Middleware config goes in `proxy.ts` for Next.js 16. |
| `tailwindcss@4.x` + `shadcn@latest` | `next@16.x` | Use `npx shadcn@latest init` — it detects Tailwind v4 and configures appropriately. Do NOT use `shadcn@2.3.0` (that is for v3). |
| `@vis.gl/react-google-maps@1.7.x` | `react@18.x` and `react@19.x` | Actively maintained. Client Component only (cannot use in RSC). |
| `@tiptap/react@3.x` | `react@18.x` and `react@19.x` | v3 is the current stable. Client Component only. |
| `svix@1.86.x` | Node.js runtime | Used in Convex HTTP actions which run in the Convex Node.js runtime. |
| `rss-parser@3.13.x` | Node.js runtime | Server-only. Use in Convex actions or Next.js Route Handlers (not Edge runtime). |
| `web-push@3.6.x` | Node.js runtime | Server-only. Not compatible with Edge runtime. Use in Next.js API Route with `runtime = 'nodejs'`. |

---

## Deployment Stack

| Layer | Service | Notes |
|-------|---------|-------|
| Frontend (Next.js) | Vercel | First-class Next.js 16 support. App Router, Turbopack, Edge Network, Cache Components, serverless functions. Connect GitHub repo for auto-deploy. |
| Backend / Database | Convex Cloud | Convex manages its own hosting. `npx convex deploy` on merge to main. Environment variables set in Convex dashboard. |
| Auth | Clerk (hosted) | No self-hosting. Configure JWT template in Clerk dashboard to expose `role` claim. Set webhook endpoint to Convex HTTP action URL (`.convex.site/clerk-users-webhook`). |
| Maps / Places | Google Cloud | Enable: Maps JavaScript API, Places API (New). Restrict API key to your domain(s) in production. |
| Image CDN | Convex file storage (built-in) | Files served from `*.convex.cloud`. Add to `next.config.js` `images.remotePatterns`. |

**Proxy and runtime on Vercel:**
- `proxy.ts` (Next.js 16) runs on Node.js runtime — Edge runtime is NOT supported in proxy. This is a change from Next.js 15's `middleware.ts` which ran on Edge.
- Use Node.js serverless for API routes that require `rss-parser` or `web-push` (both are Node.js-only libraries).
- Convex functions run in Convex's own runtime — not Vercel's. Next.js code that calls Convex via HTTP does so from the client or from server-rendered components.

---

## Sources

- [Convex + Clerk official integration docs](https://docs.convex.dev/auth/clerk) — ConvexProviderWithClerk setup, JWT template, webhook pattern (HIGH confidence)
- [Clerk RBAC with publicMetadata](https://clerk.com/docs/guides/secure/basic-rbac) — Role implementation without Clerk Organizations (HIGH confidence)
- [next-intl v4.0 release blog](https://next-intl.dev/blog/next-intl-4-0) — v4 breaking changes, TS5 requirement, Server Component APIs (HIGH confidence)
- [next-intl App Router getting started](https://next-intl.dev/docs/getting-started/app-router) — Official setup docs (HIGH confidence)
- [vis.gl react-google-maps GitHub issue #736](https://github.com/visgl/react-google-maps/issues/736) — Confirmation: legacy Places Autocomplete unavailable to new customers March 2025 (HIGH confidence)
- [Google Places deprecation official page](https://developers.google.com/maps/deprecations) — Timeline and migration requirements (HIGH confidence)
- [Convex pagination docs](https://docs.convex.dev/database/pagination) — usePaginatedQuery pattern (HIGH confidence)
- [Convex rate limiter](https://github.com/get-convex/rate-limiter) — @convex-dev/rate-limiter official package (HIGH confidence)
- [Convex file storage docs](https://docs.convex.dev/file-storage/upload-files) — generateUploadUrl() pattern, 20MB limit (HIGH confidence)
- [Tailwind CSS v4 + shadcn stability](https://ui.shadcn.com/docs/tailwind-v4) — Official shadcn Tailwind v4 support page (HIGH confidence)
- [shadcn/ui Sonner component](https://ui.shadcn.com/) — Sonner is the official shadcn toast (HIGH confidence)
- npm registry version checks (convex, @clerk/nextjs, next-intl, @vis.gl/react-google-maps, zustand, rss-parser, zod, react-hook-form, sonner, etc.) — All versions verified 2026-03-03 (HIGH confidence)
- [Tiptap Next.js docs](https://tiptap.dev/docs/editor/getting-started/install/nextjs) — Official Next.js integration (HIGH confidence)
- [Convex webhooks + Clerk sync](https://clerk.com/blog/webhooks-data-sync-convex) — User sync pattern using Svix (HIGH confidence)
- [Lingo.dev RTL Next.js guide](https://lingo.dev/en/nextjs-i18n/right-to-left-languages) — dir attribute implementation (MEDIUM confidence — third-party guide, verified against next-intl docs)
- [Convex scalability — sub-50ms at 5K concurrent, SEDA architecture](https://docs.convex.world/docs/overview/performance) — Performance benchmarks (MEDIUM confidence — official but not at 50K+ benchmark level)

---

*Stack research for: Yachad (יחד) — real-time crisis-response platform*
*Researched: 2026-03-03*
