"use client";

import { useState, useEffect, useActionState, useTransition } from "react";
import DelayedOverlay from "@/components/DelayedOverlay";
import { updateBarangKeluarAction } from "@/lib/action";
import { FaEdit, FaCaretDown, FaTimes } from "react-icons/fa";
import { triggerToast } from "@/utils/toastEvent"; 
import { startGlobalLoading, stopGlobalLoading } from "@/utils/loadingEvent";


// Definisi tipe State
interface ActionState {
  message: string;
  error?: Record<string, string[]>;
  success: boolean;
}

interface EditBarangKeluarProps {
  item: {
    id_barang_keluar: number;
    id_barang: number;
    id_peminjaman?: number | null;
    tanggal_keluar: string | Date; // Bisa string atau Date tergantung Prisma return
    jumlah_keluar: number;
    keterangan: string;
    data_barang: { // Pastikan struktur ini sesuai dengan data yang dikirim parent
      nama_barang: string;
      satuan_barang: string;
    };
  };
  items: {
    id_barang: number;
    nama_barang: string;
    satuan_barang: string;
    stok_barang: number;
  }[];
}

const initialState: ActionState = {
  message: "",
  error: {},
  success: false,
};
const parseKeterangan = (fullString: string) => {
  if (!fullString) return { option: "", detail: "" };
  const standardOptions = ["Rusak", "Kadaluarsa"];

  if (fullString.startsWith("Diberikan kepada: ")) {
    return {
      option: "Diberikan",
      detail: fullString.replace("Diberikan kepada: ", ""),
    };
  } 
  
  if (fullString.startsWith("Dipakai untuk: ")) {
    return {
      option: "Dipakai Habis",
      detail: fullString.replace("Dipakai untuk: ", ""),
    };
  }

  if (standardOptions.includes(fullString)) return { option: fullString, detail: "" };
  return { option: "Lainnya", detail: fullString };
};
export default function EditBarangKeluarButton({
  item,
  items,
}: EditBarangKeluarProps) {
  const [isOpen, setIsOpen] = useState(false);

  // State Form
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const updateWithId = updateBarangKeluarAction.bind(null, item.id_barang_keluar);
  const [state, formAction] = useActionState(updateWithId, initialState);
  
  // Helper: Format Tanggal ke YYYY-MM-DD untuk input date
  const formatDateForInput = (date: string | Date) => {
    if (!date) return "";
    const d = new Date(date);
    const offset = d.getTimezoneOffset() * 60000;
    const localDate = new Date(d.getTime() - offset);
    return localDate.toISOString().split("T")[0];
  };

  const [formData, setFormData] = useState({
    id_barang: item.id_barang,
    tanggal_keluar: "", // akan diisi di handleOpen
    jumlah_keluar: item.jumlah_keluar,
    keterangan: "", // Penting: Mulai dengan string kosong
    detail_keterangan: ""
  });
  // Effect: Reset form saat modal dibuka kembali (jika props berubah)
  useEffect(() => {
    if (!hasSubmitted) return;
    if (state.success) {
      stopGlobalLoading();
      triggerToast(state.message || "Data berhasil diperbarui!", "success");
      handleClose();
    } else if (state.message && !state.success) {
      stopGlobalLoading();
      triggerToast(state.message, "error");
      setFormData(prevState => ({
        ...prevState,
        id_barang: item.id_barang, // Tetap mempertahankan nilai dropdown yang dipilih sebelumnya
      }));
    }
  }, [state, hasSubmitted]);

  const handleOpen = () => {
    const { option, detail } = parseKeterangan(item.keterangan || "");
    const dateStr = new Date(item.tanggal_keluar).toISOString().split("T")[0];

    setFormData({
      id_barang: item.id_barang,
      tanggal_keluar: dateStr,
      jumlah_keluar: item.jumlah_keluar,
      keterangan: option, // Pastikan ini hanya berisi "Diberikan", "Rusak", dll.
      detail_keterangan: detail
    });
    setHasSubmitted(false);
    setIsOpen(true);
  };

  const handleClose = () => {
    stopGlobalLoading();
    setHasSubmitted(false);
    setIsOpen(false);
  };

  const handleSubmit = (payload: FormData) => {
    setHasSubmitted(true);
    startGlobalLoading();
    startTransition(() => {
      formAction(payload);
    });
  };
  return (
    <>
      
      <button 
        onClick={handleOpen} 
        className="bg-yellow-100 p-2 rounded text-yellow-600 hover:bg-yellow-200 transition-colors"
        title="Edit Barang Keluar"
      >
        <FaEdit size={16} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all scale-100 relative">
            
            {isPending && <DelayedOverlay />}

            <div className="bg-blue-600 px-6 py-4 border-b border-blue-500 flex justify-between items-center">
              <div className="flex items-center gap-2 text-white">
                <FaEdit />
                <h2 className="text-lg font-bold">Edit Barang Keluar</h2>
              </div>
              <button 
                onClick={handleClose} 
                className="text-white/80 hover:text-white" 
                disabled={isPending}
              >
                <FaTimes size={20} />
              </button>
            </div>

            <div className="p-6">
              <form action={handleSubmit} className="space-y-4" noValidate>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Select Nama Barang */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Barang</label>
                    <input type="hidden" name="id_barang" value={formData.id_barang} />
                    <input 
                      type="text" 
                      value={`${item.data_barang.nama_barang} (${item.data_barang.satuan_barang})`}
                      readOnly 
                      className="w-full border border-gray-200 bg-gray-100 rounded-lg px-3 py-3 text-gray-500 cursor-not-allowed focus:outline-none"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">
                      *Jenis barang tidak dapat diubah. Jika salah input, silakan hapus dan buat baru.
                    </p>
                    {hasSubmitted && state?.error?.id_barang && (
                      <p className="text-red-500 text-xs mt-1 animate-pulse">{state.error.id_barang[0]}</p>
                    )}
                  </div>

                  {/* Input Tanggal */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Keluar</label>
                    <input 
                      type="date" 
                      name="tanggal_keluar" 
                      value={String(formData.tanggal_keluar)} 
                      onChange={(e) => setFormData({...formData, tanggal_keluar: e.target.value})}
                      className={`w-full border ${hasSubmitted && state?.error?.tanggal_keluar ? "border-red-500" : "border-gray-300"} rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400`} 
                      onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                    />
                    {hasSubmitted && state?.error?.tanggal_keluar && (
                      <p className="text-red-500 text-xs mt-1 animate-pulse">{state.error.tanggal_keluar[0]}</p>
                    )}
                  </div>

                  {/* Keterangan */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
                    <div className="relative">
                      <select 
                        name="keterangan" 
                        value={formData.keterangan} 
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(prev => ({
                            ...prev, 
                            keterangan: val,
                            // Reset detail jika user pindah ke opsi yang tidak butuh detail
                            detail_keterangan: (val !== "Diberikan" && val !== "Lainnya") ? "" : prev.detail_keterangan
                          }));
                        }} 
                        className={`w-full border ${hasSubmitted && state?.error?.keterangan ? "border-red-500" : "border-gray-300"} rounded-lg px-3 py-3 appearance-none bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400`}
                      >
                        <option value="" disabled>Pilih Keterangan ...</option>
                        <option value="Dipakai Habis">Dipakai Habis</option>
                        <option value="Diberikan">Diberikan</option>
                        <option value="Rusak">Rusak</option>
                        <option value="Kadaluarsa">Kadaluarsa</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                        <FaCaretDown />
                      </div>
                    </div>
                    {hasSubmitted && state?.error?.keterangan && (
                      <p className="text-red-500 text-xs mt-1 animate-pulse">{state.error.keterangan[0]}</p>
                    )}
                    {(formData.keterangan === "Diberikan" || formData.keterangan === "Lainnya" || formData.keterangan === "Dipakai Habis") && (
                      <div className="mt-2 animate-in fade-in slide-in-from-top-2">
                        <label className="text-xs text-gray-600 mb-1 block">
                          {formData.keterangan === "Diberikan" ? "Diberikan Kepada:" : 
                          formData.keterangan === "Dipakai Habis" ? "Digunakan Untuk:" : "Detail Keterangan:"}
                        </label>
                        <input 
                          type="text" 
                          name="detail_keterangan" 
                          value={formData.detail_keterangan} 
                          onChange={(e) => setFormData({...formData, detail_keterangan: e.target.value})} 
                          placeholder="Jelaskan..." 
                          className={`w-full border ${hasSubmitted && state?.error?.detail_keterangan ? "border-red-500" : "border-gray-300"} rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400`}
                        />
                        {hasSubmitted && state?.error?.detail_keterangan && (
                          <p className="text-red-500 text-xs mt-1 animate-pulse">{state.error.detail_keterangan[0]}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Jumlah Barang */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Barang</label>
                    <input 
                      type="number" 
                      name="jumlah_keluar" 
                      value={formData.jumlah_keluar} 
                      onChange={(e) => setFormData({...formData, jumlah_keluar: Number(e.target.value)})}
                      readOnly={!!item.id_peminjaman}
                      className={`w-full border ${
                        !!item.id_peminjaman
                          ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200"
                          : hasSubmitted && state?.error?.jumlah_keluar ? "border-red-500" : "border-gray-300"
                      } rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400`}
                    />
                    {!!item.id_peminjaman && (
                      <p className="text-[10px] text-gray-500 mt-1">
                        *Jumlah tidak dapat diubah karena terikat dengan data Peminjaman.
                      </p>
                    )}
                    {hasSubmitted && state?.error?.jumlah_keluar && (
                      <p className="text-red-500 text-xs mt-1 animate-pulse">{state.error.jumlah_keluar[0]}</p>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t mt-6 flex justify-end gap-3">
                  <button 
                    type="button" 
                    onClick={handleClose} 
                    className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100" 
                    disabled={isPending}
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    disabled={isPending} 
                    className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold shadow-md active:scale-95 transition-transform"
                  >
                    {isPending ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}