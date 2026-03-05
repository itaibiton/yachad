"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const LOCALES: Record<string, { flag: string; full: string }> = {
  he: { flag: "🇮🇱", full: "עברית" },
  en: { flag: "🇺🇸", full: "English" },
};

const NEXT_LOCALE: Record<string, string> = {
  he: "en",
  en: "he",
};

export function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const nextLocale = NEXT_LOCALE[locale] ?? "he";
  const next = LOCALES[nextLocale] ?? { flag: "🌐", full: nextLocale };

  const handleToggle = () => {
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggle}
            className="size-9 rounded-lg text-base"
            aria-label={`Switch to ${next.full}`}
          >
            {next.flag}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>{next.full}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
