"use client";

import { authClient } from "@/lib/auth/client";
import type { AuthSession } from "@/lib/auth/server";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, MoreVertical, Plus } from "lucide-react";
import { useTransition } from "react";
import DarkModeToggle from "./DarkModeToggle";
import { useRouter } from "next/navigation";

export default function Navbar({ session }: { session: AuthSession }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSignOut = () => {
    startTransition(async () => {
      await authClient.signOut();
      router.refresh();
    });
  };

  return (
    <nav className="bg-background shadow-md shadow-[#F7941D] py-4 border-b border-[#F7941D] dark:border-[#F7941D] fixed w-full z-10">
      <div className="container mx-auto flex justify-between items-center not-first:px-6 lg:px-8">
        <Link href={"/"} className="flex items-center">
          <Image src={"/hb-text.png"} alt="HappyBet" height={50} width={200} />
        </Link>
        <div className="flex items-center space-x-4">
          {session ? (
            <>
              <Link
                href={"/dashboard"}
                className="text-foreground hover:text-gray-500 dark:hover:text-gray-400"
              >
                Dashboard
              </Link>
              <Link
                href={"/create-bet"}
                className="text-foreground hover:text-gray-500 dark:hover:text-gray-400"
              >
                <Button variant="outline" className="hover:cursor-pointer">
                  New Bet
                  <Plus className="h-4 w-4" />
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="hover:cursor-pointer">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    Signed in as {session.user.name ?? session.user.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    disabled={isPending}
                    className="cursor-pointer"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Signing out...
                      </>
                    ) : (
                      "Sign out"
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button
                asChild
                variant="outline"
                className="hover:cursor-pointer"
              >
                <Link href="/auth/sign-in">Sign in</Link>
              </Button>
              <Button asChild className="hover:cursor-pointer">
                <Link href="/auth/sign-up">Sign up</Link>
              </Button>
            </>
          )}
          <DarkModeToggle />
        </div>
      </div>
    </nav>
  );
}
