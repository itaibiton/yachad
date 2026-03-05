import { internalMutation } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";

/**
 * upsertArticles — Internal mutation for batch article ingestion.
 *
 * Called by the fetchRssFeeds action after parsing each RSS feed.
 * Deduplicates articles by URL via the by_url index — if an article
 * with the same URL already exists, it is skipped (no update).
 *
 * The sourceId arrives as a plain string from the action context and is
 * cast to Id<"newsSources"> at insert time.
 */
export const upsertArticles = internalMutation({
  args: {
    articles: v.array(
      v.object({
        sourceId: v.string(),
        title: v.string(),
        url: v.string(),
        description: v.optional(v.string()),
        language: v.union(v.literal("he"), v.literal("en")),
        publishedAt: v.number(),
        country: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const article of args.articles) {
      // Deduplicate: skip if article with this URL already exists
      const existing = await ctx.db
        .query("newsArticles")
        .withIndex("by_url", (q) => q.eq("url", article.url))
        .first();

      if (existing !== null) continue;

      await ctx.db.insert("newsArticles", {
        sourceId: article.sourceId as Id<"newsSources">,
        title: article.title,
        url: article.url,
        description: article.description,
        language: article.language,
        publishedAt: article.publishedAt,
        country: article.country,
        isFeatured: false,
        isDeleted: false,
      });
    }
  },
});

/**
 * seedNewsSources — Idempotent mutation to insert the 8 initial news sources.
 *
 * Checks if any sources exist before inserting — safe to run multiple times.
 * Can be triggered via: npx convex run modules/news/mutations:seedNewsSources
 * or via the Convex dashboard.
 */
export const seedNewsSources = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Idempotent: return early if sources already seeded
    const existing = await ctx.db.query("newsSources").first();
    if (existing !== null) return;

    const sources: {
      url: string;
      name: string;
      faviconUrl: string;
      language: "he" | "en";
      trustTier: "official" | "verified" | "community";
      isActive: boolean;
    }[] = [
      // Hebrew — Official
      {
        url: "https://www.ynet.co.il/Integration/StoryRss2.xml",
        name: "Ynet",
        faviconUrl:
          "https://www.google.com/s2/favicons?domain=ynet.co.il&sz=32",
        language: "he",
        trustTier: "official",
        isActive: true,
      },
      {
        url: "https://rss.walla.co.il/feed/1",
        name: "Walla News",
        faviconUrl:
          "https://www.google.com/s2/favicons?domain=walla.co.il&sz=32",
        language: "he",
        trustTier: "official",
        isActive: true,
      },
      {
        url: "https://rss.kan.org.il/Rss/RssKanNews.aspx",
        name: "Kan News",
        faviconUrl:
          "https://www.google.com/s2/favicons?domain=kan.org.il&sz=32",
        language: "he",
        trustTier: "official",
        isActive: true,
      },
      // Hebrew — Verified
      {
        url: "https://www.israelhayom.co.il/rss-feed",
        name: "Israel Hayom",
        faviconUrl:
          "https://www.google.com/s2/favicons?domain=israelhayom.co.il&sz=32",
        language: "he",
        trustTier: "verified",
        isActive: true,
      },
      {
        url: "https://rss.mako.co.il/rss/31750a2610f26110VgnVCM2000002a0c10acRCRD.xml",
        name: "Mako",
        faviconUrl:
          "https://www.google.com/s2/favicons?domain=mako.co.il&sz=32",
        language: "he",
        trustTier: "verified",
        isActive: true,
      },
      // English — Official
      {
        url: "https://www.timesofisrael.com/feed/",
        name: "Times of Israel",
        faviconUrl:
          "https://www.google.com/s2/favicons?domain=timesofisrael.com&sz=32",
        language: "en",
        trustTier: "official",
        isActive: true,
      },
      {
        url: "https://www.jpost.com/rss/rssfeedsfrontpage.aspx",
        name: "Jerusalem Post",
        faviconUrl:
          "https://www.google.com/s2/favicons?domain=jpost.com&sz=32",
        language: "en",
        trustTier: "official",
        isActive: true,
      },
      // English — Verified
      {
        url: "https://www.i24news.tv/en/rss",
        name: "i24NEWS",
        faviconUrl:
          "https://www.google.com/s2/favicons?domain=i24news.tv&sz=32",
        language: "en",
        trustTier: "verified",
        isActive: true,
      },
    ];

    for (const source of sources) {
      await ctx.db.insert("newsSources", source);
    }
  },
});

/**
 * markArticleFeatured — Internal mutation stub for NEWS-08 write path.
 *
 * Toggles the isFeatured flag on a single article. This is an internalMutation
 * (not public-facing) — testable via the Convex dashboard until Phase 9 wraps
 * it with admin authentication in the admin panel.
 *
 * Admin UI integration is deferred to Phase 9.
 */
export const markArticleFeatured = internalMutation({
  args: {
    articleId: v.id("newsArticles"),
    isFeatured: v.boolean(),
  },
  handler: async (ctx, args) => {
    const article = await ctx.db.get(args.articleId);
    if (!article) {
      throw new Error(`Article ${args.articleId} not found`);
    }
    await ctx.db.patch(args.articleId, { isFeatured: args.isFeatured });
  },
});
