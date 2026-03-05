"use client";

import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["wizardStepProfile", "wizardStepFlight", "wizardStepReview"] as const;

interface WizardStepIndicatorProps {
  /** Active step index within the indicator (0 = Profile, 1 = Flight, 2 = Review) */
  activeIndex: number;
}

export function WizardStepIndicator({ activeIndex }: WizardStepIndicatorProps) {
  const t = useTranslations("agent");

  return (
    <div className="w-full">
      {/* Desktop + Mobile: step circles with connecting lines */}
      <div className="flex items-center justify-center gap-0">
        {STEPS.map((key, i) => {
          const isCompleted = i < activeIndex;
          const isCurrent = i === activeIndex;

          return (
            <div key={key} className="flex items-center">
              {/* Connecting line before (except first) */}
              {i > 0 && (
                <div
                  className={cn(
                    "h-0.5 w-8 sm:w-16 transition-colors duration-300",
                    i <= activeIndex ? "bg-brand" : "bg-muted"
                  )}
                />
              )}

              {/* Step circle + label */}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full text-sm font-medium transition-colors duration-300",
                    isCompleted && "bg-brand text-white",
                    isCurrent && "border-2 border-brand bg-brand/10 text-brand",
                    !isCompleted && !isCurrent && "border-2 border-muted bg-muted/50 text-muted-foreground"
                  )}
                >
                  {isCompleted ? <Check className="size-4" /> : i + 1}
                </div>

                {/* Label: always show on desktop, only current on mobile */}
                <span
                  className={cn(
                    "text-xs font-medium transition-colors duration-300",
                    isCurrent ? "text-brand" : isCompleted ? "text-foreground" : "text-muted-foreground",
                    !isCurrent && "hidden sm:block"
                  )}
                >
                  {t(key)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
