"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Loader2, MapPin, CheckCircle2, Search } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/appStore";
import { countryCodeToFlag } from "@/shared/data/countries";
import {
  useGooglePlaces,
  type PlaceSuggestion,
} from "@/shared/hooks/useGooglePlaces";

interface IpApiResponse {
  country_code?: string;
  country?: string;
  error?: boolean;
}

export function CountryOnboardingModal() {
  const t = useTranslations("country");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const { hasCompletedOnboarding, setSelectedCountry, completeOnboarding } =
    useAppStore();

  const [detectedCode, setDetectedCode] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(true);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Resolve country codes to translated display names (instant, no API)
  const displayNames = useMemo(
    () => new Intl.DisplayNames([locale], { type: "region" }),
    [locale]
  );
  const detectedName = detectedCode
    ? (displayNames.of(detectedCode) ?? detectedCode)
    : "";
  const selectedName = selectedCode
    ? (displayNames.of(selectedCode) ?? selectedCode)
    : "";

  const {
    suggestions,
    loading,
    fetchSuggestions,
    clearSuggestions,
    resetSession,
  } = useGooglePlaces(locale, ["country"]);

  // Auto-detect country via IP geolocation on mount
  useEffect(() => {
    if (hasCompletedOnboarding) return;

    const detectCountry = async () => {
      setIsDetecting(true);
      try {
        const response = await fetch("https://ipapi.co/json/", {
          signal: AbortSignal.timeout(5000),
        });
        if (!response.ok) throw new Error("API error");
        const data: IpApiResponse = await response.json();
        if (data.error || !data.country_code) throw new Error("No country");

        setDetectedCode(data.country_code);
        setSelectedCode(data.country_code);
      } catch {
        // Silently fail — user must select manually
      } finally {
        setIsDetecting(false);
      }
    };

    detectCountry();
  }, [hasCompletedOnboarding]);

  const handleConfirm = () => {
    if (!selectedCode) return;
    setSelectedCountry(selectedCode);
    completeOnboarding();
  };

  const handleSelectSuggestion = useCallback(
    (suggestion: PlaceSuggestion) => {
      if (suggestion.countryCode) {
        setSelectedCode(suggestion.countryCode);
      }
      setSearchQuery("");
      clearSuggestions();
      resetSession();
    },
    [clearSuggestions, resetSession]
  );

  // Do not render if onboarding already complete
  if (hasCompletedOnboarding) return null;

  return (
    <Dialog
      open={!hasCompletedOnboarding}
      onOpenChange={() => {}}
    >
      <DialogContent
        className="sm:max-w-md rounded-xl"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        showCloseButton={false}
      >
        <DialogHeader className="text-start">
          <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-brand/10">
            <MapPin className="size-5 text-brand" />
          </div>
          <DialogTitle className="text-xl font-semibold">
            {t("selectTitle")}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {t("selectDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          {/* Auto-detected country */}
          {isDetecting ? (
            <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-4 py-3">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {t("autoDetect")}...
              </span>
            </div>
          ) : detectedCode ? (
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t("autoDetect")}
              </p>
              <button
                type="button"
                onClick={() => setSelectedCode(detectedCode)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-start transition-all hover:border-brand",
                  selectedCode === detectedCode
                    ? "border-brand bg-brand/5"
                    : "border-border bg-background"
                )}
              >
                <span className="text-2xl">
                  {countryCodeToFlag(detectedCode)}
                </span>
                <span className="flex-1 font-medium">{detectedName}</span>
                {selectedCode === detectedCode && (
                  <CheckCircle2 className="size-5 text-brand" />
                )}
              </button>
            </div>
          ) : null}

          {/* Manual country selection via Google Places search */}
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {detectedCode
                ? locale === "he"
                  ? "או בחר ידנית"
                  : "Or choose manually"
                : locale === "he"
                  ? "בחר מדינה"
                  : "Select your country"}
            </p>
            <div className="relative">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="search"
                placeholder={tCommon("search")}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  fetchSuggestions(e.target.value);
                }}
                className="w-full rounded-lg border bg-background ps-9 pe-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label={tCommon("search")}
              />
              {loading && (
                <Loader2 className="absolute end-3 top-1/2 -translate-y-1/2 size-4 animate-spin text-muted-foreground" />
              )}
            </div>

            {/* Selected country display (when not typing) */}
            {selectedCode && !searchQuery && (
              <div className="flex items-center gap-3 rounded-lg border border-brand bg-brand/5 px-4 py-3">
                <span className="text-2xl">
                  {countryCodeToFlag(selectedCode)}
                </span>
                <span className="flex-1 font-medium">{selectedName}</span>
                <CheckCircle2 className="size-5 text-brand" />
              </div>
            )}

            {/* Search results */}
            {searchQuery.length >= 2 && (
              <ScrollArea className="h-48 rounded-lg border">
                <div className="p-1">
                  {suggestions.length === 0 && !loading ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                      {tCommon("noResults")}
                    </p>
                  ) : (
                    suggestions.map((suggestion) => (
                      <button
                        key={suggestion.placeId}
                        type="button"
                        onClick={() => handleSelectSuggestion(suggestion)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-md px-3 py-2 text-start text-sm transition-colors hover:bg-accent",
                          selectedCode === suggestion.countryCode &&
                            "bg-brand/10 font-medium text-brand"
                        )}
                      >
                        <span className="text-base">{suggestion.flag}</span>
                        <span className="flex-1">{suggestion.mainText}</span>
                        {selectedCode === suggestion.countryCode && (
                          <CheckCircle2 className="size-4 text-brand" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Reassurance text */}
          <p className="text-xs text-center text-muted-foreground">
            {t("changeAnytime")}
          </p>

          {/* Confirm button */}
          <Button
            className="w-full bg-brand text-brand-foreground hover:bg-brand/90 rounded-lg"
            onClick={handleConfirm}
            disabled={!selectedCode}
          >
            {locale === "he" ? "אישור מיקום" : "Confirm Location"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
