"use client";

import { useState, useEffect, useActionState, useTransition } from "react";
import DelayedOverlay from "@/components/DelayedOverlay";
import { updateUserAction } from "@/lib/action";
import { FaEdit, FaCaretDown, FaUserEdit, FaTimes, FaEye, FaEyeSlash } from "react-icons/fa";
import { triggerToast } from "@/utils/toastEvent";
import { startGlobalLoading, stopGlobalLoading } from "@/utils/loadingEvent"
// Definisi Tipe State
interface ActionState {
  message: string;
  error?:Record<string, string[]>;
  success: boolean;
}

interface User { 
  id: string; 
  name: string; 
  email: string; 
  role: string;
  password?: string;
  confirm_password?: string; 
}

interface EditAkunButtonProps { 
  user: User; 
}

const initialState: ActionState = { 
  message: "", 
  error: {}, 
  success: false 
};

export default function EditAkunButton({ user }: EditAkunButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [state, formAction] = useActionState(updateUserAction, initialState);

  // Handle Respon Server
  useEffect(() => {
    if (!hasSubmitted) return;
    if (state?.success) {
      stopGlobalLoading();
      triggerToast("Data akun berhasil diperbarui!", "success");
      handleClose(); 
    } else if (state?.message && !state.success) {
      stopGlobalLoading();
      triggerToast(state.message, "error");
      setFormData({
        ...formData,
        role: user.role,  // Pastikan role tetap sesuai setelah error
      });
    }
  }, [state, hasSubmitted]);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    role: user.role === "admin" ? "Admin" : "Staff Gudang"
  });
  const handleSubmit = (formData: FormData) => {
    setHasSubmitted(true);
    startGlobalLoading();
    startTransition(() => {
      formAction(formData);
    });
  };

  const handleOpen = () => {
    setHasSubmitted(false); 
    setShowPassword(false);
    setShowConfirmPassword(false);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role === "admin" ? "Admin" : "Staff Gudang"
    });
    setIsOpen(true);
  }

  const handleClose = () => {
    stopGlobalLoading();
    setHasSubmitted(false);
    setIsOpen(false);
  }

  return (
    <>
      <button 
        onClick={handleOpen} 
        className="bg-yellow-100 p-2 rounded text-yellow-600 hover:bg-yellow-200 transition-colors"
        title="Edit Akun"
      >
        <FaEdit size={16} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all scale-100 relative">
            
            {isPending && <DelayedOverlay />}

            <div className="bg-blue-600 px-6 py-4 border-b border-blue-500 flex justify-between items-center">
              <div className="flex items-center gap-2 text-white">
                <FaUserEdit />
                <h2 className="text-lg font-bold">Edit Data Staff</h2>
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
                <input type="hidden" name="id" value={user.id} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nama Lengkap */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                    <input 
                      type="text" 
                      name="name" 
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                      className={`w-full border ${hasSubmitted && state?.error?.name ? "border-red-500" : "border-gray-300"} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400`}
                    />
                    {hasSubmitted && state?.error?.name && (
                      <p className="text-red-500 text-xs mt-1 animate-pulse">
                        {state.error.name[0]}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Kedinasan</label>
                    <input 
                      type="email" 
                      name="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                      className={`w-full border ${hasSubmitted && state?.error?.email ? "border-red-500" : "border-gray-300"} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400`}
                    />
                    {hasSubmitted && state?.error?.email && (
                      <p className="text-red-500 text-xs mt-1 animate-pulse">
                        {state.error.email[0]}
                      </p>
                    )}
                  </div>
                  {/* Jabatan / Role */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan / Role</label>
                    <div className="relative">
                      {/* PENTING: Value harus match dengan logika di action.ts ("Admin" atau "Staff Gudang") */}
                      <select 
                        name="role" 
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 appearance-none bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
                      >
                        <option value="Staff Gudang">Staff Gudang</option>
                        <option value="Admin">Admin</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                        <FaCaretDown />
                      </div>
                    </div>
                  </div>
                  
                  {/* Password Baru dengan Toggle Show/Hide */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru (Opsional)</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        name="password" 
                        placeholder="Kosongkan jika tetap" 
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-400" 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password Baru</label>
                    <div className="relative">
                      <input 
                        type={showConfirmPassword ? "text" : "password"} 
                        name="confirm_password" 
                        placeholder="Ulangi password baru" 
                        className={`w-full border ${hasSubmitted && state?.error?.confirm_password ?"border-red-500" : "border-gray-300"} rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-400`} 
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500"
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    {hasSubmitted && state?.error?.confirm_password && (
                      <p className="text-red-500 text-xs mt-1">{state.error.confirm_password[0]}</p>
                    )}
                  </div>
                    
                    {/* Pesan Error */}
                    {hasSubmitted && state?.error?.password && (
                      <div className="text-red-500 text-xs mt-1 flex flex-col">
                        {state.error.password.map((err, idx) => (
                          <span key={idx}>• {err}</span>
                        ))}
                      </div>
                    )}
                    
                    {/* Helper Text Standar Keamanan */}
                    <p className="text-[10px] text-gray-500 mt-1 leading-tight">
                      *Jika diubah: Min 8 kar, Huruf Besar, Kecil, Angka, & Simbol.
                    </p>
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