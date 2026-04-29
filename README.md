# Smart Groceries Dashboard

Dashboard frontend untuk memantau harga komoditas pangan dari backend scraper/laporan lapangan. Project ini dibangun dengan React + Vite dan terhubung ke route backend:

- `GET /api/prices/latest`
- `GET /api/prices/master-list`
- `POST /api/prices/report`
- `GET /api/prices/my-reports`
- `GET /api/prices/notifications`
- `PATCH /api/prices/notifications/:id/read`
- `PATCH /api/prices/notifications/read-all`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/admin/stats`
- `GET /api/admin/reports/pending`
- `PATCH /api/admin/reports/:id/moderate`
- `GET /api/admin/users`
- `PATCH /api/admin/users/:id`
- `GET /api/admin/users/:id/reports`
- `POST /api/admin/scrape-now`
- `GET /api/admin/logs`
- `POST /api/admin/broadcast`
- `GET /api/admin/export`

## Menjalankan project

```bash
npm install
npm run dev
```

Secara default frontend memakai proxy Vite ke `http://localhost:3000`, jadi backend perlu aktif di alamat itu saat development.

## Konfigurasi backend

Jika API berjalan di host lain, buat file `.env` lalu isi:

```bash
VITE_API_BASE_URL=http://your-backend-host:3000
```

Frontend akan memanggil `${VITE_API_BASE_URL}/api/...` jika `VITE_API_BASE_URL` diisi, atau `/api/...` jika memakai proxy Vite default.

Form pelaporan sekarang mengikuti kebutuhan backend `scrapper-harga-pangan`: user harus register/login dulu untuk memperoleh JWT, lalu submit laporan ke `POST /api/prices/report` dengan header `Authorization: Bearer <token>`.

Panel admin sekarang juga menyiapkan kontrol operasional untuk:

- moderasi laporan dan deteksi outlier dari backend
- ringkasan user reporter dan update role/ban
- export snapshot JSON/CSV dari data yang sedang dimuat
- force scraping, broadcast, log scraper, dan full export backend

Jika nanti backend ditambah, frontend bisa memakai env opsional berikut:

```bash
VITE_ADMIN_SCRAPE_PATH=/api/admin/scrape-now
VITE_ADMIN_BROADCAST_PATH=/api/admin/broadcast
VITE_ADMIN_EXPORT_PATH=/api/admin/export
VITE_ADMIN_USERS_PATH=/api/admin/users
VITE_ADMIN_MODERATION_PATH=/api/admin/reports/moderate
```

Payload submit:

```json
{
  "komoditas": "Beras",
  "provinsi": "DKI Jakarta",
  "kota": "Jakarta Pusat",
  "lokasi": "Jakarta Pusat, DKI Jakarta",
  "harga": 82000,
  "lat": -6.2088,
  "lng": 106.8456,
  "catatan": "Harga pagi hari di pasar utama"
}
```

## Scripts

- `npm run dev` menjalankan local dev server
- `npm run build` membuat production build
- `npm run preview` preview hasil build
- `npm run lint` menjalankan ESLint

## Fitur UI saat ini

- Ringkasan total laporan, sumber official vs user, dan lokasi aktif
- Kartu spotlight komoditas dengan indikator tren
- Feed laporan terbaru
- Snapshot lokasi laporan
- Pencarian berdasarkan komoditas atau lokasi
- Tombol refresh manual dan retry saat backend gagal diakses
- Form `Report Price` dengan register/login JWT dan submit async ke backend
- Riwayat `My Reports` dan notifikasi moderasi user dari backend
- View admin yang memuat statistik, queue moderasi, user management, log scraper, broadcast, dan export bila login sebagai admin
- Outlier detection admin untuk laporan user dengan deviasi >= 50% dari harga official terbaru
- Moderation queue, user watchlist, role update, dan ban/unban yang tersambung ke backend
- Export snapshot CSV/JSON langsung dari browser
