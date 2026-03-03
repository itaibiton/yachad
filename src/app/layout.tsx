import type { Metadata } from "next";
import { ConvexClientProvider } from "@/providers/ConvexClientProvider";

export const metadata: Metadata = {
  title: "Yachad | יחד",
  description:
    "A real-time crisis-response platform connecting stranded Israelis with extraction flights, Jewish community services, and each other.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexClientProvider>
      {children}
    </ConvexClientProvider>
  );
}
