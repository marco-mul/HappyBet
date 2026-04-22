import { requireSession } from "@/lib/auth/server";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Image from "next/image"
import { CreateBetForm } from "./create-bet-form";

export const dynamic = "force-dynamic";

export default async function CreateBetPage() {
  const session = await requireSession();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center gap-4 px-6 pt-28">
      <h1 className="text-3xl font-semibold">Create a new bet</h1>
      <p className="text-xl text-muted-foreground">
        Hey {session.user.name ?? session.user.email}, ready to get some wins??
      </p>
      <Card className="w-full max-w-2xl">
        <Image
          src="/watching.gif"
          width={500}
          height={281}
          alt="Event cover"
          className="relative aspect-3/1 w-full object-cover brightness-80 grayscale dark:brightness-80"
        />
        <CardHeader>
          <CardTitle>Create a new bet</CardTitle>
          <CardDescription>
            Enter the details of your bet below.
          </CardDescription>
        </CardHeader>
        <CreateBetForm />
      </Card>
    </main>
  );
}
