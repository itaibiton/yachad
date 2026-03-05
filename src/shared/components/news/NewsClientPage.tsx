"use client";

import { useTranslations } from "next-intl";
import { Rss } from "lucide-react";
import { FeaturedNewsSection } from "./FeaturedNewsSection";
import { NewsGrid } from "./NewsGrid";

export function NewsClientPage() {
  const t = useTranslations("news");

  return (
    <div className="-m-4 md:-m-6 flex flex-col">
      {/* ── Page header ── */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2 md:px-6 md:pt-6 md:pb-3">
        <div className="flex size-9 items-center justify-center rounded-lg bg-brand/10 dark:bg-brand/20 shrink-0">
          <Rss className="size-4 text-brand" aria-hidden />
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {t("title")}
          </h1>
          <p className="text-xs text-muted-foreground truncate">
            {t("subtitle")}
          </p>
        </div>
      </div>

      {/* ── Feed content ── */}
      <div className="flex flex-col gap-6 px-4 pb-4 md:px-6 md:pb-6">
        <FeaturedNewsSection />
        <NewsGrid />
      </div>
    </div>
  );
}
