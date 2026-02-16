"use client";

import { useActionState, useState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import Image from "next/image";
import { 
  FaEnvelope, 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaExclamationCircle 
} from "react-icons/fa"; 
import { signInAction } from "@/lib/action";


interface ActionState {
  message?: string;
  error?: {
    email?: string[];
    password?: string[];
  };
}

const SubmitButton = () => {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full p-3.75 bg-[#0d47a1] text-white rounded-[5px] text-[18px] font-bold cursor-pointer hover:bg-[#002171] transition-all shadow-md active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-centerSF gap-2"
    >
      {pending ? (
        <>
          <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
          Loading...
        </>
      ) : (
        "Log in"
      )}
    </button>
  );
};


export default function LoginForm() {
  // Inisialisasi state awal sebagai null atau object kosong sesuai tipe
  const [state, formAction] = useActionState(signInAction, null);
  const [showPassword, setShowPassword] = useState(false);
  const [lockoutTime, setLockoutTime] = useState<string | null>(null); 
  const [isLocked, setIsLocked] = useState(false);
  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  // Helper untuk mengakses error dengan aman (karena struktur error bisa array atau string tergantung validasi Zod)
  const getErrorMessage = (errorObj: any, field: string) => {
    if (!errorObj) return null;
    const err = errorObj[field];
    return Array.isArray(err) ? err[0] : err;
  };

  useEffect(() => {
    // 1. Cek apakah pesan error mengandung format "LOCKED_UNTIL="
    if (state?.message && state.message.startsWith("LOCKED_UNTIL=")) {
      const timeString = state.message.split("=")[1]; // Ambil bagian tanggal ISO
      const unlockDate = new Date(timeString).getTime();
      
      setIsLocked(true);

      const interval = setInterval(() => {
        const now = new Date().getTime();
        const distance = unlockDate - now;

        if (distance < 0) {
          // Waktu habis
          clearInterval(interval);
          setLockoutTime(null);
          setIsLocked(false);
          // Opsional: Reload halaman atau reset message
          // window.location.reload(); 
        } else {
          // Hitung menit dan detik
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
          
          // Format biar jadi "05:01"
          const fmtMin = minutes < 10 ? `0${minutes}` : minutes;
          const fmtSec = seconds < 10 ? `0${seconds}` : seconds;
          
          setLockoutTime(`${fmtMin}:${fmtSec}`);
        }
      }, 1000);

      // Cleanup interval saat unmount atau state berubah
      return () => clearInterval(interval);
    } else {
        // Reset jika error lain muncul (misal salah password biasa)
        setIsLocked(false);
        setLockoutTime(null);
    }
  }, [state]);

  const displayMessage = isLocked 
    ? "Akun terkunci sementara." 
    : state?.message;

  return (
    <div className="flex min-h-screen w-full font-[Segoe UI,Tahoma,Geneva,Verdana,sans-serif]">
      {/* PANEL KIRI */}
      <div className="hidden md:flex flex-1 flex-col justify-center items-center bg-[#fffdfd] p-5 text-center relative z-10">
        <div className="mb-5 w-37.5">
          <Image
            src="/logo_kelurahan_icon.png"
            alt="Logo"
            width={150}
            height={150}
            priority
            className="max-w-full h-auto"
          />
        </div>
        <div className="text-[#333]">
          <h2 className="text-2xl font-semibold tracking-wider mb-1">GUDANG</h2>
          <h2 className="text-2xl font-semibold tracking-wider">
            KELURAHAN GEDONG
          </h2>
        </div>
      </div>

      {/* PANEL KANAN */}
      <div className="flex flex-1 justify-center items-center bg-[#1e88e5] p-5 min-h-screen w-full relative z-10">
        <div className="w-[80%] max-w-100 text-white">
          
          {/* Judul Mobile & Desktop */}
          <div className="block md:hidden text-center mb-10 font-semibold">
            <Image
              src="/logo_kelurahan_icon.png"
              alt="Logo Mobile"
              width={60}
              height={60}
              className="mx-auto mb-2 h-15 w-auto"
            />
            GUDANG
            <br />
            KELURAHAN GEDONG
          </div>
          <h2 className="hidden md:block text-center mb-10 text-[32px]">
            Log in
          </h2>

          {/* Alert Error Box (Global Message) */}
          {state?.message && (
            <div className={`mb-6 p-4 border rounded-lg flex items-center gap-3 animate-[fadeIn_0.3s_ease-out]
              ${isLocked 
                ? "bg-orange-500/20 border-orange-200/50" // Warna Orange kalau Terkunci
                : "bg-red-500/20 border-red-200/50"       // Warna Merah kalau Error Biasa
              }`}
            >
               {/* Ikon berubah jika terkunci */}
               <FaExclamationCircle className={`text-xl min-w-5 ${isLocked ? "text-orange-200" : "text-red-200"}`} />
               
               <div className="w-full">
                 {/* 1. Tampilkan pesan yang user-friendly, bukan raw message */}
                 <p className={`font-medium text-sm text-left leading-tight ${isLocked ? "text-orange-100" : "text-white"}`}>
                   {displayMessage}
                 </p>

                 {/* 2. TAMPILKAN WAKTU MUNDUR DI SINI */}
                 {isLocked && lockoutTime && (
                   <p className="mt-1 text-lg font-bold text-yellow-300 tracking-wider">
                     Coba lagi dalam: {lockoutTime}
                   </p>
                 )}
               </div>
            </div>
          )}

          <form action={formAction} noValidate> 
            <div 
              className={`relative mb-1 bg-white rounded-[5px] h-13.75 group shadow-sm transition-all duration-300
              ${state?.error?.email ? "ring-2 ring-red-400 bg-red-50" : "focus-within:ring-2 focus-within:ring-[#64b5f6]"}`}
            >
              <FaEnvelope 
                className={`absolute left-3.75 top-1/2 -translate-y-1/2 text-[18px] z-10 pointer-events-none transition-colors
                ${state?.error?.email ? "text-red-400" : "text-[#888] group-focus-within:text-[#1e88e5]"}`} 
              />

              <input
                type="email"
                name="email"
                id="email"
                className="peer w-full h-full pl-11.25 pr-5 pt-5 pb-1 rounded-[5px] outline-none text-[#333] bg-transparent text-[16px] relative z-0 transition-all placeholder-transparent"
                placeholder="Email"
              />

              <label
                htmlFor="email"
                className={`absolute left-11.25 top-1/2 -translate-y-1/2 text-[16px] transition-all duration-200 pointer-events-none z-10 
                peer-focus:top-3 peer-focus:text-[11px] peer-focus:font-bold
                peer-not-placeholder-shown:top-3 peer-not-placeholder-shown:text-[11px] peer-not-placeholder-shown:font-bold
                ${state?.error?.email ? "text-red-400 peer-focus:text-red-500 peer-not-placeholder-shown:text-red-500" : "text-[#888] peer-focus:text-[#1e88e5] peer-not-placeholder-shown:text-[#1e88e5]"}`}
              >
                Email
              </label>
            </div>
            
            {/* Error Message Email */}
            <div className="min-h-6 mb-4">
              {state?.error?.email && (
                <div className="flex items-center gap-1.5 text-red-100 text-sm animate-[slideDown_0.2s_ease-out] ml-1">
                  <FaExclamationCircle className="text-xs" />
                  <span>{getErrorMessage(state.error, 'email')}</span>
                </div>
              )}
            </div>

            <div 
              className={`relative mb-1 bg-white rounded-[5px] h-13.75 group shadow-sm transition-all duration-300
              ${state?.error?.password ? "ring-2 ring-red-400 bg-red-50" : "focus-within:ring-2 focus-within:ring-[#64b5f6]"}`}
            >
              <FaLock 
                className={`absolute left-3.75 top-1/2 -translate-y-1/2 text-[18px] z-10 pointer-events-none transition-colors
                ${state?.error?.password ? "text-red-400" : "text-[#888] group-focus-within:text-[#1e88e5]"}`} 
              />

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                className="peer w-full h-full pl-11.25 pr-11.25 pt-5 pb-1 rounded-[5px] outline-none text-[#333] bg-transparent text-[16px] relative z-0 transition-all placeholder-transparent"
                placeholder="Password"
              />

              <label
                htmlFor="password"
                className={`absolute left-11.25 top-1/2 -translate-y-1/2 text-[16px] transition-all duration-200 pointer-events-none z-10
                peer-focus:top-3 peer-focus:text-[11px] peer-focus:text-[#1e88e5] peer-focus:font-bold
                peer-not-placeholder-shown:top-3 peer-not-placeholder-shown:text-[11px] peer-not-placeholder-shown:text-[#1e88e5] peer-not-placeholder-shown:font-bold
                ${state?.error?.password ? "text-red-400 peer-focus:text-red-500 peer-not-placeholder-shown:text-red-500" : "text-[#888] peer-focus:text-[#1e88e5] peer-not-placeholder-shown:text-[#1e88e5]"}`}
              >
                Password
              </label>

              <button
                type="button"
                onClick={togglePassword}
                className={`absolute right-3.75 top-1/2 -translate-y-1/2 text-[16px] outline-none cursor-pointer transition-colors z-20
                ${state?.error?.password ? "text-red-400 hover:text-red-600" : "text-[#333] hover:text-[#1e88e5]"}`}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {/* Error Message Password */}
            <div className="min-h-6 mb-4">
              {state?.error?.password && (
                <div className="flex items-center gap-1.5 text-red-100 text-sm animate-[slideDown_0.2s_ease-out] ml-1">
                  <FaExclamationCircle className="text-xs" />
                  <span>{getErrorMessage(state.error, 'password')}</span>
                </div>
              )}
            </div>

            <SubmitButton />
          </form>
        </div>
      </div>
    </div>
  );
}