"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react";
import { createItemAction } from "@/lib/action";
import { useFormStatus } from "react-dom";

const SubmitButton = () => {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 font-semibold"
    >
      {pending ? "Menyimpan..." : "Simpan Barang"}
    </button>
  );
};

export default function CreateItemButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction] = useActionState(createItemAction, null);

  useEffect(() => {
    if (state?.success) {
      setIsOpen(false);
    }
  }, [state?.success]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-black hover:bg-gray-800 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors cursor-pointer flex items-center gap-2"
      >
        <span>+</span> Tambah Barang
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800">
                Tambah Barang Baru
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              {state?.message && !state.success && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm border border-red-100">
                  {state.message}
                </div>
              )}

              <form action={formAction} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Barang
                  </label>
                  <input
                    type="text"
                    name="nama_barang"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Contoh: Laptop ASUS"
                  />
                  {state?.error?.nama_barang && (
                    <p className="text-red-500 text-xs mt-1">
                      {state.error.nama_barang}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stok Awal
                    </label>
                    <input
                      type="number"
                      name="stok_barang"
                      min="0"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="0"
                    />
                    {state?.error?.stok_barang && (
                      <p className="text-red-500 text-xs mt-1">
                        {state.error.stok_barang}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Satuan
                    </label>
                    <input
                      type="text"
                      name="satuan_barang"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Pcs/Unit"
                    />
                    {state?.error?.satuan_barang && (
                      <p className="text-red-500 text-xs mt-1">
                        {state.error.satuan_barang}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <input
                    type="checkbox"
                    name="is_stock_bulanan"
                    id="is_stock_bulanan"
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <label
                    htmlFor="is_stock_bulanan"
                    className="text-sm text-gray-700 cursor-pointer select-none"
                  >
                    Stok Bulanan (Barang Habis Pakai)
                  </label>
                </div>

                <div className="pt-2">
                  <SubmitButton />
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
