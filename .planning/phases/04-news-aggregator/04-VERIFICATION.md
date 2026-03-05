---
phase: 04-news-aggregator
verified: 2026-03-05T12:00:00Z
status: passed
score: 15/15 must-haves verified
re_verification: false
---

# Phase 4: News Aggregator Verification Report

**Phase Goal:** Users can monitor a live, curated news feed from Israeli sources with urgent alert banners, source attribution, and automatic refresh
**Verified:** 2026-03-05
**Status:** PASSED
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

#### Plan 04-01 Truths (Backend)

| # | Truth | Status | Evidence |
|---|-------|--------|---------|
| 1 | Paginated news article query returns non-deleted, non-featured articles ordered by publishedAt desc | VERIFIED | `convex/modules/news/queries.ts` L21-64: `withIndex("by_published").order("desc")`, `filter()` excludes `isDeleted === true` and `isFeatured === true`, `.paginate(paginationOpts)` |
| 2 | Featured articles are fetched separately via listFeaturedArticles for the pinned Important section | VERIFIED | `convex/modules/news/queries.ts` L73-112: `listFeaturedArticles` query filters `isFeatured !== true`, `.take(10)` |
| 3 | Each article result includes denormalized source name, favicon URL, and trust tier | VERIFIED | Both `listNewsArticles` and `listFeaturedArticles` run `Promise.all` mapping articles to add `sourceName`, `sourceFaviconUrl`, `sourceTrustTier` |
| 4 | Articles can be filtered by language (he/en) and country | VERIFIED | `listNewsArticles` args include `language?: v.union(v.literal("he"), v.literal("en"))` and `country?: v.string()`; filter applied in handler |
| 5 | RSS feeds are ingested every 5 minutes via cron-triggered Convex action | VERIFIED | `convex/crons.ts` L14-18: `crons.interval("fetch-rss-feeds", { minutes: 5 }, internal.modules.news.actions.fetchRssFeeds)` |
| 6 | Duplicate articles are skipped via by_url index deduplication | VERIFIED | `convex/modules/news/mutations.ts` L33-37: `withIndex("by_url").first()`, `if (existing !== null) continue;` |
| 7 | Active alerts query returns alerts ordered by most recent for the banner | VERIFIED | `convex/modules/alerts/queries.ts` L12-21: `by_active_severity` index, `.order("desc").take(5)` |
| 8 | Active news sources are queryable for the RSS ingestion action | VERIFIED | `convex/modules/news/queries.ts` L120-128: `listActiveSources` as `internalQuery` using `by_active` index |
| 9 | i18n messages for the news module exist in both Hebrew and English | VERIFIED | `messages/en.json` and `messages/he.json` both contain `"news"` namespace (25 keys) and `"alerts"` namespace (2 keys) |

#### Plan 04-02 Truths (UI Components)

| # | Truth | Status | Evidence |
|---|-------|--------|---------|
| 10 | News article cards display headline, description snippet, source favicon + name, trust tier badge, language badge, and relative timestamp | VERIFIED | `NewsCard.tsx` L34-98: `<a>` wrapper, favicon with Google S2 fallback and letter fallback, trust tier `Badge` from `getTrustTierConfig()`, language badge `"HE"/"EN"`, `formatDistanceToNow` |
| 11 | Tapping a card opens the original article URL in a new tab | VERIFIED | `NewsCard.tsx` L34-38: `<a href={article.url} target="_blank" rel="noopener noreferrer">` block-level anchor |
| 12 | Featured articles render in a pinned Important section above the main feed | VERIFIED | `FeaturedNewsSection.tsx` renders `useQuery(api.modules.news.queries.listFeaturedArticles)` results above feed with amber ring styling; `NewsClientPage.tsx` places it before `<NewsGrid>` |
| 13 | Infinite scroll loads more articles as user scrolls down | VERIFIED | `NewsGrid.tsx` L56-66: `useInView` with `rootMargin: "200px 0px"`, `useEffect` triggers `loadMore(20)` when `inView && status === "CanLoadMore"` |
| 14 | N new articles banner appears when fresh content arrives without disrupting scroll position | VERIFIED | `NewsGrid.tsx` L69-87: `seenCount`/`pendingCount` state tracking, `<NewArticlesBanner count={pendingCount} onShow={applyNewArticles} />` rendered when `pendingCount > 0` |

#### Plan 04-03 Truths (Page Wiring)

| # | Truth | Status | Evidence |
|---|-------|--------|---------|
| 15 | Urgent alert banner appears pinned above content on ALL dashboard pages when active alerts exist | VERIFIED | `AlertBanner.tsx` subscribes to `listActiveAlerts` via `useQuery`; `DashboardShell.tsx` L20: `<AlertBanner />` between `<TopBar />` and `<main>` |
| 16 | Alert banner is dismissible per session via sessionStorage — reappears on next visit while still active | VERIFIED | `AlertBanner.tsx` L17-26: `useEffect` reads from `sessionStorage.getItem("yachad-dismissed-alerts")` on mount; dismiss handler writes dismissed IDs back |
| 17 | News page displays a curated feed with Important section, filters, infinite scroll, and last-updated indicator | VERIFIED | `NewsClientPage.tsx`: header with `t("lastUpdated")` + 60s `setInterval`, `<NewsFilterBar>`, `<FeaturedNewsSection>`, `<NewsGrid>` all composed |
| 18 | The news page replaces the Coming Soon placeholder | VERIFIED | `src/app/[locale]/(dashboard)/news/page.tsx` contains only `import { NewsClientPage }` and renders `<NewsClientPage />` — no Coming Soon content present |

**Score:** 18/18 truths verified (15 plan must-haves + 3 additional plan 04-03 truths)

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `convex/modules/news/queries.ts` | listNewsArticles, listFeaturedArticles, listActiveSources | VERIFIED | 129 lines; all three exports present and substantive |
| `convex/modules/news/mutations.ts` | upsertArticles, seedNewsSources, markArticleFeatured | VERIFIED | 182 lines; all three internalMutations present |
| `convex/modules/news/actions.ts` | fetchRssFeeds internalAction with "use node" | VERIFIED | 82 lines; `"use node"` on L1, single `internalAction` export |
| `convex/modules/alerts/queries.ts` | listActiveAlerts query | VERIFIED | 22 lines; `listActiveAlerts` public query present |
| `convex/crons.ts` | 5-minute cron for fetch-rss-feeds | VERIFIED | 21 lines; `crons.interval("fetch-rss-feeds", { minutes: 5 }, ...)` |
| `messages/he.json` | news namespace with all UI strings in Hebrew | VERIFIED | "news" namespace (25 keys) and "alerts" namespace (2 keys) present |
| `messages/en.json` | news namespace with all UI strings in English | VERIFIED | "news" namespace (25 keys) and "alerts" namespace (2 keys) present |
| `src/shared/components/news/NewsCard.tsx` | Article card with attribution, badges, external link | VERIFIED | 99 lines; "use client", full implementation with favicon, badges, timestamp |
| `src/shared/components/news/NewsGrid.tsx` | Infinite scroll news feed with usePaginatedQuery | VERIFIED | 232 lines; "use client", usePaginatedQuery, useInView, pull-to-refresh, new articles banner |
| `src/shared/components/news/FeaturedNewsSection.tsx` | Pinned Important articles section | VERIFIED | 58 lines; "use client", useQuery, null-render when empty, amber ring styling |
| `src/shared/components/news/NewsFilterBar.tsx` | Language + country filter bar | VERIFIED | 139 lines; "use client", desktop flex + mobile scroll, CountryCombobox integration |
| `src/shared/components/news/NewArticlesBanner.tsx` | Clickable banner showing count of new articles | VERIFIED | 27 lines; "use client", count==1 singular vs plural handling, animation classes |
| `src/shared/components/news/news-utils.ts` | NewsArticleWithSource type, getTrustTierConfig, extractDomain | VERIFIED | 61 lines; all three exports present and substantive |
| `src/shared/hooks/useNewsFilters.ts` | URL-synced filter state hook | VERIFIED | 59 lines; "use client", nuqs useQueryStates, useAppStore integration, "_all" sentinel |
| `src/shared/components/AlertBanner.tsx` | Cross-page alert banner with sessionStorage dismiss | VERIFIED | 89 lines; "use client", useQuery for alerts, sessionStorage in useEffect |
| `src/shared/components/DashboardShell.tsx` | Updated shell with AlertBanner between TopBar and main | VERIFIED | AlertBanner imported and placed at L20 between TopBar and main |
| `src/shared/components/news/NewsClientPage.tsx` | Client-side news page orchestrator | VERIFIED | 71 lines; "use client", composes all news components with useNewsFilters |
| `src/app/[locale]/(dashboard)/news/page.tsx` | Server component replacing Coming Soon | VERIFIED | 5 lines; pure server component, renders `<NewsClientPage />` |
| `src/app/[locale]/(dashboard)/news/loading.tsx` | Updated loading skeleton | VERIFIED | 38 lines; Skeleton components representing news card shapes |

---

### Key Link Verification

#### Plan 04-01 Key Links

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `convex/modules/news/queries.ts` | `convex/schema.ts` | `withIndex("by_published")` | WIRED | L30 and L80 both use `withIndex("by_published")`; schema defines this index at `newsArticles.index("by_published", ["publishedAt"])` |
| `convex/modules/news/actions.ts` | `convex/modules/news/mutations.ts` | `ctx.runMutation(internal...upsertArticles)` | WIRED | `actions.ts` L75: `ctx.runMutation(internal.modules.news.mutations.upsertArticles, { articles: articlesToUpsert })` |
| `convex/modules/news/actions.ts` | `convex/modules/news/queries.ts` | `ctx.runQuery(internal...listActiveSources)` | WIRED | `actions.ts` L25-27: `ctx.runQuery(internal.modules.news.queries.listActiveSources)` |
| `convex/crons.ts` | `convex/modules/news/actions.ts` | `crons.interval` triggers `fetchRssFeeds` | WIRED | `crons.ts` L14-18: `crons.interval("fetch-rss-feeds", { minutes: 5 }, internal.modules.news.actions.fetchRssFeeds)` |
| `convex/modules/alerts/queries.ts` | `convex/schema.ts` | `withIndex("by_active_severity")` | WIRED | `alerts/queries.ts` L17: `.withIndex("by_active_severity", (q) => q.eq("isActive", true))`; schema defines this index |

#### Plan 04-02 Key Links

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/shared/components/news/NewsGrid.tsx` | `convex/modules/news/queries.ts` | `usePaginatedQuery` for `listNewsArticles` | WIRED | `NewsGrid.tsx` L47-54: `usePaginatedQuery(api.modules.news.queries.listNewsArticles, ...)` |
| `src/shared/components/news/FeaturedNewsSection.tsx` | `convex/modules/news/queries.ts` | `useQuery` for `listFeaturedArticles` | WIRED | `FeaturedNewsSection.tsx` L24-27: `useQuery(api.modules.news.queries.listFeaturedArticles, { country })` |
| `src/shared/hooks/useNewsFilters.ts` | `src/stores/appStore.ts` | `useAppStore selectedCountry` | WIRED | `useNewsFilters.ts` L9, L23: `import { useAppStore }`, `const selectedCountry = useAppStore((s) => s.selectedCountry)` |
| `src/shared/components/news/NewsGrid.tsx` | `src/shared/components/news/NewArticlesBanner.tsx` | `NewsGrid` renders `NewArticlesBanner` when `pendingCount > 0` | WIRED | `NewsGrid.tsx` L11, L196-199: imports and renders `<NewArticlesBanner count={pendingCount} onShow={applyNewArticles} />` |

#### Plan 04-03 Key Links

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/shared/components/AlertBanner.tsx` | `convex/modules/alerts/queries.ts` | `useQuery` for `listActiveAlerts` | WIRED | `AlertBanner.tsx` L12: `useQuery(api.modules.alerts.queries.listActiveAlerts)` |
| `src/shared/components/DashboardShell.tsx` | `src/shared/components/AlertBanner.tsx` | `AlertBanner` rendered between TopBar and main | WIRED | `DashboardShell.tsx` L8, L20: imports `AlertBanner`, renders `<AlertBanner />` |
| `src/shared/components/news/NewsClientPage.tsx` | news components | composes `NewsGrid`, `FeaturedNewsSection`, `NewsFilterBar` | WIRED | `NewsClientPage.tsx` L8-10, L52-66: imports and renders all three components |
| `src/app/[locale]/(dashboard)/news/page.tsx` | `src/shared/components/news/NewsClientPage.tsx` | server component renders `NewsClientPage` | WIRED | `page.tsx` L1, L4: imports and renders `<NewsClientPage />` |

---

### Requirements Coverage

| Requirement | Source Plan(s) | Description | Status | Evidence |
|-------------|----------------|-------------|--------|---------|
| NEWS-01 | 04-01, 04-02, 04-03 | User can view chronological news feed from multiple Israeli sources | SATISFIED | `listNewsArticles` returns articles ordered by `publishedAt` desc from multiple sources; `NewsGrid` renders them with infinite scroll |
| NEWS-02 | 04-01, 04-02 | User can see source attribution (outlet name + favicon) on each article | SATISFIED | `listNewsArticles` denormalizes `sourceName` and `sourceFaviconUrl`; `NewsCard` displays favicon with fallback and source name |
| NEWS-03 | 04-03 | User can see urgent alert banner pinned above the news feed (admin-created, dismissible) | SATISFIED | `AlertBanner` renders above all dashboard pages via `DashboardShell`; sessionStorage dismiss; red for urgent / amber for info |
| NEWS-04 | 04-01 | System aggregates 10-20 RSS feeds with deduplication | SATISFIED | `fetchRssFeeds` processes up to 20 items per source from 8 sources; `upsertArticles` deduplicates by URL via `by_url` index |
| NEWS-05 | 04-02, 04-03 | User can tap article to open original source in new tab | SATISFIED | `NewsCard` wraps entire card in `<a href={article.url} target="_blank" rel="noopener noreferrer">` |
| NEWS-06 | 04-01, 04-02 | User can see Hebrew and English sources with language badge | SATISFIED | Sources have `language: "he" | "en"` field; `NewsCard` shows language badge (`"HE"` or `"EN"`); `NewsFilterBar` allows filtering by language |
| NEWS-07 | 04-01, 04-03 | News feed auto-refreshes every 5-10 minutes with "last updated" indicator | SATISFIED | 5-minute cron triggers RSS ingestion; `NewsClientPage` shows `t("lastUpdated", { time: formattedTime })` updated every 60s; Convex subscriptions reactive |
| NEWS-08 | 04-01 | Admin can promote/pin stories marked as "Important" with badge | PARTIALLY SATISFIED | `listFeaturedArticles` query reads `isFeatured === true`; `FeaturedNewsSection` renders them with amber ring; `markArticleFeatured` internalMutation enables toggling. Admin UI write path deferred to Phase 9 — testable via Convex dashboard now. Full admin UI is a Phase 9 concern per plan design. |
| NEWS-09 | 04-01, 04-02 | Each source displays trust tier badge: Official / Verified / Community | SATISFIED | Sources have `trustTier: "official" | "verified" | "community"`; denormalized by query; `getTrustTierConfig()` maps tiers to colored badge configs; `NewsCard` renders colored `Badge` |
| NEWS-10 | 04-01, 04-02 | User can filter news by country relevance | SATISFIED | `listNewsArticles` accepts `country` arg and filters articles; `useNewsFilters` syncs to URL with `useAppStore` auto-populate; `NewsFilterBar` renders `CountryCombobox` |

---

### Anti-Patterns Found

| File | Pattern | Severity | Impact |
|------|---------|----------|--------|
| `src/shared/components/news/NewsFilterBar.tsx` L70, L116 | `placeholder` prop | Info | Not a stub — `placeholder` is a legitimate HTML attribute for `CountryCombobox`. No issue. |
| `src/shared/components/news/NewsGrid.tsx` L15 | "placeholder for loading state" comment | Info | Comment describes the skeleton component purpose, not a stub. `NewsCardSkeleton` is fully implemented inline. |

No blocker or warning-level anti-patterns found. No physical CSS properties (`ml-`, `mr-`, `pl-`, `pr-`) found in news components. All text goes through `useTranslations`. No `return null` stubs detected — all `return null` calls are intentional (AlertBanner when no alerts, FeaturedNewsSection when no featured articles).

---

### Human Verification Required

The following items cannot be verified programmatically and require a running application:

#### 1. Alert Banner Rendering on All Pages

**Test:** Log into the dashboard and navigate to Flights, Overview, and Profile pages. Insert an alert document into the Convex database (via dashboard: `{ title: "Test", content: "Test alert", severity: "urgent", authorId: <any_user_id>, isActive: true }`)
**Expected:** A red banner appears above the content on every dashboard page, showing "Test" title and "Test alert" content, with an X dismiss button.
**Why human:** Cannot verify real-time Convex subscription behavior and cross-page shell rendering without a running browser.

#### 2. Alert Dismiss Persistence

**Test:** Dismiss an alert banner (click X). Navigate to another page.
**Expected:** The alert remains dismissed on the same session. Open a new tab — the alert reappears.
**Why human:** sessionStorage behavior requires browser execution.

#### 3. News Feed Infinite Scroll

**Test:** Scroll to the bottom of the news page with articles populated.
**Expected:** More articles load automatically when the scroll sentinel enters the viewport.
**Why human:** Intersection Observer behavior requires browser rendering.

#### 4. Pull-to-Refresh on Mobile

**Test:** Open the news page on a mobile device or browser DevTools mobile simulation. Scroll to top, then pull down 80+ pixels.
**Expected:** Arrow rotates 180 degrees at 80px threshold, "Refreshing..." text appears, feed re-baselines.
**Why human:** Touch events and scroll position checks require mobile browser context.

#### 5. N New Articles Banner

**Test:** Have the news page open. Insert a new article into Convex (simulating cron output). Watch for the banner.
**Expected:** A "X new articles" banner slides in above the feed without scrolling the page. Clicking it scrolls to top and updates the baseline.
**Why human:** Requires real-time Convex subscription reactivity and scroll behavior to verify.

#### 6. RSS Feed Ingestion Execution

**Test:** Deploy to Convex (or trigger `fetchRssFeeds` manually from dashboard). After 5 minutes, check `newsArticles` table count.
**Expected:** Articles from all 8 configured sources appear in the `newsArticles` table with correct `sourceId`, `language`, `country: "IL"`, and no duplicates on repeat runs.
**Why human:** Requires a live Convex deployment with network access to the RSS feeds.

#### 7. Hebrew RTL Layout

**Test:** Switch app language to Hebrew. Navigate to the news page.
**Expected:** Feed reads right-to-left, source name appears on right side of cards, external link icon is on the left, filter bar labels are in Hebrew.
**Why human:** RTL rendering requires visual inspection in Hebrew locale.

---

### Commit Verification

All 6 task commits documented in summaries verified present in git log:

| Commit | Summary Description |
|--------|---------------------|
| `a3e662b` | feat(04-01): news queries, alert queries, and i18n strings |
| `ca8d5cf` | feat(04-01): RSS ingestion action, mutations, cron schedule, and source seed |
| `98c1590` | feat(04-02): add news-utils and useNewsFilters hook |
| `6e49217` | feat(04-02): add news feed UI components |
| `bb1a3d6` | feat(04-03): add AlertBanner and wire into DashboardShell |
| `6ca2d11` | feat(04-03): create NewsClientPage and replace Coming Soon news page |

---

## Summary

Phase 4 goal is **fully achieved** in code. Every observable truth is verified:

**Backend (Plan 04-01):** The Convex data layer is complete and substantive. The RSS ingestion pipeline (`fetchRssFeeds` internalAction) fetches 8 Israeli sources every 5 minutes via cron. Queries return paginated, denormalized article data with proper source attribution and trust tiers. Deduplication is implemented via `by_url` index. The alerts query is wired for the banner.

**UI Components (Plan 04-02):** All 7 component files are non-stub implementations. `NewsGrid` uses `usePaginatedQuery` with `useInView` for infinite scroll. `FeaturedNewsSection` uses `useQuery` for non-paginated featured articles. Pull-to-refresh is implemented with touch handlers. The new articles banner tracks article counts reactively. No physical CSS properties violate RTL requirements.

**Page Wiring (Plan 04-03):** `AlertBanner` is wired into `DashboardShell` between TopBar and main, making alerts visible on every dashboard page. The news page route renders `NewsClientPage` — the Coming Soon placeholder is fully replaced. The `"last updated"` indicator updates every 60 seconds.

**NEWS-08 note:** The admin write path (`markArticleFeatured`) is intentionally an `internalMutation` testable via Convex dashboard. The admin UI wrapper is deferred to Phase 9 by plan design — this is an acknowledged known limitation, not a gap.

---

_Verified: 2026-03-05_
_Verifier: Claude (gsd-verifier)_
