"use client";

import { Home, Plane, Newspaper, MapPin, Users, MessageSquare, Hotel, PanelLeftIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarNavItem } from "./SidebarNavItem";
import { useAppStore } from "@/stores/appStore";
import { useDirection } from "@/shared/hooks/useDirection";

// Module navigation links in crisis priority order per CONTEXT.md
const NAV_ITEMS = [
  { href: "/overview", icon: Home, labelKey: "home" },
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
        "hidden md:flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300",
        sidebarCollapsed ? "w-14" : "w-64"
      )}
      aria-label="Main navigation"
    >
      {/* Collapse toggle */}
      <div
        className={cn(
          "flex items-center py-4",
          sidebarCollapsed ? "justify-center px-2" : "px-3"
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
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
    </aside>
  );
}
