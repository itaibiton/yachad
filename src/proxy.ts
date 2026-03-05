import { clerkClient, clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

// Public routes do not require authentication
const isPublicRoute = createRouteMatcher([
  "/:locale/sign-in(.*)",
  "/:locale/sign-up(.*)",
  "/:locale/sso-callback(.*)",
  "/:locale", // exact home (public landing)
  "/api(.*)", // API routes are public (auth handled per-route)
]);

// Role-protected routes
const isAgentRoute = createRouteMatcher(["/:locale/agent(.*)"]);
const isAdminRoute = createRouteMatcher(["/:locale/admin(.*)"]);

const isApiRoute = createRouteMatcher(["/api(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // Skip intl middleware for API routes — they don't need locale prefixing
  if (isApiRoute(req)) {
    return;
  }

  // Run next-intl locale detection/redirect for every request
  // Must happen before auth.protect() fires a redirect so locale
  // detection is applied on every request including the sign-in redirect
  const intlResponse = intlMiddleware(req);

  // Protect all non-public routes (require sign-in)
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  // RBAC: role-based route enforcement
  // First try session claims (available when session token is customized in
  // Clerk Dashboard to include publicMetadata). Fall back to fetching the
  // user directly so RBAC works even without that Dashboard configuration.
  const { sessionClaims, userId } = await auth();
  let role = sessionClaims?.metadata?.role as string | undefined;

  if (!role && userId && (isAgentRoute(req) || isAdminRoute(req))) {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    role = (user.publicMetadata as Record<string, unknown>)?.role as string | undefined;
  }

  if (isAgentRoute(req) && role !== "agent" && role !== "admin") {
    return Response.redirect(new URL("/", req.url));
  }
  if (isAdminRoute(req) && role !== "admin") {
    return Response.redirect(new URL("/", req.url));
  }

  return intlResponse;
});

export const config = {
  matcher: [
    // Exclude static files, _next internals, and non-route assets
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
