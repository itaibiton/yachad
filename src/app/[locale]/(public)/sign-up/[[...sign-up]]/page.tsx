import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp
        appearance={{
          variables: {
            colorPrimary: "#0038b8",
          },
        }}
      />
    </div>
  );
}
