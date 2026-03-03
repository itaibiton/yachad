"use client";

import { SearchButton } from "./SearchButton";
import { TopBarMenu } from "./TopBarMenu";
import { ProfileMenu } from "./ProfileMenu";

export function TopBar() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex w-full items-center gap-2 px-4">
        {/* Start section: Logo + Search */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-brand md:hidden">יחד</span>
          <SearchButton />
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* End section: Single menu + Profile */}
        <div className="flex items-center gap-1">
          <TopBarMenu />
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}
