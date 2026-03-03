"use client";

import ErrorBoundary from "@/shared/components/ErrorBoundary";

export default function FeedError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error("[feed/error]", error);
  return <ErrorBoundary error={error} reset={reset} />;
}
