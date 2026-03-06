import type { Metadata } from "next";
import { Inter, Heebo } from "next/font/google";
import { ConvexClientProvider } from "@/providers/ConvexClientProvider";
import "@/app/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  variable: "--font-heebo",
});

export const metadata: Metadata = {
  title: "Yachad | יחד",
  description:
    "A real-time crisis-response platform connecting stranded Israelis with extraction flights, Jewish community services, and each other.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning className={`${inter.variable} ${heebo.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ConvexClientProvider>
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  );
}
