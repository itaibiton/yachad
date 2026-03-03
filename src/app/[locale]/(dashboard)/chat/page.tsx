import { useTranslations } from "next-intl";
import { MessageSquare } from "lucide-react";

export default function ChatPage() {
  const tNav = useTranslations("nav");
  const tModules = useTranslations("modules");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">{tNav("chat")}</h1>
      <div className="flex flex-col items-center justify-center rounded-xl border bg-card p-12 text-center shadow-sm">
        <div className="flex size-16 items-center justify-center rounded-full bg-teal-50 dark:bg-teal-950/30">
          <MessageSquare className="size-8 text-teal-600 dark:text-teal-400" aria-hidden="true" />
        </div>
        <h2 className="mt-4 text-lg font-semibold">{tModules("comingSoon")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{tModules("comingSoonDescription")}</p>
      </div>
    </div>
  );
}
