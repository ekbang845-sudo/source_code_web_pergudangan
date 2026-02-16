import { fetchAllBarang } from "@/data/barang";
import { fetchPeminjamanById } from "@/data/peminjaman";
import FormTambahPeminjaman from "@/components/FormTambahPeminjaman";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export default async function EditPeminjamanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const peminjamanId = parseInt(id);

  if (isNaN(peminjamanId)) {
    notFound();
  }

  const [peminjaman, barangList] = await Promise.all([
    fetchPeminjamanById(peminjamanId),
    fetchAllBarang(),
  ]);

  if (!peminjaman) {
    notFound();
  }

  const initialData = {
    id_peminjaman: peminjaman.id_peminjaman,
    nomor_ktp: peminjaman.nomor_ktp,
    kategori_peminjam: peminjaman.kategori_peminjam,
    nama_peminjam: peminjaman.nama_peminjam,
    no_telepon: peminjaman.no_telepon,
    alamat: peminjaman.alamat,
    id_barang: peminjaman.id_barang,
    jumlah_peminjaman: peminjaman.jumlah_peminjaman,
    tanggal_peminjaman: peminjaman.tanggal_peminjaman
      ? peminjaman.tanggal_peminjaman.toISOString()
      : "",
  };

  return (
    <FormTambahPeminjaman
      barangList={barangList}
      initialData={initialData}
      isEdit={true}
    />
  );
}

