import { AppSidebar } from "./sidebar/AppSidebar";
import { TopBar } from "./topbar/TopBar";
import { MobileBottomNav } from "./sidebar/MobileBottomNav";
import { EmergencyButton } from "./topbar/EmergencyButton";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar — hidden on mobile */}
      <AppSidebar />

      {/* Main content column */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>

      {/* Mobile bottom tab navigation — hidden on desktop */}
      <MobileBottomNav />

      {/* Mobile floating emergency button — always on top, above bottom nav */}
      <EmergencyButton isFAB />
    </div>
  );
}
