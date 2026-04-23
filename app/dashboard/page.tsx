import { requireSession } from "@/lib/auth/server";
import { db } from "@/lib/db";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await requireSession();

  const bets = await db.bet.findMany({
    where: {
      OR: [
        { userId: session.user.id },
        { players: { some: { userId: session.user.id } } },
      ],
    },
    include: { user: true, players: true },
    orderBy: { eventAt: "asc" },
  });

  const now = new Date();
  const upcoming = bets.filter((b) => b.eventAt >= now);
  const past = bets.filter((b) => b.eventAt < now);

  const finished = bets.filter((b) => b.outcome !== null);
  const ongoing = bets.filter((b) => b.outcome === null);
  const won = finished.filter((b) => {
    const myPlayer = b.players.find((p) => p.userId === session.user.id);
    return myPlayer !== undefined && myPlayer.answer === b.outcome;
  });
  const winPercent = finished.length > 0 ? Math.round((won.length / finished.length) * 100) : null;

  return (
    <main className="mx-auto flex min-h-screen w-full flex-col gap-6 px-10 pt-28 pb-12" style={{ maxWidth: '1600px' }}>
      <h1 className="text-3xl font-semibold">Dashboard</h1>
      

      <div className="flex flex-col gap-6 sm:flex-row sm:items-start" style={{ gap: '5rem' }}>
        <div className="flex w-full shrink-0 flex-col gap-4" style={{ flexBasis: '35%' }}>
          <h2 className="text-lg font-semibold">Hey {session.user.name ?? session.user.email}, are those stats any good?</h2>
          <Card>
            <CardHeader>
              <CardTitle>Your stats</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Stat label="Ongoing" value={ongoing.length} />
              <Stat label="Finished" value={finished.length} />
              <Stat label="Won" value={won.length} />
              <div className="flex flex-col gap-1.5">
                <Stat
                  label="Win rate"
                  value={winPercent !== null ? `${winPercent}%` : "—"}
                />
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-green-500 transition-all"
                    style={{ width: `${winPercent ?? 0}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-1 flex-col gap-8">
          <BetSection
            title="Upcoming bets"
            bets={upcoming}
            currentUserId={session.user.id}
            empty="No upcoming bets. Create one!"
          />
          <BetSection
            title="Past bets"
            bets={past}
            currentUserId={session.user.id}
            empty="No past bets yet."
          />
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}

type Bet = Awaited<ReturnType<typeof db.bet.findMany<{ include: { user: true; players: true } }>>>[number];

function BetSection({
  title,
  bets,
  currentUserId,
  empty,
}: {
  title: string;
  bets: Bet[];
  currentUserId: string;
  empty: string;
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      {bets.length === 0 ? (
        <p className="text-sm text-muted-foreground">{empty}</p>
      ) : (
        <div className="grid gap-4">
          {bets.map((bet) => (
            <BetCard key={bet.id} bet={bet} currentUserId={currentUserId} />
          ))}
        </div>
      )}
    </section>
  );
}

function BetCard({ bet, currentUserId }: { bet: Bet; currentUserId: string }) {
  const isOwner = bet.userId === currentUserId;
  const creatorLabel = isOwner
    ? "You"
    : bet.user.name ?? bet.user.email;

  const eventDate = bet.eventAt.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const yesCount = bet.players.filter((p) => p.answer).length;
  const noCount = bet.players.filter((p) => !p.answer).length;
  const total = bet.players.length;
  const yesPercent = total > 0 ? Math.round((yesCount / total) * 100) : 50;
  const noPercent = total > 0 ? 100 - yesPercent : 50;

  return (
    <Link href={`/bets/${bet.id}`} className="group">
      <Card size="sm" className="h-full transition-shadow group-hover:shadow-md">
        <CardHeader>
          <CardTitle>{bet.description}</CardTitle>
          <CardDescription>Stakes: {bet.amount}</CardDescription>
          <CardAction className="text-xs text-muted-foreground">
            {creatorLabel}
          </CardAction>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground">
          {eventDate}
        </CardContent>
        <CardFooter className="flex-col gap-1.5">
          <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-green-500 transition-all" style={{ width: `${yesPercent}%` }} />
            <div className="h-full bg-red-500 transition-all" style={{ width: `${noPercent}%` }} />
          </div>
          <div className="flex w-full justify-between text-xs">
            <span className="font-medium text-green-500">Yes · {yesCount}</span>
            <span className="font-medium text-red-500">No · {noCount}</span>
          </div>
          {bet.outcome !== null && (
            <div className={`w-full rounded-md px-2 py-1 text-center text-xs font-medium ${bet.outcome ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
              Outcome: {bet.outcome ? "Yes" : "No"} 🏆
            </div>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
