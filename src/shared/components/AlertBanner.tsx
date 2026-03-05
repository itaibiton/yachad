"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, X } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { cn } from "@/lib/utils";

export function AlertBanner() {
  const t = useTranslations("alerts");
  const alerts = useQuery(api.modules.alerts.queries.listActiveAlerts);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  // Populate dismissed IDs from sessionStorage on mount (client-side only)
  // Avoids hydration mismatch — sessionStorage is never available on server
  useEffect(() => {
    const stored = sessionStorage.getItem("yachad-dismissed-alerts");
    if (stored) {
      try {
        setDismissedIds(new Set(JSON.parse(stored)));
      } catch {
        // Ignore corrupt storage — treat as no dismissals
      }
    }
  }, []);

  const dismiss = (alertId: string) => {
    setDismissedIds((prev) => {
      const next = new Set(prev);
      next.add(alertId);
      sessionStorage.setItem(
        "yachad-dismissed-alerts",
        JSON.stringify([...next])
      );
      return next;
    });
  };

  const visibleAlerts = (alerts ?? []).filter((a) => !dismissedIds.has(a._id));

  if (visibleAlerts.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col">
      {visibleAlerts.map((alert) => (
        <div
          key={alert._id}
          className={cn(
            "flex items-center gap-3 px-4 py-2.5",
            alert.severity === "urgent"
              ? "bg-red-600 text-white"
              : "bg-amber-500 text-amber-950"
          )}
          role="alert"
        >
          <AlertTriangle className="size-5 shrink-0" aria-hidden />
          <div className="flex flex-col flex-1 min-w-0">
            <p className="font-semibold text-sm">{alert.title}</p>
            <p
              className={cn(
                "text-xs truncate",
                alert.severity === "urgent"
                  ? "text-red-100"
                  : "text-amber-800"
              )}
            >
              {alert.content}
            </p>
          </div>
          <button
            onClick={() => dismiss(alert._id)}
            aria-label={t("dismiss")}
            className={cn(
              "shrink-0 rounded-full p-1 transition-colors",
              alert.severity === "urgent"
                ? "hover:bg-red-700"
                : "hover:bg-amber-600"
            )}
          >
            <X className="size-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
