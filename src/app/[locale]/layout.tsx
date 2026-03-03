import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { Inter } from "next/font/google";
import { routing } from "@/i18n/routing";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import "@/app/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const RTL_LOCALES = ["he"];

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params; // MUST await — Next.js 16 async params
  if (!routing.locales.includes(locale as any)) notFound();

  const messages = await getMessages();
  const dir = RTL_LOCALES.includes(locale) ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider>
          <NextIntlClientProvider messages={messages}>
            {children}
            <Toaster position={dir === "rtl" ? "top-left" : "top-right"} />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
