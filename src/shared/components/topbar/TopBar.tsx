"use client";

import { SearchButton } from "./SearchButton";
import { TopBarMenu } from "./TopBarMenu";
import { ProfileMenu } from "./ProfileMenu";

export function TopBar() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex w-full items-center gap-2 px-4">
        {/* Start section: Search */}
        <div className="flex items-center gap-2">
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
