"use client";

import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CountryCombobox } from "@/shared/components/CountryCombobox";
import { Plus, Trash2 } from "lucide-react";

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
  checkedBagKg: string;
  carryOnAllowed: boolean;
  personalItemAllowed: boolean;
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
    isPackage: false,
    hotelIncluded: "",
    transferIncluded: "",
    insuranceIncluded: "",
  };
}

const CURRENCIES = ["USD", "EUR", "ILS", "GBP", "CAD", "AUD"];

interface FlightFormFieldsProps {
  form: FlightFormState;
  stops: FlightStop[];
  updateField: (field: string, value: string | boolean) => void;
  addStop: () => void;
  removeStop: (index: number) => void;
  updateStop: (index: number, field: keyof FlightStop, value: string) => void;
}

export function FlightFormFields({
  form,
  stops,
  updateField,
  addStop,
  removeStop,
  updateStop,
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
              dir="ltr"
            />
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <label htmlFor="checkedBagKg" className="block text-sm font-medium">
              {t("checkedBagKg")}
            </label>
            <Input
              id="checkedBagKg"
              type="number"
              min={0}
              value={form.checkedBagKg}
              onChange={(e) => updateField("checkedBagKg", e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <div className="flex items-center gap-2 h-9">
              <input
                id="carryOnAllowed"
                type="checkbox"
                checked={form.carryOnAllowed}
                onChange={(e) => updateField("carryOnAllowed", e.target.checked)}
                className="size-4 rounded border-gray-300"
              />
              <label htmlFor="carryOnAllowed" className="block text-sm font-medium">
                {t("carryOnAllowed")}
              </label>
            </div>
          </div>
          <div className="flex items-end">
            <div className="flex items-center gap-2 h-9">
              <input
                id="personalItemAllowed"
                type="checkbox"
                checked={form.personalItemAllowed}
                onChange={(e) =>
                  updateField("personalItemAllowed", e.target.checked)
                }
                className="size-4 rounded border-gray-300"
              />
              <label htmlFor="personalItemAllowed" className="block text-sm font-medium">
                {t("personalItemAllowed")}
              </label>
            </div>
          </div>
        </div>
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

      {/* ---- Package Section ---- */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          {t("formPackage")}
        </legend>
        <div className="flex items-center gap-2">
          <input
            id="isPackage"
            type="checkbox"
            checked={form.isPackage}
            onChange={(e) => updateField("isPackage", e.target.checked)}
            className="size-4 rounded border-gray-300"
          />
          <label htmlFor="isPackage" className="block text-sm font-medium">
            {t("isPackage")}
          </label>
        </div>
        {form.isPackage && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label htmlFor="hotelIncluded" className="block text-sm font-medium">
                {t("hotelIncluded")}
              </label>
              <Input
                id="hotelIncluded"
                placeholder={t("hotelPlaceholder")}
                value={form.hotelIncluded}
                onChange={(e) => updateField("hotelIncluded", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="transferIncluded" className="block text-sm font-medium">
                {t("transferIncluded")}
              </label>
              <Input
                id="transferIncluded"
                placeholder={t("transferPlaceholder")}
                value={form.transferIncluded}
                onChange={(e) =>
                  updateField("transferIncluded", e.target.value)
                }
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="insuranceIncluded" className="block text-sm font-medium">
                {t("insuranceIncluded")}
              </label>
              <Input
                id="insuranceIncluded"
                placeholder={t("insurancePlaceholder")}
                value={form.insuranceIncluded}
                onChange={(e) =>
                  updateField("insuranceIncluded", e.target.value)
                }
              />
            </div>
          </div>
        )}
      </fieldset>

      {/* ---- Contact Section ---- */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          {t("formContact")}
        </legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="contactWhatsapp" className="block text-sm font-medium">
              {t("contactWhatsapp")}
            </label>
            <Input
              id="contactWhatsapp"
              type="tel"
              value={form.whatsappNumber}
              onChange={(e) => updateField("whatsappNumber", e.target.value)}
              dir="ltr"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="contactPhone" className="block text-sm font-medium">
              {t("contactPhone")}
            </label>
            <Input
              id="contactPhone"
              type="tel"
              value={form.phoneNumber}
              onChange={(e) => updateField("phoneNumber", e.target.value)}
              dir="ltr"
            />
          </div>
        </div>
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
