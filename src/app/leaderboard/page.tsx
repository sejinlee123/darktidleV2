import { headers } from "next/headers";
import Link from "next/link";

import {
  IconMedal,
  IconTarget,
  IconTrophy,
  IconUser,
} from "@/components/mission-icons";

import { LeaderboardRefresh } from "@/components/leaderboard/LeaderboardRefresh";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button-variants";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;
const MAX_LEADERBOARD = 100;

const leaderboardOrderBy = [
  { bestStreak: "desc" as const },
  { updatedAt: "asc" as const },
];

const leaderboardInclude = {
  user: { select: { name: true, email: true } },
};

function displayName(u: { name: string; email: string }) {
  const n = u.name?.trim();
  if (n) return n;
  const at = u.email.indexOf("@");
  return at > 0 ? u.email.slice(0, at) : u.email;
}

function parsePageIndex(raw: string | undefined): number {
  const n = Number.parseInt(raw ?? "1", 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return n;
}

type LeaderboardPageProps = {
  searchParams?: Promise<{ page?: string | string[] }>;
};

export default async function LeaderboardPage({
  searchParams,
}: LeaderboardPageProps) {
  const sp = (await searchParams) ?? {};
  const rawPage = Array.isArray(sp.page) ? sp.page[0] : sp.page;

  const hdrs = await headers();
  const [session, totalBoard] = await Promise.all([
    auth.api.getSession({ headers: hdrs }),
    prisma.heardleLeaderboard.count(),
  ]);

  const effectiveTotal =
    totalBoard === 0 ? 0 : Math.min(totalBoard, MAX_LEADERBOARD);
  const pageCount =
    effectiveTotal === 0 ? 1 : Math.ceil(effectiveTotal / PAGE_SIZE);
  const page = Math.min(parsePageIndex(rawPage), pageCount);

  const skip = (page - 1) * PAGE_SIZE;

  const [top3, pageRows, mine] = await Promise.all([
    prisma.heardleLeaderboard.findMany({
      orderBy: leaderboardOrderBy,
      take: 3,
      include: leaderboardInclude,
    }),
    prisma.heardleLeaderboard.findMany({
      orderBy: leaderboardOrderBy,
      skip,
      take: PAGE_SIZE,
      include: leaderboardInclude,
    }),
    session?.user?.id
      ? prisma.heardleLeaderboard.findUnique({
          where: { userId: session.user.id },
          select: { bestStreak: true },
        })
      : Promise.resolve(null),
  ]);

  let yourRank: number | null = null;
  const yourBest = mine?.bestStreak ?? 0;
  if (session?.user?.id && yourBest > 0) {
    yourRank =
      (await prisma.heardleLeaderboard.count({
        where: { bestStreak: { gt: yourBest } },
      })) + 1;
  }

  const rankRows = pageRows.map((r, i) => ({
    ...r,
    rank: skip + i + 1,
  }));

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-6">
      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-black tracking-tighter text-primary drop-shadow-[0_0_12px_oklch(0.78_0.19_145_/_0.25)]">
          Vox archive rankings
        </h1>
        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          Top {MAX_LEADERBOARD} agents · {PAGE_SIZE} per page // Atoma prime sector
        </p>
      </div>

      <div className="grid gap-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {top3.map((agent, i) => (
            <Card
              key={agent.userId}
              className={
                i === 0
                  ? "border-primary/45 bg-card shadow-[0_0_18px_oklch(0.78_0.19_145_/_0.15)] ring-2 ring-primary/30"
                  : "border-border bg-card ring-1 ring-border"
              }
            >
              <CardContent className="space-y-2 pt-6 text-center">
                <div className="flex justify-center">
                  {i === 0 ? (
                    <IconTrophy className="size-8 text-yellow-500" />
                  ) : null}
                  {i === 1 ? (
                    <IconMedal className="size-8 text-zinc-400" />
                  ) : null}
                  {i === 2 ? (
                    <IconMedal className="size-8 text-amber-700" />
                  ) : null}
                </div>
                <p className="text-lg font-black tracking-tight">
                  {displayName(agent.user)}
                </p>
                <div className="text-[10px] font-bold uppercase tracking-widest text-primary">
                  Best {agent.bestStreak} // Current {agent.currentStreak}
                </div>
              </CardContent>
            </Card>
          ))}
          {top3.length === 0 ? (
            <p className="col-span-full text-center text-sm text-muted-foreground">
              No rankings yet. Play Heardle while signed in to record a streak.
            </p>
          ) : null}
        </div>

        <Card className="overflow-hidden border-border ring-1 ring-primary/10">
          <CardHeader className="border-b border-border bg-muted/40">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="flex items-center gap-4">
                <IconTarget className="size-5 text-primary" />
                <CardTitle className="text-xl">Grand archivists</CardTitle>
              </div>
              {effectiveTotal > 0 ? (
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Page {page} of {pageCount} · ranks 1–{effectiveTotal}
                </p>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-border text-[10px] uppercase tracking-widest text-muted-foreground">
                    <th className="px-6 py-4 font-medium">Rank</th>
                    <th className="px-6 py-4 font-medium">Agent</th>
                    <th className="px-6 py-4 text-right font-medium">Current</th>
                    <th className="px-6 py-4 text-right font-medium">
                      Best streak
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rankRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-10 text-center text-sm text-muted-foreground"
                      >
                        No streaks recorded yet. Win Heardle while signed in to
                        appear here.
                      </td>
                    </tr>
                  ) : null}
                  {rankRows.map((agent) => (
                    <tr
                      key={agent.userId}
                      className="group transition-colors hover:bg-primary/10"
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-muted-foreground">
                          #{agent.rank.toString().padStart(3, "0")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-8 items-center justify-center rounded border border-border bg-muted/50 ring-1 ring-transparent transition-[box-shadow] group-hover:border-primary/35 group-hover:ring-primary/20">
                            <IconUser className="size-4 text-muted-foreground" />
                          </div>
                          <span className="text-sm font-bold">
                            {displayName(agent.user)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-semibold text-muted-foreground">
                          {agent.currentStreak}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-black text-primary">
                          {agent.bestStreak}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {effectiveTotal > 0 && pageCount > 1 ? (
              <div className="flex flex-col items-center justify-between gap-3 border-t border-border bg-muted/20 px-4 py-3 sm:flex-row sm:px-6">
                <Link
                  href={page <= 2 ? "/leaderboard" : `/leaderboard?page=${page - 1}`}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    page <= 1 && "pointer-events-none opacity-40",
                  )}
                  aria-disabled={page <= 1}
                  scroll
                >
                  Previous
                </Link>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {page} / {pageCount}
                </span>
                <Link
                  href={
                    page >= pageCount
                      ? `/leaderboard?page=${pageCount}`
                      : `/leaderboard?page=${page + 1}`
                  }
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    page >= pageCount && "pointer-events-none opacity-40",
                  )}
                  aria-disabled={page >= pageCount}
                  scroll
                >
                  Next
                </Link>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 rounded-xl border border-primary/25 bg-primary/8 p-4 ring-1 ring-primary/15 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="size-2 animate-pulse rounded-full bg-primary shadow-[0_0_8px_oklch(0.78_0.19_145_/_0.7)]" />
            <span className="text-xs font-bold uppercase tracking-widest text-foreground">
              {!session?.user
                ? "Sign in to appear on the board"
                : yourRank != null
                  ? `Your ranking: #${yourRank} (best ${yourBest})`
                  : yourBest === 0
                    ? "Play Heardle to build your best streak"
                    : `Your best streak: ${yourBest}`}
            </span>
          </div>
          <LeaderboardRefresh />
        </div>
      </div>
    </div>
  );
}
