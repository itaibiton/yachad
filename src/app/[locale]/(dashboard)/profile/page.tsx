import { useTranslations } from "next-intl";
import { UserCircle } from "lucide-react";

export default function ProfilePage() {
  const t = useTranslations("modules");

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <UserCircle className="size-16 text-muted-foreground/40" strokeWidth={1} />
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">{t("comingSoon")}</h1>
        <p className="text-sm text-muted-foreground">{t("comingSoonDescription")}</p>
      </div>
    </div>
  );
}
