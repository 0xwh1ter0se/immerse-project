"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "../../../i18n/navigation";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Chip } from "../ui/Chip";
import { DEMO_VIDEO, DEMO_TRANSCRIPT, SavedWord } from "../../lib/demo-data";
import { getLocalSavedWords, saveLocalWord, removeLocalWord } from "../../lib/demo-store";

export function StudyView() {
  const t = useTranslations("Study");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(12);
  const [speed, setSpeed] = useState<"1x" | "1.5x">("1x");
  const [savedWords, setSavedWords] = useState<SavedWord[]>(() => getLocalSavedWords());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const duration = DEMO_VIDEO.durationSeconds;

  const toggleSaveWord = (term: string, meaning: string) => {
    const existing = savedWords.find((w) => w.term.toLowerCase() === term.toLowerCase());
    if (existing) {
      const updated = removeLocalWord(existing.id);
      setSavedWords(updated);
      setToastMessage(`Kata "${term}" dihapus dari kosakata.`);
    } else {
      const added = saveLocalWord({
        term,
        meaning,
        note: `Dari video: ${DEMO_VIDEO.title}`,
        videoId: DEMO_VIDEO.id,
        status: "new",
      });
      setSavedWords((prev) => [added, ...prev]);
      setToastMessage(`Kata "${term}" disimpan ke kosakata.`);
    }
    setTimeout(() => setToastMessage(null), 3000);
  };

  const isWordSaved = (term: string) => {
    return savedWords.some((w) => w.term.toLowerCase() === term.toLowerCase());
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-20 right-6 z-modal flex items-center gap-3 rounded-md border border-border bg-bg-surface px-4 py-3 shadow-card"
        >
          <span className="text-sm font-medium text-text-primary">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-xs font-bold text-text-secondary hover:text-text-primary"
            aria-label="Tutup notifikasi"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-blue">{t("eyebrow")}</p>
        <h1 className="mt-3 text-balance font-display text-3xl font-extrabold leading-heading tracking-tight text-text-primary">
          {t("title")}
        </h1>
        <p className="mt-2 text-pretty leading-body text-text-secondary">{DEMO_VIDEO.title}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_16rem]">
        {/* Kolom Kiri: Stage Video + Controls + Transkrip */}
        <div className="space-y-6">
          <Card className="overflow-hidden border-border bg-bg-surface shadow-card">
            {/* Stage Video Placeholder */}
            <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 border-b border-border bg-bg-elevated p-6 text-center">
              <span className="font-display text-lg font-bold text-text-primary">
                {t("videoEmptyTitle")}
              </span>
              <p className="max-w-md text-sm text-text-secondary">{t("videoEmptyBody")}</p>
              <div className="mt-2 flex items-center gap-2">
                <Badge tone="neutral">Demo Session</Badge>
                <Badge tone="neutral">1080p</Badge>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex flex-wrap items-center gap-4 p-4">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsPlaying(!isPlaying)}
                aria-label={isPlaying ? t("pause") : t("play")}
                className="min-h-11 min-w-11"
              >
                {isPlaying ? "⏸" : "▶"}
              </Button>

              <input
                type="range"
                min={0}
                max={duration}
                value={currentTime}
                onChange={(e) => setCurrentTime(Number(e.target.value))}
                aria-label={t("seekLabel")}
                aria-valuetext={t("timeText", {
                  current: formatTime(currentTime),
                  duration: formatTime(duration),
                })}
                className="min-w-0 flex-1 accent-blue cursor-pointer"
              />

              <span
                aria-hidden="true"
                className="font-display text-xs font-semibold tabular-nums text-text-secondary"
              >
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>

              <div role="group" aria-label={t("speedLabel")} className="flex items-center gap-1">
                <Chip
                  selected={speed === "1x"}
                  onClick={() => setSpeed("1x")}
                  className="min-h-9 px-2 text-xs"
                >
                  {t("speedNormal")}
                </Chip>
                <Chip
                  selected={speed === "1.5x"}
                  onClick={() => setSpeed("1.5x")}
                  className="min-h-9 px-2 text-xs"
                >
                  {t("speedFast")}
                </Chip>
              </div>
            </div>
          </Card>

          {/* Panel Transkrip */}
          <Card className="border-border bg-bg-surface p-6 shadow-card">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-blue">
                  {t("transcriptEyebrow")}
                </p>
                <h2 className="mt-1 font-display text-lg font-bold text-text-primary">
                  {t("transcriptTitle")}
                </h2>
              </div>
              <Badge tone="neutral">{DEMO_TRANSCRIPT.length} baris</Badge>
            </div>

            <ul className="mt-4 space-y-3">
              {DEMO_TRANSCRIPT.map((line) => {
                const isActive = currentTime >= line.startSeconds && currentTime <= line.endSeconds;
                const saved = isWordSaved(line.text.split(" ")[0]);

                return (
                  <li
                    key={line.id}
                    className={`flex flex-col gap-3 rounded-lg border p-4 transition-colors duration-fast sm:flex-row sm:items-center sm:justify-between ${
                      isActive
                        ? "border-blue bg-bg-elevated"
                        : "border-border bg-bg-surface hover:bg-bg-elevated"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setCurrentTime(line.startSeconds)}
                          className="font-display text-xs font-bold text-blue hover:underline"
                          aria-label={t("seekTo", { time: formatTime(line.startSeconds) })}
                        >
                          {formatTime(line.startSeconds)}
                        </button>
                        {isActive && <Badge tone="warning">Sedang diputar</Badge>}
                      </div>
                      <p lang="en" className="text-base font-medium text-text-primary">
                        {line.text}
                      </p>
                      <p lang="id" className="text-sm text-text-secondary">
                        {line.translation}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Button
                        variant={saved ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => toggleSaveWord(line.text.split(" ")[0], line.translation)}
                        aria-label={
                          saved
                            ? t("removeWord", { word: line.text.split(" ")[0] })
                            : t("saveWord", { word: line.text.split(" ")[0] })
                        }
                        className="min-h-11 min-w-11"
                      >
                        {saved ? "✓" : "+"}
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>

          {/* Latihan Singkat Bar */}
          <Card className="flex flex-col items-center justify-between gap-4 border-border bg-bg-surface p-6 shadow-card sm:flex-row">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue">
                {t("practiceEyebrow")}
              </p>
              <h3 className="mt-1 font-display text-base font-bold text-text-primary">
                {t("practiceTitle")}
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/vocabulary"
                className="inline-flex min-h-11 items-center rounded-md border border-border bg-bg-surface px-4 text-sm font-medium text-text-primary hover:bg-bg-elevated"
              >
                {t("practiceVocabulary")}
              </Link>
              <Link
                href="/flashcards"
                className="inline-flex min-h-11 items-center rounded-pill border border-blue bg-blue px-5 text-sm font-semibold text-text-inverse hover:bg-blue-hover"
              >
                {t("practiceFlashcards")} ↗
              </Link>
            </div>
          </Card>
        </div>

        {/* Kolom Kanan: Mersi Guide + Notes */}
        <div className="space-y-6">
          <Card className="border-border bg-bg-surface p-6 shadow-card">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-subtle font-display text-sm font-bold text-accent">
                🐱
              </div>
              <div>
                <h3 className="font-display text-sm font-bold text-text-primary">
                  {t("mersiName")}
                </h3>
                <p className="text-xs text-text-secondary">{t("mersiRole")}</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-body text-text-secondary">“{t("mersiQuote")}”</p>
          </Card>

          <Card className="border-border bg-bg-surface p-6 shadow-card">
            <p className="text-xs font-bold uppercase tracking-wider text-blue">
              {t("noteEyebrow")}
            </p>
            <h3 className="mt-1 font-display text-sm font-bold text-text-primary">
              {t("noteTitle")}
            </h3>
            <p className="mt-2 text-xs leading-body text-text-secondary">{t("noteBody")}</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
