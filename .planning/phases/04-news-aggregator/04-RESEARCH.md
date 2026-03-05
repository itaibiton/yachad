# Phase 4: News Aggregator - Research

**Researched:** 2026-03-05
**Domain:** RSS ingestion (Convex actions + crons), news feed UI, alert banner (real-time Convex subscriptions)
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Article card design**
- Full cards showing all key info — headline, 2-3 line description snippet (150-200 chars, truncated with ellipsis), source favicon + name, trust tier badge, language badge, relative timestamp
- Tapping a card opens the original article URL in a new tab directly — no in-app preview sheet
- Source attribution: small favicon icon + source name text + colored trust tier chip (Official=Israeli blue, Verified=green, Community=gray)
- Language badge: small "HE" or "EN" chip in corner of card, subtle but visible
- Single column feed layout on both desktop and mobile — news is read top-to-bottom

**Urgent alert banner**
- Full-width red/orange banner pinned above the feed, bold text with warning icon — unmissable emergency style
- Alert banner appears across ALL dashboard pages, not just the news page — urgent alerts are critical everywhere
- Dismiss per session — alert reappears on next visit while still active (sessionStorage)
- Multiple active alerts stack vertically, most recent on top

**Feed refresh & new content**
- "N new articles" clickable banner at top when new content arrives — user controls when feed updates, doesn't disrupt reading position
- "Last updated X ago" indicator below the page header, subtle text
- Infinite scroll using usePaginatedQuery — consistent with flights module pattern
- Pull-to-refresh on mobile for manual feed update check

**Country filter & promoted articles**
- Country filter auto-populates from useAppStore().selectedCountry — same pattern as flights module
- Promoted/pinned articles: dedicated "Important" section pinned above the main chronological feed, with "Important" badge — follows UrgentFlightsSection pattern from flights

**Initial RSS sources (seed)**
- Hebrew: Ynet, Walla, Mako, Israel Hayom, Kan News
- English: Times of Israel, Jerusalem Post, i24NEWS
- Trust tier badges: Official (Israeli blue), Verified (green), Community (gray)

### Claude's Discretion
- Exact card spacing, shadows, typography, responsive breakpoints
- Loading skeleton design for news cards
- Empty state design (no news articles / no matching filters)
- Error state handling
- Exact "last updated" refresh interval and format
- RSS ingestion deduplication strategy
- Pull-to-refresh implementation approach
- Feed auto-refresh polling interval (within 5-10 min requirement)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| NEWS-01 | User can view chronological news feed from multiple Israeli sources | `by_published` index + usePaginatedQuery ordered desc, listNewsArticles Convex query |
| NEWS-02 | User can see source attribution (outlet name + favicon) on each article | newsSources join in query, Google S2 favicon URL `https://www.google.com/s2/favicons?domain=X&sz=32`, faviconUrl stored in newsSources table |
| NEWS-03 | User can see urgent alert banner pinned above the news feed (admin-created, dismissible) | alerts table with `by_active_severity` index, useQuery subscription, sessionStorage dismiss pattern |
| NEWS-04 | System aggregates 10-20 RSS feeds with deduplication | `rss-parser` npm in Convex Node.js action + `"use node"` directive, deduplication via `by_url` index on newsArticles |
| NEWS-05 | User can tap article to open original source in new tab | `<a href={article.url} target="_blank" rel="noopener noreferrer">` — no Sheet, direct link |
| NEWS-06 | User can see Hebrew and English sources with language badge | `language` field on newsArticles + newsSources schema already defined; HE/EN chip Badge component |
| NEWS-07 | News feed auto-refreshes every 5-10 minutes with "last updated" indicator | Convex `usePaginatedQuery` is reactive (items added = automatic re-render); "N new articles" banner via snapshot diff; cron runs every 5 min |
| NEWS-08 | Admin can promote/pin stories marked as "Important" with badge | `isFeatured` boolean on newsArticles, list promoted via separate query like listUrgentFlights pattern |
| NEWS-09 | Each source displays trust tier badge: Official / Verified / Community | `trustTier` field on newsSources schema; colored Badge variants |
| NEWS-10 | User can filter news by country relevance | `country` field on newsArticles; nuqs URL params like flights; useAppStore selectedCountry auto-populate |
</phase_requirements>

---

## Summary

Phase 4 has three distinct implementation planes: (1) a server-side RSS ingestion pipeline using Convex scheduled actions with the `rss-parser` npm library in Node.js runtime, (2) a news feed UI following the established flights module patterns, and (3) an alert banner integrated into DashboardShell for cross-page display. The schema is already fully defined in `convex/schema.ts` — `newsArticles`, `newsSources`, and `alerts` tables with all necessary indexes. No schema changes are needed.

The key technical insight is that `usePaginatedQuery` in Convex is fully reactive: when the cron ingests new articles, the Convex query re-fires automatically and the client receives updates. The "N new articles" UX pattern requires a snapshot approach — capture the result count at mount time, compare to new counts from the subscription, and surface a dismissible top-of-feed banner rather than forcing a scroll-position-disrupting re-render. This is a client-side state machine, not a server feature.

The DashboardShell integration for the alert banner is clean: add `AlertBanner` as a sibling to `<main>` inside `SidebarInset`, querying `alerts` with `useQuery` for real-time updates. The sessionStorage dismiss pattern (store dismissed alert IDs in `sessionStorage` on mount, re-check on each render) avoids any Convex writes for per-session dismissals.

**Primary recommendation:** Use `rss-parser` (Node.js action, `"use node"` directive) + Convex `crons.interval({ minutes: 5 })` for ingestion; model the news UI directly on FlightsGrid/UrgentFlightsSection patterns; add AlertBanner into DashboardShell above `<main>`.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `rss-parser` | latest (~3.13.x) | Parse RSS/Atom XML feeds into JS objects | De facto standard Node.js RSS parser; MIT; well-maintained; TypeScript support |
| `convex` | ^1.32.0 (already installed) | Scheduled actions, crons, queries, mutations | Already in use; crons.interval() runs server-side |
| `convex/server` `cronJobs` | same | Define cron schedule in `convex/crons.ts` | Official Convex cron API |
| `nuqs` | ^2.8.9 (already installed) | URL-state for news filters (language, country) | Already used in flights module; same pattern |
| `zustand` | ^5.0.11 (already installed) | Read selectedCountry for auto-filter | Already in `useAppStore` |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `react-intersection-observer` | ^10.0.3 (already installed) | Infinite scroll sentinel for usePaginatedQuery | Same as FlightsGrid — already installed |
| `date-fns` | ^4.1.0 (already installed) | `formatDistanceToNow()` for "last updated X ago" and article timestamps | Already in project |
| `convex-helpers` | ^0.1.114 (already installed) | `filter()` helper for post-index filtering in paginated queries | Already used in flights queries |
| Google S2 favicon service | N/A (HTTP URL) | `https://www.google.com/s2/favicons?domain=X&sz=32` — fetch any site's favicon | Free, no key required; returns PNG; works in `<img src>` |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `rss-parser` | `feedparser` (Node.js stream-based) | rss-parser is simpler, promise-based, TypeScript-native; feedparser is lower-level and stream-based, overkill for this |
| `rss-parser` | Custom XML parsing with `fast-xml-parser` | Hand-rolling RSS parsing misses many edge cases (Atom, media:content, encoding quirks) |
| Google S2 favicon | Storing favicon bytes in Convex storage | S2 is zero-effort, zero-storage; fallback to source initial letter if S2 returns blank |
| sessionStorage for dismiss | Convex `userDismissedAlerts` table | sessionStorage is simpler, no auth required, correct scope (per-session not per-user-forever) |
| usePaginatedQuery reactive | Manual polling with setInterval | Convex subscriptions auto-update; no polling needed for new articles; cron runs and DB updates trigger re-render |

**Installation:**
```bash
npm install rss-parser
```
(All other dependencies already installed)

---

## Architecture Patterns

### Recommended Project Structure
```
convex/
├── crons.ts                         # NEW — cron schedule (5-min RSS ingestion)
├── modules/
│   ├── news/                        # NEW module directory
│   │   ├── actions.ts               # "use node" — internalAction: fetchRssFeeds
│   │   ├── mutations.ts             # internalMutation: upsertArticles, seed sources
│   │   └── queries.ts               # listNewsArticles, listFeaturedArticles, listActiveSources
│   └── alerts/                      # NEW module directory
│       └── queries.ts               # listActiveAlerts (public query for banner)

src/shared/components/news/          # NEW — follows flights/ pattern
├── NewsClientPage.tsx               # "use client" — orchestrator (like FlightsClientPage)
├── NewsFilterBar.tsx                # language + country filter (like FlightFilterBar)
├── NewsGrid.tsx                     # usePaginatedQuery infinite scroll (like FlightsGrid)
├── NewsCard.tsx                     # article card (like FlightCard)
├── FeaturedNewsSection.tsx          # pinned Important section (like UrgentFlightsSection)
├── NewArticlesBanner.tsx            # "N new articles" click-to-refresh
└── news-utils.ts                    # formatRelativeTime, getTrustTierVariant, etc.

src/shared/components/
└── AlertBanner.tsx                  # NEW — cross-page urgent alert banner (in DashboardShell)

src/app/[locale]/(dashboard)/news/
├── page.tsx                         # Replace placeholder with server component
├── loading.tsx                      # Already exists — update skeleton
└── error.tsx                        # Already exists
```

### Pattern 1: Convex Node.js Action for RSS Ingestion
**What:** An `internalAction` using `"use node"` to import `rss-parser` npm package. Fetches all active sources from DB via `ctx.runQuery`, parses each feed, then writes new articles via `ctx.runMutation`.
**When to use:** Any time you need an npm package not available in Convex's default V8 runtime.

```typescript
// convex/modules/news/actions.ts
"use node";
import { internalAction } from "../../_generated/server";
import { internal } from "../../_generated/api";
import Parser from "rss-parser";

export const fetchRssFeeds = internalAction({
  args: {},
  handler: async (ctx) => {
    // 1. Get all active sources from DB
    const sources = await ctx.runQuery(internal.modules.news.queries.listActiveSources);

    const parser = new Parser({
      timeout: 10_000,
      headers: { "User-Agent": "Yachad/1.0 RSS Reader" },
    });

    const articlesToUpsert: Array<{
      sourceId: string;
      title: string;
      url: string;
      description?: string;
      language: "he" | "en";
      publishedAt: number;
    }> = [];

    for (const source of sources) {
      try {
        const feed = await parser.parseURL(source.url);
        for (const item of feed.items.slice(0, 20)) {
          if (!item.link || !item.title) continue;
          articlesToUpsert.push({
            sourceId: source._id,
            title: item.title,
            url: item.link,
            description: item.contentSnippet?.slice(0, 200),
            language: source.language,
            publishedAt: item.isoDate
              ? new Date(item.isoDate).getTime()
              : Date.now(),
          });
        }
      } catch (err) {
        console.error(`RSS fetch failed for ${source.name}:`, err);
        // Continue to next source — don't fail entire batch
      }
    }

    // 2. Write all articles (deduplication inside mutation via by_url index)
    await ctx.runMutation(internal.modules.news.mutations.upsertArticles, {
      articles: articlesToUpsert,
    });
  },
});
```

### Pattern 2: Cron Job — 5-minute RSS Ingestion
**What:** `convex/crons.ts` registers the RSS action on an interval.

```typescript
// convex/crons.ts
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "fetch-rss-feeds",
  { minutes: 5 },
  internal.modules.news.actions.fetchRssFeeds,
);

export default crons;
```

### Pattern 3: Deduplication via `by_url` Index
**What:** The `newsArticles` table already has a `by_url` index. The `upsertArticles` mutation checks if a URL already exists before inserting.

```typescript
// convex/modules/news/mutations.ts (internal)
export const upsertArticles = internalMutation({
  args: {
    articles: v.array(v.object({
      sourceId: v.string(), // will convert to v.id("newsSources")
      title: v.string(),
      url: v.string(),
      description: v.optional(v.string()),
      language: v.union(v.literal("he"), v.literal("en")),
      publishedAt: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    for (const article of args.articles) {
      // Check by_url index — skip if already exists
      const existing = await ctx.db
        .query("newsArticles")
        .withIndex("by_url", (q) => q.eq("url", article.url))
        .unique();
      if (existing) continue;

      await ctx.db.insert("newsArticles", {
        sourceId: article.sourceId as Id<"newsSources">,
        title: article.title,
        url: article.url,
        description: article.description,
        language: article.language,
        publishedAt: article.publishedAt,
        isFeatured: false,
        isDeleted: false,
      });
    }
  },
});
```

### Pattern 4: Paginated News Query (follows flights pattern)
**What:** `listNewsArticles` uses `by_published` index, optional country/language filter via convex-helpers `filter()`, supports usePaginatedQuery.

```typescript
// convex/modules/news/queries.ts
export const listNewsArticles = query({
  args: {
    paginationOpts: paginationOptsValidator,
    language: v.optional(v.union(v.literal("he"), v.literal("en"))),
    country: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const baseQuery = ctx.db
      .query("newsArticles")
      .withIndex("by_published")
      .order("desc");

    const filtered = filter(baseQuery, (article) => {
      if (article.isDeleted === true) return false;
      if (article.isFeatured === true) return false; // featured shown separately
      if (args.language && article.language !== args.language) return false;
      if (args.country && article.country !== args.country) return false;
      return true;
    });

    const result = await filtered.paginate(args.paginationOpts);

    // Denormalize source data
    const enriched = await Promise.all(
      result.page.map(async (article) => {
        const source = await ctx.db.get(article.sourceId);
        return {
          ...article,
          sourceName: source?.name ?? "Unknown",
          sourceFaviconUrl: source?.faviconUrl ?? null,
          sourceTrustTier: source?.trustTier ?? "community",
        };
      })
    );

    return { ...result, page: enriched };
  },
});
```

### Pattern 5: Alert Banner in DashboardShell
**What:** Add `AlertBanner` above `<main>` inside `SidebarInset`. It uses `useQuery` for real-time updates and sessionStorage for dismiss-per-session.

```typescript
// src/shared/components/AlertBanner.tsx
"use client";
import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { X, AlertTriangle } from "lucide-react";

export function AlertBanner() {
  const alerts = useQuery(api.modules.alerts.queries.listActiveAlerts);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  // Load dismissed IDs from sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem("dismissed-alert-ids");
    if (stored) {
      try { setDismissedIds(new Set(JSON.parse(stored))); }
      catch { /* ignore corrupt storage */ }
    }
  }, []);

  const dismiss = (alertId: string) => {
    setDismissedIds((prev) => {
      const next = new Set(prev);
      next.add(alertId);
      sessionStorage.setItem("dismissed-alert-ids", JSON.stringify([...next]));
      return next;
    });
  };

  const visibleAlerts = (alerts ?? []).filter((a) => !dismissedIds.has(a._id));
  if (visibleAlerts.length === 0) return null;

  return (
    <div className="flex flex-col">
      {visibleAlerts.map((alert) => (
        <div
          key={alert._id}
          className="flex items-center gap-3 bg-red-600 text-white px-4 py-2.5"
          role="alert"
        >
          <AlertTriangle className="size-5 shrink-0" aria-hidden />
          <div className="flex flex-col flex-1 min-w-0">
            <p className="font-semibold text-sm">{alert.title}</p>
            <p className="text-xs text-red-100 truncate">{alert.content}</p>
          </div>
          <button
            onClick={() => dismiss(alert._id)}
            aria-label="Dismiss alert"
            className="shrink-0 rounded-full p-1 hover:bg-red-700 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
```

**DashboardShell integration:**
```typescript
// src/shared/components/DashboardShell.tsx — add AlertBanner above <main>
<SidebarInset>
  <TopBar />
  <AlertBanner />   {/* NEW — between TopBar and main */}
  <main className="flex-1 overflow-y-auto p-4 md:p-6">
    {children}
  </main>
</SidebarInset>
```

### Pattern 6: "N New Articles" Snapshot Banner
**What:** Client-side state machine. Capture article count at mount, compare to reactive subscription updates. This does NOT require a new Convex query — usePaginatedQuery results are reactive.

```typescript
// NewsGrid.tsx — new articles notification
const { results, status, loadMore } = usePaginatedQuery(...);
const [seenCount, setSeenCount] = useState<number | null>(null);
const [pendingCount, setPendingCount] = useState(0);

// Set baseline once first page loads
useEffect(() => {
  if (status !== "LoadingFirstPage" && seenCount === null) {
    setSeenCount(results.length);
  }
}, [status, results.length, seenCount]);

// Detect new articles arriving
useEffect(() => {
  if (seenCount !== null && results.length > seenCount) {
    setPendingCount(results.length - seenCount);
  }
}, [results.length, seenCount]);

const applyNewArticles = () => {
  setSeenCount(results.length);
  setPendingCount(0);
  // Scroll to top
  window.scrollTo({ top: 0, behavior: "smooth" });
};
```

### Pattern 7: Favicon Display
**What:** Use Google S2 favicon service as `<img src>` with fallback to source name initial letter.

```typescript
// In NewsCard.tsx
function SourceFavicon({ domain, name }: { domain: string; name: string }) {
  const [error, setError] = useState(false);
  if (error) {
    return (
      <span className="flex size-4 items-center justify-center rounded-sm bg-muted text-[10px] font-bold">
        {name[0]}
      </span>
    );
  }
  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
      alt={name}
      className="size-4 rounded-sm"
      onError={() => setError(true)}
    />
  );
}
```

### Anti-Patterns to Avoid
- **Fetching RSS in a Convex mutation:** Mutations cannot do network I/O (no `fetch`). Always use an `action` for external HTTP calls.
- **Putting `rss-parser` in a file without `"use node"`:** Node.js modules (like stream-based features of rss-parser) are not available in Convex's default V8 runtime. The `"use node"` file cannot also contain queries/mutations — keep separate files.
- **Parsing RSS client-side:** CORS will block direct RSS fetches from the browser. RSS ingestion must be server-side (Convex action).
- **Polling with setInterval on the client:** Convex subscriptions (`useQuery`, `usePaginatedQuery`) are already reactive. New articles inserted by the cron automatically trigger re-renders.
- **Using `.filter()` before `.paginate()` in Convex:** Use `convex-helpers`'s `filter()` wrapper instead to avoid undersized pagination pages (same lesson from flights module).
- **Storing dismissal in Convex DB:** Creates unnecessary writes per user per session. sessionStorage is correct scope.
- **Not extracting domain from RSS source URL for favicons:** Store `faviconUrl` in newsSources or derive from the source's `url` field at display time.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| RSS/Atom XML parsing | Custom XML parser | `rss-parser` npm | Handles Atom, RSS 1.0/2.0, media:content, encoding, malformed XML, character escaping |
| Cron scheduling | setTimeout loops, Vercel crons | Convex `crons.interval()` | Durable, co-located with DB, no separate infra |
| Feed deduplication | Hash-based custom logic | `by_url` index + unique check | URL is the natural dedup key; Convex index lookup is O(log n) |
| Favicon fetching | Scraping HTML `<link rel=icon>` | Google S2 favicon service | Free, handles all favicon discovery edge cases, CDN-cached |
| Relative timestamps | Custom date math | `date-fns` `formatDistanceToNow()` | Already in project; handles all edge cases |
| sessionStorage state | Custom serialization | Direct JSON.parse/stringify in useEffect | Simple enough; no library needed; usehooks-ts would add a dep for minimal gain |

**Key insight:** The RSS ingestion + deduplication is the hardest piece — don't underestimate feed quirks (missing pubDate, duplicate GUIDs, malformed XML). `rss-parser` absorbs these edge cases. Keep ingestion logic in the action and delegate all writes to an internalMutation to preserve transaction safety.

---

## Common Pitfalls

### Pitfall 1: `"use node"` File Isolation
**What goes wrong:** Developer puts `internalAction` (with `"use node"`) and `internalMutation` in the same file. Convex refuses to bundle.
**Why it happens:** Convex requires that files with `"use node"` contain ONLY actions — no queries or mutations.
**How to avoid:** Separate `actions.ts` (with `"use node"`) from `mutations.ts` and `queries.ts`. The `crons.ts` file stays in root convex/ without `"use node"`.
**Warning signs:** `Error: Files with the "use node" directive should not contain any Convex queries or mutations`

### Pitfall 2: RSS Fetch Timeout / Hang
**What goes wrong:** A malformed source URL causes the action to hang indefinitely, blocking the entire batch.
**Why it happens:** `rss-parser` default timeout is quite long; Israeli news sites may be slow or geo-blocked.
**How to avoid:** Pass `timeout: 10_000` (10 seconds) to the Parser constructor. Wrap each source fetch in `try/catch` and `continue` on error — never let one bad source kill the batch.
**Warning signs:** Cron job runs but articles stop appearing; action timeout errors in Convex logs.

### Pitfall 3: usePaginatedQuery Reactive Behavior and Scroll
**What goes wrong:** New articles auto-prepend to the top, jumping the user's scroll position while they're reading.
**Why it happens:** `usePaginatedQuery` is reactive — when new articles are inserted, the first page refires and results update. This is correct behavior but jarring UX.
**How to avoid:** Implement the "N new articles" snapshot banner pattern (Pattern 6 above). Capture count at mount, detect count increase, surface a clickable banner, and only apply the new results when the user taps the banner.
**Warning signs:** Users complain the feed "jumps" while reading.

### Pitfall 4: Convex Actions Are NOT Exactly-Once
**What goes wrong:** Developer assumes a failed action is re-tried automatically and relies on this for correctness.
**Why it happens:** Convex mutations are exactly-once; but actions (which have side effects) are at-most-once. A failed fetchRssFeeds action will not auto-retry.
**How to avoid:** Don't care — the cron runs every 5 minutes. A missed run loses at most 5 minutes of articles. The by_url deduplication means re-running is idempotent. This is acceptable.

### Pitfall 5: Israeli News Sites and CORS/RSS Format Quirks
**What goes wrong:** Ynet Hebrew feed returns ISO-8859-8 (Hebrew encoding), timestamps are missing, or pubDate format is non-standard.
**Why it happens:** Hebrew news sites have varied RSS quality. Mako and Walla in particular have non-standard feed structures.
**How to avoid:** `rss-parser` handles encoding well. For missing `pubDate`, fall back to `Date.now()` (ingestion time). Validate `item.link` before inserting — some feeds use `item.guid` instead of `item.link` for the URL. Use `item.link ?? item.guid` as the URL fallback.
**Warning signs:** Articles appear with identical timestamps; "undefined" URLs in DB.

### Pitfall 6: Google S2 Favicon Service Reliability
**What goes wrong:** Google's favicon service returns a blank 1x1 pixel PNG for some domains, making the favicon invisible.
**Why it happens:** S2 is an unofficial, undocumented service with no SLA. Some Israeli domains (especially Hebrew ccTLDs) return blanks.
**How to avoid:** `onError` fallback to first letter of source name (Pattern 7). Also pre-populate `faviconUrl` in the seed data with known good URLs for each initial source.
**Warning signs:** Favicon images appear blank in cards.

### Pitfall 7: Alert Banner Mount Order in DashboardShell
**What goes wrong:** AlertBanner hydration mismatch because it reads sessionStorage (browser-only) during server render.
**Why it happens:** sessionStorage is not available during SSR. If the dismissed state is read synchronously, it will differ between server and client.
**How to avoid:** Initialize `dismissedIds` as an empty Set (`useState(new Set())`), then populate from sessionStorage only in a `useEffect` (after mount, client-side only). This matches the pattern shown in code example above.
**Warning signs:** React hydration error warnings about mismatched rendered output.

---

## Code Examples

Verified patterns from existing project and official docs:

### Convex crons.ts (from official docs pattern)
```typescript
// convex/crons.ts
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "fetch-rss-feeds",
  { minutes: 5 },
  internal.modules.news.actions.fetchRssFeeds,
);

export default crons;
```
Source: [Convex Cron Jobs docs](https://docs.convex.dev/scheduling/cron-jobs)

### usePaginatedQuery with IntersectionObserver (matches FlightsGrid pattern)
```typescript
// NewsGrid.tsx (mirrors FlightsGrid.tsx exactly)
const { results, status, loadMore } = usePaginatedQuery(
  api.modules.news.queries.listNewsArticles,
  { language: filters.language, country: filters.country },
  { initialNumItems: 20 },
);

const { ref, inView } = useInView({ threshold: 0, rootMargin: "200px 0px" });

useEffect(() => {
  if (inView && status === "CanLoadMore") {
    loadMore(20);
  }
}, [inView, status, loadMore]);
```
Source: Existing FlightsGrid.tsx in codebase

### nuqs URL filter state (matches useFlightFilters pattern)
```typescript
// src/shared/hooks/useNewsFilters.ts
import { useQueryStates, parseAsStringLiteral } from "nuqs";
import { useAppStore } from "@/stores/appStore";

const LANGUAGES = ["he", "en"] as const;
const newsFilterParsers = {
  lang: parseAsStringLiteral(LANGUAGES),
  country: parseAsString,
};

export function useNewsFilters() {
  const [urlParams, setUrlParams] = useQueryStates(newsFilterParsers, { shallow: true });
  const selectedCountry = useAppStore((s) => s.selectedCountry);

  const effectiveCountry = urlParams.country === "_all"
    ? undefined
    : urlParams.country || selectedCountry || undefined;

  return {
    filters: { language: urlParams.lang ?? undefined, country: effectiveCountry },
    urlParams, setUrlParams,
    clearAll: () => setUrlParams({ lang: null, country: null }),
  };
}
```

### Seed data for initial news sources
```typescript
// convex/seed.ts (add to existing or new seedNewsSources mutation)
const INITIAL_SOURCES = [
  // Hebrew — Official
  { url: "https://www.ynet.co.il/Integration/StoryRss2.xml", name: "Ynet", language: "he", trustTier: "official", faviconUrl: "https://www.google.com/s2/favicons?domain=ynet.co.il&sz=32" },
  { url: "https://rss.walla.co.il/feed/1", name: "Walla News", language: "he", trustTier: "official", faviconUrl: "https://www.google.com/s2/favicons?domain=walla.co.il&sz=32" },
  { url: "https://rss.kan.org.il/Rss/RssKanNews.aspx", name: "Kan News", language: "he", trustTier: "official", faviconUrl: "https://www.google.com/s2/favicons?domain=kan.org.il&sz=32" },
  // Hebrew — Verified
  { url: "https://www.israelhayom.co.il/rss-feed", name: "Israel Hayom", language: "he", trustTier: "verified", faviconUrl: "https://www.google.com/s2/favicons?domain=israelhayom.co.il&sz=32" },
  { url: "https://www.mako.co.il/AjaxPage?jspName=rssfeed.jsp&categoryId=2", name: "Mako", language: "he", trustTier: "verified", faviconUrl: "https://www.google.com/s2/favicons?domain=mako.co.il&sz=32" },
  // English — Official
  { url: "https://www.timesofisrael.com/feed/", name: "Times of Israel", language: "en", trustTier: "official", faviconUrl: "https://www.google.com/s2/favicons?domain=timesofisrael.com&sz=32" },
  { url: "https://rss.jpost.com/rss/rssfeedsfr.aspx", name: "Jerusalem Post", language: "en", trustTier: "official", faviconUrl: "https://www.google.com/s2/favicons?domain=jpost.com&sz=32" },
  { url: "https://www.i24news.tv/en/rss", name: "i24NEWS", language: "en", trustTier: "verified", faviconUrl: "https://www.google.com/s2/favicons?domain=i24news.tv&sz=32" },
];
```
Note: **Verify these RSS URLs before seeding** — some may have changed. The exact Mako and Israel Hayom RSS endpoints need validation against their current live sites.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `feedparser` (stream-based) | `rss-parser` (promise-based, TypeScript) | ~2019 | Simpler API, TypeScript support, browser support |
| Custom cron on Vercel/Railway | Convex `crons.interval()` | Convex 1.x | Co-located with DB, no separate infra, guaranteed by Convex |
| Polling with setInterval | Convex reactive subscriptions | Convex 1.x | Zero-latency UI updates, no client-side timers needed |
| Storing favicons in your own S3/storage | Google S2 service `https://www.google.com/s2/favicons` | ~2015 (undocumented) | Zero setup, still widely used in 2025 |

**Deprecated/outdated:**
- Convex `crons.cron()` with traditional cron syntax: Still valid but `crons.interval()` is simpler for "every N minutes" use cases.

---

## Open Questions

1. **Exact Mako and Israel Hayom RSS URLs**
   - What we know: Both sites have RSS feeds; Mako uses a JSP-based RSS endpoint; Israel Hayom has had URL changes historically
   - What's unclear: Whether the URLs in the seed data above are currently live and parseable by rss-parser
   - Recommendation: Plan a "verify seed data" step in Plan 04-01 where the developer manually tests each RSS URL with `rss-parser` before committing them as seeds

2. **newsArticles `country` field population**
   - What we know: `country` is `v.optional(v.string())` on newsArticles; the schema has it; NEWS-10 requires country filter
   - What's unclear: How to populate it — RSS feeds don't include country relevance metadata. Israeli sources always cover Israel; English sources may cover multiple countries.
   - Recommendation: For the seed sources, hardcode `country: "IL"` for all Israeli-focused sources during ingestion. The admin can override per-article in Phase 9. The country filter (NEWS-10) can initially just be a client-side filter defaulting to "IL" with an option to clear.

3. **`by_language_published` index usage**
   - What we know: This index exists on `newsArticles` schema: `["language", "publishedAt"]`
   - What's unclear: Whether to use this index for language-filtered queries (more efficient) vs. using `by_published` + convex-helpers `filter()` for language
   - Recommendation: For the primary query, use `by_published` + `filter()` for simplicity and consistency with the flights pattern. If performance becomes an issue with a very large articles table, switch to `by_language_published` for language-scoped queries. Document this choice in the plan.

4. **Pull-to-refresh on mobile**
   - What we know: It's in Claude's discretion; the requirement is for it to trigger a manual feed refresh
   - What's unclear: Browser support for native pull-to-refresh gesture detection in a scrollable div
   - Recommendation: Use a `touchstart`/`touchmove` listener on the scrollable container. When the user pulls down 80px+ while at scroll position 0, show a refresh indicator and call `loadMore`/refetch. This is straightforward to implement without a library; no need for react-pull-to-refresh.

---

## Validation Architecture

> `workflow.nyquist_validation` is not present in `.planning/config.json`. The config has no `nyquist_validation` key, so this section is skipped.

---

## Sources

### Primary (HIGH confidence)
- Convex Cron Jobs Docs — https://docs.convex.dev/scheduling/cron-jobs — crons.ts structure, crons.interval(), internal function references
- Convex Actions Docs — https://docs.convex.dev/functions/actions — `"use node"` directive, ctx.runMutation pattern, Node.js runtime constraints
- Convex Pagination Docs — https://docs.convex.dev/database/pagination — usePaginatedQuery reactive behavior, status values, infinite scroll example
- Convex Internal Functions Docs — https://docs.convex.dev/functions/internal-functions — internalAction, internalMutation, internal.X.Y calling pattern
- Existing project codebase: convex/schema.ts (newsArticles, newsSources, alerts tables + indexes), convex/modules/flights/ (query + mutation patterns to follow), src/shared/components/flights/ (component architecture to mirror)

### Secondary (MEDIUM confidence)
- rss-parser GitHub README — https://github.com/rbren/rss-parser — item fields (title, link, contentSnippet, isoDate, guid), TypeScript generic types, Node.js + browser support
- Times of Israel RSS — https://www.timesofisrael.com/feed/ (confirmed working main feed)
- Jerusalem Post RSS — https://www.jpost.com/rss (RSS landing page confirms feed availability)
- Google S2 favicon service — `https://www.google.com/s2/favicons?domain=X&sz=32` — confirmed working 2024-2025 per multiple dev blog sources; returns PNG

### Tertiary (LOW confidence — verify before using)
- Ynet Hebrew RSS URL: `https://www.ynet.co.il/Integration/StoryRss2.xml` — needs validation against live site
- Mako RSS URL: `https://www.mako.co.il/AjaxPage?jspName=rssfeed.jsp&categoryId=2` — needs validation
- Israel Hayom RSS URL: `https://www.israelhayom.co.il/rss-feed` — needs validation
- Kan News RSS URL: `https://rss.kan.org.il/Rss/RssKanNews.aspx` — needs validation
- i24NEWS RSS URL: `https://www.i24news.tv/en/rss` — needs validation
- Walla RSS URL: `https://rss.walla.co.il/feed/1` — needs validation

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — rss-parser is the obvious npm choice; all other deps already in project
- Architecture: HIGH — directly mirrors established flights module patterns; Convex patterns verified against official docs
- RSS seed URLs: LOW — not directly verified from live feeds; each URL must be tested before seeding
- Pitfalls: HIGH — "use node" file isolation is documented; CORS/RSS quirks are well-known

**Research date:** 2026-03-05
**Valid until:** 2026-04-05 (30 days — stable libraries, but RSS URLs should be re-validated before seeding)
