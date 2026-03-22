import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session?.user?.id) {
    return Response.json({
      loggedIn: false,
      currentStreak: 0,
      bestStreak: 0,
    });
  }

  const row = await prisma.heardleLeaderboard.findUnique({
    where: { userId: session.user.id },
  });

  return Response.json({
    loggedIn: true,
    currentStreak: row?.currentStreak ?? 0,
    bestStreak: row?.bestStreak ?? 0,
  });
}
