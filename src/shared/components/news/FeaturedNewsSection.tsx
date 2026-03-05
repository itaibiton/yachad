"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "convex/react";
import { Star } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { NewsCard } from "./NewsCard";
import type { NewsArticleWithSource } from "./news-utils";

/**
 * FeaturedNewsSection — pinned "Important" articles section above the main feed.
 *
 * Uses useQuery (not paginated) following the UrgentFlightsSection pattern.
 * Returns null when loading or when no featured articles exist.
 *
 * Redesign: amber accent bar on the start edge, pulsing star icon, and
 * a subtle amber tinted container to distinguish from the regular feed.
 * Now uses a responsive grid for full-width layout.
 */
export function FeaturedNewsSection() {
  const t = useTranslations("news");
  const featuredArticles = useQuery(
    api.modules.news.queries.listFeaturedArticles,
    {}
  );

  // Show nothing when loading or when no featured articles exist
  if (!featuredArticles || featuredArticles.length === 0) {
    return null;
  }

  return (
    <section aria-label={t("importantSection")}>
      {/* Section header — amber accent with pulsing star */}
      <div className="mb-3 flex items-center gap-2">
        {/* Pulsing amber star — mirrors UrgentFlightsSection's pulsing dot */}
        <span className="relative flex size-5 items-center justify-center">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-400/40" />
          <Star
            className="relative size-4 fill-amber-500 text-amber-500"
            aria-hidden
          />
        </span>
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
          {t("importantSection")}
        </h2>
      </div>

      {/* Featured article cards — responsive grid with amber accent */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {featuredArticles.map((article) => (
          <div
            key={article._id}
            className="relative rounded-xl overflow-hidden border-s-[3px] border-s-amber-500 bg-amber-500/[0.03] dark:bg-amber-500/[0.06]"
          >
            <NewsCard
              article={article as unknown as NewsArticleWithSource}
              variant={featuredArticles.length === 1 ? "hero" : "compact"}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
