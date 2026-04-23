"use server";

import { getSession, requireSession } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

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

export type CreateBetState = { error: string } | null;

export async function createBet(
  _prevState: CreateBetState,
  formData: FormData
): Promise<CreateBetState> {
  const session = await requireSession();

  // Neon Auth manages users in its own service and doesn't sync them to this
  // database automatically, so we upsert the user row to satisfy the FK constraint.
  await db.user.upsert({
    where: { id: session.user.id },
    update: {
      email: session.user.email,
      name: session.user.name ?? session.user.email,
      updatedAt: new Date(),
    },
    create: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name ?? session.user.email,
      emailVerified: session.user.emailVerified ?? false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const description = (formData.get("bet") as string)?.trim();
  const amount = (formData.get("amount") as string)?.trim();
  const eventAt = formData.get("eventAt") as string;

  if (!description || !amount || !eventAt) {
    return { error: "Please fill in all required fields." };
  }

  const creatorAnswer = formData.get("answer");
  if (creatorAnswer !== "yes" && creatorAnswer !== "no") {
    return { error: "Please select your answer (Yes or No)." };
  }

  const otherPlayers: { name: string; userId: string }[] = [];
  let i = 1;
  while (formData.has(`player_${i}`)) {
    const name = (formData.get(`player_${i}`) as string).trim();
    const userId = (formData.get(`player_${i}_id`) as string)?.trim();
    if (name && !userId) {
      return { error: `Please select "${name}" from the search results.` };
    }
    if (name && userId) otherPlayers.push({ name, userId });
    i++;
  }

  if (otherPlayers.length === 0) {
    return { error: "Add at least one other player." };
  }

  const creatorName = session.user.name ?? session.user.email;

  const bet = await db.bet.create({
    data: {
      userId: session.user.id,
      description,
      amount,
      eventAt: new Date(eventAt),
      players: {
        create: [
          { name: creatorName, answer: creatorAnswer === "yes", userId: session.user.id },
          ...otherPlayers.map(({ name, userId }) => ({ name, answer: false, userId })),
        ],
      },
    },
  });

  redirect(`/bets/${bet.id}`);
}
