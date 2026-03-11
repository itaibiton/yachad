"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";
import {
  CheckCircle,
  X,
  CalendarDays,
  Users,
  Heart,
  BedDouble,
  DoorOpen,
  Mail,
  ChevronLeft,
  ChevronRight,
  Hotel,
} from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getCountryByCode, getCountryFlag } from "@/shared/data/countries";
import {
  type ReservationWithSeller,
  calculateNights,
  calculateDiscount,
  formatReservationPrice,
  getCancellationColor,
  buildReservationWhatsAppUrl,
} from "./reservation-utils";

interface ReservationDetailSheetProps {
  reservation: ReservationWithSeller;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSaved?: boolean;
  onToggleSave?: (e: React.MouseEvent) => void;
}

export function ReservationDetailSheet({
  reservation,
  open,
  onOpenChange,
  isSaved = false,
  onToggleSave,
}: ReservationDetailSheetProps) {
  const t = useTranslations("reservations");
  const { isSignedIn } = useAuth();
  const [visible, setVisible] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const incrementContact = useMutation(
    api.modules.reservations.mutations.incrementContactCount
  );

  useEffect(() => {
    if (open) {
      setCurrentImage(0);
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [open]);

  const nights = calculateNights(reservation.checkIn, reservation.checkOut);
  const discount = calculateDiscount(
    reservation.originalPrice,
    reservation.askingPrice
  );
  const country = getCountryByCode(reservation.country);

  const checkInStr = new Date(reservation.checkIn).toLocaleDateString(
    undefined,
    { weekday: "short", day: "numeric", month: "short", year: "numeric" }
  );
  const checkOutStr = new Date(reservation.checkOut).toLocaleDateString(
    undefined,
    { weekday: "short", day: "numeric", month: "short", year: "numeric" }
  );

  const createdAgo = formatDistanceToNow(
    new Date(reservation._creationTime),
    { addSuffix: true, locale: he }
  );

  const sellerInitials = reservation.sellerName
    ? reservation.sellerName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  const images = reservation.imageUrls ?? (reservation.imageUrl ? [reservation.imageUrl] : []);

  async function handleContactClick() {
    try {
      await incrementContact({ reservationId: reservation._id });
    } catch {
      // best-effort
    }
  }

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
        onClick={() => onOpenChange(false)}
        role="dialog"
        aria-modal="true"
      />

      {/* Panel */}
      <div className="fixed inset-y-0 end-0 z-50 flex">
        <div
          className={`
            relative flex h-screen w-[88vw] flex-col bg-background shadow-2xl
            transition-transform duration-300 ease-out
            sm:w-[440px] sm:border-s
            ${visible ? "translate-x-0" : "translate-x-full rtl:-translate-x-full"}
          `}
        >
          {/* Close button */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-3 end-3 z-20 rounded-full p-1.5 bg-muted/80 backdrop-blur-sm opacity-80 ring-offset-background transition-all hover:opacity-100 hover:bg-muted focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden"
          >
            <X className="size-4" />
            <span className="sr-only">Close</span>
          </button>

          {/* ── Photo Carousel ── */}
          <div className="shrink-0 relative aspect-[16/10] bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
            {images.length > 0 ? (
              <>
                <img
                  src={images[currentImage]}
                  alt={`${reservation.hotelName} ${currentImage + 1}`}
                  className="size-full object-cover"
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setCurrentImage((prev) =>
                          prev === 0 ? images.length - 1 : prev - 1
                        )
                      }
                      className="absolute start-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 bg-black/50 text-white hover:bg-black/70"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <button
                      onClick={() =>
                        setCurrentImage((prev) =>
                          prev === images.length - 1 ? 0 : prev + 1
                        )
                      }
                      className="absolute end-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 bg-black/50 text-white hover:bg-black/70"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                    <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1.5">
                      {images.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentImage(i)}
                          className={`size-2 rounded-full transition-colors ${
                            i === currentImage
                              ? "bg-white"
                              : "bg-white/50"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="flex size-full items-center justify-center">
                <Hotel className="size-16 text-muted-foreground/30" />
              </div>
            )}

            {/* Discount badge */}
            {discount > 0 && (
              <div className="absolute top-3 start-3 rounded-full bg-emerald-600 px-3 py-1.5 text-sm font-bold text-white shadow-md">
                -{discount}%
              </div>
            )}
          </div>

          {/* ── Hero Header ── */}
          <div className="shrink-0 border-b px-5 pt-4 pb-4">
            <h2 className="text-xl font-bold text-foreground">
              {reservation.hotelName}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {getCountryFlag(reservation.country)} {reservation.city},{" "}
              {country?.name ?? reservation.country}
            </p>

            {/* Date line */}
            <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
              <CalendarDays className="size-3.5" />
              <span>
                {checkInStr} — {checkOutStr}
              </span>
              <span className="font-semibold text-foreground">
                ({t("nights", { count: nights })})
              </span>
            </div>

            {/* Price + save */}
            <div className="mt-4 flex items-end justify-between gap-3">
              <div className="flex items-end gap-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-3xl font-extrabold tracking-tight text-foreground leading-none">
                    {formatReservationPrice(
                      reservation.askingPrice,
                      reservation.currency
                    )}
                  </span>
                  {discount > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground line-through">
                        {formatReservationPrice(
                          reservation.originalPrice,
                          reservation.currency
                        )}
                      </span>
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        {t("youSave", {
                          amount: formatReservationPrice(
                            reservation.originalPrice - reservation.askingPrice,
                            reservation.currency
                          ),
                        })}
                      </span>
                    </div>
                  )}
                </div>
                {isSignedIn && onToggleSave && (
                  <button
                    onClick={onToggleSave}
                    className="rounded-full p-2 transition-colors hover:bg-muted"
                    aria-label={
                      isSaved
                        ? t("unsaveReservation")
                        : t("saveReservation")
                    }
                  >
                    <Heart
                      className={`size-5 transition-colors ${
                        isSaved
                          ? "fill-red-500 text-red-500"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── Scrollable Body ── */}
          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col gap-0 divide-y">
              {/* Room info */}
              {(reservation.roomType ||
                reservation.numberOfRooms ||
                reservation.numberOfGuests) && (
                <section className="px-5 py-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    {t("roomDetails")}
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {reservation.roomType && (
                      <div className="flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center">
                        <BedDouble className="size-5 text-muted-foreground" />
                        <span className="text-[11px] font-medium leading-tight">
                          {reservation.roomType}
                        </span>
                      </div>
                    )}
                    {reservation.numberOfRooms && (
                      <div className="flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center">
                        <DoorOpen className="size-5 text-muted-foreground" />
                        <span className="text-[11px] font-medium leading-tight">
                          {t("rooms", { count: reservation.numberOfRooms })}
                        </span>
                      </div>
                    )}
                    {reservation.numberOfGuests && (
                      <div className="flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center">
                        <Users className="size-5 text-muted-foreground" />
                        <span className="text-[11px] font-medium leading-tight">
                          {t("guests", { count: reservation.numberOfGuests })}
                        </span>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Cancellation policy */}
              <section className="px-5 py-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  {t("cancellationPolicy")}
                </h3>
                <Badge
                  variant="outline"
                  className={`text-xs px-3 py-1 ${getCancellationColor(reservation.cancellationPolicy)}`}
                >
                  {t(`cancellation_${reservation.cancellationPolicy}`)}
                </Badge>
                <p className="text-xs text-muted-foreground mt-2">
                  {t(`cancellationDesc_${reservation.cancellationPolicy}`)}
                </p>
              </section>

              {/* Description */}
              {reservation.description && (
                <section className="px-5 py-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    {t("description")}
                  </h3>
                  <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                    {reservation.description}
                  </p>
                </section>
              )}

              {/* Seller profile */}
              <section className="px-5 py-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  {t("seller")}
                </h3>
                <div className="flex items-center gap-3 rounded-xl border p-3">
                  <Avatar className="size-12 ring-2 ring-background shadow-sm">
                    {reservation.sellerImageUrl && (
                      <AvatarImage
                        src={reservation.sellerImageUrl}
                        alt={reservation.sellerName}
                      />
                    )}
                    <AvatarFallback className="text-sm font-bold">
                      {sellerInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold truncate">
                        {reservation.sellerName}
                      </span>
                      {reservation.sellerIsVerified && (
                        <CheckCircle
                          className="size-4 text-blue-500 shrink-0"
                          aria-hidden
                        />
                      )}
                    </div>
                    {reservation.sellerEmail && (
                      <span className="text-xs text-muted-foreground truncate">
                        {reservation.sellerEmail}
                      </span>
                    )}
                  </div>
                </div>
              </section>

              {/* Metadata footer */}
              <section className="px-5 py-3 bg-muted/30">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>{t("postedAgo", { time: createdAgo })}</span>
                  {reservation.contactCount != null &&
                    reservation.contactCount > 0 && (
                      <span className="flex items-center gap-1">
                        <Users className="size-3" />
                        {t("contactCount", {
                          count: reservation.contactCount,
                        })}
                      </span>
                    )}
                </div>
              </section>
            </div>
          </div>

          {/* ── Sticky CTA Footer ── */}
          <div className="shrink-0 border-t bg-background px-5 py-4 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
            {isSignedIn ? (
              <div className="flex flex-col gap-2.5">
                <Button
                  asChild
                  size="lg"
                  className="w-full bg-green-600 hover:bg-green-700 text-white text-base font-semibold h-12 shadow-md shadow-green-600/20"
                  onClick={handleContactClick}
                >
                  <a
                    href={buildReservationWhatsAppUrl(
                      reservation.contactWhatsapp,
                      reservation
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="size-5 shrink-0"
                      aria-hidden
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    {t("contactWhatsApp")}
                  </a>
                </Button>

                {reservation.contactEmail && (
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="w-full h-11"
                    onClick={handleContactClick}
                  >
                    <a
                      href={`mailto:${reservation.contactEmail}?subject=${encodeURIComponent(`Interest in ${reservation.hotelName}`)}`}
                      className="inline-flex items-center justify-center gap-2"
                    >
                      <Mail className="size-4" aria-hidden />
                      {t("contactEmail")}
                    </a>
                  </Button>
                )}
              </div>
            ) : (
              <Button asChild size="lg" className="w-full h-12">
                <a href="/sign-in">{t("contactSignIn")}</a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
