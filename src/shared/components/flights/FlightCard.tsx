"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  Luggage,
  Briefcase,
  ShoppingBag,
  CheckCircle,
  Heart,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCountryByCode, getCountryFlag } from "@/shared/data/countries";
import {
  FlightWithAgent,
  buildWhatsAppUrl,
  getUrgencyInfo,
  getStatusVariant,
  formatFlightPrice,
  formatTime,
  useTimeFormat,
} from "./flight-utils";
import { FlightDetailSheet } from "./FlightDetailSheet";

const LUGGAGE_TYPE_KEYS: Record<string, string> = {
  "Checked Bag": "luggageCheckedBag",
  "Carry-on": "luggageCarryOn",
  "Personal Item": "luggagePersonalItem",
  "Oversize Bag": "luggageOversizeBag",
  "Sports Equipment": "luggageSportsEquipment",
  Other: "luggageOther",
};

function luggageTypeLabel(type: string, t: (key: string) => string): string {
  const key = LUGGAGE_TYPE_KEYS[type];
  return key ? t(key) : type;
}

interface FlightCardProps {
  flight: FlightWithAgent;
  isSaved?: boolean;
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}

function formatDuration(departureDate: number, arrivalDate: number) {
  const diff = arrivalDate - departureDate;
  const totalMinutes = Math.round(diff / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}

function getSeatsBadgeClass(seats: number): string {
  if (seats <= 1) return "border-red-500/50 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30";
  if (seats <= 3) return "border-orange-500/50 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30";
  return "border-emerald-500/50 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30";
}

export function FlightCard({ flight, isSaved = false }: FlightCardProps) {
  const t = useTranslations("flights");
  const { isSignedIn } = useAuth();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [optimisticSaved, setOptimisticSaved] = useState(isSaved);
  const toggleSave = useMutation(api.modules.flights.mutations.toggleSaveFlight);
  const timeFormat = useTimeFormat();

  // Sync optimistic state when prop changes (e.g. from server)
  if (isSaved !== optimisticSaved && !sheetOpen) {
    setOptimisticSaved(isSaved);
  }

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isSignedIn) return;
    setOptimisticSaved((prev) => !prev);
    try {
      await toggleSave({ flightId: flight._id });
    } catch {
      setOptimisticSaved((prev) => !prev);
    }
  };

  const departureCountry = getCountryByCode(flight.departureCountry);
  const destinationCountry = getCountryByCode(flight.destination);
  const urgency = getUrgencyInfo(flight.departureDate);

  const statusVariant = getStatusVariant(flight.status);
  const statusLabel =
    flight.status === "full"
      ? t("statusFull")
      : flight.status === "cancelled"
        ? t("statusCancelled")
        : null;

  const stopCount = flight.stops?.length ?? 0;
  const stopsLabel =
    stopCount === 0
      ? t("direct")
      : stopCount === 1
        ? t("stop")
        : t("stops", { count: stopCount });

  return (
    <>
      <div
        className={`relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md cursor-pointer ${
          urgency.isUrgent
            ? "ring-2 ring-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.15)]"
            : ""
        }`}
        onClick={() => setSheetOpen(true)}
      >
        {/* ── Urgency banner ── */}
        {urgency.isUrgent && (
          <div
            className={`px-4 py-1.5 text-xs font-semibold text-center ${
              urgency.hoursLeft < 2
                ? "bg-red-500 text-white"
                : "bg-orange-500 text-white"
            }`}
          >
            {urgency.hoursLeft < 1
              ? t("urgentBadgeMinutes", { minutes: urgency.minutesLeft })
              : t("urgentBadge", { hours: urgency.hoursLeft })}
          </div>
        )}

        {/* ── Save button ── */}
        {isSignedIn && (
          <button
            onClick={handleToggleSave}
            className="absolute top-2 end-2 z-10 rounded-full p-1.5 bg-background/80 backdrop-blur-sm transition-colors hover:bg-muted"
            aria-label={optimisticSaved ? t("unsaveFlight") : t("saveFlight")}
          >
            <Heart
              className={`size-4 transition-colors ${
                optimisticSaved
                  ? "fill-red-500 text-red-500"
                  : "text-muted-foreground"
              }`}
            />
          </button>
        )}

        {/* ── Route section ── */}
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-start">
            {/* Departure */}
            <div className="flex flex-col items-center min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-base leading-none" aria-hidden>
                  {getCountryFlag(flight.departureCountry)}
                </span>
                <span className="text-lg font-bold tracking-tight text-foreground leading-none">
                  {flight.departureAirport ?? flight.departureCountry}
                </span>
              </div>
              <span className="text-sm font-semibold tabular-nums text-foreground">
                {formatTime(flight.departureDate, timeFormat)}
              </span>
              <span className="text-[11px] text-muted-foreground mt-0.5 truncate max-w-full">
                {flight.departureCity ?? departureCountry?.name ?? flight.departureCountry}
              </span>
              <span className="text-[11px] text-muted-foreground tabular-nums">
                {formatDate(flight.departureDate)}
              </span>
            </div>

            {/* Center: animated route */}
            <div className="flex flex-col items-center justify-center shrink-0 min-w-[100px] flex-1 max-w-[150px] pt-1">
              {flight.arrivalDate && (
                <span className="text-[10px] text-muted-foreground tabular-nums font-medium">
                  {formatDuration(flight.departureDate, flight.arrivalDate)}
                </span>
              )}

              <div className="relative w-full h-[28px]">
                <svg
                  viewBox="0 0 120 28"
                  fill="none"
                  className="w-full h-full"
                  preserveAspectRatio="none"
                  aria-hidden
                >
                  <path
                    id={`route-${flight._id}`}
                    d="M 4 22 Q 60 -6 116 22"
                    stroke="currentColor"
                    className="text-border"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                    fill="none"
                  />
                  {stopCount > 0 &&
                    flight.stops!.map((_, i) => {
                      const tVal = (i + 1) / (stopCount + 1);
                      const cx = (1 - tVal) * (1 - tVal) * 4 + 2 * (1 - tVal) * tVal * 60 + tVal * tVal * 116;
                      const cy = (1 - tVal) * (1 - tVal) * 22 + 2 * (1 - tVal) * tVal * -6 + tVal * tVal * 22;
                      return (
                        <circle
                          key={i}
                          cx={cx}
                          cy={cy}
                          r="2.5"
                          className="fill-muted-foreground"
                        />
                      );
                    })}
                  <g className="text-muted-foreground">
                    <animateMotion
                      dur="3.5s"
                      repeatCount="indefinite"
                      rotate="auto"
                    >
                      <mpath href={`#route-${flight._id}`} />
                    </animateMotion>
                    <path
                      d="M-5 0 L0 -2 L5 0 L0 1 Z M-2 -2 L-2 -4 L0 -2 M-2 2 L-2 4 L0 1"
                      fill="currentColor"
                      className="text-foreground/70"
                    />
                  </g>
                </svg>

                {stopCount > 0 && (
                  <div
                    className="absolute inset-0 flex items-start justify-evenly pointer-events-none"
                    style={{ paddingInline: "16%" }}
                  >
                    {flight.stops!.map((stop, i) => {
                      const stopCountry = getCountryByCode(stop.country);
                      return (
                        <span
                          key={i}
                          className="text-[10px] leading-none mt-px pointer-events-auto"
                          title={`${stopCountry?.name ?? stop.country}${stop.city ? ` (${stop.city})` : ""}${stop.durationMinutes ? ` - ${stop.durationMinutes} min` : ""}`}
                        >
                          {getCountryFlag(stop.country)}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              <span className="text-[10px] text-muted-foreground">{stopsLabel}</span>
            </div>

            {/* Arrival */}
            <div className="flex flex-col items-center min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-base leading-none" aria-hidden>
                  {getCountryFlag(flight.destination)}
                </span>
                <span className="text-lg font-bold tracking-tight text-foreground leading-none">
                  {flight.destinationAirport ?? flight.destination}
                </span>
              </div>
              {flight.arrivalDate ? (
                <span className="text-sm font-semibold tabular-nums text-foreground">
                  {formatTime(flight.arrivalDate, timeFormat)}
                </span>
              ) : (
                <span className="text-sm font-semibold text-muted-foreground">--:--</span>
              )}
              <span className="text-[11px] text-muted-foreground mt-0.5 truncate max-w-full">
                {flight.destinationCity ?? destinationCountry?.name ?? flight.destination}
              </span>
              {flight.arrivalDate ? (
                <span className="text-[11px] text-muted-foreground tabular-nums">
                  {formatDate(flight.arrivalDate)}
                </span>
              ) : (
                <span className="text-[11px] text-muted-foreground">&nbsp;</span>
              )}
            </div>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="mx-4 border-t border-dashed border-border" />

        {/* ── Info footer ── */}
        <div className="px-4 py-3 flex flex-col gap-2">
          {/* Row 1: Luggage + Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
              {flight.luggage && flight.luggage.length > 0 ? (
                flight.luggage.map((item, i) => (
                  <span key={i} className="flex items-center gap-1">
                    <Luggage className="size-3.5" aria-hidden />
                    {luggageTypeLabel(item.type, t)}
                    {item.weightKg ? ` ${t("luggageWeightKg", { kg: item.weightKg })}` : ""}
                  </span>
                ))
              ) : flight.checkedBagKg || flight.carryOnAllowed || flight.personalItemAllowed ? (
                <>
                  {flight.checkedBagKg ? (
                    <span className="flex items-center gap-1">
                      <Luggage className="size-3.5" aria-hidden />
                      {t("checkedBag", { kg: flight.checkedBagKg })}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-orange-500 dark:text-orange-400">
                      <Luggage className="size-3.5" aria-hidden />
                      {t("noBaggage")}
                    </span>
                  )}
                  {flight.carryOnAllowed && (
                    <span className="flex items-center gap-1">
                      <Briefcase className="size-3.5" aria-hidden />
                      {t("carryOn")}
                    </span>
                  )}
                  {flight.personalItemAllowed && (
                    <span className="flex items-center gap-1">
                      <ShoppingBag className="size-3.5" aria-hidden />
                      {t("personalItem")}
                    </span>
                  )}
                </>
              ) : (
                <span className="flex items-center gap-1 text-muted-foreground/60">
                  <Luggage className="size-3.5" aria-hidden />
                  {t("noLuggage")}
                </span>
              )}
            </div>
            <span className="text-base font-bold text-foreground tabular-nums">
              {formatFlightPrice(flight.pricePerSeat, flight.currency)}
              <span className="text-[10px] font-normal text-muted-foreground ms-1">
                {t("pricePerSeat")}
              </span>
            </span>
          </div>

          {/* Row 2: Agent + Seats + Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-xs text-muted-foreground truncate">
                {flight.agentName}
              </span>
              {flight.agentIsVerified && (
                <CheckCircle className="size-3.5 text-blue-500 shrink-0" aria-hidden />
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge
                variant="outline"
                className={`text-[11px] px-2 py-0 h-5 font-medium ${getSeatsBadgeClass(flight.seats)}`}
              >
                {flight.seats === 1
                  ? t("seatLeft")
                  : t("seatsLeft", { count: flight.seats })}
              </Badge>
              {statusLabel && (
                <Badge variant={statusVariant} className="text-[11px] px-2 py-0 h-5">
                  {statusLabel}
                </Badge>
              )}
            </div>
          </div>

          {/* WhatsApp CTA */}
          <div onClick={(e) => e.stopPropagation()}>
            {isSignedIn ? (
              <Button
                asChild
                size="sm"
                className="w-full bg-green-600 hover:bg-green-700 text-white h-9"
              >
                <a
                  href={buildWhatsAppUrl(flight.whatsappNumber, flight)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-4 shrink-0"
                    aria-hidden
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  {t("contactWhatsApp")}
                </a>
              </Button>
            ) : (
              <Button asChild variant="outline" size="sm" className="w-full h-9">
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
        isSaved={optimisticSaved}
        onToggleSave={handleToggleSave}
      />
    </>
  );
}
