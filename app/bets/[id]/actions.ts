"use server";

import { requireSession } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";

async function requireOwner(betId: string) {
  const session = await requireSession();
  const bet = await db.bet.findUnique({ where: { id: betId } });
  if (!bet) notFound();
  if (bet.userId !== session.user.id) throw new Error("Unauthorized");
  return { session, bet };
}

export async function deleteBet(betId: string) {
  await requireOwner(betId);
  await db.bet.delete({ where: { id: betId } });
  redirect("/dashboard");
}

export type UpdateBetState = { error: string } | null;

export async function updateBet(
  betId: string,
  _prevState: UpdateBetState,
  formData: FormData
): Promise<UpdateBetState> {
  const { session } = await requireOwner(betId);

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

  await db.betPlayer.deleteMany({ where: { betId } });
  await db.bet.update({
    where: { id: betId },
    data: {
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

  redirect(`/bets/${betId}`);
}
