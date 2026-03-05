---
phase: 04-news-aggregator
plan: "01"
subsystem: api
tags: [convex, rss, news, cron, i18n, pagination]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: Convex schema with newsArticles, newsSources, alerts tables and their indexes
  - phase: 02-extraction-flights-marketplace
    provides: convex-helpers filter() pattern for paginated queries with post-index filtering

provides:
  - RSS ingestion pipeline (fetchRssFeeds action + 5-min cron) that polls 8 Israeli news sources
  - listNewsArticles: paginated query with language/country filtering, source denormalization
  - listFeaturedArticles: non-paginated query for "Important" pinned section (up to 10)
  - listActiveSources: internalQuery consumed by RSS action
  - listActiveAlerts: public query returning up to 5 active alerts for the banner
  - upsertArticles: internalMutation with by_url deduplication
  - seedNewsSources: idempotent internalMutation inserting 8 initial sources
  - markArticleFeatured: internalMutation stub for NEWS-08 write path (dashboard-testable)
  - news and alerts i18n namespaces in both he.json and en.json

affects: [04-02-news-ui, 04-03-alert-banner, 09-admin-panel]

# Tech tracking
tech-stack:
  added: [rss-parser v3.13.0]
  patterns:
    - "use node isolation: actions.ts has \"use node\" directive; mutations.ts and queries.ts use default V8 runtime"
    - "RSS ingestion: internalAction fetches sources via internalQuery, upserts via internalMutation — no public exposure"
    - "By-URL deduplication: by_url index check before insert in upsertArticles — idempotent batch ingestion"
    - "filter() for paginated news: same convex-helpers pattern established in 02-01 for flights"
    - "Source denormalization: Promise.all on result.page same as flights pattern"

key-files:
  created:
    - convex/modules/news/queries.ts
    - convex/modules/news/mutations.ts
    - convex/modules/news/actions.ts
    - convex/modules/alerts/queries.ts
    - convex/crons.ts
  modified:
    - messages/en.json
    - messages/he.json
    - package.json

key-decisions:
  - "listActiveSources exported as internalQuery — not public-facing, only called by fetchRssFeeds action via internal.modules.news.queries.listActiveSources"
  - "actions.ts isolated with use node directive — only internalAction allowed; queries and mutations in separate files per Convex runtime restriction"
  - "upsertArticles accepts sourceId as string (from Node.js action context) and casts to Id<newsSources> at insert time — type bridge between node and V8 runtimes"
  - "markArticleFeatured is internalMutation — admin UI wrapper deferred to Phase 9; testable via Convex dashboard before then"
  - "All sources seeded with country IL hardcoded in fetchRssFeeds — per research recommendation, all 8 sources are Israeli-focused"
  - "by_url deduplication in upsertArticles — skip-on-existing prevents duplicate articles without expensive upsert logic"

patterns-established:
  - "News module isolation: use node action file + separate V8 mutations/queries files"
  - "Cron wiring: crons.ts in convex/ root, interval triggers internalAction via internal.* reference"
  - "Idempotent seed: check for existing record before inserting any seed data"

requirements-completed: [NEWS-01, NEWS-02, NEWS-04, NEWS-06, NEWS-07, NEWS-08, NEWS-09, NEWS-10]

# Metrics
duration: 12min
completed: 2026-03-05
---

# Phase 4 Plan 01: News Aggregator Backend Summary

**RSS ingestion pipeline (rss-parser + 5-min cron) with paginated news queries, alert banner query, and full he/en i18n for 8 Israeli news sources**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-03-05T10:48:20Z
- **Completed:** 2026-03-05T10:50:39Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments

- RSS ingestion pipeline: fetchRssFeeds internalAction parses up to 20 items per source, skips bad feeds, deduplicates by URL, upserts to newsArticles via internalMutation
- 5-minute cron schedule in convex/crons.ts — zero manual triggers needed after deploy
- listNewsArticles: paginated with convex-helpers filter() for language/country filters, source denormalization (name, favicon, trustTier)
- listFeaturedArticles: non-paginated query for the "Important" pinned section, capped at 10
- listActiveAlerts: public query for the crisis alert banner, capped at 5
- 8 initial news sources seeded (Ynet, Walla, Kan, Israel Hayom, Mako, Times of Israel, Jerusalem Post, i24NEWS)
- news + alerts i18n namespaces in both en.json and he.json

## Task Commits

Each task was committed atomically:

1. **Task 1: News queries, alert queries, and i18n messages** - `a3e662b` (feat)
2. **Task 2: RSS ingestion action, mutations, cron schedule, and source seed** - `ca8d5cf` (feat)

## Files Created/Modified

- `convex/modules/news/queries.ts` - listNewsArticles (paginated), listFeaturedArticles, listActiveSources (internalQuery)
- `convex/modules/alerts/queries.ts` - listActiveAlerts (up to 5 active alerts)
- `convex/modules/news/actions.ts` - fetchRssFeeds internalAction with "use node" directive
- `convex/modules/news/mutations.ts` - upsertArticles, seedNewsSources, markArticleFeatured
- `convex/crons.ts` - 5-minute interval for fetch-rss-feeds
- `messages/en.json` - Added "news" and "alerts" namespaces
- `messages/he.json` - Added "news" and "alerts" namespaces
- `package.json` - rss-parser v3.13.0 added

## Decisions Made

- listActiveSources is an internalQuery — not exposed publicly, only callable by fetchRssFeeds action via `internal.*` reference
- actions.ts isolated with `"use node"` directive — Convex restriction requires node-runtime files contain only actions
- upsertArticles accepts sourceId as `string` (plain value from Node.js action) and casts to `Id<"newsSources">` at insert time — bridges the runtime type boundary
- markArticleFeatured is internalMutation (not public) — Phase 9 admin panel will wrap it with requireAdmin auth; testable via Convex dashboard until then
- All RSS-ingested articles get `country: "IL"` hardcoded — all 8 sources are Israeli-focused per research
- by_url deduplication via `withIndex("by_url").first()` check before insert — prevents duplicates without expensive upsert

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required. Sources are seeded via `seedNewsSources` internalMutation (triggerable from Convex dashboard). The 5-minute cron begins automatically on deploy.

## Next Phase Readiness

- All data layer ready for 04-02 (news feed UI): listNewsArticles, listFeaturedArticles, and all i18n strings exist
- Alert banner ready for 04-03: listActiveAlerts query complete
- Source seed can be triggered via Convex dashboard before UI is deployed
- markArticleFeatured internalMutation ready for Phase 9 admin panel integration

---
*Phase: 04-news-aggregator*
*Completed: 2026-03-05*
