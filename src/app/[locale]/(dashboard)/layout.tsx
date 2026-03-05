import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/shared/components/DashboardShell";
import { AgentOnboardingGuard } from "@/shared/components/AgentOnboardingGuard";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { userId } = await auth();
  const { locale } = await params;

  if (!userId) {
    redirect(`/${locale}/sign-in`);
  }

  return (
    <DashboardShell>
      <AgentOnboardingGuard />
      {children}
    </DashboardShell>
  );
}
