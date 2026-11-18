# Immerse — Handoff untuk Cursor

Status: **mockup statis, bukan produk.** Satu halaman HTML + CSS tanpa build step.
Domain: `immerse.app` (belum dibeli / belum dipakai). Brand: **Immerse**. AI assistant: **Mersi**.

## Cara jalanin

```bash
# tanpa python/node http-server, buka index.html langsung di browser
# atau pakai extension Live Server di Cursor
```

## Isi folder

```
index.html                     # 1 halaman: hero, fitur, cara kerja, mersi, cta, footer
styles.css                     # design token di :root + css per section
assets/logo.svg                # wordmark IMMERSE
assets/mascot.svg              # maskot Mersi (dua baris subtitle = muka)
assets/favicon.svg
SOUL.md                        # persona agent (dev + designer)
.cursor/rules/immerse.mdc      # design system, token, a11y rules — WAJIB dibaca
```

`.cursor/rules/immerse.mdc` sudah `alwaysApply: true`. Ikuti isinya sebelum ngubah UI.

## Yang sudah beres

- Design system neo-brutalism lengkap, token di `styles.css`.
- Maskot + logo + favicon dalam SVG (bisa diedit langsung di Figma/Illustrator).
- Lighthouse: a11y 1.0, SEO 1.0, best practices 1.0, 0 error console.
- Copy ID (bahasa Indonesia), tone "partner, bukan guru".

## Yang belum ada (jangan diasumsikan sudah jadi)

- Tidak ada backend, tidak ada API, tidak ada database.
- Tidak ada pemrosesan video / transkrip / subtitle.
- Tidak ada login, tidak ada storage.
- Form di hero **tidak** mengirim apa pun — `input` + `<a href="#demo">` saja.
- Copy masih menyebut "video pertama gratis" — belum ada billing.

## Urutan pengerjaan yang masuk akal

1. `@designer` → spec halaman produk (player full, dashboard, daftar kosakata) + token baru bila perlu.
2. `@cto` → putuskan stack saat pertama butuh state nyata. Rekomendasi: React + TS + Vite + Tailwind, backend Golang.
3. `@developer` → implementasi sesuai spec.
4. `@qa` → verifikasi (Lighthouse + screenshot desktop & 375px).

## Risiko

- **Trademark.** "Immerse" punya trademark live di AS (Immerse Inc., class 9/41, immersive language training). Terdaftar juga `Immerse & Converse` (Berlitz, class 41). Sebelum produksi: cek USPTO + PDKI Indonesia. Kalau konflik, ganti brand lebih awal — murah sekarang, mahal nanti.
- Domain `immerse.app` ada di RDAP (status 200) tapi tidak jelas aktif atau parked. Beli atau parkir sebelum publikasi.

## Timeline realistis untuk MVP

Belum ada backend. Yang paling sulit: transkrip + sinkron subtitle + terjemahan per-kalimat (Butuh ASR + MT + timing alignment). Rekomendasi MVP: mulai dari **file .srt/.vtt yang diunggah user**, bukan scraping YouTube/Netflix. Menghemat 80% pekerjaan legal dan teknis.
