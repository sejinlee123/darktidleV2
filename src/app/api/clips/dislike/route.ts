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

  const existing = await prisma.clipDislike.findUnique({
    where: {
      userId_clipPath: { userId, clipPath: path },
    },
  });

  if (immutable) {
    const liked = await prisma.clipLike.findUnique({
      where: {
        userId_clipPath: { userId, clipPath: path },
      },
    });
    if (liked) {
      return Response.json(
        { error: "already_reacted", message: "You already voted on this clip." },
        { status: 409 },
      );
    }
    if (existing) {
      const count = await prisma.clipDislike.count({ where: { clipPath: path } });
      const likeCount = await prisma.clipLike.count({ where: { clipPath: path } });
      return Response.json({
        disliked: true,
        count,
        likeCount,
        locked: true,
      });
    }
    await prisma.clipDislike.create({
      data: { userId, clipPath: path },
    });
    const count = await prisma.clipDislike.count({ where: { clipPath: path } });
    const likeCount = await prisma.clipLike.count({ where: { clipPath: path } });

    return Response.json({
      disliked: true,
      count,
      likeCount,
      locked: true,
    });
  }

  if (existing) {
    await prisma.clipDislike.delete({ where: { id: existing.id } });
  } else {
    await prisma.clipLike.deleteMany({
      where: { userId, clipPath: path },
    });
    await prisma.clipDislike.create({
      data: { userId, clipPath: path },
    });
  }

  const count = await prisma.clipDislike.count({ where: { clipPath: path } });
  const likeCount = await prisma.clipLike.count({ where: { clipPath: path } });

  return Response.json({
    disliked: !existing,
    count,
    likeCount,
  });
}
