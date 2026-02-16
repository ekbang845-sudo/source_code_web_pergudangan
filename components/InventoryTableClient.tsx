"use client";

import React, { useMemo } from "react";
import { Table, Column } from "@/components/Table";
import EditItemButton from "@/components/EditItemButton";
import DeleteItemButton from "@/components/DeleteItemButton";
import { useRouter, useSearchParams } from "next/navigation";
import { FaBox, FaPlus } from "react-icons/fa";
import PageHeader from "@/components/PageHeader";
import { startGlobalLoading } from "@/utils/loadingEvent";

// Definisikan interface secara lokal atau import jika tersedia
interface Data_barang {
  id_barang: number;
  nama_barang: string;
  stok_barang: number;
  satuan_barang: string;
  is_stock_bulanan: boolean;
  createdAt: string; 
  updatedAt: string; 
}

interface InventoryTableClientProps {
  data: Data_barang[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
}

export default function InventoryTableClient({
  data,
  totalPages,
  currentPage,
  totalItems,
}: InventoryTableClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("query")?.toLowerCase() || "";
  const filteredData = useMemo(() => {
    return data.filter((item) => 
      item.nama_barang.toLowerCase().includes(query)
    );
  }, [data, query]);
  
  const columns = useMemo<Column<Data_barang>[]>(
    () => [
      {
        header: "No",
        cell: (_: Data_barang, index: number) =>
          (currentPage - 1) * 7 + index + 1,
        className: "text-center",
      },
      {
        header: "Nama Barang",
        accessorKey: "nama_barang",
      },
      {
        header: "Stok",
        accessorKey: "stok_barang",
        className: "text-center",
      },
      {
        header: "Satuan",
        accessorKey: "satuan_barang",
        className: "text-center",
      },
      {
        header: "Jenis Stok",
        accessorKey: "is_stock_bulanan",
        className: "text-center",
        cell: (item: Data_barang) => (
          <span
            className={`px-2 py-1 rounded-full text-xm font-medium ${
              item.is_stock_bulanan
                ? "bg-purple-100 text-purple-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {item.is_stock_bulanan ? "Unreguler" : "Reguler"}
          </span>
        ),
      },
      {
        header: "Aksi",
        cell: (item: Data_barang) => (
          <div className="flex justify-center gap-2">
            <EditItemButton
              item={{
                id_barang: item.id_barang,
                nama_barang: item.nama_barang,
                stok_barang: item.stok_barang,
                satuan_barang: item.satuan_barang,
                is_stock_bulanan: item.is_stock_bulanan,
              }}
            />
            <DeleteItemButton
              id={item.id_barang}
              nama_barang={item.nama_barang}
            />
          </div>
        ),
      },
    ],
    [currentPage]
  );

  const sortOptions = useMemo(
    () => [
      { label: "Stok Terbanyak", value: "stok-desc" },
      { label: "Stok Sedikit", value: "stok-asc" },
      { label: "Nama A-Z", value: "nama-asc" },
      { label: "Nama Z-A", value: "nama-desc" },
      { label: "Stok Unreguler", value: "Unreguler" },
      { label: "Stok Reguler", value: "reguler" },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Barang"
        description="Manajemen data master barang dan stok inventaris"
        icon={<FaBox size={24} />}
        actionButton={
          <button
            onClick={() => {
              startGlobalLoading();
              router.push("/admin/dashboard/data-barang/tambah-barang");
            }}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 font-medium"
          >
            <FaPlus size={14} />
            <span>Tambah Barang</span>
          </button>
        }
      />

      <Table
        columns={columns}
        data={filteredData} 
        title="Daftar Barang"
        sortOptions={sortOptions}
        itemsPage={7}
        entryLabel="barang"
        totalPages={totalPages}
        totalItems={filteredData.length} 
        searchPlaceholder="Cari nama barang..."
      />
    </div>
  );
}
