"use client";

import { type ReactNode } from "react";
import { APIProvider } from "@vis.gl/react-google-maps";

interface GoogleMapsProviderProps {
  children: ReactNode;
}

/**
 * Single shared Google Maps APIProvider.
 * Wrap the top-level page that uses maps — do NOT nest multiple APIProviders.
 */
export function GoogleMapsProvider({ children }: GoogleMapsProviderProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) return <>{children}</>;

  return <APIProvider apiKey={apiKey}>{children}</APIProvider>;
}
