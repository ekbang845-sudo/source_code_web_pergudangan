/*
  Warnings:

  - You are about to drop the column `tanggal_kembali` on the `Peminjaman` table. All the data in the column will be lost.
  - Added the required column `jumlah_peminjaman` to the `Peminjaman` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nama_peminjam` to the `Peminjaman` table without a default value. This is not possible if the table is not empty.
  - Added the required column `no_telepon` to the `Peminjaman` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Peminjaman" DROP COLUMN "tanggal_kembali",
ADD COLUMN     "alamat" TEXT NOT NULL DEFAULT '-',
ADD COLUMN     "jumlah_peminjaman" INTEGER NOT NULL,
ADD COLUMN     "kategori_peminjam" TEXT NOT NULL DEFAULT 'Warga',
ADD COLUMN     "nama_peminjam" TEXT NOT NULL,
ADD COLUMN     "no_telepon" TEXT NOT NULL,
ADD COLUMN     "nomor_ktp" TEXT NOT NULL DEFAULT '-',
ADD COLUMN     "status_peminjaman" TEXT NOT NULL DEFAULT 'Belum Dikembalikan';

-- CreateTable
CREATE TABLE "Satuan" (
    "id_satuan" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,

    CONSTRAINT "Satuan_pkey" PRIMARY KEY ("id_satuan")
);

-- CreateIndex
CREATE UNIQUE INDEX "Satuan_nama_key" ON "Satuan"("nama");

-- CreateIndex
CREATE INDEX "Data_barang_nama_barang_idx" ON "Data_barang"("nama_barang");

-- CreateIndex
CREATE INDEX "Data_barang_keluar_id_barang_idx" ON "Data_barang_keluar"("id_barang");

-- CreateIndex
CREATE INDEX "Data_barang_masuk_id_barang_idx" ON "Data_barang_masuk"("id_barang");

-- CreateIndex
CREATE INDEX "Peminjaman_nama_peminjam_idx" ON "Peminjaman"("nama_peminjam");

-- CreateIndex
CREATE INDEX "Peminjaman_status_peminjaman_idx" ON "Peminjaman"("status_peminjaman");

-- CreateIndex
CREATE INDEX "Peminjaman_id_barang_idx" ON "Peminjaman"("id_barang");
