"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { FlightCard } from "./FlightCard";
import type { FlightWithAgent } from "./flight-utils";

interface UrgentFlightsSectionProps {
  departureCountry?: string;
}

export function UrgentFlightsSection({ departureCountry }: UrgentFlightsSectionProps) {
  const t = useTranslations("flights");
  const urgentFlights = useQuery(
    api.modules.flights.queries.listUrgentFlights,
    { departureCountry }
  );

  // Show nothing when loading or when no urgent flights exist
  if (!urgentFlights || urgentFlights.length === 0) {
    return null;
  }

  const isScrollable = urgentFlights.length > 3;

  return (
    <section aria-label={t("urgentSection")}>
      {/* Section header */}
      <div className="mb-3 flex items-center gap-2">
        {/* Pulsing red dot */}
        <span className="relative flex size-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
          <span className="relative inline-flex size-3 rounded-full bg-red-500" />
        </span>
        <h2 className="text-base font-semibold text-foreground">
          {t("urgentSection")}
        </h2>
      </div>

      {isScrollable ? (
        /* Horizontal scroll row for 4+ urgent flights */
        <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory">
          {urgentFlights.map((flight) => (
            <div key={flight._id} className="min-w-[320px] snap-start">
              <FlightCard flight={flight as unknown as FlightWithAgent} />
            </div>
          ))}
        </div>
      ) : (
        /* Grid layout for 1-3 urgent flights */
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {urgentFlights.map((flight) => (
            <FlightCard key={flight._id} flight={flight as unknown as FlightWithAgent} />
          ))}
        </div>
      )}
    </section>
  );
}
