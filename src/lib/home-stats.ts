import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { ONLINE_WINDOW_MS } from "@/lib/heardle";
import { prisma } from "@/lib/prisma";

export async function getHomeStats() {
  const since = new Date(Date.now() - ONLINE_WINDOW_MS);
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const [activeAgents, board] = await Promise.all([
    prisma.user.count({
      where: { lastSeenAt: { gte: since } },
    }),
    session?.user?.id
      ? prisma.heardleLeaderboard.findUnique({
          where: { userId: session.user.id },
          select: { bestStreak: true },
        })
      : Promise.resolve(null),
  ]);

  const loggedIn = Boolean(session?.user?.id);

  return {
    activeAgents,
    bestStreak: loggedIn ? (board?.bestStreak ?? 0) : 0,
    streakLoggedIn: loggedIn,
  };
}
