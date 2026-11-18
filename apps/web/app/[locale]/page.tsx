import { getTranslations } from "next-intl/server";
import { Link } from "../../i18n/navigation";
import { MersiPose } from "../components/mersi/MersiPose";
import { MersiInteractiveHero } from "../components/mersi/MersiInteractiveHero";
import { MersiInteractiveGallery } from "../components/mersi/MersiInteractiveGallery";
import { MersiFloatingChat } from "../components/mersi/MersiFloatingChat";
import { MersiSticker } from "../components/mersi/MersiSticker";

type Benefit = {
  index: string;
  title: string;
  text: string;
};

type Step = {
  title: string;
  text: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isBenefit(value: unknown): value is Benefit {
  return (
    isRecord(value) &&
    typeof value.index === "string" &&
    typeof value.title === "string" &&
    typeof value.text === "string"
  );
}

function isStep(value: unknown): value is Step {
  return isRecord(value) && typeof value.title === "string" && typeof value.text === "string";
}

function getMessageArray<T>(value: unknown, guard: (item: unknown) => item is T): T[] {
  if (!Array.isArray(value) || !value.every(guard)) {
    throw new Error("Invalid landing page translations");
  }
  return value;
}

export default async function HomePage() {
  const t = await getTranslations("Landing");
  const benefits = getMessageArray(t.raw("benefits"), isBenefit);
  const steps = getMessageArray(t.raw("steps"), isStep);

  return (
    <main className="min-h-screen overflow-hidden bg-bg-base relative">
      {/* 1. HERO SECTION */}
      <section className="relative mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-10 px-6 py-12 md:grid-cols-[1.1fr_0.9fr] md:py-16">
        <div>
          <div className="flex items-center gap-2">
            <MersiSticker pose="wink" label="Partner Belajarmu" />
            <p className="text-xs font-bold uppercase tracking-wider text-blue">
              {t("heroEyebrow")}
            </p>
          </div>
          <h1 className="mt-4 max-w-2xl text-balance font-display text-hero font-extrabold leading-display tracking-tight text-text-primary">
            {t("heroTitle")}
          </h1>
          <p className="mt-5 max-w-prose text-pretty leading-body text-text-secondary">
            {t("heroDescription")}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="inline-flex min-h-11 items-center justify-center rounded-pill border border-blue bg-blue px-6 text-sm font-semibold text-text-inverse transition-transform duration-fast ease-out active:scale-[0.96] hover:bg-blue-hover"
            >
              {t("startLearning")}
            </Link>
            <a
              href="#cara-belajar"
              className="inline-flex min-h-11 items-center justify-center rounded-pill border border-border bg-bg-elevated px-6 text-sm font-semibold text-text-primary transition-transform duration-fast ease-out active:scale-[0.96] hover:bg-bg-surface"
            >
              {t("seeHow")}
            </a>
          </div>
        </div>

        {/* Hero Visual: Mersi Berukuran Besar & Penuh Karakter */}
        <div className="relative mx-auto flex w-full max-w-md flex-col items-center justify-center">
          <MersiInteractiveHero />
        </div>
      </section>

      {/* 2. SECTION MASALAH / KONTEKS (Relatable Mersi) */}
      <section className="border-y border-border bg-accent-subtle/40 py-16">
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-[200px_minmax(0,1fr)] items-center gap-8 rounded-2xl border border-border bg-bg-surface p-8 shadow-card">
            <div className="flex justify-center">
              <MersiPose name="surprise" size="xl" />
            </div>
            <div className="space-y-3">
              <div className="inline-block rounded-pill bg-warning/10 px-3 py-1 text-xs font-bold text-text-primary">
                Pernah ngerasa gini?
              </div>
              <h2 className="font-display text-2xl font-bold text-text-primary">
                “Nonton film berjam-jam, tapi pas ketemu native speaker langsung nge-blank?”
              </h2>
              <p className="text-sm leading-body text-text-secondary">
                Menghafal rumus tata bahasa di buku sering bikin jenuh. Bersama Mersi, kamu belajar
                langsung dari dialog nyata, intonasi asli, dan ekspresi sehari-hari yang seru.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SECTION FITUR DENGAN POSE MERSI SPESIFIK */}
      <section className="py-20">
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-blue">
              {t("featuresEyebrow")}
            </p>
            <h2 className="mt-3 text-balance font-display text-3xl font-extrabold leading-heading tracking-tight">
              {t("featuresTitle")}
            </h2>
            <p className="mt-3 text-pretty leading-body text-text-secondary">
              {t("featuresDescription")}
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {benefits.map((benefit, index) => {
              const poses: ("book" | "fish" | "run" | "jump")[] = ["book", "fish", "run", "jump"];
              const pose = poses[index % poses.length];

              return (
                <article
                  key={benefit.index}
                  className="relative flex flex-col justify-between rounded-xl border border-border bg-bg-surface p-6 shadow-card transition-all duration-fast hover:border-border-strong hover:shadow-elevated"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold tracking-wide text-text-muted">
                        {benefit.index}
                      </span>
                      <MersiPose name={pose} size="sm" />
                    </div>
                    <h3 className="mt-4 font-display text-lg font-bold leading-heading text-text-primary">
                      {benefit.title}
                    </h3>
                    <p className="mt-2 text-sm leading-body text-text-secondary">{benefit.text}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. SECTION CARA KERJA (Mersi Berlari Mengikuti Langkah) */}
      <section id="cara-belajar" className="border-t border-border bg-bg-surface py-20">
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue">
                {t("stepsEyebrow")}
              </p>
              <h2 className="mt-3 text-balance font-display text-3xl font-extrabold leading-heading tracking-tight">
                {t("stepsTitle")}
              </h2>
            </div>
            <p className="max-w-md text-pretty leading-body text-text-secondary">
              {t("stepsDescription")}
            </p>
          </div>

          <div className="relative mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <article
                key={step.title}
                className="relative rounded-xl border border-border bg-bg-elevated p-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-2xl font-extrabold text-blue">
                    0{index + 1}
                  </span>
                  {index === 1 && <MersiPose name="run" size="sm" />}
                </div>
                <h3 className="mt-6 font-display text-xl font-bold leading-heading text-text-primary">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-body text-text-secondary">{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 5. SECTION INTERAKTIF: KENALAN DENGAN MERSI */}
      <section className="border-y border-border bg-bg-base py-20">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <MersiInteractiveGallery />

          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent animate-ping" />
              <p className="text-xs font-bold uppercase tracking-wider text-blue">
                {t("mascotEyebrow")}
              </p>
            </div>
            <h2 className="mt-3 text-balance font-display text-3xl font-extrabold leading-heading tracking-tight">
              {t("mascotTitle")}
            </h2>
            <p className="mt-4 max-w-prose text-pretty leading-body text-text-secondary">
              {t("mascotDescription")}
            </p>
            <div className="mt-8">
              <Link
                href="/register"
                className="inline-flex min-h-11 items-center rounded-pill border border-blue bg-blue px-6 text-sm font-semibold text-text-inverse transition-transform duration-fast hover:bg-blue-hover active:scale-[0.96]"
              >
                {t("startWithMersi")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CTA PENUTUP (Titik Fokus Biru Kobalt & Mersi Melompat) */}
      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="relative overflow-hidden rounded-2xl bg-blue p-8 sm:p-12 text-text-inverse shadow-elevated">
          <div className="relative z-10 max-w-xl space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-text-inverse/80">
              {t("finalEyebrow")}
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold leading-tight">
              {t("finalTitle")}
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-text-inverse/90">
              {t("finalDescription")}
            </p>
            <div className="pt-4">
              <Link
                href="/register"
                className="inline-flex min-h-12 items-center justify-center rounded-pill bg-bg-surface px-8 text-sm font-bold text-blue shadow-card transition-transform duration-fast hover:scale-105 active:scale-[0.96]"
              >
                {t("finalCta")}
              </Link>
            </div>
          </div>

          <div className="absolute right-4 bottom-0 hidden sm:block md:right-12">
            <MersiPose name="jump" size="xl" />
          </div>
        </div>
      </section>

      {/* 7. FLOATING MERSI CHAT (Karakter Utama Interaktif) */}
      <MersiFloatingChat />
    </main>
  );
}
