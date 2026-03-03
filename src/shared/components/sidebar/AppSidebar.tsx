"use client";

import { Home, Plane, Newspaper, MapPin, Users, MessageSquare, Hotel, PanelLeftIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarNavItem } from "./SidebarNavItem";
import { useAppStore } from "@/stores/appStore";
import { useDirection } from "@/shared/hooks/useDirection";

// Module navigation links in crisis priority order per CONTEXT.md
const NAV_ITEMS = [
  { href: "/", icon: Home, labelKey: "home" },
  { href: "/flights", icon: Plane, labelKey: "flights" },
  { href: "/news", icon: Newspaper, labelKey: "news" },
  { href: "/map", icon: MapPin, labelKey: "map" },
  { href: "/feed", icon: Users, labelKey: "feed" },
  { href: "/chat", icon: MessageSquare, labelKey: "chat" },
  { href: "/reservations", icon: Hotel, labelKey: "reservations" },
] as const;

export function AppSidebar() {
  const t = useTranslations("nav");
  const { sidebarCollapsed, toggleSidebar } = useAppStore();
  const { isRTL } = useDirection();

  return (
    <aside
      className={cn(
        // Hidden on mobile — mobile uses MobileBottomNav instead
        "hidden md:flex flex-col border-e bg-sidebar text-sidebar-foreground transition-all duration-300",
        sidebarCollapsed ? "w-14" : "w-56"
      )}
      aria-label="Main navigation"
    >
      {/* Logo area */}
      <div
        className={cn(
          "flex items-center border-b py-4",
          sidebarCollapsed ? "justify-center px-2" : "gap-2 ps-4 pe-3"
        )}
      >
        {!sidebarCollapsed && (
          <span className="text-xl font-bold tracking-tight text-brand">
            יחד
          </span>
        )}
        {sidebarCollapsed && (
          <span className="text-xl font-bold text-brand">י</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn("ms-auto size-8", sidebarCollapsed && "ms-0")}
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <PanelLeftIcon className={cn("size-4 transition-transform", isRTL && "scale-x-[-1]", sidebarCollapsed && "rotate-180")} />
        </Button>
      </div>

      {/* Navigation links */}
      <ScrollArea className="flex-1 py-2">
        <nav className={cn("flex flex-col gap-1", sidebarCollapsed ? "px-1" : "px-2")}>
          {NAV_ITEMS.map((item) => (
            <SidebarNavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={t(item.labelKey)}
              collapsed={sidebarCollapsed}
            />
          ))}
        </nav>
      </ScrollArea>

      <Separator />

      {/* Footer area — can show user info later */}
      <div className={cn("py-3", sidebarCollapsed ? "px-1" : "px-2")} />
    </aside>
  );
}
