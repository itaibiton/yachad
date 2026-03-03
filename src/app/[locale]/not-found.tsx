import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Home } from "lucide-react";

export default function NotFoundPage() {
  const t = useTranslations("errors");
  const tCommon = useTranslations("common");

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 p-6 text-center">
      {/* 404 visual */}
      <div className="flex flex-col items-center gap-2">
        <span className="text-7xl font-bold text-muted-foreground/30">
          404
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("notFound")}
        </h1>
      </div>

      {/* Navigate back */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-xl border bg-card px-5 py-2.5 text-sm font-medium shadow-sm transition-colors hover:bg-accent"
      >
        <Home className="size-4" aria-hidden="true" />
        {tCommon("back")}
      </Link>
    </div>
  );
}
