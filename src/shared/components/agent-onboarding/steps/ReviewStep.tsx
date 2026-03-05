"use client";

import { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { countryCodeToFlag } from "@/shared/data/countries";
import { useAgentOnboardingStore } from "@/stores/agentOnboardingStore";
import { toast } from "sonner";
import { Pencil, Calendar, Users } from "lucide-react";

export function ReviewStep() {
  const t = useTranslations("agent");
  const locale = useLocale();
  const { user } = useUser();
  const { profile, pendingFlights, setStep, goNext } =
    useAgentOnboardingStore();
  const registerWithFlights = useMutation(
    api.modules.users.mutations.registerAsAgentWithFlights
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const displayNames = useMemo(
    () => new Intl.DisplayNames([locale], { type: "region" }),
    [locale]
  );

  const countryName = profile.country
    ? displayNames.of(profile.country) ?? profile.country
    : "";
  const countryFlag = profile.country
    ? countryCodeToFlag(profile.country)
    : "";

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const flights = pendingFlights.map((pf) => ({
        departureCountry: pf.form.departureCountry,
        departureCity: pf.form.departureCity || undefined,
        departureAirport: pf.form.departureAirport || undefined,
        destination: pf.form.destination,
        destinationCity: pf.form.destinationCity || undefined,
        destinationAirport: pf.form.destinationAirport || undefined,
        departureDate: new Date(pf.form.departureDate).getTime(),
        arrivalDate: pf.form.arrivalDate
          ? new Date(pf.form.arrivalDate).getTime()
          : undefined,
        seats: Number(pf.form.seats),
        pricePerSeat: Number(pf.form.pricePerSeat),
        currency: pf.form.currency,
        description: pf.form.description || undefined,
        whatsappNumber: pf.form.whatsappNumber || undefined,
        phoneNumber: pf.form.phoneNumber || undefined,
        checkedBagKg: pf.form.checkedBagKg
          ? Number(pf.form.checkedBagKg)
          : undefined,
        carryOnAllowed: pf.form.carryOnAllowed || undefined,
        personalItemAllowed: pf.form.personalItemAllowed || undefined,
        luggage:
          pf.form.luggage && pf.form.luggage.length > 0
            ? pf.form.luggage
                .filter((l) => l.type)
                .map((l) => ({
                  type: l.type,
                  weightKg: l.weightKg ? Number(l.weightKg) : undefined,
                }))
            : undefined,
        stops:
          pf.stops.length > 0
            ? pf.stops.map((s) => ({
                country: s.country,
                city: s.city || undefined,
                durationMinutes: s.durationMinutes
                  ? Number(s.durationMinutes)
                  : undefined,
              }))
            : undefined,
        isPackage: pf.form.isPackage || undefined,
        hotelIncluded: pf.form.hotelIncluded || undefined,
        transferIncluded: pf.form.transferIncluded || undefined,
        insuranceIncluded: pf.form.insuranceIncluded || undefined,
      }));

      await registerWithFlights({
        phone: profile.phone,
        whatsappNumber: profile.whatsappNumber,
        country: profile.country,
        websiteUrl: profile.websiteUrl || undefined,
        companyName: profile.companyName || undefined,
        flights: flights.length > 0 ? flights : undefined,
      });

      await fetch("/api/register-agent", { method: "POST" });

      // Clear the onboarding-pending flag
      if (user) {
        await user.update({
          unsafeMetadata: { ...user.unsafeMetadata, agentOnboardingPending: false },
        });
      }

      goNext();
    } catch (err) {
      console.error("Agent registration error:", err);
      toast.error(t("registrationError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-2">
        <h2 className="text-xl font-bold">{t("wizardStepReview")}</h2>
      </div>

      {/* Profile summary */}
      <div className="rounded-xl border bg-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            {t("wizardProfileSummary")}
          </h3>
          <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
            <Pencil className="me-1 size-3" />
            {t("wizardEdit")}
          </Button>
        </div>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <dt className="text-muted-foreground">{t("phone")}</dt>
          <dd dir="ltr">{profile.phone}</dd>
          <dt className="text-muted-foreground">{t("whatsapp")}</dt>
          <dd dir="ltr">{profile.whatsappNumber}</dd>
          <dt className="text-muted-foreground">{t("country")}</dt>
          <dd>
            {countryFlag} {countryName}
          </dd>
          {profile.companyName && (
            <>
              <dt className="text-muted-foreground">{t("companyName")}</dt>
              <dd>{profile.companyName}</dd>
            </>
          )}
          {profile.websiteUrl && (
            <>
              <dt className="text-muted-foreground">{t("website")}</dt>
              <dd dir="ltr" className="truncate">{profile.websiteUrl}</dd>
            </>
          )}
        </dl>
      </div>

      {/* Flights summary */}
      <div className="rounded-xl border bg-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            {t("wizardFlightsSummary")}
          </h3>
          <Button variant="ghost" size="sm" onClick={() => setStep(2)}>
            <Pencil className="me-1 size-3" />
            {t("wizardEdit")}
          </Button>
        </div>
        {pendingFlights.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">{t("wizardNoFlightsYet")}</p>
            <button
              type="button"
              className="text-sm text-brand hover:underline mt-1"
              onClick={() => setStep(2)}
            >
              {t("wizardGoBackToAdd")}
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {pendingFlights.map((pf, i) => {
              const depFlag = countryCodeToFlag(pf.form.departureCountry);
              const destFlag = countryCodeToFlag(pf.form.destination);
              const date = new Date(pf.form.departureDate).toLocaleDateString(
                locale === "he" ? "he-IL" : "en-US",
                { month: "short", day: "numeric" }
              );
              return (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span>
                    {depFlag} → {destFlag}
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="size-3" />
                    {date}
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Users className="size-3" />
                    {pf.form.seats}
                  </span>
                  <span className="text-muted-foreground">
                    {pf.form.currency} {pf.form.pricePerSeat}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Button
        size="lg"
        className="w-full"
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? t("wizardCreating") : t("wizardCreateAccount")}
      </Button>
    </div>
  );
}
