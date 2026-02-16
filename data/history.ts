import { prisma } from "@/lib/prisma";

export async function fetchRecentHistory() {
  // 1. Ambil 10 Barang Masuk Terakhir (Bukan 5, agar saat di-merge tidak ada data recent yang hilang)
  const barangMasuk = await prisma.data_barang_masuk.findMany({
    where: { isDeleted: false },
    take: 10, 
    orderBy: {
      tanggal_masuk: "desc",
    },
    include: {
      data_barang: true,
    },
  });

  // 2. Ambil 10 Barang Keluar Terakhir
  const barangKeluar = await prisma.data_barang_keluar.findMany({
    where: { isDeleted: false },
    take: 10,
    orderBy: {
      tanggal_keluar: "desc",
    },
    include: {
      data_barang: true,
    },
  });

  // 3. Format Data Masuk agar strukturnya seragam
  // Kita mapping 'sumber_barang' ke field 'nama_peminjam' agar bisa ditampilkan di kolom Keterangan Dashboard
  const formattedMasuk = barangMasuk.map((item) => ({
    id: `in-${item.id_barang_masuk}`,
    nama_barang: item.data_barang.nama_barang,
    tanggal_peminjaman: item.tanggal_masuk, 
    jumlah: item.jumlah_barang,
    satuan: item.data_barang.satuan_barang,
    status_peminjaman: "Masuk", 
    nama_peminjam: item.sumber_barang, 
  }));

  // 4. Format Data Keluar
  // Kita mapping 'keterangan' ke field 'nama_peminjam'
  const formattedKeluar = barangKeluar.map((item) => ({
    id: `out-${item.id_barang_keluar}`,
    nama_barang: item.data_barang.nama_barang,
    tanggal_peminjaman: item.tanggal_keluar,
    jumlah: item.jumlah_keluar,
    satuan: item.data_barang.satuan_barang,
    status_peminjaman: "Keluar", 
    nama_peminjam: item.keterangan, 
  }));

  // 5. Gabungkan kedua array
  const combinedData = [...formattedMasuk, ...formattedKeluar];

  // 6. Urutkan berdasarkan tanggal terbaru (descending)
  // Menggunakan new Date() untuk memastikan aman jika formatnya string/date
  combinedData.sort((a, b) => {
    const dateA = new Date(a.tanggal_peminjaman).getTime();
    const dateB = new Date(b.tanggal_peminjaman).getTime();
    return dateB - dateA;
  });

  // 7. Potong array agar hanya mengembalikan 10 data teratas
  return combinedData.slice(0, 10);
}