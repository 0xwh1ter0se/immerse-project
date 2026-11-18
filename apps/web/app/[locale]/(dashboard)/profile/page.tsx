import { getTranslations } from "next-intl/server";
import { Link } from "../../../../i18n/navigation";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";

export default async function ProfilePage() {
  const t = await getTranslations("Profile");

  return (
    <main className="space-y-6 max-w-2xl">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-blue">{t("eyebrow")}</p>
        <h1 className="mt-3 text-balance font-display text-3xl font-extrabold leading-heading tracking-tight text-text-primary">
          {t("title")}
        </h1>
        <p className="mt-2 text-pretty leading-body text-text-secondary">{t("description")}</p>
      </div>

      <Card className="border-border bg-bg-surface p-6 shadow-card space-y-6">
        <div className="flex items-center gap-4 border-b border-border pb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-subtle font-display text-xl font-bold text-blue">
            U
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-text-primary">Demo User</h2>
            <p className="text-xs text-text-secondary">Akun Pembelajar Aktif</p>
          </div>
          <div className="ml-auto">
            <Badge tone="success">Aktif</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-text-muted">
              {t("nameLabel")}
            </p>
            <p className="text-sm font-medium text-text-primary">Demo Learner</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-text-muted">
              {t("emailLabel")}
            </p>
            <p className="text-sm font-medium text-text-primary">learner@immerse.id</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-text-muted">
              {t("targetLangLabel")}
            </p>
            <p className="text-sm font-medium text-text-primary">English (US)</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-text-muted">
              {t("sourceLangLabel")}
            </p>
            <p className="text-sm font-medium text-text-primary">Bahasa Indonesia</p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-bg-elevated p-4 text-xs text-text-secondary">
          <p>{t("storageNotice")}</p>
        </div>

        <div>
          <Link
            href="/dashboard"
            className="inline-flex min-h-11 items-center rounded-pill border border-blue bg-blue px-5 text-sm font-semibold text-text-inverse hover:bg-blue-hover"
          >
            {t("backToDashboard")}
          </Link>
        </div>
      </Card>
    </main>
  );
}
