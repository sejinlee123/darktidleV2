"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

const COOLDOWN_SEC = 5;

export function LeaderboardRefresh() {
  const router = useRouter();
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setTimeout(() => {
      setCooldown((s) => s - 1);
    }, 1000);
    return () => window.clearTimeout(id);
  }, [cooldown]);

  return (
    <Button
      type="button"
      variant="link"
      disabled={cooldown > 0}
      className="h-auto min-w-[9rem] justify-end p-0 text-[10px] font-bold uppercase text-primary hover:text-primary/90 focus-visible:ring-2 focus-visible:ring-primary/40 disabled:pointer-events-none disabled:opacity-50"
      onClick={() => {
        if (cooldown > 0) return;
        router.refresh();
        setCooldown(COOLDOWN_SEC);
      }}
    >
      {cooldown > 0 ? `Wait ${cooldown}s` : "Refresh rankings"}
    </Button>
  );
}
