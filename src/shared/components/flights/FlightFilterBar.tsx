"use client";

import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import type { useFlightFilters } from "@/shared/hooks/useFlightFilters";
import { CountryCombobox } from "@/shared/components/CountryCombobox";

type UrlParams = ReturnType<typeof useFlightFilters>["urlParams"];
type SetUrlParams = ReturnType<typeof useFlightFilters>["setUrlParams"];

interface FlightFilterBarProps {
  urlParams: UrlParams;
  setUrlParams: SetUrlParams;
  activeFilterCount: number;
  effectiveFrom?: string;
  clearAll: () => void;
}

export function FlightFilterBar({
  urlParams,
  setUrlParams,
  activeFilterCount,
  effectiveFrom,
  clearAll,
}: FlightFilterBarProps) {
  const t = useTranslations("flights");

  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b py-3">
      {/* Desktop: flex-wrap row */}
      <div className="hidden md:flex flex-wrap items-end gap-3 px-4">
        {/* Departure Country */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground font-medium">
            {t("filterDeparture")}
          </label>
          <CountryCombobox
            value={urlParams.from === "_all" ? "_all" : (effectiveFrom ?? null)}
            onChange={(code) => setUrlParams({ from: code })}
            placeholder={t("filterTypeAll")}
            clearable={false}
            showAll
            size="sm"
          />
        </div>

        {/* Destination */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground font-medium">
            {t("filterDestination")}
          </label>
          <CountryCombobox
            value={urlParams.to === "_all" ? "_all" : (urlParams.to ?? null)}
            onChange={(code) => setUrlParams({ to: code })}
            placeholder={t("filterTypeAll")}
            clearable={!!urlParams.to && urlParams.to !== "_all"}
            showAll
            size="sm"
          />
        </div>

        {/* Date From */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground font-medium">
            {t("filterDateFrom")}
          </label>
          <div className="relative">
            <input
              type="date"
              value={urlParams.after ?? ""}
              onChange={(e) => setUrlParams({ after: e.target.value || null })}
              className="h-9 rounded-md border border-input bg-background px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {urlParams.after && (
              <button
                type="button"
                onClick={() => setUrlParams({ after: null })}
                className="absolute -end-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-muted-foreground/20 hover:bg-muted-foreground/40 transition-colors"
                aria-label={t("clearFilters")}
              >
                <X className="size-2.5" />
              </button>
            )}
          </div>
        </div>

        {/* Date To */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground font-medium">
            {t("filterDateTo")}
          </label>
          <div className="relative">
            <input
              type="date"
              value={urlParams.before ?? ""}
              onChange={(e) => setUrlParams({ before: e.target.value || null })}
              className="h-9 rounded-md border border-input bg-background px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {urlParams.before && (
              <button
                type="button"
                onClick={() => setUrlParams({ before: null })}
                className="absolute -end-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-muted-foreground/20 hover:bg-muted-foreground/40 transition-colors"
                aria-label={t("clearFilters")}
              >
                <X className="size-2.5" />
              </button>
            )}
          </div>
        </div>

        {/* Min Seats */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground font-medium">
            {t("filterSeats")}
          </label>
          <div className="relative">
            <select
              value={urlParams.seats ?? ""}
              onChange={(e) =>
                setUrlParams({ seats: e.target.value ? Number(e.target.value) : null })
              }
              className="h-9 rounded-md border border-input bg-background px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-20"
            >
              <option value="">-</option>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}+
                </option>
              ))}
            </select>
            {urlParams.seats && (
              <button
                type="button"
                onClick={() => setUrlParams({ seats: null })}
                className="absolute -end-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-muted-foreground/20 hover:bg-muted-foreground/40 transition-colors"
                aria-label={t("clearFilters")}
              >
                <X className="size-2.5" />
              </button>
            )}
          </div>
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
        {/* Departure */}
        <div className="flex shrink-0 flex-col gap-0.5">
          <span className="text-xs text-muted-foreground">{t("filterDeparture")}</span>
          <CountryCombobox
            value={urlParams.from === "_all" ? "_all" : (effectiveFrom ?? null)}
            onChange={(code) => setUrlParams({ from: code })}
            placeholder="-"
            clearable={false}
            showAll
            size="sm"
          />
        </div>

        {/* Destination */}
        <div className="flex shrink-0 flex-col gap-0.5">
          <span className="text-xs text-muted-foreground">{t("filterDestination")}</span>
          <CountryCombobox
            value={urlParams.to === "_all" ? "_all" : (urlParams.to ?? null)}
            onChange={(code) => setUrlParams({ to: code })}
            placeholder="-"
            clearable={!!urlParams.to && urlParams.to !== "_all"}
            showAll
            size="sm"
          />
        </div>

        <label className="flex shrink-0 flex-col gap-0.5">
          <span className="text-xs text-muted-foreground">{t("filterDateFrom")}</span>
          <input
            type="date"
            value={urlParams.after ?? ""}
            onChange={(e) => setUrlParams({ after: e.target.value || null })}
            className="h-8 rounded-full border border-input bg-background px-2 text-xs focus:outline-none"
          />
        </label>

        <label className="flex shrink-0 flex-col gap-0.5">
          <span className="text-xs text-muted-foreground">{t("filterDateTo")}</span>
          <input
            type="date"
            value={urlParams.before ?? ""}
            onChange={(e) => setUrlParams({ before: e.target.value || null })}
            className="h-8 rounded-full border border-input bg-background px-2 text-xs focus:outline-none"
          />
        </label>

        <label className="flex shrink-0 flex-col gap-0.5">
          <span className="text-xs text-muted-foreground">{t("filterSeats")}</span>
          <select
            value={urlParams.seats ?? ""}
            onChange={(e) => setUrlParams({ seats: e.target.value ? Number(e.target.value) : null })}
            className="h-8 rounded-full border border-input bg-background px-2 text-xs focus:outline-none w-14"
          >
            <option value="">-</option>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{n}+</option>
            ))}
          </select>
        </label>

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
