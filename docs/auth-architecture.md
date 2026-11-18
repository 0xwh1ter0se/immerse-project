# Auth — keputusan @cto

Status: stack **disetujui CEO** · Login nyata · Go + Postgres native (tanpa Docker). Revisi keamanan @cto wajib sebelum penggunaan; implementasi dan verifikasi @qa belum dilakukan.

**Revisi CEO (identitas):** registrasi wajib email **dan** no HP. Login pakai salah satu identifier: email **atau** phone **atau** username. Tanpa Gmail/OAuth/OTP. Label UI: sign in = "Masuk", sign up = "Daftar".

## Stack

| Layer | Pilihan | Alasan |
|---|---|---|
| Runtime | Go 1.22+ (stdlib + chi) | Ringan, cocok worker video nanti |
| DB | PostgreSQL 17 lokal | Session + user; native Windows service |
| Driver | `jackc/pgx/v5` + `pgxpool` | Std de facto Go↔Postgres |
| Hash | `golang.org/x/crypto/argon2` | Argon2id; jangan bcrypt |
| Router | `go-chi/chi/v5` | Middleware chain kecil |
| Template | `html/template` | Landing tetap statis; form login/register SSR |

**Ditolak:** Docker (lingkungan user), Supabase (vendor lock), JWT di localStorage (XSS), framework besar (Gin/Echo belum perlu).

## Struktur folder

```
cmd/server/main.go
internal/auth/          # register, login, logout, middleware, password, session
internal/store/         # pgx queries: users, sessions
internal/httpx/         # helpers: cookie, origin check, rate limit
migrations/             # SQL terversi (urut nomor)
templates/              # login.html, register.html
static/                 # styles.css, assets (atau symlink ke root)
.env.example
go.mod
```

Landing `index.html` di root **tetap**. Link nav "Masuk" → `/login`.

## Skema DB

```sql
-- 001_users.sql
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         CITEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 002_sessions.sql
CREATE TABLE sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash    BYTEA NOT NULL UNIQUE,   -- SHA-256 dari token acak 32 byte
  expires_at    TIMESTAMPTZ NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX sessions_user_id_idx ON sessions(user_id);
CREATE INDEX sessions_expires_at_idx ON sessions(expires_at);

-- 003_identity.sql
ALTER TABLE users ADD COLUMN phone    TEXT NOT NULL;
ALTER TABLE users ADD COLUMN username CITEXT NOT NULL;
CREATE UNIQUE INDEX users_phone_key    ON users(phone);
CREATE UNIQUE INDEX users_username_key ON users(username);
```

Extension: `pgcrypto` (untuk `gen_random_uuid`) + `citext`.

Kolom identitas:
- `phone` — `TEXT`, disimpan **ternormalisasi** E.164-ish lokal: hanya digit, prefix `62` (contoh `6281234567890`). Unik.
- `username` — `CITEXT` (case-insensitive), disimpan lowercase, `^[a-z0-9_]{3,20}$`. Unik.

### Normalisasi & validasi

- **Phone:** strip semua non-digit → `08xxx` jadi `628xxx` → `+62`/`62` dipertahankan sebagai `62…`. Tolak bila hasil bukan 10–15 digit atau tidak diawali `62`. Validasi format dasar saja (bukan lookup operator).
- **Username:** trim + lowercase, cocokkan regex `^[a-z0-9_]{3,20}$`.
- **Email:** trim + lowercase (CITEXT).
- Normalisasi terjadi di server sebelum cek unik/simpan; input mentah tidak disimpan.

### Deteksi identifier login (tunggal)

Satu field `identifier` pada form login:
1. Mengandung `@` → diperlakukan sebagai **email**
2. Diawali `0` atau `+62` (setelah trim) → **phone** (dinormalisasi seperti di atas)
3. Selain itu → **username** (lowercase, regex sama)

Ambigu tidak ditangani lebih jauh: aturan di atas deterministik. Query login memakai `WHERE email=$1 OR phone=$2 OR username=$3` dengan nilai hasil deteksi (nilai lain NULL/kosong), bukan pencarian bebas.


## Kontrak API / routes

| Method | Path | Auth | Perilaku |
|---|---|---|---|
| GET | `/login` | public | Form login (field tunggal: email / no HP / username) |
| POST | `/login` | public | Deteksi identifier → validasi → set cookie → redirect `/` |
| GET | `/register` | public | Form register (email + no HP + username + password) |
| POST | `/register` | public | Normalisasi + validasi → buat user → set cookie → redirect `/` |
| POST | `/logout` | session | Hapus session + cookie → redirect `/` |
| GET | `/me` | session | JSON `{id,email,phone,username}` atau 401 (smoke test) |

Cookie session:
- Name: `immerse_session`
- Value: token acak 32 byte, base64url
- Flags: `HttpOnly; SameSite=Lax; Path=/; Max-Age=2592000` (+ `Secure` bila `APP_ENV=production`); production wajib HTTPS. Development credential/cookie tidak boleh dipakai production.
- DB menyimpan **hash** token (SHA-256), bukan plaintext

## Password

- Argon2id: time=3, memory=64MiB, threads=2, keyLen=32, salt 16 byte acak
- Format simpan: `argon2id$v=19$m=65536,t=3,p=2$<salt_b64>$<hash_b64>`
- Bandingkan dengan `subtle.ConstantTimeCompare`
- Min length: 8. Max: 72 (tolak lebih panjang agar DoS hash tidak mudah)

## Keamanan wajib

1. Error login **sama**: "Email, no HP, atau username dan password salah." (anti enumeration — tidak membocorkan identifier mana yang ada)
2. Register: email/phone/username sudah ada → pesan generik per-field ("Email sudah terdaftar." / "No HP sudah terdaftar." / "Username sudah dipakai.") — register beda dari login, boleh spesifik
3. Rate limit: 10 gagal / 15 menit per IP+identifier (in-memory map dulu; `ponytail: Redis saat multi-instance`)
4. CSRF: `SameSite=Lax` + tolak POST bila `Origin`/`Referer` bukan host sendiri. **Catatan @cto:** ini cukup untuk POST form SSR dengan Lax, tapi hanya jika semua endpoint state-changing adalah POST — bukan GET. Tidak perlu token CSRF (YAGNI).
5. Validasi format di server: email, phone (normalisasi + 10–15 digit, prefix `62`), username (`^[a-z0-9_]{3,20}$`). Trim + lowercase sebelum simpan.
6. Jangan log password, token, hash, atau identifier mentah
7. **Kredensial jangan di-commit.** Nilai nyata hanya di `.env` lokal (gitignore `.env`); gunakan placeholder di contoh.

## Env

```
DATABASE_URL=postgres://immerse:<DB_PASSWORD>@127.0.0.1:5432/immerse?sslmode=disable
APP_ENV=development
HTTP_ADDR=:8080
SESSION_DAYS=30
```

Buat role + DB setelah Postgres up (password via variabel `:pw` di `psql`, jangan hardcode):

```sql
\set pw `echo $DB_PASSWORD`
CREATE USER immerse WITH PASSWORD :'pw';
CREATE DATABASE immerse OWNER immerse;
\c immerse
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;
```

**Dilarang** menaruh password nyata di dokumen, `.env.example`, repo, atau log. File `.env` masuk `.gitignore`. Production: `sslmode=require` + HTTPS + password dari secret manager/variable lingkungan, bukan file yang di-commit.

## Acceptance criteria (untuk @qa)

1. Register email+phone+username baru → cookie terpasang → `/me` 200 dengan ketiga field
2. Register dengan phone `0812-3456-7890` → tersimpan `6281234567890`; login pakai `081234567890`, `+6281234567890`, dan `6281234567890` semuanya berhasil
3. Login salah password → 401 generik, tidak bocorkan identifier mana yang ada
4. Login pakai username beda case (`Budi` vs `budi`) → berhasil (CITEXT)
5. Login benar → cookie baru, session lama boleh tetap (multi-device OK MVP)
6. Logout → cookie hilang, `/me` 401, baris session terhapus
7. 11 login gagal berturut → 429
8. Register phone tidak valid (mis. `123`, `08` pendek) → ditolak; username <3 atau >20 atau berkarakter lain → ditolak
9. Password di DB bukan plaintext; token cookie tidak sama dengan `token_hash`
10. Form keyboard-accessible, label ada, fokus terlihat
11. `.env` tidak ter-commit; `sslmode` produksi `require`; tidak ada password nyata di repo

## Urutan kerja

1. Install Go + Postgres selesai → verifikasi `go version`, `psql -U postgres`
2. `@developer` implementasi sesuai dokumen ini (jangan tambah OAuth/JWT/refresh)
3. `@designer` hanya jika UI login butuh token baru di luar neo-brutalism yang ada
4. `@qa` verifikasi AC di atas
5. Commit/deploy hanya atas perintah CEO

## Di luar scope (YAGNI)

OAuth, email verify, OTP/SMS verify, reset password, 2FA, refresh token, JWT, Redis, Docker, frontend React, ubah email/phone/username setelah daftar, lookup operator/kode negara selain +62.
Tambah saat ada user nyata yang butuh.
