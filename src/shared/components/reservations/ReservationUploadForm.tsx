"use client";

import { useState, useRef, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useMutation } from "convex/react";
import { X, Upload, ImagePlus, MapPin, Loader2 } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PhoneInput } from "@/components/ui/phone-input";
import { useGooglePlaces } from "@/shared/hooks/useGooglePlaces";
import { toast } from "sonner";
import type { Id } from "../../../../convex/_generated/dataModel";

interface ReservationUploadFormProps {
  onSuccess?: () => void;
}

const ROOM_TYPES = [
  "Single",
  "Double",
  "Twin",
  "Suite",
  "Family",
  "Studio",
  "Deluxe",
  "Other",
];

const CURRENCIES = ["USD", "EUR", "ILS", "GBP"];

export function ReservationUploadForm({
  onSuccess,
}: ReservationUploadFormProps) {
  const t = useTranslations("reservations");
  const createReservation = useMutation(
    api.modules.reservations.mutations.createReservation
  );
  const generateUploadUrl = useMutation(
    api.modules.storage.mutations.generateUploadUrl
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    hotelName: "",
    country: "",
    city: "",
    checkIn: "",
    checkOut: "",
    roomType: "",
    numberOfRooms: "",
    numberOfGuests: "",
    originalPrice: "",
    askingPrice: "",
    currency: "USD",
    cancellationPolicy: "none" as "full" | "partial" | "none",
    contactWhatsapp: "",
    contactEmail: "",
    description: "",
  });

  const [images, setImages] = useState<
    { file: File; preview: string; storageId?: Id<"_storage"> }[]
  >([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (images.length + files.length > 5) {
      toast.error(t("maxImages"));
      return;
    }

    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newImages]);
    setUploading(true);

    try {
      const uploaded = await Promise.all(
        files.map(async (file) => {
          const uploadUrl = await generateUploadUrl();
          const result = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": file.type },
            body: file,
          });
          const { storageId } = await result.json();
          return storageId as Id<"_storage">;
        })
      );

      setImages((prev) =>
        prev.map((img) => {
          const idx = files.indexOf(img.file);
          if (idx >= 0 && !img.storageId) {
            return { ...img, storageId: uploaded[idx] };
          }
          return img;
        })
      );
    } catch {
      toast.error(t("uploadError"));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const removed = prev[index];
      URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.hotelName ||
      !form.country ||
      !form.city ||
      !form.checkIn ||
      !form.checkOut ||
      !form.originalPrice ||
      !form.askingPrice
    )
      return;

    setIsSubmitting(true);
    try {
      const imageStorageIds = images
        .map((img) => img.storageId)
        .filter((id): id is Id<"_storage"> => !!id);

      await createReservation({
        hotelName: form.hotelName,
        country: form.country,
        city: form.city,
        checkIn: new Date(form.checkIn).getTime(),
        checkOut: new Date(form.checkOut).getTime(),
        roomType: form.roomType || undefined,
        numberOfRooms: form.numberOfRooms
          ? Number(form.numberOfRooms)
          : undefined,
        numberOfGuests: form.numberOfGuests
          ? Number(form.numberOfGuests)
          : undefined,
        originalPrice: Number(form.originalPrice),
        askingPrice: Number(form.askingPrice),
        currency: form.currency,
        cancellationPolicy: form.cancellationPolicy,
        contactWhatsapp: form.contactWhatsapp || undefined,
        contactEmail: form.contactEmail || undefined,
        description: form.description || undefined,
        imageStorageIds: imageStorageIds.length > 0 ? imageStorageIds : undefined,
      });

      toast.success(t("listingCreated"));
      onSuccess?.();
    } catch (err) {
      console.error("Reservation creation error:", err);
      toast.error(t("listingCreateError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Hotel Details */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-foreground">
          {t("formHotelDetails")}
        </legend>
        <div className="space-y-2">
          <Label htmlFor="hotelName">{t("hotelName")} *</Label>
          <Input
            id="hotelName"
            value={form.hotelName}
            onChange={(e) => updateField("hotelName", e.target.value)}
            placeholder={t("hotelNamePlaceholder")}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>{t("country")} *</Label>
            <CountryCombobox
              value={form.country || null}
              onChange={(code) => updateField("country", code ?? "")}
              placeholder={t("selectCountry")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">{t("city")} *</Label>
            <Input
              id="city"
              value={form.city}
              onChange={(e) => updateField("city", e.target.value)}
              required
            />
          </div>
        </div>
      </fieldset>

      {/* Dates & Room */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-foreground">
          {t("formDatesRoom")}
        </legend>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="checkIn">{t("checkIn")} *</Label>
            <Input
              id="checkIn"
              type="date"
              value={form.checkIn}
              onChange={(e) => updateField("checkIn", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="checkOut">{t("checkOut")} *</Label>
            <Input
              id="checkOut"
              type="date"
              value={form.checkOut}
              onChange={(e) => updateField("checkOut", e.target.value)}
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-2">
            <Label htmlFor="roomType">{t("roomType")}</Label>
            <select
              id="roomType"
              value={form.roomType}
              onChange={(e) => updateField("roomType", e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">{t("selectRoomType")}</option>
              {ROOM_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="numberOfRooms">{t("numberOfRooms")}</Label>
            <Input
              id="numberOfRooms"
              type="number"
              min="1"
              value={form.numberOfRooms}
              onChange={(e) => updateField("numberOfRooms", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="numberOfGuests">{t("numberOfGuests")}</Label>
            <Input
              id="numberOfGuests"
              type="number"
              min="1"
              value={form.numberOfGuests}
              onChange={(e) => updateField("numberOfGuests", e.target.value)}
            />
          </div>
        </div>
      </fieldset>

      {/* Pricing */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-foreground">
          {t("formPricing")}
        </legend>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-2">
            <Label htmlFor="originalPrice">{t("originalPrice")} *</Label>
            <Input
              id="originalPrice"
              type="number"
              min="0"
              value={form.originalPrice}
              onChange={(e) => updateField("originalPrice", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="askingPrice">{t("askingPrice")} *</Label>
            <Input
              id="askingPrice"
              type="number"
              min="0"
              value={form.askingPrice}
              onChange={(e) => updateField("askingPrice", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">{t("currency")}</Label>
            <select
              id="currency"
              value={form.currency}
              onChange={(e) => updateField("currency", e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="cancellationPolicy">
            {t("cancellationPolicy")} *
          </Label>
          <select
            id="cancellationPolicy"
            value={form.cancellationPolicy}
            onChange={(e) =>
              updateField("cancellationPolicy", e.target.value)
            }
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="full">{t("cancellation_full")}</option>
            <option value="partial">{t("cancellation_partial")}</option>
            <option value="none">{t("cancellation_none")}</option>
          </select>
        </div>
      </fieldset>

      {/* Photos */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-foreground">
          {t("formPhotos")}
        </legend>
        <div className="flex flex-wrap gap-2">
          {images.map((img, i) => (
            <div
              key={i}
              className="relative size-20 rounded-lg overflow-hidden border"
            >
              <img
                src={img.preview}
                alt={`Upload ${i + 1}`}
                className="size-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-0.5 end-0.5 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80"
              >
                <X className="size-3" />
              </button>
              {!img.storageId && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Upload className="size-4 text-white animate-pulse" />
                </div>
              )}
            </div>
          ))}
          {images.length < 5 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex size-20 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 text-muted-foreground hover:border-muted-foreground/50 hover:text-muted-foreground/70 transition-colors"
            >
              <ImagePlus className="size-6" />
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageSelect}
          className="hidden"
        />
        <p className="text-xs text-muted-foreground">
          {t("maxImagesHint")}
        </p>
      </fieldset>

      {/* Contact & Notes */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-foreground">
          {t("formContact")}
        </legend>
        <div className="space-y-2">
          <Label>{t("whatsapp")}</Label>
          <PhoneInput
            value={form.contactWhatsapp}
            onChange={(value) => updateField("contactWhatsapp", value ?? "")}
            defaultCountry="IL"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactEmail">{t("email")}</Label>
          <Input
            id="contactEmail"
            type="email"
            value={form.contactEmail}
            onChange={(e) => updateField("contactEmail", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">{t("description")}</Label>
          <Textarea
            id="description"
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            placeholder={t("descriptionPlaceholder")}
            rows={3}
          />
        </div>
      </fieldset>

      <Button
        type="submit"
        className="w-full"
        disabled={
          isSubmitting ||
          uploading ||
          !form.hotelName ||
          !form.country ||
          !form.city ||
          !form.checkIn ||
          !form.checkOut ||
          !form.originalPrice ||
          !form.askingPrice
        }
      >
        {isSubmitting ? t("submitting") : t("submitListing")}
      </Button>
    </form>
  );
}
