import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <SignIn
      appearance={{
        variables: {
          colorPrimary: "#0038b8", // Israeli blue brand color
        },
      }}
    />
  );
}
