import React from "react";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import FormEditAkun from "@/components/EditAkunButton";
import { auth } from "@/auth";


interface EditUserPageProps {
  params: Promise<{
    id: string;
  }>;
}
export const dynamic = "force-dynamic";

export default async function EditUserPage({ params }: EditUserPageProps) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    redirect("/admin/dashboard");
  }

  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!user) {
    notFound();
  }

  const formattedUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as string,
  };

  return <FormEditAkun user={formattedUser} />;
}
