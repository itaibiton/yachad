"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Search, MapPin, Loader2, ChevronDown, X, TrendingUp } from "lucide-react";
import { useLocale } from "next-intl";
import { useAppStore } from "@/stores/appStore";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { countryCodeToFlag } from "@/shared/data/countries";
import {
  useGooglePlaces,
  ALL_COUNTRY_CODES,
  type PlaceSuggestion,
} from "@/shared/hooks/useGooglePlaces";

export interface CountryComboboxProps {
  /** Currently selected country code (ISO 3166-1 alpha-2) */
  value: string | null;
  /** Called when a country is selected */
  onChange: (countryCode: string | null) => void;
  /** Placeholder when no country is selected */
  placeholder?: string;
  /** Show a clear button when a value is selected */
  clearable?: boolean;
  /** Show an "All" option that sends onChange(null) */
  showAll?: boolean;
  /** Size variant */
  size?: "sm" | "default";
  /** Additional class name for the trigger */
  className?: string;
  /** Accessible label */
  "aria-label"?: string;
}

interface CountryEntry {
  code: string;
  name: string;
  flag: string;
}

/**
 * Country selector combobox.
 * - Instant local filtering for country names via Intl.DisplayNames
 * - Google Places search for city names (resolves to the country)
 */
export function CountryCombobox({
  value,
  onChange,
  placeholder = "Select country",
  clearable = false,
  showAll = false,
  size = "default",
  className,
  "aria-label": ariaLabel,
}: CountryComboboxProps) {
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Resolve country code → translated display name using Intl (instant, no API call)
  const displayNames = useMemo(
    () => new Intl.DisplayNames([locale], { type: "region" }),
    [locale]
  );
  const isAll = value === "_all";
  const selectedLabel = value && !isAll ? (displayNames.of(value) ?? value) : "";

  // Full country list with localized names, sorted alphabetically
  const allCountries = useMemo(() => {
    const list: CountryEntry[] = [];
    for (const code of ALL_COUNTRY_CODES) {
      const name = displayNames.of(code);
      if (name) list.push({ code, name, flag: countryCodeToFlag(code) });
    }
    list.sort((a, b) => a.name.localeCompare(b.name, locale));
    return list;
  }, [displayNames, locale]);

  // Reverse map: localized country name → ISO code (for resolving Google suggestions)
  const nameToCode = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of allCountries) map.set(c.name, c.code);
    return map;
  }, [allCountries]);

  const selectedCountry = useAppStore((s) => s.selectedCountry);

  // Suggested countries: user's country first, then nearby/popular destinations
  const suggested = useMemo(() => {
    const NEIGHBORS: Record<string, string[]> = {
      IL: ["GR", "CY", "TR", "JO", "EG", "AE"],
      US: ["CA", "MX", "GB", "DE", "FR", "JP"],
      DE: ["AT", "CH", "NL", "FR", "PL", "CZ"],
      FR: ["ES", "IT", "DE", "BE", "CH", "GB"],
      GB: ["IE", "FR", "DE", "NL", "ES", "US"],
      TR: ["GR", "BG", "GE", "IL", "CY", "DE"],
      GR: ["CY", "TR", "IT", "BG", "AL", "IL"],
      TH: ["VN", "KH", "MY", "SG", "IN", "JP"],
      IN: ["NP", "LK", "TH", "AE", "SG", "MY"],
    };
    const POPULAR = ["US", "DE", "FR", "GB", "TR", "GR", "TH", "IT", "ES", "CY", "NL", "IN", "JP", "PT", "CH"];

    const current = selectedCountry || (value && value !== "_all" ? value : "") || "";
    const neighbors = NEIGHBORS[current] ?? [];

    const seen = new Set<string>();
    const list: string[] = [];
    const add = (code: string) => {
      if (code && !seen.has(code)) { seen.add(code); list.push(code); }
    };
    if (current) add(current);
    neighbors.forEach(add);
    POPULAR.forEach(add);

    return list.slice(0, 15).map((code) => ({
      code,
      name: displayNames.of(code) ?? code,
      flag: countryCodeToFlag(code),
    }));
  }, [selectedCountry, value, displayNames]);

  // Local country filtering — instant substring match
  const filteredCountries = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return allCountries.filter((c) => c.name.toLowerCase().includes(q));
  }, [query, allCountries]);

  // Google Places search for cities — fires when query is 2+ chars
  const {
    suggestions: citySuggestions,
    loading: cityLoading,
    fetchSuggestions,
    clearSuggestions,
    resetSession,
  } = useGooglePlaces(locale, ["locality", "administrative_area_level_1"]);

  // When popover opens, focus input
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    } else {
      setQuery("");
      setHighlightIndex(-1);
      clearSuggestions();
    }
  }, [open, clearSuggestions]);

  const handleSelectCode = useCallback(
    (code: string) => {
      if (!code) return;
      onChange(code);
      resetSession();
      setOpen(false);
    },
    [onChange, resetSession]
  );

  const handleSelectSuggestion = useCallback(
    (suggestion: PlaceSuggestion) => {
      const code = suggestion.countryCode || nameToCode.get(suggestion.mainText) || "";
      handleSelectCode(code);
    },
    [handleSelectCode, nameToCode]
  );

  const handleQueryChange = useCallback(
    (newQuery: string) => {
      setQuery(newQuery);
      setHighlightIndex(-1);
      // Fire Google Places search for city results (2+ chars)
      fetchSuggestions(newQuery);
    },
    [fetchSuggestions]
  );

  // Determine which sections to show
  const trimmedQuery = query.trim();
  const isTyping = trimmedQuery.length > 0;
  const showSuggestedSection = !isTyping;

  // Filter out city suggestions whose country already appears in country results
  const filteredCitySuggestions = useMemo(() => {
    if (!isTyping) return [];
    const countryCodesInResults = new Set(filteredCountries.map((c) => c.code));
    return citySuggestions.filter((s) => {
      // Don't show city if its country is already in the country results
      // (unless the city name itself matches the query better)
      return s.countryCode && !countryCodesInResults.has(s.countryCode)
        ? true
        : !s.countryCode; // show if we can't determine country
    });
  }, [citySuggestions, filteredCountries, isTyping]);

  // Total items for keyboard navigation
  const totalItems = showSuggestedSection
    ? suggested.length
    : filteredCountries.length + filteredCitySuggestions.length;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightIndex((prev) => Math.min(prev + 1, totalItems - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" && highlightIndex >= 0) {
        e.preventDefault();
        if (showSuggestedSection) {
          handleSelectCode(suggested[highlightIndex].code);
        } else if (highlightIndex < filteredCountries.length) {
          handleSelectCode(filteredCountries[highlightIndex].code);
        } else {
          const cityIdx = highlightIndex - filteredCountries.length;
          handleSelectSuggestion(filteredCitySuggestions[cityIdx]);
        }
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    },
    [suggested, filteredCountries, filteredCitySuggestions, highlightIndex, showSuggestedSection, totalItems, handleSelectCode, handleSelectSuggestion]
  );

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightIndex >= 0 && listRef.current) {
      const el = listRef.current.children[highlightIndex] as HTMLElement;
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightIndex]);

  const flag = value && !isAll ? countryCodeToFlag(value) : null;
  const isSmall = size === "sm";

  // Running index for keyboard highlight across both sections
  let runningIndex = 0;

  return (
    <div className={cn("relative inline-flex", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size={isSmall ? "sm" : "default"}
            role="combobox"
            aria-expanded={open}
            aria-label={ariaLabel}
            className={cn(
              "justify-between gap-1.5 font-normal",
              isSmall ? "h-8 px-2 text-xs" : "h-9 px-2.5 text-sm",
              !value && "text-muted-foreground"
            )}
          >
            {value && !isAll ? (
              <>
                <span className="text-base leading-none" aria-hidden="true">
                  {flag}
                </span>
                <span className="truncate max-w-[120px]">
                  {selectedLabel || value}
                </span>
              </>
            ) : isAll ? (
              <>
                <span className="text-base leading-none" aria-hidden="true">🌍</span>
                <span className="truncate">{locale === "he" ? "הכל" : "All"}</span>
              </>
            ) : (
              <>
                <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">{placeholder}</span>
              </>
            )}
            <ChevronDown className="size-3 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-72 p-0"
          align="start"
          sideOffset={4}
        >
          {/* Search input */}
          <div className="flex items-center gap-2 border-b px-3 py-2">
            <Search className="size-4 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={locale === "he" ? "חיפוש מדינה או עיר..." : "Search country or city..."}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {cityLoading && (
              <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
            )}
          </div>

          {/* Results */}
          <div className="max-h-64 overflow-y-auto">
            <div ref={listRef} role="listbox">
              {/* ── Suggested section (when not typing) ── */}
              {showSuggestedSection && (
                <>
                  {showAll && (
                    <button
                      type="button"
                      role="option"
                      aria-selected={isAll}
                      className={cn(
                        "flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors cursor-pointer border-b",
                        isAll
                          ? "bg-accent font-medium text-primary"
                          : "hover:bg-accent/50"
                      )}
                      onClick={() => { onChange("_all" as string); setOpen(false); }}
                    >
                      <span className="text-base leading-none">🌍</span>
                      <span className="flex-1 text-start">{locale === "he" ? "כל הטיסות" : "All flights"}</span>
                    </button>
                  )}
                  <div className="flex items-center gap-1.5 px-3 pt-2 pb-1">
                    <TrendingUp className="size-3 text-muted-foreground" />
                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                      {locale === "he" ? "מומלצות" : "Suggested"}
                    </span>
                  </div>
                  {suggested.map((s, i) => (
                    <button
                      key={s.code}
                      type="button"
                      role="option"
                      aria-selected={highlightIndex === i}
                      className={cn(
                        "flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors cursor-pointer",
                        highlightIndex === i
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-accent/50",
                        s.code === value && "font-medium text-primary"
                      )}
                      onClick={() => handleSelectCode(s.code)}
                      onMouseEnter={() => setHighlightIndex(i)}
                    >
                      <span className="text-base leading-none">{s.flag}</span>
                      <span className="flex-1 text-start truncate">{s.name}</span>
                    </button>
                  ))}
                </>
              )}

              {/* ── Search results (when typing) ── */}
              {isTyping && (
                <>
                  {/* No results at all */}
                  {filteredCountries.length === 0 && filteredCitySuggestions.length === 0 && !cityLoading && (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                      {locale === "he" ? "לא נמצאו תוצאות" : "No results found"}
                    </p>
                  )}

                  {/* Country matches (instant, local) */}
                  {filteredCountries.map((s) => {
                    const idx = runningIndex++;
                    return (
                      <button
                        key={s.code}
                        type="button"
                        role="option"
                        aria-selected={highlightIndex === idx}
                        className={cn(
                          "flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors cursor-pointer",
                          highlightIndex === idx
                            ? "bg-accent text-accent-foreground"
                            : "hover:bg-accent/50",
                          s.code === value && "font-medium text-primary"
                        )}
                        onClick={() => handleSelectCode(s.code)}
                        onMouseEnter={() => setHighlightIndex(idx)}
                      >
                        <span className="text-base leading-none">{s.flag}</span>
                        <span className="flex-1 text-start truncate">{s.name}</span>
                      </button>
                    );
                  })}

                  {/* City matches (Google Places, async) */}
                  {filteredCitySuggestions.length > 0 && (
                    <>
                      {filteredCountries.length > 0 && (
                        <div className="flex items-center gap-1.5 px-3 pt-2 pb-1 border-t">
                          <MapPin className="size-3 text-muted-foreground" />
                          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                            {locale === "he" ? "ערים" : "Cities"}
                          </span>
                        </div>
                      )}
                      {filteredCitySuggestions.map((s) => {
                        const idx = runningIndex++;
                        const countryName = s.secondaryText || "";
                        return (
                          <button
                            key={s.placeId}
                            type="button"
                            role="option"
                            aria-selected={highlightIndex === idx}
                            className={cn(
                              "flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors cursor-pointer",
                              highlightIndex === idx
                                ? "bg-accent text-accent-foreground"
                                : "hover:bg-accent/50"
                            )}
                            onClick={() => handleSelectSuggestion(s)}
                            onMouseEnter={() => setHighlightIndex(idx)}
                          >
                            <span className="text-base leading-none">{s.flag}</span>
                            <span className="flex-1 text-start truncate">
                              {s.mainText}
                              {countryName && (
                                <span className="ms-1.5 text-xs text-muted-foreground">
                                  {countryName}
                                </span>
                              )}
                            </span>
                          </button>
                        );
                      })}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Clear button */}
      {clearable && value && !isAll && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onChange(null);
          }}
          className="absolute -end-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-muted-foreground/20 hover:bg-muted-foreground/40 transition-colors z-10"
          aria-label="Clear"
        >
          <X className="size-2.5" />
        </button>
      )}
    </div>
  );
}
