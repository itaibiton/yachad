"use client";

import {
  Menu,
  Languages,
  Sun,
  Moon,
  Monitor,
  Bell,
  AlertTriangle,
  Phone,
  MapPin,
  MessageCircle,
  ShieldAlert,
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDirection } from "@/shared/hooks/useDirection";
import { useAppStore } from "@/stores/appStore";
import { getCountryByCode } from "@/shared/data/countries";

const THEME_ICONS = { system: Monitor, light: Sun, dark: Moon } as const;
type Theme = keyof typeof THEME_ICONS;
const THEME_CYCLE: Theme[] = ["system", "light", "dark"];

export function TopBarMenu() {
  const t = useTranslations("topbar");
  const tEmergency = useTranslations("emergency");
  const { isRTL } = useDirection();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { selectedCountry } = useAppStore();
  const country = selectedCountry ? getCountryByCode(selectedCountry) : null;

  const currentTheme = (theme ?? "system") as Theme;
  const nextTheme = THEME_CYCLE[(THEME_CYCLE.indexOf(currentTheme) + 1) % THEME_CYCLE.length];
  const ThemeIcon = THEME_ICONS[currentTheme] ?? Monitor;
  const themeLabel = { system: t("systemMode"), light: t("lightMode"), dark: t("darkMode") }[currentTheme];

  const handleSwitchLanguage = () => {
    router.replace(pathname, { locale: locale === "he" ? "en" : "he" });
  };

  const handleCallEmbassy = () => {
    if (country?.embassyPhone) {
      window.open(`tel:${country.embassyPhone}`, "_self");
    }
  };

  const handleShareLocation = async () => {
    try {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
          const coords = `${pos.coords.latitude.toFixed(5)},${pos.coords.longitude.toFixed(5)}`;
          const text = `My location: https://maps.google.com/?q=${coords}`;
          if (navigator.share) {
            await navigator.share({ title: "My Location", text });
          } else {
            await navigator.clipboard.writeText(text);
          }
        });
      }
    } catch {
      // Silently fail
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-9 rounded-lg"
          aria-label={t("menu")}
        >
          <Menu className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={isRTL ? "start" : "end"}
        className="w-64 rounded-xl p-1"
        sideOffset={8}
      >
        {/* Emergency section */}
        <DropdownMenuLabel className="flex rtl:flex-row-reverse items-center gap-2 px-3 py-2 text-sm font-semibold text-destructive">
          <AlertTriangle className="size-4" />
          {tEmergency("title")}
        </DropdownMenuLabel>
        <DropdownMenuItem
          onClick={handleCallEmbassy}
          className="flex rtl:flex-row-reverse items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm"
        >
          <Phone className="size-4 text-muted-foreground" />
          <span className="flex-1">{tEmergency("callEmbassy")}</span>
          {country && <span className="text-xs text-muted-foreground">{country.flag}</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleShareLocation}
          className="flex rtl:flex-row-reverse items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm"
        >
          <MapPin className="size-4 text-muted-foreground" />
          <span>{tEmergency("shareLocation")}</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex rtl:flex-row-reverse items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm">
          <MessageCircle className="size-4 text-muted-foreground" />
          <span>{tEmergency("emergencyChat")}</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex rtl:flex-row-reverse items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-destructive focus:text-destructive">
          <ShieldAlert className="size-4" />
          <span>{tEmergency("reportDanger")}</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Settings section */}
        <DropdownMenuItem
          onClick={handleSwitchLanguage}
          className="flex rtl:flex-row-reverse items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm"
        >
          <Languages className="size-4 text-muted-foreground" />
          <span>{t("switchLanguage")}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme(nextTheme)}
          className="flex rtl:flex-row-reverse items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm"
        >
          <ThemeIcon className="size-4 text-muted-foreground" />
          <span>{themeLabel}</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Notifications */}
        <DropdownMenuLabel className="flex rtl:flex-row-reverse items-center gap-2 px-3 py-2 text-sm font-semibold">
          <Bell className="size-4" />
          {t("notifications")}
        </DropdownMenuLabel>
        <div className="px-3 py-4 text-center">
          <p className="text-xs text-muted-foreground">Coming soon</p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
