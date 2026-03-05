"use client";

import { useEffect, useRef, useMemo } from "react";
import { useQuery } from "convex/react";
import { useTranslations } from "next-intl";
import {
  Map,
  Marker,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import { MapPin } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { getFlightCoords } from "@/shared/data/airports";
import { getCountryByCode } from "@/shared/data/countries";
import { useAppStore } from "@/stores/appStore";
import { greatCirclePoints, circleIcon } from "./flight-map-utils";

interface FlightsMapSidebarProps {
  filters: {
    departureCountry?: string;
    destination?: string;
    dateFrom?: number;
    dateTo?: number;
    minSeats?: number;
    isPackage?: boolean;
  };
  /** When true, user explicitly chose "All" — don't fall back to selectedCountry */
  allDepartures?: boolean;
}

/** Draws a dashed geodesic polyline between two points (no bounds fitting). */
function RoutePolyline({
  from,
  to,
}: {
  from: { lat: number; lng: number };
  to: { lat: number; lng: number };
}) {
  const map = useMap();
  const mapsLib = useMapsLibrary("maps");
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map || !mapsLib) return;

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

    return () => {
      polylineRef.current?.setMap(null);
      polylineRef.current = null;
    };
  }, [map, mapsLib, from, to]);

  return null;
}

/** Fits map bounds to encompass all provided points. */
function BoundsFitter({ points }: { points: { lat: number; lng: number }[] }) {
  const map = useMap();
  const coreLib = useMapsLibrary("core");

  useEffect(() => {
    if (!map || !coreLib || points.length === 0) return;

    const bounds = new coreLib.LatLngBounds();
    for (const p of points) {
      bounds.extend(p);
    }
    map.fitBounds(bounds, { top: 40, bottom: 40, left: 40, right: 40 });

    // Prevent excessive zoom when there are few/close points
    const listener = map.addListener("idle", () => {
      const zoom = map.getZoom();
      if (zoom !== undefined && zoom > 6) {
        map.setZoom(6);
      }
      listener.remove();
    });
    return () => listener.remove();
  }, [map, coreLib, points]);

  return null;
}

export function FlightsMapSidebar({ filters, allDepartures }: FlightsMapSidebarProps) {
  const t = useTranslations("flights");
  const selectedCountry = useAppStore((s) => s.selectedCountry);

  const departureCountry = allDepartures
    ? undefined
    : (filters.departureCountry ?? selectedCountry ?? undefined);
  const hasDeparture = !!departureCountry;

  // --- Single-origin mode: departure country is set ---
  const destinations = useQuery(
    api.modules.flights.queries.listFlightDestinations,
    hasDeparture
      ? {
          departureCountry,
          destination: filters.destination,
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo,
          minSeats: filters.minSeats,
          isPackage: filters.isPackage,
        }
      : "skip"
  );

  // --- All-routes mode: no departure country ---
  const routes = useQuery(
    api.modules.flights.queries.listFlightRoutes,
    !hasDeparture
      ? {
          destination: filters.destination,
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo,
          minSeats: filters.minSeats,
          isPackage: filters.isPackage,
        }
      : "skip"
  );

  // Memoize marker icon URLs
  const originIcon = useMemo(() => circleIcon("#10b981"), []);
  const destIcon = useMemo(() => circleIcon("#6366f1"), []);

  // === Single-origin mode ===
  const originCoords = useMemo(
    () => (departureCountry ? getFlightCoords(undefined, departureCountry) : null),
    [departureCountry]
  );

  const originCountry = departureCountry ? getCountryByCode(departureCountry) : null;

  const destData = useMemo(() => {
    if (!destinations) return [];
    return destinations
      .map((d) => {
        const coords = getFlightCoords(d.destinationAirport, d.destination);
        if (!coords) return null;
        const country = getCountryByCode(d.destination);
        return {
          coords,
          label: d.destinationCity ?? country?.name ?? d.destination,
          flag: country?.flag ?? "",
          key: d.destination,
        };
      })
      .filter(Boolean) as {
        coords: { lat: number; lng: number };
        label: string;
        flag: string;
        key: string;
      }[];
  }, [destinations]);

  // === All-routes mode ===
  const routeData = useMemo(() => {
    if (!routes) return [];
    return routes
      .map((r) => {
        const fromCoords = getFlightCoords(r.departureAirport, r.departureCountry);
        const toCoords = getFlightCoords(r.destinationAirport, r.destination);
        if (!fromCoords || !toCoords) return null;
        const depCountry = getCountryByCode(r.departureCountry);
        const destCountry = getCountryByCode(r.destination);
        return {
          from: fromCoords,
          to: toCoords,
          depLabel: depCountry?.name ?? r.departureCountry,
          depFlag: depCountry?.flag ?? "",
          destLabel: destCountry?.name ?? r.destination,
          destFlag: destCountry?.flag ?? "",
          key: `${r.departureCountry}→${r.destination}`,
          depCode: r.departureCountry,
          destCode: r.destination,
        };
      })
      .filter(Boolean) as {
        from: { lat: number; lng: number };
        to: { lat: number; lng: number };
        depLabel: string;
        depFlag: string;
        destLabel: string;
        destFlag: string;
        key: string;
        depCode: string;
        destCode: string;
      }[];
  }, [routes]);

  // Collect all points for bounds fitting
  const allPoints = useMemo(() => {
    if (hasDeparture) {
      const pts: { lat: number; lng: number }[] = [];
      if (originCoords) pts.push(originCoords);
      for (const d of destData) pts.push(d.coords);
      return pts;
    }
    const pts: { lat: number; lng: number }[] = [];
    for (const r of routeData) {
      pts.push(r.from, r.to);
    }
    return pts;
  }, [hasDeparture, originCoords, destData, routeData]);

  // Dedup markers for all-routes mode — must be above early returns to keep hook order stable
  const allRouteMarkers = useMemo(() => {
    if (hasDeparture) return [];
    const seen = new Set<string>();
    const markers: { coords: { lat: number; lng: number }; label: string; flag: string; key: string; isDep: boolean }[] = [];
    for (const r of routeData) {
      if (!seen.has(r.depCode)) {
        seen.add(r.depCode);
        markers.push({ coords: r.from, label: r.depLabel, flag: r.depFlag, key: `dep-${r.depCode}`, isDep: true });
      }
      if (!seen.has(r.destCode)) {
        seen.add(r.destCode);
        markers.push({ coords: r.to, label: r.destLabel, flag: r.destFlag, key: `dest-${r.destCode}`, isDep: false });
      }
    }
    return markers;
  }, [hasDeparture, routeData]);

  // No data at all — show fallback
  if (hasDeparture && !originCoords) {
    return (
      <div className="flex size-full flex-col items-center justify-center gap-3 bg-muted/30 p-6 text-center">
        <MapPin className="size-10 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">{t("mapSelectDeparture")}</p>
      </div>
    );
  }

  // "All" mode with no routes yet (loading or empty)
  if (!hasDeparture && routeData.length === 0 && routes !== undefined) {
    return (
      <div className="flex size-full flex-col items-center justify-center gap-3 bg-muted/30 p-6 text-center">
        <MapPin className="size-10 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">{t("noFlights")}</p>
      </div>
    );
  }

  // Still loading
  if (!hasDeparture && routes === undefined) {
    return (
      <div className="flex size-full items-center justify-center bg-muted/30">
        <div className="size-8 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
      </div>
    );
  }

  // Default center
  const defaultCenter = hasDeparture
    ? originCoords!
    : routeData.length > 0
      ? { lat: (routeData[0].from.lat + routeData[0].to.lat) / 2, lng: (routeData[0].from.lng + routeData[0].to.lng) / 2 }
      : { lat: 30, lng: 20 };

  return (
    <Map
      id="sidebar-map"
      defaultCenter={defaultCenter}
      defaultZoom={4}
      disableDefaultUI
      gestureHandling="cooperative"
      className="size-full"
    >
      <BoundsFitter points={allPoints} />

      {/* === Single-origin mode === */}
      {hasDeparture && (
        <>
          {destData.map((d) => (
            <RoutePolyline key={d.key} from={originCoords!} to={d.coords} />
          ))}

          <Marker
            position={originCoords!}
            label={{
              text: `${originCountry?.flag ?? ""} ${t("mapYourLocation")}`,
              color: "#fff",
              fontWeight: "600",
              fontSize: "11px",
            }}
            icon={{
              url: originIcon,
              scaledSize: { width: 16, height: 16, equals: () => false },
              labelOrigin: { x: 8, y: -8, equals: () => false },
            }}
            title={t("mapYourLocation")}
          />

          {destData.map((d) => (
            <Marker
              key={d.key}
              position={d.coords}
              label={{
                text: `${d.flag} ${d.label}`,
                color: "#fff",
                fontWeight: "600",
                fontSize: "11px",
              }}
              icon={{
                url: destIcon,
                scaledSize: { width: 14, height: 14, equals: () => false },
                labelOrigin: { x: 7, y: -8, equals: () => false },
              }}
              title={d.label}
            />
          ))}
        </>
      )}

      {/* === All-routes mode === */}
      {!hasDeparture && (
        <>
          {routeData.map((r) => (
            <RoutePolyline key={r.key} from={r.from} to={r.to} />
          ))}

          {allRouteMarkers.map((m) => (
            <Marker
              key={m.key}
              position={m.coords}
              label={{
                text: `${m.flag} ${m.label}`,
                color: "#fff",
                fontWeight: "600",
                fontSize: "11px",
              }}
              icon={{
                url: m.isDep ? originIcon : destIcon,
                scaledSize: { width: 14, height: 14, equals: () => false },
                labelOrigin: { x: 7, y: -8, equals: () => false },
              }}
              title={m.label}
            />
          ))}
        </>
      )}
    </Map>
  );
}
