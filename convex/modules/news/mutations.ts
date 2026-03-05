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
        imageUrl: v.optional(v.string()),
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
        imageUrl: article.imageUrl,
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
 * seedNewsSources — Idempotent mutation to populate news sources.
 *
 * Deletes all existing sources and re-inserts the full list.
 * Safe to run multiple times — always converges to the latest source list.
 * Trigger via: npx convex run modules/news/mutations:seedNewsSources
 */
export const seedNewsSources = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Clear existing sources so we can re-seed with updated list
    const existing = await ctx.db.query("newsSources").collect();
    for (const source of existing) {
      await ctx.db.delete(source._id);
    }

    const sources: {
      url: string;
      name: string;
      faviconUrl: string;
      language: "he" | "en";
      trustTier: "official" | "verified" | "community";
      isActive: boolean;
    }[] = [
      // ── Hebrew — Official ──
      {
        url: "https://www.ynet.co.il/Integration/StoryRss2.xml",
        name: "Ynet",
        faviconUrl: "https://www.google.com/s2/favicons?domain=ynet.co.il&sz=32",
        language: "he",
        trustTier: "official",
        isActive: true,
      },
      {
        url: "https://rss.walla.co.il/feed/1",
        name: "Walla News",
        faviconUrl: "https://www.google.com/s2/favicons?domain=walla.co.il&sz=32",
        language: "he",
        trustTier: "official",
        isActive: true,
      },
      {
        url: "https://rss.kan.org.il/Rss/RssKanNews.aspx",
        name: "Kan News",
        faviconUrl: "https://www.google.com/s2/favicons?domain=kan.org.il&sz=32",
        language: "he",
        trustTier: "official",
        isActive: false, // SSL cert mismatch — disabled until Kan fixes their cert
      },
      // ── Hebrew — Verified ──
      {
        url: "https://www.inn.co.il/Rss.aspx",
        name: "Arutz 7",
        faviconUrl: "https://www.google.com/s2/favicons?domain=inn.co.il&sz=32",
        language: "he",
        trustTier: "verified",
        isActive: true,
      },
      {
        url: "https://www.maariv.co.il/Rss/RssFeedsMivzak",
        name: "Maariv",
        faviconUrl: "https://www.google.com/s2/favicons?domain=maariv.co.il&sz=32",
        language: "he",
        trustTier: "verified",
        isActive: true,
      },
      // ── English — Official ──
      {
        url: "https://news.google.com/rss/search?q=site:timesofisrael.com&hl=en&gl=US&ceid=US:en",
        name: "Times of Israel",
        faviconUrl: "https://www.google.com/s2/favicons?domain=timesofisrael.com&sz=32",
        language: "en",
        trustTier: "official",
        isActive: true,
      },
      {
        url: "https://www.jpost.com/rss/rssfeedsfrontpage.aspx",
        name: "Jerusalem Post",
        faviconUrl: "https://www.google.com/s2/favicons?domain=jpost.com&sz=32",
        language: "en",
        trustTier: "official",
        isActive: true,
      },
      // ── English — Verified ──
      {
        url: "https://www.ynetnews.com/Integration/StoryRss2.xml",
        name: "Ynetnews",
        faviconUrl: "https://www.google.com/s2/favicons?domain=ynetnews.com&sz=32",
        language: "en",
        trustTier: "verified",
        isActive: true,
      },
      // ── English — Community (flights, airlines, travel) ──
      {
        url: "https://news.google.com/rss/search?q=Israel+flights+El+Al+Arkia+Israir&hl=en&gl=US&ceid=US:en",
        name: "Israel Flights (Google)",
        faviconUrl: "https://www.google.com/s2/favicons?domain=news.google.com&sz=32",
        language: "en",
        trustTier: "community",
        isActive: true,
      },
      {
        url: "https://news.google.com/rss/search?q=Israel+Iran+war+Middle+East&hl=en&gl=US&ceid=US:en",
        name: "Israel & Iran (Google)",
        faviconUrl: "https://www.google.com/s2/favicons?domain=news.google.com&sz=32",
        language: "en",
        trustTier: "community",
        isActive: true,
      },
      {
        url: "https://news.google.com/rss/search?q=Israel+USA+relations&hl=en&gl=US&ceid=US:en",
        name: "Israel-USA (Google)",
        faviconUrl: "https://www.google.com/s2/favicons?domain=news.google.com&sz=32",
        language: "en",
        trustTier: "community",
        isActive: true,
      },
      {
        url: "https://news.google.com/rss/search?q=%D7%A4%D7%99%D7%A7%D7%95%D7%93+%D7%94%D7%A2%D7%95%D7%A8%D7%A3+%D7%99%D7%A9%D7%A8%D7%90%D7%9C&hl=he&gl=IL&ceid=IL:he",
        name: "Pikud HaOref (Google)",
        faviconUrl: "https://www.google.com/s2/favicons?domain=news.google.com&sz=32",
        language: "he",
        trustTier: "community",
        isActive: true,
      },
      {
        url: "https://news.google.com/rss/search?q=%D7%98%D7%99%D7%A1%D7%95%D7%AA+%D7%9C%D7%99%D7%A9%D7%A8%D7%90%D7%9C+%D7%90%D7%9C+%D7%A2%D7%9C+%D7%90%D7%A8%D7%A7%D7%99%D7%A2+%D7%99%D7%A9%D7%A8%D7%90%D7%99%D7%A8&hl=he&gl=IL&ceid=IL:he",
        name: "Flights to Israel (Google HE)",
        faviconUrl: "https://www.google.com/s2/favicons?domain=news.google.com&sz=32",
        language: "he",
        trustTier: "community",
        isActive: true,
      },
    ];

    for (const source of sources) {
      await ctx.db.insert("newsSources", source);
    }
  },
});

/**
 * clearAllArticles — Wipe all news articles. Used when re-seeding with new filters.
 */
export const clearAllArticles = internalMutation({
  args: {},
  handler: async (ctx) => {
    const articles = await ctx.db.query("newsArticles").collect();
    for (const article of articles) {
      await ctx.db.delete(article._id);
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
