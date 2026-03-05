"use client";

import { useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/routing";
import { useAgentOnboardingStore } from "@/stores/agentOnboardingStore";

const BRAND_COLORS = [
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#f59e0b", // amber
  "#10b981", // emerald
  "#6366f1", // indigo
];

function Confetti() {
  const particles = useMemo(
    () =>
      Array.from({ length: 25 }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 500,
        y: -(Math.random() * 400 + 100),
        rotate: Math.random() * 720 - 360,
        color: BRAND_COLORS[i % BRAND_COLORS.length],
        size: Math.random() * 8 + 4,
        isCircle: Math.random() > 0.5,
        delay: Math.random() * 0.3,
      })),
    []
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute left-1/2 top-1/2"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.isCircle ? "50%" : "2px",
          }}
          initial={{ x: 0, y: 0, scale: 0, rotate: 0, opacity: 1 }}
          animate={{
            x: p.x,
            y: p.y,
            scale: [0, 1, 1, 0.5],
            rotate: p.rotate,
            opacity: [1, 1, 1, 0],
          }}
          transition={{
            duration: 1.5,
            delay: p.delay,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

export function SuccessStep() {
  const t = useTranslations("agent");
  const router = useRouter();
  const { pendingFlights, reset } = useAgentOnboardingStore();
  const flightCount = pendingFlights.length;

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  return (
    <>
      <Confetti />
      <div className="flex flex-col items-center text-center px-2">
        {/* Animated checkmark */}
        <motion.div
          className="flex size-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <motion.svg
            className="size-10 text-green-600 dark:text-green-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <motion.path d="M5 13l4 4L19 7" />
          </motion.svg>
        </motion.div>

        <motion.h1
          className="mt-6 text-2xl sm:text-3xl font-bold"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {t("wizardSuccessTitle")}
        </motion.h1>

        {flightCount > 0 && (
          <motion.p
            className="mt-2 text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {t("wizardSuccessFlights", { count: flightCount })}
          </motion.p>
        )}

        <motion.div
          className="mt-8 w-full max-w-sm space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Button
            size="lg"
            className="w-full"
            onClick={() => router.push("/agent")}
          >
            {t("wizardGoToPortal")}
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full"
            onClick={() => router.push("/agent")}
          >
            {t("wizardAddMoreFlights")}
          </Button>
        </motion.div>
      </div>
    </>
  );
}
