import { requireSession } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await requireSession();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-4 px-6 pt-28">
      <h1 className="text-3xl font-semibold">Dashboard</h1>
      <p className="text-muted-foreground">
        Signed in as {session.user.name ?? session.user.email}.
      </p>
      <p className="text-sm text-muted-foreground">
        This route is protected and redirects to sign-in when no active session
        exists.
      </p>
    </main>
  );
}
