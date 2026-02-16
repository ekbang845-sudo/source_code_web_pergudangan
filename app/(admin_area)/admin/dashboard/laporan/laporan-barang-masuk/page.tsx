import React from "react";
import {
  fetchDataBarangMasuk,
  fetchTotalBarangMasukCount,
  fetchTotalBarangMasukPages,
} from "@/data/barang-masuk";
import PageHeader from "@/components/PageHeader";
import IncomingGoodsFilter from "@/components/IncomingGoodsFilter";
import IncomingGoodsTableClient from "@/components/IncomingGoodsTableClient";
import { FaBoxOpen } from "react-icons/fa";

export const dynamic = "force-dynamic";
const LaporanBarangMasukPage = async (props: {
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
  
    data = await fetchDataBarangMasuk(query, currentPage, startDate, endDate, sort);
    totalPages = await fetchTotalBarangMasukPages(query, startDate, endDate);
    totalItems = await fetchTotalBarangMasukCount(query, startDate, endDate);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laporan Barang Masuk"
        description="Laporan riwayat barang masuk gudang"
        icon={<FaBoxOpen size={24} />}
      />

      <IncomingGoodsFilter />

      <div className="mt-8">
        <IncomingGoodsTableClient
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

export default LaporanBarangMasukPage;
