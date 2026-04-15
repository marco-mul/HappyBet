"use client";

import { authClient } from "@/lib/auth/client";
import Link from "next/link";

export default function Home() {
  const { data: session } = authClient.useSession();
  if (session?.user) {
    return (
      <div className="flex flex-col gap-2 min-h-screen items-center justify-center">
        <h1 className="mb-4 text-4xl">
          Logged in as{" "}
          <span className="font-bold underline">{session.user.name}</span>
        </h1>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2 min-h-screen items-center justify-center">
      <h1 className="mb-4 text-4xl font-bold">Not logged in</h1>
      <div className="flex item-center gap-2">
        <Link
          href="/auth/sign-up"
          className="inline-flex text-lg text-indigo-400 hover:underline"
        >
          Sign-up
        </Link>
        <Link
          href="/auth/sign-in"
          className="inline-flex text-lg text-indigo-400 hover:underline"
        >
          Sign-in
        </Link>
      </div>
    </div>
  );
}
