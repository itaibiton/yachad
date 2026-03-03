import { useTranslations } from "next-intl";
import { Plane, AlertTriangle, Users, MapPin } from "lucide-react";

export default function DashboardHomePage() {
  const t = useTranslations("dashboard");

  const cards = [
    {
      key: "flights",
      icon: Plane,
      title: t("latestFlights"),
      empty: t("noFlights"),
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      key: "alerts",
      icon: AlertTriangle,
      title: t("urgentAlerts"),
      empty: t("noAlerts"),
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-950/30",
    },
    {
      key: "posts",
      icon: Users,
      title: t("recentPosts"),
      empty: t("noPosts"),
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-950/30",
    },
    {
      key: "services",
      icon: MapPin,
      title: t("nearbyServices"),
      empty: t("noServices"),
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/30",
    },
  ] as const;

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
      </div>

      {/* Summary cards grid: 2 columns on desktop, 1 on mobile */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {cards.map(({ key, icon: Icon, title, empty, color, bg }) => (
          <div
            key={key}
            className="flex flex-col gap-4 rounded-xl border bg-card p-5 shadow-sm"
          >
            {/* Card header */}
            <div className="flex items-center gap-3">
              <div
                className={`flex size-10 items-center justify-center rounded-lg ${bg}`}
              >
                <Icon className={`size-5 ${color}`} aria-hidden="true" />
              </div>
              <h2 className="text-base font-semibold">{title}</h2>
            </div>

            {/* Empty state */}
            <p className="text-sm text-muted-foreground">{empty}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
