"use client";

import { LibraryComboboxSelect } from "@/components/library/LibraryComboboxSelect";

type LibraryGenderSelectProps = {
  value: "" | "Male" | "Female";
  onChange: (gender: "" | "Male" | "Female") => void;
  disabled?: boolean;
};

const GENDER_COMBO_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
];

export function LibraryGenderSelect({
  value,
  onChange,
  disabled = false,
}: LibraryGenderSelectProps) {
  return (
    <LibraryComboboxSelect
      value={value}
      onChange={(v) => onChange(v as "" | "Male" | "Female")}
      disabled={disabled}
      options={GENDER_COMBO_OPTIONS}
      allLabel="Any gender"
      selectPrompt="Select gender…"
      searchPlaceholder="Search gender…"
    />
  );
}
