import { useTranslations } from "next-intl";
import { Hotel } from "lucide-react";

export default function ReservationsPage() {
  const tNav = useTranslations("nav");
  const tModules = useTranslations("modules");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">{tNav("reservations")}</h1>
      <div className="flex flex-col items-center justify-center rounded-xl border bg-card p-12 text-center shadow-sm">
        <div className="flex size-16 items-center justify-center rounded-full bg-orange-50 dark:bg-orange-950/30">
          <Hotel className="size-8 text-orange-600 dark:text-orange-400" aria-hidden="true" />
        </div>
        <h2 className="mt-4 text-lg font-semibold">{tModules("comingSoon")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{tModules("comingSoonDescription")}</p>
      </div>
    </div>
  );
}
