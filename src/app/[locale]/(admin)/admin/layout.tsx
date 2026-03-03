// Layer 2: Server Component auth guard for admin routes.
// Even if proxy.ts (Layer 1) is bypassed (CVE-2025-29927), this guard
// runs on the server and will redirect non-admin users.

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sessionClaims } = await auth();
  const role = sessionClaims?.metadata?.role;

  if (role !== "admin") {
    redirect("/");
  }

  return <>{children}</>;
}
