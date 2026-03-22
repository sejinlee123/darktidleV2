import type { Metadata } from "next";

import { HeardleGame } from "@/components/heardle/HeardleGame";

export const metadata: Metadata = {
  title: "Vox Heardle",
  description:
    "Daily Darktide voice-line guessing game: hear a clip, pick the personality (Zealot, Veteran, Psyker, Ogryn…). Streaks sync when you sign in.",
  alternates: { canonical: "/heardle" },
};

export default function HeardlePage() {
  return <HeardleGame />;
}
