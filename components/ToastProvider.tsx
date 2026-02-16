"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
// PENTING: Import tampilan Toast lama Anda, beri alias ToastUI agar tidak bingung
import ToastUI from "@/components/toast"; 

type ToastType = "success" | "error";

interface ToastContextType {
  showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toastData, setToastData] = useState<{
    message: string;
    type: ToastType;
    key: number; // Key unik untuk mereset timer animasi
  } | null>(null);

  const showToast = (message: string, type: ToastType) => {
    setToastData({ message, type, key: Date.now() });
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Render UI Toast di sini, di level paling atas aplikasi */}
      {toastData && (
        <ToastUI
          key={toastData.key}
          message={toastData.message}
          type={toastData.type}
          onClose={() => setToastData(null)}
        />
      )}
    </ToastContext.Provider>
  );
}

// Hook kustom untuk memanggil toast dari mana saja
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}