"use client";

import ErrorBoundary from "@/shared/components/ErrorBoundary";

export default function FlightsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error("[flights/error]", error);
  return <ErrorBoundary error={error} reset={reset} />;
}
