import { ReservationsClientPage } from "@/shared/components/reservations/ReservationsClientPage";

export default async function ReservationsPage({ params }: { params: Promise<{ locale: string }> }) {
  await params;
  return <ReservationsClientPage />;
}
