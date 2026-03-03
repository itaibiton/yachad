"use client";

import { Bell } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useDirection } from "@/shared/hooks/useDirection";

interface NotificationBellProps {
  count?: number;
}

export function NotificationBell({ count = 0 }: NotificationBellProps) {
  const t = useTranslations("topbar");
  const { isRTL } = useDirection();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative size-9 rounded-lg"
          aria-label={t("notifications")}
        >
          <Bell className="size-4" aria-hidden="true" />
          {count > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-0.5 -end-0.5 size-4 rounded-full p-0 text-[10px] flex items-center justify-center"
            >
              {count > 9 ? "9+" : count}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={isRTL ? "start" : "end"} className="w-72 rounded-xl p-2">
        <DropdownMenuLabel className="text-sm font-semibold">
          {t("notifications")}
        </DropdownMenuLabel>
        <div className="py-8 text-center">
          <Bell className="mx-auto mb-2 size-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">Coming soon</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Real-time alerts in Phase 2
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
