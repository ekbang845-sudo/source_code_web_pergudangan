"use client";
import React, { useState, useEffect, useMemo } from "react";
import { 
  logoutAction, 
  restoreItemAction, 
  restorePeminjamanAction, 
  restoreBarangKeluarAction, 
  restoreBarangMasukAction, 
  permanentDeleteAction, 
  getAuditLogs
} from "@/lib/action";
import { 
  FaBars, FaTrashAlt, FaTimes, FaBox, FaClipboardList, 
  FaArrowDown, FaArrowUp, FaHistory, FaRecycle, FaBan, FaSignOutAlt,
  FaPlusCircle, FaEdit, FaUndo, FaExclamationTriangle,
  FaChevronLeft, FaChevronRight 
} from "react-icons/fa";
import { FaBoxArchive } from "react-icons/fa6";
import { fetchAllTrashData } from "@/data/trash";
import { Table, Column } from "./Table";
import TutupBukuDangerZone from "./TutupBukuDangerZone";

import { 
  showConfirmDialog, 
  showLoadingAlert, 
  closeAlert 
} from "@/lib/swal";
import { triggerToast } from "@/utils/toastEvent";

interface TopbarProps {
  user?: {
    name?: string | null;
    role?: string | null;
  };
  onMenuClick?: () => void;
}

// --- HELPER HISTORY ---
const getHistoryConfig = (action: string, tableName: string) => {
  let style = { icon: FaHistory, bg: "bg-gray-100", text: "text-gray-600", label: "Aktivitas" };
  const act = action.toUpperCase();

  if (act.includes("CREATE")) style = { icon: FaPlusCircle, bg: "bg-green-100", text: "text-green-600", label: "Menambahkan Data" };
  else if (act.includes("UPDATE")) style = { icon: FaEdit, bg: "bg-blue-100", text: "text-blue-600", label: "Memperbarui Data" };
  else if (act.includes("DELETE") || act.includes("TRASH")) style = { icon: FaTrashAlt, bg: "bg-red-100", text: "text-red-600", label: "Menghapus Data" };
  else if (act.includes("RESTORE")) style = { icon: FaUndo, bg: "bg-teal-100", text: "text-teal-600", label: "Memulihkan Data" };
  else if (act.includes("PERMANENT")) style = { icon: FaExclamationTriangle, bg: "bg-red-200", text: "text-red-800", label: "Hapus Permanen" };

  let context = tableName;
  if (tableName === "Data Barang") context = "Inventaris Barang";
  if (tableName === "Barang Masuk") context = "Stok Masuk";
  if (tableName === "Barang Keluar") context = "Barang Keluar";
  if (tableName === "Peminjaman") context = "Peminjaman Warga";
  if (tableName === "Manajemen Akun") context = "Data Pengguna";

  return { style, context };
};

const Topbar = ({ user, onMenuClick }: TopbarProps) => {
  const [openProfile, setOpenProfile] = useState(false);
  const [isTutupBukuModalOpen, setIsTutupBukuModalOpen] = useState(false);
  const [trashOpen, setTrashOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [trashData, setTrashData] = useState<any>({ barang: [], pinjam: [], masuk: [], keluar: [] });
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // --- STATE PAGINATION ---
  const [activeTab, setActiveTab] = useState<'barang' | 'pinjam' | 'masuk' | 'keluar'>('barang');
  const [trashPage, setTrashPage] = useState(1);
  const itemsPerPage = 5; 

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    setTrashPage(1);
  }, [activeTab]);

  const handleOpenTrash = async () => {
    setTrashOpen(true);
    setLoading(true);
    // PERBAIKAN: Menggunakan const biasa
    const data = await fetchAllTrashData(); 
    setTrashData(data);
    setLoading(false);
  };

  const handleOpenHistory = async () => {
    setOpenProfile(false);
    setHistoryOpen(true);
    setLoading(true);
    const logs = await getAuditLogs();
    setHistoryLogs(logs);
    setLoading(false);
  };

  // --- LOGIKA HITUNGAN DATA GLOBAL ---
  const globalTrashCount = useMemo(() => {
    return (trashData.barang?.length || 0) + 
          (trashData.pinjam?.length || 0) + 
          (trashData.masuk?.length || 0) + 
          (trashData.keluar?.length || 0);
  }, [trashData]);

  const currentTabData = trashData[activeTab] || [];
  
  // Hitung Total Halaman
  const totalPagesCurrentTab = Math.ceil(currentTabData.length / itemsPerPage);

  // Slicing Data untuk Pagination Manual di Modal
  const paginatedData = currentTabData.slice(
    (trashPage - 1) * itemsPerPage, 
    trashPage * itemsPerPage
  );

  const handleRestore = async (type: string, id: number, forceMatch: boolean = false) => {
    if (!forceMatch) {
      const confirm = await showConfirmDialog("Pulihkan Data?", "Data ini akan dikembalikan ke daftar utama.", "Ya, Pulihkan");
      if (!confirm.isConfirmed) return;
    }

    showLoadingAlert("Sedang memproses pemulihan...");
    const res = await (type === 'barang' ? restoreItemAction(id, forceMatch) : type === 'pinjam' ? restorePeminjamanAction(id) : type === 'masuk' ? restoreBarangMasukAction(id) : restoreBarangKeluarAction(id));
    closeAlert();

    const data = res as { success: boolean; message: string; code?: string; existingUnit?: string };

    if (data?.code === "UNIT_CONFLICT") {
      const conflictConfirm = await showConfirmDialog("Konfirmasi Satuan", `Barang dengan nama yang sama sudah ada dengan satuan ${data.existingUnit}. Ingin menyesuaikan?`, "Ya, Sesuaikan");
      if (conflictConfirm.isConfirmed) handleRestore(type, id, true);
      return;
    }

    if (data?.success) {
      triggerToast(data.message, "success");
      const updatedData = await fetchAllTrashData();
      setTrashData(updatedData);
    } else {
      triggerToast(data?.message || "Gagal mempulihkan data.", "error");
    }
  };

  const handlePermanentDelete = async (id: number, table: string) => {
    const confirm = await showConfirmDialog("Hapus?", "Data tidak bisa dikembalikan setelah dihapus!", "Ya, Hapus");
    if (confirm.isConfirmed) {
      showLoadingAlert("Menghapus data...");
      const res = await permanentDeleteAction(id, table as any);
      closeAlert();
      if (res.success) {
        triggerToast(res.message, "success");
        const updatedData = await fetchAllTrashData();
        setTrashData(updatedData);
      } else {
        triggerToast(res.message, "error");
      }
    }
  };

  // --- DEFINISI KOLOM SAMPAH ---
  const trashColumns: Column<any>[] = [
    { 
      header: "No", 
      cell: (_, index) => (trashPage - 1) * itemsPerPage + index + 1, 
      className: "text-center w-12" 
    },
    { 
      header: "Nama Data", 
      cell: (item) => {
        let infoTambahan = "";

        // Logika untuk menampilkan (Jumlah Satuan) berdasarkan Tab yang aktif
        if (activeTab === 'barang') {
          infoTambahan = `(${item.stok_barang} ${item.satuan_barang})`;
        } else if (activeTab === 'pinjam') {
          infoTambahan = `(${item.jumlah_peminjaman} ${item.data_barang?.satuan_barang})`;
        } else if (activeTab === 'masuk') {
          infoTambahan = `(${item.jumlah_barang} ${item.data_barang?.satuan_barang})`;
        } else if (activeTab === 'keluar') {
          infoTambahan = `(${item.jumlah_keluar} ${item.data_barang?.satuan_barang})`;
        }

        return (
          <div className="flex flex-col">
            <span className="font-bold text-gray-800">
              {activeTab === 'barang' ? item.nama_barang : activeTab === 'pinjam' ? item.nama_peminjam : (item.data_barang?.nama_barang || 'Barang')}
            </span><span className="text-[10px] bg-blue-50 text-black px-2 py-0.5 rounded-full border border-blue-100 font-bold whitespace-nowrap">{infoTambahan}</span>
            
          </div>
        );
      }
    },
    { 
      header: "Tgl Hapus", 
      cell: (item) => new Date(item.deletedAt).toLocaleDateString('id-ID', {day: 'numeric', month: 'numeric', year: 'numeric'}),
      className: "text-center w-32"
    },
    {
      header: "Aksi",
      cell: (item) => (
        <div className="flex justify-center gap-2">
          <button 
            onClick={() => handleRestore(activeTab, item[activeTab === 'barang' ? 'id_barang' : activeTab === 'pinjam' ? 'id_peminjaman' : activeTab === 'masuk' ? 'id_barang_masuk' : 'id_barang_keluar'])} 
            className="p-1.5 bg-green-100 text-green-600 rounded hover:bg-green-200 transition-colors" 
            title="Pulihkan"
          >
            <FaRecycle size={14} />
          </button>
          {isAdmin && (
            <button 
              onClick={() => handlePermanentDelete(item[activeTab === 'barang' ? 'id_barang' : activeTab === 'pinjam' ? 'id_peminjaman' : activeTab === 'masuk' ? 'id_barang_masuk' : 'id_barang_keluar'], activeTab)} 
              className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors" 
              title="Hapus Permanen"
            >
              <FaBan size={14} />
            </button>
          )}
        </div>
      ),
      className: "text-center w-24"
    }
  ];

  const tabs = [
    { id: 'barang', label: 'Barang Utama', icon: FaBox },
    { id: 'pinjam', label: 'Peminjaman', icon: FaClipboardList },
    { id: 'masuk', label: 'Barang Masuk', icon: FaArrowDown },
    { id: 'keluar', label: 'Barang Keluar', icon: FaArrowUp }
  ];

  return (
    <div className="w-full h-20 px-6 bg-[#0152D0] shadow-2xl flex items-center justify-between relative z-50">
      <button className="text-white md:hidden mr-4" onClick={onMenuClick}><FaBars size={24} /></button>
      <div className="flex-1"></div>
      
      <div className="flex items-center gap-4">
        <button onClick={(e) => { e.stopPropagation(); handleOpenTrash(); }} className="p-2 hover:bg-white/20 rounded-full transition-colors text-white relative" title="Keranjang Sampah">
          <FaTrashAlt size={18} />
          {globalTrashCount > 0 && (
             <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          )}
        </button>

        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setOpenProfile(!openProfile)}>
          <div className="p-0.5 rounded-full border-2 border-white/30 group-hover:border-white transition-all shadow-lg">
            <img src="/profile_icon.png" alt="Profile" className="w-10 h-10 rounded-full" />
          </div>
          <img src="/up_icon.png" alt="Arrow" className={`w-4 h-4 transition-transform duration-300 ${openProfile ? "rotate-0" : "rotate-180"}`} />
        </div>
      </div>

      {openProfile && (
        <div className="absolute top-20 right-6 bg-white shadow-2xl rounded-2xl w-72 py-3 z-30 p-2 border border-blue-50 animate-in fade-in zoom-in duration-200">
          <div className="bg-linear-to-br from-[#0152D0] to-[#3B82F6] p-4 rounded-xl mb-2 text-white shadow-md">
            <div className="flex items-center gap-3">
              <img src="/profile_icon.png" alt="Profile" className="w-12 h-12 rounded-full border-2 border-white/50 bg-white/20" />
              <div className="overflow-hidden">
                <p className="font-extrabold truncate text-sm">{user?.name || "Administrator"}</p>
                <p className="text-[10px] uppercase tracking-widest font-bold opacity-80">{user?.role || "Gudang"}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-1">
            <button onClick={handleOpenHistory} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 text-left transition-all text-sm font-bold text-gray-700 rounded-xl group">
              <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-[#0152D0] group-hover:text-white transition-colors">
                <FaHistory size={14} />
              </div>
              <span>Riwayat Aktivitas</span>
            </button>
            {isAdmin && (
              <button onClick={() => { setOpenProfile(false); setIsTutupBukuModalOpen(true); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-left transition-all text-sm font-bold text-red-600 rounded-xl group">
                <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-600 group-hover:text-white transition-colors">
                  <FaBoxArchive size={14} />
                </div>
                <span>Tutup Buku Periode</span>
              </button>
            )}
            <form action={logoutAction} className="pt-1 border-t border-gray-100">
              <button type="submit" className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-left transition-all text-sm font-black text-red-600 rounded-xl group">
                <div className="p-2 bg-red-50 rounded-lg group-hover:bg-red-600 group-hover:text-white transition-colors">
                  <FaSignOutAlt size={14} />
                </div>
                <span>Logout Keluar</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {isTutupBukuModalOpen && (
        <div className="fixed inset-0 z-9998 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-lg relative">
            <TutupBukuDangerZone onClose={() => setIsTutupBukuModalOpen(false)} />
          </div>
        </div>
      )}

      {(trashOpen || historyOpen) && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col h-[90vh] sm:h-[85vh]">
            
            <div className="bg-blue-600 px-6 py-5 flex justify-between items-center border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl shadow-sm ${trashOpen ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                  {trashOpen ? <FaTrashAlt size={24} /> : <FaHistory size={24} />}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    {trashOpen ? "Keranjang Sampah" : "Riwayat Aktivitas"}
                  </h2>
                  <p className="text-sm text-white">
                    {trashOpen ? "Data yang dihapus sementara ada di sini" : "Log aktivitas pengguna sistem"}
                  </p>
                </div>
              </div>
              <button onClick={() => { setTrashOpen(false); setHistoryOpen(false); }} className="text-white hover:text-gray-600 transition-colors">
                <FaTimes size={24} />
              </button>
            </div>

            <div className="p-0 bg-gray-50 flex-1 overflow-hidden relative flex flex-col">
              {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-20 backdrop-blur-sm">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-[#0152D0]"></div>
                  <p className="mt-4 text-xs font-bold text-[#0152D0] tracking-widest">MEMUAT...</p>
                </div>
              )}

              {trashOpen ? (
                <div className="p-6 flex flex-col h-full overflow-hidden">
                  
                  <div className="shrink-0 space-y-4 mb-4">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                          Kategori Data
                      </span>
                      <span className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded-full font-bold">
                          Total Sampah: {globalTrashCount}
                      </span>
                    </div>

                    <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar border-b border-gray-100">
                      {tabs.map((tab) => (
                        <button 
                          key={tab.id} 
                          onClick={() => setActiveTab(tab.id as any)}
                          className={`
                            flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap
                            ${activeTab === tab.id 
                              ? "bg-[#0152D0] text-white shadow-md transform scale-105" 
                              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}
                          `}
                        >
                          <tab.icon size={14} />
                          {tab.label}
                          <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${activeTab === tab.id ? "bg-white/20" : "bg-gray-100"}`}>
                            {trashData[tab.id]?.length || 0}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto min-h-0 border border-gray-200 rounded-xl bg-white shadow-sm [&>div]:bg-white! [&>div]:p-0! [&>div]:shadow-none! [&>div]:border-none!">
                    {currentTabData.length > 0 ? (
                      <Table 
                        columns={trashColumns} 
                        data={paginatedData} 
                        entryLabel="sampah" 
                        title="" 
                        hideHeader={false}      // <--- UBAH JADI FALSE (Agar kolom No, Nama, Aksi muncul)
                        hideToolbar={true}      // <--- TAMBAHKAN INI (Agar search bar hilang)
                        hidePagination={true} // Ini menghilangkan Pagination bawah
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400 min-h-50">
                          <FaTrashAlt size={32} className="mb-2 opacity-20" />
                          <p className="text-sm">Belum ada data sampah</p>
                      </div>
                    )}
                  </div>

                  {currentTabData.length > 0 && (
                    <div className="shrink-0 pt-4 flex items-center justify-between border-t border-gray-200 mt-4">
                        <p className="text-xs text-gray-500">
                          Menampilkan {(trashPage - 1) * itemsPerPage + 1} - {Math.min(trashPage * itemsPerPage, currentTabData.length)} dari {currentTabData.length}
                        </p>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setTrashPage(p => Math.max(1, p - 1))}
                            disabled={trashPage === 1}
                            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                          >
                            <FaChevronLeft size={12} />
                          </button>
                          
                          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#0152D0] text-white text-sm font-bold shadow-md">
                            {trashPage}
                          </div>

                          <button 
                            onClick={() => setTrashPage(p => Math.min(totalPagesCurrentTab, p + 1))}
                            disabled={trashPage === totalPagesCurrentTab}
                            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                          >
                            <FaChevronRight size={12} />
                          </button>
                        </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {historyLogs.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">Belum ada aktivitas tercatat.</div>
                  ) : (
                    historyLogs.map((log) => {
                      const { style, context } = getHistoryConfig(log.action, log.tableName);
                      return (
                        <div key={log.id} className="flex gap-4 group">
                          <div className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${style.bg} ${style.text} shadow-sm border border-white z-10`}>
                              <style.icon size={16} />
                            </div>
                            <div className="w-0.5 flex-1 bg-gray-200 my-1 group-last:hidden"></div>
                          </div>
                          <div className="flex-1 bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow mb-2">
                            <div className="flex justify-between items-start mb-1">
                              <div>
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>
                                  {style.label}
                                </span>
                                <span className="text-[10px] font-bold text-gray-400 ml-2 uppercase tracking-wide">
                                  {context}
                                </span>
                              </div>
                              <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
                                {new Date(log.createdAt).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-sm text-gray-800 mt-1 leading-snug">
                              <span className="font-bold">{log.user?.name || "Seseorang"}</span> melakukan aktivitas pada data <span className="font-bold text-[#0152D0]">"{log.dataName}"</span>.
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Topbar;