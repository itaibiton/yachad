"use client";

import { useEffect, useRef } from "react";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/** Ensures the authenticated Clerk user exists in Convex on first load. */
function EnsureUser() {
  const { isSignedIn } = useAuth();
  const getOrCreate = useMutation(api.modules.users.mutations.getOrCreateUser);
  const called = useRef(false);

  useEffect(() => {
    if (isSignedIn && !called.current) {
      called.current = true;
      getOrCreate();
    }
  }, [isSignedIn, getOrCreate]);

  return null;
}

export function ConvexClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <EnsureUser />
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
