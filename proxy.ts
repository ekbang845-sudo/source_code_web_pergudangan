// src/proxy.ts
import { auth } from "@/auth"; // Impor auth yang sudah lengkap dengan callback
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const user = req.auth?.user;
  const isLoggedIn = !!req.auth;

  // Jika tidak login dan mencoba akses area terproteksi
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  const pathname = nextUrl.pathname;
  const role = user?.role;

  // Proteksi Admin
  if (pathname.startsWith("/admin")) {
    if (role !== "admin" && role !== "user") {
        return NextResponse.redirect(new URL("/403", nextUrl));
    }
    
    // Spesifik untuk user biasa yang mencoba akses manajemen akun
    if (role === "user" && pathname.startsWith("/admin/dashboard/manajemen-akun")) {
      return NextResponse.redirect(new URL("/403", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/user/:path*"],
};