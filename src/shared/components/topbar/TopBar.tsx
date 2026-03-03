"use client";

import { SearchButton } from "./SearchButton";
import { CountrySelector } from "./CountrySelector";
import { EmergencyButton } from "./EmergencyButton";
import { LanguageToggle } from "./LanguageToggle";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationBell } from "./NotificationBell";
import { ProfileMenu } from "./ProfileMenu";
import { Separator } from "@/components/ui/separator";

export function TopBar() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex w-full items-center gap-2 px-4">
        {/* Start section: Logo + Search */}
        <div className="flex items-center gap-2">
          {/* Logo — visible when sidebar is collapsed or on mobile */}
          <span className="text-lg font-bold text-brand md:hidden">יחד</span>
          <SearchButton />
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* End section: Controls in order per CONTEXT.md */}
        <div className="flex items-center gap-0.5">
          <CountrySelector />
          <Separator orientation="vertical" className="mx-1 h-5" />
          <EmergencyButton />
          <LanguageToggle />
          <ThemeToggle />
          <NotificationBell />
          <Separator orientation="vertical" className="mx-1 h-5" />
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}
