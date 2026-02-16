"use client";

import React, { useState, useEffect } from "react";
import { FaExclamationTriangle, FaDownload, FaTimes, FaTrash, FaCheckCircle, FaPlus, FaSpinner } from "react-icons/fa";
import { tutupBukuAction } from "@/actions/tutupBukuAction";
import { showConfirmDialog, showLoadingAlert, closeAlert } from "@/lib/swal"; 
import { requestEmailOtpAction, verifyEmailOtpAction, getBackupSettingsAction, deleteAdditionalEmailAction, updateBackupStatusAction } from "@/actions/emailAction";
import { triggerToast } from "@/utils/toastEvent"; 

export default function TutupBukuDangerZone({ onClose }: { onClose: () => void }) {
  const [confirmText, setConfirmText] = useState("");
  const [isEmailOn, setIsEmailOn] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [verifiedEmails, setVerifiedEmails] = useState<any[]>([]);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [emailTarget, setEmailTarget] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);

  const targetPhrase = "Konfirmasi Tutup Buku";
  const isReady = confirmText === targetPhrase;

  useEffect(() => {
    async function loadSettings() {
      const res = await getBackupSettingsAction();
      if (res) {
        setAdminEmail(res.adminEmail);
        setIsEmailOn(res.isEmailActive);
        setVerifiedEmails(res.additionalEmails);
      }
    }
    loadSettings();
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleExecute = async () => {
    const confirm = await showConfirmDialog("Konfirmasi Eksekusi", "Data akan diunduh dan database periode ini akan dibersihkan.", "Ya, Proses Sekarang");
    if (!confirm.isConfirmed) return;

    showLoadingAlert("Sedang memproses laporan...");
    const result = await tutupBukuAction();

    if (result.success && result.file) {
      const link = document.createElement("a");
      link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${result.file}`;
      link.download = result.fileName;
      link.click();
      
      closeAlert();
      triggerToast(result.message || "Tutup Buku Berhasil!", "success"); 
      setTimeout(() => window.location.reload(), 2000);
    } else {
      closeAlert();
      triggerToast(result.message || "Gagal memproses.", "error"); 
    }
  };

  const handleRequestOTP = async () => {
    if (!emailTarget.includes("@")) return triggerToast("Email tidak valid!", "error");
    
    setOtpSent(true);
    setCountdown(300); 
    const res = await requestEmailOtpAction(emailTarget);
    
    if (!res.success) {
      setOtpSent(false);
      setCountdown(0);
      triggerToast(res.message || "Gagal mengirim OTP", "error"); 
    }
  };

  const handleVerifyOTP = async () => {
    setIsVerifying(true);
    const res = await verifyEmailOtpAction(emailTarget, otpCode);
    
    if (res.success) {
      triggerToast("Email berhasil diverifikasi!", "success"); 
      const settings = await getBackupSettingsAction();
      if (settings) setVerifiedEmails(settings.additionalEmails);
      handleCancelAddEmail();
    } else {
      triggerToast(res.message || "OTP Salah!", "error"); 
    }
    setIsVerifying(false);
  };

  const handleDeleteEmail = async (id: string) => {
    const confirm = await showConfirmDialog("Hapus Email?", "Email ini tidak akan menerima laporan lagi.", "Hapus");
    if (confirm.isConfirmed) {
      await deleteAdditionalEmailAction(id);
      setVerifiedEmails(prev => prev.filter(e => e.id !== id));
      triggerToast("Email berhasil dihapus", "success"); 
    }
  };

  const handleCancelAddEmail = () => {
    setIsAddModalOpen(false); 
    setEmailTarget("");       
    setOtpSent(false);        
    setOtpCode("");           
    setCountdown(0);          
    setIsVerifying(false);    
  };

  return (
    <div className="relative bg-white rounded-2xl border-2 border-red-500 shadow-2xl overflow-hidden max-w-lg mx-auto">
      {/* Pop-up Tambah Email (Nested Modal) */}
      {isAddModalOpen && (
        <div className="absolute inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-white w-full max-w-xs rounded-xl shadow-2xl overflow-hidden border border-blue-200 animate-in zoom-in duration-200">
            <button onClick={handleCancelAddEmail} className="absolute top-2 right-2 text-blue-300 hover:text-blue-600 transition-colors">
              <FaTimes size={14} />
            </button>
            <div className="bg-blue-600 p-3 text-white font-bold text-xs uppercase tracking-widest text-center">
              Tambah Email Backup
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400">ALAMAT EMAIL</label>
                <input 
                  type="email" placeholder="contoh@gmail.com" value={emailTarget}
                  onChange={e => setEmailTarget(e.target.value)} disabled={otpSent}
                  className="w-full p-2 text-xs border rounded-lg outline-none focus:border-blue-500"
                />
              </div>

              {otpSent && (
                <div className="space-y-1 animate-in slide-in-from-top-2 duration-300">
                  <label className="text-[10px] font-bold text-gray-400">KODE OTP</label>
                  <div className="flex gap-2">
                    <input 
                      placeholder="000000" value={otpCode} onChange={e => setOtpCode(e.target.value)}
                      className="flex-1 p-2 text-xs border rounded-lg text-center font-bold tracking-[0.5em]"
                    />
                    <button 
                      onClick={handleVerifyOTP} disabled={isVerifying || otpCode.length < 6}
                      className="bg-green-600 text-white px-3 rounded-lg text-[10px] font-bold hover:bg-green-700 disabled:bg-gray-300 flex items-center justify-center"
                    >
                      {isVerifying ? <FaSpinner className="animate-spin"/> : "VERIFY"}
                    </button>
                  </div>
                  {countdown > 0 && (
                    <p className="text-[9px] text-blue-600 text-center italic font-medium">
                      Kirim ulang tersedia dalam {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button onClick={handleCancelAddEmail} className="flex-1 py-2 text-[10px] font-bold text-gray-500 hover:bg-gray-100 rounded-lg transition-all">
                  BATAL
                </button>
                <button 
                  onClick={handleRequestOTP} 
                  disabled={(otpSent && countdown > 0) || !emailTarget}
                  className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all shadow-md ${
                    (otpSent && countdown > 0) ? "bg-blue-300 text-white cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {otpSent && countdown > 0 ? "OTP TERKIRIM" : "OTP"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header Utama */}
      <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-gray-200 z-10">
        <FaTimes size={20} />
      </button>
      <div className="bg-red-600 p-4 flex items-center gap-3 text-white">
        <FaExclamationTriangle size={24} />
        <h2 className="font-black text-lg uppercase tracking-tight">Otoritas Tutup Buku</h2>
      </div>
      
      <div className="p-6 space-y-5">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-3">
          <div className="flex justify-between items-center border-b border-blue-100 pb-2">
            <div>
              <p className="text-[10px] font-black text-blue-900">Konfigurasi Backup</p>
              <p className="text-[9px] text-blue-700 italic">Admin: {adminEmail}</p>
            </div>
            <input 
              type="checkbox" checked={isEmailOn} 
              onChange={(e) => { setIsEmailOn(e.target.checked); updateBackupStatusAction(e.target.checked); }}
              className="w-4 h-4 cursor-pointer accent-blue-600"
            />
          </div>

          {isEmailOn && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-bold text-blue-800 uppercase tracking-tighter">Penerima Tambahan</span>
                <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-1 bg-blue-600 text-white px-2 py-1 rounded-md text-[9px] font-bold hover:bg-blue-700 shadow-sm">
                  <FaPlus size={8} /> TAMBAH EMAIL
                </button>
              </div>
              <div className="max-h-24 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                {verifiedEmails.length > 0 ? verifiedEmails.map((em) => (
                  <div key={em.id} className="group flex justify-between items-center bg-white p-2 rounded-lg text-[10px] border border-blue-100 hover:border-blue-300 transition-all">
                    <span className="flex items-center gap-2 font-medium text-gray-700">
                      <FaCheckCircle className="text-green-500"/> {em.email}
                    </span>
                    <button onClick={() => handleDeleteEmail(em.id)} className="text-red-400 hover:text-red-600 transition-opacity p-1">
                      <FaTrash size={10} />
                    </button>
                  </div>
                )) : (
                  <p className="text-[9px] text-gray-400 text-center py-2 italic bg-white/50 rounded-lg border border-dashed border-gray-200">
                    Belum ada email tambahan
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Konfirmasi Aksi</label>
          <p className="text-[11px] text-gray-500 italic">Ketik ulang: <span className="text-red-600 font-bold">"{targetPhrase}"</span></p>
          <input 
            type="text" value={confirmText} onChange={(e) => setConfirmText(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-400 outline-none transition-all"
            placeholder="Ketik di sini..."
          />
        </div>

        <button
          onClick={handleExecute} disabled={!isReady}
          className={`w-full py-4 rounded-xl font-black transition-all flex items-center justify-center gap-3 shadow-lg ${
            isReady ? "bg-red-600 text-white hover:bg-red-700 active:scale-95 shadow-red-200" : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          <FaDownload /> EKSEKUSI TUTUP BUKU
        </button>
      </div>
    </div>
  );
}