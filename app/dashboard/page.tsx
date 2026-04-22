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
    include: { user: true, players: true },
    orderBy: { eventAt: "asc" },
  });

  const now = new Date();
  const upcoming = bets.filter((b) => b.eventAt >= now);
  const past = bets.filter((b) => b.eventAt < now);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-8 px-6 pt-28 pb-12">
      <h1 className="text-3xl font-semibold">Dashboard</h1>

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
    </main>
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
        <div className="grid gap-4 sm:grid-cols-2">
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
        <CardFooter className="gap-3 text-xs">
          <span className="font-medium text-green-500">Yes · {yesCount}</span>
          <span className="font-medium text-red-500">No · {noCount}</span>
        </CardFooter>
      </Card>
    </Link>
  );
}
