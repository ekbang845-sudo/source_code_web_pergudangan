import { fetchTotalBarang } from "@/data/barang"; 
import { fetchTotalPeminjamanCount } from "@/data/peminjaman"; 
import { fetchRecentHistory } from "@/data/history"; 
import Image from "next/image";
import Link from "next/link";
import RecentData from "./RecentData";
import LoadingLink from "@/components/LoadingLink";

export const dynamic = "force-dynamic";
export default async function DashboardPage() {
  // 1. Ambil Data (Hapus fetchDataPeminjaman karena kita mau pakai History)
  const [recentHistory, totalBarang, totalPeminjaman] = await Promise.all([
    fetchRecentHistory(),
    fetchTotalBarang(),
    fetchTotalPeminjamanCount(""),
  ]);

  // 2. Serialisasi Data untuk dikirim ke Client Component
  const data = recentHistory.map((item:any) => ({
    id: item.id,
    nama_barang: item.nama_barang,
    tanggal: item.tanggal_peminjaman.toISOString(), 
    jumlah: item.jumlah,
    satuan: item.satuan,
    jenis: item.status_peminjaman, 
    keterangan: item.nama_peminjam, 
  }));

  return (
    <div>
      {/* Header Dashboard */}
      <div className="bg-white p-4 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.05)] border border-blue-100 flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-600 rounded-lg text-white shadow-lg shadow-blue-200">
          <Image
            src="/Dashboard_blue_icon.png"
            width={20}
            height={20}
            alt="Dashboard Icon"
            className="brightness-0 invert"
          />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 text-xs">
            Ringkasan aktivitas gudang kelurahan
          </p>
        </div>
      </div>

      {/* Kartu Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Kartu Jumlah Barang */}
        <div className="bg-[#1E88E5] p-5 rounded-xl shadow-md text-white flex justify-between items-center">
          <div>
            <p className="text-lg font-semibold">Jumlah Barang:</p>
            <p className="text-2xl font-bold mt-1">{totalBarang}</p>
            <LoadingLink href="/admin/dashboard/data-barang">
              <button className="mt-3 bg-white text-blue-600 px-4 py-1.5 rounded-full text-xs font-semibold hover:bg-gray-200">
                detail
              </button>
            </LoadingLink>
          </div>
          <div className="w-16 h-16 opacity-90">
            <Image src="/barang.png" width={64} height={64} alt="icon barang" />
          </div>
        </div>

        {/* Kartu Jumlah Peminjaman */}
        <div className="bg-[#1E88E5] p-5 rounded-xl shadow-md text-white flex justify-between items-center">
          <div>
            <p className="text-lg font-semibold">Jumlah Peminjaman:</p>
            <p className="text-2xl font-bold mt-1">{totalPeminjaman}</p>
            <LoadingLink href="/admin/dashboard/pinjam-barang">
              <button className="mt-3 bg-white text-blue-600 px-4 py-1.5 rounded-full text-xs font-semibold hover:bg-gray-200">
                detail
              </button>
            </LoadingLink>
          </div>
          <div className="w-16 h-16 opacity-90">
            <Image src="/pinjam.png" width={64} height={64} alt="icon peminjaman" />
          </div>
        </div>
      </div>

      {/* Tabel Recent Data (Traffic) */}
      <div className="mt-5">
        <RecentData data={data} />
      </div>
    </div>
  );
}