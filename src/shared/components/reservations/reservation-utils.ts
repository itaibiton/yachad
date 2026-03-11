import { Doc } from "../../../../convex/_generated/dataModel";
import { getCountryByCode } from "@/shared/data/countries";

// ReservationWithSeller — reservation document with denormalized seller fields
export type ReservationWithSeller = Doc<"reservations"> & {
  sellerName: string;
  sellerIsVerified: boolean;
  sellerImageUrl?: string | null;
  sellerEmail?: string | null;
  imageUrl?: string | null;
  imageUrls?: string[];
};

/**
 * calculateNights — returns the number of nights between check-in and check-out.
 */
export function calculateNights(checkIn: number, checkOut: number): number {
  const diff = checkOut - checkIn;
  return Math.max(1, Math.round(diff / (24 * 60 * 60 * 1000)));
}

/**
 * calculateDiscount — returns the discount percentage (0–100).
 */
export function calculateDiscount(
  originalPrice: number,
  askingPrice: number
): number {
  if (originalPrice <= 0) return 0;
  return Math.round(((originalPrice - askingPrice) / originalPrice) * 100);
}

/**
 * formatReservationPrice — formats a price using Intl.NumberFormat.
 */
export function formatReservationPrice(
  price: number,
  currency: string
): string {
  try {
    return new Intl.NumberFormat("he-IL", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(price);
  } catch {
    return `${price} ${currency}`;
  }
}

/**
 * getCancellationColor — returns tailwind color classes for the cancellation badge.
 */
export function getCancellationColor(policy: string): string {
  switch (policy) {
    case "full":
      return "border-emerald-500/50 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30";
    case "partial":
      return "border-amber-500/50 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30";
    case "none":
      return "border-red-500/50 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30";
    default:
      return "";
  }
}

/**
 * buildReservationWhatsAppUrl — builds a WhatsApp deep-link with a pre-filled Hebrew message.
 */
const DEFAULT_WHATSAPP = "972539858438";

export function buildReservationWhatsAppUrl(
  phone: string | undefined,
  reservation: ReservationWithSeller
): string {
  const cleanPhone =
    (phone ?? DEFAULT_WHATSAPP).replace(/\D/g, "") || DEFAULT_WHATSAPP;

  const country = getCountryByCode(reservation.country);
  const location = country?.nameHe ?? reservation.country;

  const checkInStr = new Date(reservation.checkIn).toLocaleDateString("he-IL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const message = `היי, אני מעוניין/ת בהזמנת המלון ${reservation.hotelName} ב${location} מתאריך ${checkInStr}. האם ההזמנה עדיין זמינה?`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
