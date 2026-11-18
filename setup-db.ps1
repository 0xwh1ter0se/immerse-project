# Setup DB Immerse — jalankan sekali di PowerShell. Password digenerate acak dan hanya ditulis ke .env.
# Cara: .\setup-db.ps1   (akan prompt password superuser postgres)
$ErrorActionPreference = 'Stop'
$pgDir = (Get-ChildItem 'C:\Program Files\PostgreSQL' -Directory | Select-Object -Last 1).FullName
$env:Path = "$pgDir\bin;" + $env:Path

Write-Host "== Password superuser postgres (dibuat saat instalasi) =="
$sec = Read-Host -AsSecureString 'postgres password'
$ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec)
$env:PGPASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)

Write-Host "== Buat role + database =="
$roleExists = psql -U postgres -h 127.0.0.1 -tAc "SELECT 1 FROM pg_roles WHERE rolname='immerse'"
if ($roleExists.Trim() -ne '1') {
  # password acak, hanya disimpan di .env
  $bytes = New-Object byte[] 24
  [Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
  $dbPw = [Convert]::ToBase64String($bytes) -replace '[^A-Za-z0-9]', '' | ForEach-Object { $_.Substring(0, 24) }
  psql -U postgres -h 127.0.0.1 -v ON_ERROR_STOP=1 -c "CREATE ROLE immerse LOGIN PASSWORD '$dbPw';"
} else {
  Write-Host 'Role immerse sudah ada — password lama di .env dipakai.'
  $dbPw = (Get-Content .env | Select-String '^DATABASE_URL=' | ForEach-Object { ($_ -split '//immerse:')[1] -split '@' })[0]
  if (-not $dbPw) { throw 'Role immerse ada tapi password tidak ditemukan di .env. Hapus role atau isi .env manual.' }
}

$dbExists = psql -U postgres -h 127.0.0.1 -tAc "SELECT 1 FROM pg_database WHERE datname='immerse'"
if ($dbExists.Trim() -ne '1') { psql -U postgres -h 127.0.0.1 -v ON_ERROR_STOP=1 -c "CREATE DATABASE immerse OWNER immerse;" }

Write-Host "== Tulis .env lokal (gitignored) =="
"DATABASE_URL=postgres://immerse:$dbPw@127.0.0.1:5432/immerse?sslmode=disable`nAPP_ENV=development`nHTTP_ADDR=:8080`nSESSION_DAYS=30" | Out-File -Encoding utf8NoBOM .env

Write-Host "== Migrasi =="
$env:PGPASSWORD = $dbPw
Get-ChildItem migrations\*.sql | Sort-Object Name | ForEach-Object {
  Write-Host "migrate: $($_.Name)"
  psql -U immerse -h 127.0.0.1 -d immerse -v ON_ERROR_STOP=1 -f $_.FullName
}
Write-Host 'SELESAI. Jalankan: go run ./cmd/server'
