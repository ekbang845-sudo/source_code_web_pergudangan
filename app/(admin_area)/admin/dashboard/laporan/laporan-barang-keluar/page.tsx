import React from "react";
import {
  fetchDataBarangKeluar,
  fetchTotalBarangKeluarCount,
  fetchTotalBarangKeluarPages,
} from "@/data/barangKeluar";
import PageHeader from "@/components/PageHeader";
import OutgoingGoodsFilter from "@/components/OutgoingGoodsFilter";
import OutgoingGoodsTableClient from "@/components/OutgoingGoodsTableClient";
import { FaBoxOpen } from "react-icons/fa";
import Image from "next/image";

export const dynamic = "force-dynamic";
const LaporanBarangKeluarPage = async (props: {
  searchParams: Promise<{
    query?: string;
    page?: string;
    startDate?: string;
    endDate?: string;
    sort?: string;
  }>;
}) => {
  const searchParams = await props.searchParams;
  const query = searchParams.query || "";
  const currentPage = Number(searchParams.page) || 1;
  const startDate = searchParams.startDate || "";
  const endDate = searchParams.endDate || "";
  const sort = searchParams.sort || "";
  const isFilterApplied = startDate !== "" && endDate !== "";

  let data: any[] = [];
  let totalPages = 0;
  let totalItems = 0;

  if (isFilterApplied) {

    data = await fetchDataBarangKeluar(query, currentPage, startDate, endDate, sort);
    totalPages = await fetchTotalBarangKeluarPages(query, startDate, endDate);
    totalItems = await fetchTotalBarangKeluarCount(query, startDate, endDate);
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Laporan Barang Keluar"
        description="Laporan riwayat barang keluar gudang"
        icon={
          <Image
            src="/barang_keluar_white_icon.png"
            width={24}
            height={24}
            alt="Barang Keluar Icon"
          />
        }
      />

      {/* Filter Section */}
      <OutgoingGoodsFilter />

      {/* Table Section */}
      <div className="mt-8">
        <OutgoingGoodsTableClient
          data={data}
          totalPages={totalPages}
          totalItems={totalItems}
          currentPage={currentPage}
        />
        {!isFilterApplied && (
          <div className="text-center py-10 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 text-gray-500">
            Silakan pilih rentang tanggal dan klik "Tampilkan" untuk melihat data.
          </div>
        )}
      </div>
    </div>
  );
};

export default LaporanBarangKeluarPage;
