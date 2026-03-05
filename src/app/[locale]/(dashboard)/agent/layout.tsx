// Layer 2: Server Component auth guard for agent routes.
// Even if proxy.ts (Layer 1) is bypassed (CVE-2025-29927), this guard
// runs on the server and will redirect non-agent users.

import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sessionClaims, userId } = await auth();
  let role = sessionClaims?.metadata?.role as string | undefined;

  if (!role && userId) {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    role = (user.publicMetadata as Record<string, unknown>)?.role as
      | string
      | undefined;
  }

  if (role !== "agent" && role !== "admin") {
    redirect("/");
  }

  return <>{children}</>;
}
