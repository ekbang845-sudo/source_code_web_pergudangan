"use client";

import { DashboardTable } from "@/components/DashboardTable";

interface RecentDataProps {
  data: any[];
}

export default function RecentData({ data }: RecentDataProps) {
  const columns = [
    {
      header: "No",
      cell: (_: any, index: number) => index + 1,
      className: "text-center",
    },
    {
      header: "Nama Barang",
      accessorKey: "nama_barang" as const,
      className: "text-left text-sm",
    },
    {
      header: "Tanggal",
      accessorKey: "tanggal" as const,
     className: "text-center text-sm",
      cell: (item: any) =>
        item.tanggal
          ? new Date(item.tanggal).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "-",
    },
    {
      header: "Aktivitas", 
      accessorKey: "jenis" as const, 
      className: "text-center",
      cell: (item: any) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold ${
            item.jenis === "Masuk"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {item.jenis === "Masuk" ? "↓ Masuk" : "↑ Keluar"}
        </span>
      ),
    },
    {
      header: "Jumlah", 
      accessorKey: "jumlah" as const,
      className: "text-center",
      cell: (item: any) => (
        <span className="text-sm">
          {item.jumlah} {item.satuan}
        </span>
      ),
    },
    {
      header: "Keterangan", 
      accessorKey: "keterangan" as const, 
      cell: (item: any) => (
        <span className="text-gray-500 text-xs truncate max-w-37.5 block" title={item.keterangan}>
          {item.keterangan}
        </span>
      ),
    },
  ];

  return (
    <DashboardTable
      title="Recent data barang" 
      icon="/recent_logo.png"
      columns={columns}
      data={data}
      itemsPage={10}       
      hidePagination={true}
      lastUpdate={`Terakhir update: ${new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })}`}
      filterKey="jenis"
      filterOptions={["Masuk", "Keluar"]}
    />
  );
}