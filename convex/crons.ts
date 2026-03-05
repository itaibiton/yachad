import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

/**
 * fetch-rss-feeds — Polls all active news sources every 5 minutes.
 *
 * Triggers the fetchRssFeeds internalAction which:
 * 1. Fetches all active newsSources via listActiveSources
 * 2. Parses each RSS feed (up to 20 items per source)
 * 3. Upserts new articles to the newsArticles table (deduplication by URL)
 */
crons.interval(
  "fetch-rss-feeds",
  { minutes: 5 },
  internal.modules.news.actions.fetchRssFeeds
);

export default crons;
