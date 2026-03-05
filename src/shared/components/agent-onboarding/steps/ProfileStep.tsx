"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { Value } from "react-phone-number-input";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Button } from "@/components/ui/button";
import { CountryCombobox } from "@/shared/components/CountryCombobox";
import { useAgentOnboardingStore } from "@/stores/agentOnboardingStore";
import { cn } from "@/lib/utils";

export function ProfileStep() {
  const t = useTranslations("agent");
  const { profile, setProfile, goNext } = useAgentOnboardingStore();
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const markTouched = (field: string) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  // Single phone field sets both phone and whatsappNumber
  const isValid = profile.phone && profile.country;

  const fieldError = (field: string, value: string) =>
    touched[field] && !value;

  return (
    <div className="space-y-6">
      <div className="text-center mb-2">
        <h2 className="text-xl font-bold">{t("wizardStepProfile")}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t("profileSectionDesc")}
        </p>
      </div>

      <div className="space-y-4 rounded-xl border bg-card p-5">
        {/* Phone (also used as WhatsApp number) */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">
            {t("phone")} <span className="text-red-500">*</span>
          </label>
          <PhoneInput
            international
            defaultCountry="IL"
            value={(profile.phone || "") as Value}
            onChange={(val) => {
              const v = val?.toString() ?? "";
              setProfile({ phone: v, whatsappNumber: v });
            }}
            onBlur={() => markTouched("phone")}
            placeholder={t("phonePlaceholder")}
            className={cn(fieldError("phone", profile.phone) && "[&_input]:border-red-500")}
          />
          {fieldError("phone", profile.phone) && (
            <p className="text-xs text-red-500">{t("fieldRequired")}</p>
          )}
        </div>

        {/* Country */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">
            {t("country")} <span className="text-red-500">*</span>
          </label>
          <CountryCombobox
            value={profile.country || null}
            onChange={(code) => {
              setProfile({ country: code ?? "" });
              markTouched("country");
            }}
            placeholder={t("countryPlaceholder")}
            className="w-full"
          />
          {fieldError("country", profile.country) && (
            <p className="text-xs text-red-500">{t("fieldRequired")}</p>
          )}
        </div>

        {/* Company Name */}
        <div className="space-y-1.5">
          <label htmlFor="wiz-company" className="text-sm font-medium">
            {t("companyName")}
          </label>
          <Input
            id="wiz-company"
            placeholder={t("companyNamePlaceholder")}
            value={profile.companyName}
            onChange={(e) => setProfile({ companyName: e.target.value })}
          />
        </div>

        {/* Website */}
        <div className="space-y-1.5">
          <label htmlFor="wiz-website" className="text-sm font-medium">
            {t("website")}
          </label>
          <Input
            id="wiz-website"
            type="url"
            placeholder={t("websitePlaceholder")}
            value={profile.websiteUrl}
            onChange={(e) => setProfile({ websiteUrl: e.target.value })}
            dir="ltr"
          />
        </div>
      </div>

      <Button
        size="lg"
        className="w-full"
        disabled={!isValid}
        onClick={goNext}
      >
        {t("wizardNext")}
      </Button>
    </div>
  );
}
