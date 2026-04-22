import { requireSession } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { notFound } from "next/navigation";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function BetPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSession();
  const { id } = await params;

  const bet = await db.bet.findUnique({
    where: { id },
    include: { players: true },
  });

  if (!bet) notFound();

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
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Event date:</span>
              {eventDate}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4">
                <p className="mb-3 text-sm font-semibold text-green-500">
                  Yes ({yesPlayers.length})
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

              <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4">
                <p className="mb-3 text-sm font-semibold text-red-500">
                  No ({noPlayers.length})
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
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
