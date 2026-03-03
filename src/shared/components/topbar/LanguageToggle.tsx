"use client";

import { Languages } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const LOCALE_LABELS: Record<string, { short: string; full: string }> = {
  he: { short: "עב", full: "עברית" },
  en: { short: "EN", full: "English" },
};

const NEXT_LOCALE: Record<string, string> = {
  he: "en",
  en: "he",
};

export function LanguageToggle() {
  const t = useTranslations("topbar");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const nextLocale = NEXT_LOCALE[locale] ?? "he";
  const currentLabel = LOCALE_LABELS[locale] ?? { short: locale.toUpperCase(), full: locale };

  const handleToggle = () => {
    // Navigate to the same page with the alternate locale
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggle}
            className="flex items-center gap-1.5 rounded-lg px-2 font-medium"
            aria-label={`${t("language")}: ${LOCALE_LABELS[nextLocale]?.full ?? nextLocale}`}
          >
            <Languages className="size-4" aria-hidden="true" />
            <span className="text-xs font-semibold">{currentLabel.short}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Switch to {LOCALE_LABELS[nextLocale]?.full}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
