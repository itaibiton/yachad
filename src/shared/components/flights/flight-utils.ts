import { Doc } from "../../../../convex/_generated/dataModel";
import { getCountryByCode } from "@/shared/data/countries";

// FlightWithAgent — flight document with denormalized agent fields
export type FlightWithAgent = Doc<"flights"> & {
  agentName: string;
  agentIsVerified: boolean;
  agentImageUrl?: string;
  agentEmail?: string;
};

/**
 * buildWhatsAppUrl — builds a WhatsApp deep-link with a pre-filled Hebrew message.
 *
 * The message is always in Hebrew because both users and agents are Israeli.
 * Phone number is stripped of non-digits before building the wa.me URL.
 */
export function buildWhatsAppUrl(phone: string, flight: FlightWithAgent): string {
  const cleanPhone = phone.replace(/\D/g, "");

  const departureCountry = getCountryByCode(flight.departureCountry);
  const destinationCountry = getCountryByCode(flight.destination);

  const departure = departureCountry?.nameHe ?? flight.departureCountry;
  const destination = destinationCountry?.nameHe ?? flight.destination;

  const dateStr = new Date(flight.departureDate).toLocaleDateString("he-IL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const message = `שלום, אני מעוניין/ת בטיסה מ${departure} ל${destination} בתאריך ${dateStr}. אנא ספרו לי עוד פרטים.`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * getUrgencyInfo — calculates urgency state for a flight departing soon.
 *
 * A flight is urgent when it departs within the next 24 hours.
 */
export function getUrgencyInfo(departureDate: number): {
  isUrgent: boolean;
  hoursLeft: number;
  minutesLeft: number;
} {
  const diff = departureDate - Date.now();
  const isUrgent = diff > 0 && diff < 24 * 60 * 60 * 1000;
  const hoursLeft = Math.floor(diff / (60 * 60 * 1000));
  const minutesLeft = Math.floor(diff / (60 * 1000));

  return { isUrgent, hoursLeft, minutesLeft };
}

/**
 * getStatusVariant — maps a flight status string to a Badge variant.
 */
export function getStatusVariant(
  status: string
): "default" | "secondary" | "destructive" {
  switch (status) {
    case "available":
      return "default";
    case "full":
      return "secondary";
    case "cancelled":
      return "destructive";
    default:
      return "default";
  }
}

/**
 * formatFlightPrice — formats a price using Intl.NumberFormat with currency.
 *
 * Falls back to a plain "{price} {currency}" string if the currency code is
 * not recognized by the runtime's Intl implementation.
 */
export function formatFlightPrice(price: number, currency: string): string {
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
