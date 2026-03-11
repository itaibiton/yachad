import { mutation } from "../../_generated/server";
import { requireUser } from "../../lib/auth";

/**
 * generateUploadUrl — returns a short-lived URL for uploading a file to Convex storage.
 *
 * Requires authentication. Reusable by any module that needs file uploads.
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireUser(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});
