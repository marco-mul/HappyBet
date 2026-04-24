import { requireSession } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import { EditBetForm } from "./edit-bet-form";

export const dynamic = "force-dynamic";

export default async function EditBetPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  const { id } = await params;

  const bet = await db.bet.findUnique({
    where: { id },
    include: { players: true },
  });

  if (!bet) notFound();
  if (bet.userId !== session.user.id) redirect(`/bets/${id}`);

  // First player is always the creator (by convention from create action)
  const [creatorPlayer, ...otherPlayers] = bet.players;
  const initialAnswer = creatorPlayer?.answer ? "yes" : "no";
  const initialPlayers = otherPlayers.map((p) => ({ name: p.name, userId: p.userId ?? null }));

  const initialEventAt = bet.eventAt.toISOString();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center gap-4 px-6 pt-28 pb-12">
      <h1 className="text-3xl font-semibold">Edit bet</h1>
      <Card className="w-full max-w-2xl">
        <Image
          src="/watching.gif"
          width={500}
          height={281}
          alt="Bet cover"
          className="relative aspect-3/1 w-full object-cover brightness-80 grayscale dark:brightness-80"
        />
        <CardHeader>
          <CardTitle>Edit your bet</CardTitle>
          <CardDescription>Update the details below.</CardDescription>
        </CardHeader>
        <EditBetForm
          betId={id}
          initialDescription={bet.description}
          initialAmount={bet.amount}
          initialEventAt={initialEventAt}
          initialAnswer={initialAnswer}
          initialPlayers={initialPlayers.length > 0 ? initialPlayers : [{ name: "", userId: null }]}
        />
      </Card>
    </main>
  );
}
