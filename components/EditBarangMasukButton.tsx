"use client";

import { useState, useEffect, useActionState, useTransition } from "react";
import DelayedOverlay from "@/components/DelayedOverlay";
import { updateBarangMasukAction } from "@/lib/action";
import { FaEdit, FaTimes, FaBoxOpen, FaCaretDown } from "react-icons/fa";
import { triggerToast } from "@/utils/toastEvent"; 
import { startGlobalLoading, stopGlobalLoading } from "@/utils/loadingEvent";

interface ActionState {
  message: string;
  error?: Record<string, string[]>;
  success: boolean;
}

interface EditBarangMasukButtonProps {
  id: number;
  nama_barang: string;
  jumlah_awal: number;
  sumber_awal: string;
  satuan: string;
  id_peminjaman?: number | null;
}

const initialState: ActionState = {
  message: "",
  error: {},
  success: false,
};
const parseSumber = (fullString: string) => {
  if (!fullString) return { sumber: "", ket: "" };

  if (fullString === "Pembelian") return { sumber: "Pembelian", ket: "" };
  
  // Sesuai action.ts: "Pemberian dari "
  if (fullString.startsWith("Pemberian dari ")) {
    return {
      sumber: "Pemberian",
      ket: fullString.replace("Pemberian dari ", ""),
    };
  }
  
  if (fullString === "Pemberian") return { sumber: "Pemberian", ket: "" };

  // Menangani "Stok Awal" atau "Penambahan Stok" masuk ke kategori "Lainnya" secara visual
  const isSpecial = fullString === "Stok Awal" || fullString === "Penambahan Stok";
  return { 
    sumber: "Lainnya", 
    ket: isSpecial ? "" : fullString 
  };
};
export default function EditBarangMasukButton({
  id,
  nama_barang,
  jumlah_awal,
  sumber_awal,
  satuan,
  id_peminjaman,
}: EditBarangMasukButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const updateWithId = updateBarangMasukAction.bind(null, id);
  const [state, formAction] = useActionState(updateWithId, initialState);


  // --- STATE FORM TUNGGAL ---
  const [formData, setFormData] = useState<{
    jumlah_barang: number | string;
    sumber_barang: string;
    keterangan_sumber: string;
  }>({
    jumlah_barang: jumlah_awal,
    sumber_barang: "",
    keterangan_sumber: ""
  });

  

  // Handle Response Server
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
        sumber_barang: prevState.sumber_barang // Memastikan nilai dropdown tetap sesuai yang dipilih sebelumnya
      }));
    }
  }, [state, hasSubmitted]);

  const handleOpen = () => {
    setHasSubmitted(false);
    const srcData = parseSumber(sumber_awal || "");
    
    setFormData({
      jumlah_barang: jumlah_awal,
      sumber_barang: srcData.sumber, // Sinkronkan dengan value dropdown
      keterangan_sumber: srcData.ket
    });
    
    setIsOpen(true);
  };
  
  const handleClose = () => {
    stopGlobalLoading();
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
        onClick={handleOpen} // PENTING: Panggil handleOpen, bukan setIsOpen
        className="bg-yellow-100 p-2 rounded text-yellow-600 hover:bg-yellow-200 transition-colors"
        title="Edit Data"
      >
        <FaEdit size={16} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100 relative">
            
            {isPending && <DelayedOverlay />}

            <div className="bg-blue-600 px-6 py-4 border-b border-blue-500 flex justify-between items-center">
              <div className="flex items-center gap-2 text-white">
                <FaBoxOpen />
                <h3 className="text-lg font-bold">Edit Barang Masuk</h3>
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
                
                {/* Nama Barang (ReadOnly) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Barang</label>
                  <input 
                    type="text" 
                    value={`${nama_barang} (${satuan})`}
                    readOnly 
                    className="w-full border border-gray-200 bg-gray-100 rounded-lg px-3 py-2 text-gray-500 cursor-not-allowed focus:outline-none"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">*Nama barang tidak dapat diubah.</p>
                </div>

                {/* Jumlah Masuk */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Masuk</label>
                  <input
                    name="jumlah_barang"
                    type="number"
                    value={formData.jumlah_barang}
                    onChange={(e) => {
                      if (!id_peminjaman) { 
                        setFormData({...formData, jumlah_barang: e.target.value});
                      }
                    }}
                    min={1}
                    readOnly={!!id_peminjaman} 
                    className={`w-full p-3 rounded-lg border ${
                      !!id_peminjaman 
                        ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200" 
                        : hasSubmitted && state?.error?.jumlah_barang ? "border-red-500" : "border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-blue-400`}
                  />
                  {!!id_peminjaman && (
                    <p className="text-[10px] text-gray-500 mt-1">
                      *Jumlah tidak dapat diubah karena terikat dengan data Peminjaman.
                    </p>
                  )}
                  {!id_peminjaman && (
                    <p className="text-xs text-gray-500 mt-1">*Stok gudang akan otomatis disesuaikan.</p>
                  )}
                  {hasSubmitted && state?.error?.jumlah_barang && (
                    <p className="text-red-500 text-xs mt-1 animate-pulse">{state.error.jumlah_barang[0]}</p>
                  )}
                  
                </div>

                {/* Sumber Barang */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sumber Barang</label>
                  <div className="relative">
                    <select 
                      name="sumber_barang"
                      value={formData.sumber_barang}
                      onChange={(e) => {
                          const val = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            sumber_barang: val,
                            // Hanya reset keterangan jika pindah ke Pembelian
                            // Jika pindah "Lainnya" <-> "Pemberian", teks tetap ada (UX Friendly)
                            keterangan_sumber: (val === "Pembelian") ? "" : prev.keterangan_sumber
                          }));
                      }} 
                      className={`w-full p-3 rounded-lg border ${hasSubmitted && state?.error?.sumber_barang ? "border-red-500" : "border-gray-300"} outline-none focus:ring-2 focus:ring-blue-400 appearance-none bg-white cursor-pointer`}
                    >
                      <option value="" disabled>Pilih Sumber ...</option>
                      <option value="Pembelian">Pembelian (Anggaran Kantor)</option>
                      <option value="Pemberian">Pemberian / Hibah</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-600">
                      <FaCaretDown />
                    </div>
                  </div>
                  {hasSubmitted && state?.error?.sumber_barang && (
                    <p className="text-red-500 text-xs mt-1 animate-pulse">{state.error.sumber_barang[0]}</p>
                  )}
                </div>

                {/* Keterangan Sumber (Conditional) */}
                {(formData.sumber_barang === "Pemberian" || formData.sumber_barang === "Lainnya") && (
                  <div className="animate-in fade-in slide-in-from-top-2">
                    <label className="text-xs text-gray-600 mb-1 block">
                      {formData.sumber_barang === "Pemberian" ? "Detail Pemberi:" : "Keterangan Sumber Lainnya:"}
                    </label>
                    <input 
                      name="keterangan_sumber"
                      type="text" 
                      value={formData.keterangan_sumber}
                      onChange={(e) => setFormData({...formData, keterangan_sumber: e.target.value})}
                      placeholder={formData.sumber_barang === "Pemberian" ? "Contoh: Pemerintah Pusat..." : "Sebutkan sumber barang..."} 
                      className={`w-full p-3 rounded-lg border ${hasSubmitted && state?.error?.keterangan_sumber ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-blue-400`}
                    />
                    {hasSubmitted && state?.error?.keterangan_sumber && (
                      <p className="text-red-500 text-xs mt-1 animate-pulse">{state.error.keterangan_sumber[0]}</p>
                    )}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                  <button 
                      type="button" 
                      onClick={handleClose} 
                      disabled={isPending} 
                      className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                  >
                      Batal
                  </button>
                  <button 
                      type="submit" 
                      disabled={isPending} 
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 shadow-md active:scale-95 transition-transform"
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