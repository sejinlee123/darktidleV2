import type { Metadata } from "next";

import { DarktidleWordle } from "@/components/wordle/DarktidleWordle";

export const metadata: Metadata = {
  title: "Tertium cipher",
  description:
    "Daily Wordle-style puzzle on a Darktide-themed word list — same answer for everyone each day, four to seven letters, with guest or signed-in streaks.",
  alternates: { canonical: "/wordle" },
};

export default function WordlePage() {
  return <DarktidleWordle />;
}
