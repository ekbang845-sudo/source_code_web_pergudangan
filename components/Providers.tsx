"use client"; // Wajib ditandai sebagai Client Component

import { SessionProvider } from "next-auth/react";
//import SessionGuard from "@/components/SessionGuard"; // Pastikan file ini sudah kamu buat dari langkah sebelumnya

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}