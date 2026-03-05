"use client";

import { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "@/i18n/routing";
import { api } from "../../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CountryCombobox } from "@/shared/components/CountryCombobox";
import {
  FlightFormFields,
  createEmptyFlightForm,
  type FlightFormState,
  type FlightStop,
} from "@/shared/components/flights/FlightFormFields";
import { countryCodeToFlag } from "@/shared/data/countries";
import {
  Plane,
  CheckCircle2,
  Plus,
  Trash2,
  Calendar,
  Users,
  User,
} from "lucide-react";
import { toast } from "sonner";

interface PendingFlight {
  form: FlightFormState;
  stops: FlightStop[];
}

export default function AgentOnboardingPage() {
  const t = useTranslations("agent");
  const locale = useLocale();
  const router = useRouter();
  const { user } = useUser();
  const registerWithFlights = useMutation(
    api.modules.users.mutations.registerAsAgentWithFlights
  );

  const displayNames = useMemo(
    () => new Intl.DisplayNames([locale], { type: "region" }),
    [locale]
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [flightCount, setFlightCount] = useState(0);

  // Profile form
  const [profile, setProfile] = useState({
    phone: "",
    whatsappNumber: "",
    country: "",
    websiteUrl: "",
    companyName: "",
  });

  // Flight collection
  const [pendingFlights, setPendingFlights] = useState<PendingFlight[]>([]);
  const [showFlightSheet, setShowFlightSheet] = useState(false);
  const [editingFlightForm, setEditingFlightForm] = useState<FlightFormState>(
    () => createEmptyFlightForm()
  );
  const [editingFlightStops, setEditingFlightStops] = useState<FlightStop[]>(
    []
  );

  // Already an agent → redirect
  const isAlreadyAgent = user?.publicMetadata?.role === "agent";

  if (isAlreadyAgent) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <CheckCircle2 className="size-12 text-green-500" />
        <h1 className="text-xl font-bold">{t("alreadyAgent")}</h1>
        <Button onClick={() => router.push("/agent")}>{t("goToPortal")}</Button>
      </div>
    );
  }

  // Success screen
  if (isRegistered) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <CheckCircle2 className="size-12 text-green-500" />
        <h1 className="text-xl font-bold">{t("registrationSuccess")}</h1>
        {flightCount > 0 && (
          <p className="text-sm text-muted-foreground">
            {t("registerWithFlights", { count: flightCount })}
          </p>
        )}
        <Button onClick={() => router.push("/agent")}>{t("goToPortal")}</Button>
      </div>
    );
  }

  const updateProfile = (field: keyof typeof profile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  // Flight form helpers
  const updateFlightField = (field: string, value: string | boolean) => {
    setEditingFlightForm((prev) => ({ ...prev, [field]: value }));
  };

  const addFlightStop = () => {
    setEditingFlightStops((prev) => [
      ...prev,
      { country: "", city: "", durationMinutes: "" },
    ]);
  };

  const removeFlightStop = (index: number) => {
    setEditingFlightStops((prev) => prev.filter((_, i) => i !== index));
  };

  const updateFlightStop = (
    index: number,
    field: keyof FlightStop,
    value: string
  ) => {
    setEditingFlightStops((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  };

  const handleAddFlight = () => {
    const f = editingFlightForm;
    if (
      !f.departureCountry ||
      !f.destination ||
      !f.departureDate ||
      !f.seats ||
      !f.pricePerSeat
    ) {
      return;
    }
    setPendingFlights((prev) => [
      ...prev,
      { form: { ...f }, stops: [...editingFlightStops] },
    ]);
    // Reset form for next flight
    setEditingFlightForm(createEmptyFlightForm());
    setEditingFlightStops([]);
    setShowFlightSheet(false);
  };

  const removePendingFlight = (index: number) => {
    setPendingFlights((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.phone || !profile.whatsappNumber || !profile.country) return;

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

      // Update Clerk metadata
      await fetch("/api/register-agent", { method: "POST" });

      setFlightCount(flights.length);
      toast.success(t("registrationSuccess"));
      setIsRegistered(true);
    } catch (err) {
      console.error("Agent registration error:", err);
      toast.error(t("registrationError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const canAddFlight =
    editingFlightForm.departureCountry &&
    editingFlightForm.destination &&
    editingFlightForm.departureDate &&
    editingFlightForm.seats &&
    editingFlightForm.pricePerSeat;

  return (
    <div className="mx-auto max-w-2xl py-10 px-4">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-xl bg-brand/10">
          <Plane className="size-7 text-brand" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t("onboardingTitle")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("onboardingSubtitle")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* ================================================ */}
        {/* Section A — Agent Profile                        */}
        {/* ================================================ */}
        <section className="space-y-5">
          <div className="flex items-center gap-2">
            <User className="size-5 text-brand" />
            <div>
              <h2 className="text-lg font-semibold">{t("profileSection")}</h2>
              <p className="text-xs text-muted-foreground">
                {t("profileSectionDesc")}
              </p>
            </div>
          </div>

          <div className="space-y-4 rounded-xl border bg-card p-5">
            {/* Phone */}
            <div className="space-y-1.5">
              <label htmlFor="phone" className="text-sm font-medium">
                {t("phone")} <span className="text-red-500">*</span>
              </label>
              <Input
                id="phone"
                type="tel"
                placeholder={t("phonePlaceholder")}
                value={profile.phone}
                onChange={(e) => updateProfile("phone", e.target.value)}
                required
                dir="ltr"
              />
            </div>

            {/* WhatsApp */}
            <div className="space-y-1.5">
              <label htmlFor="whatsapp" className="text-sm font-medium">
                {t("whatsapp")} <span className="text-red-500">*</span>
              </label>
              <Input
                id="whatsapp"
                type="tel"
                placeholder={t("whatsappPlaceholder")}
                value={profile.whatsappNumber}
                onChange={(e) =>
                  updateProfile("whatsappNumber", e.target.value)
                }
                required
                dir="ltr"
              />
            </div>

            {/* Country */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                {t("country")} <span className="text-red-500">*</span>
              </label>
              <CountryCombobox
                value={profile.country || null}
                onChange={(code) =>
                  updateProfile("country", code ?? "")
                }
                placeholder={t("countryPlaceholder")}
                className="w-full"
              />
            </div>

            {/* Company Name */}
            <div className="space-y-1.5">
              <label htmlFor="companyName" className="text-sm font-medium">
                {t("companyName")}
              </label>
              <Input
                id="companyName"
                placeholder={t("companyNamePlaceholder")}
                value={profile.companyName}
                onChange={(e) => updateProfile("companyName", e.target.value)}
              />
            </div>

            {/* Website */}
            <div className="space-y-1.5">
              <label htmlFor="website" className="text-sm font-medium">
                {t("website")}
              </label>
              <Input
                id="website"
                type="url"
                placeholder={t("websitePlaceholder")}
                value={profile.websiteUrl}
                onChange={(e) => updateProfile("websiteUrl", e.target.value)}
                dir="ltr"
              />
            </div>
          </div>
        </section>

        {/* ================================================ */}
        {/* Section B — Upload Flights (optional)            */}
        {/* ================================================ */}
        <section className="space-y-5">
          <div className="flex items-center gap-2">
            <Plane className="size-5 text-brand" />
            <div>
              <h2 className="text-lg font-semibold">{t("flightsSection")}</h2>
              <p className="text-xs text-muted-foreground">
                {t("flightsSectionDesc")}
              </p>
            </div>
          </div>

          {/* Pending flight cards */}
          {pendingFlights.length > 0 && (
            <div className="space-y-3">
              {pendingFlights.map((pf, index) => {
                const depFlag = countryCodeToFlag(pf.form.departureCountry);
                const destFlag = countryCodeToFlag(pf.form.destination);
                const depName =
                  displayNames.of(pf.form.departureCountry) ??
                  pf.form.departureCountry;
                const destName =
                  displayNames.of(pf.form.destination) ?? pf.form.destination;
                const date = new Date(pf.form.departureDate).toLocaleDateString(
                  locale === "he" ? "he-IL" : "en-US",
                  { month: "short", day: "numeric", year: "numeric" }
                );

                return (
                  <div
                    key={index}
                    className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div className="flex items-center gap-1.5 text-lg">
                        <span>{depFlag}</span>
                        <span className="text-muted-foreground">→</span>
                        <span>{destFlag}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {depName} → {destName}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3" />
                            {date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="size-3" />
                            {pf.form.seats}
                          </span>
                          <span>
                            {pf.form.currency} {pf.form.pricePerSeat}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removePendingFlight(index)}
                    >
                      <Trash2 className="me-1 size-3.5" />
                      {t("removeFlight")}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add Flight button */}
          {pendingFlights.length < 10 && (
            <Button
              type="button"
              variant="outline"
              className="w-full border-dashed"
              onClick={() => setShowFlightSheet(true)}
            >
              <Plus className="me-1.5 size-4" />
              {pendingFlights.length === 0
                ? t("addFirstFlight")
                : t("addAnotherFlight")}
            </Button>
          )}
        </section>

        {/* ================================================ */}
        {/* Submit                                           */}
        {/* ================================================ */}
        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={
            isSubmitting ||
            !profile.phone ||
            !profile.whatsappNumber ||
            !profile.country
          }
        >
          {isSubmitting
            ? t("registering")
            : pendingFlights.length > 0
              ? t("registerWithFlights", { count: pendingFlights.length })
              : t("registerButton")}
        </Button>
      </form>

      {/* ================================================ */}
      {/* Flight form sheet                                */}
      {/* ================================================ */}
      <Sheet open={showFlightSheet} onOpenChange={setShowFlightSheet}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-xl overflow-y-auto"
        >
          <SheetHeader>
            <SheetTitle>{t("addFirstFlight")}</SheetTitle>
            <SheetDescription>{t("flightsSectionDesc")}</SheetDescription>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-8rem)] px-1">
            <div className="py-4 space-y-6">
              <FlightFormFields
                form={editingFlightForm}
                stops={editingFlightStops}
                updateField={updateFlightField}
                addStop={addFlightStop}
                removeStop={removeFlightStop}
                updateStop={updateFlightStop}
              />
              <Button
                type="button"
                className="w-full"
                disabled={!canAddFlight}
                onClick={handleAddFlight}
              >
                <Plus className="me-1.5 size-4" />
                {t("addFirstFlight")}
              </Button>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}
