"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { formatDistanceToNow } from "date-fns";
import { he as heLocale } from "date-fns/locale";
import { useNewsFilters } from "@/shared/hooks/useNewsFilters";
import { NewsFilterBar } from "./NewsFilterBar";
import { FeaturedNewsSection } from "./FeaturedNewsSection";
import { NewsGrid } from "./NewsGrid";

export function NewsClientPage() {
  const t = useTranslations("news");
  const locale = useLocale();
  const {
    filters,
    urlParams,
    setUrlParams,
    clearAll,
    activeFilterCount,
    effectiveCountry,
  } = useNewsFilters();

  // Track mount timestamp for "last updated" indicator
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date>(() => new Date());

  // Update the timestamp every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdatedAt(new Date());
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  const formattedTime = formatDistanceToNow(lastUpdatedAt, {
    addSuffix: true,
    locale: locale === "he" ? heLocale : undefined,
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        <p className="text-xs text-muted-foreground">
          {t("lastUpdated", { time: formattedTime })}
        </p>
      </div>

      {/* Filter bar */}
      <NewsFilterBar
        urlParams={urlParams}
        setUrlParams={setUrlParams}
        activeFilterCount={activeFilterCount}
        effectiveCountry={effectiveCountry}
        clearAll={clearAll}
      />

      {/* Feed content */}
      <div className="flex flex-col gap-6">
        {/* Featured/Important articles pinned above main feed */}
        <FeaturedNewsSection country={filters.country} />

        {/* Infinite scroll news feed */}
        <NewsGrid filters={filters} />
      </div>
    </div>
  );
}
