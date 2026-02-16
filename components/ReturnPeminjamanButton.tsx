"use client";

import React, { useState } from "react";
import { FaUndo, FaCheck, FaTimes } from "react-icons/fa";
import { returnPeminjamanAction } from "@/lib/action";

interface ReturnPeminjamanButtonProps {
  id: number;
  nama_peminjam: string;
  nama_barang: string;
}

export default function ReturnPeminjamanButton({
  id,
  nama_peminjam,
  nama_barang,
}: ReturnPeminjamanButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleReturn = async () => {
    setIsLoading(true);
    try {
      const result = await returnPeminjamanAction(id);
      if (result.success) {
        setIsOpen(false);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Error returning item:", error);
      alert("Terjadi kesalahan saat mengembalikan barang.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-100 p-2 rounded text-blue-600 hover:bg-blue-200 transition-colors"
        title="Kembalikan Barang"
      >
        <FaUndo />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
            {/* Header */}
            <div className="bg-blue-600 p-4 flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full text-white">
                <FaUndo size={20} />
              </div>
              <h3 className="text-lg font-bold text-white">
                Konfirmasi Pengembalian
              </h3>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Apakah Anda yakin barang ini sudah dikembalikan?
              </p>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-4">
                <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                  <span className="text-gray-500">Peminjam:</span>
                  <span className="font-semibold text-gray-800">
                    {nama_peminjam}
                  </span>
                  <span className="text-gray-500">Barang:</span>
                  <span className="font-semibold text-gray-800">
                    {nama_barang}
                  </span>
                </div>
              </div>
              <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-100">
                <span className="font-bold">Info:</span> Stok barang akan
                otomatis bertambah sesuai jumlah yang dipinjam.
              </p>
            </div>

            {/* Footer Actions */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
              <button
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg text-gray-600 font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <FaTimes /> Batal
              </button>
              <button
                onClick={handleReturn}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  <FaCheck />
                )}
                {isLoading ? "Memproses..." : "Ya, Kembalikan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
