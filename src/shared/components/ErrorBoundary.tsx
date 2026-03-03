"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * ErrorBoundary component for Next.js App Router error.tsx convention.
 * Receives `error` and `reset` props from Next.js error boundary.
 * Displays bilingual user-friendly error messages using next-intl.
 */
export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  const t = useTranslations("errors");
  const tCommon = useTranslations("common");

  // Determine which error message to show based on error type
  const getMessage = () => {
    const msg = error.message?.toLowerCase() ?? "";
    if (msg.includes("not found") || msg.includes("404")) return t("notFound");
    if (msg.includes("unauthorized") || msg.includes("403") || msg.includes("401")) return t("unauthorized");
    if (msg.includes("network") || msg.includes("fetch") || msg.includes("connection")) return t("networkError");
    return t("generic");
  };

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-6">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        {/* Error icon — warm red, not scary */}
        <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="size-8 text-destructive" aria-hidden="true" />
        </div>

        {/* Error title */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">
            {tCommon("error")}
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {getMessage()}
          </p>
          {/* Show digest for debug in development */}
          {process.env.NODE_ENV === "development" && error.digest && (
            <p className="rounded bg-muted px-2 py-1 font-mono text-xs text-muted-foreground">
              {error.digest}
            </p>
          )}
        </div>

        {/* Retry button */}
        <Button
          onClick={reset}
          variant="outline"
          className="mt-2 gap-2 rounded-lg"
        >
          <RefreshCw className="size-4" aria-hidden="true" />
          {tCommon("retry")}
        </Button>
      </div>
    </div>
  );
}
