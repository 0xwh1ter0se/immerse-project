# Keputusan teknis — Milestone "Dashboard + Study Room"

**Status:** dokumen keputusan, bukan spec visual. Tidak mengubah kode aplikasi.
**Scope:** apps/web saja (Next.js 16 App Router, next-intl id/en, Tailwind 3.4). `apps/api` tidak disentuh.
**Sumber layar:** prototipe `immerse/index.html` (view dashboard, player, vocabulary, add-video, flashcards, completed, settings).

---

## 1. Peta route final

Semua layar app berada di route group `app/[locale]/(dashboard)/` supaya memakai `layout.tsx` + `AppSidebar` yang sudah ada — satu shell, tanpa duplikasi.

| URL (locale: `/id`, `/en`) | File | Isi | Alasan |
|---|---|---|---|
| `/[locale]/dashboard` | `(dashboard)/dashboard/page.tsx` | Ringkasan: video terakhir, progres, kata tersimpan | Sudah ada; dipertahankan, isi diperkaya dari fixture |
| `/[locale]/study` | `(dashboard)/study/page.tsx` | Player demo satu video + transkrip + simpan kata | Sidebar sudah me-link; route statis cukup karena hanya 1 video demo |
| `/[locale]/vocabulary` | `(dashboard)/vocabulary/page.tsx` | Tabel kata tersimpan, cari/filter, latihan | Sidebar sudah me-link |
| `/[locale]/flashcards` | `(dashboard)/flashcards/page.tsx` | Sesi ulang kartu dari kata tersimpan | **Route sendiri**, bukan bagian `/study` |
| `/[locale]/profile` | `(dashboard)/profile/page.tsx` | Profil demo: nama, email, locale, bahasa belajar | Sidebar sudah me-link; halaman minimal, bukan fitur penuh |

**Keputusan tegas:**
- **`/flashcards` route sendiri.** Alasannya: tugas terpisah (ulang, bukan tonton), dipanggil dari dua tempat (`/study` dan `/vocabulary`), dan perlu URL yang bisa di-refresh/dibagikan. Menempelkannya di `/study` membuat satu halaman memikul dua client state besar dan menghapus deep-link.
- **`/profile` dibuat, bukan link-nya yang dihapus.** Satu page server tipis lebih murah daripada link mati (QA + a11y + persepsi produk rusak). Isinya read-only dari fixture; pengaturan bahasa UI dari prototipe (`settings`) **ditunda** dan nanti masuk ke `/profile`, bukan route `/settings`.
- **Tidak ada** `/study/[videoId]` di milestone ini: hanya satu video demo. Saat multi-video, naik ke `/study/[videoId]` (bukan query param `?v=`), karena video id adalah identitas halaman.
- `/add-video`, `/completed`, `/settings` dari prototipe **tidak** jadi route baru sekarang. Tidak ada di sidebar, tidak ada di acceptance.

---

## 2. Data layer demo

**Keputusan: fixture module statis.** Tidak ada `fetch`, tidak ada endpoint baru di `apps/api`. File `apps/web/app/lib/demo-data.ts` mengekspor data demo + tipe; `apps/web/app/lib/demo-store.ts` menyimpan state lokal.

**Bentuk tipe (kontrak, dipakai ulang saat pindah API):**

```ts
type DemoVideo      = { id: string; title: string; sourceLanguage: string; targetLanguage: string; durationSeconds: number };
type TranscriptLine = { id: string; startSeconds: number; endSeconds: number; text: string; translation: string };
type SavedWord      = { id: string; term: string; meaning: string; note: string; videoId: string; savedAt: string; status: "new" | "learning" | "known" };
type Flashcard     = { id: string; wordId: string; front: string; back: string }; // diturunkan dari SavedWord, tidak disimpan
type StudyProgress  = { videoId: string; lastLineId: string | null; watchedSeconds: number; updatedAt: string };
```

**State: React state + localStorage (keduanya).** React state adalah sumber kebenaran selama sesi; localStorage hanya write-through untuk dua hal yang harus selamat dari refresh — **bukan** cache semua state.
- `immerse.v1.savedWords` → `SavedWord[]`
- `immerse.v1.progress` → `StudyProgress`
- Transient di React state saja: index kartu, status balik kartu, query pencarian, filter, baris transkrip aktif. Jangan disimpan — nilainya sesaat.
- Baca `localStorage` **hanya di `useEffect`** (client), render pertama pakai default; cegah hydration mismatch. Parse dibungkus `try/catch` dan fallback ke default (storage bisa korup/di-clear).

**Jalur naik (komentar `ponytail:` di `demo-store.ts` dan `demo-data.ts`):**

```ts
// ponytail: fixture statis 1 video, tanpa auth. Ceiling: data tidak lintas device,
// hilang saat storage dibersihkan, progres tidak nyata.
// Jalur naik: ganti impor demo-data dengan fetch(`${NEXT_PUBLIC_API_URL}/videos/:id`);
// POST /words & PATCH /progress; tipe di atas jadi kontrak response; demo-store.ts jadi adapter API.
```

---

## 3. Batas server vs client

Aturan: `page.tsx` dan `layout.tsx` tetap Server Component; `"use client"` hanya ditempel di leaf interaktif, sedangkan anak yang dirender langsung oleh client component tidak perlu direktif (sudah ikut module graph).

| Layar | Server (page) | Client |
|---|---|---|
| `/dashboard` | Semua: `getTranslations`, baca fixture, kartu progres | — |
| `/study` | Shell: judul, layout, transkrip dari fixture sebagai props | `StudyPlayer` (play/pause, baris aktif, simpan kata) |
| `/vocabulary` | Judul + toolbar statis | `VocabularyTable` (baris dari localStorage, cari/filter, hapus) |
| `/flashcards` | Judul + hitungan awal | `FlashcardDeck` (index, balik kartu, navigasi) |
| `/profile` | Semua | — |

Props dari server ke client wajib serializable (object/string/number), bukan fungsi atau class. Tidak ada akses `localStorage`/`window` di jalur server.

---

## 4. Namespace i18n final

`messages/id.json` = **source of truth** (di-import `global.d.ts` untuk typing `useTranslations`). `messages/en.json` wajib punya key identik — paritas 1:1, tidak boleh ada key hanya di satu file.

| Namespace | Dipakai di | Status |
|---|---|---|
| `Dashboard` | `/dashboard` + sidebar | sudah ada, dipakai ulang |
| `Study` | `/study` | baru |
| `Vocabulary` | `/vocabulary` | baru |
| `Flashcards` | `/flashcards` | baru |
| `Profile` | `/profile` | baru |

Aturan key: camelCase, menjelaskan peran (`saveWord`, `emptyState`, `cardsRemaining`), bukan kalimat penuh; hitungan pakai ICU plural (`{count, plural, ...}`); pesan error/aria-label/empty state ikut diterjemahkan (tidak ada string hardcoded di komponen). Server pakai `getTranslations`, client pakai `useTranslations`. Gate @qa: key set id dan en harus sama.

---

## 5. Konvensi komponen

- Folder: `apps/web/app/components/study/` untuk semua komponen study room. `app/components/profile/` hanya jika ada komponen yang benar-benar dipakai ulang; page `/profile` sederhana boleh tanpa komponen baru.
- File: PascalCase = nama komponen (`StudyPlayer.tsx`, `TranscriptList.tsx`, `SaveWordButton.tsx`, `VocabularyTable.tsx`, `FlashcardDeck.tsx`). Satu komponen utama per file, tanpa barrel `index.ts`, import path langsung.
- Reuse `app/components/ui/*` (Button, Card, Chip, Badge, Input). Dilarang membuat Button/Card kedua.
- **Tanpa dependency baru**: tidak ada zustand/redux, framer-motion, react-player, library ikon, clsx. Pakai `<video>` native + React state; transisi pakai token Tailwind yang sudah ada; ikon sebagai inline SVG/markup.
- Styling lewat token `tailwind.config.ts`; tanpa hex/px lepas; target sentuh `min-h-11`; state kosong dan error wajib digambar, bukan hanya happy path.

---

## 6. Risiko / utang teknis yang sengaja diterima

1. **Tanpa auth dan proteksi route.** `/study`, `/vocabulary`, `/flashcards`, `/profile` bisa dibuka tanpa login dan menampilkan data demo. Diterima karena `apps/api` tidak diubah di milestone ini; jangan tulis copy yang mengklaim data akun nyata.
2. **Tidak ada pemrosesan video/transkrip nyata.** Player demo hanya memutar video contoh/placeholder; "simpan kata" murni lokal. Copy harus jujur ("demo", "belum tersambung") agar ekspektasi tidak salah.
3. **Progres hanya lokal per-browser.** localStorage bisa korup, dibersihkan, dan tidak sync antar device. Mitigasi: parse dengan fallback default + tombol reset; upgrade path ada di `ponytail:`.

---

**Konsekuensi:** @developer boleh mulai tanpa spec UI final selama mengikuti peta route, tipe, namespace, dan batas server/client di atas; copy final menunggu @designer. Tanpa commit/push/deploy sampai perintah CEO.
