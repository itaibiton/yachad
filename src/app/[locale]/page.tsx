import { useTranslations } from "next-intl";
import Link from "next/link";

export default function HomePage() {
  const t = useTranslations();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">{t("app.name")}</h1>
        <p className="mt-2 text-xl text-muted-foreground">{t("app.tagline")}</p>
        <p className="mt-4 max-w-md text-sm text-muted-foreground">
          {t("app.description")}
        </p>
      </div>

      <div className="flex gap-4">
        <Link
          href="/sign-in"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {t("auth.signIn")}
        </Link>
        <Link
          href="/sign-up"
          className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-6 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          {t("auth.signUp")}
        </Link>
      </div>
    </main>
  );
}
