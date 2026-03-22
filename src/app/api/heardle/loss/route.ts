import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const row = await prisma.heardleLeaderboard.upsert({
    where: { userId },
    create: {
      userId,
      currentStreak: 0,
      bestStreak: 0,
    },
    update: {
      currentStreak: 0,
    },
  });

  return Response.json({
    currentStreak: row.currentStreak,
    bestStreak: row.bestStreak,
  });
}
