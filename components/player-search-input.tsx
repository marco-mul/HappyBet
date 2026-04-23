"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, X } from "lucide-react";
import { searchUsers } from "@/app/actions";

export type PlayerData = { name: string; userId: string | null };

export function PlayerSearchInput({
  index,
  player,
  onChange,
  onRemove,
  showRemove,
}: {
  index: number;
  player: PlayerData;
  onChange: (p: PlayerData) => void;
  onRemove: () => void;
  showRemove: boolean;
}) {
  const [results, setResults] = useState<{ id: string; name: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [searched, setSearched] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const delay = !player.name.trim() || player.userId ? 0 : 300;
    const timer = setTimeout(async () => {
      if (!player.name.trim() || player.userId) {
        setResults([]);
        setSearched(false);
        setOpen(false);
        return;
      }
      try {
        const users = await searchUsers(player.name);
        setResults(users);
        setSearched(true);
        setOpen(true);
      } catch (err) {
        console.error("searchUsers failed:", err);
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [player.name, player.userId]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={`player_${index + 1}`}>Player {index + 1}</Label>
        {showRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-muted-foreground hover:text-destructive"
            aria-label={`Remove player ${index + 1}`}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <input type="hidden" name={`player_${index + 1}_id`} value={player.userId ?? ""} />
      <div ref={containerRef} className="relative">
        <div className="relative">
          <Input
            id={`player_${index + 1}`}
            name={`player_${index + 1}`}
            value={player.name}
            onChange={(e) => onChange({ name: e.target.value, userId: null })}
            onFocus={() => { if (results.length > 0) setOpen(true); }}
            placeholder="Search by name…"
            required
            autoComplete="off"
          />
          {player.userId && (
            <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
          )}
        </div>
        {open && (
          <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-md">
            {searched && results.length === 0 && (
              <p className="px-3 py-2 text-sm text-muted-foreground">No users found.</p>
            )}
            {results.map((user) => (
              <button
                key={user.id}
                type="button"
                className="w-full px-3 py-2 text-left text-sm hover:bg-accent"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange({ name: user.name, userId: user.id });
                  setOpen(false);
                }}
              >
                {user.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
