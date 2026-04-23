"use client";

import { useActionState } from "react";
import { setOutcome, type OutcomeState } from "./actions";

export function OutcomeButtons({
  betId,
  currentOutcome,
}: {
  betId: string;
  currentOutcome: boolean | null;
}) {
  const boundAction = setOutcome.bind(null, betId);
  const [state, formAction, pending] = useActionState<OutcomeState, FormData>(boundAction, null);

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-dashed p-4">
      <p className="text-sm font-medium">
        {currentOutcome === null ? "What was the outcome?" : "Outcome"}
      </p>
      <form action={formAction} className="flex gap-2">
        <button
          type="submit"
          name="outcome"
          value="yes"
          disabled={pending}
          className={`flex-1 rounded-md border py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${currentOutcome === true ? "border-green-500 bg-green-500/10 text-green-500" : "border-input text-muted-foreground hover:border-green-500 hover:text-green-500"}`}
        >
          Yes
        </button>
        <button
          type="submit"
          name="outcome"
          value="no"
          disabled={pending}
          className={`flex-1 rounded-md border py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${currentOutcome === false ? "border-red-500 bg-red-500/10 text-red-500" : "border-input text-muted-foreground hover:border-red-500 hover:text-red-500"}`}
        >
          No
        </button>
      </form>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
    </div>
  );
}
