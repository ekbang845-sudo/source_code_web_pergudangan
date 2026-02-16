import { prisma } from "@/lib/prisma";

const ITEMS_PER_PAGE = 7;

export const fetchDataBarangMasuk = async (
  query: string,
  currentPage: number,
  startDate: string,
  endDate: string,
  sort: string = ""
) => {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  let orderBy: any = { createdAt: "desc" };

  if (sort === "tanggal-asc") {
    orderBy = { tanggal_masuk: "asc" };
  } else if (sort === "tanggal-desc") {
    orderBy = { tanggal_masuk: "desc" };
  } else if (sort === "nama-asc") {
    orderBy = { data_barang: { nama_barang: "asc" } };
  } else if (sort === "nama-desc") {
    orderBy = { data_barang: { nama_barang: "desc" } };
  } else if (sort === "jumlah-asc") {
    orderBy = { jumlah_barang: "asc" };
  } else if (sort === "jumlah-desc") {
    orderBy = { jumlah_barang: "desc" };
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
        sumber_barang: {
          contains: query,
          mode: "insensitive",
        },
      },
    ],
  };

  // Add date filter if both dates are provided
  if (startDate && endDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0); 

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); 

    whereClause.tanggal_masuk = {
      gte: start,
      lte: end, 
    };
  }

  try {
    const data = await prisma.data_barang_masuk.findMany({
      where: whereClause,
      include: {
        data_barang: true,
      },
      orderBy: orderBy,
      take: ITEMS_PER_PAGE,
      skip: offset,
    });
    return data;
  } catch (error) {
    throw new Error("Gagal mengambil data barang masuk");
  }
};

export const fetchTotalBarangMasukPages = async (
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
        sumber_barang: {
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
    
    whereClause.tanggal_masuk = {
      gte: start,
      lte: end, 
    };
  }

  try {
    const count = await prisma.data_barang_masuk.count({
      where: whereClause,
    });
    return Math.ceil(count / ITEMS_PER_PAGE);
  } catch (error) {
    throw new Error("Gagal mengambil total halaman barang masuk");
  }
};

export const fetchTotalBarangMasukCount = async (
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
        sumber_barang: {
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
    
    whereClause.tanggal_masuk = {
      gte: start,
      lte: end, 
    };
  }

  try {
    const count = await prisma.data_barang_masuk.count({
      where: whereClause,
    });
    return count;
  } catch (error) {
    throw new Error("Gagal mengambil total data barang masuk");
  }
};
