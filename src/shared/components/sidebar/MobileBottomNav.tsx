"use client";

import { Home, Plane, Newspaper, MessageSquare, Hotel, Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

// Mobile bottom navigation — only active (non-coming-soon) pages
const MOBILE_NAV_ITEMS = [
  { href: "/feed", icon: Home, labelKey: "home" },
  { href: "/flights", icon: Plane, labelKey: "flights" },
  { href: "/reservations", icon: Hotel, labelKey: "reservations" },
  { href: "/news", icon: Newspaper, labelKey: "news" },
  { href: "/chat", icon: MessageSquare, labelKey: "chat" },
] as const;

export function MobileBottomNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const { user } = useUser();
  const role = user?.publicMetadata?.role as string | undefined;
  const isAgent = role === "agent" || role === "admin";

  const navItems = isAgent
    ? [...MOBILE_NAV_ITEMS, { href: "/agent" as const, icon: Upload, labelKey: "agent" as const }]
    : MOBILE_NAV_ITEMS;

  return (
    // Visible ONLY on mobile (hidden on md+)
    <nav
      className="fixed bottom-0 start-0 end-0 z-40 flex md:hidden items-center justify-around border-t bg-background/95 backdrop-blur"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Mobile navigation"
    >
      {navItems.map((item) => {
        const isActive = pathname.includes(item.href.replace(/^\//, ""));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2 px-1 text-xs font-medium transition-colors",
              isActive
                ? "text-brand"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <item.icon
              className={cn(
                "size-5 shrink-0",
                isActive ? "text-brand" : ""
              )}
              aria-hidden="true"
            />
            <span className="leading-none truncate max-w-[4rem]">
              {t(item.labelKey)}
            </span>
            {/* Active indicator bar */}
            {isActive && (
              <span className="absolute top-0 h-0.5 w-8 rounded-full bg-brand" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
