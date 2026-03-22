"use client";

import { useMemo, useState } from "react";
import { personalities } from "@/data/quotes";

export interface Guess {
  personality: string;
}

type GuessInputProps = {
  onGuess: (guess: Guess) => void;
  attempts: Guess[];
  disabled?: boolean;
};

export function GuessInput({
  onGuess,
  attempts,
  disabled = false,
}: GuessInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const availableOptions = useMemo(
    () =>
      personalities.filter(
        (p) => !attempts.some((g) => g.personality === p.value),
      ),
    [attempts],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return availableOptions;
    return availableOptions.filter(
      (p) =>
        p.label.toLowerCase().includes(q) ||
        p.value.toLowerCase().includes(q),
    );
  }, [availableOptions, search]);

  return (
    <div className="w-full space-y-2 transition-all duration-300">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-12 w-full items-center justify-between rounded-md border border-primary/20 bg-zinc-950 px-3 text-left text-sm font-medium uppercase tracking-tighter text-primary transition-all hover:border-primary/50 disabled:opacity-50 ${
          isOpen ? "rounded-b-none border-b-0" : ""
        }`}
      >
        <span className="truncate text-primary/90">
          {isOpen ? "Select agent…" : "Initialize decryption…"}
        </span>
        <svg
          className={`ml-2 size-5 shrink-0 text-primary opacity-50 transition-transform ${isOpen ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {isOpen ? (
        <div className="relative overflow-hidden rounded-b-md border border-t-0 border-primary/30 bg-zinc-950">
          <div
            className="pointer-events-none absolute inset-0 z-10 opacity-[0.05]"
            style={{
              background:
                "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(0, 255, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 255, 0, 0.06))",
              backgroundSize: "100% 2px, 3px 100%",
            }}
          />

          <div className="relative z-20 border-b border-primary/10 bg-black px-3">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Enter agent credentials…"
              autoFocus
              className="h-12 w-full border-0 bg-transparent text-sm uppercase text-white placeholder:text-zinc-500 focus:outline-none focus:ring-0"
            />
          </div>

          <ul
            className="relative z-20 max-h-64 overflow-y-auto border-t border-primary/10 py-1"
            role="listbox"
          >
            {filtered.length === 0 ? (
              <li className="px-4 py-10 text-center text-[10px] uppercase tracking-[0.2em] text-primary/40">
                — No match found in vox archive —
              </li>
            ) : (
              filtered.map((p) => (
                <li key={p.value}>
                  <button
                    type="button"
                    className="w-full px-4 py-3 text-left text-xs font-medium uppercase text-primary/80 transition-colors hover:bg-primary/15 hover:text-primary"
                    onClick={() => {
                      onGuess({ personality: p.value });
                      setIsOpen(false);
                      setSearch("");
                    }}
                  >
                    {p.label}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
