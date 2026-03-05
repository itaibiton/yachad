"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  FlightFormFields,
  createEmptyFlightForm,
  type FlightFormState,
  type FlightStop,
} from "./FlightFormFields";

interface FlightUploadFormProps {
  agentWhatsapp?: string;
  agentPhone?: string;
  onSuccess?: () => void;
}

export function FlightUploadForm({
  agentWhatsapp,
  agentPhone,
  onSuccess,
}: FlightUploadFormProps) {
  const t = useTranslations("agent");
  const createFlight = useMutation(api.modules.flights.mutations.createFlight);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<FlightFormState>(() =>
    createEmptyFlightForm(agentWhatsapp, agentPhone)
  );
  const [stops, setStops] = useState<FlightStop[]>([]);

  const updateField = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addStop = () => {
    setStops((prev) => [...prev, { country: "", city: "", durationMinutes: "" }]);
  };

  const removeStop = (index: number) => {
    setStops((prev) => prev.filter((_, i) => i !== index));
  };

  const updateStop = (index: number, field: keyof FlightStop, value: string) => {
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
      await createFlight({
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
        checkedBagKg: form.checkedBagKg ? Number(form.checkedBagKg) : undefined,
        carryOnAllowed: form.carryOnAllowed || undefined,
        personalItemAllowed: form.personalItemAllowed || undefined,
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

      toast.success(t("flightCreated"));
      onSuccess?.();
    } catch (err) {
      console.error("Flight creation error:", err);
      toast.error(t("flightCreateError"));
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
      />
      <Button
        type="submit"
        className="w-full"
        disabled={
          isSubmitting ||
          !form.departureCountry ||
          !form.destination ||
          !form.departureDate ||
          !form.seats ||
          !form.pricePerSeat
        }
      >
        {isSubmitting ? t("submitting") : t("submitFlight")}
      </Button>
    </form>
  );
}
