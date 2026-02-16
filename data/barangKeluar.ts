import { prisma } from "@/lib/prisma";


const ITEMS_PER_PAGE = 7;

export const fetchDataBarangKeluar = async (
  query: string,
  currentPage: number,
  startDate: string,
  endDate: string,
  sort: string = ""
) => {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  let orderBy: any = { createdAt: "desc" };

  switch (sort) {
    case "tanggal-desc":
      orderBy = { tanggal_keluar: "desc" };
      break;
    case "tanggal-asc":
      orderBy = { tanggal_keluar: "asc" };
      break;
    case "nama-asc":
      orderBy = { data_barang: { nama_barang: "asc" } };
      break;
    case "nama-desc":
      orderBy = { data_barang: { nama_barang: "desc" } };
      break;
    case "jumlah-desc":
      orderBy = { jumlah_keluar: "desc" };
      break;
    case "jumlah-asc":
      orderBy = { jumlah_keluar: "asc" };
      break;
    default:
      orderBy = { createdAt: "desc" };
  }

  // Build where clause
  let whereClause: any = {
    isDeleted: false,
    OR: [
      {
        data_barang: {
          nama_barang: {
            contains: query,
            mode: "insensitive",
          },
        },
      },
      {
        keterangan: {
          contains: query,
          mode: "insensitive",
        },
      },
    ],
  };

  if (startDate && endDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0); 

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); 

    whereClause.tanggal_keluar = {
      gte: start,
      lte: end, 
    };
  }

  try {
    const data = await prisma.data_barang_keluar.findMany({
      where: whereClause,
      include: {
        data_barang: true,
      },
      skip: offset,
      take: ITEMS_PER_PAGE,
      orderBy: orderBy,
    });
    return data;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch data barang keluar.");
  }
};

export const fetchTotalBarangKeluarPages = async (
  query: string,
  startDate: string,
  endDate: string
) => {
  // Build where clause
  let whereClause: any = {
    isDeleted: false,
    OR: [
      {
        data_barang: {
          nama_barang: {
            contains: query,
            mode: "insensitive",
          },
        },
      },
      {
        keterangan: {
          contains: query,
          mode: "insensitive",
        },
      },
    ],
  };

  if (startDate && endDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    whereClause.tanggal_keluar = {
      gte: start,
      lte: end, 
    };
  }
  try {
    const count = await prisma.data_barang_keluar.count({
      where: whereClause,
    });
    return Math.ceil(count / ITEMS_PER_PAGE);
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total pages.");
  }
};

export const fetchTotalBarangKeluarCount = async (
  query: string,
  startDate: string,
  endDate: string
) => {
  // Build where clause
  let whereClause: any = {
    isDeleted: false,
    OR: [
      {
        data_barang: {
          nama_barang: {
            contains: query,
            mode: "insensitive",
          },
        },
      },
      {
        keterangan: {
          contains: query,
          mode: "insensitive",
        },
      },
    ],
  };

  if (startDate && endDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    whereClause.tanggal_keluar = {
      gte: start,
      lte: end, 
    };
  }

  try {
    const count = await prisma.data_barang_keluar.count({
      where: whereClause,
    });
    return count;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total count.");
  }
};
