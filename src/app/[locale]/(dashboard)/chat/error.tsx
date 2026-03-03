"use client";

import ErrorBoundary from "@/shared/components/ErrorBoundary";

export default function ChatError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error("[chat/error]", error);
  return <ErrorBoundary error={error} reset={reset} />;
}
