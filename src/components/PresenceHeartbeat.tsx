"use client";

import { useEffect } from "react";

import { authClient } from "@/lib/auth-client";

export function PresenceHeartbeat() {
  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (!session?.user) return;

    const ping = () => {
      void fetch("/api/presence/heartbeat", { method: "POST", credentials: "include" });
    };

    ping();
    const id = window.setInterval(ping, 60_000);
    return () => window.clearInterval(id);
  }, [session?.user?.id]);

  return null;
}
