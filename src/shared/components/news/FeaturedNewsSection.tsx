"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "convex/react";
import { Star } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { NewsCard } from "./NewsCard";
import { cn } from "@/lib/utils";
import type { NewsArticleWithSource } from "./news-utils";

interface FeaturedNewsSectionProps {
  country?: string;
}

/**
 * FeaturedNewsSection — pinned "Important" articles section above the main feed.
 *
 * Uses useQuery (not paginated) following the UrgentFlightsSection pattern.
 * Returns null when loading or when no featured articles exist.
 * Articles receive an amber ring to visually distinguish from regular cards.
 */
export function FeaturedNewsSection({ country }: FeaturedNewsSectionProps) {
  const t = useTranslations("news");
  const featuredArticles = useQuery(
    api.modules.news.queries.listFeaturedArticles,
    { country }
  );

  // Show nothing when loading or when no featured articles exist
  if (!featuredArticles || featuredArticles.length === 0) {
    return null;
  }

  return (
    <section aria-label={t("importantSection")}>
      {/* Section header — golden/amber scheme (not red like urgent flights) */}
      <div className="mb-3 flex items-center gap-2">
        <Star className="size-4 fill-amber-500 text-amber-500 shrink-0" aria-hidden />
        <h2 className="text-base font-semibold text-foreground">
          {t("importantSection")}
        </h2>
      </div>

      {/* Featured article cards with amber ring indicator */}
      <div className="flex flex-col gap-3">
        {featuredArticles.map((article) => (
          <div
            key={article._id}
            className={cn("rounded-xl ring-2 ring-amber-500/30")}
          >
            <NewsCard article={article as unknown as NewsArticleWithSource} />
          </div>
        ))}
      </div>
    </section>
  );
}
