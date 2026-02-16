"use client";

import React, { useState, useActionState, useTransition, useEffect } from "react";
import Image from "next/image";
import { FaCaretDown } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { addStockAction } from "@/lib/action";
import { triggerToast } from "@/utils/toastEvent";
import { startGlobalLoading } from "@/utils/loadingEvent";

interface Item {
  id_barang: number;
  nama_barang: string;
  satuan_barang: string;
}

interface FormState {
  error?: {
    id_barang?: string[];
    jumlah_barang?: string[];
    sumber_barang?: string[]; 
    keterangan_sumber?: string[];
  };
  message?: string;
  success?: boolean;
}

export default function FormTambahStok({ items }: { items: Item[] }) {
  const router = useRouter();
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  
  // 1. Setup Sumber Barang State
  const [sumber, setSumber] = useState(""); 
  
  // 2. Setup Transition
  const [isPending, startTransition] = useTransition();

  const [state, formAction] = useActionState(
    addStockAction as (
      state: FormState | null,
      payload: FormData
    ) => Promise<FormState>,
    null
  );

  const handleItemChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value);
    const item = items.find((i) => i.id_barang === id);
    setSelectedItem(item || null);
  };

  // 3. Logic Toast & Error (Tanpa Pop-up Validasi)
  const hasValidationErrors = state?.error && Object.keys(state.error).length > 0;

  useEffect(() => {
    if (state?.success) {
      triggerToast(state.message || "Stok berhasil ditambahkan!", "success");
      startGlobalLoading();
      router.push("/admin/dashboard/barang-masuk");
    } else if (state?.message && !hasValidationErrors) {
      // Toast Error hanya muncul jika BUKAN error validasi input
      triggerToast(state.message, "error");
    }
  }, [state, router, hasValidationErrors]);

  const handleSubmit = (formData: FormData) => {
    startTransition(() => {
      formAction(formData);
    });
  };

  const handleBatal = () => {
    startGlobalLoading(); 
    router.push("/admin/dashboard/barang-masuk");
  };
  
  return (
    <div className="w-full bg-white p-6 rounded-xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative w-8 h-8">
          <Image
            src="/barang_masuk_blue_icon.png"
            alt="Icon Tambah Barang"
            width={32}
            height={32}
            className="object-contain"
          />
        </div>
        <h1 className="text-black text-2xl font-bold">Tambah Stok Barang</h1>
      </div>

      {/* Blue Separator Line */}
      <div className="w-full h-2 bg-[#BBDEFB] rounded-full mb-8"></div>

      {/* Form Container */}
      <div className="bg-[#BBDEFB] rounded-xl overflow-hidden shadow-sm border border-blue-100">
        <form 
          action={handleSubmit} 
          className="flex flex-col"
          noValidate // Matikan validasi browser
        >
          
          {/* Row 1: Nama Barang */}
          <div className="p-6">
            <div className="flex flex-col gap-2">
              <label className="text-black font-semibold">Nama Barang</label>
              <div className="relative">
                <select
                  name="id_barang"
                  onChange={handleItemChange}
                  defaultValue=""
                  className="w-full p-3 rounded-lg border-none focus:ring-2 focus:ring-blue-400 outline-none text-gray-700 appearance-none bg-white cursor-pointer"
                >
                  <option value="" disabled>
                    Pilih Barang ...
                  </option>
                  {items.map((item) => (
                    <option key={item.id_barang} value={item.id_barang}>
                      {item.nama_barang}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-black">
                  <FaCaretDown />
                </div>
              </div>
              {state?.error?.id_barang && (
                <p className="text-red-500 text-xs mt-1 font-medium italic">{state.error.id_barang[0]}</p>
              )}
            </div>
          </div>

          <div className="h-2 w-full bg-white"></div>

          {/* Row 2: Satuan Barang & Jumlah */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
            <div className="flex flex-col gap-2">
              <label className="text-black font-semibold">Satuan Barang</label>
              <input
                type="text"
                value={selectedItem?.satuan_barang || ""}
                readOnly
                placeholder="Otomatis terisi ..."
                className="w-full p-3 rounded-lg border-none bg-gray-100 text-gray-500 outline-none cursor-not-allowed"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-black font-semibold">Jumlah</label>
              <input
                name="jumlah_barang"
                type="number"
                min={1}
                placeholder="Masukkan Jumlah yang Masuk ..."
                className="w-full p-3 rounded-lg border-none focus:ring-2 focus:ring-blue-400 outline-none text-gray-700 bg-white"
              />
              {state?.error?.jumlah_barang && (
                <p className="text-red-500 text-sm mt-1">
                  {state.error.jumlah_barang}
                </p>
              )}
            </div>
          </div>

          <div className="h-2 w-full bg-white"></div>

          {/* Row 3: Sumber Barang (Fitur Baru) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 items-start">
            <div className="flex flex-col gap-2">
              <label className="text-black font-semibold">Sumber Barang</label>
              <div className="relative">
                <select 
                  name="sumber_barang" 
                  value={sumber}
                  onChange={(e) => setSumber(e.target.value)}
                  className="w-full p-3 rounded-lg border-none outline-none text-gray-700 bg-white appearance-none cursor-pointer focus:ring-2 focus:ring-blue-400"
                >
                  <option value="" disabled>Pilih Sumber ...</option>
                  <option value="Pembelian">Pembelian (Anggaran Kantor)</option>
                  <option value="Pemberian">Pemberian / Hibah</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-black">
                  <FaCaretDown />
                </div>
              </div>
            </div>

            {/* Input Tambahan: Muncul jika Pilih 'Pemberian' atau 'Lainnya' */}
            {(sumber === "Pemberian" || sumber === "Lainnya") && (
              <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-black font-semibold">
                    {sumber === "Pemberian" ? "Detail Pemberi" : "Keterangan"}
                </label>
                <input 
                  name="keterangan_sumber" 
                  type="text" 
                  placeholder={sumber === "Pemberian" ? "Contoh: Warga RT 05..." : "Contoh: Sisa Kegiatan..."}
                  className={`w-full p-3 rounded-lg border-none outline-none text-gray-700 bg-white focus:ring-2 focus:ring-blue-400 ${
                    state?.error?.keterangan_sumber ? "ring-2 ring-red-500" : ""
                  }`} 
                />
                {state?.error?.keterangan_sumber && (
                  <p className="text-red-500 text-sm mt-1">
                    {state.error.keterangan_sumber[0]}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="h-2 w-full bg-white"></div>

          {/* Buttons */}
          <div className="p-6 flex gap-4">
            <button
              type="submit"
              disabled={isPending}
              className="bg-white text-[#4285F4] font-bold py-2 px-8 rounded-xl shadow hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "Menyimpan..." : "Simpan"}
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                startGlobalLoading();
                router.push("/admin/dashboard/barang-masuk");}}
              className="bg-[#616161] text-white font-bold py-2 px-8 rounded-xl shadow hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}