-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Data_barang" (
    "id_barang" SERIAL NOT NULL,
    "nama_barang" TEXT NOT NULL,
    "is_stock_bulanan" BOOLEAN NOT NULL DEFAULT false,
    "satuan_barang" TEXT NOT NULL,
    "stok_barang" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Data_barang_pkey" PRIMARY KEY ("id_barang")
);

-- CreateTable
CREATE TABLE "Data_barang_masuk" (
    "id_barang_masuk" SERIAL NOT NULL,
    "id_barang" INTEGER NOT NULL,
    "jumlah_barang" INTEGER NOT NULL,
    "tanggal_masuk" TIMESTAMP(3) NOT NULL,
    "sumber_barang" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Data_barang_masuk_pkey" PRIMARY KEY ("id_barang_masuk")
);

-- CreateTable
CREATE TABLE "Data_barang_keluar" (
    "id_barang_keluar" SERIAL NOT NULL,
    "id_barang" INTEGER NOT NULL,
    "tanggal_keluar" TIMESTAMP(3) NOT NULL,
    "jumlah_keluar" INTEGER NOT NULL,
    "keterangan" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Data_barang_keluar_pkey" PRIMARY KEY ("id_barang_keluar")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Data_barang_masuk" ADD CONSTRAINT "Data_barang_masuk_id_barang_fkey" FOREIGN KEY ("id_barang") REFERENCES "Data_barang"("id_barang") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Data_barang_keluar" ADD CONSTRAINT "Data_barang_keluar_id_barang_fkey" FOREIGN KEY ("id_barang") REFERENCES "Data_barang"("id_barang") ON DELETE RESTRICT ON UPDATE CASCADE;
