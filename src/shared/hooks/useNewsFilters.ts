"use client";

import { useMemo } from "react";
import {
  useQueryStates,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs";
import { useAppStore } from "@/stores/appStore";

const LANG_OPTIONS = ["he", "en"] as const;
type NewsLanguage = (typeof LANG_OPTIONS)[number];

const newsFiltersParsers = {
  lang: parseAsStringLiteral(LANG_OPTIONS),
  country: parseAsString,
};

const NUQS_OPTIONS = { shallow: true, throttleMs: 300 } as const;

export function useNewsFilters() {
  const [urlParams, setUrlParams] = useQueryStates(newsFiltersParsers, NUQS_OPTIONS);
  const selectedCountry = useAppStore((s) => s.selectedCountry);

  // "_all" means user explicitly chose "All" — no country filter.
  // null means not set — default to the user's selected country from store.
  const effectiveCountry: string | undefined =
    urlParams.country === "_all"
      ? undefined
      : urlParams.country || selectedCountry || undefined;

  // Convert URL params to Convex-ready filter object
  const filters = useMemo(
    () => ({
      language: urlParams.lang ?? undefined,
      country: effectiveCountry,
    }),
    [urlParams.lang, effectiveCountry]
  );

  // Count active filter params (lang + country)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (urlParams.lang) count++;
    if (urlParams.country) count++;
    return count;
  }, [urlParams.lang, urlParams.country]);

  const clearAll = () => setUrlParams({ lang: null, country: null });

  return {
    filters,
    urlParams,
    setUrlParams,
    clearAll,
    activeFilterCount,
    effectiveCountry,
  };
}
