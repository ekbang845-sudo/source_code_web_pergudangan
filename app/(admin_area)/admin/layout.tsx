import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DashboardLayoutClient from "@/components/DashboardLayoutClient";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // IZINKAN role 'user' juga untuk mengakses layout ini
  if (session.user.role !== "admin" && session.user.role !== "user") {
    redirect("/403");
  }

  return (
    <DashboardLayoutClient user={session?.user}>
      {children}
    </DashboardLayoutClient>
  );
}
