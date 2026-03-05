"use client";

import { useState, useRef, useCallback } from "react";

export interface PlaceSuggestion {
  placeId: string;
  mainText: string;
  secondaryText: string;
  countryCode: string;
  flag: string;
}

// Country code → flag emoji
function countryCodeToFlag(code: string): string {
  const upper = code.toUpperCase();
  return String.fromCodePoint(
    ...upper.split("").map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)
  );
}

const DEBOUNCE_MS = 300;

/**
 * Hook for Google Places Autocomplete (New API).
 * Uses the Places API REST endpoint for city/region search.
 * Returns suggestions with country flags.
 */
export function useGooglePlaces(
  locale: string,
  types: string[] = ["locality", "administrative_area_level_1", "country"],
) {
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiAvailable, setApiAvailable] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const sessionTokenRef = useRef<string>(null);
  const abortRef = useRef<AbortController>(null);

  const fetchSuggestions = useCallback(
    (input: string) => {
      // Clear previous debounce
      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (!input.trim() || input.length < 2) {
        setSuggestions([]);
        return;
      }

      debounceRef.current = setTimeout(async () => {
        // Abort previous request
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        // Lazy-init session token on client only
        if (!sessionTokenRef.current) {
          sessionTokenRef.current = crypto.randomUUID();
        }

        setLoading(true);
        try {
          const res = await fetch("/api/places", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              input,
              includedPrimaryTypes: types,
              languageCode: locale,
              sessionToken: sessionTokenRef.current,
            }),
            signal: controller.signal,
          });

          if (!res.ok) {
            setApiAvailable(false);
            setSuggestions([]);
            return;
          }

          const data = await res.json();
          const results: PlaceSuggestion[] = (data.suggestions ?? [])
            .filter(
              (s: Record<string, unknown>) => s.placePrediction
            )
            .map(
              (s: {
                placePrediction: {
                  placeId: string;
                  structuredFormat: {
                    mainText: { text: string };
                    secondaryText?: { text: string };
                  };
                  text: { text: string };
                };
              }) => {
                const pred = s.placePrediction;
                const mainText = pred.structuredFormat?.mainText?.text ?? pred.text?.text ?? "";
                const secondary =
                  pred.structuredFormat?.secondaryText?.text ?? "";
                // For cities/regions, country is the last part of secondary text.
                // For country results, secondary is empty — use mainText instead.
                const parts = secondary.split(", ");
                const countryName = secondary
                  ? parts[parts.length - 1]
                  : mainText;
                const countryCode = nameToCountryCode(countryName, locale);
                return {
                  placeId: pred.placeId,
                  mainText,
                  secondaryText: secondary,
                  countryCode,
                  flag: countryCode ? countryCodeToFlag(countryCode) : "🌍",
                };
              }
            );

          setSuggestions(results);
          setApiAvailable(true);
        } catch (err) {
          if ((err as Error).name !== "AbortError") {
            setApiAvailable(false);
            setSuggestions([]);
          }
        } finally {
          setLoading(false);
        }
      }, DEBOUNCE_MS);
    },
    [locale, types]
  );

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);

  // Reset session token after a place is selected (per Google billing best practice)
  const resetSession = useCallback(() => {
    sessionTokenRef.current = null;
  }, []);

  return {
    suggestions,
    loading,
    apiAvailable,
    fetchSuggestions,
    clearSuggestions,
    resetSession,
  };
}

/** All ISO 3166-1 alpha-2 codes */
export const ALL_COUNTRY_CODES = [
  "AD","AE","AF","AG","AI","AL","AM","AO","AQ","AR","AS","AT","AU","AW","AX",
  "AZ","BA","BB","BD","BE","BF","BG","BH","BI","BJ","BL","BM","BN","BO","BQ",
  "BR","BS","BT","BV","BW","BY","BZ","CA","CC","CD","CF","CG","CH","CI","CK",
  "CL","CM","CN","CO","CR","CU","CV","CW","CX","CY","CZ","DE","DJ","DK","DM",
  "DO","DZ","EC","EE","EG","EH","ER","ES","ET","FI","FJ","FK","FM","FO","FR",
  "GA","GB","GD","GE","GF","GG","GH","GI","GL","GM","GN","GP","GQ","GR","GS",
  "GT","GU","GW","GY","HK","HM","HN","HR","HT","HU","ID","IE","IL","IM","IN",
  "IO","IQ","IR","IS","IT","JE","JM","JO","JP","KE","KG","KH","KI","KM","KN",
  "KP","KR","KW","KY","KZ","LA","LB","LC","LI","LK","LR","LS","LT","LU","LV",
  "LY","MA","MC","MD","ME","MF","MG","MH","MK","ML","MM","MN","MO","MP","MQ",
  "MR","MS","MT","MU","MV","MW","MX","MY","MZ","NA","NC","NE","NF","NG","NI",
  "NL","NO","NP","NR","NU","NZ","OM","PA","PE","PF","PG","PH","PK","PL","PM",
  "PN","PR","PS","PT","PW","PY","QA","RE","RO","RS","RU","RW","SA","SB","SC",
  "SD","SE","SG","SH","SI","SJ","SK","SL","SM","SN","SO","SR","SS","ST","SV",
  "SX","SY","SZ","TC","TD","TF","TG","TH","TJ","TK","TL","TM","TN","TO","TR",
  "TT","TV","TW","TZ","UA","UG","UM","US","UY","UZ","VA","VC","VE","VG","VI",
  "VN","VU","WF","WS","YE","YT","ZA","ZM","ZW",
];

/**
 * Common aliases / abbreviations Google Places may return instead of
 * the canonical Intl.DisplayNames string.
 */
const COUNTRY_ALIASES: Record<string, string> = {
  // English abbreviations
  "usa": "US", "u.s.a.": "US", "u.s.": "US", "united states of america": "US",
  "uk": "GB", "u.k.": "GB", "england": "GB", "great britain": "GB",
  "uae": "AE", "u.a.e.": "AE",
  "czech republic": "CZ", "czechia": "CZ",
  "south korea": "KR", "republic of korea": "KR", "korea": "KR",
  "north korea": "KP",
  "russia": "RU", "russian federation": "RU",
  "taiwan": "TW", "republic of china": "TW",
  "vietnam": "VN", "viet nam": "VN",
  "ivory coast": "CI", "côte d'ivoire": "CI", "cote d'ivoire": "CI",
  "myanmar": "MM", "burma": "MM",
  "eswatini": "SZ", "swaziland": "SZ",
  "türkiye": "TR", "turkiye": "TR",
  "hong kong": "HK", "macau": "MO", "macao": "MO",
  "palestine": "PS",
  "são tomé and príncipe": "ST", "sao tome and principe": "ST",
  "timor-leste": "TL", "east timor": "TL",
  "cabo verde": "CV", "cape verde": "CV",
  "the netherlands": "NL",
  "the bahamas": "BS", "bahamas": "BS",
  "the gambia": "GM", "gambia": "GM",
  "democratic republic of the congo": "CD", "dr congo": "CD", "drc": "CD",
  "republic of the congo": "CG", "congo": "CG",
  // Hebrew abbreviations / alternate forms
  "ארה״ב": "US", "ארה\"ב": "US",
  "בריטניה": "GB", "אנגליה": "GB",
  "איחוד האמירויות": "AE", "אמירויות": "AE",
  "צ'כיה": "CZ", "צ׳כיה": "CZ",
  "דרום קוריאה": "KR", "קוריאה": "KR",
  "רוסיה": "RU",
  "הולנד": "NL",
};

/**
 * Build a reverse lookup: localized country name → ISO code.
 * Uses Intl.DisplayNames so it works for ANY language automatically.
 * Stores normalized (lowercased, trimmed) keys for fuzzy matching.
 * Cached per locale.
 */
const countryNameCaches = new Map<string, Map<string, string>>();

function buildCountryNameMap(locale: string): Map<string, string> {
  const cached = countryNameCaches.get(locale);
  if (cached) return cached;

  const map = new Map<string, string>();

  // Add Intl.DisplayNames entries (normalized to lowercase)
  try {
    const dn = new Intl.DisplayNames([locale], { type: "region" });
    for (const code of ALL_COUNTRY_CODES) {
      const name = dn.of(code);
      if (name) map.set(name.toLowerCase().trim(), code);
    }
  } catch {
    // Intl not supported — fall through to empty map
  }
  // Also add the English fallback if locale isn't English
  if (locale !== "en") {
    try {
      const dn = new Intl.DisplayNames(["en"], { type: "region" });
      for (const code of ALL_COUNTRY_CODES) {
        const name = dn.of(code);
        if (name) {
          const key = name.toLowerCase().trim();
          if (!map.has(key)) map.set(key, code);
        }
      }
    } catch {/* */}
  }

  // Add common aliases (only if not already mapped)
  for (const [alias, code] of Object.entries(COUNTRY_ALIASES)) {
    const key = alias.toLowerCase().trim();
    if (!map.has(key)) map.set(key, code);
  }

  countryNameCaches.set(locale, map);
  return map;
}

/**
 * Map a localized country display name to its ISO 3166-1 alpha-2 code.
 * Works for every country in every language via Intl.DisplayNames.
 * Handles abbreviations, alternate names, and case differences.
 */
function nameToCountryCode(name: string, locale = "en"): string {
  if (!name) return "";
  const map = buildCountryNameMap(locale);
  const normalized = name.toLowerCase().trim();
  return map.get(normalized) ?? "";
}
