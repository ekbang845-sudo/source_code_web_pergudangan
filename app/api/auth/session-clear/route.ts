// src/app/api/auth/session-clear/route.ts
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma"; 
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // Hapus activeSessionId di database agar token di browser user tidak valid lagi
    await prisma.user.update({
      where: { id: session.user.id },
      data: { activeSessionId: null },
    });

    return NextResponse.json({ message: "Session cleared" });
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}