"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAppStore } from "@/stores/appStore";
import { CountryCombobox } from "@/shared/components/CountryCombobox";
import { LanguageToggle } from "./LanguageToggle";
import { NotificationBell } from "./NotificationBell";

export function TopBar() {
  const t = useTranslations("topbar");
  const { selectedCountry, setSelectedCountry } = useAppStore();
  const alerts = useQuery(api.modules.alerts.queries.listActiveAlerts);
  const alertCount = alerts?.length ?? 0;

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 bg-background/95 backdrop-blur transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 supports-[backdrop-filter]:bg-background/60">
      <div className="flex w-full items-center gap-1 px-4">
        <SidebarTrigger className="-ms-1" />
        <div className="ms-auto flex items-center gap-1">
          <CountryCombobox
            value={selectedCountry}
            onChange={(code) => { if (code) setSelectedCountry(code); }}
            placeholder={t("country")}
            aria-label={t("country")}
            size="sm"
          />
          <LanguageToggle />
          <NotificationBell count={alertCount} />
        </div>
      </div>
    </header>
  );
}
