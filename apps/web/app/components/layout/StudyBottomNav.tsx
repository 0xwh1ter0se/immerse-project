"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "../../../i18n/navigation";

export function StudyBottomNav() {
  const t = useTranslations("Dashboard");
  const pathname = usePathname();

  const navigationItems = [
    { href: "/dashboard", label: t("navHome") },
    { href: "/study", label: t("navStudy") },
    { href: "/vocabulary", label: t("navVocabulary") },
    { href: "/profile", label: t("navProfile") },
  ] as const;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-card border-t border-border bg-bg-base/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      aria-label={t("navigationLabel")}
    >
      <div className="grid h-16 grid-cols-4 items-center">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`relative flex min-h-14 flex-col items-center justify-center text-xs transition-[color,transform] duration-fast ease-out ${
                isActive
                  ? "font-semibold text-text-primary"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {isActive && (
                <span
                  className="absolute top-0 h-0.5 w-8 rounded-pill bg-blue"
                  aria-hidden="true"
                />
              )}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
