"use client";

import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import type { useNewsFilters } from "@/shared/hooks/useNewsFilters";
import { CountryCombobox } from "@/shared/components/CountryCombobox";

type UrlParams = ReturnType<typeof useNewsFilters>["urlParams"];
type SetUrlParams = ReturnType<typeof useNewsFilters>["setUrlParams"];

interface NewsFilterBarProps {
  urlParams: UrlParams;
  setUrlParams: SetUrlParams;
  activeFilterCount: number;
  effectiveCountry?: string;
  clearAll: () => void;
}

/**
 * NewsFilterBar — language and country filter bar for the news feed.
 *
 * Desktop: flex-wrap row with language select + country combobox + clear pill.
 * Mobile: horizontal scrollable chip row — same pattern as FlightFilterBar.
 *
 * Uses URL params synced via useNewsFilters (nuqs).
 * All text via useTranslations("news") — no hardcoded strings.
 * RTL-safe: uses ms-/me-/ps-/pe- logical CSS properties throughout.
 */
export function NewsFilterBar({
  urlParams,
  setUrlParams,
  activeFilterCount,
  effectiveCountry,
  clearAll,
}: NewsFilterBarProps) {
  const t = useTranslations("news");

  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b py-3">
      {/* Desktop: flex-wrap row */}
      <div className="hidden md:flex flex-wrap items-end gap-3 px-4">
        {/* Language filter */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground font-medium">
            {t("filterLanguage")}
          </label>
          <select
            value={urlParams.lang ?? ""}
            onChange={(e) =>
              setUrlParams({
                lang: e.target.value as "he" | "en" | null || null,
              })
            }
            className="h-9 rounded-md border border-input bg-background px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">{t("filterAll")}</option>
            <option value="he">{t("filterHebrew")}</option>
            <option value="en">{t("filterEnglish")}</option>
          </select>
        </div>

        {/* Country filter */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground font-medium">
            {t("filterCountry")}
          </label>
          <CountryCombobox
            value={urlParams.country === "_all" ? "_all" : (effectiveCountry ?? null)}
            onChange={(code) => setUrlParams({ country: code })}
            placeholder={t("filterAll")}
            clearable={false}
            showAll
            size="sm"
          />
        </div>

        {/* Clear all pill */}
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="flex h-9 items-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/10 px-3 text-xs font-medium text-destructive hover:bg-destructive/20 transition-colors"
          >
            <X className="size-3" />
            {t("clearFilters")}
          </button>
        )}
      </div>

      {/* Mobile: scrollable chip row */}
      <div className="flex md:hidden overflow-x-auto gap-2 pb-2 px-4">
        {/* Language filter */}
        <label className="flex shrink-0 flex-col gap-0.5">
          <span className="text-xs text-muted-foreground">{t("filterLanguage")}</span>
          <select
            value={urlParams.lang ?? ""}
            onChange={(e) =>
              setUrlParams({
                lang: e.target.value as "he" | "en" | null || null,
              })
            }
            className="h-8 rounded-full border border-input bg-background px-2 text-xs focus:outline-none"
          >
            <option value="">{t("filterAll")}</option>
            <option value="he">{t("filterHebrew")}</option>
            <option value="en">{t("filterEnglish")}</option>
          </select>
        </label>

        {/* Country filter */}
        <div className="flex shrink-0 flex-col gap-0.5">
          <span className="text-xs text-muted-foreground">{t("filterCountry")}</span>
          <CountryCombobox
            value={urlParams.country === "_all" ? "_all" : (effectiveCountry ?? null)}
            onChange={(code) => setUrlParams({ country: code })}
            placeholder="-"
            clearable={false}
            showAll
            size="sm"
          />
        </div>

        {/* Clear all mobile */}
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="flex shrink-0 items-end pb-0.5"
          >
            <span className="flex h-7 items-center gap-1 rounded-full border border-destructive/30 bg-destructive/10 px-2.5 text-xs font-medium text-destructive">
              <X className="size-3" />
              {t("clearFilters")}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
