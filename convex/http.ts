import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { Webhook } from "svix";
import { internal } from "./_generated/api";

const http = httpRouter();

/**
 * Clerk webhook endpoint — syncs user lifecycle events to Convex.
 *
 * Handles:
 *   - user.created: Inserts a new user document in the users table
 *   - user.updated: Updates email, name, imageUrl on the user document
 *   - user.deleted: Soft-deletes the user by setting isBanned: true
 *
 * Security: Svix signature verification using CLERK_WEBHOOK_SECRET env var.
 * Any request with an invalid signature is rejected with 400.
 */
http.route({
  path: "/clerk-users-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("CLERK_WEBHOOK_SECRET is not set");
      return new Response("Webhook secret not configured", { status: 500 });
    }

    // Extract Svix signature headers
    const svixId = request.headers.get("svix-id");
    const svixTimestamp = request.headers.get("svix-timestamp");
    const svixSignature = request.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      return new Response("Missing Svix headers", { status: 400 });
    }

    // Read body as text for signature verification
    const body = await request.text();

    // Verify the webhook signature using Svix
    let event: { type: string; data: Record<string, unknown> };
    try {
      const webhook = new Webhook(webhookSecret);
      event = webhook.verify(body, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as { type: string; data: Record<string, unknown> };
    } catch (err) {
      console.error("Invalid webhook signature:", err);
      return new Response("Invalid webhook signature", { status: 400 });
    }

    // Route to appropriate internal mutation based on event type
    const eventType = event.type;
    const data = event.data;

    if (eventType === "user.created" || eventType === "user.updated") {
      const clerkId = data.id as string;
      const emailAddresses = data.email_addresses as Array<{
        email_address: string;
        id: string;
      }>;
      const primaryEmailAddressId = data.primary_email_address_id as string;
      const primaryEmail = emailAddresses.find(
        (e) => e.id === primaryEmailAddressId
      );

      const firstName = (data.first_name as string) ?? "";
      const lastName = (data.last_name as string) ?? "";
      const name =
        [firstName, lastName].filter(Boolean).join(" ") || "Unknown";

      const imageUrl = data.image_url as string | undefined;

      // Extract role from public metadata (set by admin dashboard)
      const publicMetadata = (data.public_metadata as Record<string, unknown>) ?? {};
      const role = (publicMetadata.role as string) ?? "user";

      await ctx.runMutation(internal.modules.users.mutations.upsertFromClerk, {
        clerkId,
        email: primaryEmail?.email_address ?? "",
        name,
        imageUrl,
        role,
      });
    } else if (eventType === "user.deleted") {
      const clerkId = data.id as string;
      await ctx.runMutation(internal.modules.users.mutations.deleteFromClerk, {
        clerkId,
      });
    }

    return new Response(null, { status: 200 });
  }),
});

export default http;
