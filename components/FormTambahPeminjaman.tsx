"use client";

import React, { useActionState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaHandshake, FaCaretDown } from "react-icons/fa";
import { createPeminjamanAction } from "@/lib/action";
import { triggerToast } from "@/utils/toastEvent";
import { startGlobalLoading } from "@/utils/loadingEvent";
interface FormState {
  error?: {
    nomor_ktp?: string[];
    nama_peminjam?: string[];
    kategori_peminjam?: string[];
    no_telp?: string[];
    alamat?: string[];
    barang_id?: string[];
    jumlah?: string[];
    tanggal_pinjam?: string[];
  };
  message?: string;
  success?: boolean;
}

interface FormTambahPeminjamanProps {
  barangList: {
    id_barang: number;
    nama_barang: string;
    stok_barang: number;
    satuan_barang: string;
  }[];
  initialData?: {
    id_peminjaman: number;
    nomor_ktp: string;
    nama_peminjam: string;
    kategori_peminjam: string;
    no_telepon: string;
    alamat: string;
    id_barang: number;
    jumlah_peminjaman: number;
    tanggal_peminjaman: string | Date | null;
  };
  isEdit?: boolean;
}

const initialState: FormState = {
  message: "",
  success: false,
};

export default function FormTambahPeminjaman({
  barangList,
  initialData, 
  isEdit = false, 
}: FormTambahPeminjamanProps) {
  const router = useRouter();

  const [state, formAction, isPendingAction] = useActionState(
    createPeminjamanAction as (state: FormState | null, payload: FormData) => Promise<FormState>, 
    initialState
  );

  const [isPendingTransition, startTransition] = useTransition();
  const isPending = isPendingAction || isPendingTransition;

  // Cek apakah ada error field spesifik
  const hasValidationErrors = state?.error && Object.keys(state.error).length > 0;

  useEffect(() => {
    // 1. Jika SUKSES -> Tampilkan Toast Hijau
    if (state?.success) {
      triggerToast(state.message || "Peminjaman berhasil disimpan!", "success");
      startGlobalLoading();
      router.push("/admin/dashboard/pinjam-barang");
    } 
    // 2. Jika ERROR -> Cek dulu jenis errornya
    else if (state?.message) {
      // Daftar pesan yang DIANGGAP sebagai error validasi (bukan error sistem)
      // Pesan-pesan ini TIDAK BOLEH memunculkan Toast
      const validationMessages = [
        "Harap lengkapi data", 
        "Data tidak valid", 
        "Data tidak lengkap",
        "Input tidak valid"
      ];

      // Cek apakah pesan dari server mengandung kata-kata di atas
      const isValidationMessage = validationMessages.some(msg => 
        state.message?.toLowerCase().includes(msg.toLowerCase())
      );

      // Hanya tampilkan Toast Error jika:
      // a. Tidak ada error field (hasValidationErrors false)
      // b. DAN pesannya BUKAN pesan validasi umum (isValidationMessage false)
      if (!hasValidationErrors && !isValidationMessage) {
        triggerToast(state.message, "error");
      }
    }
  }, [state, router, hasValidationErrors]);

  const handleSubmit = (formData: FormData) => {
    if (isEdit && initialData) {
        formData.append("id_peminjaman", initialData.id_peminjaman.toString());
    }
    
    startTransition(() => {
      formAction(formData);
    });
  };

  const getDefaultDate = () => {
    if (initialData?.tanggal_peminjaman) {
      return new Date(initialData.tanggal_peminjaman).toISOString().split("T")[0];
    }
    const local = new Date();
    const offset = local.getTimezoneOffset() * 60000;
    const localDate = new Date(local.getTime() - offset);
    return localDate.toISOString().split("T")[0];
  }
  return (
    <div className="w-full bg-white p-6 rounded-xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="relative w-8 h-8 text-[#1E88E5]">
          <FaHandshake className="w-full h-full" />
        </div>
        <h1 className="text-black text-2xl font-bold">
          {isEdit ? "Edit Peminjaman Barang" : "Form Peminjaman Barang"}
        </h1>
      </div>

      <div className="w-full h-2 bg-[#BBDEFB] rounded-full mb-8"></div>

      <div className="bg-[#BBDEFB] rounded-xl overflow-hidden shadow-sm border border-blue-100">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget as HTMLFormElement);
            handleSubmit(formData);
          }}
          className="flex flex-col"
          noValidate // PENTING: Mencegah pop-up "Please fill out this field" bawaan browser
        >
          
          {/* Row 1: NIK & Nama */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 items-start">
            <div className="flex flex-col gap-2">
              <label className="text-black font-semibold">Nomor KTP (NIK)</label>
              <input
                type="text" 
                inputMode="numeric" 
                name="nomor_ktp"
                placeholder="16 Digit NIK"
                maxLength={16} 
                defaultValue={initialData?.nomor_ktp || ""}
                className="w-full p-3 rounded-lg border-none focus:ring-2 focus:ring-blue-400 outline-none text-gray-700 bg-white"
                onInput={(e) => {
                  const target = e.target as HTMLInputElement;
                  target.value = target.value.replace(/\D/g, "");
                  if (target.value.length > 16) target.value = target.value.slice(0, 16);
                }}
              />
              {state?.error?.nomor_ktp && (
                <p className="text-red-500 text-sm mt-1">{state.error.nomor_ktp[0]}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-black font-semibold">Nama Peminjam</label>
              <input
                type="text"
                name="nama_peminjam"
                placeholder="Contoh: Budi Santoso"
                defaultValue={initialData?.nama_peminjam || ""}
                className="w-full p-3 rounded-lg border-none focus:ring-2 focus:ring-blue-400 outline-none text-gray-700 bg-white"
              />
              {state?.error?.nama_peminjam && (
                <p className="text-red-500 text-sm mt-1">{state.error.nama_peminjam[0]}</p>
              )}
            </div>
          </div>

          <div className="h-2 w-full bg-white"></div>

          {/* Row 2: Kategori & No Telp */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 items-start">
            <div className="flex flex-col gap-2">
              <label className="text-black font-semibold">Kategori Peminjam</label>
              <div className="relative">
                <select
                  name="kategori_peminjam"
                  defaultValue={initialData?.kategori_peminjam || "Warga"}
                  className="w-full p-3 rounded-lg border-none focus:ring-2 focus:ring-blue-400 outline-none text-gray-700 appearance-none bg-white cursor-pointer"
                >
                  <option value="Warga">Warga</option>
                  <option value="Pihak Pemerintah">Pihak Pemerintah</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-black">
                  <FaCaretDown />
                </div>
              </div>
              {state?.error?.kategori_peminjam && (
                <p className="text-red-500 text-sm mt-1">{state.error.kategori_peminjam[0]}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-black font-semibold">Nomor Telepon / WA</label>
              <input
                type="tel"
                name="no_telp"
                placeholder="0812xxxx"
                defaultValue={initialData?.no_telepon || ""}
                className={`w-full p-3 rounded-lg border-none focus:ring-2 focus:ring-blue-400 outline-none text-gray-700 bg-white ${
                  state?.error?.no_telp ? "border border-red-500" : "" // Opsional: Tambah border merah
                }`}
              />
              {state?.error?.no_telp && (
                <p className="text-red-500 text-sm mt-1">{state.error.no_telp[0]}</p>
              )}
            </div>
          </div>

          <div className="h-2 w-full bg-white"></div>

          {/* Row 3: Alamat */}
          <div className="flex flex-col gap-2 p-6">
            <label className="text-black font-semibold">Alamat Domisili</label>
            <input
              type="text"
              name="alamat"
              placeholder="Masukkan alamat lengkap..."
              defaultValue={initialData?.alamat || ""}
              className={`w-full p-3 rounded-lg border-none focus:ring-2 focus:ring-blue-400 outline-none text-gray-700 bg-white ${
                state?.error?.alamat ? "border border-red-500" : "" 
              }`}
            />
            {state?.error?.alamat && (
              <p className="text-red-500 text-sm mt-1">{state.error.alamat[0]}</p>
            )}
          </div>

           <div className="h-2 w-full bg-white"></div>

          {/* Row 4: Barang & Jumlah */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 items-start">
            <div className="flex flex-col gap-2">
              <label className="text-black font-semibold">Pilih Barang</label>
              <div className="relative">
                <select
                  name="barang_id"
                  defaultValue={initialData?.id_barang || ""}
                  className={`w-full p-3 rounded-lg border-none focus:ring-2 focus:ring-blue-400 outline-none text-gray-700 appearance-none bg-white cursor-pointer ${
                    state?.error?.barang_id ? "border border-red-500" : "" 
                  }`}
                >
                  <option value="" disabled>-- Pilih Barang Inventaris --</option>
                  {barangList.map((item) => (
                    <option
                      key={item.id_barang}
                      value={item.id_barang}
                      disabled={item.stok_barang === 0}
                    >
                      {item.nama_barang} (Stok: {item.stok_barang} {item.satuan_barang})
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-black">
                  <FaCaretDown />
                </div>
              </div>
              {state?.error?.barang_id && (
                <p className="text-red-500 text-sm mt-1">{state.error.barang_id[0]}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-black font-semibold">Jumlah Pinjam</label>
              <input
                type="number"
                name="jumlah"
                placeholder="0"
                defaultValue={initialData?.jumlah_peminjaman || ""}
                className="w-full p-3 rounded-lg border-none focus:ring-2 focus:ring-blue-400 outline-none text-gray-700 bg-white"
              />
              {state?.error?.jumlah && (
                <p className="text-red-500 text-sm mt-1">{state.error.jumlah[0]}</p>
              )}
            </div>
          </div>

          {/* Row 5: Tanggal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-6 pb-6 pt-0 items-start">
             <div className="flex flex-col gap-2">
              <label className="text-black font-semibold">Tanggal Peminjaman</label>
              <input
                type="date"
                name="tanggal_pinjam"
                defaultValue={getDefaultDate()}
                className="w-full p-3 rounded-lg border-none focus:ring-2 focus:ring-blue-400 outline-none text-gray-700 bg-white cursor-pointer"
                onClick={(e) => (e.target as HTMLInputElement).showPicker()}
              />
              {state?.error?.tanggal_pinjam && (
                <p className="text-red-500 text-sm mt-1">{state.error.tanggal_pinjam[0]}</p>
              )}
            </div>
          </div>

          <div className="h-2 w-full bg-white"></div>

          <div className="p-6 flex gap-4">
            <button
              type="submit"
              disabled={isPending}
              className="bg-white text-[#4285F4] font-bold py-2 px-8 rounded-xl shadow hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "Menyimpan..." : (isEdit ? "Update Data" : "Simpan Data")}
            </button>
            <button
              type="button"
              onClick={() => {
                startGlobalLoading();
                router.push("/admin/dashboard/pinjam-barang");}}
              className="bg-[#616161] text-white font-bold py-2 px-8 rounded-xl shadow hover:bg-gray-700 transition-colors disabled:opacity-50"
              disabled={isPending}
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}