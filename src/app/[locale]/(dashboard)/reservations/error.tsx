"use client";

import ErrorBoundary from "@/shared/components/ErrorBoundary";

export default function ReservationsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error("[reservations/error]", error);
  return <ErrorBoundary error={error} reset={reset} />;
}
