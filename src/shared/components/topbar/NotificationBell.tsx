"use client";

import { Bell } from "lucide-react";
import { useTranslations } from "next-intl";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useDirection } from "@/shared/hooks/useDirection";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationBellProps {
  count?: number;
}

export function NotificationBell({ count = 0 }: NotificationBellProps) {
  const t = useTranslations("topbar");
  const { isRTL } = useDirection();
  const alerts = useQuery(api.modules.alerts.queries.listActiveAlerts);

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
      <DropdownMenuContent align={isRTL ? "start" : "end"} className="w-80 rounded-xl p-2" sideOffset={8}>
        <DropdownMenuLabel className="text-sm font-semibold flex items-center gap-2">
          <Bell className="size-4" />
          {t("notifications")}
        </DropdownMenuLabel>
        {alerts && alerts.length > 0 ? (
          <div className="flex flex-col gap-1 mt-1">
            {alerts.map((alert) => (
              <div
                key={alert._id}
                className={cn(
                  "flex items-start gap-2.5 rounded-lg px-3 py-2.5",
                  alert.severity === "urgent"
                    ? "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300"
                    : "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300"
                )}
              >
                <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-sm font-semibold leading-tight">{alert.title}</span>
                  <span className="text-xs opacity-80 line-clamp-2">{alert.content}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center">
            <Bell className="mx-auto mb-2 size-7 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">{t("noNotifications")}</p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
