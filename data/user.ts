import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const fetchUsersPages = async (query: string, itemsPerPage: number) => {
  try {
    const count = await prisma.user.count({
      where: {
        OR: [{ name: { contains: query } }, { email: { contains: query } }],
      },
    });
    return Math.ceil(count / itemsPerPage);
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total users pages.");
  }
};

export const fetchTotalUsers = async (query: string) => {
  try {
    const count = await prisma.user.count({
      where: {
        OR: [{ name: { contains: query } }, { email: { contains: query } }],
      },
    });
    return count;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total users count.");
  }
};

export const fetchUsers = async (
  query: string,
  currentPage: number,
  itemsPerPage: number,
  sort: string
) => {
  const offset = (currentPage - 1) * itemsPerPage;
  let orderBy: any = { name: "asc" };

  if (sort === "name-desc") {
    orderBy = { name: "desc" };
  } else if (sort === "role-asc") {
    orderBy = { role: "asc" };
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [{ name: { contains: query } }, { email: { contains: query } }],
      },
      orderBy: orderBy,
      take: itemsPerPage,
      skip: offset,
    });
    return users;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch users.");
  }
};
