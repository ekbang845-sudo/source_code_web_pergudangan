import React from "react";
import { fetchAllBarang } from "@/data/barang";
import FormTambahStok from "@/components/FormTambahStok";

export const dynamic = "force-dynamic";
const TambahStokPage = async () => {
  const items = await fetchAllBarang();

  return <FormTambahStok items={items} />;
};


export default TambahStokPage;
