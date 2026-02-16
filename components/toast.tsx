"use client";

import React, { useEffect, useState, useRef } from "react";
import { FaCheckCircle, FaExclamationCircle, FaTimes } from "react-icons/fa";

interface ToastProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    // Efek muncul (fade in)
    requestAnimationFrame(() => setIsVisible(true));

    // Auto close setelah 3 detik (opsional, bisa dihapus jika ingin manual close saja)
    const timer = setTimeout(() => {
      handleClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    // Tunggu animasi fade out selesai baru unmount
    setTimeout(onClose, 300);
  };

  // Logic Swipe (Geser)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartX.current) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - touchStartX.current;

    // Jika geser lebih dari 50px ke kanan/kiri, tutup
    if (Math.abs(diff) > 50) {
      handleClose();
      touchStartX.current = null;
    }
  };

  return (
    <div
      className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-100 transition-all duration-300 ease-in-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
      }`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
    >
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-full shadow-xl border cursor-pointer select-none min-w-75 max-w-[90vw] justify-between
        ${
          type === "success"
            ? "bg-white border-blue-100 text-blue-700 shadow-blue-100" 
            : "bg-white border-red-100 text-red-700 shadow-red-100"     
        }`}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div
            className={`shrink-0 p-1 rounded-full ${
              type === "success" ? "bg-blue-100" : "bg-red-100"
            }`}
          >
            {type === "success" ? (
              <FaCheckCircle size={16} />
            ) : (
              <FaExclamationCircle size={16} />
            )}
          </div>
          <p className="text-sm font-medium truncate">{message}</p>
        </div>

        <button
          onClick={handleClose}
          className={`p-1 rounded-full hover:bg-gray-100 transition-colors ${
            type === "success" ? "text-blue-400" : "text-red-400"
          }`}
        >
          <FaTimes size={12} />
        </button>
      </div>
    </div>
  );
}