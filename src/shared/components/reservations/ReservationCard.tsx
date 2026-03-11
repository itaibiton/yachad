"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { Hotel, Heart } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCountryFlag } from "@/shared/data/countries";
import {
  type ReservationWithSeller,
  calculateNights,
  calculateDiscount,
  formatReservationPrice,
  getCancellationColor,
  buildReservationWhatsAppUrl,
} from "./reservation-utils";
import { ReservationDetailSheet } from "./ReservationDetailSheet";

interface ReservationCardProps {
  reservation: ReservationWithSeller;
  isSaved?: boolean;
}

export function ReservationCard({
  reservation,
  isSaved = false,
}: ReservationCardProps) {
  const t = useTranslations("reservations");
  const { isSignedIn } = useAuth();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [optimisticSaved, setOptimisticSaved] = useState(isSaved);
  const toggleSave = useMutation(
    api.modules.reservations.mutations.toggleSaveReservation
  );

  if (isSaved !== optimisticSaved && !sheetOpen) {
    setOptimisticSaved(isSaved);
  }

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isSignedIn) return;
    setOptimisticSaved((prev) => !prev);
    try {
      await toggleSave({ reservationId: reservation._id });
    } catch {
      setOptimisticSaved((prev) => !prev);
    }
  };

  const nights = calculateNights(reservation.checkIn, reservation.checkOut);
  const discount = calculateDiscount(
    reservation.originalPrice,
    reservation.askingPrice
  );

  const checkInStr = new Date(reservation.checkIn).toLocaleDateString(
    undefined,
    { day: "numeric", month: "short" }
  );
  const checkOutStr = new Date(reservation.checkOut).toLocaleDateString(
    undefined,
    { day: "numeric", month: "short" }
  );

  return (
    <>
      <div
        className="relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md cursor-pointer"
        onClick={() => setSheetOpen(true)}
      >
        {/* Photo area */}
        <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-muted to-muted/50">
          {reservation.imageUrl ? (
            <img
              src={reservation.imageUrl}
              alt={reservation.hotelName}
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <Hotel className="size-12 text-muted-foreground/40" />
            </div>
          )}

          {/* Discount badge */}
          {discount > 0 && (
            <div className="absolute top-2 start-2 rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white shadow-md">
              -{discount}%
            </div>
          )}

          {/* Save heart */}
          {isSignedIn && (
            <button
              onClick={handleToggleSave}
              className="absolute top-2 end-2 z-10 rounded-full p-1.5 bg-background/80 backdrop-blur-sm transition-colors hover:bg-muted"
              aria-label={
                optimisticSaved ? t("unsaveReservation") : t("saveReservation")
              }
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
        </div>

        {/* Content */}
        <div className="flex flex-col gap-2 px-4 py-3">
          {/* Hotel name + location */}
          <div>
            <h3 className="text-sm font-bold text-foreground truncate">
              {reservation.hotelName}
            </h3>
            <p className="text-xs text-muted-foreground truncate">
              {getCountryFlag(reservation.country)} {reservation.city},{" "}
              {reservation.country}
            </p>
          </div>

          {/* Date range + nights */}
          <div className="text-xs text-muted-foreground">
            {checkInStr} — {checkOutStr} · {t("nights", { count: nights })}
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-foreground tabular-nums">
              {formatReservationPrice(
                reservation.askingPrice,
                reservation.currency
              )}
            </span>
            {discount > 0 && (
              <span className="text-xs text-muted-foreground line-through tabular-nums">
                {formatReservationPrice(
                  reservation.originalPrice,
                  reservation.currency
                )}
              </span>
            )}
          </div>

          {/* Bottom row: cancellation + room type */}
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={`text-[11px] px-2 py-0 h-5 font-medium ${getCancellationColor(reservation.cancellationPolicy)}`}
            >
              {t(`cancellation_${reservation.cancellationPolicy}`)}
            </Badge>
            {reservation.roomType && (
              <span className="text-[11px] text-muted-foreground truncate">
                {reservation.roomType}
              </span>
            )}
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
                  href={buildReservationWhatsAppUrl(
                    reservation.contactWhatsapp,
                    reservation
                  )}
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
              <Button
                asChild
                variant="outline"
                size="sm"
                className="w-full h-9"
              >
                <a href="/sign-in">{t("contactSignIn")}</a>
              </Button>
            )}
          </div>
        </div>
      </div>

      <ReservationDetailSheet
        reservation={reservation}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        isSaved={optimisticSaved}
        onToggleSave={handleToggleSave}
      />
    </>
  );
}
