import { prisma } from "@/lib/prisma";

const ITEMS_PER_PAGE = 7;

// Mengambil total halaman untuk pagination data barang
export const fetchDataBarangPages = async (
  query: string,
  filter: string = ""
) => {
  const whereClause: any = {
    nama_barang: {
      contains: query,
      mode: "insensitive",
    },
    isDeleted: false,
  };
  if (filter === "habis") {
    whereClause.stok_barang = 0;
  }

  //if (filter === "rendah") {
  //  whereClause.stok_barang = {
  //    lte: 5,
  //  };
  //}

  try {
    const totalItems = await prisma.data_barang.count({
      where: whereClause,
    });
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total pages.");
  }
};

// Mengambil data barang dengan filter, sorting, dan pagination
export const fetchDataBarang = async (
  query: string,
  currentPage: number,
  sort: string = "",
  filter: string = ""
) => {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  let orderBy: any = { createdAt: "desc" };

  switch (sort) {
    case "stok-desc":
      orderBy = { stok_barang: "desc" };
      break;
    case "stok-asc":
      orderBy = { stok_barang: "asc" };
      break;
    case "nama-asc":
      orderBy = { nama_barang: "asc" };
      break;
    case "nama-desc":
      orderBy = { nama_barang: "desc" };
      break;
    case "bulanan":
      orderBy = { is_stock_bulanan: "desc" };
      break;
    case "reguler":
      orderBy = { is_stock_bulanan: "asc" };
      break;
    default:
      orderBy = { createdAt: "desc" };
  }

  const whereClause: any = {
    nama_barang: {
      contains: query,
      mode: "insensitive",
    },
    isDeleted: false,
  };
  if (filter === "habis") {
    whereClause.stok_barang = 0;
  }

  //if (filter === "rendah") {
  //  whereClause.stok_barang = {
  //    lte: 5,
  //  };
  //}

  try {
    const data = await prisma.data_barang.findMany({
      where: whereClause,
      skip: offset,
      take: ITEMS_PER_PAGE,
      orderBy: orderBy,
    });
    return data;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch data barang.");
  }
};

// Mengambil total jumlah barang (untuk statistik dashboard)
export const fetchTotalBarang = async (
  query: string = "",
  filter: string = ""
) => {
  const whereClause: any = {
    nama_barang: {
      contains: query,
      mode: "insensitive",
    },
    isDeleted: false,
  };
  if (filter === "habis") {
    whereClause.stok_barang = 0;
  }

  //if (filter === "rendah") {
  //  whereClause.stok_barang = {
  //    lte: 5,
  //  };
  //}

  try {
    const total = await prisma.data_barang.count({
      where: whereClause,
    });
    return total;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total barang.");
  }
};

// Mengambil semua data barang (untuk dropdown pilihan barang)
export const fetchAllBarang = async () => {
  try {
    const data = await prisma.data_barang.findMany({
      where: { isDeleted: false },
      orderBy: {
        nama_barang: "asc",
      },
      select: {
        id_barang: true,
        nama_barang: true,
        satuan_barang: true,
        stok_barang: true,
      },
    });
    return data;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch all barang.");
  }
};
