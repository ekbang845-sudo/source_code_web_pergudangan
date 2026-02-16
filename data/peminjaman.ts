import { prisma } from "@/lib/prisma";

const ITEMS_PER_PAGE = 7;

export const fetchDataPeminjaman = async (
  query: string,
  currentPage: number,
  sort: string = ""
) => {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  let orderBy: any = { createdAt: "desc" }; // Default sort

  if (sort === "tanggal-asc") {
    orderBy = { tanggal_peminjaman: "asc" };
  } else if (sort === "tanggal-desc") {
    orderBy = { tanggal_peminjaman: "desc" };
  } else if (sort === "nama-asc") {
    orderBy = { nama_peminjam: "asc" };
  } else if (sort === "nama-desc") {
    orderBy = { nama_peminjam: "desc" };
  } else if (sort === "status-asc") {
    orderBy = { status_peminjaman: "asc" };
  } else if (sort === "status-desc") {
    orderBy = { status_peminjaman: "desc" };
  }

  try {
    const data = await prisma.peminjaman.findMany({
      where: {
        isDeleted: false,
        OR: [
          {
            nama_peminjam: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            data_barang: {
              nama_barang: {
                contains: query,
                mode: "insensitive",
              },
            },
          },
        ],
      },
      include: {
        data_barang: true,
      },
      orderBy: orderBy,
      take: ITEMS_PER_PAGE,
      skip: offset,
    });
    return data;
  } catch (error) {
    throw new Error("Gagal mengambil data peminjaman");
  }
};

export const fetchTotalPeminjamanPages = async (query: string) => {
  try {
    const count = await prisma.peminjaman.count({
      where: {
        isDeleted: false,
        OR: [
          {
            nama_peminjam: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            data_barang: {
              nama_barang: {
                contains: query,
                mode: "insensitive",
              },
            },
          },
        ],
      },
    });
    return Math.ceil(count / ITEMS_PER_PAGE);
  } catch (error) {
    throw new Error("Gagal mengambil total halaman peminjaman");
  }
};

export const fetchTotalPeminjamanCount = async (query: string) => {
  try {
    const count = await prisma.peminjaman.count({
      where: {
        isDeleted: false,
        OR: [
          {
            nama_peminjam: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            data_barang: {
              nama_barang: {
                contains: query,
                mode: "insensitive",
              },
            },
          },
        ],
      },
    });
    return count;
  } catch (error) {
    throw new Error("Gagal mengambil total data peminjaman");
  }
};

export const fetchPeminjamanById = async (id: number) => {
  try {
    const data = await prisma.peminjaman.findUnique({
      where: { id_peminjaman: id, isDeleted: false },
      include: { data_barang: true },
    });
    return data;
  } catch (error) {
    throw new Error("Gagal mengambil data peminjaman");
  }
};
