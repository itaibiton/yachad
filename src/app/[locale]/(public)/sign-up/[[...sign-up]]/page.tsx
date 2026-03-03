import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <SignUp
      appearance={{
        variables: {
          colorPrimary: "#0038b8", // Israeli blue brand color
        },
      }}
    />
  );
}
