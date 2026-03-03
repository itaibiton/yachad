import { useTranslations } from "next-intl";
import { MapPin } from "lucide-react";

export default function MapPage() {
  const tNav = useTranslations("nav");
  const tModules = useTranslations("modules");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">{tNav("map")}</h1>
      <div className="flex flex-col items-center justify-center rounded-xl border bg-card p-12 text-center shadow-sm">
        <div className="flex size-16 items-center justify-center rounded-full bg-green-50 dark:bg-green-950/30">
          <MapPin className="size-8 text-green-600 dark:text-green-400" aria-hidden="true" />
        </div>
        <h2 className="mt-4 text-lg font-semibold">{tModules("comingSoon")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{tModules("comingSoonDescription")}</p>
      </div>
    </div>
  );
}
