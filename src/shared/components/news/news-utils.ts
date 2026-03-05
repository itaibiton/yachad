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
};

/**
 * getTrustTierConfig — returns display configuration for a trust tier badge.
 *
 * Used by NewsCard to render colored badge chips:
 * - Official: Israeli blue (bg-blue-600)
 * - Verified: green (bg-green-600)
 * - Community: muted gray (bg-muted)
 */
export function getTrustTierConfig(
  tier: "official" | "verified" | "community"
): {
  labelKey: string; // i18n key under "news" namespace
  className: string; // Tailwind classes for the badge
} {
  switch (tier) {
    case "official":
      return {
        labelKey: "trustOfficial",
        className: "bg-blue-600 text-white border-blue-600",
      };
    case "verified":
      return {
        labelKey: "trustVerified",
        className: "bg-green-600 text-white border-green-600",
      };
    case "community":
    default:
      return {
        labelKey: "trustCommunity",
        className: "bg-muted text-muted-foreground border-border",
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
