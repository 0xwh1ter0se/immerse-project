# Design spec — Ruang Belajar (dashboard, study/player, vocabulary, flashcards, sesi selesai)

**Status:** draft untuk @developer (task-3). Ditulis @designer, task-2.
**Sumber visual:** `immerse/index.html`, `immerse/styles.css`, `immerse/app.js` (bagian `dashboard`, `player`, `vocabulary`, `flashcards`, `completed`).
**Design system (satu-satunya):** token di `apps/web/tailwind.config.ts` + `apps/web/app/globals.css`. `.cursor/rules/immerse.mdc` (neo-brutalism, Archivo Black, shadow keras) **usang — jangan dipakai**.
**Komponen existing:** `app/components/ui/{Badge,Button,Card,Chip,Input}.tsx` + shell `app/[locale]/(dashboard)/layout.tsx` + `AppSidebar`, `AppHeader`.
**Prefiks copy:** tone "partner, bukan guru" — kalimat pendek, tanpa nilai/rapor, tanpa "kamu harus".
**Token baru: 0.** Semua kebutuhan (aksen terang, permukaan, status, radius, shadow, durasi) sudah tercakup. Kalau @developer merasa butuh token baru, itu tanda komponennya salah pakai token, bukan tokennya kurang — lapor dulu ke lead.

---

## 0. Keputusan ringkas (yang perlu diingat)

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Nav mobile 375px = **bottom tab bar fixed** (4 item), bukan drawer/hamburger | 4 destinasi = pola tab bar; jangkauan jempol; tidak ada state buka-tutup yang harus di-a11y-kan; sidebar desktop tidak disentuh |
| 2 | Konten di dalam shell dibatasi `min-w-0 flex-1`, tanpa `max-w` baru | Shell sudah `max-w-6xl`; menambah max-w kedua bikin dua ritme lebar |
| 3 | Video asli belum ada → **stage placeholder jujur**, bukan video palsu | Demo belum punya media; jangan desain untuk data yang tidak ada (YAGNI) |
| 4 | Transkrip dua bahasa **selalu tampil** (target di atas, ID di bawah), tanpa toggle | Inti nilai belajar ada di pasangan kalimat; toggle = state ekstra tanpa dipakai |
| 5 | Kecepatan playback: **1× dan 1.5×** saja | 2 tombol, cukup untuk kebutuhan "dengar ulang lebih pelan"; 1.25× ditunda |
| 6 | Semua state kosong memakai pola yang sama (`EmptyState`) | 3 layar butuh; teks konsisten, developer tidak menulis ulang markup |
| 7 | Player & flashcard: **tanpa animasi wajib**; semua gerak opsional dan mati saat reduced-motion | Gerak hanya jika menjelaskan perubahan; flip kartu dipertahankan sebagai fade 100ms |

---

## 1. Aturan pemakaian token

| Kebutuhan | Token/komponen | Jangan pakai |
|---|---|---|
| Latar halaman | `bg-bg-base` | putih polos `bg-white` |
| Panel/kartu | `Card` (`bg-bg-surface`, `border-border`, `shadow-card`) | shadow keras `0 4px 0` |
| Panel di atas panel (thumbnail, kartu flashcard) | `bg-bg-elevated`, `shadow-elevated` | gradien baru |
| Judul layar | `font-display font-extrabold tracking-tight leading-heading` | uppercase font Archivo |
| Eyebrow | `text-xs font-bold uppercase tracking-wider text-blue` | `accent` untuk teks |
| Body | `text-text-secondary leading-body` | `text-muted` untuk teks informatif kecil |
| CTA utama | `Button variant="primary"` (biru) | warna baru |
| Aksen hangat | `bg-accent-subtle`/`bg-accent` untuk latar/penanda, **bukan** teks | `text-accent` untuk body |
| Status | `Badge tone="success"/"warning"/"error"` | hex warna |
| Fokus | `focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base` (sudah ada di `Button`/`Chip`/`Input`) | outline biru browser default |
| Radius | panel `rounded-lg`, kontrol `rounded-pill`/`rounded-md`, thumbnail `rounded-xl` | radius custom px |
| Durasi | `duration-fast` (150ms) untuk warna/press, `duration-chip` (200ms) untuk chip, `duration-enter` (320ms) maksimum entrance | durasi >320ms |

**Kontras — aturan main (bukan klaim terukur, verifikasi akhir di @qa):**
- `text-inverse` hanya di atas `blue`/`text-primary` (pasangan yang sudah dipakai Button primary).
- `text-muted` **dilarang** untuk label form, timestamp penting, dan teks < 14px yang membawa info; pakai `text-secondary`.
- `accent`, `warning`, `success` sebagai **latar/border/ikon**, teks di atasnya `text-primary`/`text-inverse`. Badge sudah mengikuti aturan ini.
- `text-blue` boleh untuk eyebrow/link karena pasangan yang sudah dipakai dashboard existing.

---

## 2. Shell & layout

### 2.1 Desktop (≥ md, 768px)
Shell existing dipertahankan apa adanya:

```
┌──────────────────────────────────────────────────────────────────────┐
│ AppHeader  sticky top-0  z-card  64px  bg-bg-base/95 border-b        │
├──────────────────┬───────────────────────────────────────────────────┤
│ AppSidebar       │ area konten: px-6 py-8 md:px-10                  │
│ w-56 (224px)     │ max-w-6xl dikurangi sidebar ≈ 848px di 1440px     │
│ border-r         │                                                   │
│ hidden md:block  │                                                   │
└──────────────────┴───────────────────────────────────────────────────┘
```

- `(dashboard)/layout.tsx` tetap: `mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl` + `min-w-0 flex-1`.
- **Jangan** menambah wrapper `max-w-*` baru per halaman; cukup `max-w-prose` untuk paragraf panjang.
- Jarak vertikal antar blok: `space-y-6` (24px) di layar padat, `mt-8` untuk blok setelah heading. Gap grid: `gap-4` (16px) desktop.

### 2.2 Mobile 375px — keputusan nav
`AppSidebar` tetap `hidden md:block`. Di bawah md, gunakan **bottom tab bar fixed**:

```
┌────────────────────────────────┐
│ AppHeader 64px sticky          │
├────────────────────────────────┤
│ konten px-4 py-6 pb-28         │  ← pb-28 beri ruang bottom bar
│                                │
│ (scroll)                       │
├────────────────────────────────┤
│  Beranda  Belajar  Kosakata  Profil │  fixed bottom, h-16 + safe-area
│  [aktif: text-primary + bar 2px]    │  bg-bg-base/95 backdrop-blur
└────────────────────────────────┘
```

**Komponen baru:** `app/components/layout/StudyBottomNav.tsx` — client, `md:hidden fixed inset-x-0 bottom-0 z-card border-t border-border bg-bg-base/95 backdrop-blur`.

| Aspek | Spec |
|---|---|
| Item | 4: `/dashboard` (Beranda), `/study` (Belajar), `/vocabulary` (Kosakata), `/profile` (Profil) — label pakai key `Dashboard.nav*` yang sudah ada |
| Target sentuh | tiap tab `min-h-14` (56px) dan selebar 1/4 layar; **min 44×44** terpenuhi |
| Aktif | `usePathname()` → `aria-current="page"`, teks `text-text-primary font-semibold`, indikator atas `h-0.5 w-8 rounded-pill bg-blue` |
| Aman iOS | pembungkus `pb-[env(safe-area-inset-bottom)]`; konten shell `pb-28 md:pb-8` |
| A11y | `<nav aria-label={t("navigationLabel")}>` (key existing) — hindari dua nav dengan label sama saat desktop (sidebar hidden, jadi aman) |
| Mengapa bukan drawer | drawer butuh state, focus trap, Esc, scroll lock; 4 item tidak sepadan dengan biaya itu |

Alasan tambahan: prototype lama memakai nav horizontal scroll di ≤720px — ditolak karena item ke-4 (`Profil`) sering keluar viewport tanpa petunjuk scroll, dan nav horizontal memakan ruang vertikal yang justru langka di 375px.

**Catatan terbuka (bukan scope M1–M3):** `AppHeader` saat ini menampilkan link marketing (Paket/Masuk/Daftar) di atas ruang belajar yang sudah login. Untuk milestone ini biarkan; kalau CEO mau dirapikan, itu keputusan @cto (mis. header ringkas khusus `(dashboard)`). Jangan desain header baru sekarang.

---

## 3. Layar

### 3.1 Dashboard — `/dashboard`

**Tujuan user (1 baris):** "Lanjutkan dari video yang tadi, atau lihat koleksi kata."
**Hierarki:** h1 sapaan → kartu "Lanjutkan belajar" (paling besar, satu CTA) → 2 kartu kecil (progres, kata tersimpan).

```
RUANG BELAJAR                                   (eyebrow text-blue)
Hai, selamat datang lagi.                       (h1 display 3xl)
Mulai dari satu video. Tidak harus yang panjang. (p text-secondary)

┌──────────────────────────────────────────────────────────┐
│ Lanjutkan belajar                          [Sesi contoh] │  Card
│ Video pertamamu menunggu di sini.                        │
│ ┌──────────────┐  RUANG BELAJAR · CONTOH                │
│ │  thumbnail   │  Video pertamamu menunggu di sini.      │
│ │  16:9        │  Tempel tautan video favoritmu…          │
│ │  ▶ 03:12     │  Pilih video ↗                          │
│ └──────────────┘                                          │
└──────────────────────────────────────────────────────────┘
┌───────────────────────────────┐ ┌────────────────────────┐
│ Sedikit demi sedikit          │ │ Koleksi kecilmu        │
│ Progres belajarmu             │ │ Kata tersimpan         │
│  —      —       —             │ │        Aa              │
│ kata   video   hari           │ │ Kata yang kamu simpan  │
│ tersimpan dipelajari belajar  │ │ akan mampir di sini.   │
│ Angka ini muncul setelah…     │ │ Buka ruang belajar →   │
└───────────────────────────────┘ └────────────────────────┘
```

| Area | Komponen | Props ringkas |
|---|---|---|
| Heading | `PageHeading` (baru, server-safe) | `{ eyebrow, title, description, action? }` |
| Kartu unggulan | `Card` + thumbnail `<div>` (bukan `<img>` dulu) | `Card variant="default"` |
| Badge/status | `Badge tone="neutral"` | label "Sesi contoh" |
| CTA | `Button variant="primary"` + `Link` | "Buka ruang belajar" → `/study` |
| Metrik | teks + `font-display text-3xl tabular-nums` | 3 kolom, `grid grid-cols-3 gap-3` |
| Panel kata | `Card` + `EmptyState` | lihat §3.3 |

**Grid:** `grid grid-cols-1 gap-4 md:grid-cols-[1fr_.9fr]` untuk dua kartu bawah (rasio dari prototype). Hapus tombol "Tambah video" dari heading di M1 (route add-video tidak ada → hindari link mati); ganti satu CTA ke `/study`.

**State**
- **Kosong:** persis wireframe di atas (metrik `—`, panel kata = `EmptyState` dengan `Aa`, "Kata yang kamu simpan akan mampir di sini.", aksi "Buka ruang belajar").
- **Loading:** skeleton (`animate-pulse` hanya jika `motion-safe`): 1 blok 96px + 2 blok 150px, `aria-busy="true"` di `<main>`. **Belum ditampilkan di M1** (fixture statis) — siapkan markup, jangan tambah state palsu.
- **Error:** `Card` dengan `Badge tone="error"` "Gagal memuat", teks "Progresmu belum bisa diambil. Coba lagi.", `Button "Coba lagi"`. Ditunda sampai data nyata.
- **Sukses:** kartu unggulan terisi judul video + durasi + progress bar kecil (`ProgressBar`, `value` = persen tontonan).

---

### 3.2 Study / Player — `/study`

**Tujuan user (1 baris):** "Nonton sambil menangkap kata baru, lalu simpan yang menarik."
**Hierarki:** h1 + aksi → stage video → transkrip (fokus kedua, paling banyak interaksi) → latihan lanjutan; kolom kanan = Mersi (ringan).

```
RUANG MENONTON                                  (eyebrow)
Belajar lewat adegan.                           (h1)      [Simpan kata +]
┌───────────────────────────────────────┐ ┌─────────────────────┐
│              VIDEO STAGE              │ │  (•) Mersi          │
│   "Video belum terhubung."            │ │  Teman belajarmu    │
│   "Tempel tautan video untuk mulai…"  │ │  Kalau ada kata     │
│                                       │ │  yang bikin         │
│  ▶ ──●──────── 00:12 / 03:12  1× 1.5×│ │  penasaran, simpan  │
└───────────────────────────────────────┘ │  aja…               │
┌───────────────────────────────────────┐ └─────────────────────┘
│ KATA-KATA DI LAYAR         Transkrip  │ ┌─────────────────────┐
│ 00:12  You gotta see this.       [+]  │ │ CATATAN BELAJAR     │
│        Kamu harus lihat ini.          │ │ Satu langkah kecil. │
│ 00:15  A little goes a long way. [+]  │ └─────────────────────┘
│        Sedikit pun jadi.              │
└───────────────────────────────────────┘
┌───────────────────────────────────────┐
│ SESUDAH MENONTON   Buka flashcards ↗  │
│ [Aa Kosakata]      [✓ Latihan kata]   │
└───────────────────────────────────────┘
```

**Grid:** `grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_14rem]` (14rem ≈ 228px, prototype). Di <md kolom kanan pindah **di bawah** transkrip (urutan: video → transkrip → practice → Mersi) — berbeda dari prototype yang menaruh side column di atas; alasan: transkrip adalah alat kerja, jangan didorong ke bawah layar.

**Video stage (M2):** `aspect-video` (16:9) `rounded-xl border border-border bg-bg-elevated overflow-hidden`; konten placeholder `flex flex-col items-center justify-center gap-2 text-center px-6`. Bila kelak ada `<video>`: kontrol native disembunyikan (`controls={false}`), kontrol kita di bawah stage.

**Kontrol playback** — komponen `PlayerControls` (client), satu baris di bawah stage, `min-h-16`, `px-3`, `border-t border-border`, target tiap tombol **44×44** (`min-h-11 min-w-11`):

| Elemen | Perilaku | A11y |
|---|---|---|
| Tombol putar/jeda | ikon `▶`/`⏸` (teks/SVG, `aria-hidden` di ikon) | `aria-label={isPlaying ? "Jeda" : "Putar"}`, `aria-pressed` tidak dipakai (label sudah menyatakan aksi) |
| Progress | `input[type="range"] min-w-0 flex-1` + `accent-blue`, tinggi track visual 4px (`h-1`) | `aria-label="Posisi video"`, `aria-valuetext="0:12 dari 3:12"`, keyboard arrow native |
| Waktu | `0:12 / 3:12`, `tabular-nums text-xs text-secondary` | dalam `<span aria-hidden="true">` karena `aria-valuetext` sudah membacakan |
| Kecepatan | 2 `Chip` ("1×", "1.5×"), `selected` + `aria-pressed` (dari komponen) | label grup `role="group" aria-label="Kecepatan"` |
| Tanpa CC/gear | prototype punya CC/⚙ yang tidak berfungsi — **jangan ditaruh** di M2 | hindari kontrol palsu |

**Interval playback (fixture):** stage tidak memutar media sungguhan. Kontrak: `isPlaying` + `progressMs` dari React state, `requestAnimationFrame`/`setInterval` 250ms **hanya jika** ada media; di M2 cukup progress jalan saat `isPlaying` untuk demo, dan berhenti di akhir. Semua angka tabular-nums.

**Panel transkrip** — komponen `TranscriptPanel` (client). Tiap baris = grup fokus sendiri:

| Elemen | Spec |
|---|---|
| Baris | `li` berisi `time` (button, `aria-label="Lompat ke 0:12"`), target `<p lang="en" className="text-base font-medium text-text-primary">`, terjemahan `<p lang="id" className="text-sm text-text-secondary">`, tombol simpan di kanan |
| Baris aktif | `bg-bg-elevated` + `border-l-2 border-blue` + `aria-current="true"`; scroll otomatis `scrollIntoView({block:"nearest", behavior: reduced ? "auto" : "smooth"})` |
| Simpan kata | tombol 44×44 `Button variant="ghost" size="sm"` dengan ikon `+` → `✓`; kata yang disimpan = `line.keyWord` (kata kunci per baris, ditebalkan di target: `<mark>`? **tidak** — pakai `<span className="font-semibold">` agar tidak ada warna baru) |
| Indikator tersimpan | tombol: ikon `✓`, `text-success`, `aria-pressed="true"`, `aria-label="Hapus {kata} dari kosakata"`; kalau belum: `aria-label="Simpan {kata}"`. Tambahkan `Badge tone="success"` "Tersimpan" **hanya** di baris yang disimpan (opsional, 1 baris) |
| Empty | "Transkrip belum tersedia untuk video ini." + `Button variant="secondary"` "Coba video lain" |
| Loading | 3 skeleton baris, `aria-hidden`, `aria-busy` di panel |
| Error | `Badge tone="error"` "Transkrip gagal dimuat" + `Button` "Coba lagi" |

**Aksi simpan global** ("Simpan kata +" di heading): kalau tidak ada kata yang dipilih, ini **tidak** membuka modal. Di M2 hapus dari heading; simpan kata hanya lewat baris transkrip. Alasan: satu jalur aksi = tidak ada state "kata mana yang disimpan".

**Reduced motion (player):** progress fill tidak dianimasikan (lebar langsung ikut nilai); scroll baris aktif `behavior: "auto"`; entrance panel tidak dipakai; tombol `active:scale` sudah dimatikan oleh `enabled:active:scale` bawaan Button — tambahkan override global (§6) agar `transform` mati total saat reduced.

---

### 3.3 Vocabulary — `/vocabulary`

**Tujuan user (1 baris):** "Temukan kata yang pernah kusimpan, lalu latih atau buang."
**Hierarki:** h1 + CTA latihan → toolbar (cari, urutkan) → daftar kata → footer jumlah.

```
KOLEKSI KATA DARI CERITAMU                        (eyebrow)
Kosakata saya                                     (h1 display 3xl)
Kata baru, diingat dengan caramu sendiri.         [Latihan kata ↗]
┌───────────────────────────────────────────────────────────┐
│ [⌕ Cari kata atau arti…        ] [Terbaru ▾]              │
│ ┌───────────────────────────────────────────────────────┐ │
│ │ serendipity                         [✓ Tersimpan]     │ │
│ │ Temuan berharga yang datang tanpa diduga              │ │
│ │ Video demo · 2 hari lalu            [Latih] [Hapus]   │ │
│ └───────────────────────────────────────────────────────┘ │
│ 1 kata · hanya tersimpan di browser ini                   │
└───────────────────────────────────────────────────────────┘
```

**Daftar, bukan tabel.** Prototype memakai `<table>` dengan trik `data-label` di ≤720px. Diganti `<ul>` baris kartu: alasan — satu markup untuk semua lebar, tidak perlu pseudo-content label, dan 5 kolom tabel di 375px memang tidak layak. Kolom desktop cukup 3 zona: kata/arti, meta (video + umur), aksi.

| Elemen | Komponen | Spec |
|---|---|---|
| Cari | `Input type="search"` | `aria-label="Cari kata"`, placeholder "Cari kata atau arti…" (prototype: `⌕` dekoratif — boleh, `aria-hidden`) |
| Urutkan | native `<select>` bergaya `Input` (bukan komponen baru) | pilihan "Terbaru" / "A–Z"; `aria-label="Urutkan daftar"`; di 375 jadi `w-full` |
| Baris | `Card` (`p-4`) atau `li` bergaris | `grid grid-cols-1 gap-2 md:grid-cols-[minmax(0,1fr)_auto]` |
| Status | `Badge tone="success"` "Tersimpan" | hanya jika status memang informatif; semua item di layar ini tersimpan, jadi badge boleh **dihilangkan** di M2 — pilih satu: tampilkan hanya saat ada kata tidak-lagi-tersimpan |
| Latih | `Button variant="secondary" size="sm"` "Latih" | → `/flashcards?word={id}`; `aria-label="Latih kata serendipity"` |
| Hapus | `Button variant="ghost" size="sm"` | **dua langkah inline**, bukan `window.confirm`: klik 1 → tombol berubah "Hapus?" (tone error) + "Batal", auto-reset 5s atau saat fokus pindah. `aria-live` tidak perlu, teks tombol sudah berubah |
| Undo | `Toast` | "Kata dihapus." + aksi "Urungkan" (kembalikan di indeks semula) |
| Footer | teks `text-xs text-muted` | "{count} kata" — jamak: pakai `count` di pesan (`{count, plural, ...}` next-intl) |

**Empty state:** `EmptyState` — mark `Aa`, judul "Belum ada kata tersimpan.", deskripsi "Simpan satu kata saat menonton, nanti muncul di sini.", aksi `Button primary` "Buka ruang belajar" → `/study`.
**No-results state:** berbeda dari empty: judul "Tidak ada kata yang cocok.", deskripsi "Coba kata lain atau ubah urutan.", aksi "Hapus pencarian" (reset filter).
**Loading:** 4 skeleton baris; toolbar tetap tampil (jangan sembunyikan kontrol).
**Error:** "Daftar kata belum bisa dimuat." + `Button` "Coba lagi".

**Filter/sort minimal — keputusan:** hanya 2 kontrol (cari + urut). Filter "Tersimpan" dari prototype dihapus (semua item tersimpan = filter tanpa efek). Ekspor CSV dihapus dari M2 (belum ada nilai data nyata; boleh ditunda ke M3+ bila CEO minta).

---

### 3.4 Flashcards — `/flashcards`

**Tujuan user (1 baris):** "Ulangi kata sebentar, tanpa buru-buru, dan tahu mana yang masih asing."
**Hierarki:** h1 → progres sesi → kartu (fokus utama, terpusat) → aksi tahu/lupa.

```
ULANGI TANPA TERBURU-BURU
Flashcards                            (h1)
Balik kartu untuk lihat artinya.

        SESI LATIHAN              3 / 8        (meta, tabular-nums)
        ┌───────────────────────────────┐
        │                               │
        │        serendipity            │  (display 3xl–4xl)
        │   Ketuk untuk balik           │
        │                               │
        │      (balik)                  │
        │  Temuan berharga yang datang  │
        │  tanpa diduga                 │
        │  “You gotta see this.” — demo │
        └───────────────────────────────┘
        [ Masih asing ]   [ Sudah nempel ]
             Spasi = balik · ← → = pindah
        Kelola kata tersimpan ↗
```

| Elemen | Spec |
|---|---|
| Progres bar | `ProgressBar` di atas kartu: `role="progressbar" aria-valuemin=0 aria-valuemax={total} aria-valuenow={index+1} aria-label="Progres sesi"`; teks "3 / 8" juga `aria-hidden` (dobel baca dihindari) |
| Kartu | `<button type="button">` **seluruh permukaan kartu** (sama seperti prototype): `w-full max-w-sm min-h-[16rem] rounded-xl border border-border bg-bg-surface shadow-elevated p-6 text-center`; `aria-label={flipped ? "Balik kembali ke kata" : "Balik kartu untuk lihat arti"}` |
| Sisi depan | kata (`font-display text-3xl font-extrabold`), hint kecil "Ketuk untuk balik", penanda sumber (`Badge neutral` nama video) |
| Sisi belakang | arti (`text-lg`), contoh kalimat (`text-sm text-secondary italic`, target language), sumber video |
| Bukan 3D flip | ganti isi dengan fade 100ms (`duration-instant`) atau langsung; alasan: 3D flip butuh `perspective`/backface + tinggi tetap, dan mati total saat reduced-motion |
| Aksi | `Button variant="secondary"` "Masih asing" → tandai perlu diulang, lanjut kartu berikutnya; `Button variant="primary"` "Sudah nempel" → tandai paham, lanjut |
| Aksi hanya setelah balik | sebelum kartu dibalik hanya tombol balik (hindari menilai tanpa melihat arti); tombol aksi `disabled` dengan `aria-disabled` + hint "Balik dulu" |
| Selesai | ganti kartu dengan `Card` "Sesi selesai." + ringkasan "X dari Y kata sudah nempel." + `Button primary` "Ulangi yang masih asing" (reset sesi ke kata bertanda asing) + `Button secondary` "Kembali ke kosakata" |
| Empty | "Belum ada kartu." / "Simpan kata dulu, lalu kembali ke sini." / `Button primary` "Buka ruang belajar" |
| Error | "Sesi belum bisa dimuat." + "Coba lagi" |

**Keyboard:** `Space`/`Enter` = balik kartu (native `<button>` sudah menangani — jangan tambah handler yang menduplikasi). `ArrowRight` = kartu berikutnya, `ArrowLeft` = sebelumnya, diikat di wrapper stage `onKeyDown` **hanya** saat fokus berada di dalam stage (`tabIndex={-1}` pada stage agar bisa menerima fokus). Saat kartu selesai, fokus otomatis ke tombol "Ulangi yang masih asing" (`ref.focus()`). Announce progres: wrapper `aria-live="polite"` teks "Kartu {n} dari {total}: {kata}" (visually hidden).

**Urutan kartu:** sesi dimulai dari kata `?word=` bila ada, lalu acak deterministik (seed dari indeks) — tetapi **acak tidak wajib di M3**; sequential sudah cukup, urutan acak ditunda.

---

### 3.5 Sesi selesai — `/study/[videoId]/selesai` (nama route menunggu @cto)

**Tujuan user (1 baris):** "Tutup sesi dengan rasa cukup — lihat apa yang didapat dan langkah kecil berikutnya."
**Hierarki:** pernyataan selesai (besar, hangat) → ringkasan video → progres → langkah berikutnya.

```
SELESAI MENONTON                                   [Sesi contoh]
Satu cerita selesai.
Belajarmu lanjut.                    (kata kedua pakai text-blue, bukan warna baru)
Ini rangkuman sesi kamu. Tidak ada nilai di sini—cuma langkah berikutnya.

┌──────────────────────────────────────────────────────────┐
│ ✓  VIDEO · 03:12                                         │
│    Video pertamamu dimulai di sini.                      │
│    5 kata baru kamu simpan.                              │
└──────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────┐
│ PROGRES BELAJAR                                          │
│ Setiap langkah tetap berarti.                            │
│ ████████░░░░░░  3 dari 8 kata nempel                     │
└──────────────────────────────────────────────────────────┘
LANGKAH BERIKUTNYA
┌─────────────────────┐ ┌─────────────────────┐
│ Aa  Ulangi kata  ↗  │ │ ▤  Latihan kartu ↗  │
│     Latih 5 kata    │ │     Sesi 8 kartu    │
└─────────────────────┘ └─────────────────────┘
        [ Kembali ke beranda ]  [ Pilih video lain ]
```

| Elemen | Komponen |
|---|---|
| Centang | `<span aria-hidden="true">✓</span>` dalam lingkaran `bg-success/10 text-success` — dekoratif, judul yang membawa makna |
| Ringkasan video | `Card`, ikon + durasi `tabular-nums` |
| Progres | `ProgressBar` + teks "3 dari 8 kata nempel" |
| Langkah berikutnya | 2 `Card` sebagai `Link` (bukan grid 4 seperti prototype — YAGNI, 2 tujuan nyata) |
| Aksi | `Button primary` "Kembali ke beranda", `Button secondary` "Pilih video lain" → `/study` |

**Layout:** `max-w-3xl mx-auto` + `py-12`; h1 `text-3xl md:text-4xl leading-display`. **Mobile:** aksi jadi `flex-col` penuh lebar (`min-h-11`).
**Empty/error:** hanya jika `videoId` tidak dikenal → `Card` "Sesi ini tidak ditemukan." + "Kembali ke beranda". Loading: skeleton 3 blok.

---

## 4. Komponen baru yang diusulkan

Lokasi: `apps/web/app/components/study/` (kecuali nav di `layout/`). Server-safe = tanpa `"use client"`.

| Komponen | File | Jenis | Props ringkas | Dipakai di |
|---|---|---|---|---|
| `PageHeading` | `study/PageHeading.tsx` | server | `{ eyebrow: string; title: string; description?: string; action?: ReactNode }` | 5 layar |
| `EmptyState` | `study/EmptyState.tsx` | server | `{ mark: string; title: string; description: string; action?: { label: string; href: string } }` | dashboard, vocabulary, flashcards |
| `ProgressBar` | `study/ProgressBar.tsx` | server | `{ value: number; max: number; label: string; valueText?: string; tone?: "blue" \| "success" }` | dashboard, flashcards, selesai |
| `Toast` | `study/Toast.tsx` | client | `{ message: string; actionLabel?: string; onAction?: () => void; onDismiss: () => void }` | simpan/hapus kata |
| `PlayerControls` | `study/PlayerControls.tsx` | client | `{ isPlaying; currentMs; durationMs; rate; onToggle; onSeek; onRateChange }` | `/study` |
| `TranscriptPanel` | `study/TranscriptPanel.tsx` | client | `{ lines: TranscriptLine[]; activeId?: string; savedIds: string[]; onSeek(ms); onToggleSave(id) }` | `/study` |
| `VocabularyList` | `study/VocabularyList.tsx` | client | `{ items: VocabularyItem[]; onDelete(id); onReview(id) }` | `/vocabulary` |
| `FlashcardDeck` | `study/FlashcardDeck.tsx` | client | `{ items: FlashcardItem[]; onFinish(result) }` | `/flashcards` |
| `StudyBottomNav` | `layout/StudyBottomNav.tsx` | client | `{}` (pakai `usePathname`) | shell `<md` |

Bentuk data (UI-side, **bukan** tempat menyimpan — itu keputusan @cto di `docs/decision-study-room.md`):

```ts
type TranscriptLine = {
  id: string; startMs: number; endMs: number;
  target: string;        // bahasa yang dipelajari
  translation: string;   // bahasa ibu
  keyWord: string;       // kata yang bisa disimpan
  saved: boolean;
};
type VocabularyItem = { id: string; term: string; meaning: string; sourceLabel: string; savedAt: number };
type FlashcardItem = { id: string; term: string; meaning: string; example?: string; sourceLabel: string };
```

**Sederhanakan bila ragu:** `PageHeading`, `EmptyState`, `ProgressBar` boleh di-inline kalau @developer hanya memakainya 1×. `Toast` wajib satu komponen (dipakai 2 layar + butuh `aria-live` konsisten).

---

## 5. Checklist a11y (wajib, per-PR)

- [ ] **Target 44px:** semua `Button`/`Chip` sudah `min-h-11`; tambahan yang perlu dicek: tombol simpan per baris transkrip (`min-h-11 min-w-11`), tab bottom nav (`min-h-14`), tombol hapus baris kosakata (`min-h-11 min-w-11`), kartu flashcard (seluruh kartu, bukan ikon).
- [ ] **Label:** semua ikon-only button punya `aria-label` berkonteks ("Simpan serendipity", "Hapus serendipity"), bukan "tombol".
- [ ] **Progress:** `<input type="range">` player → `aria-label` + `aria-valuetext`; `ProgressBar` → `role="progressbar"` + `aria-valuenow` + `aria-label`.
- [ ] **Player:** tombol putar/jeda `aria-label` berubah sesuai state; kecepatan `role="group"` + `Chip aria-pressed`.
- [ ] **Flashcard:** kartu = `<button>`; progres diumumkan via `aria-live="polite"` (visually hidden); fokus pindah ke aksi utama saat sesi selesai.
- [ ] **Fokus terlihat:** semua elemen fokusabel pakai `focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base`; jangan `outline-none` tanpa pengganti.
- [ ] **Kontras:** tidak ada `text-muted` untuk info penting; `accent` tidak jadi warna teks; badge mengikuti tone.
- [ ] **Reduced motion:** tambahkan blok global di `app/globals.css`:
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
  ```
  Lalu hapus ketergantungan makna pada animasi: flip kartu tetap terbaca lewat teks, baris transkrip aktif tetap terlihat lewat border + `aria-current`, scroll pakai `behavior: "auto"`.
- [ ] **Heading:** satu `h1` per layar; subsection `h2`; tidak melompat level.
- [ ] **Tanpa link mati:** tidak ada `/add-video`, `/settings`, `/pricing` di area belajar sampai route-nya ada; `AppSidebar` + bottom nav hanya 4 rute final.
- [ ] **Teks & bahasa:** atribut `lang` pada target (`lang="en"`) dan terjemahan (`lang="id"`) di transkrip/kartu.

---

## 6. Copy final (ID) — tone partner, bukan guru

**Prinsip copy:** sapa "kamu", kalimat pendek, tanpa kata "harus", tanpa angka/nilai, tanpa janji fitur yang belum ada. Brand: **Immerse** (prosa) / `immerse.` (wordmark) / **Mersi**. Catatan kecil untuk @cto: `messages/id.json` sekarang memakai "IMMERSE" kapital di `Metadata.title` dan "IMMERSE" di Landing — usul: prosa pakai "Immerse", kapital penuh hanya di wordmark/eyebrow. Konsistensi ini keputusan @cto/brand, saya tidak mengubah Landing.

### Dashboard
| Key (usul) | ID |
|---|---|
| `Dashboard.eyebrow` | Ruang belajar |
| `Dashboard.title` | Hai, selamat datang lagi. |
| `Dashboard.description` | Mulai dari satu video. Tidak harus yang panjang. |
| `Dashboard.continueEyebrow` | Lanjutkan belajar |
| `Dashboard.continueTitle` | Video pertamamu menunggu di sini. |
| `Dashboard.continueBody` | Tempel tautan video favoritmu dan kita belajar dari adegan yang kamu suka. |
| `Dashboard.continueCta` | Buka ruang belajar |
| `Dashboard.sampleTag` | Sesi contoh |
| `Dashboard.progressEyebrow` | Sedikit demi sedikit |
| `Dashboard.progressTitle` | Progres belajarmu |
| `Dashboard.wordsSaved` | kata tersimpan |
| `Dashboard.videosStudied` | video dipelajari |
| `Dashboard.studyDays` | hari belajar |
| `Dashboard.progressEmpty` | Angka ini muncul setelah kamu mulai belajar. |
| `Dashboard.wordsEyebrow` | Koleksi kecilmu |
| `Dashboard.wordsTitle` | Kata tersimpan |
| `Dashboard.wordsEmpty` | Kata yang kamu simpan akan mampir di sini. |
| `Dashboard.wordsEmptyCta` | Buka ruang belajar |

### Study / player
| Key (usul) | ID |
|---|---|
| `Study.eyebrow` | Ruang menonton |
| `Study.title` | Belajar lewat adegan. |
| `Study.videoEmptyTitle` | Video belum terhubung. |
| `Study.videoEmptyBody` | Tempel tautan video untuk mulai belajar. |
| `Study.play` / `Study.pause` | Putar / Jeda |
| `Study.seekLabel` | Posisi video |
| `Study.timeText` | {current} dari {duration} |
| `Study.speedLabel` | Kecepatan |
| `Study.speedNormal` / `Study.speedFast` | 1× / 1,5× |
| `Study.transcriptEyebrow` | Kata-kata di layar |
| `Study.transcriptTitle` | Transkrip |
| `Study.transcriptEmpty` | Transkrip belum tersedia untuk video ini. |
| `Study.transcriptEmptyCta` | Coba video lain |
| `Study.transcriptError` | Transkrip gagal dimuat. |
| `Study.retry` | Coba lagi |
| `Study.saveWord` | Simpan {word} |
| `Study.removeWord` | Hapus {word} dari kosakata |
| `Study.savedTag` | Tersimpan |
| `Study.seekTo` | Lompat ke {time} |
| `Study.practiceEyebrow` | Sesudah menonton |
| `Study.practiceTitle` | Latihan singkat |
| `Study.practiceVocabulary` | Kosakata |
| `Study.practiceFlashcards` | Latihan kata |
| `Study.mersiName` | Mersi |
| `Study.mersiRole` | Teman belajarmu |
| `Study.mersiQuote` | Kalau ada kata yang bikin penasaran, simpan aja. Nanti kita ulang bareng. |
| `Study.noteEyebrow` | Catatan belajar |
| `Study.noteTitle` | Satu langkah kecil. |
| `Study.noteBody` | Menonton ulang bagian yang sama juga bagian dari belajar. |

### Vocabulary
| Key (usul) | ID |
|---|---|
| `Vocabulary.eyebrow` | Koleksi kata dari ceritamu |
| `Vocabulary.title` | Kosakata saya |
| `Vocabulary.description` | Kata baru, diingat dengan caramu sendiri. |
| `Vocabulary.practice` | Latihan kata |
| `Vocabulary.searchLabel` / `Vocabulary.searchPlaceholder` | Cari kata / Cari kata atau arti… |
| `Vocabulary.sortLabel` | Urutkan daftar |
| `Vocabulary.sortNewest` / `Vocabulary.sortAz` | Terbaru / A–Z |
| `Vocabulary.count` | {count, plural, one {# kata} other {# kata}} |
| `Vocabulary.practiceOne` | Latih {word} |
| `Vocabulary.review` | Latih |
| `Vocabulary.delete` | Hapus {word} |
| `Vocabulary.deleteConfirm` / `Vocabulary.cancel` | Hapus? / Batal |
| `Vocabulary.emptyTitle` | Belum ada kata tersimpan. |
| `Vocabulary.emptyBody` | Simpan satu kata saat menonton, nanti muncul di sini. |
| `Vocabulary.emptyCta` | Buka ruang belajar |
| `Vocabulary.noResultsTitle` | Tidak ada kata yang cocok. |
| `Vocabulary.noResultsBody` | Coba kata lain atau ubah urutan. |
| `Vocabulary.errorTitle` | Daftar kata belum bisa dimuat. |

### Flashcards
| Key (usul) | ID |
|---|---|
| `Flashcards.eyebrow` | Ulangi tanpa terburu-buru |
| `Flashcards.title` | Flashcards |
| `Flashcards.description` | Balik kartu untuk lihat artinya. |
| `Flashcards.sessionLabel` | Sesi latihan |
| `Flashcards.counter` | {current} / {total} |
| `Flashcards.progressLabel` | Progres sesi |
| `Flashcards.reveal` | Balik kartu untuk lihat arti |
| `Flashcards.revealBack` | Balik kembali ke kata |
| `Flashcards.again` | Masih asing |
| `Flashcards.known` | Sudah nempel |
| `Flashcards.revealFirst` | Balik dulu |
| `Flashcards.hint` | Spasi untuk balik, panah untuk pindah. |
| `Flashcards.manage` | Kelola kata tersimpan |
| `Flashcards.doneTitle` | Sesi selesai. |
| `Flashcards.doneBody` | {known} dari {total} kata sudah nempel. |
| `Flashcards.doneRepeat` | Ulangi yang masih asing |
| `Flashcards.doneBack` | Kembali ke kosakata |
| `Flashcards.emptyTitle` | Belum ada kartu. |
| `Flashcards.emptyBody` | Simpan kata dulu, lalu kembali ke sini. |
| `Flashcards.emptyCta` | Buka ruang belajar |
| `Flashcards.errorTitle` | Sesi belum bisa dimuat. |

### Sesi selesai
| Key (usul) | ID |
|---|---|
| `SessionComplete.eyebrow` | Selesai menonton |
| `SessionComplete.title` | Satu cerita selesai. |
| `SessionComplete.titleAccent` | Belajarmu lanjut. |
| `SessionComplete.intro` | Ini rangkuman sesi kamu. Tidak ada nilai di sini—cuma langkah berikutnya. |
| `SessionComplete.videoLabel` | Video |
| `SessionComplete.newWords` | {count} kata baru kamu simpan. |
| `SessionComplete.progressEyebrow` | Progres belajar |
| `SessionComplete.progressTitle` | Setiap langkah tetap berarti. |
| `SessionComplete.progressValue` | {known} dari {total} kata nempel |
| `SessionComplete.nextEyebrow` | Langkah berikutnya |
| `SessionComplete.nextVocabulary` | Ulangi kata |
| `SessionComplete.nextFlashcards` | Latihan kartu |
| `SessionComplete.backHome` | Kembali ke beranda |
| `SessionComplete.pickAnother` | Pilih video lain |

### Common
| Key (usul) | ID |
|---|---|
| `Common.savedToast` | Kata disimpan. |
| `Common.removedToast` | Kata dihapus. |
| `Common.undo` | Urungkan |
| `Common.dismiss` | Tutup notifikasi |
| `Common.retry` | Coba lagi |
| `Common.cancel` | Batal |
| `Common.loading` | Memuat… |
| `Common.errorGeneric` | Ada yang belum bisa dimuat. |

**Catatan i18n:** namespace final = keputusan @cto (task-1). Usulan saya: `Dashboard` (diperluas, key placeholder dibuang), `Study`, `Vocabulary`, `Flashcards`, `SessionComplete`, `Common`; nav tetap di `Dashboard.nav*` karena `AppSidebar` sudah memakainya. Kalau @cto memilih satu namespace `StudyRoom.*`, daftar key di atas hanya berubah prefiks. Wajib: `messages/id.json` (source of truth, typed via `global.d.ts`) dan `messages/en.json` paritas 100%.

---

## 7. Milestone

### M1 — Shell & baca (dashboard + vocabulary)
**Scope:** `StudyBottomNav` di layout + padding mobile; `/dashboard` isi nyata (bukan placeholder); `/vocabulary` dengan daftar + cari + urut + empty/no-results; i18n namespace `Dashboard`, `Vocabulary`, `Common`; hapus key placeholder dashboard lama.
**Definisi selesai:**
1. `/dashboard` dan `/vocabulary` render 200, tanpa link mati (sidebar & bottom nav hanya 4 rute).
2. 375px: tidak ada scroll horizontal, bottom nav tidak menutupi konten, tiap tab ≥44px, `aria-current="page"` benar.
3. Empty + no-results tampil persis copy §6; daftar kosong = `EmptyState`, bukan teks liar.
4. `tsc --noEmit` dan `eslint .` bersih; key i18n id/en paritas.
5. Tidak ada warna/font/radius di luar token.

### M2 — Player & simpan kata
**Scope:** `/study` (stage placeholder, kontrol, transkrip dua bahasa, simpan/batal simpan), `Toast` + Undo, hapus kata di vocabulary (dua langkah), blok reduced-motion di `globals.css`, wiring `Simpan -> Vocabulary -> Flashcards` (link saja; deck masih stub).
**Definisi selesai:**
1. Putar/jeda, seek, kecepatan 1×/1,5× berfungsi dengan label & `aria-valuetext` benar; keyboard: `Space` di tombol, arrow di range.
2. Simpan kata di baris transkrip: tombol berubah `✓` + `aria-pressed`, `Badge` "Tersimpan", muncul di `/vocabulary` setelah refresh (sesuai keputusan data @cto), toast "Kata disimpan." / "Kata dihapus." + "Urungkan".
3. Hapus kata: dua langkah inline, unduh undo bekerja, tidak kehilangan data saat batal.
4. `prefers-reduced-motion: reduce` (emulasi DevTools): tidak ada transisi/transform/animasi, scroll tidak smooth, tidak ada konten yang hanya terlihat lewat animasi.
5. Semua target ≥44px, focus ring terlihat di semua kontrol baru.

### M3 — Flashcards & sesi selesai
**Scope:** `/flashcards` (kartu, progres, tahu/lupa, selesai), keyboard Arrow/Space, `?word=` deep link dari vocabulary; layar sesi selesai; polish state loading/error siap-API.
**Definisi selesai:**
1. Sesi 8 kartu: progres "3 / 8" terbaca screen reader (`aria-live` di wrapper, `progressbar` di bar), ArrowLeft/Right pindah, Space/Enter balik, fokus pindah ke aksi utama saat selesai.
2. Tombol "Masih asing"/"Sudah nempel" hanya aktif setelah kartu dibalik; state selesai menampilkan ringkasan yang benar.
3. Layar selesai: heading hierarchy benar, CTA "Ulangi yang masih asing" mereset sesi hanya ke kata bertanda asing.
4. `?word=` dari vocabulary memulai sesi dari kata itu; tanpa param, urut dari awal.
5. Handoff ke @qa: tabel kriteria §5 dicek satu per satu, screenshot 1440 & 375 dilampirkan bila memungkinkan.

---

## 8. Handoff / pertanyaan terbuka
1. **Namespace i18n final** — @cto (task-1). Spec ini memakai usulan di §6; prefiks bisa berubah tanpa mengubah copy.
2. **Bentuk data & penyimpanan** — @cto. Komponen di §4 hanya butuh props; jangan taruh fixture di dalam komponen.
3. **Route sesi selesai & route flashcards** — @cto. Usul: `/flashcards` rute sendiri (dipakai vocab + player + dashboard), sesi selesai `/study/[id]/selesai`.
4. **"Simpan kata" dari heading player dihapus** (satu jalur aksi). Kalau CEO ingin tetap ada, perlu modal pemilih kata — bukan M2.
5. **AppHeader marketing di atas ruang belajar** — biarkan sampai ada keputusan @cto.
6. **Ekspor CSV** (prototype) — ditunda; tidak masuk M1–M3.
