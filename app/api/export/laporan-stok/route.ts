import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import ExcelJS from "exceljs";
import { auth } from "@/auth";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter");
    const query = searchParams.get("query") || "";

    // Buat klausa where berdasarkan filter
    let whereClause: any = {
      isDeleted: false,
      nama_barang: {
        contains: query,
        mode: "insensitive",
      },
    };

    if (filter === "habis") {
      whereClause.stok_barang = 0; 
    }

    // Ambil data dari database
    const data = await prisma.data_barang.findMany({
      where: whereClause,
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Buat workbook dan worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Laporan Stok");

    // Definisikan kolom
    worksheet.columns = [
      { header: "No", key: "no", width: 5 },
      { header: "Nama Barang", key: "nama_barang", width: 30 },
      { header: "Stok", key: "stok_barang", width: 10 },
      { header: "Satuan", key: "satuan_barang", width: 10 },
      { header: "Jenis Stok", key: "jenis_stok", width: 15 },
      { header: "Terakhir Update", key: "updatedAt", width: 25 },
    ];

    // Tambahkan baris
    data.forEach((item, index) => {
      worksheet.addRow({
        no: index + 1,
        nama_barang: item.nama_barang,
        stok_barang: item.stok_barang,
        satuan_barang: item.satuan_barang,
        jenis_stok: item.is_stock_bulanan ? "Bulanan" : "Reguler",
        updatedAt: item.updatedAt.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    });

    // Gaya baris header
    const headerRow = worksheet.getRow(1);
    headerRow.height = 25;

    // Terapkan gaya hanya ke kolom yang memiliki data (1 sampai 6)
    for (let i = 1; i <= 6; i++) {
      const cell = headerRow.getCell(i);
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1E88E5" }, // Latar belakang biru
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    }

    // Gaya semua sel (border dan perataan)
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        // Tambahkan border
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };

        // Rata tengah kolom tertentu
        if (rowNumber > 1) {
          // Lewati header
          const colIndex = Number(cell.col);
          if ([1, 3, 4, 5, 6].includes(colIndex)) {
            // No, Stok, Satuan, Jenis, Tanggal
            cell.alignment = { vertical: "middle", horizontal: "center" };
          } else {
            cell.alignment = { vertical: "middle", horizontal: "left" };
          }
        }
      });
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Kembalikan respons
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="Laporan_Stok_${
          filter === "habis" ? "Stok_Habis" : "Semua"
        }_${new Date().toISOString().split("T")[0]}.xlsx"`,
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}
