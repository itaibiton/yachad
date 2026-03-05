"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { ArrowUpDown, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FlightFilterBar } from "./FlightFilterBar";

import { FlightsGrid } from "./FlightsGrid";
import { FlightsMapSidebar } from "./FlightsMapSidebar";
import { GoogleMapsProvider } from "@/shared/components/GoogleMapsProvider";
import { TimeFormatContext, type TimeFormat } from "./flight-utils";
import {
  useFlightFilters,
  SORT_OPTIONS,
  type FlightSort,
} from "@/shared/hooks/useFlightFilters";

const SORT_LABEL_KEYS: Record<FlightSort, string> = {
  soonest: "sortSoonest",
  newest: "sortNewest",
  price_asc: "sortPriceAsc",
  price_desc: "sortPriceDesc",
};

export function FlightsClientPage() {
  const t = useTranslations("flights");
  const {
    filters,
    sort,
    activeFilterCount,
    effectiveFrom,
    urlParams,
    setUrlParams,
    setSort,
    clearAll,
  } = useFlightFilters();
  const [timeFormat, setTimeFormat] = useState<TimeFormat>("24");

  return (
    <GoogleMapsProvider>
    <TimeFormatContext.Provider value={timeFormat}>
      {/* Break out of parent padding + kill parent scroll */}
      <div className="-m-4 md:-m-6 flex h-[calc(100vh-3.5rem)] flex-col overflow-hidden">
        {/* Header + filter bar — fixed top area */}
        <div className="shrink-0 flex flex-col gap-4 px-4 pt-4 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
              <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
            </div>

            <div className="flex items-center gap-3">
              {/* Sort dropdown */}
              <div className="flex items-center gap-1.5">
                <ArrowUpDown className="size-4 text-muted-foreground" />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as FlightSort)}
                  className="h-8 rounded-lg border bg-background px-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {t(SORT_LABEL_KEYS[option])}
                    </option>
                  ))}
                </select>
              </div>

              {/* 12/24h toggle */}
              <div className="flex items-center gap-1.5">
                <Clock className="size-4 text-muted-foreground" />
                <div className="flex rounded-lg border bg-muted p-0.5">
                  <button
                    type="button"
                    onClick={() => setTimeFormat("24")}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                      timeFormat === "24"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    24h
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeFormat("12")}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                      timeFormat === "12"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    12h
                  </button>
                </div>
              </div>
            </div>
          </div>

          <FlightFilterBar
            urlParams={urlParams}
            setUrlParams={setUrlParams}
            activeFilterCount={activeFilterCount}
            effectiveFrom={effectiveFrom}
            clearAll={clearAll}
          />
        </div>

        {/* Map + scrollable flight list — fills remaining height */}
        <div className="flex min-h-0 flex-1">
          {/* Map — hidden below lg, 50% width, edge-to-edge no padding/rounded */}
          <aside className="hidden lg:block w-1/2 shrink-0">
            <div className="h-full overflow-hidden">
              <FlightsMapSidebar filters={filters} allDepartures={urlParams.from === "_all"} />
            </div>
          </aside>

          {/* Flight content — scrollable, with padding */}
          <div className="w-full lg:w-1/2 flex flex-col gap-6 min-w-0 overflow-y-auto p-4 md:p-6">
            <FlightsGrid filters={filters} sort={sort} />
          </div>
        </div>
      </div>
    </TimeFormatContext.Provider>
    </GoogleMapsProvider>
  );
}
