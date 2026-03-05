"use client";

import { useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { usePaginatedQuery, useQuery } from "convex/react";
import { useInView } from "react-intersection-observer";
import { Plane, Loader2 } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { FlightCardSkeleton } from "@/shared/components/LoadingSkeleton";
import { FlightCard } from "./FlightCard";
import type { FlightWithAgent } from "./flight-utils";
import type { FlightSort } from "@/shared/hooks/useFlightFilters";

interface FlightsGridProps {
  filters: {
    departureCountry?: string;
    destination?: string;
    dateFrom?: number;
    dateTo?: number;
    minSeats?: number;
    isPackage?: boolean;
  };
  sort: FlightSort;
}

export function FlightsGrid({ filters, sort }: FlightsGridProps) {
  const t = useTranslations("flights");
  const savedFlightIds = useQuery(api.modules.flights.queries.listSavedFlightIds);
  const savedSet = useMemo(() => new Set(savedFlightIds ?? []), [savedFlightIds]);

  const { results, status, loadMore } = usePaginatedQuery(
    api.modules.flights.queries.listFlights,
    {
      departureCountry: filters.departureCountry,
      destination: filters.destination,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      minSeats: filters.minSeats,
      isPackage: filters.isPackage,
      sort,
    },
    { initialNumItems: 12 }
  );

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "200px 0px",
  });

  // Trigger load more when sentinel enters viewport
  useEffect(() => {
    if (inView && status === "CanLoadMore") {
      loadMore(12);
    }
  }, [inView, status, loadMore]);

  // Loading first page — show skeleton grid
  if (status === "LoadingFirstPage") {
    return (
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <FlightCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Empty state — no flights match current filters
  if (results.length === 0 && status === "Exhausted") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border bg-card py-16 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-muted">
          <Plane className="size-8 text-muted-foreground rotate-90" aria-hidden />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-base font-semibold text-foreground">{t("noFlights")}</p>
          <p className="text-sm text-muted-foreground">{t("noFlightsDescription")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Flight cards grid */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {results.map((flight) => (
          <FlightCard key={flight._id} flight={flight as unknown as FlightWithAgent} isSaved={savedSet.has(flight._id)} />
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
