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
import { cn } from "@/lib/utils";

export type LibraryComboboxOption = {
  value: string;
  label: string;
};

export type LibraryComboboxSelectProps = {
  value: string;
  onChange: (value: string) => void;
  /** Rows after the “all” option (each `value` is what `onChange` receives). */
  options: LibraryComboboxOption[];
  allLabel: string;
  /** Shown on the trigger while the menu is open. */
  selectPrompt: string;
  searchPlaceholder: string;
  disabled?: boolean;
};

export function LibraryComboboxSelect({
  value,
  onChange,
  options,
  allLabel,
  selectPrompt,
  searchPlaceholder,
  disabled = false,
}: LibraryComboboxSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const rows = React.useMemo(
    () => [{ value: "", label: allLabel }, ...options],
    [allLabel, options],
  );

  const selectedLabel = React.useMemo(() => {
    if (!value) return allLabel;
    const hit = options.find((o) => o.value === value);
    return hit?.label ?? value;
  }, [value, allLabel, options]);

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
          {isOpen ? selectPrompt : selectedLabel}
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
            filter={(cmdValue, search) => {
              const q = search.trim().toLowerCase();
              if (!q) return 1;
              if (cmdValue.toLowerCase().includes(q)) return 1;
              return 0;
            }}
          >
            <div className="border-b border-primary/15 bg-black px-1 pt-1">
              <CommandInput
                placeholder={searchPlaceholder}
                className="h-11 border-0! bg-transparent! text-white placeholder:text-zinc-500 uppercase"
              />
            </div>

            <CommandList className="max-h-64 border-t border-primary/10">
              <CommandEmpty className="py-10 text-center text-[10px] uppercase tracking-[0.2em] text-primary/50">
                — No match found in vox archive —
              </CommandEmpty>
              <CommandGroup>
                {rows.map((o) => (
                  <CommandItem
                    key={o.value || "__all__"}
                    value={`${o.label} ${o.value}`}
                    className={cn(
                      "cursor-pointer py-3.5 text-xs font-medium uppercase",
                      "text-primary/85",
                      "data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground",
                      "aria-selected:bg-primary aria-selected:text-primary-foreground",
                      "data-[selected=true]:ring-2 data-[selected=true]:ring-primary/45 data-[selected=true]:ring-inset",
                      "[&_svg]:text-primary-foreground",
                    )}
                    onSelect={() => {
                      onChange(o.value);
                      setIsOpen(false);
                    }}
                  >
                    {o.label}
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
