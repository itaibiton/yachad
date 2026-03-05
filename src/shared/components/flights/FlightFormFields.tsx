"use client";

import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CountryCombobox } from "@/shared/components/CountryCombobox";
import { Plus, Trash2 } from "lucide-react";

export interface LuggageItem {
  type: string;
  weightKg: string;
}

export interface FlightFormState {
  departureCountry: string;
  departureCity: string;
  departureAirport: string;
  destination: string;
  destinationCity: string;
  destinationAirport: string;
  departureDate: string;
  arrivalDate: string;
  seats: string;
  pricePerSeat: string;
  currency: string;
  description: string;
  whatsappNumber: string;
  phoneNumber: string;
  // Legacy luggage fields (kept for backward compat)
  checkedBagKg: string;
  carryOnAllowed: boolean;
  personalItemAllowed: boolean;
  // New structured luggage
  luggage: LuggageItem[];
  // Package fields kept in interface for backward compat but removed from UI
  isPackage: boolean;
  hotelIncluded: string;
  transferIncluded: string;
  insuranceIncluded: string;
}

export interface FlightStop {
  country: string;
  city: string;
  durationMinutes: string;
}

export function createEmptyFlightForm(
  agentWhatsapp?: string,
  agentPhone?: string
): FlightFormState {
  return {
    departureCountry: "",
    departureCity: "",
    departureAirport: "",
    destination: "",
    destinationCity: "",
    destinationAirport: "",
    departureDate: "",
    arrivalDate: "",
    seats: "",
    pricePerSeat: "",
    currency: "USD",
    description: "",
    whatsappNumber: agentWhatsapp ?? "",
    phoneNumber: agentPhone ?? "",
    checkedBagKg: "",
    carryOnAllowed: false,
    personalItemAllowed: false,
    luggage: [],
    isPackage: false,
    hotelIncluded: "",
    transferIncluded: "",
    insuranceIncluded: "",
  };
}

const CURRENCIES = ["USD", "EUR", "ILS", "GBP", "CAD", "AUD"];

const LUGGAGE_TYPES = [
  "Checked Bag",
  "Carry-on",
  "Personal Item",
  "Oversize Bag",
  "Sports Equipment",
  "Other",
];

interface FlightFormFieldsProps {
  form: FlightFormState;
  stops: FlightStop[];
  updateField: (field: string, value: string | boolean) => void;
  addStop: () => void;
  removeStop: (index: number) => void;
  updateStop: (index: number, field: keyof FlightStop, value: string) => void;
  luggage: LuggageItem[];
  addLuggage: () => void;
  removeLuggage: (index: number) => void;
  updateLuggage: (index: number, field: keyof LuggageItem, value: string) => void;
}

export function FlightFormFields({
  form,
  stops,
  updateField,
  addStop,
  removeStop,
  updateStop,
  luggage,
  addLuggage,
  removeLuggage,
  updateLuggage,
}: FlightFormFieldsProps) {
  const t = useTranslations("agent");

  return (
    <div className="space-y-8">
      {/* ---- Route Section ---- */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          {t("formRoute")}
        </legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Departure Country */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">
              {t("departureCountry")} <span className="text-red-500">*</span>
            </label>
            <CountryCombobox
              value={form.departureCountry || null}
              onChange={(code) =>
                updateField("departureCountry", code ?? "")
              }
              placeholder={t("departureCountry")}
              className="w-full"
            />
          </div>

          {/* Destination Country */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">
              {t("destinationCountry")} <span className="text-red-500">*</span>
            </label>
            <CountryCombobox
              value={form.destination || null}
              onChange={(code) => updateField("destination", code ?? "")}
              placeholder={t("destinationCountry")}
              className="w-full"
            />
          </div>

          {/* Departure City */}
          <div className="space-y-1.5">
            <label htmlFor="departureCity" className="block text-sm font-medium">
              {t("departureCity")}
            </label>
            <Input
              id="departureCity"
              value={form.departureCity}
              onChange={(e) => updateField("departureCity", e.target.value)}
            />
          </div>

          {/* Destination City */}
          <div className="space-y-1.5">
            <label htmlFor="destinationCity" className="block text-sm font-medium">
              {t("destinationCity")}
            </label>
            <Input
              id="destinationCity"
              value={form.destinationCity}
              onChange={(e) => updateField("destinationCity", e.target.value)}
            />
          </div>

          {/* Departure Airport */}
          <div className="space-y-1.5">
            <label htmlFor="departureAirport" className="block text-sm font-medium">
              {t("departureAirport")}
            </label>
            <Input
              id="departureAirport"
              placeholder="TLV"
              value={form.departureAirport}
              onChange={(e) =>
                updateField("departureAirport", e.target.value.toUpperCase())
              }
              maxLength={4}
              dir="ltr"
            />
          </div>

          {/* Destination Airport */}
          <div className="space-y-1.5">
            <label htmlFor="destinationAirport" className="block text-sm font-medium">
              {t("destinationAirport")}
            </label>
            <Input
              id="destinationAirport"
              placeholder="JFK"
              value={form.destinationAirport}
              onChange={(e) =>
                updateField("destinationAirport", e.target.value.toUpperCase())
              }
              maxLength={4}
              dir="ltr"
            />
          </div>
        </div>
      </fieldset>

      {/* ---- Schedule Section ---- */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          {t("formSchedule")}
        </legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="departureDate" className="block text-sm font-medium">
              {t("departureDate")} <span className="text-red-500">*</span>
            </label>
            <Input
              id="departureDate"
              type="datetime-local"
              value={form.departureDate}
              onChange={(e) => updateField("departureDate", e.target.value)}
              required
              dir="ltr"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="arrivalDate" className="block text-sm font-medium">
              {t("arrivalDate")}
            </label>
            <Input
              id="arrivalDate"
              type="datetime-local"
              value={form.arrivalDate}
              onChange={(e) => updateField("arrivalDate", e.target.value)}
              min={form.departureDate || undefined}
              dir="ltr"
            />
            {form.arrivalDate && form.departureDate && form.arrivalDate < form.departureDate && (
              <p className="text-xs text-red-500">{t("arrivalBeforeDeparture")}</p>
            )}
          </div>
        </div>
      </fieldset>

      {/* ---- Pricing Section ---- */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          {t("formPricing")}
        </legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <label htmlFor="seats" className="block text-sm font-medium">
              {t("seats")} <span className="text-red-500">*</span>
            </label>
            <Input
              id="seats"
              type="number"
              min={1}
              value={form.seats}
              onChange={(e) => updateField("seats", e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="pricePerSeat" className="block text-sm font-medium">
              {t("pricePerSeat")} <span className="text-red-500">*</span>
            </label>
            <Input
              id="pricePerSeat"
              type="number"
              min={0}
              value={form.pricePerSeat}
              onChange={(e) => updateField("pricePerSeat", e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="currency" className="block text-sm font-medium">
              {t("currency")}
            </label>
            <select
              id="currency"
              value={form.currency}
              onChange={(e) => updateField("currency", e.target.value)}
              dir="ltr"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </fieldset>

      {/* ---- Luggage Section ---- */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          {t("formLuggage")}
        </legend>
        {luggage.map((item, index) => (
          <div key={index} className="flex items-end gap-3">
            <div className="flex-1 space-y-1.5">
              <label className="block text-sm font-medium">{t("luggageType")}</label>
              <select
                value={item.type}
                onChange={(e) => updateLuggage(index, "type", e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">{t("selectLuggageType")}</option>
                {LUGGAGE_TYPES.map((lt) => (
                  <option key={lt} value={lt}>
                    {t(`luggageType_${lt.replace(/\s+/g, "")}`)}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-28 space-y-1.5">
              <label className="block text-sm font-medium">{t("luggageWeight")}</label>
              <Input
                type="number"
                min={0}
                placeholder="kg"
                value={item.weightKg}
                onChange={(e) => updateLuggage(index, "weightKg", e.target.value)}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeLuggage(index)}
              className="shrink-0"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addLuggage}>
          <Plus className="me-1 size-4" />
          {t("addLuggage")}
        </Button>
      </fieldset>

      {/* ---- Stops Section ---- */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          {t("formStops")}
        </legend>
        {stops.map((stop, index) => (
          <div key={index} className="flex items-end gap-3">
            <div className="flex-1 space-y-1.5">
              <label className="block text-sm font-medium">{t("stopCountry")}</label>
              <CountryCombobox
                value={stop.country || null}
                onChange={(code) =>
                  updateStop(index, "country", code ?? "")
                }
                placeholder={t("stopCountry")}
                className="w-full"
              />
            </div>
            <div className="flex-1 space-y-1.5">
              <label className="block text-sm font-medium">{t("stopCity")}</label>
              <Input
                value={stop.city}
                onChange={(e) => updateStop(index, "city", e.target.value)}
              />
            </div>
            <div className="w-24 space-y-1.5">
              <label className="block text-sm font-medium">{t("stopDuration")}</label>
              <Input
                type="number"
                min={0}
                value={stop.durationMinutes}
                onChange={(e) =>
                  updateStop(index, "durationMinutes", e.target.value)
                }
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeStop(index)}
              className="shrink-0"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addStop}>
          <Plus className="me-1 size-4" />
          {t("addStop")}
        </Button>
      </fieldset>

      {/* ---- Description ---- */}
      <div className="space-y-1.5">
        <label htmlFor="description" className="block text-sm font-medium">
          {t("description")}
        </label>
        <textarea
          id="description"
          placeholder={t("descriptionPlaceholder")}
          value={form.description}
          onChange={(e) => updateField("description", e.target.value)}
          rows={3}
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>
    </div>
  );
}
