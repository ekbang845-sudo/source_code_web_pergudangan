import React from "react";
import { fetchAllBarang } from "@/data/barang";
import FormBarangKeluarClient from "@/components/FormBarangKeluarClient";

export const dynamic = "force-dynamic";
export default async function AddBarangKeluarPage() {
  const items = await fetchAllBarang();

  return <FormBarangKeluarClient items={items} />;
}
