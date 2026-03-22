import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isKnownClipPath } from "@/lib/valid-clip-path";

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const clipPath = (body as { clipPath?: unknown })?.clipPath;
  const immutable = Boolean((body as { immutable?: unknown }).immutable);
  if (typeof clipPath !== "string" || !clipPath.trim()) {
    return Response.json({ error: "clipPath required" }, { status: 400 });
  }

  const path = clipPath.trim();
  if (!isKnownClipPath(path)) {
    return Response.json({ error: "unknown_clip" }, { status: 400 });
  }

  const userId = session.user.id;

  const existing = await prisma.clipLike.findUnique({
    where: {
      userId_clipPath: { userId, clipPath: path },
    },
  });

  if (immutable) {
    const disliked = await prisma.clipDislike.findUnique({
      where: {
        userId_clipPath: { userId, clipPath: path },
      },
    });
    if (disliked) {
      return Response.json(
        { error: "already_reacted", message: "You already voted on this clip." },
        { status: 409 },
      );
    }
    if (existing) {
      const [count, dislikeCount] = await Promise.all([
        prisma.clipLike.count({ where: { clipPath: path } }),
        prisma.clipDislike.count({ where: { clipPath: path } }),
      ]);
      return Response.json({
        liked: true,
        count,
        dislikeCount,
        locked: true,
      });
    }
    await prisma.clipLike.create({
      data: { userId, clipPath: path },
    });
    const [count, dislikeCount] = await Promise.all([
      prisma.clipLike.count({ where: { clipPath: path } }),
      prisma.clipDislike.count({ where: { clipPath: path } }),
    ]);
    return Response.json({
      liked: true,
      count,
      dislikeCount,
      locked: true,
    });
  }

  if (existing) {
    await prisma.clipLike.delete({ where: { id: existing.id } });
  } else {
    await prisma.clipDislike.deleteMany({
      where: { userId, clipPath: path },
    });
    await prisma.clipLike.create({
      data: { userId, clipPath: path },
    });
  }

  const [count, dislikeCount] = await Promise.all([
    prisma.clipLike.count({ where: { clipPath: path } }),
    prisma.clipDislike.count({ where: { clipPath: path } }),
  ]);

  return Response.json({
    liked: !existing,
    count,
    dislikeCount,
  });
}
