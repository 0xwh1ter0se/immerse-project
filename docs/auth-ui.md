# UI auth — @designer

Mengikuti neo-brutalism pada `.cursor/rules/immerse.mdc` dan token `styles.css`.

## Layout

- Header: logo, tautan beranda.
- Desktop: panel Mersi `--cyan` + kartu form; mobile: satu kolom tanpa overflow.
- Kartu: border `3px solid var(--ink)`, shadow `10px 10px 0 var(--ink)`, radius 14px.
- Judul `h1`: `Masuk` / `Daftar`, uppercase via CSS.
- Tombol submit full-width pada mobile, minimal tinggi 44px.
- Tidak ada tombol Google.

## Login

Satu field identifier berlabel `Email, no HP, atau username` (`autocomplete=email`, menerima email/no HP/username), password (`autocomplete=current-password`), tombol `Masuk`. Tautan `Belum punya akun? Daftar`.

## Registrasi

Email (`type=email`, `autocomplete=email`), no HP (`type=tel`, `autocomplete=tel`), username (`autocomplete=username`), password (`autocomplete=new-password`), konfirmasi password (`autocomplete=new-password`). Tombol `Daftar`. Tautan `Sudah punya akun? Masuk`.

## Aksesibilitas dan state

- Semua label terlihat; `required` dan validasi server.
- Fokus `outline:3px dashed var(--ink); outline-offset:3px`.
- Error submit `role=alert`, fokuskan alert pada render berikutnya; input invalid `aria-invalid=true` dan `aria-describedby`.
- Login error generik: `Email, no HP, atau username salah.`
- Registrasi error duplikat: `Email sudah terdaftar.` / `No HP sudah terdaftar.` / `Username sudah dipakai.`
- Server-rendered loading tidak perlu JS; validasi native browser. Tidak ada toggle password untuk MVP.
- Register berhasil membuat session dan redirect `/`, bukan email verifikasi.

## Dicoret @cto

Nama, persetujuan terms, lupa password, email verifikasi, tombol login pihak ketiga (Google): halaman/fitur terkait belum ada. Tambah bersama fiturnya, bukan link mati.
