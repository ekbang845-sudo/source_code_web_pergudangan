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
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const query = searchParams.get("query") || "";

    let whereClause: any = {
      isDeleted: false,
      OR: [
        {
          data_barang: {
            nama_barang: { contains: query, mode: "insensitive" },
          },
        },
        {
          keterangan: { contains: query, mode: "insensitive" },
        },
      ],
    };

    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Pastikan sampai akhir hari

      whereClause.tanggal_keluar = {
        gte: start,
        lte: end, // GUNAKAN variabel 'end' yang sudah diperbaiki
      };
    }

    // Fetch data from database
    const data = await prisma.data_barang_keluar.findMany({
      where: whereClause,
      include: {
        data_barang: true,
      },
      orderBy: {
        tanggal_keluar: "desc",
      },
    });

    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Laporan Barang Keluar");

    // Define columns
    worksheet.columns = [
      { header: "No", key: "no", width: 5 },
      { header: "Tanggal", key: "tanggal", width: 20 },
      { header: "Nama Barang", key: "nama_barang", width: 30 },
      { header: "Jumlah Keluar", key: "jumlah_keluar", width: 15 },
      { header: "Satuan", key: "satuan", width: 10 },
      { header: "Keterangan", key: "keterangan", width: 25 },
    ];

    // Add rows
    data.forEach((item, index) => {
      worksheet.addRow({
        no: index + 1,
        tanggal: item.tanggal_keluar.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        nama_barang: item.data_barang.nama_barang,
        jumlah_keluar: item.jumlah_keluar,
        satuan: item.data_barang.satuan_barang,
        keterangan: item.keterangan,
      });
    });

    // Style the header row
    const headerRow = worksheet.getRow(1);
    headerRow.height = 25;

    // Apply style only to the columns that have data (1 to 6)
    for (let i = 1; i <= 6; i++) {
      const cell = headerRow.getCell(i);
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1E88E5" }, // Blue background
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    }

    // Style all cells (borders and alignment)
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        // Add border
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };

        // Center align specific columns
        if (rowNumber > 1) {
          // Skip header
          const colIndex = Number(cell.col);
          if ([1, 2, 4, 5].includes(colIndex)) {
            // No, Tanggal, Jumlah, Satuan
            cell.alignment = { vertical: "middle", horizontal: "center" };
          } else {
            cell.alignment = { vertical: "middle", horizontal: "left" };
          }
        }
      });
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Return response
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="Laporan_Barang_Keluar_${
          startDate && endDate ? `${startDate}_sd_${endDate}` : "Semua"
        }.xlsx"`,
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
