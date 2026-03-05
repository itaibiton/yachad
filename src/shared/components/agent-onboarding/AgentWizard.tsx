"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDirection } from "@/shared/hooks/useDirection";
import { useAgentOnboardingStore } from "@/stores/agentOnboardingStore";
import { LanguageToggle } from "@/shared/components/topbar/LanguageToggle";
import { WizardStepIndicator } from "./WizardStepIndicator";
import { WelcomeStep } from "./steps/WelcomeStep";
import { ProfileStep } from "./steps/ProfileStep";
import { FlightStep } from "./steps/FlightStep";
import { ReviewStep } from "./steps/ReviewStep";
import { SuccessStep } from "./steps/SuccessStep";

const STEPS = [WelcomeStep, ProfileStep, FlightStep, ReviewStep, SuccessStep];

export function AgentWizard() {
  const { currentStep, direction, goBack } = useAgentOnboardingStore();
  const { isRTL } = useDirection();

  const StepComponent = STEPS[currentStep] ?? WelcomeStep;
  const showBackButton = currentStep > 0 && currentStep < 4;
  const showIndicator = currentStep >= 1 && currentStep <= 3;

  // RTL-aware slide offset
  const xOffset = (isRTL ? -1 : 1) * direction * 200;

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
      {/* Slim header */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-background/80 backdrop-blur-sm border-b">
        <div className="w-20">
          {showBackButton && (
            <Button variant="ghost" size="sm" onClick={goBack}>
              <ArrowLeft className="size-4 me-1 rtl:rotate-180" />
              <span className="sr-only sm:not-sr-only">{/* Back */}</span>
            </Button>
          )}
        </div>

        {/* Step indicator (centered) */}
        <div className="flex-1 flex justify-center">
          {showIndicator && (
            <WizardStepIndicator activeIndex={currentStep - 1} />
          )}
        </div>

        <div className="w-20 flex justify-end">
          <LanguageToggle />
        </div>
      </header>

      {/* Step content */}
      <main className="mx-auto max-w-2xl px-4 pb-24 pt-8">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentStep}
            initial={{ x: xOffset, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -xOffset, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <StepComponent />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
