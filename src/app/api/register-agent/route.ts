import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * POST /api/register-agent
 *
 * Updates Clerk public metadata to include role: "agent" so the JWT
 * claims reflect the new role on next session refresh. Called by the
 * client after the Convex registerAsAgent mutation succeeds.
 */
export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const client = await clerkClient();
  await client.users.updateUser(userId, {
    publicMetadata: { role: "agent" },
  });

  return NextResponse.json({ ok: true });
}
