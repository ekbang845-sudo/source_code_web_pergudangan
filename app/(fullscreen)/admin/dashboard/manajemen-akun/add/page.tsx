import React from "react";
import FormTambahAkun from "@/components/FormTambahAkun";

import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export default async function TambahAkunPage() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    redirect("/admin/dashboard");
  }

  return <FormTambahAkun />;
}
