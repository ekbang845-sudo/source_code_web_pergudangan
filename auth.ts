import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma"; 
import { compare } from "bcrypt-ts"; 
import crypto from "crypto";
import { authConfig } from "./auth.config"; 

const MAX_ATTEMPTS = 3;            
const LOCKOUT_TIME = 15 * 60 * 1000;
export const GLOBAL_SESSION_VERSION = 1;

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) return null;

        // PERBAIKAN: Gunakan new Date() langsung
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          throw new Error(`LOCKED_UNTIL=${user.lockedUntil.toISOString()}`);
        }
        
        const isValid = await compare(credentials.password as string, user.password);
        
        if (!isValid) {
          // Increment jumlah gagal
          const newFailCount = (user.failedLoginAttempts || 0) + 1;
          
          let updateData: any = { failedLoginAttempts: newFailCount };

          // Jika sudah mencapai batas maksimal, set waktu terkunci
          if (newFailCount >= MAX_ATTEMPTS) {
            updateData.lockedUntil = new Date(Date.now() + LOCKOUT_TIME);
          }

          // Update database
          await prisma.user.update({
            where: { id: user.id },
            data: updateData,
          });

          return null; 
        }

        const newSessionId = crypto.randomUUID();

        await prisma.user.update({
          where: { id: user.id },
          data: { 
            activeSessionId: newSessionId, 
            failedLoginAttempts: 0,        
            lockedUntil: null              
          },
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role, 
          sessionId: newSessionId,
          globalVersion: GLOBAL_SESSION_VERSION,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          id: user.id,
          role: user.role,
          sessionId: user.sessionId,
          globalVersion: user.globalVersion,
        };
      }

      if (token.id) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { activeSessionId: true, role: true },
          });

          if (!dbUser || dbUser.activeSessionId !== token.sessionId) {
            return null; 
          }

          token.role = dbUser.role; 
        } catch (error) {
          return token; 
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.sessionId = token.sessionId as string;
      }
      return session;
    },
  },
});