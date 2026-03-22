import Link from "next/link";
import type { ComponentType } from "react";

import {
  IconAudioLines,
  IconRadio,
  IconWordGrid,
} from "@/components/mission-icons";

import { HomeStatsFooter } from "@/components/home/HomeStatsFooter";
import { buttonVariants } from "@/components/ui/button-variants";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getHomeStats } from "@/lib/home-stats";
import { cn } from "@/lib/utils";

type HomeCard = {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  icon: ComponentType<{ className?: string }>;
};

const homeCards: HomeCard[] = [
  {
    href: "/heardle",
    eyebrow: "Audio",
    title: "Vox Heardle",
    description:
      "Hear a Darktide voice line and guess the personality (Zealot, Veteran, Psyker, Ogryn…). Seven wrong guesses and the vox cuts out. Win streaks sync to your account when you sign in, or stay in this browser as a guest.",
    cta: "Play Vox Heardle",
    icon: IconRadio,
  },
  {
    href: "/wordle",
    eyebrow: "Words",
    title: "Tertium cipher",
    description:
      "Daily Wordle-style cipher on a shuffled Darktide word list: same answer for everyone on each calendar day, four to seven letters, a growing grid after six guesses, or surrender with Heresy (reveal + short lockout). Streaks stay in this browser as a guest or sync when you sign in.",
    cta: "Play cipher",
    icon: IconWordGrid,
  },
  {
    href: "/library",
    eyebrow: "Archive",
    title: "Vox archive",
    description:
      "Search and filter the full clip list by line text, ability, class, and gender; play or download MP3s; like lines or mark them heresy (saved when you are logged in).",
    cta: "Open archive",
    icon: IconAudioLines,
  },
];

export default async function Home() {
  const { activeAgents, bestStreak, streakLoggedIn } = await getHomeStats();

  return (
    <div className="flex flex-col items-center justify-center space-y-10 py-10">
      <div className="space-y-4 text-center">
        <h1 className="text-6xl font-black tracking-tighter text-primary drop-shadow-[0_0_18px_oklch(0.78_0.19_145_/_0.35)]">
          Darktidle
        </h1>
        <p className="mx-auto max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground">
          Fan-made Warhammer 40,000: Darktide hub: voice guessing, a themed word
          game, and a searchable archive—plus a leaderboard for signed-in
          Heardle streaks.
        </p>
        <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground/90">
          Non-commercial fan project // Not affiliated with Fatshark or Games
          Workshop
        </p>
      </div>

      <div className="grid w-full max-w-6xl grid-cols-1 gap-6 px-4 sm:grid-cols-2 lg:grid-cols-3">
        {homeCards.map(
          ({ href, eyebrow, title, description, cta, icon: Icon }) => (
            <Card
              key={href}
              className={cn(
                "group relative flex min-h-[280px] flex-col overflow-hidden",
                "border-2 border-primary/20 bg-card/90 bg-gradient-to-b from-card via-card to-muted/15",
                "shadow-md shadow-black/5 ring-1 ring-primary/10",
                "transition-[border-color,box-shadow,transform] duration-200",
                "hover:-translate-y-0.5 hover:border-primary/45 hover:shadow-lg hover:shadow-primary/10 hover:ring-primary/25",
                "dark:shadow-black/40",
              )}
            >
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
                aria-hidden
              />
              <CardHeader className="gap-4 space-y-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/80">
                      {eyebrow}
                    </p>
                    <CardTitle className="text-xl font-bold tracking-tight">
                      {title}
                    </CardTitle>
                  </div>
                  <div
                    className={cn(
                      "flex size-11 shrink-0 items-center justify-center rounded-xl",
                      "bg-primary/10 ring-1 ring-primary/25",
                      "transition-[background-color,box-shadow] group-hover:bg-primary/15 group-hover:ring-primary/40",
                    )}
                  >
                    <Icon className="size-6 text-primary group-hover:animate-pulse" />
                  </div>
                </div>
                <CardDescription className="text-pretty text-sm leading-relaxed">
                  {description}
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto pt-2">
                <Link
                  href={href}
                  className={cn(
                    buttonVariants({ variant: "default", size: "lg" }),
                    "h-11 w-full font-bold focus-visible:ring-[3px] focus-visible:ring-primary/45",
                  )}
                >
                  {cta}
                </Link>
              </CardContent>
            </Card>
          ),
        )}
      </div>

      <HomeStatsFooter
        activeAgents={activeAgents}
        serverBestStreak={bestStreak}
        streakLoggedIn={streakLoggedIn}
      />
    </div>
  );
}
