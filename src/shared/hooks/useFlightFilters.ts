"use client";

import { useMemo } from "react";
import {
  useQueryStates,
  parseAsString,
  parseAsInteger,
  parseAsStringLiteral,
} from "nuqs";
import { useAppStore } from "@/stores/appStore";

export const SORT_OPTIONS = ["soonest", "newest", "price_asc", "price_desc"] as const;
export type FlightSort = (typeof SORT_OPTIONS)[number];

const flightFiltersParsers = {
  from: parseAsString,
  to: parseAsString,
  after: parseAsString,
  before: parseAsString,
  seats: parseAsInteger,
  sort: parseAsStringLiteral(SORT_OPTIONS),
};

const NUQS_OPTIONS = { shallow: true, throttleMs: 300 } as const;

export function useFlightFilters() {
  const [urlParams, setUrlParams] = useQueryStates(flightFiltersParsers, NUQS_OPTIONS);
  const selectedCountry = useAppStore((s) => s.selectedCountry) || null;

  // "_all" means user explicitly chose "All" — no country filter.
  // null means not set yet — default to the user's selected country.
  const rawFrom = urlParams.from;
  const effectiveFrom =
    rawFrom === "_all" ? undefined
    : rawFrom || selectedCountry || undefined;

  const rawTo = urlParams.to;
  const effectiveTo = rawTo === "_all" ? undefined : rawTo || undefined;

  // Convert URL strings to Convex-ready filter object
  const filters = useMemo(() => {
    const dateFrom = urlParams.after
      ? new Date(urlParams.after).getTime()
      : undefined;
    const dateTo = urlParams.before
      ? new Date(urlParams.before).getTime()
      : undefined;

    return {
      departureCountry: effectiveFrom,
      destination: effectiveTo,
      dateFrom: dateFrom && !isNaN(dateFrom) ? dateFrom : undefined,
      dateTo: dateTo && !isNaN(dateTo) ? dateTo : undefined,
      minSeats: urlParams.seats ?? undefined,
    };
  }, [effectiveFrom, effectiveTo, urlParams.after, urlParams.before, urlParams.seats]);

  const sort: FlightSort = urlParams.sort ?? "soonest";

  const setSort = (value: FlightSort) => {
    setUrlParams({ sort: value === "soonest" ? null : value });
  };

  // Count active filter params (exclude sort — it's always set)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (urlParams.from) count++;
    if (urlParams.to) count++;
    if (urlParams.after) count++;
    if (urlParams.before) count++;
    if (urlParams.seats) count++;
    return count;
  }, [urlParams.from, urlParams.to, urlParams.after, urlParams.before, urlParams.seats]);

  const clearAll = () => {
    setUrlParams({
      from: null,
      to: null,
      after: null,
      before: null,
      seats: null,
      sort: null,
    });
  };

  return {
    filters,
    sort,
    activeFilterCount,
    effectiveFrom,
    urlParams,
    setUrlParams,
    setSort,
    clearAll,
  };
}
