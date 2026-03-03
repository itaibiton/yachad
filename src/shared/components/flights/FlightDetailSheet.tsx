"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";
import { CheckCircle, Hotel, Bus, Shield, Phone, PhoneCall } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { getCountryByCode } from "@/shared/data/countries";
import {
  FlightWithAgent,
  buildWhatsAppUrl,
  formatFlightPrice,
  getStatusVariant,
  getUrgencyInfo,
} from "./flight-utils";

interface FlightDetailSheetProps {
  flight: FlightWithAgent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FlightDetailSheet({
  flight,
  open,
  onOpenChange,
}: FlightDetailSheetProps) {
  const t = useTranslations("flights");
  const { isSignedIn } = useAuth();
  const [phoneRevealed, setPhoneRevealed] = useState(false);
  const incrementContact = useMutation(
    api.modules.flights.mutations.incrementContactCount
  );

  const departureCountry = getCountryByCode(flight.departureCountry);
  const destinationCountry = getCountryByCode(flight.destination);
  const urgency = getUrgencyInfo(flight.departureDate);

  const departureDateStr = new Date(flight.departureDate).toLocaleDateString(
    undefined,
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
  const departureDateTimeStr = new Date(flight.departureDate).toLocaleTimeString(
    undefined,
    { hour: "2-digit", minute: "2-digit" }
  );

  const createdAgo = formatDistanceToNow(new Date(flight._creationTime), {
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

  const agentInitials = flight.agentName
    ? flight.agentName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  async function handleRevealPhone() {
    setPhoneRevealed(true);
    try {
      await incrementContact({ flightId: flight._id });
    } catch {
      // Increment is best-effort — we still show the phone
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {/* side="right" is intentional — SheetContent uses logical end-0/start-0 internally */}
      <SheetContent side="right" className="flex flex-col gap-0 overflow-y-auto p-0 sm:max-w-md">
        {/* Sheet header */}
        <SheetHeader className="border-b p-4 pb-3">
          {/* Urgency banner in header */}
          {urgency.isUrgent && (
            <div
              className={
                urgency.hoursLeft < 2
                  ? "mb-2 rounded-md bg-red-500 px-3 py-1.5 text-center text-sm font-semibold text-white"
                  : "mb-2 rounded-md bg-orange-500 px-3 py-1.5 text-center text-sm font-semibold text-white"
              }
            >
              {urgency.hoursLeft < 1
                ? t("urgentBadgeMinutes", { minutes: urgency.minutesLeft })
                : t("urgentBadge", { hours: urgency.hoursLeft })}
            </div>
          )}

          <SheetTitle className="text-base">
            {t("detailTitle")}
          </SheetTitle>

          {/* Route */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="flex flex-col items-start gap-0.5">
              <span className="text-xl" aria-hidden>{departureCountry?.flag ?? ""}</span>
              <span className="text-sm font-semibold">
                {departureCountry?.name ?? flight.departureCountry}
              </span>
              {flight.departureCity && (
                <span className="text-xs text-muted-foreground">{flight.departureCity}</span>
              )}
            </div>

            <div className="flex flex-col items-center gap-0.5 text-xs text-muted-foreground shrink-0">
              <span>&rarr;</span>
            </div>

            <div className="flex flex-col items-end gap-0.5">
              <span className="text-xl" aria-hidden>{destinationCountry?.flag ?? ""}</span>
              <span className="text-sm font-semibold text-end">
                {destinationCountry?.name ?? flight.destination}
              </span>
              {flight.destinationCity && (
                <span className="text-xs text-muted-foreground text-end">{flight.destinationCity}</span>
              )}
            </div>
          </div>

          <SheetDescription className="mt-1 text-sm">
            {departureDateStr} &bull; {departureDateTimeStr}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 p-4">
          {/* Status + price + seats */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={statusVariant}>{statusLabel}</Badge>
            <span className="text-base font-bold">
              {formatFlightPrice(flight.pricePerSeat, flight.currency)}
            </span>
            <span className="text-sm text-muted-foreground">{t("pricePerSeat")}</span>
            <Badge variant="outline" className="ms-auto text-xs">
              {flight.seats === 1
                ? t("seatLeft")
                : t("seatsLeft", { count: flight.seats })}
            </Badge>
          </div>

          {/* Description */}
          {flight.description && (
            <section aria-label={t("detailDescription")}>
              <h3 className="mb-1.5 text-sm font-semibold text-foreground">
                {t("detailDescription")}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {flight.description}
              </p>
            </section>
          )}

          {/* Package breakdown */}
          {flight.isPackage && (
            <section aria-label={t("detailPackageBreakdown")}>
              <h3 className="mb-2 text-sm font-semibold text-foreground">
                {t("detailPackageBreakdown")}
              </h3>
              <div className="flex flex-col gap-2 rounded-lg border p-3">
                {flight.hotelIncluded && (
                  <div className="flex items-center gap-3">
                    <Hotel className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium">{t("hotelIncluded")}</span>
                      <span className="text-xs text-muted-foreground truncate">
                        {flight.hotelIncluded}
                      </span>
                    </div>
                  </div>
                )}
                {flight.transferIncluded && (
                  <div className="flex items-center gap-3">
                    <Bus className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium">{t("transferIncluded")}</span>
                      <span className="text-xs text-muted-foreground truncate">
                        {flight.transferIncluded}
                      </span>
                    </div>
                  </div>
                )}
                {flight.insuranceIncluded && (
                  <div className="flex items-center gap-3">
                    <Shield className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium">{t("insuranceIncluded")}</span>
                      <span className="text-xs text-muted-foreground truncate">
                        {flight.insuranceIncluded}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Agent profile */}
          <section aria-label={t("detailAgent")}>
            <h3 className="mb-2 text-sm font-semibold text-foreground">
              {t("detailAgent")}
            </h3>
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <Avatar size="lg">
                {flight.agentImageUrl && (
                  <AvatarImage src={flight.agentImageUrl} alt={flight.agentName} />
                )}
                <AvatarFallback>{agentInitials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-sm font-semibold truncate">{flight.agentName}</span>
                {flight.agentEmail && (
                  <span className="text-xs text-muted-foreground truncate">
                    {flight.agentEmail}
                  </span>
                )}
                {flight.agentIsVerified && (
                  <Badge variant="secondary" className="w-fit text-xs flex items-center gap-1 mt-0.5">
                    <CheckCircle className="size-3" aria-hidden />
                    {t("verifiedAgent")}
                  </Badge>
                )}
              </div>
            </div>
          </section>

          {/* Contact section */}
          <section aria-label={t("detailContact")}>
            <h3 className="mb-2 text-sm font-semibold text-foreground">
              {t("detailContact")}
            </h3>

            {isSignedIn ? (
              <div className="flex flex-col gap-2">
                {/* WhatsApp button */}
                {flight.whatsappNumber && (
                  <Button
                    asChild
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    <a
                      href={buildWhatsAppUrl(flight.whatsappNumber, flight)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t("contactWhatsApp")}
                    </a>
                  </Button>
                )}

                {/* Phone reveal button */}
                {flight.phoneNumber && (
                  <div className="flex flex-col gap-1">
                    {phoneRevealed ? (
                      <Button asChild variant="outline" className="w-full">
                        <a href={`tel:${flight.phoneNumber}`}>
                          <PhoneCall className="size-4 me-2" aria-hidden />
                          {flight.phoneNumber}
                        </a>
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleRevealPhone}
                      >
                        <Phone className="size-4 me-2" aria-hidden />
                        {t("contactShowPhone")}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <Button asChild variant="outline" className="w-full">
                <a href="/sign-in">{t("contactSignIn")}</a>
              </Button>
            )}
          </section>

          {/* Flight metadata */}
          <section className="rounded-lg bg-muted/40 p-3">
            <dl className="flex flex-col gap-1.5 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <dt>{t("dateLabel")}</dt>
                <dd className="font-medium text-foreground">{departureDateStr}</dd>
              </div>
              <div className="flex justify-between">
                <dt>{t("departureLabel")}</dt>
                <dd className="font-medium text-foreground">
                  {departureCountry?.name ?? flight.departureCountry}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>{t("destinationLabel")}</dt>
                <dd className="font-medium text-foreground">
                  {destinationCountry?.name ?? flight.destination}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>{t("updatedAgo", { time: "" }).trim()}</dt>
                <dd className="font-medium text-foreground">{createdAgo}</dd>
              </div>
            </dl>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
