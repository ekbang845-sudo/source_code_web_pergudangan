"use server";

import {
  RegisterSchema,
  SignInSchema,
  CreateItemSchema,
  AddStockSchema,
  CreateUserSchema,
  UpdateUserSchema,
} from "./zod";
import { prisma } from "./prisma";
import { hashSync } from "bcrypt-ts";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { signIn, signOut, auth } from "@/auth"; 
import { AuthError } from "next-auth";
import { z } from "zod"; 

// --- TYPE DEFINITION (Agar Sinkron dengan Client) ---
export type ActionState = {
  message: string;
  error?: Record<string, string[]>;
  success: boolean;
};

// --- LOGIN & REGISTER ---

export const signInAction = async (prevState: unknown, formData: FormData) => {
  const validateFields = SignInSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validateFields.success) {
    return {
      message: "Username atau Password salah!",
      error: validateFields.error.flatten().fieldErrors,
      success: false
    };
  }

  const { email, password } = validateFields.data;

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/admin/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { message: "Email atau Password salah!", success: false };
        case "CallbackRouteError":
          // Coba ambil pesan error asli dari properti 'cause'
          const specificError = error.cause?.err?.message;
          
          if (specificError && specificError.startsWith("LOCKED_UNTIL=")) {
            return { message: specificError, success: false };
          }
          return { message: "Gagal Login! Akun bermasalah.", success: false };
        default:
          return { message: "Terjadi kesalahan pada server.", success: false };
      }
    }
    throw error;
  }
  return { message: "Login Berhasil", success: true };
};

export const signUpAction = async (prevState: unknown, formData: FormData) => {
  const validateFields = RegisterSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validateFields.success) {
    return {
      message: "Validasi Gagal",
      error: validateFields.error.flatten().fieldErrors,
      success: false
    };
  }

  const { name, email, password } = validateFields.data;
  const hashedPassword = hashSync(password, 10);

  try {
    await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: hashedPassword,
        role: "user",
      },
    });
  } catch (error) {
    return {
      message: "Tidak dapat membuat akun!",
      success: false
    };
  }

  redirect("/login");
};

export const logoutAction = async () => {
  await signOut({ redirectTo: "/login" });
};

// --- CRUD BARANG ---

export const createItemAction = async (
  prevState: unknown,
  formData: FormData
): Promise<ActionState> => {
  const session = await auth();
  if (!session?.user?.id) {
    return { message: "Anda harus login untuk melakukan ini!", success: false };
  }
  const userId = session.user.id;

  const validateFields = CreateItemSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validateFields.success) {
    return {
      message: "Data barang tidak valid",
      error: validateFields.error.flatten().fieldErrors,
      success: false
    };
  }

  const { nama_barang, stok_barang, satuan_barang } = validateFields.data;

  const existingItem = await prisma.data_barang.findFirst({
    where: {
      nama_barang: {
        equals: nama_barang,
        mode: "insensitive", // Biar "Kursi" == "kursi"
      },
      isDeleted: false, // Hanya cek barang yang aktif (tidak dihapus)
    },
  });

  if (existingItem) {
    return {
      message: "Gagal! Barang dengan nama tersebut sudah ada.",
      error: { nama_barang: ["Barang sudah ada, nama barang tidak boleh sama"] }, 
      success: false
    };
  }
  const periode = formData.get("periode");
  const is_stock_bulanan = periode === "Unreguler";
  const stokAwal = Number(stok_barang);
  const sumberInput = formData.get("sumber_barang") as string;
  const keteranganSumber = formData.get("keterangan_sumber") as string;
  
  let sumberFinal = "Stok Awal";
  if (sumberInput === "Pembelian") {
    sumberFinal = "Pembelian";
  } else if (sumberInput === "Pemberian") {
    sumberFinal = keteranganSumber ? `Pemberian dari ${keteranganSumber}` : "Pemberian";
  }
  else if (sumberInput === "Lainnya") {
    sumberFinal = keteranganSumber ? `${keteranganSumber}` : "Lainnya";
  }
  if ((sumberInput === "Pemberian" || sumberInput === "Lainnya") && !keteranganSumber) {
    return {
      success: false,
      message: "Data belum lengkap!",
      error: {
        keterangan_sumber: [`Keterangan ${sumberInput} wajib diisi!`]
      }
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const existingSatuan = await tx.satuan.findUnique({
        where: { nama: satuan_barang }
      });

      if (!existingSatuan) {
        await tx.satuan.create({
          data: { nama: satuan_barang }
        });
      }

      const newItem = await tx.data_barang.create({
        data: {
          nama_barang,
          stok_barang: stokAwal,
          satuan_barang, 
          is_stock_bulanan,
          createdById: userId,
          updatedById: userId,
        },
      });

      if (stokAwal > 0) {
        await tx.data_barang_masuk.create({
          data: {
            id_barang: newItem.id_barang,
            jumlah_barang: stokAwal,
            tanggal_masuk: new Date(),
            sumber_barang: sumberFinal,
          },
        });
      }
    });
    await createAuditLog("CREATE", "Data Barang", nama_barang); 
    revalidatePath("/admin/dashboard/data-barang");
    revalidatePath("/admin/dashboard/barang-masuk");
    revalidatePath("/admin/dashboard/barang-keluar");
    revalidatePath("/admin/dashboard/pinjam-barang");
    return { message: "Barang berhasil ditambahkan!", success: true };
  } catch (error) {
    console.error("Error creating item:", error);
    return {
      message: "Gagal menambahkan barang!",
      success: false
    };
  }
};

export const updateItemAction = async (
  id_barang: number,
  prevState: unknown,
  formData: FormData
): Promise<ActionState> => {
  const session = await auth();
  if (!session?.user?.id) {
    return { message: "Unauthorized", success: false };
  }
  const userId = session.user.id;

  const validateFields = CreateItemSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validateFields.success) {
    return {
      message: "Data tidak valid",
      error: validateFields.error.flatten().fieldErrors,
      success: false
    };
  }

  const { nama_barang, stok_barang, satuan_barang } = validateFields.data;
  const is_stock_bulanan = formData.get("is_stock_bulanan") === "on";
  const stokBaru = Number(stok_barang);

  const existingItem = await prisma.data_barang.findFirst({
    where: {
      nama_barang: {
        equals: nama_barang,
        mode: "insensitive",
      },
      isDeleted: false,
      NOT: {
        id_barang: id_barang 
      }
    },
  });

  if (existingItem) {
    return {
      message: "Gagal update! Nama barang sudah digunakan.",
      error: { nama_barang: ["Nama barang tidak boleh sama"] },
      success: false
    };
  }

  try {
    if (stokBaru === 0) {
      const countMasuk = await prisma.data_barang_masuk.count({
        where: { id_barang, isDeleted: false },
      });

      const countKeluar = await prisma.data_barang_keluar.count({
        where: { id_barang, isDeleted: false },
      });

      if (countMasuk > 0 || countKeluar > 0) {
        return {
          message: "Gagal update stok!",
          success: false,
          error: {
            stok_barang: ["Stok tidak bisa jadi 0 karena barang sudah memiliki riwayat transaksi."]
          }
        };
      }
    }
    const existingItem = await prisma.data_barang.findUnique({
      where: { id_barang },
    });

    if (!existingItem) {
      return { message: "Barang tidak ditemukan!", success: false };
    }
    const namaChanged = existingItem.nama_barang !== nama_barang;
    const isStokChanged = existingItem.stok_barang !== Number(stok_barang);
    const isSatuanChanged = existingItem.satuan_barang !== satuan_barang;
    const isBulananChanged = existingItem.is_stock_bulanan !== is_stock_bulanan;

    // Jika TIDAK ADA yang berubah
    if (!namaChanged && !isStokChanged && !isSatuanChanged && !isBulananChanged) {
      return { 
        message: "Data belum ada perubahan.", 
        success: false // Frontend akan menampilkan Toast merah tanpa reset form
      };
    }
    await prisma.data_barang.update({
      where: { id_barang },
      data: {
        nama_barang,
        stok_barang: Number(stok_barang),
        satuan_barang,
        is_stock_bulanan,
        updatedById: userId,
      },
    });
    await createAuditLog("UPDATE", "Data Barang", nama_barang);
    revalidatePath("/admin/dashboard/data-barang");
    revalidatePath("/admin/dashboard/barang-masuk");
    revalidatePath("/admin/dashboard/barang-keluar");
    revalidatePath("/admin/dashboard/pinjam-barang");
    return { message: "Barang berhasil diupdate!", success: true };
  } catch (error) {
    return {
      message: "Gagal mengupdate barang!",
      success: false
    };
  }
};

export const deleteItemAction = async (id_barang: number) => {
  const session = await auth();
  if (!session?.user?.id) return { message: "Unauthorized", success: false };
  const userId = session.user.id;

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Soft Delete Barang Utama
      const item = await tx.data_barang.update({
        where: { id_barang },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedById: userId,
        },
      });

      // 2. Soft Delete Otomatis Data Masuk Terkait
      await tx.data_barang_masuk.updateMany({
        where: { id_barang },
        data: { isDeleted: true },
      });

      // 3. Soft Delete Otomatis Data Keluar Terkait
      await tx.data_barang_keluar.updateMany({
        where: { id_barang },
        data: { isDeleted: true },
      });

      await tx.peminjaman.updateMany({
        where: { id_barang, isDeleted: false },
        data: { isDeleted: true, deletedAt: new Date() },
      });

      // 4. Catat Log
      await createAuditLog("DELETE (Trash)", "Data Barang", item.nama_barang);
    });

    revalidatePath("/admin/dashboard/data-barang");
    revalidatePath("/admin/dashboard/barang-masuk");
    revalidatePath("/admin/dashboard/barang-keluar");
    revalidatePath("/admin/dashboard/pinjam-barang");
    return { message: "Barang dipindahkan ke kotak sampah", success: true };
  } catch (error) {
    return { message: "Gagal menghapus barang", success: false };
  }
};

// --- STOCK, PEMINJAMAN, USER ---

export const addStockAction = async (
  prevState: unknown,
  formData: FormData
) => {
  const validateFields = AddStockSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validateFields.success) {
    return {
      message: "",
      error: validateFields.error.flatten().fieldErrors,
      success: false
    };
  }

  const { id_barang, jumlah_barang } = validateFields.data;
  const jumlah = Number(jumlah_barang);
  const id = Number(id_barang);
  const sumberInput = formData.get("sumber_barang") as string;
  const keteranganSumber = formData.get("keterangan_sumber") as string;
  let sumberFinal = "Penambahan Stok"; 
  if (sumberInput === "Pembelian") {
    sumberFinal = "Pembelian";
  } else if (sumberInput === "Pemberian") {
    sumberFinal = keteranganSumber ? `Pemberian dari ${keteranganSumber}` : "Pemberian";
  } else if (sumberInput === "Lainnya") {
    sumberFinal = keteranganSumber ? `${keteranganSumber}` : "Lainnya";
  }
  if ((sumberInput === "Pemberian" || sumberInput === "Lainnya") && !keteranganSumber) {
    return {
      success: false,
      message: "Data belum lengkap!",
      error: {
        keterangan_sumber: [`Keterangan ${sumberInput} wajib diisi!`]
      }
    };
  }
  try { 
    await prisma.$transaction(async (tx) => {
      await tx.data_barang.update({
        where: { id_barang: id },
        data: {
          stok_barang: {
            increment: jumlah,
          },
        },
      });

      await tx.data_barang_masuk.create({
        data: {
          id_barang: id,
          jumlah_barang: jumlah,
          sumber_barang: sumberFinal,
          tanggal_masuk: new Date(),
        },
      });
    });
    const barang = await prisma.data_barang.findUnique({ where: { id_barang: id } });
    await createAuditLog("UPDATE (Stok)", "Data Barang", barang?.nama_barang || `ID: ${id}`);
    revalidatePath("/admin/dashboard/barang-masuk");
  } catch (error) {
    return {
      message: "Gagal menambahkan stok!",
      success: false
    };
  }

  revalidatePath("/admin/dashboard/barang-masuk");
  revalidatePath("/admin/dashboard/data-barang");
  return { message: "Stok berhasil ditambahkan!", success: true };
};

export const deletePeminjamanAction = async (id_peminjaman: number) => {
  try {
    const peminjaman = await prisma.peminjaman.findUnique({ where: { id_peminjaman } });
    if (!peminjaman) return { message: "Data tidak ditemukan!", success: false };

    await prisma.$transaction(async (tx) => {
      // Fitur asli: Jika belum kembali, stok barang dikembalikan dulu
      if (peminjaman.status_peminjaman !== "Dikembalikan") {
        await tx.data_barang.update({
          where: { id_barang: peminjaman.id_barang },
          data: { stok_barang: { increment: peminjaman.jumlah_peminjaman } },
        });
      }
      // Perintah Hapus diubah jadi Soft Delete
      await tx.peminjaman.update({
        where: { id_peminjaman },
        data: { isDeleted: true, deletedAt: new Date() },
      });
      await tx.data_barang_keluar.updateMany({
        where: { 
          id_peminjaman: id_peminjaman,
          isDeleted: false
        },
        data: { isDeleted: true }
      });

      // D. Soft Delete Riwayat Masuk (Jika sudah pernah dikembalikan)
      await tx.data_barang_masuk.updateMany({
        where: { 
          id_peminjaman: id_peminjaman,
          isDeleted: false
        },
        data: { isDeleted: true }
      });
    });
    
    await createAuditLog("DELETE (Trash)", "data Peminjaman", `Peminjam: ${peminjaman.nama_peminjam}`);
  } catch (error) {
    return { message: "Gagal menghapus!", success: false };
  }
  revalidatePath("/admin/dashboard/pinjam-barang");
  revalidatePath("/admin/dashboard/data-barang");
  revalidatePath("/admin/dashboard/barang-masuk");
  revalidatePath("/admin/dashboard/barang-keluar");
  return { message: "Data berhasil dihapus!", success: true };
};

export const createPeminjamanAction = async (
  prevState: any,
  formData: FormData
) => {
  // Validasi Manual karena schema peminjaman belum ada di zod.ts user
  const nomor_ktp = formData.get("nomor_ktp") as string;
  const nama_peminjam = formData.get("nama_peminjam") as string;
  const no_telp = formData.get("no_telp") as string;
  const alamat = formData.get("alamat") as string;
  const barang_id = formData.get("barang_id") as string;
  const jumlah = formData.get("jumlah") as string;
  const tanggal_pinjam = formData.get("tanggal_pinjam") as string;

  const errors: Record<string, string[]> = {};
  if (!nomor_ktp) {
    errors.nomor_ktp = ["Nomor KTP wajib diisi"];
  } else if (nomor_ktp.length !== 16) {
    errors.nomor_ktp = ["Nomor KTP harus 16 digit"];
  }
  if (!nama_peminjam) errors.nama_peminjam = ["Nama peminjam wajib diisi"];
  if (!no_telp) errors.no_telp = ["Data nomor telepon/WA wajib diisi"];
  if (!alamat) {
    errors.alamat = ["Data alamat wajib diisi"];
  }
  if (!barang_id) {
    errors.barang_id = ["Data barang tidak dikenali"];
  }
  if (!jumlah || Number(jumlah) <= 0) errors.jumlah = ["Jumlah harus lebih dari 0"];
  if (!tanggal_pinjam) errors.tanggal_pinjam = ["Tanggal wajib diisi"];

  if (Object.keys(errors).length > 0) {
     return { message: "Data tidak valid", error: errors, success: false };
  }

  // Lanjutkan proses jika valid...
  const kategori_peminjam = formData.get("kategori_peminjam") as string;
  const jumlahInt = parseInt(jumlah);
  const barangIdInt = parseInt(barang_id);

  try {
    const barang = await prisma.data_barang.findUnique({
      where: { id_barang: barangIdInt },
    });
    await createAuditLog("CREATE", "data Peminjaman", `data Peminjam: ${nama_peminjam}`);

    if (!barang) {
      return { message: "Barang tidak ditemukan!", success: false };
    }

    if (barang.stok_barang < jumlahInt) {
      return {
        message: `Stok tidak cukup! Sisa stok: ${barang.stok_barang}`,
        success: false,
      };
    }

    await prisma.$transaction(async (tx) => {
      const updatedBarang = await tx.data_barang.update({
        where: { id_barang: barangIdInt },
        data: {
          stok_barang: {
            decrement: jumlahInt,
          },
        },
      });
      if (updatedBarang.stok_barang < 0) {
        throw new Error("Stok tidak cukup!");
      }
      const newPeminjaman = await tx.peminjaman.create({
        data: {
          nomor_ktp,
          kategori_peminjam,
          nama_peminjam,
          no_telepon: no_telp,
          alamat,
          id_barang: barangIdInt,
          jumlah_peminjaman: jumlahInt,
          tanggal_peminjaman: new Date(tanggal_pinjam),
          status_peminjaman: "Belum Dikembalikan",
        },
      });
      await tx.data_barang_keluar.create({
        data: {
          id_barang: barangIdInt,
          id_peminjaman: newPeminjaman.id_peminjaman,
          jumlah_keluar: jumlahInt,
          tanggal_keluar: new Date(tanggal_pinjam),
          keterangan: `Dipinjam oleh ${nama_peminjam} (${kategori_peminjam})`,
        },
      });
    });
  } catch (error) {
    console.error("Error creating peminjaman:", error);
    return { message: "Gagal membuat peminjaman!", success: false };
  }

  revalidatePath("/admin/dashboard/pinjam-barang");
  revalidatePath("/admin/dashboard/data-barang");
  revalidatePath("/admin/dashboard/barang-keluar");
  return { message: "Peminjaman berhasil dibuat!", success: true };
};

export const returnPeminjamanAction = async (id_peminjaman: number) => {
  try {
    const peminjaman = await prisma.peminjaman.findUnique({
      where: { id_peminjaman },
    });

    if (!peminjaman) {
      return { message: "Data peminjaman tidak ditemukan!", success: false };
    }

    if (peminjaman.status_peminjaman === "Dikembalikan") {
      return {
        message: "Barang sudah dikembalikan sebelumnya!",
        success: false,
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.peminjaman.update({
        where: { id_peminjaman },
        data: {
          status_peminjaman: "Dikembalikan",
        },
      });

      await tx.data_barang.update({
        where: { id_barang: peminjaman.id_barang },
        data: {
          stok_barang: {
            increment: peminjaman.jumlah_peminjaman,
          },
        },
      });
      await tx.data_barang_masuk.create({
        data: {
          id_barang: peminjaman.id_barang,
          id_peminjaman: id_peminjaman,
          jumlah_barang: peminjaman.jumlah_peminjaman,
          tanggal_masuk: new Date(),
          sumber_barang: `Pengembalian barang oleh ${peminjaman.nama_peminjam} (${peminjaman.kategori_peminjam})`,
        },
      });
    });
    await createAuditLog("UPDATE (Kembali)", "Peminjaman", `Peminjam: ${peminjaman.nama_peminjam}`);
  } catch (error) {
    console.error("Error returning peminjaman:", error);
    return { message: "Gagal mengembalikan barang!", success: false };
  }

  revalidatePath("/admin/dashboard/pinjam-barang");
  revalidatePath("/admin/dashboard/data-barang");
  revalidatePath("/admin/dashboard/barang-masuk");
  return { message: "Barang berhasil dikembalikan!", success: true };
};

// --- UPDATE USER ACTION ---
export const createUserAction = async (prevState: any, formData: FormData) => {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return { success: false, message: "Unauthorized" };
  }
  const validateFields = CreateUserSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validateFields.success) {
    return {
      message: "Data tidak valid!",
      error: validateFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { name, email, password, role: roleInput } = validateFields.data;

  let role: "user" | "admin" = "user";
  if (roleInput === "Admin") {
    role = "admin";
  } else if (roleInput === "Staff Gudang") {
    role = "user";
  }

  const hashedPassword = hashSync(password, 10);

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });
    await createAuditLog("CREATE", "Manajemen Akun", `data akun User: ${name}`);
  } catch (error: any) {
    console.error("Error creating user:", error);
    if (error.code === "P2002") {
      return {
        message: "Email sudah terdaftar! Gunakan email lain.",
        success: false,
      };
    }
    return {
      message: "Gagal membuat user! Terjadi kesalahan server.",
      success: false,
    };
  }

  revalidatePath("/admin/dashboard/manajemen-akun");
  return { message: "User berhasil dibuat!", success: true };
};

export const updateUserAction = async (prevState: any, formData: FormData): Promise<ActionState> => {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return { success: false, message: "Unauthorized", error: {} };
  }
  
  const validateFields = UpdateUserSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validateFields.success) {
    return {
      message: "Validasi Gagal",
      error: validateFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { id, name, email, role: roleInput, password } = validateFields.data;

  let role: "user" | "admin" = "user";
  if (roleInput === "Admin") {
    role = "admin";
  } else if (roleInput === "Staff Gudang") {
    role = "user";
  }

  try {
    const currentUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!currentUser) {
      return { message: "User tidak ditemukan!", success: false };
    }
    
    const isNameChanged = currentUser.name !== name;
    const isEmailChanged = currentUser.email !== email;
    const isRoleChanged = currentUser.role !== role;
    const isPasswordFilled = password && password.length >= 8; 

    if (!isNameChanged && !isEmailChanged && !isRoleChanged && !isPasswordFilled) {
      return {
        message: "Data belum ada perubahan.", 
        success: false, 
      };
    }
    if (isEmailChanged) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: email,
          NOT: {
            id: id
          }
        }
      });

      if (existingUser) {
        return {
          message: "Gagal! Email tersebut sudah digunakan akun lain.",
          error: { email: ["Email sudah terdaftar"] }, 
          success: false
        };
      }
    }

    const updateData: any = {
      name,
      email, 
      role,
    };

    if (password && password.length >= 8) { 
      updateData.password = hashSync(password, 10);
    }

    // 3. Eksekusi Update
    await prisma.user.update({
      where: { id },
      data: updateData,
    });
    await createAuditLog("UPDATE", "Manajemen Akun", `data akun User: ${name}`);

    if (password && password.length >= 8) {
      await prisma.user.update({
        where: { id },
        data: { tokenVersion: { increment: 1 } },
      });
    }

  } catch (error) {
    console.error("Error updating user:", error);
    return {
      message: "Gagal mengupdate user!",
      success: false,
    };
  }

  revalidatePath("/admin/dashboard/manajemen-akun");
  return { message: "User berhasil diupdate!", success: true };
};

export const getDaftarSatuan = async () => {
  try {
    const data = await prisma.satuan.findMany({
      orderBy: { nama: 'asc' }
    });
    return data;
  } catch (error) {
    return [];
  }
};

export const saveSatuanAction = async (nama: string) => {
  try {
    // Normalisasi: Huruf besar di awal, sisanya kecil (contoh: "Pcs", "Lusin")
    const normalizedNama = nama.charAt(0).toUpperCase() + nama.slice(1).toLowerCase();

    const existing = await prisma.satuan.findUnique({
      where: { nama: normalizedNama },
    });

    if (existing) return { success: false, message: "Satuan sudah ada!" };

    await prisma.satuan.create({
      data: { nama: normalizedNama },
    });

    return { success: true, message: "Satuan berhasil disimpan" };
  } catch (error) {
    return { success: false, message: "Gagal menyimpan satuan" };
  }
};

export const deleteSatuanAction = async (nama: string) => {
  try {
    const barangCount = await prisma.data_barang.count({
      where: { 
        satuan_barang: nama,
        isDeleted: false // <-- Tambahkan ini
      },
    });

    if (barangCount > 0) {
      return { 
        success: false, 
        message: `Gagal! Satuan "${nama}" sedang dipakai oleh ${barangCount} barang aktif.` 
      };
    }

    await prisma.satuan.delete({ where: { nama } });
    return { success: true, message: "Satuan berhasil dihapus" };
  } catch (error) {
    return { success: false, message: "Terjadi kesalahan sistem" };
  }
};

// --- UPDATE BARANG MASUK & KELUAR ---

export const updateBarangMasukAction = async (
  id_barang_masuk: number,
  prevState: unknown,
  formData: FormData
): Promise<ActionState> => {
  const jumlah_baru = Number(formData.get("jumlah_barang"));
  const sumberInput = formData.get("sumber_barang") as string;
  const keteranganSumber = formData.get("keterangan_sumber") as string;

  // Validasi Manual
  const errors: Record<string, string[]> = {};
  if (jumlah_baru <= 0) errors.jumlah_barang = ["Jumlah harus lebih dari 0"];
  if (!sumberInput) errors.sumber_barang = ["Sumber wajib dipilih"];

  if (Object.keys(errors).length > 0) {
     return { message: "Data tidak valid", error: errors, success: false };
  }

  let sumberFinal = "Stok Awal"; 
  
  if (sumberInput === "Pembelian") {
    sumberFinal = "Pembelian";
  } else if (sumberInput === "Pemberian") {
    sumberFinal = keteranganSumber ? `Pemberian dari ${keteranganSumber}` : "Pemberian";
  } else if (sumberInput === "Lainnya") {
    sumberFinal = keteranganSumber ? `${keteranganSumber}` : "Lainnya";
  } else {
    sumberFinal = keteranganSumber || sumberInput || "Lainnya";
  }
  if ((sumberInput === "Pemberian" || sumberInput === "Lainnya") && !keteranganSumber) {
    return {
      success: false,
      message: "Data belum lengkap!",
      error: {
        keterangan_sumber: [`Keterangan ${sumberInput} wajib diisi!`]
      }
    };
  }

  try {
    const barangMasuk = await prisma.data_barang_masuk.findUnique({
      where: { id_barang_masuk },
      include: { data_barang: true },
    });

    if (!barangMasuk) {
      return { message: "Data barang masuk tidak ditemukan!", success: false };
    }
    
    const isJumlahChanged = barangMasuk.jumlah_barang !== jumlah_baru;
    const isSumberChanged = barangMasuk.sumber_barang !== sumberFinal;

    // Jika TIDAK ADA yang berubah
    if (!isJumlahChanged && !isSumberChanged) {
      return { 
        message: "Data belum ada perubahan.", 
        success: false // Akan memicu Toast Error di frontend & Modal tetap terbuka
      };
    }
    const selisih = jumlah_baru - barangMasuk.jumlah_barang;

    if (selisih < 0) {
      const barang = await prisma.data_barang.findUnique({
        where: { id_barang: barangMasuk.id_barang },
      });

      if (!barang || barang.stok_barang + selisih < 0) {
        return {
          message:
            "Gagal update! Stok di gudang tidak mencukupi untuk pengurangan ini.",
          success: false,
        };
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.data_barang_masuk.update({
        where: { id_barang_masuk },
        data: { 
          jumlah_barang: jumlah_baru,
          sumber_barang: sumberFinal
        },
      });

      await tx.data_barang.update({
        where: { id_barang: barangMasuk.id_barang },
        data: {
          stok_barang: {
            increment: selisih,
          },
        },
      });
    });
    if (barangMasuk) {
      await createAuditLog("UPDATE (Masuk)", "Barang Masuk", `Edit data: barang ${barangMasuk.data_barang.nama_barang}`);
    }
  } catch (error) {
    console.error("Error updating barang masuk:", error);
    return { message: "Gagal mengupdate data barang masuk!", success: false };
  }

  revalidatePath("/admin/dashboard/barang-masuk");
  revalidatePath("/admin/dashboard/data-barang");
  return { message: "Data barang masuk berhasil diupdate!", success: true };
};

export const updateBarangKeluarAction = async (
  id_barang_keluar: number,
  prevState: unknown,
  formData: FormData
): Promise<ActionState> => {
  
  // Validasi Input Manual
  const id_barang_baru = parseInt(formData.get("id_barang") as string);
  const tanggal_keluar = formData.get("tanggal_keluar") as string;
  const jumlah_baru = parseInt(formData.get("jumlah_keluar") as string);
  const keterangan = formData.get("keterangan") as string;
  const detailKeterangan = formData.get("detail_keterangan") as string;

  const errors: Record<string, string[]> = {};
  if (!id_barang_baru) errors.id_barang = ["Barang wajib dipilih"];
  if (!tanggal_keluar) errors.tanggal_keluar = ["Tanggal wajib diisi"];
  if (!jumlah_baru || jumlah_baru <= 0) errors.jumlah_keluar = ["Jumlah harus > 0"];
  if (!keterangan) errors.keterangan = ["Keterangan wajib dipilih"];

  if (Object.keys(errors).length > 0) {
    return { message: "Lengkapi data dengan benar", error: errors, success: false };
  }

  // Logika Penggabungan String Keterangan
  let keteranganFinal = keterangan;
  if (keterangan === "Dipakai Habis") {
    keteranganFinal = detailKeterangan ? `Dipakai untuk ${detailKeterangan}` : "Dipakai Habis";
  } else if (keterangan === "Diberikan") {
    keteranganFinal = detailKeterangan ? `Diberikan kepada ${detailKeterangan}` : "Diberikan";
  } else if (keterangan === "Lainnya") {
    keteranganFinal = detailKeterangan ? `${detailKeterangan}` : "Lainnya";
  }
  if ((keterangan === "Diberikan" || keterangan === "Lainnya" || keterangan === "Dipakai Habis") && !detailKeterangan) {
    return {
      success: false,
      message: "Data belum lengkap!",
      error: {
        detail_keterangan: [`Keterangan ${keterangan} wajib diisi!`]
      }
    };
  }

  try {
    // 1. Ambil Data Lama sebelum diupdate
    const dataLama = await prisma.data_barang_keluar.findUnique({
      where: { id_barang_keluar },
      include: { data_barang: true },
    });

    if (!dataLama) {
      return { message: "Data tidak ditemukan", success: false };
    }
    // a. Cek ID Barang
    const isBarangChanged = dataLama.id_barang !== id_barang_baru;
    
    // b. Cek Jumlah
    const isJumlahChanged = dataLama.jumlah_keluar !== jumlah_baru;
    
    // c. Cek Keterangan (Bandingkan hasil final stringnya)
    const isKeteranganChanged = dataLama.keterangan !== keteranganFinal;

    // d. Cek Tanggal (Bandingkan string tanggal YYYY-MM-DD)
    // Kita ambil bagian tanggalnya saja dari data lama di database
    const tanggalLamaString = dataLama.tanggal_keluar.toISOString().split('T')[0];
    const isTanggalChanged = tanggalLamaString !== tanggal_keluar;

    // JIKA TIDAK ADA YANG BERUBAH
    if (!isBarangChanged && !isJumlahChanged && !isKeteranganChanged && !isTanggalChanged) {
      return { 
        message: "Data belum ada perubahan.", 
        success: false // Ini akan memicu Toast Error di frontend & Modal tidak tertutup
      };
    }

    const id_barang_lama = dataLama.id_barang;
    const jumlah_lama = dataLama.jumlah_keluar;

    // 2. Cek apakah Barang Berubah?
    if (id_barang_lama !== id_barang_baru) {
      // --- SKENARIO GANTI BARANG ---
      
      // Cek stok barang baru dulu, cukup gak?
      const barangBaru = await prisma.data_barang.findUnique({ where: { id_barang: id_barang_baru }});
      if (!barangBaru || barangBaru.stok_barang < jumlah_baru) {
          return { 
            message: `Gagal: Stok barang pengganti tidak cukup (Sisa: ${barangBaru?.stok_barang || 0})`, 
            success: false 
          };
      }

      await prisma.$transaction(async (tx) => {
        // A. Kembalikan stok ke barang lama
        await tx.data_barang.update({
          where: { id_barang: id_barang_lama },
          data: { stok_barang: { increment: jumlah_lama } }
        });

        // B. Kurangi stok dari barang baru
        await tx.data_barang.update({
          where: { id_barang: id_barang_baru },
          data: { stok_barang: { decrement: jumlah_baru } }
        });

        // C. Update data transaksi
        await tx.data_barang_keluar.update({
          where: { id_barang_keluar },
          data: {
            id_barang: id_barang_baru,
            tanggal_keluar: new Date(tanggal_keluar),
            jumlah_keluar: jumlah_baru,
            keterangan: keteranganFinal, 
          },
        });
      });
      await createAuditLog("UPDATE (Keluar)", "Barang Keluar", `Edit data: barang ${dataLama?.data_barang.nama_barang}`);

    } else {
      // --- SKENARIO BARANG SAMA (Hanya Update Jumlah/Info Lain) ---
      
      const selisih = jumlah_baru - jumlah_lama;

      // Jika jumlah bertambah, cek stok gudang lagi
      if (selisih > 0) {
          const barangGudang = await prisma.data_barang.findUnique({ where: { id_barang: id_barang_baru }});
          if (!barangGudang || barangGudang.stok_barang < selisih) {
              return { message: "Gagal update: Stok gudang tidak cukup untuk penambahan ini", success: false };
          }
      }

      await prisma.$transaction(async (tx) => {
        // Update transaksi
        await tx.data_barang_keluar.update({
          where: { id_barang_keluar },
          data: {
            tanggal_keluar: new Date(tanggal_keluar),
            jumlah_keluar: jumlah_baru,
            keterangan: keteranganFinal, 
          },
        });

        // Update stok sesuai selisih (jika selisih 0, tidak perlu update stok)
        if (selisih !== 0) {
          await tx.data_barang.update({
            where: { id_barang: id_barang_baru },
            data: {
              stok_barang: { decrement: selisih }, // decrement positif = kurangi stok, decrement negatif = tambah stok
            },
          });
        }
      });
    }

    revalidatePath("/admin/dashboard/barang-keluar");
    revalidatePath("/admin/dashboard/data-barang");
    
    return { message: "Berhasil update data barang keluar", success: true }; 

  } catch (error) {
    console.error("Error update barang keluar:", error);
    return { message: "Gagal memperbarui data", success: false };
  }
};

export const deleteBarangMasukAction = async (id_barang_masuk: number) => {
  try {
    const barangMasuk = await prisma.data_barang_masuk.findUnique({
      where: { id_barang_masuk },
      include: { data_barang: true },
    });

    if (!barangMasuk) return { message: "Data tidak ditemukan!", success: false };
    if (barangMasuk.id_peminjaman) { // 
      return { 
        success: false, 
        message: "Gagal! Data ini berasal dari pengembalian pinjaman. Silakan kelola melalui menu Pinjam Barang agar data tetap sinkron." 
      };
    }

    const barang = await prisma.data_barang.findUnique({
      where: { id_barang: barangMasuk.id_barang },
    });

    // Fitur asli: Validasi stok tetap berjalan
    if (!barang || barang.stok_barang < barangMasuk.jumlah_barang) {
      return { message: "Gagal hapus! Stok gudang kurang.", success: false };
    }

    await prisma.$transaction(async (tx) => {
      // Perintah Hapus diubah jadi Soft Delete
      await tx.data_barang_masuk.update({
        where: { id_barang_masuk },
        data: { isDeleted: true, deletedAt: new Date() },
      });

      // Fitur asli: Stok tetap dikurangi karena barang masuk dibatalkan
      await tx.data_barang.update({
        where: { id_barang: barangMasuk.id_barang },
        data: { stok_barang: { decrement: barangMasuk.jumlah_barang } },
      });
    });

    await createAuditLog("DELETE (Masuk)", "Barang Masuk", `Hapus data: barang ${barangMasuk.data_barang.nama_barang}`);
  } catch (error) {
    return { message: "Gagal menghapus data!", success: false };
  }
  revalidatePath("/admin/dashboard/barang-masuk");
  revalidatePath("/admin/dashboard/data-barang");
  return { message: "Data berhasil dipindahkan ke sampah!", success: true };
};

export const updatePeminjamanAction = async (
  id_peminjaman: number,
  prevState: unknown,
  formData: FormData
): Promise<ActionState> => {
  // 1. Ambil Data dari Form
  const nomor_ktp = formData.get("nomor_ktp") as string;
  const nama_peminjam = formData.get("nama_peminjam") as string;
  const kategori_peminjam = formData.get("kategori_peminjam") as string;
  const nama_peminjam_baru = formData.get("nama_peminjam") as string;
  const kategori_peminjam_baru = formData.get("kategori_peminjam") as string;
  const no_telepon = formData.get("no_telepon") as string;
  const alamat = formData.get("alamat") as string;
  const tanggal_pinjam_str = formData.get("tanggal_peminjaman") as string;
  
  // Konversi jumlah ke number
  const jumlah_baru = parseInt(formData.get("jumlah_peminjaman") as string);

  // 2. Validasi Manual Sederhana
  const errors: Record<string, string[]> = {};
  if (!nomor_ktp) {
    errors.nomor_ktp = ["Nomor KTP wajib diisi"];
  } else if (nomor_ktp.length !== 16) {
    errors.nomor_ktp = ["Nomor KTP harus 16 digit"];
  }
  if (!nama_peminjam) errors.nama_peminjam = ["Nama peminjam wajib diisi"];
  if (!no_telepon) errors.no_telepon = ["Nomor telepon wajib diisi"];
  if (!alamat) errors.alamat = ["Alamat wajib diisi"];
  if (!tanggal_pinjam_str) errors.tanggal_peminjaman = ["Tanggal wajib diisi"];
  if (isNaN(jumlah_baru) || jumlah_baru <= 0) errors.jumlah_peminjaman = ["Jumlah harus lebih dari 0"];

  if (Object.keys(errors).length > 0) {
    return { message: "Data tidak valid", error: errors, success: false };
  }

  try {
    // 3. Ambil data peminjaman lama untuk cek stok
    const dataLama = await prisma.peminjaman.findUnique({
      where: { id_peminjaman },
      include: { data_barang: true }
    });

    if (!dataLama) return { message: "Data tidak ditemukan", success: false };
    
    const nama_lama = dataLama.nama_peminjam;
    const kategori_lama = dataLama.kategori_peminjam;
    const isKtpChanged = dataLama.nomor_ktp !== nomor_ktp;
    const isNamaChanged = dataLama.nama_peminjam !== nama_peminjam_baru;
    const isKategoriChanged = dataLama.kategori_peminjam !== kategori_peminjam;
    const isTeleponChanged = dataLama.no_telepon !== no_telepon;
    const isAlamatChanged = dataLama.alamat !== alamat;
    const isJumlahChanged = dataLama.jumlah_peminjaman !== jumlah_baru;

    // Khusus Tanggal: Bandingkan Time Stamp agar akurat
    const dateBaru = new Date(tanggal_pinjam_str).getTime();
    const dateLama = dataLama.tanggal_peminjaman ? new Date(dataLama.tanggal_peminjaman).getTime() : 0;
    const isTanggalChanged = dateBaru !== dateLama;

    // Jika TIDAK ADA satu pun yang berubah
    if (
      !isKtpChanged && 
      !isNamaChanged && 
      !isKategoriChanged && 
      !isTeleponChanged && 
      !isAlamatChanged && 
      !isJumlahChanged && 
      !isTanggalChanged
    ) {
      return { 
        message: "Data belum ada perubahan.", 
        success: false // Ini akan memicu Toast Error di frontend & Modal tidak tertutup
      };
    }
    // 4. Hitung selisih jumlah jika ada perubahan
    const selisih = jumlah_baru - dataLama.jumlah_peminjaman;

    // Jika jumlah pinjam bertambah, cek apakah stok gudang cukup
    if (selisih > 0) {
      if (dataLama.data_barang.stok_barang < selisih) {
        return { 
          message: `Gagal: Stok gudang tidak cukup. Sisa stok: ${dataLama.data_barang.stok_barang}`, 
          success: false 
        };
      }
    }

    // 5. Update Database Transaction
    await prisma.$transaction(async (tx) => {
      // Update data peminjaman
      await tx.peminjaman.update({
        where: { id_peminjaman },
        data: {
          nama_peminjam,
          kategori_peminjam,
          no_telepon,
          alamat,
          jumlah_peminjaman: jumlah_baru,
          tanggal_peminjaman: new Date(tanggal_pinjam_str),
        },
      });

      // Update stok barang sesuai selisih
      if (selisih !== 0) {
        await tx.data_barang.update({
          where: { id_barang: dataLama.id_barang },
          data: {
            stok_barang: {
              decrement: selisih, 
            },
          },
        });
      }
      await tx.data_barang_keluar.updateMany({
        where: {
          id_peminjaman: id_peminjaman, 
          isDeleted: false
        },
        data: {
          jumlah_keluar: jumlah_baru,
          tanggal_keluar: new Date(tanggal_pinjam_str),
          keterangan: `Dipinjam oleh ${nama_peminjam_baru} (${kategori_peminjam_baru})`
        }
      });

      if (dataLama.status_peminjaman === "Dikembalikan") {
        await tx.data_barang_masuk.updateMany({
          where: {
            id_peminjaman: id_peminjaman,
            id_barang: dataLama.id_barang,
            sumber_barang: `Pengembalian barang oleh ${nama_lama} (${kategori_lama})`,
            isDeleted: false
          },
          data: {
            jumlah_barang: jumlah_baru,
            sumber_barang: `Pengembalian barang oleh ${nama_peminjam_baru} (${kategori_peminjam_baru})`,
          }
        });
      }
    });
    await createAuditLog("UPDATE", "data Peminjaman", `Edit data Peminjam: ${nama_peminjam}`);

  } catch (error) {
    console.error("Error update peminjaman:", error);
    return { message: "Gagal memperbarui data peminjaman", success: false };
  }

  revalidatePath("/admin/dashboard/pinjam-barang");
  revalidatePath("/admin/dashboard/data-barang");
  revalidatePath("/admin/dashboard/barang-keluar");
  revalidatePath("/admin/dashboard/barang-masuk");
  return { message: "Data peminjaman berhasil diperbarui!", success: true };
};

export const createAuditLog = async (action: string, tableName: string, dataName: string) => {
  const session = await auth();
  if (!session?.user?.id) return;

  try {
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action,
        tableName,
        dataName,
      },
    });
  } catch (error) {
    console.error("Gagal mencatat log:", error);
  }
};

// Fungsi untuk mengambil riwayat (untuk tampilan modal)
export const getAuditLogs = async () => {
  return await prisma.auditLog.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take: 50, // Ambil 50 data terakhir saja agar ringan
  });
};


export const restoreBarangMasukAction = async (id_barang_masuk: number) => {
  try {
    const data = await prisma.data_barang_masuk.update({
      where: { id_barang_masuk },
      data: { isDeleted: false, deletedAt: null },
      include: { data_barang: true }
    });
    if (!data) return { success: false, message: "Data tidak ditemukan." };

    if (data.id_peminjaman) { 
      return { 
        success: false, 
        message: "Gagal! Data ini adalah bagian dari transaksi Peminjaman. Silakan pulihkan melalui menu Kotak Sampah Peminjaman." 
      };
    }

    // 2. CEK VALIDASI: Apakah Barang Induknya masih ada di sampah?
    if (data.data_barang.isDeleted) {
      return { 
        success: false, 
        message: `Gagal! Barang "${data.data_barang.nama_barang}" data barang tidak dikenali. Silakan pulihkan Data Barang terlebih dahulu.` 
      };
    }

    // 3. Jalankan proses restore jika lolos validasi
    await prisma.$transaction(async (tx) => {
      await tx.data_barang_masuk.update({
        where: { id_barang_masuk },
        data: { isDeleted: false, deletedAt: null },
      });
      
      // Kembalikan stok
      await tx.data_barang.update({
        where: { id_barang: data.id_barang },
        data: { stok_barang: { increment: data.jumlah_barang } }
      });
    });

    await createAuditLog("RESTORE", "Barang Masuk", `Kembalikan: ${data.data_barang.nama_barang}`);
    revalidatePath("/admin/dashboard/barang-masuk"); 
    revalidatePath("/admin/dashboard/data-barang");   
    revalidatePath("/admin/dashboard/trash");
    return { success: true, message: "Data berhasil dikembalikan!" };
  } catch (error) {
    return { success: false, message: "Gagal restore data." };
  }
};


export const restoreBarangKeluarAction = async (id_barang_keluar: number) => {
  try {
    // 1. Ambil data dulu (jangan update dulu)
    const transaction = await prisma.data_barang_keluar.findUnique({
      where: { id_barang_keluar },
      include: { data_barang: true }
    });

    if (!transaction) return { success: false, message: "Data tidak ditemukan." };

    if (transaction.id_peminjaman) { 
      return { 
        success: false, 
        message: "Gagal! Data ini terikat dengan Peminjaman. Silakan pulihkan melalui kategori Peminjaman di Kotak Sampah." 
      };
    }

    if (transaction.data_barang.isDeleted) {
      return { 
        success: false, 
        message: `Gagal! Barang "${transaction.data_barang.nama_barang}" data barang tidak dikenali. Silakan pulihkan Data Barang terlebih dahulu.` 
      };
    }

    // 2. CEK STOK: Apakah stok gudang cukup untuk 'mengeluarkan' barang ini lagi?
    if (transaction.data_barang.stok_barang < transaction.jumlah_keluar) {
      return { 
        success: false, 
        message: `Gagal Restore! Stok saat ini (${transaction.data_barang.stok_barang}) tidak cukup untuk transaksi ini (${transaction.jumlah_keluar}).` 
      };
    }

    // 3. Jalankan Transaksi
    await prisma.$transaction(async (tx) => {
      // Aktifkan kembali record
      await tx.data_barang_keluar.update({
        where: { id_barang_keluar },
        data: { isDeleted: false, deletedAt: null },
      });

      // Kurangi stok
      await tx.data_barang.update({
        where: { id_barang: transaction.id_barang },
        data: { stok_barang: { decrement: transaction.jumlah_keluar } }
      });
    });

    await createAuditLog("RESTORE", "Barang Keluar", `Kembalikan: ${transaction.data_barang.nama_barang}`);
    revalidatePath("/admin/dashboard/barang-keluar"); 
    revalidatePath("/admin/dashboard/data-barang");   
    revalidatePath("/admin/dashboard/trash");
    
    return { success: true, message: "Data berhasil dikembalikan!" };
  } catch (error) {
    return { success: false, message: "Gagal restore data." };
  }
};


export const permanentDeleteAction = async (id: number, table: 'barang' | 'masuk' | 'keluar' | 'pinjam') => {
  const session = await auth();
  
  if (session?.user?.role !== "admin") {
    return { success: false, message: "Hanya Admin yang dapat menghapus data selamanya!" };
  }
  try {
    return await prisma.$transaction(async (tx) => {
      if (table === 'barang') {
        // Hapus semua 'anak' data terlebih dahulu agar tidak error
        await tx.data_barang_masuk.deleteMany({ where: { id_barang: id } });
        await tx.data_barang_keluar.deleteMany({ where: { id_barang: id } });
        await tx.peminjaman.deleteMany({ where: { id_barang: id } });
        
        // Baru hapus 'induk' datanya
        await tx.data_barang.delete({ where: { id_barang: id } });
      } 
      else if (table === 'masuk') {
        const check = await tx.data_barang_masuk.findUnique({ where: { id_barang_masuk: id } });
        if (!check) return { success: false, message: "Data tidak ditemukan." };
        if (check?.id_peminjaman) return { success: false, message: "Data ini bagian dari Peminjaman. Hapus permanen melalui data Peminjaman." };
        await tx.data_barang.update({
          where: { id_barang: check.id_barang },
          data: { stok_barang: { decrement: check.jumlah_barang } }
        });
        await tx.data_barang_masuk.delete({ where: { id_barang_masuk: id } });
      } 
      else if (table === 'keluar') {
        const check = await tx.data_barang_keluar.findUnique({ where: { id_barang_keluar: id } });
        if (!check) return { success: false, message: "Data tidak ditemukan." };
        if (check?.id_peminjaman) return { success: false, message: "Data ini bagian dari Peminjaman. Hapus permanen melalui data Peminjaman." };
        await tx.data_barang.update({
          where: { id_barang: check.id_barang },
          data: { stok_barang: { increment: check.jumlah_keluar } }
        });
        await tx.data_barang_keluar.delete({ where: { id_barang_keluar: id } });
      } 
      // Bagian dalam permanentDeleteAction untuk case 'pinjam'
      else if (table === 'pinjam') {
        const pinjam = await tx.peminjaman.findUnique({ where: { id_peminjaman: id } });
        
        if (pinjam) {
          if (pinjam.status_peminjaman === "Belum Dikembalikan") {
            await tx.data_barang.update({
              where: { id_barang: pinjam.id_barang },
              data: { stok_barang: { increment: pinjam.jumlah_peminjaman } }
            });
          }
          // Hapus hanya riwayat keluar yang namanya cocok dengan peminjaman ini
          await tx.data_barang_keluar.deleteMany({ where: { id_peminjaman: id} });

          // Hapus hanya riwayat masuk yang namanya cocok (pengembalian)
          await tx.data_barang_masuk.deleteMany({ where: { id_peminjaman: id} });

          // Baru hapus data peminjaman permanen
          await tx.peminjaman.delete({ where: { id_peminjaman: id } });
        }
      }
      await createAuditLog("PERMANENT DELETE", table.toUpperCase(), `ID: ${id}`);
      return { success: true, message: "Data dihapus selamanya!" };
    });
  } catch (error) {
    console.error("Hard Delete Error:", error);
    return { success: false, message: "Gagal hapus permanen. Data mungkin masih terkait dengan laporan lain." };
  }
};

export const restoreItemAction = async (id_barang: number, forceMatch: boolean = false) => {
  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Ambil data dari sampah
      const trashed = await tx.data_barang.findUnique({ where: { id_barang } });
      if (!trashed) throw new Error("Data tidak ditemukan.");

      // 2. Cari data aktif dengan nama yang sama
      const existing = await tx.data_barang.findFirst({
        where: {
          nama_barang: { equals: trashed.nama_barang, mode: "insensitive" },
          isDeleted: false
        }
      });

      if (existing) {
        // Jika nama sama tapi satuan beda, dan belum dikonfirmasi forceMatch
        if (trashed.satuan_barang.toLowerCase() !== existing.satuan_barang.toLowerCase() && !forceMatch) {
          return { 
            success: false, 
            code: "UNIT_CONFLICT", 
            existingUnit: existing.satuan_barang,
            message: `Barang "${trashed.nama_barang}" sudah ada dengan satuan "${existing.satuan_barang}".`
          };
        }

        

        // PROSES PENGGABUNGAN (Merge)
        // Tambahkan stok ke barang yang sudah ada
        await tx.data_barang.update({
          where: { id_barang: existing.id_barang },
          data: { stok_barang: { increment: trashed.stok_barang } }
        });

        // Alihkan semua riwayat (Masuk & Keluar) ke ID barang yang aktif
        await tx.data_barang_masuk.updateMany({
          where: { id_barang: trashed.id_barang },
          data: { id_barang: existing.id_barang, isDeleted: false, deletedAt: null }
        });
        await tx.data_barang_keluar.updateMany({
          where: { id_barang: trashed.id_barang },
          data: { id_barang: existing.id_barang, isDeleted: false, deletedAt: null }
        });
        await tx.peminjaman.updateMany({
          where: { id_barang: trashed.id_barang },
          data: { id_barang: existing.id_barang, deletedAt: null, isDeleted: false }
        });

        // Hapus data sampah karena sudah melebur
        await tx.data_barang.delete({ where: { id_barang: trashed.id_barang } });

        await createAuditLog("RESTORE (Merge)", "Data Barang", `${trashed.nama_barang} (+${trashed.stok_barang} ${existing.satuan_barang})`);
        return { success: true, message: `Stok berhasil digabungkan ke data "${existing.nama_barang}"!` };
      }

      // 3. RESTORE BIASA (Jika nama beda atau sudah tidak ada konflik)
      await tx.data_barang.update({
        where: { id_barang },
        data: { isDeleted: false, deletedAt: null, deletedById: null },
      });
      await tx.peminjaman.updateMany({
        where: { id_barang: id_barang },
        data: { isDeleted: false, deletedAt: null }
      });
      await tx.data_barang_masuk.updateMany({
        where: { id_barang: id_barang },
        data: { isDeleted: false, deletedAt: null }
      });

      await tx.data_barang_keluar.updateMany({
        where: { id_barang: id_barang },
        data: { isDeleted: false, deletedAt: null }
      });

      await createAuditLog("RESTORE", "Data Barang", trashed.nama_barang);
      revalidatePath("/admin/dashboard/data-barang"); 
      revalidatePath("/admin/dashboard/trash");
      return { success: true, message: "Barang berhasil dipulihkan!" };
    });
  } catch (error: any) {
    return { success: false, message: error.message || "Gagal memulihkan data." };
  }
};

export const restorePeminjamanAction = async (id_peminjaman: number) => {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Ambil data peminjaman yang mau di-restore
      const peminjaman = await tx.peminjaman.findUnique({
        where: { id_peminjaman },
        include: { data_barang: true }
      });

      if (!peminjaman) throw new Error("Data tidak ditemukan");

      if (peminjaman.data_barang.isDeleted) {
        throw new Error(`Gagal Restore! Barang "${peminjaman.data_barang.nama_barang}" masih berada di kotak sampah. Pulihkan data barang tersebut terlebih dahulu.`);
      }

      // 2. Jika statusnya "Belum Dikembalikan", cek stok gudang dulu
      if (peminjaman.status_peminjaman === "Belum Dikembalikan") {
        if (peminjaman.data_barang.stok_barang < peminjaman.jumlah_peminjaman) {
          throw new Error(`Stok tidak cukup untuk restore! Sisa stok: ${peminjaman.data_barang.stok_barang}`);
        }

        // Kurangi stok gudang lagi karena barang dipinjam kembali
        await tx.data_barang.update({
          where: { id_barang: peminjaman.id_barang },
          data: { stok_barang: { decrement: peminjaman.jumlah_peminjaman } }
        });
      }

      await tx.data_barang_keluar.updateMany({
        where: { 
          id_barang: peminjaman.id_barang,
          keterangan: { contains: peminjaman.nama_peminjam },
          isDeleted: true
        },
        data: { isDeleted: false }
      });

      await tx.data_barang_masuk.updateMany({
        where: { 
          id_barang: peminjaman.id_barang,
          sumber_barang: { contains: peminjaman.nama_peminjam },
          isDeleted: true
        },
        data: { isDeleted: false }
      });

      // C. Aktifkan kembali data peminjaman
      return await tx.peminjaman.update({
        where: { id_peminjaman },
        data: { isDeleted: false, deletedAt: null },
      });
    });

    await createAuditLog("RESTORE", "Peminjaman", `Peminjam: ${result.nama_peminjam}`);
    revalidatePath("/admin/dashboard/pinjam-barang");
    revalidatePath("/admin/dashboard/data-barang");
    revalidatePath("/admin/dashboard/trash");
    revalidatePath("/admin/dashboard/barang-keluar");
    revalidatePath("/admin/dashboard/barang-masuk");
    return { success: true, message: "Data peminjaman berhasil dikembalikan!" };
  } catch (error: any) {
    return { success: false, message: error.message || "Gagal mengembalikan data." };
  }
};

const CreateBarangKeluarSchema = z.object({
  id_barang: z.coerce.number().min(1, "Pilih barang terlebih dahulu"),
  tanggal_keluar: z.string().min(1, "Tanggal keluar wajib diisi"),
  jumlah_keluar: z.coerce.number().min(1, "Jumlah minimal 1"),
  keterangan: z.string().min(1, "Keterangan wajib dipilih"),
});

export type State = {
  error?: {
    id_barang?: string[];
    tanggal_keluar?: string[];
    jumlah_keluar?: string[];
    keterangan?: string[];
    detail_keterangan?: string[];
  };
  message?: string;
  success?: boolean;
};

export async function createBarangKeluar(
  prevState: State,
  formData: FormData
): Promise<State> {
  const validatedFields = CreateBarangKeluarSchema.safeParse({
    id_barang: formData.get("id_barang"),
    tanggal_keluar: formData.get("tanggal_keluar"),
    jumlah_keluar: formData.get("jumlah_keluar"),
    keterangan: formData.get("keterangan"),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { id_barang, tanggal_keluar, jumlah_keluar, keterangan } = validatedFields.data;

  // --- LOGIKA TAMBAHAN (Wajib Ada) ---
  // 1. Ambil detail dari form (yang kita buat di frontend tadi)
  const detailKeterangan = formData.get("detail_keterangan") as string;

  // Validasi jika kosong
  if ((keterangan === "Diberikan" || keterangan === "Lainnya" || keterangan === "Dipakai Habis") && !detailKeterangan) {
      return {
        error: {
          detail_keterangan: ["Data ini wajib diisi jika memilih opsi tersebut"],
        },
      };
  }

  let keteranganFinal = keterangan;

  if (keterangan === "Diberikan" && detailKeterangan) {
    keteranganFinal = `Diberikan kepada: ${detailKeterangan}`;
  } else if (keterangan === "Dipakai Habis" && detailKeterangan) {
    keteranganFinal = `Dipakai untuk: ${detailKeterangan}`; // Format penyimpanan baru
  } else if (keterangan === "Lainnya" && detailKeterangan) {
    keteranganFinal = `${detailKeterangan}`;
  }
  if ((keterangan === "Pemberian" || keterangan === "Lainnya" || keterangan === "Dipakai Habis") && !detailKeterangan) {
    return {
      success: false,
      message: "Data belum lengkap!",
      error: {
        detail_keterangan: [`Keterangan ${keterangan} wajib diisi!`]
      }
    };
  }

  try {
    // Cek stok tersedia
    const barang = await prisma.data_barang.findUnique({
      where: { id_barang },
    });

    if (!barang) {
      return {
        message: "Barang tidak ditemukan",
      };
    }

    if (barang.stok_barang < jumlah_keluar) {
      return {
        error: {
          jumlah_keluar: ["Stok tidak mencukupi"],
        },
      };
    }

    // Transaction: Simpan Record & Update Stok
    await prisma.$transaction([
      prisma.data_barang_keluar.create({
        data: {
          id_barang,
          tanggal_keluar: new Date(tanggal_keluar),
          jumlah_keluar,
          keterangan: keteranganFinal, // <--- PENTING: Gunakan variabel yang sudah digabung
        },
      }),
      prisma.data_barang.update({
        where: { id_barang },
        data: {
          stok_barang: {
            decrement: jumlah_keluar,
          },
        },
      }),
    ]);
    await createAuditLog("CREATE", "Barang Keluar", `Keluar: data barang keluar ${barang?.nama_barang}`);  

    revalidatePath("/admin/dashboard/barang-keluar");
    revalidatePath("/admin/dashboard/data-barang");
    return { message: "Berhasil menyimpan data barang keluar!", success: true };
  } catch (error) {
    console.error("Database Error:", error);
    return {
      message: "Gagal menyimpan data barang keluar",
    };
  }
}

export async function deleteBarangKeluar(id_barang_keluar: number) {
  try {
    const record = await prisma.data_barang_keluar.findUnique({
      where: { id_barang_keluar },
      include: { data_barang: true },
    });

    if (!record) throw new Error("Data tidak ditemukan");
    if (record.id_peminjaman) { 
      return { 
        success: false, 
        message: "Gagal! Data ini terkait dengan transaksi Peminjaman. Penghapusan harus dilakukan melalui modul Pinjam Barang." 
      };
    }

    await prisma.$transaction([
      // Fitur asli: Stok dikembalikan ke gudang
      prisma.data_barang.update({
        where: { id_barang: record.id_barang },
        data: { stok_barang: { increment: record.jumlah_keluar } },
      }),
      // Perintah Hapus diubah jadi Soft Delete
      prisma.data_barang_keluar.update({
        where: { id_barang_keluar },
        data: { isDeleted: true, deletedAt: new Date() },
      }),
    ]);
    
    await createAuditLog("DELETE (Trash)", "Barang Keluar", `Hapus: data barang keluar ${record?.data_barang.nama_barang}`); // 

    revalidatePath("/admin/dashboard/barang-keluar");
    revalidatePath("/admin/dashboard/data-barang");
    return { message: "Berhasil menghapus data barang keluar!", success: true };
  } catch (error) {
    throw new Error("Gagal menghapus data");
  }
}

export async function deleteUser(id: string) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return { success: false, message: "Unauthorized" };
  }
  try {
    // Cek apakah user ada
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return { success: false, message: "User tidak ditemukan" };
    }

    // Hapus user
    await prisma.user.delete({
      where: { id },
    });

    // Revalidate halaman manajemen akun
    revalidatePath("/admin/dashboard/manajemen-akun");

    return { success: true, message: "User berhasil dihapus" };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, message: "Gagal menghapus user" };
  }
}