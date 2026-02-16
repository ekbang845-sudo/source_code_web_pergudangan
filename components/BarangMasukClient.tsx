"use client";

import React, { useState, useMemo } from "react";

import { Table, Column } from "@/components/Table";
import { FaPlus, FaBox, FaClipboardList } from "react-icons/fa";
import { useRouter, useSearchParams } from "next/navigation";

import EditBarangMasukButton from "@/components/EditBarangMasukButton";
import DeleteBarangMasukButton from "@/components/DeleteBarangMasukButton";
import PageHeader from "@/components/PageHeader";
import { startGlobalLoading } from "@/utils/loadingEvent";
interface Data_barang_masuk_with_relation {
  id_barang_masuk: number;
  id_barang: number;
  id_peminjaman: number | null;
  jumlah_barang: number;
  tanggal_masuk: string;
  sumber_barang: string;
  data_barang: {
    nama_barang: string;
    satuan_barang: string;
  };
}

interface BarangMasukClientProps {
  data: Data_barang_masuk_with_relation[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
}

export default function BarangMasukClient({
  data,
  totalPages,
  currentPage,
  totalItems,
}: BarangMasukClientProps) {
  const [isInputPopupOpen, setIsInputPopupOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("query")?.toLowerCase() || "";
  const filteredData = useMemo(() => {
    return data.filter((item) => 
      item.data_barang.nama_barang.toLowerCase().includes(query) || 
      item.sumber_barang.toLowerCase().includes(query)
    );
  }, [data, query]);

  const columns: Column<Data_barang_masuk_with_relation>[] = [
    {
      header: "No",
      cell: (_: Data_barang_masuk_with_relation, index: number) =>
        (currentPage - 1) * 7 + index + 1,
      className: "text-center",
    },
    {
      header: "Nama Barang",
      accessorKey: "data_barang",
      cell: (item) => item.data_barang.nama_barang,
    },
    {
      header: "Tanggal Masuk",
      accessorKey: "tanggal_masuk",
      className: "text-center",
      cell: (item) =>
        new Date(item.tanggal_masuk).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
    },
    {
      header: "Sumber",
      accessorKey: "sumber_barang",
    },
    {
      header: "Jumlah",
      accessorKey: "jumlah_barang",
      className: "text-center",
      cell: (item) => `${item.jumlah_barang} ${item.data_barang.satuan_barang}`,
    },
    {
      header: "Aksi",
      cell: (item) => (
        <div className="flex gap-2 justify-center">
          <EditBarangMasukButton
            id={item.id_barang_masuk}
            id_peminjaman={item.id_peminjaman}
            nama_barang={item.data_barang.nama_barang}
            jumlah_awal={item.jumlah_barang}
            sumber_awal={item.sumber_barang}
            satuan={item.data_barang.satuan_barang}
          />
          <DeleteBarangMasukButton
            id={item.id_barang_masuk}
            nama_barang={item.data_barang.nama_barang}
            jumlah={item.jumlah_barang}
          />
        </div>
      ),
    },
  ];

  const sortOptions = [
    { label: "Tanggal Terbaru", value: "tanggal-desc" },
    { label: "Tanggal Terlama", value: "tanggal-asc" },
    { label: "Nama A-Z", value: "nama-asc" },
    { label: "Nama Z-A", value: "nama-desc" },
    { label: "Jumlah Terbanyak", value: "jumlah-desc" },
    { label: "Jumlah Sedikit", value: "jumlah-asc" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Barang Masuk"
        description="Monitoring riwayat barang masuk dan penambahan stok"
        icon={<FaClipboardList size={24} />}
        actionButton={
          <div className="relative">
            <button
              onClick={() => setIsInputPopupOpen(!isInputPopupOpen)}
              className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg font-medium"
            >
              <FaPlus size={14} />
              <span>Input Data</span>
            </button>

            {/* Popup Menu */}
            {isInputPopupOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setIsInputPopupOpen(false)}
                ></div>
                <div className="absolute top-12 right-0 bg-white shadow-xl rounded-lg w-56 py-2 z-30 border border-gray-100 animate-in fade-in zoom-in duration-200">
                  {/* Arrow */}
                  <div className="absolute -top-2 right-6 w-4 h-4 bg-white border-t border-l border-gray-100 transform rotate-45"></div>

                  <button
                    onClick={() => {
                      startGlobalLoading();
                      router.push("/admin/dashboard/data-barang/tambah-barang");
                      setIsInputPopupOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left transition-colors border-b border-gray-50 group"
                  >
                    <div className="bg-blue-50 p-2 rounded-lg text-blue-600 group-hover:bg-blue-100 transition-colors">
                      <FaBox size={16} />
                    </div>
                    <div>
                      <span className="block text-gray-800 text-sm font-semibold">
                        Tambah Barang
                      </span>
                      <span className="block text-gray-500 text-xs">
                        Buat data barang baru
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      startGlobalLoading(); // Picu loading saat berpindah ke form tambah stok
                      router.push("/admin/dashboard/barang-masuk/tambah-stok");
                      setIsInputPopupOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left transition-colors group"
                  >
                    <div className="bg-green-50 p-2 rounded-lg text-green-600 group-hover:bg-green-100 transition-colors">
                      <FaClipboardList size={16} />
                    </div>
                    <div>
                      <span className="block text-gray-800 text-sm font-semibold">
                        Tambah Stok
                      </span>
                      <span className="block text-gray-500 text-xs">
                        Update stok barang ada
                      </span>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>
        }
      />

      <Table
        columns={columns}
        data={filteredData}
        title="Daftar Barang Masuk"
        sortOptions={sortOptions}
        itemsPage={7}
        entryLabel="barang masuk"
        totalPages={totalPages}
        totalItems={filteredData.length}
        searchPlaceholder="Cari nama barang/sumbernya..."
      />
    </div>
  );
}
