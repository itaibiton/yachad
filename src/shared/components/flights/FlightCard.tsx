"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@clerk/nextjs";
import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";
import { Plane, Hotel, Bus, Shield, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCountryByCode } from "@/shared/data/countries";
import {
  FlightWithAgent,
  buildWhatsAppUrl,
  getUrgencyInfo,
  getStatusVariant,
  formatFlightPrice,
} from "./flight-utils";
import { FlightDetailSheet } from "./FlightDetailSheet";

interface FlightCardProps {
  flight: FlightWithAgent;
}

export function FlightCard({ flight }: FlightCardProps) {
  const t = useTranslations("flights");
  const { isSignedIn } = useAuth();
  const [sheetOpen, setSheetOpen] = useState(false);

  const departureCountry = getCountryByCode(flight.departureCountry);
  const destinationCountry = getCountryByCode(flight.destination);
  const urgency = getUrgencyInfo(flight.departureDate);

  const departureDateStr = new Date(flight.departureDate).toLocaleDateString(
    undefined,
    { day: "numeric", month: "short", year: "numeric" }
  );
  const departureDateTimeStr = new Date(flight.departureDate).toLocaleTimeString(
    undefined,
    { hour: "2-digit", minute: "2-digit" }
  );

  const updatedAgo = formatDistanceToNow(new Date(flight._creationTime), {
    addSuffix: true,
    locale: he,
  });

  const statusVariant = getStatusVariant(flight.status);
  const statusLabel =
    flight.status === "available"
      ? t("statusAvailable")
      : flight.status === "full"
        ? t("statusFull")
        : t("statusCancelled");

  return (
    <>
      <div
        className="relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md cursor-pointer"
        onClick={() => setSheetOpen(true)}
      >
        {/* Urgency banner */}
        {urgency.isUrgent && (
          <div
            className={
              urgency.hoursLeft < 2
                ? "bg-red-500 text-white px-4 py-1.5 text-sm font-semibold text-center"
                : "bg-orange-500 text-white px-4 py-1.5 text-sm font-semibold text-center"
            }
          >
            {urgency.hoursLeft < 1
              ? t("urgentBadgeMinutes", { minutes: urgency.minutesLeft })
              : t("urgentBadge", { hours: urgency.hoursLeft })}
          </div>
        )}

        <div className="flex flex-col gap-3 p-4">
          {/* Route header */}
          <div className="flex items-center justify-between gap-2">
            {/* Departure */}
            <div className="flex flex-col items-start gap-0.5 min-w-0">
              <span className="text-2xl" aria-hidden>
                {departureCountry?.flag ?? ""}
              </span>
              <span className="text-sm font-semibold truncate">
                {departureCountry?.name ?? flight.departureCountry}
              </span>
              {flight.departureCity && (
                <span className="text-xs text-muted-foreground truncate">
                  {flight.departureCity}
                </span>
              )}
            </div>

            {/* Arrow / Plane */}
            <div className="flex flex-col items-center gap-0.5 shrink-0 px-2">
              <Plane className="size-5 text-muted-foreground rotate-90" aria-hidden />
            </div>

            {/* Destination */}
            <div className="flex flex-col items-end gap-0.5 min-w-0">
              <span className="text-2xl" aria-hidden>
                {destinationCountry?.flag ?? ""}
              </span>
              <span className="text-sm font-semibold truncate text-end">
                {destinationCountry?.name ?? flight.destination}
              </span>
              {flight.destinationCity && (
                <span className="text-xs text-muted-foreground truncate text-end">
                  {flight.destinationCity}
                </span>
              )}
            </div>
          </div>

          {/* Date line */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {departureDateStr} &bull; {departureDateTimeStr}
            </span>
            <span className="text-xs">{t("updatedAgo", { time: updatedAgo })}</span>
          </div>

          {/* Info row: seats, price, status */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {flight.seats === 1 ? t("seatLeft") : t("seatsLeft", { count: flight.seats })}
            </Badge>

            <span className="text-sm font-bold text-foreground">
              {formatFlightPrice(flight.pricePerSeat, flight.currency)}
              <span className="ms-1 text-xs font-normal text-muted-foreground">
                {t("pricePerSeat")}
              </span>
            </span>

            <Badge variant={statusVariant} className="ms-auto text-xs">
              {statusLabel}
            </Badge>
          </div>

          {/* Agent row */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground truncate">
              {flight.agentName}
            </span>
            {flight.agentIsVerified && (
              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                <CheckCircle className="size-3" aria-hidden />
                {t("verifiedAgent")}
              </Badge>
            )}
          </div>

          {/* Package badges */}
          {flight.isPackage && (
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="text-xs">
                {t("packageDeal")}
              </Badge>
              {flight.hotelIncluded && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Hotel className="size-3.5" aria-hidden />
                  {t("hotelIncluded")}
                </span>
              )}
              {flight.transferIncluded && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Bus className="size-3.5" aria-hidden />
                  {t("transferIncluded")}
                </span>
              )}
              {flight.insuranceIncluded && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Shield className="size-3.5" aria-hidden />
                  {t("insuranceIncluded")}
                </span>
              )}
            </div>
          )}

          {/* Contact action */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex gap-2 pt-1"
          >
            {isSignedIn ? (
              flight.whatsappNumber ? (
                <Button
                  asChild
                  size="sm"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <a
                    href={buildWhatsAppUrl(flight.whatsappNumber, flight)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t("contactWhatsApp")}
                  </a>
                </Button>
              ) : null
            ) : (
              <Button asChild variant="outline" size="sm" className="flex-1">
                <a href="/sign-in">{t("contactSignIn")}</a>
              </Button>
            )}
          </div>
        </div>
      </div>

      <FlightDetailSheet
        flight={flight}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </>
  );
}
