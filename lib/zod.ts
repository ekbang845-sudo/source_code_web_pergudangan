import { object, string, coerce } from "zod";

const passwordValidation = string()
  .min(8, "Password minimal 8 karakter")
  .regex(/[A-Z]/, "Harus mengandung minimal 1 huruf Besar")
  .regex(/[a-z]/, "Harus mengandung minimal 1 huruf Kecil")
  .regex(/[0-9]/, "Harus mengandung minimal 1 Angka")
  .regex(/[\W_]/, "Harus mengandung minimal 1 Simbol (!@#$...)");

export const SignInSchema = object({
  email: string().email("Email tidak valid"),
  password: string()
    .min(8, "Password minimal 8 karakter ")
    .max(32, "Password maksimal 32 karakter "),
});

const emailValidation = string()
  .min(1, "Email harus diisi")
  .email("Format email tidak valid (harus mengandung @ dan domain)")
  .refine((val) => {
    return val.includes(".") && val.lastIndexOf(".") > val.indexOf("@");
  }, "Email harus memiliki domain yang valid (contoh: .com, .co.id)");

export const RegisterSchema = object({
  name: string().min(1, "Nama harus diisi"),
  email: emailValidation,
  password: passwordValidation,
  confirm_password: string().min(1, "Konfirmasi password harus diisi"),
}).refine((data) => data.password === data.confirm_password, {
  path: ["confirm_password"],
  message: "Password dan konfirmasi password tidak sesuai",
});

export const CreateItemSchema = object({
  nama_barang: string().min(1, "Nama barang harus diisi"),
  stok_barang: string()
    .min(1, "Stok barang harus diisi")
    .refine((val) => !isNaN(Number(val)), "Stok harus berupa angka")
    .refine((val) => Number(val) >= 0, "Stok tidak boleh kurang dari 0"),
  satuan_barang: string().min(1, "Satuan barang harus diisi"),
});

export const AddStockSchema = object({
  id_barang: coerce.number({ 
    invalid_type_error: "Nama barang tidak diketahui" 
  }).min(1, "Nama barang tidak diketahui"),
  jumlah_barang: string()
    .min(1, "Jumlah barang harus diisi")
    .refine((val) => !isNaN(Number(val)), "Jumlah harus berupa angka")
    .refine((val) => Number(val) > 0, "Jumlah harus lebih dari 0"),
});

export const CreateUserSchema = object({
  name: string().min(1, "Nama harus diisi"),
  email: emailValidation,
  password: passwordValidation, 
  confirm_password: string().min(1, "Konfirmasi password harus diisi"),
  role: string().min(1, "Role harus dipilih"),
}).refine((data) => data.password === data.confirm_password, {
  path: ["confirm_password"],
  message: "Password tidak cocok",
});

export const UpdateUserSchema = object({
  id: string().min(1, "ID user harus ada"),
  name: string().min(1, "Nama harus diisi"),
  email: emailValidation, 
  role: string().min(1, "Role harus dipilih"),
  password: string()
    .optional()
    .refine((val) => {
      if (!val || val === "") return true;
      return val.length >= 8 && /[A-Z]/.test(val) && /[a-z]/.test(val) && /[0-9]/.test(val) && /[\W_]/.test(val);
    }, "Password baru tidak memenuhi syarat"),
  confirm_password: string().optional(),
}).refine((data) => {
  if (data.password && data.password !== "") {
    return data.password === data.confirm_password;
  }
  return true;
}, {
  path: ["confirm_password"],
  message: "Konfirmasi password tidak cocok",
});
export const PeminjamanSchema = object({
  nomor_ktp: string().length(16, "Nomor KTP harus 16 digit"),
  nama_peminjam: string().min(1, "Nama peminjam wajib diisi"),
  kategori_peminjam: string().min(1, "Kategori wajib dipilih"),
  no_telp: string().min(1, "Nomor telepon/WA wajib diisi"),
  alamat: string().min(1, "Alamat wajib diisi"),
  barang_id: coerce.number().min(1, "Data barang tidak dikenali"),
  jumlah: coerce.number().positive("Jumlah harus lebih dari 0"),
  tanggal_pinjam: string().min(1, "Tanggal wajib diisi"),
});