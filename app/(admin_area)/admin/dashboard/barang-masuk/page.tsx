import React from "react";
import {
  fetchDataBarangMasuk,
  fetchTotalBarangMasukPages,
  fetchTotalBarangMasukCount,
} from "@/data/barang-masuk";
import BarangMasukClient from "@/components/BarangMasukClient";

export const dynamic = "force-dynamic";
const BarangMasukPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; query?: string; sort?: string }>;
}) => {
  const params = await searchParams;
  const currentPage = Number(params?.page) || 1;
  const query = params?.query || "";
  const sort = params?.sort || "";

  const totalPages = await fetchTotalBarangMasukPages(query, "", "");
  const totalItems = await fetchTotalBarangMasukCount(query, "", "");
  const rawData = await fetchDataBarangMasuk(query, currentPage, "", "", sort);

  // Serialize data (convert Date objects to strings)
  const data = rawData.map((item) => ({
    ...item,
    tanggal_masuk: item.tanggal_masuk.toISOString(),
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    data_barang: {
      nama_barang: item.data_barang.nama_barang,
      satuan_barang: item.data_barang.satuan_barang,
    },
  }));

  return (
    <BarangMasukClient
      data={data}
      totalPages={totalPages}
      currentPage={currentPage}
      totalItems={totalItems}
    />
  );
};

export default BarangMasukPage;
