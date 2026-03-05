"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AgentWizard } from "@/shared/components/agent-onboarding/AgentWizard";

export default function AgentOnboardingPage() {
  const { user } = useUser();
  const router = useRouter();
  const t = useTranslations("agent");

  const isAlreadyAgent = user?.publicMetadata?.role === "agent";

  // Persist onboarding intent so user is redirected back if they leave mid-flow
  useEffect(() => {
    if (user && !isAlreadyAgent && !user.unsafeMetadata?.agentOnboardingPending) {
      user.update({
        unsafeMetadata: { ...user.unsafeMetadata, agentOnboardingPending: true },
      });
    }
  }, [user, isAlreadyAgent]);

  if (isAlreadyAgent) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <CheckCircle2 className="size-12 text-green-500" />
        <h1 className="text-xl font-bold">{t("alreadyAgent")}</h1>
        <Button onClick={() => router.push("/agent")}>{t("goToPortal")}</Button>
      </div>
    );
  }

  return <AgentWizard />;
}
