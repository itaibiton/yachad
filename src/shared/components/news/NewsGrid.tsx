"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { usePaginatedQuery } from "convex/react";
import { useInView } from "react-intersection-observer";
import { Newspaper, Loader2, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "../../../../convex/_generated/api";
import { NewsCard } from "./NewsCard";
import { NewArticlesBanner } from "./NewArticlesBanner";
import type { NewsArticleWithSource } from "./news-utils";

/**
 * NewsCardSkeleton — lightweight animated placeholder for loading state.
 */
function NewsCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-4 animate-pulse">
      {/* Meta row */}
      <div className="flex items-center gap-2 mb-2">
        <div className="size-4 rounded-sm bg-muted" />
        <div className="h-3 w-24 rounded bg-muted" />
        <div className="h-4 w-14 rounded-full bg-muted" />
        <div className="h-4 w-8 rounded-full bg-muted ms-auto" />
      </div>
      {/* Headline */}
      <div className="h-5 w-full rounded bg-muted mb-1" />
      <div className="h-5 w-3/4 rounded bg-muted mb-2" />
      {/* Description */}
      <div className="h-4 w-full rounded bg-muted mb-1" />
      <div className="h-4 w-5/6 rounded bg-muted" />
    </div>
  );
}

interface NewsGridProps {
  filters: {
    language?: string;
    country?: string;
  };
}

export function NewsGrid({ filters }: NewsGridProps) {
  const t = useTranslations("news");

  const { results, status, loadMore } = usePaginatedQuery(
    api.modules.news.queries.listNewsArticles,
    {
      language: filters.language as "he" | "en" | undefined,
      country: filters.country,
    },
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

  // ── New articles banner logic (Pattern 6) ──
  // Track how many articles were seen at baseline; compute pending count reactively
  const [seenCount, setSeenCount] = useState<number | null>(null);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (status !== "LoadingFirstPage" && seenCount === null) {
      // Establish baseline
      setSeenCount(results.length);
    } else if (seenCount !== null && results.length > seenCount) {
      // New articles arrived
      setPendingCount(results.length - seenCount);
    }
  }, [status, results.length, seenCount]);

  const applyNewArticles = () => {
    setSeenCount(results.length);
    setPendingCount(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Pull-to-refresh (mobile only) ──
  const startYRef = useRef<number | null>(null);
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      startYRef.current = e.touches[0].clientY;
    } else {
      startYRef.current = null;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startYRef.current === null) return;
    const deltaY = e.touches[0].clientY - startYRef.current;
    if (deltaY <= 0) {
      startYRef.current = null;
      return;
    }
    const clamped = Math.min(deltaY, 120);
    setPullDistance(clamped);
    if (clamped >= 80) {
      setIsPulling(true);
    }
  };

  const handleTouchEnd = () => {
    if (startYRef.current === null) {
      setPullDistance(0);
      setIsPulling(false);
      return;
    }
    startYRef.current = null;

    if (isPulling && pullDistance >= 80) {
      setIsRefreshing(true);
      // Reset baseline to re-trigger the banner when new content arrives
      setSeenCount(null);
      setTimeout(() => {
        setIsRefreshing(false);
        setIsPulling(false);
        setPullDistance(0);
      }, 300);
    } else {
      setIsPulling(false);
      setPullDistance(0);
    }
  };

  // Loading first page — show skeleton
  if (status === "LoadingFirstPage") {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <NewsCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Empty state
  if (results.length === 0 && status === "Exhausted") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border bg-card py-16 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-muted">
          <Newspaper className="size-8 text-muted-foreground" aria-hidden />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-base font-semibold text-foreground">{t("noNews")}</p>
          <p className="text-sm text-muted-foreground">{t("noNewsDescription")}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull-to-refresh indicator — mobile only */}
      <div className="md:hidden">
        {pullDistance > 0 && (
          <div
            className="flex items-center justify-center gap-2 overflow-hidden text-sm text-muted-foreground transition-all"
            style={{ height: pullDistance }}
          >
            <ArrowDown
              className={cn(
                "size-4 transition-transform duration-200",
                pullDistance >= 80 && "rotate-180"
              )}
              aria-hidden
            />
            <span>
              {isRefreshing || pullDistance >= 80
                ? t("refreshing")
                : t("pullToRefresh")}
            </span>
          </div>
        )}
      </div>

      {/* New articles banner */}
      {pendingCount > 0 && (
        <div className="mb-4">
          <NewArticlesBanner count={pendingCount} onShow={applyNewArticles} />
        </div>
      )}

      {/* Article cards — single column */}
      <div className="flex flex-col gap-4">
        {results.map((article) => (
          <NewsCard
            key={article._id}
            article={article as unknown as NewsArticleWithSource}
          />
        ))}
      </div>

      {/* Infinite scroll sentinel */}
      <div ref={ref} className="h-1" aria-hidden />

      {/* Loading more indicator */}
      {status === "LoadingMore" && (
        <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          <span>{t("loadingMore")}</span>
        </div>
      )}

      {/* End of results */}
      {status === "Exhausted" && results.length > 0 && (
        <p className="py-4 text-center text-sm text-muted-foreground">
          {t("endOfResults")}
        </p>
      )}
    </div>
  );
}
