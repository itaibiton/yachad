import { type AuthConfig } from "convex/server";

export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: "convex", // MUST be "convex" — hardcoded in ConvexProviderWithClerk
    },
  ],
} satisfies AuthConfig;
