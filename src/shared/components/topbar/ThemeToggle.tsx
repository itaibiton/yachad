"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Theme = "system" | "light" | "dark";
const THEME_CYCLE: Theme[] = ["system", "light", "dark"];

const THEME_ICONS = {
  system: Monitor,
  light: Sun,
  dark: Moon,
} as const;

export function ThemeToggle() {
  const t = useTranslations("topbar");
  const { theme, setTheme, resolvedTheme } = useTheme();

  const current = (theme ?? "system") as Theme;
  const currentIndex = THEME_CYCLE.indexOf(current);
  const nextTheme = THEME_CYCLE[(currentIndex + 1) % THEME_CYCLE.length];

  const Icon = THEME_ICONS[current] ?? Monitor;

  const themeLabel = {
    system: t("systemMode"),
    light: t("lightMode"),
    dark: t("darkMode"),
  }[current];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(nextTheme)}
            className="size-9 rounded-lg"
            aria-label={`Theme: ${themeLabel}. Click to switch.`}
          >
            <Icon className="size-4" aria-hidden="true" />
            <span className="sr-only">{themeLabel}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>{themeLabel}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
