"use client";

import { useTranslations } from "next-intl";
import {
  Luggage,
  Briefcase,
  ShoppingBag,
  Pencil,
  Trash2,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Doc } from "../../../../convex/_generated/dataModel";
import { getCountryByCode, getCountryFlag } from "@/shared/data/countries";
import {
  getUrgencyInfo,
  getStatusVariant,
  formatFlightPrice,
  formatTime,
  useTimeFormat,
} from "./flight-utils";

interface AgentFlightCardProps {
  flight: Doc<"flights">;
  onEdit: (flight: Doc<"flights">) => void;
  onDelete: (flight: Doc<"flights">) => void;
  onStatusChange: (
    flightId: Doc<"flights">["_id"],
    status: "available" | "full" | "cancelled"
  ) => void;
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

export function AgentFlightCard({
  flight,
  onEdit,
  onDelete,
  onStatusChange,
}: AgentFlightCardProps) {
  const t = useTranslations("flights");
  const tAgent = useTranslations("agent");
  const timeFormat = useTimeFormat();

  const departureCountry = getCountryByCode(flight.departureCountry);
  const destinationCountry = getCountryByCode(flight.destination);
  const urgency = getUrgencyInfo(flight.departureDate);

  const statusVariant = getStatusVariant(flight.status);
  const statusLabel =
    flight.status === "available"
      ? t("statusAvailable")
      : flight.status === "full"
        ? t("statusFull")
        : t("statusCancelled");

  const stopCount = flight.stops?.length ?? 0;
  const stopsLabel =
    stopCount === 0
      ? t("direct")
      : stopCount === 1
        ? t("stop")
        : t("stops", { count: stopCount });

  const contactCount = flight.contactCount ?? 0;

  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md ${
        urgency.isUrgent
          ? "ring-2 ring-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.15)]"
          : ""
      }`}
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
                  id={`agent-route-${flight._id}`}
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
                    const cx =
                      (1 - tVal) * (1 - tVal) * 4 +
                      2 * (1 - tVal) * tVal * 60 +
                      tVal * tVal * 116;
                    const cy =
                      (1 - tVal) * (1 - tVal) * 22 +
                      2 * (1 - tVal) * tVal * -6 +
                      tVal * tVal * 22;
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
                    <mpath href={`#agent-route-${flight._id}`} />
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
                        className="text-[10px] leading-none mt-px"
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
          </div>
          <span className="text-base font-bold text-foreground tabular-nums">
            {formatFlightPrice(flight.pricePerSeat, flight.currency)}
            <span className="text-[10px] font-normal text-muted-foreground ms-1">
              {t("pricePerSeat")}
            </span>
          </span>
        </div>

        {/* Row 2: Seats badge + Status dropdown + Contact count */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={`text-[11px] px-2 py-0 h-5 font-medium ${getSeatsBadgeClass(flight.seats)}`}
            >
              {flight.seats === 1
                ? t("seatLeft")
                : t("seatsLeft", { count: flight.seats })}
            </Badge>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="cursor-pointer">
                  <Badge variant={statusVariant} className="text-[11px] px-2 py-0 h-5">
                    {statusLabel}
                  </Badge>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuRadioGroup
                  value={flight.status}
                  onValueChange={(v) =>
                    onStatusChange(
                      flight._id,
                      v as "available" | "full" | "cancelled"
                    )
                  }
                >
                  <DropdownMenuRadioItem value="available">
                    {t("statusAvailable")}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="full">
                    {t("statusFull")}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="cancelled">
                    {t("statusCancelled")}
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {contactCount > 0 && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Users className="size-3" aria-hidden />
              {t("detailContactCount", { count: contactCount })}
            </span>
          )}
        </div>

        {/* Row 3: Action buttons */}
        <div className="flex items-center gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-8 gap-1.5 text-xs"
            onClick={() => onEdit(flight)}
          >
            <Pencil className="size-3.5" />
            {tAgent("editFlight")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2.5 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(flight)}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
