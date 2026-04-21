import { requireSession } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export default async function TripsPage() {
  const session = await requireSession();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-4 px-6 pt-28">
      <h1 className="text-3xl font-semibold">Create a new bet</h1>
      <p className="text-muted-foreground">
        Hey {session.user.name ?? session.user.email}, ready to get some wins??
      </p>
      <p className="text-sm text-muted-foreground">
        This page is protected by Neon Auth via requireSession().
      </p>
    </main>
  );
}
