import { Doc } from "../../../../convex/_generated/dataModel";

/**
 * NewsArticleWithSource — enriched article type returned by listNewsArticles
 * and listFeaturedArticles queries. The source fields are denormalized by the
 * query handler so UI components do not need to fetch the source separately.
 */
export type NewsArticleWithSource = Doc<"newsArticles"> & {
  sourceName: string;
  sourceFaviconUrl: string | null;
  sourceTrustTier: "official" | "verified" | "community";
  imageUrl?: string | null;
};

/**
 * Trust tier visual configuration.
 *
 * - `dotClassName`: small colored dot rendered next to the source favicon
 * - `badgeClassName`: Tailwind classes for the Badge chip (used in hero cards)
 * - `labelKey`: i18n key under "news" namespace
 */
export function getTrustTierConfig(
  tier: "official" | "verified" | "community"
): {
  labelKey: string;
  dotClassName: string;
  badgeClassName: string;
} {
  switch (tier) {
    case "official":
      return {
        labelKey: "trustOfficial",
        dotClassName: "bg-blue-500",
        badgeClassName:
          "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30",
      };
    case "verified":
      return {
        labelKey: "trustVerified",
        dotClassName: "bg-emerald-500",
        badgeClassName:
          "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
      };
    case "community":
    default:
      return {
        labelKey: "trustCommunity",
        dotClassName: "bg-muted-foreground/50",
        badgeClassName:
          "bg-muted text-muted-foreground border-border",
      };
  }
}

/**
 * extractDomain — extracts the bare domain from a URL string.
 *
 * Used for Google S2 favicon fallback and display.
 * Strips the "www." prefix for cleaner display.
 */
export function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return "";
  }
}
