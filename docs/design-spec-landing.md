# Design spec — Landing (React + Tailwind)

**Prioritas CEO:** landing & tampilan dulu; hasilnya akan diedit lanjut di Wonder.
**Token, motion, dan a11y:** mengikuti `docs/design-spec-auth.md` §2, §5, §6 (satu sumber kebenaran — tidak diulang di sini). Breakpoint disesuaikan dengan CSS asli: `xs 520 · sm 640 · md 760 · lg 900`.
**Brand:** `.cursor/rules/immerse.mdc` — neo-brutalism, border 3–4px, shadow keras tanpa blur, Archivo Black + Space Grotesk, heading uppercase, latar polkadot.

## 1. Struktur halaman

| Section | Komponen | Latar | Catatan |
|---|---|---|---|
| Nav | `Nav` | paper | sticky, border-b-3, brand + 3 link + CTA ghost |
| Hero | `Hero` + `PlayerMock` | paper + polkadot | grid 2 kolom (1.05fr/.95fr), stack <900 |
| Fitur | `Features` | paper | h2 + 4 kartu, 4 kolom → 2 (<900) → 1 (<520) |
| Cara kerja | `Steps` | pink, border-y-4 | 3 langkah, 1 kolom <760 |
| Mersi | `MersiSection` | paper | maskot 220px + copy + chat mock |
| CTA | `Cta` | lime, border-t-4 | h2 + tombol pink + fine |
| Footer | `Footer` | paper | logo + copyright + fine |

## 2. Komponen landing yang berbeda dari auth

| Komponen | Spec |
|---|---|
| `Hl` (highlight) | `inline-block bg-pink border-ink-3 px-3 shadow-brutal-md -rotate-[1.5deg]` — aksen playful, dipakai di h1 dan judul Mersi |
| `Card` (fitur) | `border-ink-4 rounded-lg p-6 shadow-brutal-lg` + hover naik `(-3px,-3px) rotate(-0.8deg)` shadow 9px (gated hover), transisi 160ms ease-out. Latar per kartu: yellow/pink/cyan/lime via prop `tone` |
| `Step` | sama dengan Card, `pt-14` + nomor dalam lingkaran `size-[30px]` absolute top-left — pakai `<span>`, bukan pseudo-element, supaya terbaca di Wonder |
| `PlayerMock` | border-ink-4 rounded-xl shadow-brutal-xl rotate-[0.6deg]; screen kuning polkadot, maskot 210px, dua baris subtitle absolut (atas surface, bawah lime); side panel surface berisi tabel grammar 3 baris + chip Mersi |
| `Chat` | border-ink-4 rounded-lg p-5 bg-surface shadow-brutal-xl; awalan "Kamu ·" (cyan) dan "Mersi ·" (lime) sebagai `<span>`, bukan pseudo |

## 3. Aturan khusus landing

- Anchor `#fitur`, `#cara`, `#mersi`, `#coba`, `#demo` harus tetap ada (scroll-behavior smooth; `auto` saat reduced-motion).
- `scroll-behavior: smooth` di `html`, dimatikan oleh `prefers-reduced-motion`.
- Subtitle di PlayerMock adalah konten demo — teks jangan diubah tanpa perintah.
- Emoji (★, ⚡, 💬, →) dekoratif: selalu bersebelahan dengan teks setara.
- Nilai spasi memakai skala dinamis Tailwind (1 unit = 4px): `py-18` hero, `py-21` section, `py-22` CTA.
- Font tetap dari Google Fonts (`Archivo Black`, `Space Grotesk` 400/500/700) — tidak di-bundle.

## 4. Yang disetahukan untuk Wonder

- Semua warna/radius/shadow/easing lewat token `@theme` di `web/src/styles/theme.css` — Wonder bisa memetakan ini ke file tokens.
- Komponen kecil dan semantik (`Button`, `Chip`, `Card`, `Step`), penamaan berdasarkan peran + isi — memudahkan `code-to-design`.
- Tidak ada nilai arbitrary kecuali: clamp fluid, rotasi aksen, shadow 9px (token `--shadow-brutal-hover`), dan offset safe-area.

## 5. Acceptance criteria landing

1. Paritas visual dengan `index.html` lama di 1440 dan 375 (perbandingan screenshot, toleransi pergeseran kecil akibat 16px input).
2. `scrollWidth === innerWidth` di 1440, 768, 375.
3. Semua hover berada di media hover; semua kontrol punya state `active`.
4. Skip link, `main#main`, heading hierarchy h1 → h2 → h3 tetap utuh.
5. `npm run build` dan `tsc --noEmit` bersih.
6. Tidak ada file lama yang dihapus sebelum CEO menyetujui hasilnya.
