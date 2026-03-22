"use client";

import * as React from "react";
import { IconChevronsUpDown } from "@/components/mission-icons";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { personalities } from "@/data/quotes";
import { cn } from "@/lib/utils";

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
  const [isOpen, setIsOpen] = React.useState(false);

  const availableOptions = React.useMemo(
    () =>
      personalities.filter(
        (p) => !attempts.some((g) => g.personality === p.value),
      ),
    [attempts],
  );

  return (
    <div className="w-full space-y-2 transition-all duration-300">
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-12 w-full justify-between border-primary/25 bg-card px-3 text-primary shadow-none hover:border-primary/55 hover:bg-accent/40 hover:text-primary",
          "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/55",
          isOpen && "rounded-b-none border-b-0 border-primary/40",
        )}
      >
        <span className="truncate text-left text-xs font-semibold uppercase tracking-tighter">
          {isOpen ? "Select agent…" : "Initialize decryption…"}
        </span>
        <IconChevronsUpDown
          className={cn(
            "ml-2 size-5 shrink-0 text-primary/70 transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </Button>

      {isOpen ? (
        <div className="relative overflow-hidden rounded-b-lg border border-t-0 border-primary/35 bg-popover shadow-md">
          <div
            className="pointer-events-none absolute inset-0 z-10 opacity-[0.06]"
            style={{
              background:
                "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(0, 255, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 255, 0, 0.06))",
              backgroundSize: "100% 2px, 3px 100%",
            }}
          />

          <Command
            className="relative z-20 rounded-none! border-0 bg-transparent p-0 shadow-none"
            filter={(value, search) => {
              if (value.toLowerCase().includes(search.toLowerCase())) return 1;
              return 0;
            }}
          >
            <div className="border-b border-primary/15 bg-black px-1 pt-1">
              <CommandInput
                placeholder="Enter agent credentials…"
                className="h-11 border-0! bg-transparent! text-white placeholder:text-zinc-500 uppercase"
              />
            </div>

            <CommandList className="max-h-64 border-t border-primary/10">
              <CommandEmpty className="py-10 text-center text-[10px] uppercase tracking-[0.2em] text-primary/50">
                — No match found in vox archive —
              </CommandEmpty>
              <CommandGroup>
                {availableOptions.map((p) => (
                  <CommandItem
                    key={p.value}
                    value={p.label}
                    className={cn(
                      "cursor-pointer py-3.5 text-xs font-medium uppercase",
                      "text-primary/85",
                      "data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground",
                      "aria-selected:bg-primary aria-selected:text-primary-foreground",
                      "data-[selected=true]:ring-2 data-[selected=true]:ring-primary/45 data-[selected=true]:ring-inset",
                      "[&_svg]:text-primary-foreground",
                    )}
                    onSelect={() => {
                      onGuess({ personality: p.value });
                      setIsOpen(false);
                    }}
                  >
                    {p.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      ) : null}
    </div>
  );
}
