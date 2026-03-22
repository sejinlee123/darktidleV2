"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  IconDownload,
  IconHeart,
  IconMusic,
  IconPlay,
  IconHeresySkull,
} from "@/components/mission-icons";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LibraryAbilitySelect } from "@/components/library/LibraryAbilitySelect";
import { LibraryClassSelect } from "@/components/library/LibraryClassSelect";
import { LibraryGenderSelect } from "@/components/library/LibraryGenderSelect";
import { ScrollArea } from "@/components/ui/scroll-area";
import { allQuotes, type Quote } from "@/data/quotes";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const LIKE_BATCH = 400;
const PAGE_SIZE = 10;

type ClipReactionMeta = {
  likeCount: number;
  liked: boolean;
  dislikeCount: number;
  disliked: boolean;
};

async function fetchReactionsForPaths(paths: string[]) {
  const counts: Record<string, number> = {};
  const likedByMe: Record<string, boolean> = {};
  const dislikeCounts: Record<string, number> = {};
  const dislikedByMe: Record<string, boolean> = {};
  for (let i = 0; i < paths.length; i += LIKE_BATCH) {
    const slice = paths.slice(i, i + LIKE_BATCH);
    const res = await fetch("/api/clips/likes/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ paths: slice }),
    });
    if (!res.ok) continue;
    const j = (await res.json()) as {
      counts: Record<string, number>;
      likedByMe: Record<string, boolean>;
      dislikeCounts?: Record<string, number>;
      dislikedByMe?: Record<string, boolean>;
    };
    Object.assign(counts, j.counts);
    Object.assign(likedByMe, j.likedByMe);
    if (j.dislikeCounts) Object.assign(dislikeCounts, j.dislikeCounts);
    if (j.dislikedByMe) Object.assign(dislikedByMe, j.dislikedByMe);
  }
  return { counts, likedByMe, dislikeCounts, dislikedByMe };
}

export function LibraryView() {
  const { data: session } = authClient.useSession();
  const [abilityCategory, setAbilityCategory] = useState("");
  const [classFolderKey, setClassFolderKey] = useState("");
  const [voiceLine, setVoiceLine] = useState("");
  const [gender, setGender] = useState<"" | "Male" | "Female">("");
  const [page, setPage] = useState(1);

  const [reactionByPath, setReactionByPath] = useState<
    Record<string, ClipReactionMeta>
  >({});
  const [reactionBusy, setReactionBusy] = useState<string | null>(null);

  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  const downloadAudio = (publicPath: string) => {
    const link = document.createElement("a");
    link.href = publicPath;
    link.download = publicPath.split("/").pop() ?? "clip.mp3";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    return () => {
      activeAudioRef.current?.pause();
      activeAudioRef.current = null;
    };
  }, []);

  const quotes = allQuotes;

  const filteredQuotes = useMemo(() => {
    const v = voiceLine.trim().toLowerCase();
    return quotes.filter((quote) => {
      if (abilityCategory && quote.category !== abilityCategory) return false;
      if (classFolderKey && quote.folderKey !== classFolderKey) return false;
      if (v && !quote.text.toLowerCase().includes(v)) return false;
      if (gender && quote.correct.gender !== gender) return false;
      return true;
    });
  }, [quotes, abilityCategory, classFolderKey, voiceLine, gender]);

  const pageCount = useMemo(
    () => Math.max(1, Math.ceil(filteredQuotes.length / PAGE_SIZE)),
    [filteredQuotes.length],
  );

  const safePage = Math.min(Math.max(1, page), pageCount);

  useEffect(() => {
    setPage(1);
  }, [abilityCategory, classFolderKey, voiceLine, gender]);

  useEffect(() => {
    setPage((p) => Math.min(Math.max(1, p), pageCount));
  }, [pageCount]);

  const paginatedQuotes = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredQuotes.slice(start, start + PAGE_SIZE);
  }, [filteredQuotes, safePage]);

  const pagePathsKey = useMemo(
    () => paginatedQuotes.map((q) => q.clipPath).join("\0"),
    [paginatedQuotes],
  );

  useEffect(() => {
    let cancelled = false;
    const paths = pagePathsKey.length > 0 ? pagePathsKey.split("\0") : [];
    if (paths.length === 0) {
      return;
    }
    void (async () => {
      const { counts, likedByMe, dislikeCounts, dislikedByMe } =
        await fetchReactionsForPaths(paths);
      if (cancelled) return;
      setReactionByPath((prev) => {
        const next = { ...prev };
        for (const p of paths) {
          next[p] = {
            likeCount: counts[p] ?? 0,
            liked: Boolean(likedByMe[p]),
            dislikeCount: dislikeCounts[p] ?? 0,
            disliked: Boolean(dislikedByMe[p]),
          };
        }
        return next;
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [pagePathsKey, session?.user?.id]);

  const rangeStart =
    filteredQuotes.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(safePage * PAGE_SIZE, filteredQuotes.length);

  const toggleLike = useCallback(
    async (clipPath: string) => {
      if (!session?.user) {
        window.alert("Sign in to like voice lines.");
        return;
      }
      setReactionBusy(clipPath);
      try {
        const res = await fetch("/api/clips/like", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ clipPath }),
        });
        if (!res.ok) return;
        const j = (await res.json()) as {
          liked: boolean;
          count: number;
          dislikeCount: number;
        };
        setReactionByPath((prev) => ({
          ...prev,
          [clipPath]: {
            likeCount: j.count,
            liked: j.liked,
            dislikeCount: j.dislikeCount,
            disliked: j.liked ? false : (prev[clipPath]?.disliked ?? false),
          },
        }));
      } finally {
        setReactionBusy(null);
      }
    },
    [session?.user],
  );

  const toggleDislike = useCallback(
    async (clipPath: string) => {
      if (!session?.user) {
        window.alert("Sign in to declare vox-heresy.");
        return;
      }
      setReactionBusy(clipPath);
      try {
        const res = await fetch("/api/clips/dislike", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ clipPath }),
        });
        if (!res.ok) return;
        const j = (await res.json()) as {
          disliked: boolean;
          count: number;
          likeCount: number;
        };
        setReactionByPath((prev) => ({
          ...prev,
          [clipPath]: {
            likeCount: j.likeCount,
            liked: j.disliked ? false : (prev[clipPath]?.liked ?? false),
            dislikeCount: j.count,
            disliked: j.disliked,
          },
        }));
      } finally {
        setReactionBusy(null);
      }
    },
    [session?.user],
  );

  const playPreview = (filename: string) => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current.currentTime = 0;
    }
    const next = new Audio(filename);
    next.play().catch((err) => console.error("Playback failed:", err));
    activeAudioRef.current = next;
  };

  const fieldClass =
    "space-y-1.5 rounded-lg border border-primary/15 bg-card/60 p-3 ring-1 ring-border/80";

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tighter text-primary drop-shadow-[0_0_10px_oklch(0.78_0.19_145_/_0.2)]">
          Vox archive
        </h1>
        <p className="text-sm uppercase tracking-widest text-muted-foreground">
          Authorized personnel only // Decrypted logs
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="grid min-w-0 grid-cols-3 gap-2 sm:gap-3">
          <div className={cn(fieldClass, "min-w-0")}>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Ability name
            </span>
            <LibraryAbilitySelect
              value={abilityCategory}
              onChange={setAbilityCategory}
            />
          </div>
          <div className={cn(fieldClass, "min-w-0")}>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Class
            </span>
            <LibraryClassSelect
              value={classFolderKey}
              onChange={setClassFolderKey}
            />
          </div>
          <div className={cn(fieldClass, "min-w-0")}>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Gender
            </span>
            <LibraryGenderSelect value={gender} onChange={setGender} />
          </div>
        </div>
        <div className={fieldClass}>
          <label
            htmlFor="lib-filter-voice"
            className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
          >
            Voice line
          </label>
          <Input
            id="lib-filter-voice"
            type="search"
            placeholder="Transcript text…"
            value={voiceLine}
            onChange={(e) => setVoiceLine(e.target.value)}
            className="h-9"
          />
        </div>
      </div>

      <p className="text-[10px] leading-relaxed text-muted-foreground">
        Filters combine: every active field must match. Ability, class, and
        gender use the same searchable vox-archive menus as Heardle.
      </p>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <p className="text-[10px] uppercase tracking-tighter text-muted-foreground">
          {filteredQuotes.length === 0 ? (
            <>Showing 0 transmission logs</>
          ) : (
            <>
              Showing {rangeStart}–{rangeEnd} of {filteredQuotes.length} transmission
              logs
            </>
          )}
        </p>
        {filteredQuotes.length > PAGE_SIZE ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono text-muted-foreground">
              Page {safePage} / {pageCount}
            </span>
            <div className="flex gap-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-[10px] font-bold uppercase"
                disabled={safePage <= 1}
                onClick={() => {
                  setPage((p) => Math.max(1, p - 1));
                  document
                    .getElementById("library-results")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-[10px] font-bold uppercase"
                disabled={safePage >= pageCount}
                onClick={() => {
                  setPage((p) => Math.min(pageCount, p + 1));
                  document
                    .getElementById("library-results")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              >
                Next
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      <ScrollArea className="h-[min(36rem,70vh)] rounded-lg border border-border bg-muted/20 p-4">
        <div id="library-results" className="space-y-3 pr-3">
          {paginatedQuotes.map((quote) => {
            const meta = reactionByPath[quote.clipPath] ?? {
              likeCount: 0,
              liked: false,
              dislikeCount: 0,
              disliked: false,
            };
            const busy = reactionBusy === quote.clipPath;
            return (
              <Card
                key={quote.id}
                className="border-border bg-card/50 transition-all hover:border-primary/35 hover:bg-card"
              >
                <CardContent className="flex items-center justify-between gap-4 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span
                        className="rounded border border-muted-foreground/30 bg-muted/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground"
                        title="Ability name"
                      >
                        {quote.category}
                      </span>
                      <span className="rounded border border-primary/25 bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
                        {quote.correct.personality}
                      </span>
                      <span
                        className="text-[10px] uppercase text-muted-foreground"
                        title="Class"
                      >
                        {quote.correct.class} ({quote.correct.gender})
                      </span>
                    </div>
                    <p
                      className="truncate text-sm italic text-card-foreground/90"
                      title="Voice line"
                    >
                      &ldquo;{quote.text}&rdquo;
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-1.5">
                      <Button
                        type="button"
                        size="sm"
                        variant={meta.liked ? "default" : "secondary"}
                        disabled={busy}
                        className="h-9 gap-1.5 rounded-full px-3"
                        onClick={() => toggleLike(quote.clipPath)}
                        aria-pressed={meta.liked}
                        aria-label={
                          meta.liked ? "Unlike clip" : "Like clip"
                        }
                      >
                        <IconHeart
                          className="size-4 shrink-0"
                          filled={meta.liked}
                        />
                        <span className="min-w-[1.25rem] text-center text-xs font-bold tabular-nums">
                          {meta.likeCount}
                        </span>
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={meta.disliked ? "destructive" : "secondary"}
                        disabled={busy}
                        className="h-9 gap-1.5 rounded-full border border-transparent px-3 hover:border-destructive/40"
                        onClick={() => toggleDislike(quote.clipPath)}
                        aria-pressed={meta.disliked}
                        aria-label={
                          meta.disliked
                            ? "Revoke mark of heresy"
                            : "Mark vox-clip as heresy"
                        }
                      >
                        <IconHeresySkull
                          className="size-4 shrink-0"
                          filled={meta.disliked}
                        />
                        <span className="min-w-[1.25rem] text-center text-xs font-bold tabular-nums">
                          {meta.dislikeCount}
                        </span>
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="secondary"
                        className="rounded-full border border-transparent bg-secondary transition-all hover:border-primary/40 hover:bg-primary hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-primary/45"
                        onClick={() => playPreview(quote.audio)}
                        aria-label="Play clip"
                      >
                        <IconPlay className="size-4 fill-current" />
                      </Button>
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="secondary"
                        className="rounded-full border border-transparent bg-secondary transition-all hover:border-primary/40 hover:bg-primary hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-primary/45"
                        onClick={() => downloadAudio(quote.audio)}
                        aria-label="Download clip"
                      >
                        <IconDownload className="size-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filteredQuotes.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">
              <IconMusic className="mx-auto mb-4 size-12 opacity-25" />
              <p className="text-xs uppercase tracking-widest">
                No matching vox logs found in the warp.
              </p>
            </div>
          ) : null}
        </div>
      </ScrollArea>

      <Card className="border-primary/15 bg-primary/5">
        <CardContent className="p-4 text-[10px] text-primary/80">
          <p className="mb-2 font-bold text-primary">Data recovery status:</p>
          <div className="flex flex-wrap gap-4">
            <span>
              Veteran: <span className="text-green-500">Complete</span>
            </span>
            <span>
              Zealot: <span className="text-yellow-500">80%</span>
            </span>
            <span>
              Ogryn: <span className="text-red-500">Missing</span>
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
