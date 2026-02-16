"use client";

import { useState } from "react";
import { deletePeminjamanAction } from "@/lib/action";
import { FaTrash } from "react-icons/fa";
import Toast from "@/components/toast"; 
import DelayedOverlay from "@/components/DelayedOverlay";
import { startGlobalLoading, stopGlobalLoading } from "@/utils/loadingEvent";

export default function DeletePeminjamanButton({
  id,
  nama_peminjam,
  nama_barang,
}: {
  id: number;
  nama_peminjam: string;
  nama_barang: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const handleOpen = () => {
    startGlobalLoading();
    setTimeout(() => {
      stopGlobalLoading();
      setIsOpen(true);
    }, 500);
  };
  const handleClose = () => {
    startGlobalLoading();
    setTimeout(() => {
      stopGlobalLoading();
      setIsOpen(false);
    }, 500);
  };
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deletePeminjamanAction(id);
      if (result && result.success) {
        setToast({ message: "Data peminjaman berhasil dihapus!", type: "success" });
        setTimeout(() => {
          setIsOpen(false);
        }, 100);
      } else {
        setToast({ message: result?.message || "Gagal menghapus data!", type: "error" });
      }
    } catch (error) {
      console.error("Error:", error);
      setToast({ message: "Terjadi kesalahan sistem.", type: "error" });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <button
        onClick={handleOpen}
        className="bg-red-100 p-2 rounded text-red-600 hover:bg-red-200 transition-colors"
        title="Hapus Peminjaman"
      >
        <FaTrash size={16} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center">
              {isDeleting && <DelayedOverlay />}
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTrash className="text-red-600 text-2xl" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Hapus Peminjaman?
              </h3>
              <p className="text-gray-500 text-sm mb-6 wrap-break-words whitespace-normal">
                Apakah Anda yakin ingin menghapus data peminjaman{" "}
                <strong>{nama_peminjam}</strong> ({nama_barang})? Tindakan ini
                tidak dapat dibatalkan.
              </p>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
                  disabled={isDeleting}
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm flex items-center gap-2"
                  disabled={isDeleting}
                >
                  {isDeleting ? "Menghapus..." : "Ya, Hapus"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}