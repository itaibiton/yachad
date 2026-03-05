"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, MapPin, Loader2 } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { useGooglePlaces } from "@/shared/hooks/useGooglePlaces";

export interface LocationResult {
  /** Display name */
  name: string;
  /** Country code (ISO 3166-1 alpha-2) */
  countryCode: string;
  /** Flag emoji */
  flag: string;
  /** Secondary text (region/country) */
  secondary: string;
  /** Google Place ID */
  placeId?: string;
}

interface LocationSearchProps {
  onSelect: (result: LocationResult) => void;
  /** Custom class for the outer wrapper */
  className?: string;
  /** Variant styling overrides */
  variant?: "orbital" | "horizon" | "pulse" | "mosaic" | "signal";
}

/**
 * Location search with Google Places autocomplete + static country fallback.
 * Accessible combobox pattern with keyboard navigation.
 */
export function LocationSearch({
  onSelect,
  className = "",
  variant = "orbital",
}: LocationSearchProps) {
  const t = useTranslations("country");
  const locale = useLocale();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const {
    suggestions: placeSuggestions,
    loading,
    fetchSuggestions,
    clearSuggestions,
    resetSession,
  } = useGooglePlaces(locale);

  // Results from Google Places
  const results = useMemo((): LocationResult[] => {
    return placeSuggestions.map((s) => ({
      name: s.mainText,
      countryCode: s.countryCode,
      flag: s.flag,
      secondary: s.secondaryText,
      placeId: s.placeId,
    }));
  }, [placeSuggestions]);

  const handleSelect = useCallback(
    (result: LocationResult) => {
      setQuery(result.name);
      setIsOpen(false);
      setHighlightIndex(-1);
      clearSuggestions();
      resetSession();
      onSelect(result);
    },
    [onSelect, clearSuggestions, resetSession]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightIndex((prev) =>
          Math.min(prev + 1, results.length - 1)
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" && highlightIndex >= 0) {
        e.preventDefault();
        handleSelect(results[highlightIndex]);
      } else if (e.key === "Escape") {
        setIsOpen(false);
      }
    },
    [results, highlightIndex, handleSelect]
  );

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightIndex >= 0 && listRef.current) {
      const el = listRef.current.children[highlightIndex] as HTMLElement;
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightIndex]);

  // Variant-specific styles
  const styles = getVariantStyles(variant);

  return (
    <div className={`relative w-full max-w-md mx-auto ${className}`}>
      {/* Search input */}
      <div className="relative group">
        <div className={styles.glow} />
        <div className={styles.inputWrapper}>
          <Search className={styles.searchIcon} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
              setHighlightIndex(-1);
              fetchSuggestions(e.target.value);
            }}
            onFocus={() => setIsOpen(true)}
            onBlur={() => setTimeout(() => setIsOpen(false), 200)}
            onKeyDown={handleKeyDown}
            placeholder={t("selectTitle")}
            className={styles.input}
            role="combobox"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-autocomplete="list"
          />
          {loading ? (
            <Loader2 className={`${styles.trailingIcon} animate-spin`} />
          ) : (
            <MapPin className={styles.trailingIcon} />
          )}
        </div>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className={styles.dropdown}
          >
            <ul
              ref={listRef}
              role="listbox"
              className="max-h-64 overflow-y-auto py-1"
            >
              {results.map((result, i) => (
                <li
                  key={result.placeId ?? `${result.countryCode}-${result.name}`}
                  role="option"
                  aria-selected={highlightIndex === i}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                    highlightIndex === i
                      ? styles.itemHighlighted
                      : styles.itemDefault
                  }`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(result);
                  }}
                  onMouseEnter={() => setHighlightIndex(i)}
                >
                  <span className="text-xl leading-none">{result.flag}</span>
                  <span className="flex-1">
                    <span className={styles.itemMainText}>
                      {result.name}
                    </span>
                    {result.secondary && (
                      <span className={styles.itemSecondary}>
                        {" "}
                        {result.secondary}
                      </span>
                    )}
                  </span>
                  {result.countryCode && (
                    <span className={styles.itemCode}>
                      {result.countryCode}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getVariantStyles(variant: string) {
  // Orbital (default dark) styles — other variants override
  const base = {
    glow: "absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-brand/40 via-brand/20 to-brand/40 opacity-60 blur-sm group-focus-within:opacity-100 transition-opacity",
    inputWrapper:
      "relative flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl px-5 py-4",
    searchIcon: "size-5 text-brand/70 shrink-0",
    input:
      "flex-1 bg-transparent text-base text-white placeholder:text-white/40 outline-none",
    trailingIcon: "size-4 text-white/30 shrink-0",
    dropdown:
      "absolute z-50 mt-2 w-full rounded-xl border border-white/10 bg-gray-900/95 backdrop-blur-xl shadow-2xl overflow-hidden",
    itemHighlighted: "bg-brand/20 text-white",
    itemDefault: "text-white/80 hover:bg-white/5",
    itemMainText: "text-sm font-medium",
    itemSecondary: "text-xs text-white/40",
    itemCode: "text-xs text-white/30 font-mono",
    offlineBadge:
      "px-4 py-2 border-t border-white/5 text-[10px] text-white/20 text-center",
  };

  switch (variant) {
    case "horizon":
      return {
        ...base,
        glow: "absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-amber-200/30 via-orange-200/20 to-amber-200/30 opacity-60 blur-sm group-focus-within:opacity-100 transition-opacity",
        inputWrapper:
          "relative flex items-center gap-3 rounded-2xl border border-gray-200 bg-white/90 backdrop-blur-xl px-5 py-4 shadow-lg",
        searchIcon: "size-5 text-amber-600/70 shrink-0",
        input:
          "flex-1 bg-transparent text-base text-gray-900 placeholder:text-gray-400 outline-none",
        trailingIcon: "size-4 text-gray-400 shrink-0",
        dropdown:
          "absolute z-50 mt-2 w-full rounded-xl border border-gray-200 bg-white/98 backdrop-blur-xl shadow-2xl overflow-hidden",
        itemHighlighted: "bg-amber-50 text-gray-900",
        itemDefault: "text-gray-700 hover:bg-gray-50",
        itemMainText: "text-sm font-medium text-gray-900",
        itemSecondary: "text-xs text-gray-400",
        itemCode: "text-xs text-gray-300 font-mono",
        offlineBadge:
          "px-4 py-2 border-t border-gray-100 text-[10px] text-gray-300 text-center",
      };
    case "pulse":
      return {
        ...base,
        glow: "absolute -inset-0.5 rounded-xl bg-gradient-to-r from-red-500/30 via-brand/20 to-red-500/30 opacity-60 blur-sm group-focus-within:opacity-100 transition-opacity",
        inputWrapper:
          "relative flex items-center gap-3 rounded-xl border border-red-500/20 bg-black/60 backdrop-blur-xl px-5 py-4",
        searchIcon: "size-5 text-red-400/70 shrink-0",
        input:
          "flex-1 bg-transparent text-base text-green-400 font-mono placeholder:text-green-400/30 outline-none",
        trailingIcon: "size-4 text-red-400/30 shrink-0",
        dropdown:
          "absolute z-50 mt-2 w-full rounded-xl border border-red-500/20 bg-black/95 backdrop-blur-xl shadow-2xl overflow-hidden",
        itemHighlighted: "bg-red-500/20 text-green-400",
        itemDefault: "text-green-400/70 hover:bg-white/5",
        itemMainText: "text-sm font-mono",
        itemSecondary: "text-xs text-green-400/40 font-mono",
        itemCode: "text-xs text-red-400/50 font-mono",
        offlineBadge:
          "px-4 py-2 border-t border-red-500/10 text-[10px] text-red-400/30 text-center font-mono",
      };
    case "mosaic":
      return {
        ...base,
        glow: "absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-brand/20 via-indigo-200/20 to-brand/20 opacity-60 blur-sm group-focus-within:opacity-100 transition-opacity",
        inputWrapper:
          "relative flex items-center gap-3 rounded-2xl border border-gray-200 bg-white/95 backdrop-blur-xl px-5 py-4 shadow-md",
        searchIcon: "size-5 text-brand/60 shrink-0",
        input:
          "flex-1 bg-transparent text-base text-gray-800 placeholder:text-gray-400 outline-none",
        trailingIcon: "size-4 text-gray-400 shrink-0",
        dropdown:
          "absolute z-50 mt-2 w-full rounded-2xl border border-gray-200 bg-white/98 backdrop-blur-xl shadow-2xl overflow-hidden",
        itemHighlighted: "bg-brand/10 text-gray-900",
        itemDefault: "text-gray-600 hover:bg-gray-50",
        itemMainText: "text-sm font-medium text-gray-800",
        itemSecondary: "text-xs text-gray-400",
        itemCode: "text-xs text-gray-300 font-mono",
        offlineBadge:
          "px-4 py-2 border-t border-gray-100 text-[10px] text-gray-300 text-center",
      };
    case "signal":
      return {
        ...base,
        glow: "hidden",
        inputWrapper:
          "relative flex items-center gap-3 border-b-2 border-gray-900 bg-transparent px-2 py-4",
        searchIcon: "size-5 text-gray-400 shrink-0",
        input:
          "flex-1 bg-transparent text-base text-gray-900 placeholder:text-gray-300 outline-none tracking-wide",
        trailingIcon: "size-4 text-gray-300 shrink-0",
        dropdown:
          "absolute z-50 mt-1 w-full border border-gray-900 bg-white shadow-lg overflow-hidden",
        itemHighlighted: "bg-gray-900 text-white",
        itemDefault: "text-gray-700 hover:bg-gray-100",
        itemMainText: "text-sm font-light tracking-wide",
        itemSecondary: "text-xs text-gray-400",
        itemCode: "text-xs text-gray-300 font-mono",
        offlineBadge:
          "px-4 py-2 border-t border-gray-200 text-[10px] text-gray-300 text-center tracking-wider uppercase",
      };
    default:
      return base;
  }
}
