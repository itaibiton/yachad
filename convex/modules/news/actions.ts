"use node";

import Parser from "rss-parser";
import { internalAction } from "../../_generated/server";
import { internal } from "../../_generated/api";

/**
 * fetchRssFeeds — Internal Node.js action for RSS ingestion.
 *
 * Called every 5 minutes via cron (convex/crons.ts).
 *
 * Flow:
 * 1. Fetch all active news sources via listActiveSources internalQuery
 * 2. For each source, parse its RSS feed (10s timeout, custom User-Agent)
 * 3. Skip sources that fail (bad feed, timeout, etc.) — never let one bad source kill the batch
 * 4. For each feed item (up to 20 per source), normalize into an article record
 * 5. Upsert articles via upsertArticles internalMutation (deduplicates by URL)
 *
 * Isolation: This file uses "use node" runtime and MUST contain ONLY internalAction.
 * Queries and mutations are in separate files (queries.ts, mutations.ts).
 */
export const fetchRssFeeds = internalAction({
  args: {},
  handler: async (ctx) => {
    const sources = await ctx.runQuery(
      internal.modules.news.queries.listActiveSources
    );

    const parser = new Parser({
      timeout: 10_000,
      headers: { "User-Agent": "Yachad/1.0 RSS Reader" },
    });

    for (const source of sources) {
      let feed;
      try {
        feed = await parser.parseURL(source.url);
      } catch (err) {
        console.error(`[fetchRssFeeds] Failed to parse ${source.url}:`, err);
        continue;
      }

      const articlesToUpsert: {
        sourceId: string;
        title: string;
        url: string;
        description?: string;
        language: "he" | "en";
        publishedAt: number;
        country?: string;
      }[] = [];

      for (const item of (feed.items ?? []).slice(0, 20)) {
        // Skip items missing both link and guid, or missing title
        if ((!item.link && !item.guid) || !item.title) continue;

        const url = item.link ?? item.guid!;
        const description = item.contentSnippet?.slice(0, 200);
        const publishedAt = item.isoDate
          ? new Date(item.isoDate).getTime()
          : Date.now();

        articlesToUpsert.push({
          sourceId: source._id as string,
          title: item.title,
          url,
          description,
          language: source.language,
          publishedAt,
          country: "IL",
        });
      }

      if (articlesToUpsert.length > 0) {
        await ctx.runMutation(internal.modules.news.mutations.upsertArticles, {
          articles: articlesToUpsert,
        });
      }
    }
  },
});
