# Immerse — auth (Go + PostgreSQL native)

## Prasyarat

- Go >= 1.22 (`C:\Program Files\Go\bin\go.exe`)
- PostgreSQL 17 lokal (native Windows, tanpa Docker)

## Setup database (PowerShell)

Cara cepat: `.\setup-db.ps1` (prompt password superuser, buat role `immerse`, DB, `.env`, migrasi).

Manual:

```powershell
$PG = "C:\Program Files\PostgreSQL\17\bin"
$DB_PASSWORD = Read-Host "Password untuk role immerse" -AsSecureString
$pw = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($DB_PASSWORD))

& "$PG\psql.exe" -U postgres -h 127.0.0.1 -c "CREATE USER immerse WITH PASSWORD '$pw';"
& "$PG\psql.exe" -U postgres -h 127.0.0.1 -c "CREATE DATABASE immerse OWNER immerse;"

$env:DATABASE_URL = "postgres://immerse:$pw@127.0.0.1:5432/immerse?sslmode=disable"
go run ./cmd/migrate
```

Migrasi menjalankan `migrations/*.sql` berurutan, tercatat di `schema_migrations` (idempotent).

## Konfigurasi

```powershell
Copy-Item .env.example .env
# Isi DATABASE_URL sesuai password yang dibuat. Jangan commit .env.
```

## Jalankan

```powershell
$env:DATABASE_URL = "postgres://immerse:<pw>@127.0.0.1:5432/immerse?sslmode=disable"
go run ./cmd/server
# buka http://127.0.0.1:8080
```

Routes: `GET/POST /login`, `GET/POST /register`, `POST /logout`, `GET /me`, landing `/`.

## Test

```powershell
go test ./...
```

## Produksi

- `APP_ENV=production` (cookie `Secure`), wajib HTTPS, `sslmode=require` di DATABASE_URL.
- `APP_ORIGIN=https://immerse.app` wajib di produksi (server menolak start tanpa origin https valid).
- Kredensial dari secret manager / env, bukan file yang di-commit.
