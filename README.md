# Gudang Kelurahan - Sistem Informasi Manajemen Aset

Aplikasi web untuk manajemen inventaris barang, peminjaman, dan pelaporan stok di lingkungan kelurahan. Dibuat menggunakan **Next.js 16**, **Prisma ORM**, dan **PostgreSQL**.

## 📋 Fitur Utama

- **Dashboard**: Ringkasan statistik barang dan aktivitas terbaru.
- **Manajemen Barang**: CRUD data barang, stok, dan kategori (Bulanan/Reguler).
- **Transaksi Barang**: Pencatatan barang masuk dan barang keluar.
- **Peminjaman**: Sistem peminjaman barang dengan status dan pengembalian stok otomatis.
- **Laporan**: Export laporan stok, barang masuk, dan barang keluar ke Excel (.xlsx).
- **Manajemen Akun**: Kelola pengguna (Admin/Staff) dengan role-based access.

## 🛠️ Teknologi yang Digunakan

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Database**: PostgreSQL
- **ORM**: [Prisma](https://www.prisma.io/)
- **Auth**: [Auth.js (NextAuth v5)](https://authjs.dev/)
- **Styling**: Tailwind CSS
- **Icons**: React Icons
- **Export**: ExcelJS

## 🚀 Langkah Instalasi

### 1. Prasyarat

Pastikan sudah menginstall:

- [Node.js](https://nodejs.org/) (Versi 18 atau terbaru)

- Git

### 2. Clone Repository

```bash
git clone https://github.com/Mirvku/gudang_kelurahan_pppl.git
cd gudang_kelurahan
```

### 3. Install Dependencies

```bash
npm install
# atau
yarn install
```

### 4. Konfigurasi Environment Variables

Buat file `.env` di root folder proyek, lalu salin konfigurasi berikut dan sesuaikan dengan database Anda:

```env
# Koneksi Database (Sesuaikan username, password, dan nama db)
DATABASE_URL="postgresql://postgres:password@localhost:5432/gudang_kelurahan?schema=public"

# Secret untuk NextAuth (Bisa generate random string: openssl rand -base64 32)
AUTH_SECRET="rahasia_super_aman_123"
```

### 5. Setup Database

Jalankan migrasi Prisma untuk membuat tabel di database:

```bash
npx prisma migrate dev --name init
```

### 6. Jalankan Aplikasi

Jalankan server development:

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

---

Create with ❤️ by Team PPPL .
