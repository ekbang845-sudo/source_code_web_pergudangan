"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

interface NotificationProps {
  state: {
    success?: boolean;
    message?: string;
    error?: any; 
  } | null;
  redirectUrl?: string; 
}

export default function SweetAlertNotification({ 
  state, 
  redirectUrl 
}: NotificationProps) {
  const router = useRouter();

  useEffect(() => {
    if (!state) return;

    if (state.success) {
      Swal.fire({
        title: "Berhasil!",
        text: state.message || "Aksi berhasil dilakukan.",
        icon: "success",
        confirmButtonColor: "#1E88E5", 
        confirmButtonText: "Oke, Lanjut",
        background: "#fff",
        color: "#333",
        iconColor: "#1E88E5",
      }).then((result) => {
        if (result.isConfirmed && redirectUrl) {
          router.push(redirectUrl);
        }
      });
    } 
    
    else if (state.message && !state.success && !state.error) {
      Swal.fire({
        title: "Gagal!",
        text: state.message,
        icon: "error",
        confirmButtonColor: "#d33",
        confirmButtonText: "Tutup",
      });
    }
  }, [state, redirectUrl, router]);

  return null;
}