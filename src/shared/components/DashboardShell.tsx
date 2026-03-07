"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { TopBar } from "./topbar/TopBar";
import { MobileBottomNav } from "./sidebar/MobileBottomNav";
import { EmergencyButton } from "./topbar/EmergencyButton";
import { AlertBanner } from "./AlertBanner";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <TopBar />
        <AlertBanner />
        <main className="flex-1 overflow-y-auto p-4 pb-20 md:p-6 md:pb-6">
          {children}
        </main>
      </SidebarInset>

      {/* Mobile bottom tab navigation — hidden on desktop */}
      <MobileBottomNav />

      {/* Mobile floating emergency button — always on top, above bottom nav */}
      <EmergencyButton isFAB />
    </SidebarProvider>
  );
}
