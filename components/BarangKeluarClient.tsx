"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { FaPlus } from "react-icons/fa";
import { Table, Column } from "@/components/Table";
import EditBarangKeluarButton from "./EditBarangKeluarButton";
import DeleteBarangKeluarButton from "./DeleteBarangKeluarButton";
import PageHeader from "@/components/PageHeader";
import { startGlobalLoading } from "@/utils/loadingEvent";

interface BarangKeluarWithRelation {
  id_barang_keluar: number;
  id_barang: number;
  tanggal_keluar: string;
  jumlah_keluar: number;
  keterangan: string;
  data_barang: {
    nama_barang: string;
    satuan_barang: string;
  };
}

interface BarangKeluarClientProps {
  data: BarangKeluarWithRelation[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
  items: {
    id_barang: number;
    nama_barang: string;
    satuan_barang: string;
    stok_barang: number;
  }[];
}

const BarangKeluarClient = ({
  data,
  totalPages,
  currentPage,
  totalItems,
  items,
}: BarangKeluarClientProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("query")?.toLowerCase() || "";
  const filteredData = useMemo(() => {
    return data.filter((item) => 
      item.data_barang.nama_barang.toLowerCase().includes(query) || 
      item.keterangan.toLowerCase().includes(query)
    );
  }, [data, query]);

  const columns: Column<BarangKeluarWithRelation>[] = [
    {
      header: "No",
      cell: (_: BarangKeluarWithRelation, index: number) =>
        (currentPage - 1) * 7 + index + 1,
      className: "text-center",
    },
    {
      header: "Nama Barang",
      accessorKey: "data_barang",
      // KEMBALI KE ORIGINAL: Tidak ada styling bold/aneh-aneh
      cell: (item) => item.data_barang.nama_barang,
    },
    {
      header: "Tanggal Keluar",
      accessorKey: "tanggal_keluar",
      className: "text-center",
      cell: (item) =>
        new Date(item.tanggal_keluar).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
    },
    {
      header: "Keterangan",
      accessorKey: "keterangan",
      cell: (item) => {
        const text = item.keterangan;
        
        if (text.includes("Diberikan kepada:")) {
            const parts = text.split("Diberikan kepada:");
            return (
                <span>
                    Diberikan kepada: {parts[1]?.trim() || "-"}
                </span>
            );
        }
        if (text.includes("Dipakai untuk:")) {
          const parts = text.split("Dipakai untuk:");
          return (
              <span>
                  dipakai untuk: {parts[1]?.trim() || "-"}
              </span>
          );
        }
        if (text.includes("Lainnya:")) {
             const parts = text.split("Lainnya:");
             return (
                <span>
                    {parts[1]?.trim() || "-"}
                </span>
             );
        }

        // Tampilan default untuk data lama
        return text;
      }
    },
    {
      header: "Jumlah",
      accessorKey: "jumlah_keluar",
      className: "text-center",
      cell: (item) => `${item.jumlah_keluar} ${item.data_barang.satuan_barang}`,
    },
    {
      header: "Aksi",
      cell: (item) => (
        <div className="flex gap-2 justify-center">
          <EditBarangKeluarButton item={item} items={items} />
          <DeleteBarangKeluarButton
            id={item.id_barang_keluar}
            nama_barang={item.data_barang.nama_barang}
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
        title="Barang Keluar"
        description="Kelola data barang keluar gudang kelurahan"
        icon={
          <Image
            src="/barang_keluar_white_icon.png"
            width={24}
            height={24}
            alt="Barang Keluar Icon"
          />
        }
        actionButton={
          <div className="relative">
            <button
              onClick={() => {
                startGlobalLoading();
                router.push("/admin/dashboard/barang-keluar/add");
              }}
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 font-medium"
            >
              <FaPlus />
              <span>Input Data</span>
            </button>
          </div>
        }
      />

      <Table
        columns={columns}
        data={filteredData}
        title="Data Barang Keluar"
        sortOptions={sortOptions}
        itemsPage={7}
        entryLabel="barang keluar"
        totalPages={totalPages}
        totalItems={filteredData.length}
        searchPlaceholder="Cari nama barang/keterangan..."
      />
    </div>
  );
};

export default BarangKeluarClient;