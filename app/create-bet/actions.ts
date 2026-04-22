"use server";

import { requireSession } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

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

  const otherPlayers: string[] = [];
  let i = 1;
  while (formData.has(`player_${i}`)) {
    const name = (formData.get(`player_${i}`) as string).trim();
    if (name) otherPlayers.push(name);
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
          { name: creatorName, answer: creatorAnswer === "yes" },
          ...otherPlayers.map((name) => ({ name, answer: false })),
        ],
      },
    },
  });

  redirect(`/bets/${bet.id}`);
}
