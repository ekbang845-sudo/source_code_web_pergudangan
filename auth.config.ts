// src/auth.config.ts 
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: { 
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // Stay logged in selama 30 hari 
  },
  providers: [], 
  callbacks: {
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role?.toLowerCase();
      const pathname = nextUrl.pathname;

      if (pathname.startsWith("/admin")) {
        if (!isLoggedIn) return false;
        if (role === "admin" || role === "user") return true;
        return Response.redirect(new URL("/403", nextUrl));
      }
      return isLoggedIn;
    },
  },
} satisfies NextAuthConfig;