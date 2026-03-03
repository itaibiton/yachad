"use client";

import ErrorBoundary from "@/shared/components/ErrorBoundary";

export default function NewsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error("[news/error]", error);
  return <ErrorBoundary error={error} reset={reset} />;
}
