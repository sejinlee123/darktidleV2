"use client";

import { LibraryComboboxSelect } from "@/components/library/LibraryComboboxSelect";
import { abilityNameOptions } from "@/data/quotes";

type LibraryAbilitySelectProps = {
  value: string;
  /** `""` = any ability; otherwise exact `Quote.category`. */
  onChange: (category: string) => void;
  disabled?: boolean;
};

const ABILITY_COMBO_OPTIONS = abilityNameOptions.map((name) => ({
  value: name,
  label: name,
}));

export function LibraryAbilitySelect({
  value,
  onChange,
  disabled = false,
}: LibraryAbilitySelectProps) {
  return (
    <LibraryComboboxSelect
      value={value}
      onChange={onChange}
      disabled={disabled}
      options={ABILITY_COMBO_OPTIONS}
      allLabel="All abilities"
      selectPrompt="Select ability…"
      searchPlaceholder="Search ability…"
    />
  );
}
