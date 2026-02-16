-- CreateTable
CREATE TABLE "Peminjaman" (
    "id_peminjaman" SERIAL NOT NULL,
    "id_barang" INTEGER NOT NULL,
    "tanggal_peminjaman" TIMESTAMP(3),
    "tanggal_kembali" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Peminjaman_pkey" PRIMARY KEY ("id_peminjaman")
);

-- AddForeignKey
ALTER TABLE "Peminjaman" ADD CONSTRAINT "Peminjaman_id_barang_fkey" FOREIGN KEY ("id_barang") REFERENCES "Data_barang"("id_barang") ON DELETE RESTRICT ON UPDATE CASCADE;
