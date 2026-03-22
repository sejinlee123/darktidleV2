import { auth } from "@/lib/auth";
import { normalizeWordleStreak } from "@/lib/wordle-daily";
import { prisma } from "@/lib/prisma";

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const dateKey = url.searchParams.get("dateKey");
  if (!dateKey || !DATE_KEY.test(dateKey)) {
    return Response.json(
      { error: "dateKey query (YYYY-MM-DD) required" },
      { status: 400 },
    );
  }

  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session?.user?.id) {
    return Response.json({
      loggedIn: false,
      currentStreak: 0,
      maxStreak: 0,
      lastWinDate: null,
      today: null,
    });
  }

  const userId = session.user.id;

  const [stats, todayRow] = await Promise.all([
    prisma.wordlePlayerStats.findUnique({ where: { userId } }),
    prisma.wordleDailyResult.findUnique({
      where: {
        userId_dateKey: { userId, dateKey },
      },
    }),
  ]);

  let currentStreak = stats?.currentStreak ?? 0;
  const normalized = normalizeWordleStreak(
    stats?.lastWinDate ?? null,
    currentStreak,
    dateKey,
  );

  if (stats && normalized !== stats.currentStreak) {
    currentStreak = normalized;
    await prisma.wordlePlayerStats.update({
      where: { userId },
      data: { currentStreak: normalized },
    });
  } else {
    currentStreak = normalized;
  }

  return Response.json({
    loggedIn: true,
    currentStreak,
    maxStreak: stats?.maxStreak ?? 0,
    lastWinDate: stats?.lastWinDate ?? null,
    today: todayRow
      ? { won: todayRow.won, guessCount: todayRow.guessCount }
      : null,
  });
}
