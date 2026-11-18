"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "../../../i18n/navigation";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { EmptyState } from "../ui/EmptyState";
import { SavedWord } from "../../lib/demo-data";
import { getLocalSavedWords, removeLocalWord } from "../../lib/demo-store";

export function VocabularyView() {
  const t = useTranslations("Vocabulary");
  const [words, setWords] = useState<SavedWord[]>(() => getLocalSavedWords());
  const [query, setQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "az">("newest");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    if (pendingDeleteId === id) {
      const updated = removeLocalWord(id);
      setWords(updated);
      setPendingDeleteId(null);
    } else {
      setPendingDeleteId(id);
    }
  };

  const filteredWords = words
    .filter((w) => {
      const q = query.toLowerCase().trim();
      if (!q) return true;
      return (
        w.term.toLowerCase().includes(q) ||
        w.meaning.toLowerCase().includes(q) ||
        w.note.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortOrder === "az") {
        return a.term.localeCompare(b.term);
      }
      return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-blue">{t("eyebrow")}</p>
          <h1 className="mt-3 text-balance font-display text-3xl font-extrabold leading-heading tracking-tight text-text-primary">
            {t("title")}
          </h1>
          <p className="mt-2 text-pretty leading-body text-text-secondary">{t("description")}</p>
        </div>
        <div>
          <Link
            href="/flashcards"
            className="inline-flex min-h-11 items-center rounded-pill border border-blue bg-blue px-5 text-sm font-semibold text-text-inverse transition-[opacity,transform] duration-fast hover:bg-blue-hover"
          >
            {t("practice")} ↗
          </Link>
        </div>
      </div>

      <Card className="border-border bg-bg-surface p-6 shadow-card">
        {/* Toolbar Filter & Sort */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 max-w-sm">
            <Input
              type="search"
              placeholder={t("searchPlaceholder")}
              aria-label={t("searchLabel")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="sort-select" className="text-xs font-medium text-text-secondary">
              {t("sortLabel")}:
            </label>
            <select
              id="sort-select"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "newest" | "az")}
              className="h-11 rounded-md border border-border bg-bg-surface px-3 text-sm text-text-primary focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-border-focus"
            >
              <option value="newest">{t("sortNewest")}</option>
              <option value="az">{t("sortAz")}</option>
            </select>
          </div>
        </div>

        {/* Content Area */}
        <div className="mt-6">
          {words.length === 0 ? (
            <EmptyState
              mark="Aa"
              title={t("emptyTitle")}
              description={t("emptyBody")}
              actionLabel={t("emptyCta")}
              actionHref="/study"
            />
          ) : filteredWords.length === 0 ? (
            <div className="py-12 text-center">
              <h3 className="font-display text-lg font-bold text-text-primary">
                {t("noResultsTitle")}
              </h3>
              <p className="mt-1 text-sm text-text-secondary">{t("noResultsBody")}</p>
              <Button variant="ghost" size="sm" className="mt-4" onClick={() => setQuery("")}>
                Hapus pencarian
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {filteredWords.map((word) => {
                const isPending = pendingDeleteId === word.id;
                return (
                  <li
                    key={word.id}
                    className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-display text-base font-bold text-text-primary">
                          {word.term}
                        </span>
                        <span className="rounded-pill bg-blue-subtle px-2 py-0.5 text-xs font-semibold text-blue">
                          {word.status}
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary">{word.meaning}</p>
                      {word.note && <p className="text-xs text-text-muted">{word.note}</p>}
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/flashcards?word=${word.id}`}
                        className="inline-flex min-h-11 items-center rounded-md border border-border bg-bg-surface px-3 text-sm font-medium text-text-primary hover:bg-bg-elevated"
                        aria-label={t("practiceOne", { word: word.term })}
                      >
                        {t("review")}
                      </Link>
                      {isPending ? (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="bg-error text-text-inverse hover:bg-error"
                            onClick={() => handleDelete(word.id)}
                          >
                            {t("deleteConfirm")}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPendingDeleteId(null)}
                          >
                            {t("cancel")}
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(word.id)}
                          aria-label={t("delete", { word: word.term })}
                        >
                          ✕
                        </Button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {words.length > 0 && (
          <div className="mt-6 border-t border-border pt-4 text-xs text-text-muted">
            {t("count", { count: filteredWords.length })} · disimpan di browser ini
          </div>
        )}
      </Card>
    </div>
  );
}
