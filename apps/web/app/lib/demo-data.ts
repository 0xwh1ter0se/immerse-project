export interface DemoVideo {
  id: string;
  title: string;
  sourceLanguage: string;
  targetLanguage: string;
  durationSeconds: number;
}

export interface TranscriptLine {
  id: string;
  startSeconds: number;
  endSeconds: number;
  text: string;
  translation: string;
}

export interface SavedWord {
  id: string;
  term: string;
  meaning: string;
  note: string;
  videoId: string;
  savedAt: string;
  status: "new" | "learning" | "known";
}

export interface Flashcard {
  id: string;
  wordId: string;
  front: string;
  back: string;
}

export interface StudyProgress {
  videoId: string;
  lastLineId: string | null;
  watchedSeconds: number;
  updatedAt: string;
}

// ponytail: fixture statis 1 video, tanpa auth. Ceiling: data tidak lintas device,
// hilang saat storage dibersihkan, progres tidak nyata.
// Jalur naik: ganti impor demo-data dengan fetch(`${NEXT_PUBLIC_API_URL}/videos/:id`);
// POST /words & PATCH /progress; tipe di atas jadi kontrak response; demo-store.ts jadi adapter API.

export const DEMO_VIDEO: DemoVideo = {
  id: "video-demo-01",
  title: "A Little Goes a Long Way — Small Habits That Stick",
  sourceLanguage: "EN",
  targetLanguage: "ID",
  durationSeconds: 192,
};

export const DEMO_TRANSCRIPT: TranscriptLine[] = [
  {
    id: "line-01",
    startSeconds: 0,
    endSeconds: 12,
    text: "When you start small, the resistance in your brain almost disappears.",
    translation: "Ketika kamu mulai dari hal kecil, rasa enggan di otakmu hampir lenyap.",
  },
  {
    id: "line-02",
    startSeconds: 13,
    endSeconds: 28,
    text: "A little goes a long way if you show up every single day.",
    translation:
      "Sedikit demi sedikit lama-lama menjadi bukit jika kamu konsisten hadir setiap hari.",
  },
  {
    id: "line-03",
    startSeconds: 29,
    endSeconds: 45,
    text: "Notice how native speakers connect the words without rushing.",
    translation: "Perhatikan bagaimana penutur asli menyambung kata-kata tanpa tergesa-gesa.",
  },
  {
    id: "line-04",
    startSeconds: 46,
    endSeconds: 62,
    text: "Consistency builds confidence faster than intense, irregular bursts.",
    translation:
      "Konsistensi membangun rasa percaya diri lebih cepat daripada belajar keras tapi sporadis.",
  },
];

export const INITIAL_SAVED_WORDS: SavedWord[] = [
  {
    id: "word-01",
    term: "A little goes a long way",
    meaning: "Sedikit demi sedikit lama-lama menjadi bukit / hal kecil berdampak besar",
    note: "Dari video: Small Habits",
    videoId: "video-demo-01",
    savedAt: "2026-11-16T08:00:00Z",
    status: "learning",
  },
  {
    id: "word-02",
    term: "Resistance",
    meaning: "Rasa enggan / hambatan / penolakan",
    note: "Konteks: mental friction to start",
    videoId: "video-demo-01",
    savedAt: "2026-11-16T08:05:00Z",
    status: "new",
  },
  {
    id: "word-03",
    term: "Show up",
    meaning: "Hadir / muncul dan mulai mengambil bagian",
    note: "Bukan hanya fisik, tapi komitmen",
    videoId: "video-demo-01",
    savedAt: "2026-11-16T08:10:00Z",
    status: "known",
  },
];

export const INITIAL_PROGRESS: StudyProgress = {
  videoId: "video-demo-01",
  lastLineId: "line-02",
  watchedSeconds: 28,
  updatedAt: "2026-11-16T08:15:00Z",
};
