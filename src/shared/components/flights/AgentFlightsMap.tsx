"use client";

import { useEffect, useRef, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  Map,
  AdvancedMarker,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import { MapPin } from "lucide-react";
import type { Doc } from "../../../../convex/_generated/dataModel";
import { getFlightCoords } from "@/shared/data/airports";
import { getCountryByCode } from "@/shared/data/countries";
import { greatCirclePoints } from "./flight-map-utils";
import { MapMarkerDot } from "./MapMarkerDot";

interface AgentFlightsMapProps {
  flights: Doc<"flights">[] | undefined;
}

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

export function AgentFlightsMap({ flights }: AgentFlightsMapProps) {
  const t = useTranslations("flights");
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID ?? "DEMO_MAP_ID";

  // Derive unique routes from the agent's flights
  const routeData = useMemo(() => {
    if (!flights) return [];
    const seen = new Set<string>();
    const result: {
      from: { lat: number; lng: number };
      to: { lat: number; lng: number };
      key: string;
      depCode: string;
      destCode: string;
    }[] = [];

    for (const f of flights) {
      const key = `${f.departureCountry}→${f.destination}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const fromCoords = getFlightCoords(f.departureAirport, f.departureCountry);
      const toCoords = getFlightCoords(f.destinationAirport, f.destination);
      if (!fromCoords || !toCoords) continue;

      result.push({
        from: fromCoords,
        to: toCoords,
        key,
        depCode: f.departureCountry,
        destCode: f.destination,
      });
    }
    return result;
  }, [flights]);

  // Dedup markers
  const markers = useMemo(() => {
    const seen = new Set<string>();
    const result: {
      coords: { lat: number; lng: number };
      label: string;
      flag: string;
      key: string;
      isDep: boolean;
    }[] = [];

    for (const r of routeData) {
      if (!seen.has(r.depCode)) {
        seen.add(r.depCode);
        const country = getCountryByCode(r.depCode);
        result.push({
          coords: r.from,
          label: country?.name ?? r.depCode,
          flag: country?.flag ?? "",
          key: `dep-${r.depCode}`,
          isDep: true,
        });
      }
      if (!seen.has(r.destCode)) {
        seen.add(r.destCode);
        const country = getCountryByCode(r.destCode);
        result.push({
          coords: r.to,
          label: country?.name ?? r.destCode,
          flag: country?.flag ?? "",
          key: `dest-${r.destCode}`,
          isDep: false,
        });
      }
    }
    return result;
  }, [routeData]);

  const allPoints = useMemo(() => {
    const pts: { lat: number; lng: number }[] = [];
    for (const r of routeData) {
      pts.push(r.from, r.to);
    }
    return pts;
  }, [routeData]);

  // Loading
  if (!flights) {
    return (
      <div className="flex size-full items-center justify-center bg-muted/30">
        <div className="size-8 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
      </div>
    );
  }

  // No flights — empty state
  if (routeData.length === 0) {
    return (
      <div className="flex size-full flex-col items-center justify-center gap-3 bg-muted/30 p-6 text-center">
        <MapPin className="size-10 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">{t("noFlights")}</p>
      </div>
    );
  }

  const defaultCenter = {
    lat: (routeData[0].from.lat + routeData[0].to.lat) / 2,
    lng: (routeData[0].from.lng + routeData[0].to.lng) / 2,
  };

  return (
    <Map
      id="agent-flights-map"
      mapId={mapId}
      defaultCenter={defaultCenter}
      defaultZoom={4}
      disableDefaultUI
      gestureHandling="cooperative"
      className="size-full"
    >
      <BoundsFitter points={allPoints} />

      {routeData.map((r) => (
        <RoutePolyline key={r.key} from={r.from} to={r.to} />
      ))}

      {markers.map((m) => (
        <AdvancedMarker key={m.key} position={m.coords} title={m.label}>
          <MapMarkerDot
            color={m.isDep ? "#10b981" : "#6366f1"}
            label={`${m.flag} ${m.label}`}
          />
        </AdvancedMarker>
      ))}
    </Map>
  );
}
