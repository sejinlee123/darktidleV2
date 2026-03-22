"use client";

import { LibraryComboboxSelect } from "@/components/library/LibraryComboboxSelect";
import { archetypeClassOptions } from "@/data/quotes";

type LibraryClassSelectProps = {
  value: string;
  /** `""` = any class; otherwise archetype folder key (e.g. `Scum`, `Veteran`). */
  onChange: (folderKey: string) => void;
  disabled?: boolean;
};

const CLASS_COMBO_OPTIONS = archetypeClassOptions.map((o) => ({
  value: o.folderKey,
  label: o.label,
}));

export function LibraryClassSelect({
  value,
  onChange,
  disabled = false,
}: LibraryClassSelectProps) {
  return (
    <LibraryComboboxSelect
      value={value}
      onChange={onChange}
      disabled={disabled}
      options={CLASS_COMBO_OPTIONS}
      allLabel="All classes"
      selectPrompt="Select class…"
      searchPlaceholder="Search class…"
    />
  );
}
