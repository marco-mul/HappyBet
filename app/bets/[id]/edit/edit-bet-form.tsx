"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, X } from "lucide-react";
import { updateBet, type UpdateBetState } from "../actions";
import Link from "next/link";

const MAX_PLAYERS = 10;

type Props = {
  betId: string;
  initialDescription: string;
  initialAmount: string;
  initialEventAt: string;
  initialAnswer: "yes" | "no";
  initialPlayers: string[];
};

export function EditBetForm({
  betId,
  initialDescription,
  initialAmount,
  initialEventAt,
  initialAnswer,
  initialPlayers,
}: Props) {
  const boundAction = updateBet.bind(null, betId);
  const [state, formAction, pending] = useActionState<UpdateBetState, FormData>(
    boundAction,
    null
  );
  const [answer, setAnswer] = useState<"yes" | "no">(initialAnswer);
  const [players, setPlayers] = useState<string[]>(initialPlayers);

  const updatePlayer = (index: number, value: string) =>
    setPlayers((prev) => prev.map((p, i) => (i === index ? value : p)));

  const removePlayer = (index: number) =>
    setPlayers((prev) => prev.filter((_, i) => i !== index));

  const addPlayer = () => setPlayers((prev) => [...prev, ""]);

  return (
    <>
      <CardContent>
        <form id="edit-bet-form" action={formAction}>
          <input type="hidden" name="answer" value={answer} />
          {players.map((name, i) => (
            <input key={i} type="hidden" name={`player_${i + 1}`} value={name} />
          ))}
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-x-8 gap-y-6">
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="bet">What are we betting on?</Label>
                  <Input
                    id="bet"
                    name="bet"
                    defaultValue={initialDescription}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount">What are we betting?</Label>
                  <Input
                    id="amount"
                    name="amount"
                    defaultValue={initialAmount}
                    required
                  />
                </div>
              </div>

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
                  <Input
                    id="eventAt"
                    name="eventAt"
                    type="datetime-local"
                    defaultValue={initialEventAt}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="font-bold">Who are you playing with?</div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-6">
              {players.map((name, i) => (
                <div key={i} className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label>Player {i + 1}</Label>
                    {players.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePlayer(i)}
                        className="text-muted-foreground hover:text-destructive"
                        aria-label={`Remove player ${i + 1}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <Input
                    value={name}
                    onChange={(e) => updatePlayer(i, e.target.value)}
                    placeholder="e.g. John"
                    required
                  />
                </div>
              ))}
              {players.length < MAX_PLAYERS && (
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-fit gap-2 text-muted-foreground"
                    onClick={addPlayer}
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
        <Button
          type="submit"
          form="edit-bet-form"
          className="w-full"
          disabled={pending}
        >
          {pending ? "Saving…" : "Save changes"}
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href={`/bets/${betId}`}>Cancel</Link>
        </Button>
      </CardFooter>
    </>
  );
}
