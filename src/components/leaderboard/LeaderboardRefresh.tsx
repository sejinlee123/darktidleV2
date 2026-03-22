"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function LeaderboardRefresh() {
  const router = useRouter();
  return (
    <Button
      type="button"
      variant="link"
      className="h-auto p-0 text-[10px] font-bold uppercase text-primary hover:text-primary/90 focus-visible:ring-2 focus-visible:ring-primary/40"
      onClick={() => router.refresh()}
    >
      Refresh rankings
    </Button>
  );
}
