"use client";

import { useTranslations } from "next-intl";
import { useAppStore } from "@/stores/appStore";
import { CountryOnboardingModal } from "./CountryOnboardingModal";
import { CountryCombobox } from "@/shared/components/CountryCombobox";

export function CountrySelector() {
  const t = useTranslations("topbar");
  const { selectedCountry, hasCompletedOnboarding, setSelectedCountry } =
    useAppStore();

  return (
    <>
      {/* Show onboarding modal on first login */}
      {!hasCompletedOnboarding && <CountryOnboardingModal />}

      <CountryCombobox
        value={selectedCountry}
        onChange={(code) => { if (code) setSelectedCountry(code); }}
        placeholder={t("country")}
        aria-label={t("country")}
        size="sm"
      />
    </>
  );
}
