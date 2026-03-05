"use client";

import { useEffect, useRef, useMemo, useState } from "react";
import {
  Map,
  Marker,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import { getFlightCoords } from "@/shared/data/airports";
import { getCountryByCode } from "@/shared/data/countries";
import { greatCirclePoints, circleIcon } from "./flight-map-utils";

interface FlightRouteMapProps {
  departureAirport?: string;
  destinationAirport?: string;
  departureCountry: string;
  destinationCountry: string;
  departureCity?: string;
  destinationCity?: string;
}

/** Draws a dashed geodesic polyline between two points and fits bounds. */
function RoutePolyline({
  from,
  to,
}: {
  from: { lat: number; lng: number };
  to: { lat: number; lng: number };
}) {
  const map = useMap();
  const mapsLib = useMapsLibrary("maps");
  const coreLib = useMapsLibrary("core");
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map || !mapsLib || !coreLib) return;

    const path = greatCirclePoints(from, to);

    polylineRef.current = new mapsLib.Polyline({
      path,
      geodesic: false,
      strokeOpacity: 0,
      map,
      icons: [
        {
          icon: {
            path: "M 0,-1 0,1",
            strokeOpacity: 0.7,
            strokeWeight: 2.5,
            strokeColor: "#6366f1",
            scale: 3,
          },
          offset: "0",
          repeat: "16px",
        },
      ],
    });

    const bounds = new coreLib.LatLngBounds();
    bounds.extend(from);
    bounds.extend(to);
    map.fitBounds(bounds, { top: 50, bottom: 50, left: 50, right: 50 });

    return () => {
      polylineRef.current?.setMap(null);
      polylineRef.current = null;
    };
  }, [map, mapsLib, coreLib, from, to]);

  return null;
}

export function FlightRouteMap({
  departureAirport,
  destinationAirport,
  departureCountry,
  destinationCountry,
  departureCity,
  destinationCity,
}: FlightRouteMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [error, setError] = useState(false);

  const fromCoords = useMemo(
    () => getFlightCoords(departureAirport, departureCountry),
    [departureAirport, departureCountry]
  );
  const toCoords = useMemo(
    () => getFlightCoords(destinationAirport, destinationCountry),
    [destinationAirport, destinationCountry]
  );

  const depCountry = getCountryByCode(departureCountry);
  const destCountry = getCountryByCode(destinationCountry);

  const fromLabel = departureCity ?? depCountry?.name ?? departureCountry;
  const toLabel = destinationCity ?? destCountry?.name ?? destinationCountry;
  const fromFlag = depCountry?.flag ?? "";
  const toFlag = destCountry?.flag ?? "";

  // Memoize marker icon URLs to avoid recreating SVG data-URLs each render
  const originIcon = useMemo(() => circleIcon("#10b981"), []);
  const destIcon = useMemo(() => circleIcon("#6366f1"), []);

  if (!apiKey || !fromCoords || !toCoords) return null;

  if (error) {
    return (
      <div className="flex size-full items-center justify-center rounded-lg bg-muted/40 p-4">
        <FallbackRoute
          fromLabel={fromLabel}
          fromFlag={fromFlag}
          toLabel={toLabel}
          toFlag={toFlag}
        />
      </div>
    );
  }

  const center = {
    lat: (fromCoords.lat + toCoords.lat) / 2,
    lng: (fromCoords.lng + toCoords.lng) / 2,
  };

  return (
    <Map
      id="route-map"
      defaultCenter={center}
      defaultZoom={3}
      disableDefaultUI
      gestureHandling="cooperative"
      className="size-full rounded-lg"
      onIdle={() => {
        // Maps loaded successfully — clear any pending error
        if (error) setError(false);
      }}
    >
      <RoutePolyline from={fromCoords} to={toCoords} />
      <Marker
        position={fromCoords}
        label={{ text: `${fromFlag} ${fromLabel}`, color: "#fff", fontWeight: "600", fontSize: "11px" }}
        icon={{
          url: originIcon,
          scaledSize: { width: 14, height: 14, equals: () => false },
          labelOrigin: { x: 7, y: -8, equals: () => false },
        }}
        title={fromLabel}
      />
      <Marker
        position={toCoords}
        label={{ text: `${toFlag} ${toLabel}`, color: "#fff", fontWeight: "600", fontSize: "11px" }}
        icon={{
          url: destIcon,
          scaledSize: { width: 14, height: 14, equals: () => false },
          labelOrigin: { x: 7, y: -8, equals: () => false },
        }}
        title={toLabel}
      />
    </Map>
  );
}

/** SVG-only fallback when Google Maps can't load. */
function FallbackRoute({
  fromLabel,
  fromFlag,
  toLabel,
  toFlag,
}: {
  fromLabel: string;
  fromFlag: string;
  toLabel: string;
  toFlag: string;
}) {
  return (
    <div className="flex w-full flex-col items-center gap-3 py-6">
      <svg
        viewBox="0 0 260 80"
        fill="none"
        className="w-full max-w-[260px]"
        aria-hidden
      >
        <path
          d="M 20 60 Q 130 -10 240 60"
          stroke="currentColor"
          className="text-indigo-500"
          strokeWidth="2"
          strokeDasharray="6 4"
          fill="none"
        />
        <circle cx="20" cy="60" r="5" className="fill-emerald-500" />
        <circle cx="240" cy="60" r="5" className="fill-indigo-500" />
        <g transform="translate(130, 18) rotate(10)">
          <path
            d="M-6 0 L0 -3 L6 0 L0 1.5 Z M-3 -3 L-3 -5 L0 -3 M-3 3 L-3 5 L0 1.5"
            fill="currentColor"
            className="text-foreground/60"
          />
        </g>
      </svg>
      <div className="flex w-full items-center justify-between px-4 text-sm">
        <span className="font-medium">
          {fromFlag} {fromLabel}
        </span>
        <span className="font-medium">
          {toFlag} {toLabel}
        </span>
      </div>
    </div>
  );
}
