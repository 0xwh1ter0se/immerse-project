# Design spec — Auth (React + Tailwind)

**Status:** menggantikan lapisan visual `docs/auth-ui.md`. Aturan fungsional di sana (field, autocomplete, pesan error, apa yang dicoret) tetap berlaku.
**Stack:** React 19 + TypeScript + Tailwind v4 + Vite. Go tetap server JSON.
**Sumber:** `styles.css` (migrasi), `.opencode/skills/emil-design-eng`, `mobile-native`, `animate`, `choreograph`.

---

## 1. Prinsip

| # | Prinsip | Konsekuensi di halaman auth |
|---|---|---|
| 1 | Feedback terjadi saat **press**, bukan saat release | Semua kontrol punya `active:` (translate + shadow mengecil), bukan cuma `hover:` |
| 2 | Hover tidak ada di perangkat sentuh | Setiap `hover:` dibungkus `@media (hover: hover) and (pointer: fine)` |
| 3 | Gerak hanya untuk menjelaskan perubahan | Entrance kartu 1×, sisanya transisi warna/posisi. Tidak ada animasi pada aksi keyboard |
| 4 | Elemen masuk tidak boleh dari `scale(0)` | Entrance pakai `opacity` + `translateY(4–10px)` |
| 5 | Durasi UI di bawah 300ms | Press 160ms, warna 140ms, entrance 260ms |
| 6 | Kurva custom, bukan easing bawaan | `--ease-out: cubic-bezier(.23,1,.32,1)` dipakai untuk semua gerak |
| 7 | Platform menentukan kemampuan, bukan tebakan | `dvh`, `env(safe-area-inset-*)`, `(pointer: coarse)` — tanpa deteksi user agent |
| 8 | Fokus harus terlihat dan rapi | Tombol: dashed 3px. Input: solid 3px menyatu dengan border — bukan dashed yang menabrak shadow |
| 9 | Teks isi tetap bisa diseleksi | `select-none` hanya di kontrol (tombol, chip), tidak di `body` |
| 10 | Layer, bukan hiasan: border + hard shadow menyatakan elevasi | Shadow tidak pernah blur; elevasi naik/turun lewat offset |

---

## 2. Token

Didefinisikan sekali di `web/src/styles/theme.css` lewat `@theme`. Tidak ada hex/px lepas di komponen.

### Warna

| Token | Nilai | Dipakai untuk |
|---|---|---|
| `--color-ink` | `#0F0F0F` | Teks, border, shadow |
| `--color-paper` | `#F5F1E6` | Latar halaman, nav |
| `--color-surface` | `#FFFFFF` | Kartu, input, chip |
| `--color-yellow` | `#FFF3D6` | Input fokus, hover ghost, badge |
| `--color-pink` | `#FFD9E8` | Alert error, highlight, CTA sekunder |
| `--color-cyan` | `#7DF0FF` | Panel info auth, hover nav |
| `--color-lime` | `#C6F432` | Tombol primary, aksen |
| `--color-muted` | `color-mix(in oklab, var(--color-ink) 65%, transparent)` | Hint, teks sekunder |

### Bentuk

| Token | Nilai | Catatan |
|---|---|---|
| `--radius-sm` | `8px` | Badge kecil, chip persegi |
| `--radius-md` | `12px` | Tombol, input |
| `--radius-lg` | `14px` | Kartu, panel |
| `--radius-xl` | `20px` | Player mock (landing) |
| `--radius-pill` | `999px` | Tag |
| `--shadow-brutal-xs` | `1px 1px 0 var(--color-ink)` | State pressed |
| `--shadow-brutal-sm` | `3px 3px 0 var(--color-ink)` | Chip, kontrol kecil |
| `--shadow-brutal-md` | `4px 4px 0 var(--color-ink)` | Hover, alert |
| `--shadow-brutal-lg` | `6px 6px 0 var(--color-ink)` | Tombol, input |
| `--shadow-brutal-xl` | `10px 10px 0 var(--color-ink)` | Kartu, panel |

### Gerak

| Token | Nilai |
|---|---|
| `--ease-out` | `cubic-bezier(.23, 1, .32, 1)` |
| `--ease-in-out` | `cubic-bezier(.77, 0, .175, 1)` |
| `--duration-press` | `160ms` |
| `--duration-color` | `140ms` |
| `--duration-enter` | `260ms` |
| `--duration-error` | `180ms` |

### Ketebalan border

Tailwind tidak punya `border-3`; definisikan utility sendiri di `theme.css`, jangan tulis `border-[3px]` berulang:

```css
@utility border-ink-2 { border: 2.5px solid var(--color-ink); }
@utility border-ink-3 { border: 3px solid var(--color-ink); }
@utility border-ink-4 { border: 4px solid var(--color-ink); }
```

---

## 3. Komponen

Semua di `web/src/components/ui/`. Props memakai `React.ComponentPropsWithoutRef<...>` supaya atribut HTML tetap lolos.

### 3.1 Button

```ts
type ButtonProps = React.ComponentPropsWithoutRef<'button'> & {
  variant?: 'primary' | 'ghost';   // default 'primary'
  size?: 'md' | 'lg';              // default 'md'
  loading?: boolean;
};
```

| State | Class inti |
|---|---|
| default (primary) | `bg-lime text-ink border-ink-3 rounded-md shadow-brutal-lg font-black` |
| default (ghost) | `bg-paper text-ink border-ink-3 rounded-md shadow-brutal-lg` |
| hover | `translate-x-[2px] translate-y-[2px] shadow-brutal-md` — **di dalam media hover** |
| active | `translate-x-[3px] translate-y-[3px] shadow-brutal-xs` |
| focus-visible | `outline-3 outline-dashed outline-ink outline-offset-[3px]` |
| disabled | `opacity-60 shadow-none cursor-not-allowed` + hover/active dimatikan |
| loading | `aria-busy="true"`, label → `Memproses…`, `disabled` |

- `size md`: `px-5 py-3 text-[15px] min-h-11` (44px).
- `size lg`: `px-8 py-4 text-[18px]`.
- Transisi: `transition-[transform,box-shadow,background-color] duration-(--duration-press) ease-(--ease-out)`.
- **Tidak** ada spinner berputar. Loading hanya teks + disable, ditampilkan setelah request >150ms agar tidak berkedip pada submit cepat.

### 3.2 Input

```ts
type InputProps = React.ComponentPropsWithoutRef<'input'> & { invalid?: boolean };
```

| State | Class inti |
|---|---|
| default | `w-full bg-surface border-ink-3 rounded-md px-4 py-3 text-base shadow-brutal-lg` |
| focus | `bg-yellow outline-3 outline-solid outline-ink outline-offset-0` |
| invalid | `bg-pink/40`, plus `aria-invalid="true"` dan pesan error dari `Field` |
| disabled | `opacity-60 cursor-not-allowed bg-paper` |

- `text-base` = 16px **wajib**; menurunkan ke 14–15px memicu zoom iOS.
- Transisi: `transition-colors duration-(--duration-color) ease-out`. Tidak ada transisi `border-width` atau `box-shadow` saat fokus.
- `invalid` tidak boleh bergantung pada warna saja — pesan teks wajib muncul.

### 3.3 Field

```ts
type FieldProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactElement<{ 'aria-describedby'?: string; 'aria-invalid'?: boolean }>;
};
```

- Label selalu terlihat: `font-bold text-sm mb-2 block`.
- `hint`: `text-[12.5px] text-muted mt-1.5`.
- `error`: `text-[13px] font-bold text-ink mt-1.5` dengan awalan `!` (ikon teks, bukan warna saja).
- `aria-describedby` = gabungan id hint + id error. `aria-invalid` diteruskan ke input.
- Error **tidak** dianimasikan (perubahan tinggi = layout shift).

### 3.4 Card

```ts
type CardProps = React.ComponentPropsWithoutRef<'div'> & { padding?: 'md' | 'lg' };
```

`bg-surface border-ink-3 rounded-lg shadow-brutal-xl`; padding `md` = `p-6`, `lg` = `p-8`. Di <520px padding turun ke `18px` (butuh prop `compact` atau media query di parent).

### 3.5 Alert (error banner)

```ts
type AlertProps = React.ComponentPropsWithoutRef<'div'> & { tone?: 'error' };
```

- `role="alert"`, `tabIndex={-1}`, `ref` → `focus()` saat mount (agar screen reader membacakan).
- `bg-pink border-ink-3 rounded-md shadow-brutal-md px-3.5 py-3 font-bold`.
- `focus:outline-none` — ring UA tidak dipakai; kotaknya sendiri sudah penanda.
- Entrance: `opacity 0 → 1`, `translateY(-4px) → 0`, `--duration-error`, `--ease-out`. **Bukan** keyframe (muncul-hilang cepat).

### 3.6 Nav / Brand

- `sticky top-0 z-10 bg-paper border-b-3` + `pt-[env(safe-area-inset-top)]`.
- Tinggi isi 72px; di <640px boleh wrap dua baris.
- Link nav: `font-bold px-3 py-1.5 rounded-[10px] border-2.5 border-transparent`, hover `bg-cyan border-ink` (gated).

### 3.7 AuthPanel

- Desktop (≥1024): `bg-cyan border-ink-4 rounded-lg p-7 shadow-brutal-xl rotate-[-0.8deg]`, maskot 170–220px, paragraf, lalu 3 chip.
- Mobile (<1024): jadi strip horizontal `flex-row` tanpa rotasi, maskot 96px, paragraf `text-sm`, daftar chip `hidden`.
- Panel `aria-hidden="true"` — informasinya duplikat dari konten utama.

### 3.8 Chip

`bg-surface border-ink-2 rounded-[10px] px-2.5 py-1.5 text-[13.5px] font-bold shadow-brutal-sm`, awalan `✓`.

---

## 4. Layout

| Breakpoint | Struktur |
|---|---|
| ≥1024 | `grid grid-cols-[minmax(0,1fr)_460px] gap-11 max-w-[960px] mx-auto items-start`; panel `self-center` |
| 768–1023 | satu kolom, panel jadi strip di atas kartu, gap 28px |
| <768 | satu kolom, padding halaman `px-4`, kartu lebar penuh |
| <520 | padding kartu 18px; tombol submit `w-full` |

- Urutan mobile: Nav → panel strip → judul → alert (bila ada) → field → tombol → link alt.
- Target sentuh minimum **44×44px**: tombol (min-h-11), input (py-3 + 16px ≈ 52px), link alt diberi `py-2`.
- Halaman auth tidak memakai tinggi `100vh`; konten mengalir dan `pb-[calc(84px+env(safe-area-inset-bottom))]`.
- Judul `h1`: `text-[clamp(26px,3.4vw,38px)] font-black uppercase`.
- Tidak ada scroll horizontal di 375px — diuji, bukan diasumsikan.

---

## 5. Motion

| Interaksi | Properti | Durasi | Easing | Alasan |
|---|---|---|---|---|
| Press tombol | `transform` + `box-shadow` | 160ms | `--ease-out` | Feedback fisik saat jari menyentuh |
| Hover tombol/kartu | `transform` + `box-shadow` | 160ms | `--ease-out` | Konsisten dengan press, hanya untuk pointer presisi |
| Fokus input | `background-color` | 140ms | `ease` | Perubahan warna, bukan gerak |
| Entrance kartu | `opacity` + `translateY(10px)` | 260ms | `--ease-out` | Sekali per kunjungan; menyambung render, bukan menunda interaksi |
| Entrance alert error | `opacity` + `translateY(-4px)` | 180ms | `--ease-out` | Menandai perubahan state tanpa mengejutkan |

**Tidak dianimasikan:**
- Submit & validasi (aksi keyboard/cepat) — hanya pergantian teks.
- Pesan error per field — muncul langsung; menganimasikan tinggi memicu layout.
- Perpindahan halaman Masuk ↔ Daftar — navigasi, bukan state.
- Stepper/stagger per field — membuat form terasa lambat.

**Reduced motion** (`prefers-reduced-motion: reduce`):
- Entrance turun jadi `opacity` saja, 200ms; `translateY` dihapus.
- Press/hover `transform` dihapus, `box-shadow` dan `background-color` tetap.
- Transisi warna tetap ada (membantu pemahaman, bukan gerak).

---

## 6. Aksesibilitas

- [ ] Ring fokus: tombol & link dashed 3px offset 3px; input solid 3px offset 0 (menyatu jadi border 6px).
- [ ] `outline` tidak pernah dihapus tanpa pengganti.
- [ ] Semua input punya `<label for>`; placeholder bukan label.
- [ ] Alert error `role="alert"` + difokuskan; input terkait `aria-invalid` + `aria-describedby`.
- [ ] Kontras: ink di paper 16.9:1, ink di lime 13.4:1, ink di cyan 14.2:1, muted di surface ≥5:1.
- [ ] `input font-size: 16px` di semua breakpoint.
- [ ] Target sentuh ≥44px, termasuk link "Daftar"/"Masuk" di bawah tombol.
- [ ] `autocomplete` sesuai `docs/auth-ui.md` (`username`, `current-password`, `email`, `tel`, `new-password`).
- [ ] `enterkeyhint`: `next` untuk field tengah, `go` (login) / `done` (konfirmasi) untuk terakhir.
- [ ] `-webkit-tap-highlight-color: transparent` + feedback `active` sebagai pengganti.
- [ ] `select-none` hanya di kontrol.
- [ ] Panel dekoratif `aria-hidden="true"`.

---

## 7. Struktur file yang diharapkan

```
web/
  index.html
  vite.config.ts
  src/
    main.tsx
    routes/            Landing.tsx  Login.tsx  Register.tsx
    components/ui/     Button.tsx  Input.tsx  Field.tsx  Card.tsx  Alert.tsx  Chip.tsx  Nav.tsx
    components/auth/   AuthLayout.tsx  AuthPanel.tsx
    lib/api.ts         postJson / ApiError { code, message, field }
    styles/theme.css   @theme + @utility + reduced-motion
```

---

## 8. Kontrak data untuk form

- Submit dinonaktifkan selama request berjalan; label jadi `Memproses…` setelah 150ms.
- `ApiError.field` menentukan pesan ditempel ke field mana; tanpa `field` → Alert di atas form.
- Setelah 401 login: Alert difokuskan, field password dikosongkan, nilai identifier dipertahankan.
- Setelah 409 daftar: field yang bentrok difokuskan, nilai lain dipertahankan.
- Error 429: tampil sebagai Alert, tanpa hitungan mundur (belum ada endpoint status).

---

## 9. Acceptance criteria (@developer / @qa)

**Statis**
1. Tidak ada `transition: all`.
2. Tidak ada `:hover` di luar `@media (hover: hover) and (pointer: fine)`.
3. Tidak ada `scale(0)` pada entrance.
4. Tidak ada hex/px lepas di komponen; semua lewat token `@theme`.
5. `styles.css` dan `templates/` tidak lagi direferensikan.

**Perilaku**
6. Tombol berubah posisi pada `pointerdown` (bukan hanya `click`), 160ms.
7. Input fokus: latar kuning + outline solid menyatu; tidak ada outline dashed.
8. Alert error menerima fokus saat muncul dan dibacakan (`role=alert`).
9. Tidak ada kedipan loading pada submit <150ms.

**Responsif**
10. 375px: `document.documentElement.scrollWidth === window.innerWidth`.
11. 375px: semua kontrol ≥44px, input `font-size: 16px`.
12. 768px dan 1024px: perpindahan layout sesuai tabel §4.

**Aksesibilitas**
13. Navigasi keyboard penuh: Tab melewati nav → field → tombol → link alt dengan ring terlihat.
14. `prefers-reduced-motion: reduce` menghapus semua `transform` animasi.
15. Kontras teks memenuhi AA (diukur, bukan dikira).

---

## 10. Perubahan dari UI sekarang

| Sekarang | Spec | Alasan |
|---|---|---|
| `styles.css` global | token `@theme` + utility | Satu sumber kebenaran, tidak ada nilai liar |
| Breakpoint stack 760px | 1024px | Di 800–1000px dua kolom + kartu 460px terlalu sempit |
| Input fokus `outline: dashed` | solid offset 0 | Dashed menabrak hard shadow, terlihat seperti bug |
| Hover tanpa gate | dibungkus media hover | Hover palsu menempel setelah tap di HP |
| Tanpa state `active` | translate + shadow mengecil | Umpan balik harus terasa saat menyentuh |
| Input 15px → 16px | 16px | Zoom iOS |
| Error banner ring UA | `focus:outline-none` | Ring ganda tidak menambah informasi |
| Submit langsung disable tanpa teks | `Memproses…` setelah 150ms | Menghindari kedipan dan memberi status |
