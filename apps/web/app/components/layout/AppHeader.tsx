"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "../../../i18n/navigation";

export function AppHeader() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("Header");

  return (
    <header className="sticky top-0 z-card border-b border-border bg-bg-base/95">
      <div className="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between px-3 sm:px-6">
        <Link
          href={pathname}
          className="flex min-h-11 items-center gap-2 font-display text-xl font-extrabold tracking-tight text-text-primary"
          aria-label={t("homeLabel")}
        >
          <span
            className="flex h-8 w-8 items-end justify-center gap-1 rounded-md border border-border bg-bg-elevated pb-1.5"
            aria-hidden="true"
          >
            <span className="h-2 w-1 rounded-sm bg-blue" />
            <span className="h-3.5 w-1 rounded-sm bg-blue" />
            <span className="h-5 w-1 rounded-sm bg-blue" />
          </span>
          <span>immerse.</span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2" aria-label={t("navigationLabel")}>
          <Link
            href="/plans"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-pill px-1.5 text-sm font-semibold text-text-primary transition-[opacity,transform] duration-fast ease-out active:scale-[0.96] sm:px-3"
          >
            {t("plans")}
          </Link>
          <Link
            href="/login"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-pill px-1 text-sm font-semibold text-text-primary transition-[opacity,transform] duration-fast ease-out active:scale-[0.96] sm:px-4"
          >
            {t("login")}
          </Link>
          <Link
            href="/register"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-pill border border-blue bg-blue px-2 text-sm font-semibold text-text-inverse transition-[opacity,transform] duration-fast ease-out active:scale-[0.96] sm:px-4"
          >
            {t("register")}
          </Link>
          <div className="ml-1 flex items-center text-xs sm:ml-2" aria-label={t("languageLabel")}>
            <Link
              href={pathname}
              locale={locale === "id" ? "en" : "id"}
              lang={locale === "id" ? "en" : "id"}
              aria-label={locale === "id" ? t("english") : t("indonesian")}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-pill font-semibold text-text-secondary transition-colors duration-fast ease-out hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
            >
              {locale === "id" ? "EN" : "ID"}
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
