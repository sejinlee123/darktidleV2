"use client";

import { useEffect, useState } from "react";

import { IconShield, IconTrophy } from "@/components/mission-icons";
import { readGuestHeardleStreak } from "@/lib/heardle-guest-streak";

type HomeStatsFooterProps = {
  activeAgents: number;
  /** Heardle best streak from DB when `streakLoggedIn`; ignored for display when guest. */
  serverBestStreak: number;
  streakLoggedIn: boolean;
};

export function HomeStatsFooter({
  activeAgents,
  serverBestStreak,
  streakLoggedIn,
}: HomeStatsFooterProps) {
  const [guestBest, setGuestBest] = useState(0);

  useEffect(() => {
    if (streakLoggedIn) return;
    setGuestBest(readGuestHeardleStreak().best);
  }, [streakLoggedIn]);

  const bestStreak = streakLoggedIn ? serverBestStreak : guestBest;

  return (
    <div className="flex w-full max-w-2xl flex-wrap justify-center gap-8 border-t border-border pt-8">
      <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground">
        <IconShield className="size-4 shrink-0 text-primary/80" />
        <span>Active agents: {activeAgents}</span>
      </div>
      <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground">
        <IconTrophy className="size-4 shrink-0 text-primary/80" />
        <span>Best streak: {bestStreak}</span>
      </div>
    </div>
  );
}
