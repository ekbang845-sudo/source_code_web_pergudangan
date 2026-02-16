"use client";

import React, { useActionState, useState, useTransition, useEffect, useRef } from "react";
import Image from "next/image";
import { FaCaretDown, FaTimes, FaPlus, FaTrash, FaExclamationTriangle } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { createItemAction, getDaftarSatuan, deleteSatuanAction, saveSatuanAction } from "@/lib/action"; // Import saveSatuanAction
import { triggerToast } from "@/utils/toastEvent";
import { startGlobalLoading } from "@/utils/loadingEvent";
interface FormState {
  error?: {
    nama_barang?: string[];
    stok_barang?: string[];
    satuan_barang?: string[];
    keterangan_sumber?: string[];
  };
  message?: string;
  success?: boolean;
}

export default function FormTambahBarang() {
  const router = useRouter();
  const [state, formAction] = useActionState(
    createItemAction as (state: FormState | null, payload: FormData) => Promise<FormState>,
    null
  );

  // --- STATES ---
  const [sumber, setSumber] = useState("");
  const [satuan, setSatuan] = useState("");
  
  // Dropdown States
  const [daftarSatuan, setDaftarSatuan] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [newSatuanInput, setNewSatuanInput] = useState("");
  
  // Delete Modal States
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [isPending, startTransition] = useTransition();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // --- EFFECTS ---
  useEffect(() => {
    fetchSatuanData();
  }, []);

  // Tutup dropdown jika klik di luar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (state?.success) {
      triggerToast(state.message || "Barang berhasil ditambahkan!", "success");
      startGlobalLoading();
      router.push("/admin/dashboard/data-barang");
    } else if (state?.message) {
      triggerToast(state.message, "error");
    }
  }, [state, router]);

  // --- HANDLERS ---

  const fetchSatuanData = async () => {
    const data = await getDaftarSatuan();
    setDaftarSatuan(data.map((item) => item.nama));
  };

  const handleSubmit = (formData: FormData) => {
    formData.set("satuan_barang", satuan);
    startTransition(() => {
      formAction(formData);
    });
  };

  // 1. LOGIC TAMBAH SATUAN (Langsung Simpan ke DB)
  const handleAddSatuan = async () => {
    if (!newSatuanInput.trim()) return;
    const formatted = newSatuanInput.charAt(0).toUpperCase() + newSatuanInput.slice(1);
    
    // Optimistic Update (Tampil dulu biar cepat)
    if (!daftarSatuan.includes(formatted)) {
      setDaftarSatuan([...daftarSatuan, formatted]);
    }
    setSatuan(formatted);
    setNewSatuanInput("");

    // Simpan ke DB di background
    const result = await saveSatuanAction(formatted);
    if (!result.success) {
      triggerToast(result.message || "Gagal menyimpan satuan", "error");
      // Kalau gagal, refresh data asli dari DB untuk membatalkan optimistic update
      fetchSatuanData(); 
    }
  };

  // 2. MEMBUKA MODAL KONFIRMASI DELETE
  const openDeleteConfirmation = (e: React.MouseEvent, item: string) => {
    e.stopPropagation();
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
    setIsDropdownOpen(false); // Tutup dropdown biar fokus ke modal
  };

  // 3. EKSEKUSI DELETE (Setelah User Klik "Ya, Hapus")
  const confirmDelete = async () => {
    if (!itemToDelete) return;

    const result = await deleteSatuanAction(itemToDelete);
    
    if (result.success) {
      // Update UI
      const newList = daftarSatuan.filter((i) => i !== itemToDelete);
      setDaftarSatuan(newList);
      if (satuan === itemToDelete) setSatuan(""); // Reset jika sedang dipilih
      triggerToast("Satuan berhasil dihapus", "success");
    } else {
      triggerToast(result.message || "Gagal menghapus", "error");
    }

    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  return (
    <div className="w-full bg-white p-6 rounded-xl relative">
      <div className="flex items-center gap-3 mb-4">
        <div className="relative w-8 h-8">
          <Image src="/tambahbarang_icon.png" alt="Icon" width={32} height={32} className="object-contain" />
        </div>
        <h1 className="text-black text-2xl font-bold">Tambah Barang Baru</h1>
      </div>

      <div className="w-full h-2 bg-[#BBDEFB] rounded-full mb-8"></div>

      <div className="bg-[#BBDEFB] rounded-xl overflow-hidden shadow-sm border border-blue-100">
        <form action={handleSubmit} className="flex flex-col">
          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 items-center">
            <div className="flex flex-col gap-2">
              <label className="text-black font-semibold">Nama Barang</label>
              <input name="nama_barang" type="text" placeholder="Masukkan Nama Barang ..." className="w-full p-3 rounded-lg outline-none text-gray-700 bg-white" />
              {state?.error?.nama_barang && <p className="text-red-500 text-sm">{state.error.nama_barang}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-black font-semibold">Opsi Periode</label>
              <div className="flex gap-8 items-center h-12">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="periode" value="Reguler" defaultChecked className="w-5 h-5 accent-[#1E88E5]" />
                  <span className="text-black font-medium">Reguler</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="periode" value="Unreguler" className="w-5 h-5 accent-[#1E88E5]" />
                  <span className="text-black font-medium">Unreguler</span>
                </label>
              </div>
            </div>
          </div>

          <div className="h-2 w-full bg-white"></div>

          {/* Row 2 - CUSTOM DROPDOWN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
            
            <div className="flex flex-col gap-2 relative" ref={dropdownRef}>
              <label className="text-black font-semibold">Satuan Barang</label>
              
              <div 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full p-3 rounded-lg bg-white flex justify-between items-center cursor-pointer border border-transparent focus:ring-2 focus:ring-blue-400"
              >
                <span className={satuan ? "text-gray-700" : "text-gray-400"}>
                  {satuan || "Pilih atau Tambah Satuan..."}
                </span>
                <FaCaretDown className="text-gray-500" />
              </div>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 w-full mt-1 bg-white rounded-lg shadow-xl z-50 border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                  {/* Input Tambah */}
                  <div className="p-2 border-b bg-gray-50 flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Ketik satuan baru..."
                      value={newSatuanInput}
                      onChange={(e) => setNewSatuanInput(e.target.value)}
                      className="flex-1 p-2 text-sm border rounded-md outline-none focus:border-blue-500 text-black"
                      onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleAddSatuan(); }}}
                    />
                    <button 
                      type="button" 
                      onClick={handleAddSatuan}
                      className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <FaPlus size={12} />
                    </button>
                  </div>

                  {/* List Item */}
                  <div className="max-h-50 overflow-y-auto custom-scrollbar">
                    {daftarSatuan.length === 0 ? (
                      <p className="text-gray-400 text-xs text-center py-2">List kosong</p>
                    ) : (
                      daftarSatuan.map((item) => (
                        <div 
                          key={item} 
                          onClick={() => {
                            setSatuan(item);
                            setIsDropdownOpen(false);
                          }}
                          className={`flex justify-between items-center p-3 cursor-pointer hover:bg-blue-50 transition-colors ${satuan === item ? 'bg-blue-100 font-semibold text-blue-800' : 'text-gray-700'}`}
                        >
                          <span>{item}</span>
                          <button 
                            onClick={(e) => openDeleteConfirmation(e, item)}
                            className="text-gray-300 hover:text-red-500 p-1.5 rounded-full hover:bg-red-50 transition-all"
                            title="Hapus Satuan"
                          >
                            <FaTrash size={12} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
              {state?.error?.satuan_barang && <p className="text-red-500 text-sm">{state.error.satuan_barang}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-black font-semibold">Jumlah Awal</label>
              <input name="stok_barang" type="number" min={0} placeholder="Masukkan Jumlah Awal ..." className="w-full p-3 rounded-lg outline-none text-gray-700 bg-white" />
              {state?.error?.stok_barang && <p className="text-red-500 text-sm">{state.error.stok_barang}</p>}
            </div>
          </div>

          <div className="h-2 w-full bg-white"></div>

          {/* Row 3 - Sumber */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 items-start">
            <div className="flex flex-col gap-2">
              <label className="text-black font-semibold">Sumber Barang</label>
              <div className="relative">
                <select 
                  name="sumber_barang" 
                  value={sumber} 
                  onChange={(e) => setSumber(e.target.value)} 
                  className="w-full p-3 rounded-lg border-none outline-none text-gray-700 appearance-none bg-white cursor-pointer"
                >
                  <option value="" disabled>Pilih Sumber ...</option>
                  <option value="Pembelian">Pembelian (Anggaran Kantor)</option>
                  <option value="Pemberian">Pemberian / Hibah</option>
                  {/* Tambahan opsi Lainnya */}
                  <option value="Lainnya">Lainnya</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-black">
                  <FaCaretDown />
                </div>
              </div>
            </div>

            {/* Logika muncul jika Pemberian ATAU Lainnya dipilih */}
            {(sumber === "Pemberian" || sumber === "Lainnya") && (
              <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2">
                <label className="text-black font-semibold">
                  {sumber === "Pemberian" ? "Detail Pemberi" : "Keterangan Sumber Lainnya"}
                </label>
                <input 
                  name="keterangan_sumber" 
                  type="text" 
                  placeholder={sumber === "Pemberian" ? "Contoh: Pemerintah Pusat..." : "Sebutkan sumber barang..."} 
                  className="w-full p-3 rounded-lg outline-none text-gray-700 bg-white" 
                  required // Opsional: mewajibkan isi jika kolom ini muncul
                />
                {state?.error?.keterangan_sumber && (
                  <p className="text-red-500 text-sm mt-1">
                    {Array.isArray(state.error.keterangan_sumber) 
                      ? state.error.keterangan_sumber[0] 
                      : state.error.keterangan_sumber}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="h-2 w-full bg-white"></div>

          <div className="p-6 flex gap-4">
            <button type="submit" disabled={isPending} className="bg-white text-[#4285F4] font-bold py-2 px-8 rounded-xl shadow hover:bg-gray-50 disabled:opacity-50">{isPending ? "Menyimpan..." : "Simpan"}</button>
            <button type="button" disabled={isPending} onClick={() => {
              startGlobalLoading();
              router.push("/admin/dashboard/data-barang");}} 
            className="bg-[#616161] text-white font-bold py-2 px-8 rounded-xl shadow hover:bg-gray-700 disabled:opacity-50">Batal</button>
          </div>
        </form>
      </div>

      {/* --- MODAL CONFIRM DELETE (POP UP CANTIK) --- */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 scale-100 animate-in zoom-in-95 duration-200 flex flex-col items-center text-center">
            
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-500">
              <FaExclamationTriangle size={24} />
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Satuan?</h3>
            <p className="text-gray-500 text-sm mb-6">
              Apakah Anda yakin ingin menghapus satuan <span className="font-bold text-gray-800">"{itemToDelete}"</span>?<br/>
              Tindakan ini tidak bisa dibatalkan.
            </p>

            <div className="flex gap-3 w-full">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
              >
                Ya, Hapus
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}