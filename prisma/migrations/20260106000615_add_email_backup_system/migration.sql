-- AlterTable
ALTER TABLE "Data_barang" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedById" TEXT,
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "Data_barang_keluar" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Data_barang_masuk" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Peminjaman" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "activeSessionId" TEXT,
ADD COLUMN     "tokenVersion" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "tableName" TEXT NOT NULL,
    "dataName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BackupSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "isEmailActive" BOOLEAN NOT NULL DEFAULT false,
    "adminEmail" TEXT NOT NULL,

    CONSTRAINT "BackupSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerifiedEmail" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "otpCode" TEXT,
    "otpExpiry" TIMESTAMP(3),
    "settingsId" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "VerifiedEmail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VerifiedEmail_email_key" ON "VerifiedEmail"("email");

-- CreateIndex
CREATE INDEX "Data_barang_isDeleted_idx" ON "Data_barang"("isDeleted");

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Data_barang" ADD CONSTRAINT "Data_barang_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Data_barang" ADD CONSTRAINT "Data_barang_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Data_barang" ADD CONSTRAINT "Data_barang_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerifiedEmail" ADD CONSTRAINT "VerifiedEmail_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "BackupSettings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
