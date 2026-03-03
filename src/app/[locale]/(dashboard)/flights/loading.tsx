import { FlightCardSkeleton } from "@/shared/components/LoadingSkeleton";

export default function FlightsLoading() {
  return (
    <div className="flex flex-col gap-4">
      <FlightCardSkeleton />
      <FlightCardSkeleton />
      <FlightCardSkeleton />
    </div>
  );
}
