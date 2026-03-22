import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { filterKnownClipPaths } from "@/lib/valid-clip-path";

const MAX_PATHS = 400;

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const paths = (body as { paths?: unknown })?.paths;
  if (!Array.isArray(paths) || paths.some((p) => typeof p !== "string")) {
    return Response.json({ error: "paths must be string[]" }, { status: 400 });
  }

  const unique = filterKnownClipPaths([...new Set(paths)]).slice(0, MAX_PATHS);
  if (unique.length === 0) {
    return Response.json({
      counts: {},
      likedByMe: {},
      dislikeCounts: {},
      dislikedByMe: {},
    });
  }

  const session = await auth.api.getSession({
    headers: req.headers,
  });
  const userId = session?.user?.id;

  const [likeGrouped, dislikeGrouped] = await Promise.all([
    prisma.clipLike.groupBy({
      by: ["clipPath"],
      where: { clipPath: { in: unique } },
      _count: { _all: true },
    }),
    prisma.clipDislike.groupBy({
      by: ["clipPath"],
      where: { clipPath: { in: unique } },
      _count: { _all: true },
    }),
  ]);

  const counts: Record<string, number> = {};
  for (const g of likeGrouped) {
    counts[g.clipPath] = g._count._all;
  }

  const dislikeCounts: Record<string, number> = {};
  for (const g of dislikeGrouped) {
    dislikeCounts[g.clipPath] = g._count._all;
  }

  const likedByMe: Record<string, boolean> = {};
  const dislikedByMe: Record<string, boolean> = {};
  if (userId) {
    const [mineLikes, mineDislikes] = await Promise.all([
      prisma.clipLike.findMany({
        where: { userId, clipPath: { in: unique } },
        select: { clipPath: true },
      }),
      prisma.clipDislike.findMany({
        where: { userId, clipPath: { in: unique } },
        select: { clipPath: true },
      }),
    ]);
    for (const m of mineLikes) {
      likedByMe[m.clipPath] = true;
    }
    for (const m of mineDislikes) {
      dislikedByMe[m.clipPath] = true;
    }
  }

  return Response.json({
    counts,
    likedByMe,
    dislikeCounts,
    dislikedByMe,
  });
}
