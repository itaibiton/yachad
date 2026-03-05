"use client";

import { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  FlightFormFields,
  createEmptyFlightForm,
  type FlightFormState,
  type FlightStop,
  type LuggageItem,
} from "@/shared/components/flights/FlightFormFields";
import { countryCodeToFlag } from "@/shared/data/countries";
import { useAgentOnboardingStore } from "@/stores/agentOnboardingStore";
import { Plus, Trash2, Calendar, Users } from "lucide-react";

export function FlightStep() {
  const t = useTranslations("agent");
  const locale = useLocale();
  const { pendingFlights, addFlight, removeFlight, goNext } =
    useAgentOnboardingStore();

  const displayNames = useMemo(
    () => new Intl.DisplayNames([locale], { type: "region" }),
    [locale]
  );

  // Local form state for the in-progress flight
  const [form, setForm] = useState<FlightFormState>(() =>
    createEmptyFlightForm()
  );
  const [stops, setStops] = useState<FlightStop[]>([]);
  const [luggage, setLuggage] = useState<LuggageItem[]>([]);
  const [showForm, setShowForm] = useState(pendingFlights.length === 0);

  const updateField = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleAddStop = () =>
    setStops((prev) => [...prev, { country: "", city: "", durationMinutes: "" }]);

  const handleRemoveStop = (index: number) =>
    setStops((prev) => prev.filter((_, i) => i !== index));

  const handleUpdateStop = (
    index: number,
    field: keyof FlightStop,
    value: string
  ) =>
    setStops((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );

  const handleAddLuggage = () =>
    setLuggage((prev) => [...prev, { type: "", weightKg: "" }]);

  const handleRemoveLuggage = (index: number) =>
    setLuggage((prev) => prev.filter((_, i) => i !== index));

  const handleUpdateLuggage = (
    index: number,
    field: keyof LuggageItem,
    value: string
  ) =>
    setLuggage((prev) =>
      prev.map((l, i) => (i === index ? { ...l, [field]: value } : l))
    );

  const hasArrivalError =
    form.arrivalDate && form.departureDate && form.arrivalDate < form.departureDate;

  const canAdd =
    form.departureCountry &&
    form.destination &&
    form.departureDate &&
    form.seats &&
    form.pricePerSeat &&
    !hasArrivalError;

  const handleAdd = () => {
    if (!canAdd) return;
    addFlight({
      form: { ...form, luggage: [...luggage] },
      stops: [...stops],
    });
    setForm(createEmptyFlightForm());
    setStops([]);
    setLuggage([]);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-2">
        <h2 className="text-xl font-bold">{t("wizardStepFlight")}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t("wizardFlightEncourage")}
        </p>
      </div>

      {/* Added flights */}
      {pendingFlights.length > 0 && (
        <div className="space-y-3">
          {pendingFlights.map((pf, index) => {
            const depFlag = countryCodeToFlag(pf.form.departureCountry);
            const destFlag = countryCodeToFlag(pf.form.destination);
            const depName =
              displayNames.of(pf.form.departureCountry) ?? pf.form.departureCountry;
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
                  onClick={() => removeFlight(index)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Flight form */}
      {showForm ? (
        <div className="space-y-6 rounded-xl border bg-card p-5">
          <FlightFormFields
            form={form}
            stops={stops}
            updateField={updateField}
            addStop={handleAddStop}
            removeStop={handleRemoveStop}
            updateStop={handleUpdateStop}
            luggage={luggage}
            addLuggage={handleAddLuggage}
            removeLuggage={handleRemoveLuggage}
            updateLuggage={handleUpdateLuggage}
          />
          <div className="flex gap-3">
            <Button
              type="button"
              className="flex-1"
              disabled={!canAdd}
              onClick={handleAdd}
            >
              <Plus className="me-1.5 size-4" />
              {t("wizardAddFlight")}
            </Button>
            {pendingFlights.length > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                {t("cancelEdit")}
              </Button>
            )}
          </div>
        </div>
      ) : (
        pendingFlights.length < 10 && (
          <Button
            type="button"
            variant="outline"
            className="w-full border-dashed"
            onClick={() => setShowForm(true)}
          >
            <Plus className="me-1.5 size-4" />
            {t("addAnotherFlight")}
          </Button>
        )
      )}

      {/* Navigation */}
      <div className="space-y-3 pt-2">
        <Button size="lg" className="w-full" onClick={goNext}>
          {t("wizardNext")}
        </Button>
        {pendingFlights.length === 0 && !showForm && (
          <button
            type="button"
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
            onClick={goNext}
          >
            {t("wizardSkip")}
          </button>
        )}
      </div>
    </div>
  );
}
