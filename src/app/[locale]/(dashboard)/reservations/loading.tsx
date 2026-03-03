import { CardSkeleton } from "@/shared/components/LoadingSkeleton";

export default function ReservationsLoading() {
  return (
    <div className="flex flex-col gap-4">
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </div>
  );
}
