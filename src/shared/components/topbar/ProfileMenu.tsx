"use client";

import { User, Settings, LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { useUser, useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDirection } from "@/shared/hooks/useDirection";

export function ProfileMenu() {
  const t = useTranslations("topbar");
  const tAuth = useTranslations("auth");
  const { isRTL } = useDirection();
  const { user } = useUser();
  const { signOut } = useClerk();

  const nameInitials =
    (user?.firstName?.[0] ?? "") + (user?.lastName?.[0] ?? "");
  const initials =
    nameInitials || (user?.username?.[0]?.toUpperCase() ?? "U");

  const displayName =
    user?.fullName ?? user?.username ?? user?.primaryEmailAddress?.emailAddress ?? "User";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-9 rounded-lg"
          aria-label={t("profile")}
        >
          <Avatar className="size-7">
            <AvatarImage
              src={user?.imageUrl}
              alt={displayName}
            />
            <AvatarFallback className="bg-brand text-brand-foreground text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={isRTL ? "start" : "end"} className="w-56 rounded-xl p-1">
        <DropdownMenuLabel className="px-3 py-2">
          <p className="text-sm font-semibold leading-tight">{displayName}</p>
          <p className="truncate text-xs font-normal text-muted-foreground">
            {user?.primaryEmailAddress?.emailAddress}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm">
          <User className="size-4 text-muted-foreground" />
          <span>{t("profile")}</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm">
          <Settings className="size-4 text-muted-foreground" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut()}
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-destructive focus:text-destructive"
        >
          <LogOut className="size-4" />
          <span>{tAuth("signOut")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
