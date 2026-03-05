"use client";

import { type LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDirection } from "@/shared/hooks/useDirection";

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
  const { isRTL } = useDirection();

  const isActive =
    href === "/"
      ? pathname.endsWith("/") || /^\/[a-z]{2}\/?$/.test(pathname)
      : pathname.includes(href.replace(/^\//, ""));

  const link = (
    <Link
      href={href}
      className={cn(
        "flex rtl:flex-row-reverse items-center gap-4 rounded-lg font-sans text-xl font-medium transition-colors",
        collapsed ? "size-10 justify-center p-0" : "w-full px-3 py-3",
        isActive
          ? "bg-brand/10 text-brand hover:bg-brand/15 hover:text-brand"
          : "hover:bg-accent hover:text-accent-foreground"
      )}
      aria-current={isActive ? "page" : undefined}
    >
      <Icon
        className={cn("size-6 shrink-0", isActive ? "text-brand" : "")}
        aria-hidden="true"
      />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );

  if (collapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{link}</TooltipTrigger>
          <TooltipContent side={isRTL ? "left" : "right"}>
            <p>{label}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return link;
}
