"use client";

import { useState, useEffect, useActionState, useTransition } from "react";
import DelayedOverlay from "@/components/DelayedOverlay";
import { updatePeminjamanAction } from "@/lib/action"; 
import { FaEdit, FaCaretDown, FaHandshake, FaTimes } from "react-icons/fa";
import { triggerToast } from "@/utils/toastEvent";
import { startGlobalLoading, stopGlobalLoading } from "@/utils/loadingEvent";

// Definisi Tipe State
interface ActionState {
  message: string;
  error?: Record<string, string[]>;
  success: boolean;
}

interface EditPeminjamanButtonProps {
  item: {
    id_peminjaman: number;
    nomor_ktp: string;
    nama_peminjam: string;
    kategori_peminjam: string;
    status_peminjaman: string;
    no_telepon: string;
    alamat: string;
    jumlah_peminjaman: number;
    tanggal_peminjaman: string | Date;
    data_barang: {
      nama_barang: string;
      satuan_barang: string;
    };
  };
}

const initialState: ActionState = {
  message: "",
  error: {},
  success: false,
};

export default function EditPeminjamanButton({ item }: EditPeminjamanButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [hasSubmitted, setHasSubmitted] = useState(false);
  // Binding ID ke action
  const updateWithId = updatePeminjamanAction.bind(null, item.id_peminjaman);
  const [state, formAction] = useActionState(updateWithId, initialState);
  
  // Helper: Format Tanggal
  const formatDateForInput = (date: string | Date) => {
    if (!date) return "";
    const d = new Date(date);
    const offset = d.getTimezoneOffset() * 60000;
    const localDate = new Date(d.getTime() - offset);
    return localDate.toISOString().split("T")[0];
  };

  const [formData, setFormData] = useState({
    nomor_ktp: item.nomor_ktp,
    nama_peminjam: item.nama_peminjam,
    kategori_peminjam: item.kategori_peminjam,
    no_telepon: item.no_telepon,
    alamat: item.alamat,
    jumlah_peminjaman: item.jumlah_peminjaman,
    tanggal_peminjaman: formatDateForInput(item.tanggal_peminjaman),
  });

  useEffect(() => {
    if (!hasSubmitted) return; 

    if (state.success) {
      stopGlobalLoading();
      triggerToast(state.message || "Data peminjaman berhasil diperbarui!", "success");
      handleClose();
    } else if (state.message && !state.success) {
      stopGlobalLoading();
      triggerToast(state.message, "error");
      setFormData(prevState => ({
        ...prevState,
        kategori_peminjam: prevState.kategori_peminjam // Memastikan dropdown tetap konsisten
      }));
    }
  }, [state, hasSubmitted]);

  const handleOpen = () => {
    setHasSubmitted(false); 
    setFormData({
      nomor_ktp: item.nomor_ktp,
      nama_peminjam: item.nama_peminjam,
      kategori_peminjam: item.kategori_peminjam,
      no_telepon: item.no_telepon,
      alamat: item.alamat,
      jumlah_peminjaman: item.jumlah_peminjaman,
      tanggal_peminjaman: formatDateForInput(item.tanggal_peminjaman),
    });
    setIsOpen(true);
  };
  const handleClose = () => {
    stopGlobalLoading();
    setHasSubmitted(false);
    setIsOpen(false);
  };

  const handleSubmit = (formData: FormData) => {
    setHasSubmitted(true); 
    startGlobalLoading();
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <>
      <button 
        onClick={handleOpen} 
        className="bg-yellow-100 p-2 rounded text-yellow-600 hover:bg-yellow-200 transition-colors"
        title="Edit Peminjaman"
      >
        <FaEdit size={16} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto transform transition-all scale-100 relative">
            
            {isPending && <DelayedOverlay />}

            <div className="bg-blue-600 px-6 py-4 border-b border-blue-500 flex justify-between items-center sticky top-0 z-10">
              <div className="flex items-center gap-2 text-white">
                <FaHandshake />
                <h2 className="text-lg font-bold">Edit Peminjaman</h2>
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
              <form action={handleSubmit} className="space-y-4 noValidate">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Nomor KTP (Read Only) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nomor KTP</label>
                    <input 
                      type="text" 
                      name="nomor_ktp" 
                      value={formData.nomor_ktp}
                      onChange={(e) => setFormData({ ...formData, nomor_ktp: e.target.value })}
                      className={`w-full border ${hasSubmitted && state?.error?.nomor_ktp ? "border-red-500" : "border-gray-300"} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400`} 
                    />
                    {hasSubmitted && state?.error?.nomor_ktp && (
                      <p className="text-red-500 text-xs mt-1 animate-pulse">{state.error.nomor_ktp[0]}</p>
                    )}
                  </div>

                  {/* Nama Peminjam */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Peminjam</label>
                    <input 
                      type="text" 
                      name="nama_peminjam" 
                      value={formData.nama_peminjam}
                      onChange={(e) => setFormData({ ...formData, nama_peminjam: e.target.value })}
                      className={`w-full border ${hasSubmitted && state?.error?.nama_peminjam ? "border-red-500" : "border-gray-300"} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400`}
                    />
                    {hasSubmitted && state?.error?.nama_peminjam && (
                      <p className="text-red-500 text-xs mt-1 animate-pulse">{state.error.nama_peminjam[0]}</p>
                    )}
                  </div>

                  {/* Kategori Peminjam */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                    <div className="relative">
                      <select 
                        name="kategori_peminjam" 
                        value={formData.kategori_peminjam}
                        onChange={(e) => setFormData({ ...formData, kategori_peminjam: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 appearance-none bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
                      >
                        <option value="Warga">Warga</option>
                        <option value="Pihak pemerintah">Pihak Pemerintah</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                        <FaCaretDown />
                      </div>
                    </div>
                  </div>

                  {/* No Telepon */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon / WA</label>
                    <input 
                      type="text" 
                      name="no_telepon" 
                      value={formData.no_telepon}
                      onChange={(e) => setFormData({ ...formData, no_telepon: e.target.value })}
                      className={`w-full border ${hasSubmitted && state?.error?.no_telepon ? "border-red-500" : "border-gray-300"} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400`}
                    />
                    {hasSubmitted && state?.error?.no_telepon && (
                      <p className="text-red-500 text-xs mt-1 animate-pulse">{state.error.no_telepon[0]}</p>
                    )}
                  </div>

                  {/* Alamat (Full Width di MD) */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                    <textarea 
                      name="alamat" 
                      value={formData.alamat}
                      onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                      rows={2}
                      className={`w-full border ${hasSubmitted && state?.error?.alamat ? "border-red-500" : "border-gray-300"} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none`}
                    />
                    {hasSubmitted && state?.error?.alamat && (
                      <p className="text-red-500 text-xs mt-1 animate-pulse">{state.error.alamat[0]}</p>
                    )}
                  </div>

                  {/* Nama Barang (Read Only) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Barang</label>
                    <input 
                      type="text" 
                      value={`${item.data_barang.nama_barang} (${item.data_barang.satuan_barang})`} 
                      readOnly 
                      className="w-full border border-gray-200 bg-gray-100 rounded-lg px-3 py-2 text-gray-500 cursor-not-allowed" 
                    />
                    <p className="text-[10px] text-gray-400 mt-1">*Barang tidak dapat diubah saat edit.</p>
                  </div>

                  {/* Jumlah Peminjaman */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah</label>
                    <input 
                      name="jumlah_peminjaman" // Harus sama dengan formData.get di action.ts
                      type="number"
                      value={formData.jumlah_peminjaman}
                      onChange={(e) => setFormData({ ...formData, jumlah_peminjaman: Number(e.target.value) })}
                      readOnly={item.status_peminjaman === "Dikembalikan"}
                      className={`w-full p-3 rounded-lg border ${
                        hasSubmitted && state?.error?.jumlah_peminjaman ? "border-red-500" : "border-gray-300"
                      } ${
                        item.status_peminjaman === "Dikembalikan" 
                        ? "bg-gray-100 cursor-not-allowed text-gray-500 shadow-none" 
                        : "bg-white text-gray-900 focus:ring-2 focus:ring-blue-400"
                      } transition-all`}
                    />
                    {hasSubmitted && state?.error?.jumlah_peminjaman && (
                      <p className="text-red-500 text-xs mt-1 animate-pulse font-medium">
                        {state.error.jumlah_peminjaman[0]}
                      </p>
                    )}
                    
                    {item.status_peminjaman === "Belum Dikembalikan" && (
                      <p className="text-[10px] text-gray-500 mt-1 italic">
                        *Stok gudang akan otomatis bertambah/berkurang jika jumlah diubah.
                      </p>
                    )}
                    {item.status_peminjaman === "Dikembalikan" && (
                      <p className="text-[10px] text-orange-600 mt-1 italic">
                        *Jumlah tidak dapat diubah karena barang sudah dikembalikan.
                      </p>
                    )}

                  </div>

                  {/* Tanggal Peminjaman */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Pinjam</label>
                    <input 
                      type="date" 
                      name="tanggal_peminjaman" 
                      value={formData.tanggal_peminjaman}
                      onChange={(e) => setFormData({ ...formData, tanggal_peminjaman: e.target.value })}
                      className={`w-full border ${hasSubmitted && state?.error?.tanggal_peminjaman ? "border-red-500" : "border-gray-300"} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400`}
                      onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                    />
                    {hasSubmitted && state?.error?.tanggal_peminjaman && (
                      <p className="text-red-500 text-xs mt-1 animate-pulse">{state.error.tanggal_peminjaman[0]}</p>
                    )}
                  </div>

                </div>

                {/* Tombol Aksi */}
                <div className="pt-4 border-t mt-6 flex justify-end gap-3">
                   <button 
                     type="button" 
                     onClick={handleClose} 
                     className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50"
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