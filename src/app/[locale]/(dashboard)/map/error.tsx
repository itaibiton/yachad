"use client";

import ErrorBoundary from "@/shared/components/ErrorBoundary";

export default function MapError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error("[map/error]", error);
  return <ErrorBoundary error={error} reset={reset} />;
}
