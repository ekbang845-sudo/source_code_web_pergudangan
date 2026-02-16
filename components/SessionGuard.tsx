"use client";

import { useEffect } from "react";

export default function SessionGuard() {
  useEffect(() => {
    // Fungsi untuk mengirim sinyal logout saat tab ditutup/refresh
    const handleUnload = () => {
      // Navigator.sendBeacon mengirim data secara asinkronus bahkan jika tab sudah tertutup
      navigator.sendBeacon("/api/auth/session-clear");
    };

    // Pasang event listener
    window.addEventListener("unload", handleUnload);

    // Bersihkan listener saat komponen di-unmount
    return () => {
      window.removeEventListener("unload", handleUnload);
    };
  }, []);

  return null; // Komponen ini tidak menampilkan apa-apa
}