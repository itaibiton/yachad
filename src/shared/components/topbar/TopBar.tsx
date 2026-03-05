"use client";

import { useTranslations } from "next-intl";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { TopBarMenu } from "./TopBarMenu";
import { useAppStore } from "@/stores/appStore";
import { CountryCombobox } from "@/shared/components/CountryCombobox";

export function TopBar() {
  const t = useTranslations("topbar");
  const { selectedCountry, setSelectedCountry } = useAppStore();

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 bg-background/95 backdrop-blur transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 supports-[backdrop-filter]:bg-background/60">
      <div className="flex w-full items-center gap-1 px-4">
        <SidebarTrigger className="-ms-1" />
        <div className="ms-auto flex items-center gap-2">
          <CountryCombobox
            value={selectedCountry}
            onChange={(code) => { if (code) setSelectedCountry(code); }}
            placeholder={t("country")}
            aria-label={t("country")}
            size="sm"
          />
          <TopBarMenu />
        </div>
      </div>
    </header>
  );
}
