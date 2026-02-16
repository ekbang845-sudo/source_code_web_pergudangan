"use client";

import React, { useMemo } from "react";
import { Table, Column } from "@/components/Table";

interface OutgoingGoodsTableClientProps {
  data: any[];
  totalPages: number;
  totalItems: number;
  currentPage: number;
}

const OutgoingGoodsTableClient = ({
  data,
  totalPages,
  totalItems,
  currentPage,
}: OutgoingGoodsTableClientProps) => {
  const columns = useMemo<Column<any>[]>(
    () => [
      {
        header: "No",
        cell: (_, index) => (currentPage - 1) * 10 + index + 1,
      },
      {
        header: "Tanggal",
        accessorKey: "tanggal_keluar",
        cell: (item) =>
          new Date(item.tanggal_keluar).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
      },
      {
        header: "Nama Barang",
        accessorKey: "data_barang.nama_barang",
        cell: (item) => item.data_barang?.nama_barang || "-",
      },
      {
        header: "Jumlah Keluar",
        accessorKey: "jumlah_keluar",
        cell: (item) => (
          <span>
            {item.jumlah_keluar} {item.data_barang.satuan_barang}
          </span>
        ),
      },
      {
        header: "Keterangan",
        accessorKey: "keterangan",
      },
    ],
    [currentPage]
  );

  const sortOptions = useMemo(
    () => [
      { label: "Tanggal (Terbaru)", value: "tanggal-desc" },
      { label: "Tanggal (Terlama)", value: "tanggal-asc" },
      { label: "Nama (A-Z)", value: "nama-asc" },
      { label: "Jumlah (Terbanyak)", value: "jumlah-desc" },
    ],
    []
  );

  return (
    <Table
      columns={columns}
      data={data}
      title="Laporan Data Barang Keluar"
      sortOptions={sortOptions}
      itemsPage={10}
      entryLabel="data"
      totalPages={totalPages}
      totalItems={totalItems}
    />
  );
};

export default OutgoingGoodsTableClient;
