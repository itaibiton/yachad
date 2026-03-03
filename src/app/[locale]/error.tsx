"use client";

import ErrorBoundary from "@/shared/components/ErrorBoundary";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Log error for monitoring integration (future)
  console.error("[locale/error]", error);

  return <ErrorBoundary error={error} reset={reset} />;
}
