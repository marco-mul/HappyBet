import { requireSession } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { notFound } from "next/navigation";
import Image from "next/image";
import { OwnerActions } from "./owner-actions";
import { VoteButtons } from "./vote-buttons";
import { OutcomeButtons } from "./outcome-buttons";

export const dynamic = "force-dynamic";

export default async function BetPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  const { id } = await params;

  const bet = await db.bet.findUnique({
    where: { id },
    include: { players: true },
  });

  if (!bet) notFound();

  const isOwner = bet.userId === session.user.id;
  const currentPlayer = bet.players.find((p) => p.userId === session.user.id);
  const isOver = bet.eventAt < new Date();

  const eventDate = bet.eventAt.toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const yesPlayers = bet.players.filter((p) => p.answer);
  const noPlayers = bet.players.filter((p) => !p.answer);
  const total = bet.players.length;
  const yesPercent = total > 0 ? Math.round((yesPlayers.length / total) * 100) : 50;
  const noPercent = total > 0 ? 100 - yesPercent : 50;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center gap-6 px-6 pt-28 pb-12">
      <div className="w-full max-w-2xl">
        <Card className="w-full overflow-hidden">
          <Image
            src="/watching.gif"
            width={500}
            height={281}
            alt="Bet cover"
            className="aspect-3/1 w-full object-cover brightness-80 grayscale dark:brightness-80"
          />
          <CardHeader>
            <CardTitle className="text-2xl">{bet.description}</CardTitle>
            <CardDescription>Stakes: {bet.amount}</CardDescription>
            {isOwner && (
              <CardAction>
                <OwnerActions betId={id} />
              </CardAction>
            )}
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Event date:</span>
              {eventDate}
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-green-500 transition-all" style={{ width: `${yesPercent}%` }} />
                <div className="h-full bg-red-500 transition-all" style={{ width: `${noPercent}%` }} />
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-green-500">Yes {yesPercent}%</span>
                <span className="text-red-500">No {noPercent}%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className={`rounded-lg border p-4 ${bet.outcome === true ? "border-green-500/60 bg-green-500/10" : "border-green-500/30 bg-green-500/5"}`}>
                <p className="mb-3 text-sm font-semibold text-green-500">
                  Yes ({yesPlayers.length}){bet.outcome === true && " 🏆"}
                </p>
                <ul className="flex flex-col gap-1">
                  {yesPlayers.length === 0 ? (
                    <li className="text-sm text-muted-foreground">Nobody yet</li>
                  ) : (
                    yesPlayers.map((p) => (
                      <li key={p.id} className="text-sm">
                        {p.name}
                      </li>
                    ))
                  )}
                </ul>
              </div>

              <div className={`rounded-lg border p-4 ${bet.outcome === false ? "border-red-500/60 bg-red-500/10" : "border-red-500/30 bg-red-500/5"}`}>
                <p className="mb-3 text-sm font-semibold text-red-500">
                  No ({noPlayers.length}){bet.outcome === false && " 🏆"}
                </p>
                <ul className="flex flex-col gap-1">
                  {noPlayers.length === 0 ? (
                    <li className="text-sm text-muted-foreground">Nobody yet</li>
                  ) : (
                    noPlayers.map((p) => (
                      <li key={p.id} className="text-sm">
                        {p.name}
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>

            {currentPlayer && !isOver && (
              <VoteButtons betId={id} currentAnswer={currentPlayer.answer} />
            )}

            {isOwner && isOver && (
              <OutcomeButtons betId={id} currentOutcome={bet.outcome ?? null} />
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
