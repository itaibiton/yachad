"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { FlightFilterBar, type FlightFilters } from "./FlightFilterBar";
import { UrgentFlightsSection } from "./UrgentFlightsSection";
import { FlightsGrid } from "./FlightsGrid";

export function FlightsClientPage() {
  const t = useTranslations("flights");
  const [filters, setFilters] = useState<FlightFilters>({});

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* Sticky filter bar */}
      <FlightFilterBar filters={filters} onFiltersChange={setFilters} />

      {/* Urgent flights pinned at top — renders nothing when no urgent flights exist */}
      <UrgentFlightsSection departureCountry={filters.departureCountry} />

      {/* Paginated flights grid with infinite scroll */}
      <FlightsGrid filters={filters} />
    </div>
  );
}
