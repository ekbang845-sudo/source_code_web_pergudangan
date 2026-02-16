"use client";

import React, { useMemo } from "react";
import { Table, Column } from "@/components/Table";

interface StokItem {
  id_barang: number;
  nama_barang: string;
  stok_barang: number;
  satuan_barang: string;
  is_stock_bulanan: boolean;
  createdAt: string;
  updatedAt: string;
}

interface StockTableClientProps {
  data: StokItem[];
  totalPages: number;
  totalItems: number;
  currentPage: number;
}

const StockTableClient = ({
  data,
  totalPages,
  totalItems,
  currentPage,
}: StockTableClientProps) => {
  const columns = useMemo<Column<StokItem>[]>(
    () => [
      {
        header: "No",
        cell: (_, index) => (currentPage - 1) * 7 + index + 1,
        className: "hidden md:table-cell w-16 text-center", // Sembunyikan di mobile
      },
      {
        header: "Nama Barang",
        accessorKey: "nama_barang",
        className: "min-w-[150px]", // Pastikan lebar minimum
      },
      {
        header: "Stok",
        accessorKey: "stok_barang",
        className: "text-center",
      },
      {
        header: "Satuan",
        accessorKey: "satuan_barang",
        className: "hidden md:table-cell", // Sembunyikan di mobile
      },
      {
        header: "Jenis Stok",
        accessorKey: "is_stock_bulanan",
        className: "text-center",
        cell: (item: StokItem) => (
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
              item.is_stock_bulanan
                ? "bg-purple-100 text-purple-700 border border-purple-200"
                : "bg-green-100 text-green-700 border border-green-200"
            }`}
          >
            {item.is_stock_bulanan ? "Bulanan" : "Reguler"}
          </span>
        ),
      },
    ],
    [currentPage]
  );

  const sortOptions = useMemo(
    () => [
      { label: "Nama (A-Z)", value: "nama_barang-asc" },
      { label: "Nama (Z-A)", value: "nama_barang-desc" },
      { label: "Stok (Terbanyak)", value: "stok-desc" },
      { label: "Stok (Sedikit)", value: "stok-asc" },
    ],
    []
  );

  return (
    <Table
      columns={columns}
      data={data}
      title="Laporan Data"
      sortOptions={sortOptions}
      itemsPage={7}
      entryLabel="data"
      totalPages={totalPages}
      totalItems={totalItems}
    />
  );
};

export default StockTableClient;
