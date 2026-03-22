import { auth } from "@/lib/auth";
import { HEARDLE_STREAK_CAP } from "@/lib/heardle";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const existing = await prisma.heardleLeaderboard.findUnique({
    where: { userId },
  });

  const nextCurrent = existing
    ? Math.min(HEARDLE_STREAK_CAP, existing.currentStreak + 1)
    : 1;
  const nextBest = Math.min(
    HEARDLE_STREAK_CAP,
    Math.max(existing?.bestStreak ?? 0, nextCurrent),
  );

  const row = await prisma.heardleLeaderboard.upsert({
    where: { userId },
    create: {
      userId,
      currentStreak: nextCurrent,
      bestStreak: nextBest,
    },
    update: {
      currentStreak: nextCurrent,
      bestStreak: nextBest,
    },
  });

  return Response.json({
    currentStreak: row.currentStreak,
    bestStreak: row.bestStreak,
  });
}
