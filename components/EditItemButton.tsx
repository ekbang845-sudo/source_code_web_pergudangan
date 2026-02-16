"use client";

import { useState, useEffect, useActionState, useTransition, useRef} from "react";
import DelayedOverlay from "@/components/DelayedOverlay";
import { updateItemAction, getDaftarSatuan, saveSatuanAction } from "@/lib/action";
import { FaEdit, FaTimes, FaCaretDown, FaPlus } from "react-icons/fa";
import { triggerToast } from "@/utils/toastEvent"; 
import { startGlobalLoading, stopGlobalLoading } from "@/utils/loadingEvent";
// Definisi tipe State agar konsisten
interface ActionState {
  message: string;
  error?: Record<string, string[]>;
  success: boolean;
}

interface EditItemProps { 
  item: { 
    id_barang: number; 
    nama_barang: string; 
    stok_barang: number; 
    satuan_barang: string; 
    is_stock_bulanan: boolean; 
  }; 
}

// Inisialisasi state yang aman
const initialState: ActionState = {
  message: "",
  error: {},
  success: false,
};

export default function EditItemButton({ item }: EditItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [satuan, setSatuan] = useState(item.satuan_barang);
  const [daftarSatuan, setDaftarSatuan] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [newSatuanInput, setNewSatuanInput] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  // Binding ID ke action
  const updateItemWithId = updateItemAction.bind(null, item.id_barang);
  const [state, formAction] = useActionState(updateItemWithId, initialState);

  const [formData, setFormData] = useState({
    stok_barang: item.stok_barang,
    satuan_barang: item.satuan_barang,
    is_stock_bulanan: item.is_stock_bulanan
  });
  useEffect(() => {
    if (isOpen) {
      const fetchSatuan = async () => {
        const data = await getDaftarSatuan();
        setDaftarSatuan(data.map((s) => s.nama));
      };
      fetchSatuan();
    }
  }, [isOpen]);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle Response Server
  useEffect(() => {
    if (!hasSubmitted) return;

    if (state?.success) {
      stopGlobalLoading();
      triggerToast("Data barang berhasil diperbarui!", "success");
      handleClose();
    } else if (state?.message && !state.success) {
      stopGlobalLoading();
      triggerToast(state.message, "error");
      setFormData(prevState => ({
        ...prevState,
        satuan_barang: prevState.satuan_barang 
      }));
    }
  }, [state, hasSubmitted]);

  const handleOpen = () => {
    setHasSubmitted(false);
    setFormData({
      stok_barang: item.stok_barang,
      satuan_barang: item.satuan_barang,
      is_stock_bulanan: item.is_stock_bulanan
    });
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

  const handleAddSatuan = async () => {
    if (!newSatuanInput.trim()) return;
    const formatted = newSatuanInput.charAt(0).toUpperCase() + newSatuanInput.slice(1);
    
    // Optimistic Update
    if (!daftarSatuan.includes(formatted)) {
      setDaftarSatuan([...daftarSatuan, formatted]);
    }
    // Update formData langsung
    setFormData({ ...formData, satuan_barang: formatted });
    setNewSatuanInput("");
    setIsDropdownOpen(false);

    await saveSatuanAction(formatted);
  };
  return (
    <>
      
      <button 
        onClick={handleOpen} 
        className="bg-yellow-100 p-2 rounded text-yellow-600 hover:bg-yellow-200 transition-colors"
        title="Edit Data Barang"
      >
        <FaEdit size={16} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 relative">
            
            {isPending && <DelayedOverlay />}

            <div className="bg-blue-600 px-6 py-4 border-b border-blue-500 flex justify-between items-center">
              <div className="flex items-center gap-2 text-white">
                <FaEdit />
                <h2 className="text-lg font-bold">Edit Barang</h2>
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
              <form action={handleSubmit} className="space-y-4">
                {/* Nama Barang */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Barang</label>
                  <input 
                    type="text" 
                    name="nama_barang" 
                    defaultValue={item.nama_barang} 
                    className={`w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400`}
                  />
                  {hasSubmitted && state?.error?.nama_barang && (
                    <p className="text-red-500 text-xs mt-1 animate-pulse font-medium">{state.error.nama_barang[0]}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Stok */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stok</label>
                    <input 
                      type="number" 
                      name="stok_barang" 
                      value={formData.stok_barang}
                      onChange={(e) => setFormData({...formData, stok_barang: Number(e.target.value)})}
                      min="0" 
                      className={`w-full border ${
                        hasSubmitted && state?.error?.stok_barang ? "border-red-500" : "border-gray-300"
                      } rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400`} 
                    />
                    {hasSubmitted && state?.error?.stok_barang && (
                      <p className="text-red-500 text-[10px] mt-1 leading-tight animate-pulse font-medium">
                        {state.error.stok_barang[0]}
                      </p>
                    )}
                  </div>
                  {/* Satuan */}
                 <div className="flex flex-col relative" ref={dropdownRef}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Satuan</label>
                    
                    {/* Hidden Input agar terkirim di FormData */}
                    <input type="hidden" name="satuan_barang" value={satuan} />

                    <div 
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className={`w-full border ${state?.error?.satuan_barang ? "border-red-500" : "border-gray-300"} rounded-lg px-3 py-2 flex justify-between items-center cursor-pointer bg-white focus:ring-2 focus:ring-blue-400`}
                    >
                      <span className="text-gray-700">{satuan}</span>
                      <FaCaretDown className="text-gray-500" />
                    </div>

                    {/* Menu Dropdown */}
                    {isDropdownOpen && (
                      <div className="absolute top-full left-0 w-full mt-1 bg-white rounded-lg shadow-xl z-50 border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                        {/* Input Tambah Satuan */}
                        <div className="p-2 border-b bg-gray-50 flex gap-2">
                          <input 
                            type="text" 
                            placeholder="Baru..."
                            value={newSatuanInput}
                            onChange={(e) => setNewSatuanInput(e.target.value)}
                            className="flex-1 p-1 px-2 text-sm border rounded outline-none focus:border-blue-500 text-black"
                            onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleAddSatuan(); }}}
                          />
                          <button 
                            type="button" 
                            onClick={handleAddSatuan}
                            className="bg-blue-600 text-white p-1.5 rounded hover:bg-blue-700 transition-colors"
                          >
                            <FaPlus size={10} />
                          </button>
                        </div>

                        <div className="max-h-45 overflow-y-auto custom-scrollbar">
                          {daftarSatuan.map((s) => (
                            <div 
                              key={s} 
                              onClick={() => {
                                setSatuan(s); 
                                setFormData({ ...formData, satuan_barang: s }); 
                                setIsDropdownOpen(false);
                              }}
                              className={`px-3 py-2 cursor-pointer text-sm hover:bg-blue-50 transition-colors ${satuan === s ? 'bg-blue-100 font-semibold text-blue-800' : 'text-gray-700'}`}
                            >
                              {s}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {hasSubmitted && state?.error?.satuan_barang && <p className="text-red-500 text-xs mt-1">{state.error.satuan_barang[0]}</p>}
                  </div>
                </div>

                {/* Checkbox Stok Bulanan */}
                <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                  <input 
                    type="checkbox" 
                    name="is_stock_bulanan" 
                    id="edit_is_stock_bulanan" 
                    checked={formData.is_stock_bulanan}
                    onChange={(e) => setFormData({...formData, is_stock_bulanan: e.target.checked})}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer" 
                  />
                  <label htmlFor="edit_is_stock_bulanan" className="text-sm text-gray-700 cursor-pointer select-none">
                    Stok unreguler
                  </label>
                </div>

                {/* Tombol Aksi */}
                <div className="flex justify-end gap-3 pt-4 border-t mt-4">
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
                    className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold shadow-md active:scale-95 transition-transform"
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