import React from "react";
import { prisma } from "@/lib/prisma"; // Kita pakai ini
import ManajemenAkunClient from "@/components/ManajemenAkunClient";

// PERBAIKAN 1: Ganti 'db' jadi 'prisma'
type UserFindManyArgs = Parameters<typeof prisma.user.findMany>[0];
type UserOrderBy = NonNullable<UserFindManyArgs>["orderBy"];
type UserWhere = NonNullable<UserFindManyArgs>["where"];

export const dynamic = "force-dynamic";
export default async function ManajemenAkunPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; query?: string; sort?: string }>;
}) {
  const params = await searchParams;
  
  const query = params?.query || "";
  const page = Number(params?.page) || 1;
  const sort = params?.sort || "createdAt-desc"; 
  const itemsPerPage = 5;

  let orderBy: UserOrderBy = { createdAt: "desc" };

  switch (sort) {
    case "name-asc":
      orderBy = { name: "asc" };
      break;
    case "name-desc":
      orderBy = { name: "desc" };
      break;
    case "email-asc":
      orderBy = { email: "asc" };
      break;
    case "email-desc":
      orderBy = { email: "desc" };
      break;
    case "role-asc":
      orderBy = { role: "asc" };
      break;
    case "role-desc":
      orderBy = { role: "desc" };
      break;
    default:
      orderBy = { createdAt: "desc" };
      break;
  }

  const whereClause: UserWhere = {
    OR: [
      { name: { contains: query, mode: "insensitive" } },
      { email: { contains: query, mode: "insensitive" } },
    ],
  };

  // PERBAIKAN 2: Ganti 'db' jadi 'prisma'
  const users = await prisma.user.findMany({
    where: whereClause,
    orderBy: orderBy,
    take: itemsPerPage,
    skip: (page - 1) * itemsPerPage,
  });
  
  // PERBAIKAN 3: Ganti 'db' jadi 'prisma'
  const totalItems = await prisma.user.count({
    where: whereClause,
  });

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <ManajemenAkunClient
      data={users}
      totalPages={totalPages}
      totalItems={totalItems}
    />
  );
}