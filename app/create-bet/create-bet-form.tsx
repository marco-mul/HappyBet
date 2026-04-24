"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";
import { createBet, type CreateBetState } from "./actions";
import { PlayerSearchInput, type PlayerData } from "@/components/player-search-input";

const MAX_PLAYERS = 10;

export function CreateBetForm() {
  const [state, formAction, pending] = useActionState<CreateBetState, FormData>(
    createBet,
    null
  );
  const [players, setPlayers] = useState<PlayerData[]>([{ name: "", userId: null }]);
  const [answer, setAnswer] = useState<"yes" | "no" | null>(null);
  const [tzOffset] = useState(() =>
    typeof window === "undefined" ? 0 : new Date().getTimezoneOffset()
  );

  return (
    <>
      <CardContent>
        <form id="create-bet-form" action={formAction}>
          <input type="hidden" name="answer" value={answer ?? ""} />
          <input type="hidden" name="tzOffset" value={tzOffset} suppressHydrationWarning />
          <div className="flex flex-col gap-6">
            {/* Top: two columns */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-6">
              {/* Left column: bet details */}
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="bet">What are we betting on?</Label>
                  <Input
                    id="bet"
                    name="bet"
                    placeholder="e.g. Will Victor be more than 10 minutes late?"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount">What are we betting?</Label>
                  <Input
                    id="amount"
                    name="amount"
                    placeholder="e.g. A beer, a pizza, etc."
                    required
                  />
                </div>
              </div>

              {/* Right column: dates */}
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label>What is your answer?</Label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setAnswer("yes")}
                      className={`flex-1 rounded-md border py-1.5 text-sm font-medium transition-colors ${answer === "yes" ? "border-green-500 bg-green-500/10 text-green-500" : "border-input text-muted-foreground hover:border-green-500 hover:text-green-500"}`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setAnswer("no")}
                      className={`flex-1 rounded-md border py-1.5 text-sm font-medium transition-colors ${answer === "no" ? "border-red-500 bg-red-500/10 text-red-500" : "border-input text-muted-foreground hover:border-red-500 hover:text-red-500"}`}
                    >
                      No
                    </button>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="eventAt">Date &amp; time of event</Label>
                  <Input id="eventAt" name="eventAt" type="datetime-local" required />
                </div>
              </div>
            </div>

            {/* Bottom: players full width */}
            <div className="font-bold">Who are you playing with?</div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-6">
              {players.map((player, i) => (
                <PlayerSearchInput
                  key={i}
                  index={i}
                  player={player}
                  onChange={(p) =>
                    setPlayers((prev) => prev.map((pl, idx) => (idx === i ? p : pl)))
                  }
                  onRemove={() =>
                    setPlayers((prev) => prev.filter((_, idx) => idx !== i))
                  }
                  showRemove={i > 0}
                />
              ))}
              {players.length < MAX_PLAYERS && (
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-fit gap-2 text-muted-foreground"
                    onClick={() =>
                      setPlayers((prev) => [...prev, { name: "", userId: null }])
                    }
                  >
                    <PlusCircle className="h-4 w-4" />
                    Add player
                  </Button>
                </div>
              )}
            </div>

            {state?.error && (
              <p className="text-sm text-destructive">{state.error}</p>
            )}
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button type="submit" form="create-bet-form" className="w-full" disabled={pending}>
          {pending ? "Creating..." : "Create Bet"}
        </Button>
        <Button variant="outline" className="w-full" type="button">
          Cancel
        </Button>
      </CardFooter>
    </>
  );
}
