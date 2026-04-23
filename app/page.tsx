import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { getSession } from "@/lib/auth/server";

export default async function Home() {
  const session = await getSession();

  return (
    <div className="flex flex-col gap-2 min-h-screen items-center pt-30">
      <div>
        <Image
          src="/hb-logo-transp.png"
          alt="HappyBet Logo"
          width={300}
          height={300}
          className="mb-4"
        />
      </div>
      <h1 className="mb-4 text-4xl font-bold">HappyBet</h1>
      <h2 className="mb-4 text-2xl font-semibold max-w-2xl text-center">
        Your ultimate betting platform to make a wager with your friends
      </h2>
      <p className="max-w-2xl text-center">
        With HappyBet, you can bet a beer (or anything you like) with your
        friends and enjoy the thrill of friendly competition.{" "}
      </p>
      <h2 className="mb-4 text-2xl font-semibold">Start betting with your friends today!</h2>{" "}
      <div className="flex item-center gap-2">
        {session ? (
          <Link href="/create-bet">
            <Button size="lg">Start Betting Now</Button>
          </Link>
        ) : (
          <>
            <Link href="/auth/sign-up">
              <Button>Sign-up</Button>
            </Link>
            <Link href="/auth/sign-in">
              <Button>Sign-in</Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
