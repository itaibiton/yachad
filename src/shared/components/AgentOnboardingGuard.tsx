"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter, usePathname } from "@/i18n/routing";

/**
 * Redirects users with pending agent onboarding back to the wizard.
 * Also handles post-auth redirect from sessionStorage (set by landing page
 * when user clicks "Sign in as Agent" before authenticating).
 * Renders nothing — just performs the redirect check.
 */
export function AgentOnboardingGuard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoaded || !user) return;

    // Check for post-auth redirect stored by landing page (e.g. agent sign-in)
    const postAuthRedirect = sessionStorage.getItem(
      "yachad-post-auth-redirect"
    );
    if (postAuthRedirect) {
      sessionStorage.removeItem("yachad-post-auth-redirect");
      if (pathname !== postAuthRedirect) {
        router.replace(postAuthRedirect);
        return;
      }
    }

    if (pathname.startsWith("/agent-onboarding")) return;

    const isPending = user.unsafeMetadata?.agentOnboardingPending === true;
    const isAgent = user.publicMetadata?.role === "agent";

    if (isPending && !isAgent) {
      router.replace("/agent-onboarding");
    }
  }, [isLoaded, user, pathname, router]);

  return null;
}
