"use client";

import { FaTrash } from "react-icons/fa";
import DelayedOverlay from "@/components/DelayedOverlay";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  title: string;
  itemName?: string;
  message: string;
}

export default function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  title,
  itemName,
  message,
}: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm animate-in fade-in zoom-in duration-200 relative">
        {isLoading && <DelayedOverlay />}

        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaTrash className="text-red-600 text-2xl" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-500 text-sm mb-6 wrap-break-word whitespace-normal">
            {message}
            {itemName && (
              <>
                <br />
                <span className="font-semibold text-gray-800">
                  "{itemName}"
                </span>
              </>
            )}
          </p>

          <div className="flex gap-3 justify-center">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
              disabled={isLoading}
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm flex items-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? "Menghapus..." : "Ya, Hapus"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}