import { auth } from "@/lib/auth";
import { nextStreakOnWin } from "@/lib/wordle-daily";
import { prisma } from "@/lib/prisma";

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;

type Body = {
  dateKey?: string;
  won?: boolean;
  guessCount?: number;
};

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { dateKey, won, guessCount } = body;
  if (!dateKey || !DATE_KEY.test(dateKey)) {
    return Response.json({ error: "dateKey (YYYY-MM-DD) required" }, { status: 400 });
  }
  if (typeof won !== "boolean") {
    return Response.json({ error: "won boolean required" }, { status: 400 });
  }
  const gc =
    typeof guessCount === "number" && Number.isFinite(guessCount)
      ? Math.max(1, Math.min(99, Math.floor(guessCount)))
      : won
        ? 6
        : 6;

  const existing = await prisma.wordleDailyResult.findUnique({
    where: { userId_dateKey: { userId, dateKey } },
  });

  if (existing) {
    const stats = await prisma.wordlePlayerStats.findUnique({
      where: { userId },
    });
    const currentStreak = stats?.currentStreak ?? 0;
    return Response.json({
      ok: true,
      idempotent: true,
      currentStreak,
      maxStreak: stats?.maxStreak ?? 0,
      lastWinDate: stats?.lastWinDate ?? null,
    });
  }

  const stats = await prisma.wordlePlayerStats.findUnique({
    where: { userId },
  });

  await prisma.$transaction(async (tx) => {
    await tx.wordleDailyResult.create({
      data: { userId, dateKey, won, guessCount: gc },
    });

    if (won) {
      const next = nextStreakOnWin(
        stats?.lastWinDate ?? null,
        stats?.currentStreak ?? 0,
        dateKey,
      );
      const maxStreak = Math.max(stats?.maxStreak ?? 0, next);
      await tx.wordlePlayerStats.upsert({
        where: { userId },
        create: {
          userId,
          currentStreak: next,
          maxStreak,
          lastWinDate: dateKey,
        },
        update: {
          currentStreak: next,
          maxStreak,
          lastWinDate: dateKey,
        },
      });
    } else {
      await tx.wordlePlayerStats.upsert({
        where: { userId },
        create: {
          userId,
          currentStreak: 0,
          maxStreak: stats?.maxStreak ?? 0,
          lastWinDate: stats?.lastWinDate ?? null,
        },
        update: {
          currentStreak: 0,
        },
      });
    }
  });

  const updated = await prisma.wordlePlayerStats.findUnique({
    where: { userId },
  });

  return Response.json({
    ok: true,
    idempotent: false,
    currentStreak: updated?.currentStreak ?? 0,
    maxStreak: updated?.maxStreak ?? 0,
    lastWinDate: updated?.lastWinDate ?? null,
  });
}
