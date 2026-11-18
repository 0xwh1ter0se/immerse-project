import { getTranslations } from "next-intl/server";
import { Link } from "../../../../i18n/navigation";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { ProgressBar } from "../../../components/ui/ProgressBar";
import { EmptyState } from "../../../components/ui/EmptyState";
import { DEMO_VIDEO, INITIAL_SAVED_WORDS, INITIAL_PROGRESS } from "../../../lib/demo-data";

export default async function DashboardPage() {
  const t = await getTranslations("Dashboard");

  const progressPercent = Math.round(
    (INITIAL_PROGRESS.watchedSeconds / DEMO_VIDEO.durationSeconds) * 100,
  );

  return (
    <main className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-blue">{t("eyebrow")}</p>
        <h1 className="mt-3 text-balance font-display text-3xl font-extrabold leading-heading tracking-tight text-text-primary">
          {t("title")}
        </h1>
        <p className="mt-3 max-w-prose text-pretty leading-body text-text-secondary">
          {t("description")}
        </p>
      </div>

      {/* Kartu Lanjutkan Belajar */}
      <Card className="overflow-hidden border-border bg-bg-surface p-6 shadow-card">
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs font-bold uppercase tracking-wider text-blue">
            {t("continueEyebrow")}
          </span>
          <Badge tone="neutral">{t("sampleTag")}</Badge>
        </div>
        <h2 className="mt-2 font-display text-xl font-bold leading-heading text-text-primary">
          {t("continueTitle")}
        </h2>
        <p className="mt-2 max-w-prose text-sm leading-body text-text-secondary">
          {t("continueBody")}
        </p>

        <div className="mt-6 grid grid-cols-1 gap-6 rounded-xl border border-border bg-bg-elevated p-4 md:grid-cols-[200px_minmax(0,1fr)]">
          <div className="relative aspect-video flex-shrink-0 overflow-hidden rounded-lg border border-border bg-bg-surface flex items-center justify-center">
            <span className="font-display text-sm font-semibold text-text-secondary">▶ 03:12</span>
          </div>

          <div className="flex flex-col justify-between space-y-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-text-muted">
                {DEMO_VIDEO.sourceLanguage} → {DEMO_VIDEO.targetLanguage} · 03:12
              </p>
              <h3 className="mt-1 font-display text-base font-bold text-text-primary">
                {DEMO_VIDEO.title}
              </h3>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-text-secondary">
                <span>00:28 / 03:12</span>
                <span>{progressPercent}%</span>
              </div>
              <ProgressBar value={progressPercent} label={t("progressTitle")} />
            </div>

            <div>
              <Link
                href="/study"
                className="inline-flex min-h-11 items-center rounded-pill border border-blue bg-blue px-5 text-sm font-semibold text-text-inverse transition-[opacity,transform] duration-fast hover:bg-blue-hover"
              >
                {t("continueCta")}
              </Link>
            </div>
          </div>
        </div>
      </Card>

      {/* 2 Kartu Bawah: Progres & Koleksi Kata */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_.9fr]">
        <Card className="border-border bg-bg-surface p-6 shadow-card">
          <p className="text-xs font-bold uppercase tracking-wider text-blue">
            {t("progressEyebrow")}
          </p>
          <h2 className="mt-2 font-display text-lg font-bold leading-heading text-text-primary">
            {t("progressTitle")}
          </h2>

          <div className="mt-6 grid grid-cols-3 gap-3 border-y border-border py-4 text-center">
            <div>
              <p className="font-display text-3xl font-extrabold tabular-nums text-text-primary">
                {INITIAL_SAVED_WORDS.length}
              </p>
              <p className="mt-1 text-xs text-text-secondary">{t("wordsSaved")}</p>
            </div>
            <div>
              <p className="font-display text-3xl font-extrabold tabular-nums text-text-primary">
                1
              </p>
              <p className="mt-1 text-xs text-text-secondary">{t("videosStudied")}</p>
            </div>
            <div>
              <p className="font-display text-3xl font-extrabold tabular-nums text-text-primary">
                3
              </p>
              <p className="mt-1 text-xs text-text-secondary">{t("studyDays")}</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-text-muted">{t("progressEmpty")}</p>
        </Card>

        <Card className="border-border bg-bg-surface p-6 shadow-card">
          <p className="text-xs font-bold uppercase tracking-wider text-blue">
            {t("wordsEyebrow")}
          </p>
          <h2 className="mt-2 font-display text-lg font-bold leading-heading text-text-primary">
            {t("wordsTitle")}
          </h2>

          {INITIAL_SAVED_WORDS.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                mark="Aa"
                title={t("wordsEmpty")}
                description=""
                actionLabel={t("wordsEmptyCta")}
                actionHref="/study"
              />
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <ul className="divide-y divide-border">
                {INITIAL_SAVED_WORDS.slice(0, 3).map((w) => (
                  <li key={w.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm text-text-primary">{w.term}</p>
                      <p className="text-xs text-text-secondary">{w.meaning}</p>
                    </div>
                    <Badge tone="success">{w.status}</Badge>
                  </li>
                ))}
              </ul>
              <div className="pt-2">
                <Link
                  href="/vocabulary"
                  className="text-xs font-semibold text-blue hover:underline"
                >
                  Lihat semua {INITIAL_SAVED_WORDS.length} kata →
                </Link>
              </div>
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}
