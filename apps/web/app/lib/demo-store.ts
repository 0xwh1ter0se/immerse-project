import { SavedWord, StudyProgress, INITIAL_SAVED_WORDS, INITIAL_PROGRESS } from "./demo-data";

const WORDS_STORAGE_KEY = "immerse.v1.savedWords";
const PROGRESS_STORAGE_KEY = "immerse.v1.progress";

// ponytail: adapter localStorage client-side. Ceiling: data lokal per-browser, hilang jika storage dibersihkan.
// Jalur naik: ganti fungsi lokal ini dengan call REST API POST/DELETE/PATCH.

export function getLocalSavedWords(): SavedWord[] {
  if (typeof window === "undefined") {
    return INITIAL_SAVED_WORDS;
  }
  try {
    const raw = localStorage.getItem(WORDS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(WORDS_STORAGE_KEY, JSON.stringify(INITIAL_SAVED_WORDS));
      return INITIAL_SAVED_WORDS;
    }
    return JSON.parse(raw) as SavedWord[];
  } catch {
    return INITIAL_SAVED_WORDS;
  }
}

export function saveLocalWord(word: Omit<SavedWord, "id" | "savedAt">): SavedWord {
  const current = getLocalSavedWords();
  const existing = current.find((item) => item.term.toLowerCase() === word.term.toLowerCase());
  if (existing) {
    return existing;
  }
  const newWord: SavedWord = {
    ...word,
    id: `word-${Date.now()}`,
    savedAt: new Date().toISOString(),
  };
  const updated = [newWord, ...current];
  try {
    localStorage.setItem(WORDS_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // quota or privacy mode fallback
  }
  return newWord;
}

export function removeLocalWord(id: string): SavedWord[] {
  const current = getLocalSavedWords();
  const updated = current.filter((item) => item.id !== id);
  try {
    localStorage.setItem(WORDS_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // quota fallback
  }
  return updated;
}

export function getLocalProgress(): StudyProgress {
  if (typeof window === "undefined") {
    return INITIAL_PROGRESS;
  }
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(INITIAL_PROGRESS));
      return INITIAL_PROGRESS;
    }
    return JSON.parse(raw) as StudyProgress;
  } catch {
    return INITIAL_PROGRESS;
  }
}

export function updateLocalProgress(progress: Partial<StudyProgress>): StudyProgress {
  const current = getLocalProgress();
  const updated: StudyProgress = {
    ...current,
    ...progress,
    updatedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // fallback
  }
  return updated;
}
