"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Doc } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  FlightFormFields,
  type FlightFormState,
  type FlightStop,
  type LuggageItem,
} from "./FlightFormFields";

interface FlightEditFormProps {
  flight: Doc<"flights">;
  onSuccess?: () => void;
  onCancel?: () => void;
}

/** Convert a Unix timestamp to a datetime-local string */
function tsToDatetimeLocal(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function flightToFormState(flight: Doc<"flights">): FlightFormState {
  return {
    departureCountry: flight.departureCountry,
    departureCity: flight.departureCity ?? "",
    departureAirport: flight.departureAirport ?? "",
    destination: flight.destination,
    destinationCity: flight.destinationCity ?? "",
    destinationAirport: flight.destinationAirport ?? "",
    departureDate: tsToDatetimeLocal(flight.departureDate),
    arrivalDate: flight.arrivalDate
      ? tsToDatetimeLocal(flight.arrivalDate)
      : "",
    seats: String(flight.seats),
    pricePerSeat: String(flight.pricePerSeat),
    currency: flight.currency,
    description: flight.description ?? "",
    whatsappNumber: flight.whatsappNumber ?? "",
    phoneNumber: flight.phoneNumber ?? "",
    checkedBagKg: flight.checkedBagKg != null ? String(flight.checkedBagKg) : "",
    carryOnAllowed: flight.carryOnAllowed ?? false,
    personalItemAllowed: flight.personalItemAllowed ?? false,
    luggage: flight.luggage
      ? flight.luggage.map((l) => ({
          type: l.type,
          weightKg: l.weightKg != null ? String(l.weightKg) : "",
        }))
      : [],
    isPackage: flight.isPackage ?? false,
    hotelIncluded: flight.hotelIncluded ?? "",
    transferIncluded: flight.transferIncluded ?? "",
    insuranceIncluded: flight.insuranceIncluded ?? "",
  };
}

function flightToStops(flight: Doc<"flights">): FlightStop[] {
  if (!flight.stops?.length) return [];
  return flight.stops.map((s) => ({
    country: s.country,
    city: s.city ?? "",
    durationMinutes: s.durationMinutes != null ? String(s.durationMinutes) : "",
  }));
}

export function FlightEditForm({
  flight,
  onSuccess,
  onCancel,
}: FlightEditFormProps) {
  const t = useTranslations("agent");
  const updateFlight = useMutation(
    api.modules.flights.mutations.updateFlight
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<FlightFormState>(() =>
    flightToFormState(flight)
  );
  const [stops, setStops] = useState<FlightStop[]>(() =>
    flightToStops(flight)
  );
  const [luggage, setLuggage] = useState<LuggageItem[]>(() => form.luggage);

  const updateField = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addStop = () => {
    setStops((prev) => [
      ...prev,
      { country: "", city: "", durationMinutes: "" },
    ]);
  };

  const removeStop = (index: number) => {
    setStops((prev) => prev.filter((_, i) => i !== index));
  };

  const updateStop = (
    index: number,
    field: keyof FlightStop,
    value: string
  ) => {
    setStops((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.departureCountry ||
      !form.destination ||
      !form.departureDate ||
      !form.seats ||
      !form.pricePerSeat
    )
      return;

    setIsSubmitting(true);
    try {
      await updateFlight({
        flightId: flight._id,
        departureCountry: form.departureCountry,
        departureCity: form.departureCity || undefined,
        departureAirport: form.departureAirport || undefined,
        destination: form.destination,
        destinationCity: form.destinationCity || undefined,
        destinationAirport: form.destinationAirport || undefined,
        departureDate: new Date(form.departureDate).getTime(),
        arrivalDate: form.arrivalDate
          ? new Date(form.arrivalDate).getTime()
          : undefined,
        seats: Number(form.seats),
        pricePerSeat: Number(form.pricePerSeat),
        currency: form.currency,
        description: form.description || undefined,
        whatsappNumber: form.whatsappNumber || undefined,
        phoneNumber: form.phoneNumber || undefined,
        checkedBagKg: form.checkedBagKg
          ? Number(form.checkedBagKg)
          : undefined,
        carryOnAllowed: form.carryOnAllowed || undefined,
        personalItemAllowed: form.personalItemAllowed || undefined,
        luggage:
          luggage.length > 0
            ? luggage
                .filter((l) => l.type)
                .map((l) => ({
                  type: l.type,
                  weightKg: l.weightKg ? Number(l.weightKg) : undefined,
                }))
            : undefined,
        stops:
          stops.length > 0
            ? stops.map((s) => ({
                country: s.country,
                city: s.city || undefined,
                durationMinutes: s.durationMinutes
                  ? Number(s.durationMinutes)
                  : undefined,
              }))
            : undefined,
        isPackage: form.isPackage || undefined,
        hotelIncluded: form.hotelIncluded || undefined,
        transferIncluded: form.transferIncluded || undefined,
        insuranceIncluded: form.insuranceIncluded || undefined,
      });

      toast.success(t("flightUpdated"));
      onSuccess?.();
    } catch (err) {
      console.error("Flight update error:", err);
      toast.error(t("flightUpdateError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <FlightFormFields
        form={form}
        stops={stops}
        updateField={updateField}
        addStop={addStop}
        removeStop={removeStop}
        updateStop={updateStop}
        luggage={luggage}
        addLuggage={() => setLuggage((prev) => [...prev, { type: "", weightKg: "" }])}
        removeLuggage={(i) => setLuggage((prev) => prev.filter((_, idx) => idx !== i))}
        updateLuggage={(i, field, value) =>
          setLuggage((prev) => prev.map((l, idx) => (idx === i ? { ...l, [field]: value } : l)))
        }
      />
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onCancel}
        >
          {t("cancelEdit")}
        </Button>
        <Button
          type="submit"
          className="flex-1"
          disabled={
            isSubmitting ||
            !form.departureCountry ||
            !form.destination ||
            !form.departureDate ||
            !form.seats ||
            !form.pricePerSeat
          }
        >
          {isSubmitting ? t("saving") : t("saveChanges")}
        </Button>
      </div>
    </form>
  );
}
