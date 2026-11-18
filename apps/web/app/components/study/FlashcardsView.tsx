"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "../../../i18n/navigation";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { ProgressBar } from "../ui/ProgressBar";
import { EmptyState } from "../ui/EmptyState";
import { SavedWord } from "../../lib/demo-data";
import { getLocalSavedWords } from "../../lib/demo-store";

export function FlashcardsView() {
  const t = useTranslations("Flashcards");
  const searchParams = useSearchParams();
  const wordParam = searchParams.get("word");

  const [cards] = useState<SavedWord[]>(() => {
    const words = getLocalSavedWords();
    if (wordParam) {
      const idx = words.findIndex((w) => w.id === wordParam);
      if (idx !== -1) {
        const selected = words[idx];
        const rest = words.filter((_, i) => i !== idx);
        return [selected, ...rest];
      }
    }
    return words;
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCount, setKnownCount] = useState(0);
  const [isDone, setIsDone] = useState(false);

  const currentCard = cards[currentIndex];
  const progressPercent =
    cards.length > 0 ? Math.round(((currentIndex + 1) / cards.length) * 100) : 0;

  const handleNext = (known: boolean) => {
    if (known) {
      setKnownCount((prev) => prev + 1);
    }
    if (currentIndex + 1 < cards.length) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    } else {
      setIsDone(true);
    }
  };

  const resetSession = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setKnownCount(0);
    setIsDone(false);
  };

  if (cards.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-blue">{t("eyebrow")}</p>
          <h1 className="mt-3 text-balance font-display text-3xl font-extrabold leading-heading tracking-tight text-text-primary">
            {t("title")}
          </h1>
        </div>
        <EmptyState
          mark="Aa"
          title={t("emptyTitle")}
          description={t("emptyBody")}
          actionLabel={t("emptyCta")}
          actionHref="/study"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-blue">{t("eyebrow")}</p>
          <h1 className="mt-3 text-balance font-display text-3xl font-extrabold leading-heading tracking-tight text-text-primary">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-text-secondary">{t("description")}</p>
        </div>
        <Link href="/vocabulary" className="text-xs font-semibold text-blue hover:underline">
          {t("manage")} →
        </Link>
      </div>

      {isDone ? (
        <Card className="flex flex-col items-center justify-center p-8 text-center shadow-card border-border bg-bg-surface">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-subtle text-2xl text-blue">
            ✓
          </div>
          <h2 className="mt-4 font-display text-2xl font-bold text-text-primary">
            {t("doneTitle")}
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            {t("doneBody", { known: knownCount, total: cards.length })}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button variant="primary" onClick={resetSession}>
              {t("doneRepeat")}
            </Button>
            <Link
              href="/vocabulary"
              className="inline-flex min-h-11 items-center rounded-md border border-border bg-bg-surface px-4 text-sm font-medium text-text-primary hover:bg-bg-elevated"
            >
              {t("doneBack")}
            </Link>
          </div>
        </Card>
      ) : (
        <div className="mx-auto max-w-lg space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-text-secondary">
              <span>{t("sessionLabel")}</span>
              <span className="font-display font-semibold tabular-nums">
                {t("counter", { current: currentIndex + 1, total: cards.length })}
              </span>
            </div>
            <ProgressBar value={progressPercent} label={t("progressLabel")} />
          </div>

          {/* Flashcard Button */}
          <button
            type="button"
            onClick={() => setIsFlipped(!isFlipped)}
            aria-label={isFlipped ? t("revealBack") : t("reveal")}
            className="flex min-h-[18rem] w-full flex-col justify-between rounded-xl border border-border bg-bg-surface p-8 text-center shadow-card transition-colors duration-fast hover:border-border-strong focus-visible:ring-2 focus-visible:ring-border-focus"
          >
            <div className="flex justify-between items-center w-full">
              <Badge tone="neutral">{currentCard.status}</Badge>
              <span className="text-xs text-text-muted">
                {isFlipped ? t("revealBack") : "Ketuk untuk balik"}
              </span>
            </div>

            <div className="my-auto py-6">
              {!isFlipped ? (
                <div>
                  <h2 className="font-display text-3xl font-extrabold text-text-primary">
                    {currentCard.term}
                  </h2>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xl font-bold text-text-primary">{currentCard.meaning}</p>
                  {currentCard.note && (
                    <p className="text-xs text-text-muted italic">{currentCard.note}</p>
                  )}
                </div>
              )}
            </div>

            <div className="text-xs text-text-muted">{t("hint")}</div>
          </button>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="secondary"
              disabled={!isFlipped}
              onClick={() => handleNext(false)}
              className="min-h-12 text-sm"
            >
              {t("again")}
            </Button>
            <Button
              variant="primary"
              disabled={!isFlipped}
              onClick={() => handleNext(true)}
              className="min-h-12 text-sm"
            >
              {t("known")}
            </Button>
          </div>
          {!isFlipped && <p className="text-center text-xs text-text-muted">{t("revealFirst")}</p>}
        </div>
      )}
    </div>
  );
}
