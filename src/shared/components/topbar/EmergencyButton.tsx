"use client";

import { AlertTriangle, Phone, MapPin, MessageCircle, ShieldAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAppStore } from "@/stores/appStore";
import { getCountryByCode } from "@/shared/data/countries";
import { cn } from "@/lib/utils";

interface EmergencyButtonProps {
  /** When true, renders as a floating action button for mobile */
  isFAB?: boolean;
}

export function EmergencyButton({ isFAB = false }: EmergencyButtonProps) {
  const t = useTranslations("emergency");
  const { selectedCountry } = useAppStore();
  const country = selectedCountry ? getCountryByCode(selectedCountry) : null;

  const handleCallEmbassy = () => {
    if (country?.embassyPhone) {
      window.open(`tel:${country.embassyPhone}`, "_self");
    } else {
      // Fallback: open emergency resources page or alert
      alert("Embassy number not available. Please search online for your country's Israeli embassy.");
    }
  };

  const handleShareLocation = async () => {
    try {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
          const coords = `${pos.coords.latitude.toFixed(5)},${pos.coords.longitude.toFixed(5)}`;
          const text = `My location: https://maps.google.com/?q=${coords}`;
          if (navigator.share) {
            await navigator.share({ title: "My Location", text });
          } else {
            await navigator.clipboard.writeText(text);
          }
        });
      }
    } catch {
      // Silently fail
    }
  };

  const trigger = (
    <Button
      variant="destructive"
      size={isFAB ? "default" : "icon"}
      className={cn(
        "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 shrink-0",
        isFAB
          ? "fixed bottom-20 end-4 z-50 size-14 rounded-full shadow-xl md:hidden"
          : "size-9 rounded-lg"
      )}
      aria-label={t("title")}
    >
      <AlertTriangle className={cn("shrink-0", isFAB ? "size-6" : "size-4")} />
      {!isFAB && <span className="sr-only">{t("title")}</span>}
    </Button>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 rounded-xl p-1"
        sideOffset={8}
      >
        <DropdownMenuLabel className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-destructive">
          <AlertTriangle className="size-4" />
          {t("title")}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleCallEmbassy}
          className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm"
        >
          <Phone className="size-4 text-muted-foreground" />
          <span>{t("callEmbassy")}</span>
          {country && (
            <span className="ms-auto text-xs text-muted-foreground">
              {country.flag}
            </span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleShareLocation}
          className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm"
        >
          <MapPin className="size-4 text-muted-foreground" />
          <span>{t("shareLocation")}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          // TODO Phase 7: navigate to emergency chat room
          className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm"
        >
          <MessageCircle className="size-4 text-muted-foreground" />
          <span>{t("emergencyChat")}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          // TODO Phase 3+: open danger report modal
          className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-destructive focus:text-destructive"
        >
          <ShieldAlert className="size-4" />
          <span>{t("reportDanger")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
