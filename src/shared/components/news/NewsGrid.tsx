"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { usePaginatedQuery } from "convex/react";
import { useInView } from "react-intersection-observer";
import { Newspaper, Loader2 } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { NewsCard } from "./NewsCard";
import type { NewsArticleWithSource } from "./news-utils";

/* ─────────────────────────────────────────────────────────────────────────────
 * Skeletons — match the redesigned card layouts for a smooth loading transition.
 * ────────────────────────────────────────────────────────────────────────── */

function HeroSkeleton() {
  return (
    <div className="rounded-xl border bg-card overflow-hidden animate-pulse">
      <div className="w-full h-40 md:h-48 bg-muted" />
      <div className="p-4 md:p-5">
        <div className="flex items-center gap-2 mb-2">
          <div className="size-4 rounded-sm bg-muted" />
          <div className="h-3 w-24 rounded bg-muted" />
          <div className="flex-1" />
          <div className="h-4 w-8 rounded bg-muted" />
          <div className="h-3 w-16 rounded bg-muted" />
        </div>
        <div className="h-6 w-full rounded bg-muted mb-2" />
        <div className="h-6 w-4/5 rounded bg-muted mb-3" />
        <div className="h-4 w-full rounded bg-muted mb-1.5" />
        <div className="h-4 w-3/4 rounded bg-muted mb-3" />
        <div className="h-3 w-28 rounded bg-muted" />
      </div>
    </div>
  );
}

function CompactSkeleton() {
  return (
    <div className="rounded-xl border bg-card overflow-hidden animate-pulse flex min-h-[120px]">
      <div className="flex-1 p-3.5 md:p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="size-4 rounded-sm bg-muted" />
            <div className="h-3 w-20 rounded bg-muted" />
            <div className="flex-1" />
            <div className="h-4 w-7 rounded bg-muted" />
          </div>
          <div className="h-5 w-full rounded bg-muted mb-1" />
          <div className="h-5 w-3/4 rounded bg-muted mb-2" />
          <div className="hidden md:block h-4 w-5/6 rounded bg-muted" />
        </div>
        <div className="flex items-center gap-2 mt-2">
          <div className="h-3 w-14 rounded bg-muted" />
          <div className="h-3 w-20 rounded bg-muted" />
        </div>
      </div>
      <div className="shrink-0 w-28 md:w-1/3 max-w-[220px] bg-muted" />
    </div>
  );
}

export function NewsGrid() {
  const t = useTranslations("news");

  const { results, status, loadMore } = usePaginatedQuery(
    api.modules.news.queries.listNewsArticles,
    {},
    { initialNumItems: 20 }
  );

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "200px 0px",
  });

  // Trigger load more when sentinel enters viewport
  useEffect(() => {
    if (inView && status === "CanLoadMore") {
      loadMore(20);
    }
  }, [inView, status, loadMore]);

  // ── Loading first page — skeleton with hero + grid layout ──
  if (status === "LoadingFirstPage") {
    return (
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <HeroSkeleton />
          <HeroSkeleton />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <CompactSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // ── Empty state ──
  if (results.length === 0 && status === "Exhausted") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border bg-card py-20 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-muted">
          <Newspaper className="size-7 text-muted-foreground" aria-hidden />
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="text-base font-semibold text-foreground">
            {t("noNews")}
          </p>
          <p className="text-sm text-muted-foreground max-w-[280px]">
            {t("noNewsDescription")}
          </p>
        </div>
      </div>
    );
  }

  // Split results: first 2 articles are hero, rest go into the grid
  const heroArticles = results.slice(0, 2);
  const gridArticles = results.slice(2);

  return (
    <div className="relative">
      {/* Subtle background loading indicator — visible while Convex syncs new data */}
      {status === "LoadingMore" && (
        <div className="absolute top-0 inset-x-0 z-10 flex justify-center">
          <div className="flex items-center gap-1.5 rounded-full bg-muted/90 backdrop-blur px-3 py-1 shadow-sm text-xs text-muted-foreground">
            <Loader2 className="size-3 animate-spin" aria-hidden />
            {t("loadingMore")}
          </div>
        </div>
      )}

      {/* ── Hero articles — 2-up side by side on desktop, stacked on mobile ── */}
      {heroArticles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          {heroArticles.map((article) => (
            <NewsCard
              key={article._id}
              article={article as unknown as NewsArticleWithSource}
              variant="hero"
            />
          ))}
        </div>
      )}

      {/* ── Grid: 1-col mobile, 2-col tablet, 3-col desktop ── */}
      {gridArticles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {gridArticles.map((article) => (
            <NewsCard
              key={article._id}
              article={article as unknown as NewsArticleWithSource}
            />
          ))}
        </div>
      )}

      {/* Infinite scroll sentinel */}
      <div ref={ref} className="h-1" aria-hidden />

      {/* End of results */}
      {status === "Exhausted" && results.length > 0 && (
        <p className="py-6 text-center text-xs text-muted-foreground/60">
          {t("endOfResults")}
        </p>
      )}
    </div>
  );
}
