// Public route group layout — for unauthenticated pages (landing, sign-in, sign-up)
// No sidebar or top bar — just centered content

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      {children}
    </div>
  );
}
