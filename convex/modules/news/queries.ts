import { query, internalQuery } from "../../_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { filter } from "convex-helpers/server/filter";

/**
 * listNewsArticles — Paginated news feed query.
 *
 * Uses by_published index (desc) for recency ordering.
 * Applies convex-helpers filter() (NOT built-in .filter()) to avoid
 * undersized pagination pages when filtering out deleted/featured articles.
 *
 * Excludes:
 * - Soft-deleted articles (isDeleted === true)
 * - Featured articles (isFeatured === true) — shown separately via listFeaturedArticles
 * - Articles not matching the requested language (when provided)
 * - Articles not matching the requested country (when provided)
 *
 * Denormalizes source data (name, favicon, trust tier) via Promise.all.
 */
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
      if (article.isFeatured === true) return false;
      if (args.language !== undefined && article.language !== args.language)
        return false;
      if (
        args.country !== undefined &&
        article.country !== undefined &&
        article.country !== args.country
      )
        return false;
      return true;
    });

    const result = await filtered.paginate(args.paginationOpts);

    // Denormalize source data via Promise.all — avoids N+1
    const enrichedPage = await Promise.all(
      result.page.map(async (article) => {
        const source = await ctx.db.get(article.sourceId);
        return {
          ...article,
          sourceName: source?.name ?? "Unknown Source",
          sourceFaviconUrl: source?.faviconUrl ?? null,
          sourceTrustTier: source?.trustTier ?? "community",
        };
      })
    );

    return { ...result, page: enrichedPage };
  },
});

/**
 * listFeaturedArticles — Non-paginated query for the "Important" pinned section.
 *
 * Returns articles where isFeatured === true, ordered by publishedAt desc.
 * Capped at 10 results. Optionally filtered by country.
 * Denormalizes source data same as listNewsArticles.
 */
export const listFeaturedArticles = query({
  args: {
    country: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const baseQuery = ctx.db
      .query("newsArticles")
      .withIndex("by_published")
      .order("desc");

    const filtered = filter(baseQuery, (article) => {
      if (article.isFeatured !== true) return false;
      if (article.isDeleted === true) return false;
      if (
        args.country !== undefined &&
        article.country !== undefined &&
        article.country !== args.country
      )
        return false;
      return true;
    });

    const articles = await filtered.take(10);

    // Denormalize source data via Promise.all — avoids N+1
    const enrichedArticles = await Promise.all(
      articles.map(async (article) => {
        const source = await ctx.db.get(article.sourceId);
        return {
          ...article,
          sourceName: source?.name ?? "Unknown Source",
          sourceFaviconUrl: source?.faviconUrl ?? null,
          sourceTrustTier: source?.trustTier ?? "community",
        };
      })
    );

    return enrichedArticles;
  },
});

/**
 * listActiveSources — Internal query returning all active news sources.
 *
 * Used by the RSS ingestion action (fetchRssFeeds) to get the list of feeds
 * to poll. Not exposed publicly — only callable from internal functions.
 */
export const listActiveSources = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("newsSources")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
  },
});
