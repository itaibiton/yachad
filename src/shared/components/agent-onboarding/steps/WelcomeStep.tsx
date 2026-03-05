"use client";

import { useTranslations } from "next-intl";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Plane, MessageCircle, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAgentOnboardingStore } from "@/stores/agentOnboardingStore";

const BENEFITS = [
  { icon: Plane, key: "wizardBenefit1" },
  { icon: LayoutDashboard, key: "wizardBenefit2" },
  { icon: MessageCircle, key: "wizardBenefit3" },
] as const;

export function WelcomeStep() {
  const t = useTranslations("agent");
  const { user } = useUser();
  const goNext = useAgentOnboardingStore((s) => s.goNext);

  const firstName = user?.firstName || "";

  return (
    <div className="flex flex-col items-center text-center px-2">
      {/* Avatar */}
      {user?.imageUrl && (
        <motion.img
          src={user.imageUrl}
          alt=""
          className="size-20 rounded-full border-4 border-brand/20 mb-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        />
      )}

      {/* Greeting */}
      <motion.h1
        className="text-2xl sm:text-3xl font-bold tracking-tight"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {t("wizardWelcomeTitle", { name: firstName })}
      </motion.h1>

      <motion.p
        className="mt-2 text-muted-foreground"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {t("wizardWelcomeSubtitle")}
      </motion.p>

      {/* Benefits */}
      <div className="mt-8 w-full max-w-sm space-y-4">
        {BENEFITS.map(({ icon: Icon, key }, i) => (
          <motion.div
            key={key}
            className="flex items-center gap-3 rounded-xl border bg-card p-4 text-start"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand/10">
              <Icon className="size-5 text-brand" />
            </div>
            <span className="text-sm font-medium">{t(key)}</span>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <motion.div
        className="mt-10 w-full max-w-sm space-y-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <p className="text-sm text-muted-foreground">{t("wizardReadyPrompt")}</p>
        <Button size="lg" className="w-full" onClick={goNext}>
          {t("wizardGetStarted")}
        </Button>
      </motion.div>
    </div>
  );
}
