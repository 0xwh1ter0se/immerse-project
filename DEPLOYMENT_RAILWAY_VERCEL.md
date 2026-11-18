# Railway Deployment Guide for Immerse (Full Stack)

Arsitektur:
- **Frontend (Web)**: Vercel (Next.js 16 App Router)
- **Backend (API)**: Railway (Express.js API)
- **Database**: Railway PostgreSQL Plugin
- **Cache & Queue**: Railway Redis Plugin

---

## 1. Setup Railway (Database, Redis & API)

1. Buka [railway.app](https://railway.app) dan login dengan akun GitHub Anda.
2. Klik **"New Project"**.
3. **Tambahkan Database PostgreSQL**:
   - Pilih **"Provision PostgreSQL"**.
   - Railway otomatis membuat instance Postgres dan menyediakan variabel `${{Postgres.DATABASE_URL}}`.
4. **Tambahkan Redis**:
   - Klik **"+ New"** -> **"Database"** -> **"Add Redis"**.
   - Railway otomatis menyediakan variabel `${{Redis.REDIS_URL}}`.
5. **Deploy Backend API dari Repo GitHub**:
   - Klik **"+ New"** -> **"GitHub Repo"** -> Pilih `0xwh1ter0se/immerse-project`.
   - Di tab **Settings** service API tersebut:
     - **Root Directory**: `apps/api`
     - **Build Command**: `pnpm build`
     - **Start Command**: `node dist/server.js` (atau jalankan migrasi prisma: `npx prisma db push && node dist/server.js`)
   - Di tab **Variables**, tambahkan:
     - `DATABASE_URL`: `${{Postgres.DATABASE_URL}}` (pilih Reference Variable)
     - `REDIS_URL`: `${{Redis.REDIS_URL}}` (pilih Reference Variable)
     - `PORT`: `${{PORT}}`
     - `HOST`: `0.0.0.0`
     - `APP_ENV`: `production`
     - `AUTH_JWT_SECRET`: *(string acak minimal 32 karakter)*
     - `WEB_ORIGIN`: `https://<nama-project-anda>.vercel.app` (domain Vercel frontend)
     - `GOOGLE_CLIENT_ID`: *(isi jika menggunakan Google Auth, atau string dummy untuk tes)*
     - `GOOGLE_CLIENT_SECRET`: *(isi jika menggunakan Google Auth, atau string dummy untuk tes)*
     - `GOOGLE_REDIRECT_URI`: `https://<api-domain-railway>.up.railway.app/api/auth/google/callback`
     - `MIDTRANS_SERVER_KEY`: *(opsional/sandbox key)*
     - `MIDTRANS_CLIENT_KEY`: *(opsional/sandbox key)*
     - `MIDTRANS_IS_PRODUCTION`: `false`
   - Di tab **Networking**:
     - Klik **"Generate Domain"** (contoh: `immerse-api-production.up.railway.app`). Catat URL ini.

---

## 2. Setup Vercel (Frontend Next.js)

1. Buka [vercel.com/new](https://vercel.com/new).
2. Pilih repository `0xwh1ter0se/immerse-project` -> Klik **Import**.
3. Konfigurasi Project:
   - **Framework Preset**: Next.js
   - **Root Directory**: Klik **Edit** -> Pilih `apps/web`.
4. **Environment Variables**:
   - `NEXT_PUBLIC_API_URL`: URL API Railway Anda (misal `https://immerse-api-production.up.railway.app`).
5. Klik **Deploy**.
6. Setelah deployment Vercel selesai, perbarui variabel `WEB_ORIGIN` di Railway dengan domain produksi Vercel Anda (misal `https://immerse-project.vercel.app`).
