"use server";

import { getSession } from "@/lib/auth/server";
import { db } from "@/lib/db";

export async function searchUsers(query: string) {
  if (!query.trim()) return [];
  const session = await getSession();
  return db.user.findMany({
    where: {
      name: { contains: query, mode: "insensitive" },
      ...(session?.user ? { id: { not: session.user.id } } : {}),
    },
    select: { id: true, name: true },
    take: 5,
  });
}
