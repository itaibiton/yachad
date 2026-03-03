"use client";

import { TopBarMenu } from "./TopBarMenu";
import { ProfileMenu } from "./ProfileMenu";

export function TopBar() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex w-full items-center justify-end gap-1 px-4">
        <TopBarMenu />
        <ProfileMenu />
      </div>
    </header>
  );
}
