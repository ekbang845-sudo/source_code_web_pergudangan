import React from "react";

import {
  fetchDataBarang,
  fetchDataBarangPages,
  fetchTotalBarang,
} from "@/data/barang";
import InventoryTableClient from "@/components/InventoryTableClient";

export const dynamic = "force-dynamic";
const DataBarangPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; query?: string; sort?: string }>;
}) => {
  const params = await searchParams;
  const currentPage = Number(params?.page) || 1;
  const query = params?.query || "";
  const sort = params?.sort || "";

  const totalPages = await fetchDataBarangPages(query);
  const totalItems = await fetchTotalBarang(query);
  const rawData = await fetchDataBarang(query, currentPage, sort);

  // Serialize data (convert Date objects to strings) to pass to Client Component
  const dataBarang = rawData.map((item) => ({
    ...item,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }));

  return (
    <InventoryTableClient
      data={dataBarang}
      totalPages={totalPages}
      currentPage={currentPage}
      totalItems={totalItems}
    />
  );
};

export default DataBarangPage;
