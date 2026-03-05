"use client";

import { useSearchParams } from "next/navigation";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp
        forceRedirectUrl={redirect || undefined}
        appearance={{
          variables: {
            colorPrimary: "#0038b8",
          },
        }}
      />
      <div id="clerk-captcha" />
    </div>
  );
}
