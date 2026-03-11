"use client";

import { useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { usePaginatedQuery, useQuery } from "convex/react";
import { useInView } from "react-intersection-observer";
import { Hotel, Loader2 } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { ReservationCard } from "./ReservationCard";
import type { ReservationWithSeller } from "./reservation-utils";

export type ReservationSort = "soonest" | "newest" | "price_asc" | "price_desc";

interface ReservationsGridProps {
  filters: {
    country?: string;
    checkInFrom?: number;
    checkInTo?: number;
  };
  sort: ReservationSort;
}

function ReservationCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border bg-card overflow-hidden">
      <div className="aspect-[16/9] bg-muted" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-1/2" />
        <div className="h-3 bg-muted rounded w-1/3" />
        <div className="h-5 bg-muted rounded w-1/4" />
        <div className="h-9 bg-muted rounded w-full" />
      </div>
    </div>
  );
}

export function ReservationsGrid({ filters, sort }: ReservationsGridProps) {
  const t = useTranslations("reservations");
  const savedIds = useQuery(
    api.modules.reservations.queries.listSavedReservationIds
  );
  const savedSet = useMemo(() => new Set(savedIds ?? []), [savedIds]);

  const { results, status, loadMore } = usePaginatedQuery(
    api.modules.reservations.queries.listReservations,
    {
      country: filters.country,
      checkInFrom: filters.checkInFrom,
      checkInTo: filters.checkInTo,
      sort,
    },
    { initialNumItems: 12 }
  );

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "200px 0px",
  });

  useEffect(() => {
    if (inView && status === "CanLoadMore") {
      loadMore(12);
    }
  }, [inView, status, loadMore]);

  // Loading first page
  if (status === "LoadingFirstPage") {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ReservationCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Empty state
  if (results.length === 0 && status === "Exhausted") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border bg-card py-16 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-muted">
          <Hotel
            className="size-8 text-muted-foreground"
            aria-hidden
          />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-base font-semibold text-foreground">
            {t("noReservations")}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("noReservationsDescription")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {results.map((reservation) => (
          <ReservationCard
            key={reservation._id}
            reservation={reservation as unknown as ReservationWithSeller}
            isSaved={savedSet.has(reservation._id)}
          />
        ))}
      </div>

      {/* Infinite scroll sentinel */}
      <div ref={ref} className="h-1" aria-hidden />

      {status === "LoadingMore" && (
        <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          <span>{t("loadingMore")}</span>
        </div>
      )}

      {status === "Exhausted" && results.length > 0 && (
        <p className="py-4 text-center text-sm text-muted-foreground">
          {t("endOfResults")}
        </p>
      )}
    </div>
  );
}
