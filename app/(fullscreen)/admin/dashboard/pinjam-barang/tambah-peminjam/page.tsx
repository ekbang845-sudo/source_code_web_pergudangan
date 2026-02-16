import React from "react";
import FormTambahPeminjaman from "@/components/FormTambahPeminjaman";
import { fetchAllBarang } from "@/data/barang";

export const dynamic = "force-dynamic";
export default async function TambahPeminjamanPage() {
  const barangList = await fetchAllBarang();
  
  return <FormTambahPeminjaman barangList={barangList} />;
}
