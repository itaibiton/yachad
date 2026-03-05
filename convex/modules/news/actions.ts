"use node";

import Parser from "rss-parser";
import { internalAction } from "../../_generated/server";
import { internal } from "../../_generated/api";

/**
 * Relevance keywords — articles must match at least one to be ingested.
 * Google News RSS feeds are pre-filtered by query, so they skip this check.
 * General Israeli news feeds (Ynet, Walla, etc.) are filtered here.
 */
const RELEVANCE_KEYWORDS_HE = [
  // War & security
  "מלחמה",
  "צה\"ל",
  "חמאס",
  "חיזבאללה",
  "איראן",
  "טילים",
  "רקטות",
  "צבא",
  "ביטחון",
  "פיקוד העורף",
  "התרעה",
  "אזעקה",
  "אזעקות",
  "מנהרות",
  "חטופים",
  "עזה",
  "לבנון",
  "גבול",
  "פיגוע",
  "טרור",
  "מבצע",
  "כיפת ברזל",
  "חיל האוויר",
  "חיל הים",
  "שב\"כ",
  "מוסד",
  "מודיעין",
  "התנגדות",
  "הפסקת אש",
  "הסלמה",
  "תקיפה",
  "הפצצה",
  "חייל",
  "חיילים",
  "מילואים",
  "מילואימניקים",
  "עימות",
  "סוריה",
  "תימן",
  "חות'ים",
  "פלסטינים",
  "יהודה ושומרון",
  // Flights & travel
  "טיסה",
  "טיסות",
  "נתב\"ג",
  "אל על",
  "ארקיע",
  "ישראייר",
  "שדה תעופה",
  "נמל תעופה",
  "טסים",
  "תעופה",
  "פינוי",
  "חילוץ",
  // Politics & diplomacy
  "ארה\"ב",
  "ארצות הברית",
  "ביידן",
  "טראמפ",
  "נתניהו",
  "ממשלה",
  "כנסת",
  "דיפלומטיה",
  "סנקציות",
  "או\"ם",
  "גרעין",
  // Emergencies
  "חירום",
  "מקלט",
  "מקלטים",
  "עורף",
  "פינוי",
  "סיוע",
];

const RELEVANCE_KEYWORDS_EN = [
  // War & security
  "war",
  "idf",
  "hamas",
  "hezbollah",
  "iran",
  "missile",
  "rocket",
  "military",
  "security",
  "home front",
  "siren",
  "tunnel",
  "hostage",
  "gaza",
  "lebanon",
  "border",
  "attack",
  "terror",
  "operation",
  "iron dome",
  "air force",
  "navy",
  "shin bet",
  "mossad",
  "intelligence",
  "ceasefire",
  "escalation",
  "strike",
  "bombing",
  "soldier",
  "troops",
  "reservist",
  "conflict",
  "syria",
  "yemen",
  "houthi",
  "palestinian",
  "west bank",
  // Flights & travel
  "flight",
  "flights",
  "ben gurion",
  "el al",
  "arkia",
  "israir",
  "airport",
  "aviation",
  "evacuation",
  "rescue",
  "airspace",
  // Politics & diplomacy
  "biden",
  "trump",
  "netanyahu",
  "knesset",
  "diplomacy",
  "sanctions",
  "nuclear",
  "united nations",
  "white house",
  "state department",
  "pentagon",
  // Emergencies
  "emergency",
  "shelter",
  "civil defense",
  "aid",
  "humanitarian",
];

/**
 * Check if an article is relevant based on title + description keywords.
 * Google News feeds (community tier) are already topic-filtered by the search query,
 * so they bypass this check.
 */
function isRelevant(
  title: string,
  description: string | undefined,
  language: "he" | "en",
  trustTier: string
): boolean {
  // Google News feeds are pre-filtered by topic query — always relevant
  if (trustTier === "community") return true;

  const text = `${title} ${description ?? ""}`.toLowerCase();
  const keywords =
    language === "he" ? RELEVANCE_KEYWORDS_HE : RELEVANCE_KEYWORDS_EN;

  return keywords.some((kw) => text.includes(kw.toLowerCase()));
}

/**
 * Extract the best image URL from an RSS item.
 * Checks (in priority order): enclosure, media:content, media:thumbnail,
 * media:group, og-style content HTML <img> tags.
 */
function extractImageUrl(item: Record<string, unknown>): string | undefined {
  // 1. enclosure with image type
  const enclosure = item.enclosure as
    | { url?: string; type?: string }
    | undefined;
  if (enclosure?.url && enclosure.type?.startsWith("image")) {
    return enclosure.url;
  }
  // enclosure without type but has image extension
  if (
    enclosure?.url &&
    /\.(jpg|jpeg|png|webp|gif)/i.test(enclosure.url)
  ) {
    return enclosure.url;
  }

  // 2. media:content
  const mediaContent = item.mediaContent as
    | { $?: { url?: string; medium?: string } }
    | undefined;
  if (mediaContent?.$?.url) {
    return mediaContent.$.url;
  }

  // 3. media:thumbnail
  const mediaThumbnail = item.mediaThumbnail as
    | { $?: { url?: string } }
    | undefined;
  if (mediaThumbnail?.$?.url) {
    return mediaThumbnail.$.url;
  }

  // 4. media:group → media:content inside
  const mediaGroup = item.mediaGroup as
    | { "media:content"?: { $?: { url?: string } } }
    | undefined;
  if (mediaGroup?.["media:content"]?.$?.url) {
    return mediaGroup["media:content"].$.url;
  }

  // 5. Extract first <img src="..."> from content HTML
  const content = (item.content ?? item["content:encoded"] ?? "") as string;
  const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch?.[1]) {
    return imgMatch[1];
  }

  return undefined;
}

/**
 * fetchRssFeeds — Internal Node.js action for RSS ingestion.
 *
 * Called every 5 minutes via cron (convex/crons.ts).
 * Filters articles for relevance to Israel security/war/flights/diplomacy.
 */
export const fetchRssFeeds = internalAction({
  args: {},
  handler: async (ctx) => {
    const sources = await ctx.runQuery(
      internal.modules.news.queries.listActiveSources
    );

    const parser = new Parser({
      timeout: 15_000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; Yachad/1.0; +https://yachad.global)",
        Accept: "application/rss+xml, application/xml, text/xml, */*",
      },
      customFields: {
        item: [
          ["media:content", "mediaContent", { keepArray: false }],
          ["media:thumbnail", "mediaThumbnail", { keepArray: false }],
          ["media:group", "mediaGroup", { keepArray: false }],
        ],
      },
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
        imageUrl?: string;
        language: "he" | "en";
        publishedAt: number;
        country?: string;
      }[] = [];

      for (const item of (feed.items ?? []).slice(0, 20)) {
        if ((!item.link && !item.guid) || !item.title) continue;

        const url = item.link ?? item.guid!;
        const description = item.contentSnippet?.slice(0, 200);
        const publishedAt = item.isoDate
          ? new Date(item.isoDate).getTime()
          : Date.now();

        // Filter for relevance — skip articles not related to war/security/flights
        if (
          !isRelevant(item.title, description, source.language, source.trustTier)
        ) {
          continue;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const imageUrl = extractImageUrl(item as any);

        articlesToUpsert.push({
          sourceId: source._id as string,
          title: item.title,
          url,
          description,
          imageUrl,
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
