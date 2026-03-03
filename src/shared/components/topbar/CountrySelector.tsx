"use client";

import { MapPin, ChevronDown, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppStore } from "@/stores/appStore";
import { COUNTRIES, getCountryByCode } from "@/shared/data/countries";
import { CountryOnboardingModal } from "./CountryOnboardingModal";

export function CountrySelector() {
  const t = useTranslations("topbar");
  const { selectedCountry, hasCompletedOnboarding, setSelectedCountry } =
    useAppStore();

  const current = selectedCountry ? getCountryByCode(selectedCountry) : null;

  return (
    <>
      {/* Show onboarding modal on first login */}
      {!hasCompletedOnboarding && <CountryOnboardingModal />}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1.5 rounded-lg px-2 text-sm font-medium"
            aria-label={t("country")}
          >
            {current ? (
              <>
                <span className="text-base leading-none" aria-hidden="true">
                  {current.flag}
                </span>
                <span className="hidden sm:inline">{current.name}</span>
              </>
            ) : (
              <>
                <MapPin className="size-4" aria-hidden="true" />
                <span className="hidden sm:inline">{t("country")}</span>
              </>
            )}
            <ChevronDown className="size-3 opacity-60" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 rounded-xl p-1">
          <ScrollArea className="h-72">
            {COUNTRIES.map((country) => (
              <DropdownMenuItem
                key={country.code}
                onClick={() => setSelectedCountry(country.code)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm"
              >
                <span className="text-base" aria-hidden="true">
                  {country.flag}
                </span>
                <span className="flex-1">{country.name}</span>
                {selectedCountry === country.code && (
                  <Check className="size-4 text-brand" />
                )}
              </DropdownMenuItem>
            ))}
          </ScrollArea>
          <DropdownMenuSeparator />
          <div className="px-3 py-1.5 text-xs text-muted-foreground">
            {/* Location determines feed, chat, news, map */}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
