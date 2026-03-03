"use client";

import { useState, useEffect } from "react";
import { Loader2, MapPin, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
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
import { COUNTRIES, type Country } from "@/shared/data/countries";

interface IpApiResponse {
  country_code?: string;
  country?: string;
  error?: boolean;
}

export function CountryOnboardingModal() {
  const t = useTranslations("country");
  const tCommon = useTranslations("common");
  const { hasCompletedOnboarding, setSelectedCountry, completeOnboarding } =
    useAppStore();

  const [detectedCountry, setDetectedCountry] = useState<Country | null>(null);
  const [isDetecting, setIsDetecting] = useState(true);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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

        const country = COUNTRIES.find((c) => c.code === data.country_code);
        if (country) {
          setDetectedCountry(country);
          setSelectedCode(country.code);
        }
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

  const filteredCountries = COUNTRIES.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) || c.nameHe.includes(searchQuery)
    );
  });

  // Do not render if onboarding already complete
  if (hasCompletedOnboarding) return null;

  return (
    <Dialog
      open={!hasCompletedOnboarding}
      // Modal is NOT dismissable without selecting a country
      onOpenChange={() => {}}
    >
      <DialogContent
        className="sm:max-w-md rounded-xl"
        // Disable close on overlay click and Escape key
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        // Hide the default close button — country selection is required
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
          ) : detectedCountry ? (
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t("autoDetect")}
              </p>
              <button
                type="button"
                onClick={() => setSelectedCode(detectedCountry.code)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-start transition-all hover:border-brand",
                  selectedCode === detectedCountry.code
                    ? "border-brand bg-brand/5"
                    : "border-border bg-background"
                )}
              >
                <span className="text-2xl">{detectedCountry.flag}</span>
                <span className="flex-1 font-medium">{detectedCountry.name}</span>
                {selectedCode === detectedCountry.code && (
                  <CheckCircle2 className="size-5 text-brand" />
                )}
              </button>
            </div>
          ) : null}

          {/* Manual country selection */}
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {detectedCountry ? "Or choose manually" : "Select your country"}
            </p>
            <input
              type="search"
              placeholder={tCommon("search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Search countries"
            />
            <ScrollArea className="h-48 rounded-lg border">
              <div className="p-1">
                {filteredCountries.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    {tCommon("noResults")}
                  </p>
                ) : (
                  filteredCountries.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => setSelectedCode(country.code)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-md px-3 py-2 text-start text-sm transition-colors hover:bg-accent",
                        selectedCode === country.code &&
                          "bg-brand/10 font-medium text-brand"
                      )}
                    >
                      <span className="text-base">{country.flag}</span>
                      <span className="flex-1">{country.name}</span>
                      {selectedCode === country.code && (
                        <CheckCircle2 className="size-4 text-brand" />
                      )}
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
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
            Confirm Location
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
