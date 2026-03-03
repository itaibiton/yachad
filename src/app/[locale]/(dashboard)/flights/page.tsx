import { Suspense } from "react";
import { FlightsClientPage } from "@/shared/components/flights/FlightsClientPage";
import { FlightCardSkeleton } from "@/shared/components/LoadingSkeleton";

// Server Component — async
// NOTE: preloadQuery does NOT support pagination. The client-side
// usePaginatedQuery handles real-time data reactively. This page simply
// renders the client page which manages its own data fetching.
// The Suspense boundary with skeleton provides instant visual feedback.
export default async function FlightsPage() {
  return (
    <Suspense fallback={<FlightsPageSkeleton />}>
      <FlightsClientPage />
    </Suspense>
  );
}

function FlightsPageSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {/* Filter bar skeleton */}
      <div className="flex gap-3 overflow-x-auto border-b py-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 w-32 shrink-0 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
      {/* Grid skeleton */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <FlightCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
