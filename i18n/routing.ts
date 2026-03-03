import { defineRouting } from "next-intl/routing";
import createNavigation from "next-intl/navigation";

export const routing = defineRouting({
  locales: ["he", "en"],
  defaultLocale: "he",
  localePrefix: "always", // Always show /he/ or /en/ prefix in URL
});

// Locale-aware navigation utilities
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
