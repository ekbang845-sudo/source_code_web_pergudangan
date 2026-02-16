"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import ExcelJS from "exceljs";
import { sendMail } from "@/lib/mail";

export const tutupBukuAction = async () => {
  const session = await auth();
  
  if (!session?.user?.email || session?.user?.role !== "admin") {
    return { success: false, message: "Akses ditolak! Anda bukan admin." };
  }

  try {
    // 1. Ambil Data
    const [stok, masuk, keluar, pinjam, logs] = await Promise.all([
      prisma.data_barang.findMany({ where: { isDeleted: false } }),
      prisma.data_barang_masuk.findMany({ include: { data_barang: true } }),
      prisma.data_barang_keluar.findMany({ include: { data_barang: true } }),
      prisma.peminjaman.findMany({ include: { data_barang: true } }),
      prisma.auditLog.findMany({ include: { user: true }, orderBy: { createdAt: "desc" }, take: 1000 }), 
    ]);

    const workbook = new ExcelJS.Workbook();

    // Fungsi Helper Tabel (Hanya membuat satu sheet per panggilan)
    const createStyledTable = (sheetName: string, columns: any[], rows: any[]) => {
      const sheet = workbook.addWorksheet(sheetName);
      
      sheet.mergeCells('A1:C1');
      sheet.getCell('A1').value = `LAPORAN ${sheetName.toUpperCase()}`;
      sheet.getCell('A1').font = { size: 14, bold: true };

      sheet.addTable({
        name: sheetName.replace(/\s+/g, ''),
        ref: 'A3',
        headerRow: true,
        style: { theme: 'TableStyleMedium9', showRowStripes: true },
        columns: columns.map(col => ({ name: col.header, filterButton: true })),
        rows: rows,
      });

      columns.forEach((col, index) => {
        sheet.getColumn(index + 1).width = col.width || 20;
      });
    };

    // 2. Buat Sheet (Data dipetakan di sini)
    createStyledTable("Sisa Stok Akhir", 
      [{ header: "Nama Barang", width: 40 }, { header: "Stok", width: 12 }, { header: "Satuan", width: 15 }],
      stok.map(i => [i.nama_barang, i.stok_barang, i.satuan_barang])
    );

    createStyledTable("Riwayat Masuk",
      [{ header: "Tanggal", width: 20 }, { header: "Barang", width: 35 }, { header: "Jumlah", width: 12 }, { header: "Sumber", width: 30 }],
      masuk.map(m => [m.tanggal_masuk.toLocaleDateString("id-ID"), m.data_barang?.nama_barang || "-", m.jumlah_barang, m.sumber_barang])
    );

    createStyledTable("Riwayat Keluar",
      [{ header: "Tanggal", width: 20 }, { header: "Barang", width: 35 }, { header: "Jumlah", width: 12 }, { header: "Keterangan", width: 40 }],
      keluar.map(k => [k.tanggal_keluar.toLocaleDateString("id-ID"), k.data_barang?.nama_barang || "-", k.jumlah_keluar, k.keterangan])
    );

    createStyledTable("Riwayat Peminjaman",
      [{ header: "Peminjam", width: 25 }, { header: "Barang", width: 35 }, { header: "Jumlah", width: 12 }, { header: "Status", width: 20 }],
      pinjam.map(p => [p.nama_peminjam, p.data_barang?.nama_barang || "-", p.jumlah_peminjaman, p.status_peminjaman])
    );

    createStyledTable("Riwayat Aktivitas",
      [{ header: "Waktu", width: 25 }, { header: "User", width: 20 }, { header: "Aksi", width: 15 }, { header: "Data", width: 40 }],
      logs.map(l => [l.createdAt.toLocaleString("id-ID"), l.user?.name || "System", l.action, l.dataName])
    );

    const buffer = await workbook.xlsx.writeBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const fileName = `Arsip_Gudang_${new Date().getFullYear()}.xlsx`;

    // 3. PENGIRIMAN EMAIL (Dipanggil sebelum hapus data)
    const settings = await prisma.backupSettings.findFirst({
      include: { additionalEmails: { where: { isVerified: true } } }
    });

    if (settings?.isEmailActive) {
    const additional = settings.additionalEmails.map(e => e.email).filter(Boolean);
    const recipients = [settings.adminEmail, ...additional].filter(Boolean);

    if (recipients.length > 0) {
      try {
        await sendMail(
          recipients, 
          "BACKUP DATA GUDANG - TUTUP BUKU", 
          `Halo, terlampir laporan arsip periode ini. Dilakukan oleh: ${session.user.name}`,
          [{ 
            filename: fileName, 
            content: Buffer.from(buffer) 
          }]
        );
      } catch (e) {
        console.error("Gagal kirim email, tapi proses lanjut:", e);
      }
    }
  }

    // 4. RESET DATABASE (Transaksi)
    await prisma.$transaction(async (tx) => {
      await tx.auditLog.deleteMany({});
      await tx.data_barang_masuk.deleteMany({});
      await tx.data_barang_keluar.deleteMany({});
      await tx.peminjaman.deleteMany({
        where: { OR: [{ status_peminjaman: "Dikembalikan" }, { isDeleted: true }] }
      });
      await tx.data_barang.deleteMany({ where: { isDeleted: true } });
      await tx.auditLog.create({
        data: {
          userId: session.user.id as string,
          action: "TUTUP BUKU",
          tableName: "semua tabel transaksi",
          dataName: "Semua data ditabel transaksi",
        },
      });
    });

    return { success: true, message: "Berhasil Tutup Buku!", file: base64, fileName };
  } catch (error) {
    console.error("Error:", error);
    return { success: false, message: "Terjadi kesalahan sistem." };
  }
};