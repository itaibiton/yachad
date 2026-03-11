"use client"

import { Home, Plane, Newspaper, MapPin, MessageSquare, Hotel, Upload } from "lucide-react"
import { usePathname } from "next/navigation"
import { useTranslations, useLocale } from "next-intl"
import { useUser } from "@clerk/nextjs"
import { Link } from "@/i18n/routing"
import { NavUser } from "@/components/nav-user"
import { Badge } from "@/components/ui/badge"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

const COMING_SOON = new Set(["/map"])

const NAV_ITEMS = [
  { href: "/feed", icon: Home, labelKey: "home" },
  { href: "/flights", icon: Plane, labelKey: "flights" },
  { href: "/news", icon: Newspaper, labelKey: "news" },
  { href: "/chat", icon: MessageSquare, labelKey: "chat" },
  { href: "/map", icon: MapPin, labelKey: "map" },
  { href: "/reservations", icon: Hotel, labelKey: "reservations" },
] as const

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const t = useTranslations("nav")
  const locale = useLocale()
  const pathname = usePathname()
  const { user } = useUser()
  const role = user?.publicMetadata?.role as string | undefined
  const isAgent = role === "agent" || role === "admin"

  const navItems = isAgent
    ? [...NAV_ITEMS, { href: "/agent" as const, icon: Upload, labelKey: "agent" as const }]
    : NAV_ITEMS

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="p-4 overflow-hidden">
        <Link href="/" className="flex items-center gap-2.5 py-2 group-data-[collapsible=icon]:justify-center">
          <div className="grid grid-cols-3 gap-0.5 p-1.5 rounded-lg bg-white border border-gray-200 shadow-sm shrink-0">
            {[
              "#0038b8", "#1a4fd6", "#3b69e8",
              "#6487f0", "#0038b8", "#93a8f5",
              "#3b69e8", "#93a8f5", "#1a4fd6",
            ].map((color, i) => (
              <div
                key={i}
                className="w-2.5 h-2.5 rounded-[2px]"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <span className={`font-black tracking-tight whitespace-nowrap transition-all duration-200 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:overflow-hidden ${locale === "he" ? "text-4xl" : "text-2xl"}`}>
            {locale === "he" ? "יחד" : "Yachad"}
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="p-4">
          <SidebarMenu>
            {navItems.map((item) => {
              const isActive = pathname.includes(item.href.replace(/^\//, ""))
              const isDisabled = COMING_SOON.has(item.href)

              if (isDisabled) {
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton disabled tooltip={t(item.labelKey)} className="text-xl py-6 [&>svg]:size-6 opacity-50 cursor-not-allowed">
                      <item.icon />
                      <span>{t(item.labelKey)}</span>
                      <Badge variant="secondary" className="ms-auto text-[10px] px-1.5 py-0 font-normal group-data-[collapsible=icon]:hidden">
                        {locale === "he" ? "בקרוב" : "Soon"}
                      </Badge>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              }

              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive} tooltip={t(item.labelKey)} className="text-xl py-6 [&>svg]:size-6">
                    <Link href={item.href}>
                      <item.icon />
                      <span>{t(item.labelKey)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
