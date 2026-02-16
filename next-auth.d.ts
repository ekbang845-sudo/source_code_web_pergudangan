// src/types/next-auth.d.ts
import { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
    sessionId: string; 
  }

  interface User {
    role?: string;
    sessionId?: string;
    globalVersion?: number; // Tambahkan ini agar authorize tidak error
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;        // Ubah jadi opsional dengan ?
    role?: string;      // Ubah jadi opsional dengan ?
    sessionId?: string; // Ubah jadi opsional dengan ?
    globalVersion?: number;
  }
}