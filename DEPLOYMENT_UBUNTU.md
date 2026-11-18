# Panduan Deployment Immerse ke VPS Ubuntu

Dokumen standar operasional deployment untuk menjalankan platform **Immerse** di server VPS Ubuntu (20.04 / 22.04 / 24.04 LTS).

---

## 1. Spesifikasi Minimum Server (VPS Ubuntu)
- **CPU**: 2 vCPU
- **RAM**: 2 GB (Rekomendasi 4 GB untuk build Next.js yang lancar)
- **Storage**: 25 GB SSD/NVMe
- **OS**: Ubuntu 22.04 LTS / 24.04 LTS

---

## 2. Persiapan Awal di Server Ubuntu

Masuk via SSH ke VPS Anda:
```bash
ssh root@IP_VPS_ANDA
```

Jalankan update dan install Node.js 20 LTS, pnpm, serta PM2:
```bash
# Update package manager
sudo apt update && sudo apt upgrade -y

# Install Git, curl, Nginx, certbot
sudo apt install -y git curl nginx certbot python3-certbot-nginx

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Enable Corepack & pnpm
sudo corepack enable
corepack prepare pnpm@latest --activate

# Install PM2 (Process Manager)
sudo npm install -g pm2
```

---

## 3. Clone Repository & Install Dependency

```bash
# Masuk ke direktori web
cd /var/www

# Clone repository Anda (atau salin folder proyek)
git clone <URL_REPO_ANDA> immerse
cd immerse

# Install seluruh dependency monorepo
pnpm install --frozen-lockfile

# Build seluruh paket (shared, web, api)
pnpm build
```

---

## 4. Menjalankan Aplikasi dengan PM2 (Produksi)

File konfigurasi `ecosystem.config.js` sudah disiapkan di root proyek:

```bash
# Jalankan aplikasi web & api
pm2 start ecosystem.config.js

# Simpan proses agar otomatis jalan saat server reboot
pm2 save
pm2 startup
```

Periksa status:
```bash
pm2 status
```

---

## 5. Konfigurasi Nginx (Reverse Proxy)

Buat file konfigurasi Nginx untuk domain Anda (misal `immerse.app` atau IP VPS):
```bash
sudo nano /etc/nginx/sites-available/immerse
```

Isi konfigurasi berikut:
```nginx
server {
    listen 80;
    server_name immerse.app www.immerse.app; # Ganti dengan domain atau IP Anda

    # Next.js Web App
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend Express API (Jika aktif)
    location /api/ {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Aktifkan konfigurasi dan restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/immerse /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 6. Pasang SSL Gratis (HTTPS dengan Let's Encrypt)

```bash
sudo certbot --nginx -d immerse.app -d www.immerse.app
```
Pilih opsi redirect HTTP ke HTTPS otomatis.

---

## 7. Opsi Alternatif: Menggunakan Docker

Jika Anda lebih menyukai containerisasi Docker:
1. File `Dockerfile.web` sudah dibuat di root.
2. Build & jalankan container:
```bash
docker build -t immerse-web -f Dockerfile.web .
docker run -d -p 3000:3000 --name immerse-app --restart always immerse-web
```
