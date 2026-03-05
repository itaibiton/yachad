import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { Inter, Heebo } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { routing } from "@/i18n/routing";
import { RadixDirectionProvider } from "@/providers/RadixDirectionProvider";
import { Toaster } from "@/components/ui/sonner";
import "@/app/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  variable: "--font-heebo",
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
    <html lang={locale} dir={dir} className={`${inter.variable} ${heebo.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <NextIntlClientProvider messages={messages}>
          <RadixDirectionProvider dir={dir}>
            <NuqsAdapter>
              {children}
            </NuqsAdapter>
            <Toaster position={dir === "rtl" ? "top-left" : "top-right"} />
          </RadixDirectionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
