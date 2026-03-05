"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import { Plane } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { Link } from "@/i18n/routing";
import { countryCodeToFlag } from "@/shared/data/countries";

export function FeedFlightsSidebar() {
  const t = useTranslations("feed");
  const result = useQuery(api.modules.flights.queries.listFlights, {
    paginationOpts: { numItems: 5, cursor: null },
  });

  const flights = result?.page ?? [];

  return (
    <div className="sticky top-4">
      <div className="rounded-xl border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Plane className="size-4 text-muted-foreground" aria-hidden />
          <h2 className="text-sm font-semibold">{t("upcomingFlights")}</h2>
        </div>

        {flights.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">
            {t("upcomingFlights")}...
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {flights.map((flight) => (
              <li
                key={flight._id}
                className="rounded-lg p-2 -mx-2 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-1.5 text-xs font-medium">
                  <span>{countryCodeToFlag(flight.departureCountry)}</span>
                  <span className="text-muted-foreground" aria-hidden>→</span>
                  <span>{countryCodeToFlag(flight.destination)}</span>
                  <span className="ms-auto font-semibold text-brand">
                    {flight.currency === "USD" ? "$" : flight.currency === "EUR" ? "€" : flight.currency === "ILS" ? "₪" : flight.currency}{flight.pricePerSeat}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-1">
                  <span>{flight.departureCity ?? flight.departureCountry}</span>
                  <span aria-hidden>→</span>
                  <span>{flight.destinationCity ?? flight.destination}</span>
                  <span className="ms-auto shrink-0">
                    {formatDistanceToNow(new Date(flight.departureDate), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}

        <Link
          href="/flights"
          className="block text-xs text-brand hover:underline mt-3 pt-3 border-t text-center"
        >
          {t("seeAllFlights")}
        </Link>
      </div>
    </div>
  );
}
