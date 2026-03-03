"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { COUNTRIES } from "@/shared/data/countries";
import { useAppStore } from "@/stores/appStore";

export interface FlightFilters {
  departureCountry?: string;
  destination?: string;
  dateFrom?: number;
  dateTo?: number;
  minSeats?: number;
  isPackage?: boolean;
}

interface FlightFilterBarProps {
  filters: FlightFilters;
  onFiltersChange: (filters: FlightFilters) => void;
}

// Convert a date input value (YYYY-MM-DD) to a Unix timestamp at start of day UTC
function dateStringToTimestamp(value: string): number | undefined {
  if (!value) return undefined;
  return new Date(value).getTime();
}

// Convert a Unix timestamp to a date input value (YYYY-MM-DD)
function timestampToDateString(ts: number | undefined): string {
  if (ts === undefined) return "";
  return new Date(ts).toISOString().split("T")[0];
}

export function FlightFilterBar({ filters, onFiltersChange }: FlightFilterBarProps) {
  const t = useTranslations("flights");
  const selectedCountry = useAppStore((s) => s.selectedCountry);

  // Auto-populate departure country from app store on mount, only if not already set
  useEffect(() => {
    if (!filters.departureCountry && selectedCountry) {
      onFiltersChange({ ...filters, departureCountry: selectedCountry });
    }
    // Only run once on mount — intentionally omitting filters/onFiltersChange
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function set(partial: Partial<FlightFilters>) {
    onFiltersChange({ ...filters, ...partial });
  }

  const typeValue =
    filters.isPackage === true
      ? "packages"
      : filters.isPackage === false
        ? "flights"
        : "all";

  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b py-3">
      {/* Desktop: flex-wrap row */}
      <div className="hidden md:flex flex-wrap items-center gap-3 px-4">
        {/* Departure Country */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground font-medium">
            {t("filterDeparture")}
          </label>
          <select
            value={filters.departureCountry ?? ""}
            onChange={(e) => set({ departureCountry: e.target.value || undefined })}
            className="h-9 rounded-md border border-input bg-background px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring min-w-[130px]"
          >
            <option value="">{t("filterTypeAll")}</option>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Destination */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground font-medium">
            {t("filterDestination")}
          </label>
          <select
            value={filters.destination ?? ""}
            onChange={(e) => set({ destination: e.target.value || undefined })}
            className="h-9 rounded-md border border-input bg-background px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring min-w-[130px]"
          >
            <option value="">{t("filterTypeAll")}</option>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date From */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground font-medium">
            {t("filterDateFrom")}
          </label>
          <input
            type="date"
            value={timestampToDateString(filters.dateFrom)}
            onChange={(e) =>
              set({ dateFrom: dateStringToTimestamp(e.target.value) })
            }
            className="h-9 rounded-md border border-input bg-background px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Date To */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground font-medium">
            {t("filterDateTo")}
          </label>
          <input
            type="date"
            value={timestampToDateString(filters.dateTo)}
            onChange={(e) =>
              set({ dateTo: dateStringToTimestamp(e.target.value) })
            }
            className="h-9 rounded-md border border-input bg-background px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Min Seats */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground font-medium">
            {t("filterSeats")}
          </label>
          <select
            value={filters.minSeats ?? ""}
            onChange={(e) =>
              set({ minSeats: e.target.value ? Number(e.target.value) : undefined })
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
        </div>

        {/* Type chips */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground font-medium">
            {t("filterType")}
          </label>
          <div className="flex gap-1.5">
            {(
              [
                { value: "all", label: t("filterTypeAll"), isPackage: undefined },
                { value: "flights", label: t("filterTypeFlights"), isPackage: false as boolean | undefined },
                { value: "packages", label: t("filterTypePackages"), isPackage: true as boolean | undefined },
              ] as const
            ).map(({ value, label, isPackage }) => (
              <button
                key={value}
                type="button"
                onClick={() => set({ isPackage })}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  typeValue === value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile: scrollable chip row */}
      <div className="flex md:hidden overflow-x-auto gap-2 pb-2 px-4">
        {/* Departure chip */}
        <label className="flex shrink-0 flex-col gap-0.5">
          <span className="text-xs text-muted-foreground">{t("filterDeparture")}</span>
          <select
            value={filters.departureCountry ?? ""}
            onChange={(e) => set({ departureCountry: e.target.value || undefined })}
            className="h-8 rounded-full border border-input bg-background px-2 text-xs focus:outline-none"
          >
            <option value="">-</option>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex shrink-0 flex-col gap-0.5">
          <span className="text-xs text-muted-foreground">{t("filterDestination")}</span>
          <select
            value={filters.destination ?? ""}
            onChange={(e) => set({ destination: e.target.value || undefined })}
            className="h-8 rounded-full border border-input bg-background px-2 text-xs focus:outline-none"
          >
            <option value="">-</option>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex shrink-0 flex-col gap-0.5">
          <span className="text-xs text-muted-foreground">{t("filterDateFrom")}</span>
          <input
            type="date"
            value={timestampToDateString(filters.dateFrom)}
            onChange={(e) => set({ dateFrom: dateStringToTimestamp(e.target.value) })}
            className="h-8 rounded-full border border-input bg-background px-2 text-xs focus:outline-none"
          />
        </label>

        <label className="flex shrink-0 flex-col gap-0.5">
          <span className="text-xs text-muted-foreground">{t("filterDateTo")}</span>
          <input
            type="date"
            value={timestampToDateString(filters.dateTo)}
            onChange={(e) => set({ dateTo: dateStringToTimestamp(e.target.value) })}
            className="h-8 rounded-full border border-input bg-background px-2 text-xs focus:outline-none"
          />
        </label>

        <label className="flex shrink-0 flex-col gap-0.5">
          <span className="text-xs text-muted-foreground">{t("filterSeats")}</span>
          <select
            value={filters.minSeats ?? ""}
            onChange={(e) => set({ minSeats: e.target.value ? Number(e.target.value) : undefined })}
            className="h-8 rounded-full border border-input bg-background px-2 text-xs focus:outline-none w-14"
          >
            <option value="">-</option>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{n}+</option>
            ))}
          </select>
        </label>

        {/* Type chips mobile */}
        <div className="flex shrink-0 items-end gap-1.5 pb-0.5">
          {(
            [
              { value: "all", label: t("filterTypeAll"), isPackage: undefined },
              { value: "flights", label: t("filterTypeFlights"), isPackage: false as boolean | undefined },
              { value: "packages", label: t("filterTypePackages"), isPackage: true as boolean | undefined },
            ] as const
          ).map(({ value, label, isPackage }) => (
            <button
              key={value}
              type="button"
              onClick={() => set({ isPackage })}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                typeValue === value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
