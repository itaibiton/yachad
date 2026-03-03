"use client";

import { type LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarNavItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
  collapsed?: boolean;
}

export function SidebarNavItem({
  href,
  icon: Icon,
  label,
  collapsed = false,
}: SidebarNavItemProps) {
  const pathname = usePathname();
  // Check if current pathname includes the href segment (excluding home)
  const isActive =
    href === "/"
      ? pathname.endsWith("/") || /^\/[a-z]{2}\/?$/.test(pathname)
      : pathname.includes(href.replace(/^\//, ""));

  const button = (
    <Button
      variant="ghost"
      asChild
      className={cn(
        "w-full justify-start gap-3 rounded-lg font-sans transition-colors",
        collapsed ? "size-10 justify-center p-0" : "ps-3 pe-4",
        isActive
          ? "bg-brand/10 text-brand hover:bg-brand/15 hover:text-brand"
          : "hover:bg-accent hover:text-accent-foreground"
      )}
      aria-current={isActive ? "page" : undefined}
    >
      <Link href={href}>
        <Icon
          className={cn("size-5 shrink-0", isActive ? "text-brand" : "")}
          aria-hidden="true"
        />
        {!collapsed && (
          <span className="truncate text-sm font-medium">{label}</span>
        )}
      </Link>
    </Button>
  );

  if (collapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent side="right">
            <p>{label}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
}
