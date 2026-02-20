// actions/emailAction.ts
"use server";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mail";
import crypto from "crypto"; 

export const requestEmailOtpAction = async (email: string) => {
  try {
    const existingEmail = await prisma.verifiedEmail.findUnique({
      where: { email }
    });

    if (existingEmail && existingEmail.isVerified) {
      return { 
        success: false, 
        message: "Email ini sudah terdaftar sebagai penerima backup!" 
      };
    }
    const settings = await prisma.backupSettings.upsert({
      where: { id: 1 },
      update: {},
      create: { 
        id: 1, 
        isEmailActive: false, 
        adminEmail: process.env.EMAIL_USER || "ekbang845@gmail.com" 
      }
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 5 * 60000); // 5 Menit

    // 2. Simpan OTP
    await prisma.verifiedEmail.upsert({
      where: { email },
      update: { otpCode: otp, otpExpiry: expiry, isVerified: false },
      create: { 
        email, 
        otpCode: otp, 
        otpExpiry: expiry, 
        settingsId: settings.id // Gunakan ID dari hasil upsert di atas
      },
    });

    // 3. Kirim Email (Gunakan 4 argumen agar aman)
    await sendMail(
      email, 
      "KODE OTP AKSES GUDANG", 
      `<p>Kode OTP Anda adalah: <strong>${otp}</strong>. Kode berlaku selama 5 menit.</p>`,
      [] // Lampiran kosong
    );

    return { success: true };
  } catch (err) {
    console.error("Gagal Request OTP:", err);
    return { success: false, message: "Kesalahan server atau konfigurasi SMTP." };
  }
};
export const verifyEmailOtpAction = async (email: string, code: string) => {
  const record = await prisma.verifiedEmail.findUnique({
    where: { email }
  });

  if (!record) return { success: false, message: "Email tidak terdaftar!" };

  // 1. Cek apakah kode cocok
  const isMatch = record.otpCode === code;
  
  // 2. Cek apakah sudah kadaluarsa
  const isExpired = record.otpExpiry ? new Date() > record.otpExpiry : true;

  if (isMatch && !isExpired) {
    await prisma.verifiedEmail.update({
      where: { email },
      data: { 
        isVerified: true, 
        otpCode: null,   
        otpExpiry: null  
      }
    });
    return { success: true };
  }

  return { 
    success: false, 
    message: isExpired ? "Kode sudah kadaluarsa, silakan minta lagi." : "Kode OTP salah!" 
  };
};

export const getBackupSettingsAction = async () => {
  try {
    const settings = await prisma.backupSettings.findFirst({
      where: { id: 1 },
      include: { 
        additionalEmails: { 
          where: { isVerified: true } 
        } 
      }
    });
    return settings;
  } catch (error) {
    console.error("Gagal mengambil pengaturan backup:", error);
    return null;
  }
};

export const updateBackupStatusAction = async (isActive: boolean) => {
  const emailDariEnv = process.env.EMAIL_USER || "ekbang845@gmail.com";

  return await prisma.backupSettings.upsert({
    where: { id: 1 },
    update: { 
      isEmailActive: isActive,
      adminEmail: emailDariEnv 
    },
    create: { 
      id: 1, 
      isEmailActive: isActive, 
      adminEmail: emailDariEnv 
    },
  });
};
export const deleteAdditionalEmailAction = async (id: string) => {
  await prisma.verifiedEmail.delete({ where: { id } });
  return { success: true };
};
