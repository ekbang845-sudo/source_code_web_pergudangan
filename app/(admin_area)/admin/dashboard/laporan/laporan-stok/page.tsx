import React from "react";
import { FaFileAlt } from "react-icons/fa";
import {
  fetchDataBarang,
  fetchTotalBarang,
  fetchDataBarangPages,
} from "@/data/barang";
import StockFilter from "@/components/StockFilter";
import StockTableClient from "@/components/StockTableClient";
import PageHeader from "@/components/PageHeader";

export const dynamic = "force-dynamic";
const LaporanStokPage = async ({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    query?: string;
    sort?: string;
    filter?: string;
  }>;
}) => {
  const params = await searchParams;
  const currentPage = Number(params?.page) || 1;
  const query = params?.query || "";
  const sort = params?.sort || "";
  const filter = params?.filter || "";

  const isFilterApplied = filter !== "";

  let data: any[] = [];
  let totalPages = 0;
  let totalItems = 0;

  if (isFilterApplied) {
    totalPages = await fetchDataBarangPages(query, filter);
    totalItems = await fetchTotalBarang(query, filter);
    const rawData = await fetchDataBarang(query, currentPage, sort, filter);
    data = rawData.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laporan Stok"
        description="Laporan stok barang gudang kelurahan"
        icon={<FaFileAlt size={24} />}
      />

      <StockFilter />
      

      <div className="mt-8">
        <StockTableClient
          data={data}
          totalPages={totalPages}
          totalItems={totalItems}
          currentPage={currentPage}
        />
        {!isFilterApplied && (
          <div className="text-center py-10 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 text-gray-500">
            Silakan pilih kategori stok dan klik "Tampilkan" untuk melihat data.
          </div>
        )}
      </div>
    </div>
  );
};

export default LaporanStokPage;
