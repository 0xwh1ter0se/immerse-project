import { useTranslations } from "next-intl";
import { Link } from "../../../i18n/navigation";

export function AppSidebar() {
  const t = useTranslations("Dashboard");
  const navigationItems = [
    { href: "/dashboard", label: t("navHome") },
    { href: "/study", label: t("navStudy") },
    { href: "/vocabulary", label: t("navVocabulary") },
    { href: "/profile", label: t("navProfile") },
  ] as const;

  return (
    <aside className="hidden w-56 shrink-0 border-r border-border px-4 py-6 md:block">
      <nav className="sticky top-20 space-y-1" aria-label={t("navigationLabel")}>
        {navigationItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-text-secondary transition-[opacity,transform] duration-fast ease-out hover:bg-bg-elevated hover:text-text-primary"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
