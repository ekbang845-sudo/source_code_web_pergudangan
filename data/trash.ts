"use server";
import { prisma } from "@/lib/prisma";


export const fetchAllTrashData = async () => {
  try {
    const [barang, pinjam, masuk, keluar] = await Promise.all([
      prisma.data_barang.findMany({ where: { isDeleted: true }, orderBy: { deletedAt: 'desc' } }),
      prisma.peminjaman.findMany({ where: { isDeleted: true }, include: { data_barang: true }, orderBy: { deletedAt: 'desc' } }),
      prisma.data_barang_masuk.findMany({ where: { isDeleted: true }, include: { data_barang: true }, orderBy: { deletedAt: 'desc' } }),
      prisma.data_barang_keluar.findMany({ where: { isDeleted: true }, include: { data_barang: true }, orderBy: { deletedAt: 'desc' } }),
    ]);
    return { barang, pinjam, masuk, keluar };
  } catch (error) {
    return { barang: [], pinjam: [], masuk: [], keluar: [] };
  }
};