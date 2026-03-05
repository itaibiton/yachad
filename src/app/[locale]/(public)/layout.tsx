// Public route group layout — for unauthenticated pages (landing, sign-in, sign-up)
// No sidebar or top bar — full-bleed content

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
