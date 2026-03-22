"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  IconAudioLines,
  IconHeart,
  IconHeresySkull,
  IconPlay,
} from "@/components/mission-icons";

import { GuessInput, type Guess } from "@/components/heardle/GuessInput";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { allQuotes, type Quote } from "@/data/quotes";
import { authClient } from "@/lib/auth-client";
import {
  readGuestHeardleStreak,
  writeGuestHeardleStreak,
} from "@/lib/heardle-guest-streak";
import {
  formatCooldownRemaining,
  readHeresyCooldownUntil,
  startHeresyCooldown,
} from "@/lib/heardle-heresy-cooldown";
import { cn } from "@/lib/utils";

type GameStatus = "playing" | "won" | "lost" | "heresy";

type ClipReactionState = {
  likeCount: number;
  dislikeCount: number;
  liked: boolean;
  disliked: boolean;
};

const maxAttempts = 7;
/** Show “confess heresy” after this many wrong guesses (one attempt left). */
const heresyAfterFailedCount = maxAttempts - 1;

const transmissionCardClass =
  "border-2 border-primary/25 bg-card/80 shadow-2xl backdrop-blur-md ring-1 ring-primary/10";

const winCardClass = cn(
  transmissionCardClass,
  "border-green-500/45 ring-green-500/20 shadow-[0_0_28px_-6px_rgba(34,197,94,0.22)]",
);

const loseCardClass = cn(
  transmissionCardClass,
  "border-red-500/40 ring-red-500/20 shadow-[0_0_28px_-6px_rgba(239,68,68,0.18)]",
);

function pickRandomQuote(): Quote {
  const quotes = allQuotes;
  return quotes[Math.floor(Math.random() * quotes.length)]!;
}

export function HeardleGame() {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const [targetQuote, setTargetQuote] = useState<Quote | null>(() =>
    pickRandomQuote(),
  );
  const [attempts, setAttempts] = useState<Guess[]>([]);
  /** Wrong guesses across all rounds since last loss; chips persist until streak breaks. */
  const [streakFailedGuesses, setStreakFailedGuesses] = useState<Guess[]>([]);
  const [gameState, setGameState] = useState<GameStatus>("playing");
  const [isPlaying, setIsPlaying] = useState(false);

  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [guestCurrent, setGuestCurrent] = useState(0);
  const [guestBest, setGuestBest] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const syncedWinRef = useRef(false);
  const syncedLossRef = useRef(false);

  const [reactions, setReactions] = useState<ClipReactionState>({
    likeCount: 0,
    dislikeCount: 0,
    liked: false,
    disliked: false,
  });
  const [reactionsReady, setReactionsReady] = useState(false);
  const [reactionBusy, setReactionBusy] = useState(false);

  const [clock, setClock] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setClock(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const refreshStats = useCallback(async () => {
    const res = await fetch("/api/heardle/stats", { credentials: "include" });
    if (!res.ok) return;
    const j = (await res.json()) as {
      loggedIn: boolean;
      currentStreak: number;
      bestStreak: number;
    };
    if (!j.loggedIn) {
      setCurrentStreak(0);
      setBestStreak(0);
      return;
    }
    setCurrentStreak(j.currentStreak);
    setBestStreak(j.bestStreak);
  }, []);

  useEffect(() => {
    void refreshStats();
  }, [refreshStats, session?.user?.id]);

  useEffect(() => {
    if (typeof window === "undefined" || sessionPending) return;
    const g = readGuestHeardleStreak();
    setGuestCurrent(g.current);
    setGuestBest(g.best);
    if (session?.user) {
      setStreakFailedGuesses([]);
    } else {
      setStreakFailedGuesses(g.failedGuesses);
    }
  }, [session?.user?.id, sessionPending]);

  const refreshClipReactions = useCallback(async (clipPath: string) => {
    const res = await fetch("/api/clips/likes/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ paths: [clipPath] }),
    });
    if (!res.ok) {
      setReactionsReady(true);
      return;
    }
    const j = (await res.json()) as {
      counts: Record<string, number>;
      likedByMe: Record<string, boolean>;
      dislikeCounts?: Record<string, number>;
      dislikedByMe?: Record<string, boolean>;
    };
    setReactions({
      likeCount: j.counts[clipPath] ?? 0,
      liked: Boolean(j.likedByMe[clipPath]),
      dislikeCount: j.dislikeCounts?.[clipPath] ?? 0,
      disliked: Boolean(j.dislikedByMe?.[clipPath]),
    });
    setReactionsReady(true);
  }, []);

  useEffect(() => {
    if (!targetQuote) return;
    if (gameState !== "won" && gameState !== "lost" && gameState !== "heresy")
      return;
    let cancelled = false;
    setReactionsReady(false);
    void (async () => {
      await refreshClipReactions(targetQuote.clipPath);
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
    };
  }, [gameState, targetQuote, refreshClipReactions, session?.user?.id]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!targetQuote) return;
    audioRef.current = new Audio(targetQuote.audio);
    audioRef.current.onended = () => setIsPlaying(false);
    return () => {
      audioRef.current?.pause();
    };
  }, [targetQuote]);

  const playAudio = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current
      .play()
      .catch((err) => console.error("Audio playback failed:", err));
    setIsPlaying(true);
  };

  const loggedIn = Boolean(session?.user);

  const reactionLocked = reactions.liked || reactions.disliked;

  const confessHeresy = useCallback(async () => {
    if (gameState !== "playing" || !targetQuote) return;
    if (attempts.length !== heresyAfterFailedCount) return;

    startHeresyCooldown();
    setClock(Date.now());

    setGameState("heresy");
    setIsPlaying(false);
    audioRef.current?.pause();

    if (loggedIn && !syncedLossRef.current) {
      syncedLossRef.current = true;
      const res = await fetch("/api/heardle/loss", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        const j = (await res.json()) as {
          currentStreak: number;
          bestStreak: number;
        };
        setCurrentStreak(j.currentStreak);
        setBestStreak(j.bestStreak);
      }
    } else if (!loggedIn) {
      const g = readGuestHeardleStreak();
      writeGuestHeardleStreak({
        current: 0,
        best: g.best,
        failedGuesses: streakFailedGuesses,
      });
      setGuestCurrent(0);
    }
  }, [
    attempts.length,
    gameState,
    loggedIn,
    streakFailedGuesses,
    targetQuote,
  ]);

  const submitHeardleLike = useCallback(async () => {
    if (!targetQuote) return;
    if (!loggedIn) {
      window.alert("Sign in to log a verdict in the archive.");
      return;
    }
    if (reactionLocked || !reactionsReady) return;
    setReactionBusy(true);
    try {
      const res = await fetch("/api/clips/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          clipPath: targetQuote.clipPath,
          immutable: true,
        }),
      });
      if (res.status === 409) {
        await refreshClipReactions(targetQuote.clipPath);
        return;
      }
      if (!res.ok) return;
      const j = (await res.json()) as {
        liked: boolean;
        count: number;
        dislikeCount: number;
      };
      setReactions((prev) => ({
        ...prev,
        likeCount: j.count,
        dislikeCount: j.dislikeCount,
        liked: j.liked,
        disliked: false,
      }));
    } finally {
      setReactionBusy(false);
    }
  }, [
    targetQuote,
    loggedIn,
    reactionLocked,
    reactionsReady,
    refreshClipReactions,
  ]);

  const submitHeardleDislike = useCallback(async () => {
    if (!targetQuote) return;
    if (!loggedIn) {
      window.alert("Sign in to declare vox-heresy.");
      return;
    }
    if (reactionLocked || !reactionsReady) return;
    setReactionBusy(true);
    try {
      const res = await fetch("/api/clips/dislike", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          clipPath: targetQuote.clipPath,
          immutable: true,
        }),
      });
      if (res.status === 409) {
        await refreshClipReactions(targetQuote.clipPath);
        return;
      }
      if (!res.ok) return;
      const j = (await res.json()) as {
        disliked: boolean;
        count: number;
        likeCount: number;
      };
      setReactions((prev) => ({
        ...prev,
        dislikeCount: j.count,
        likeCount: j.likeCount,
        disliked: j.disliked,
        liked: false,
      }));
    } finally {
      setReactionBusy(false);
    }
  }, [
    targetQuote,
    loggedIn,
    reactionLocked,
    reactionsReady,
    refreshClipReactions,
  ]);

  const handleGuess = async (guess: Guess) => {
    if (gameState !== "playing" || !targetQuote) return;

    const isCorrect =
      guess.personality.toLowerCase() ===
      targetQuote.correct.personality.toLowerCase();

    if (isCorrect) {
      setGameState("won");
      setIsPlaying(false);
      audioRef.current?.pause();

      if (loggedIn && !syncedWinRef.current) {
        syncedWinRef.current = true;
        const res = await fetch("/api/heardle/win", {
          method: "POST",
          credentials: "include",
        });
        if (res.ok) {
          const j = (await res.json()) as {
            currentStreak: number;
            bestStreak: number;
          };
          setCurrentStreak(j.currentStreak);
          setBestStreak(j.bestStreak);
        }
      } else if (!loggedIn) {
        setGuestCurrent((c) => {
          const n = Math.min(999, c + 1);
          setGuestBest((b) => {
            const nb = Math.max(b, n);
            writeGuestHeardleStreak({
              current: n,
              best: nb,
              failedGuesses: streakFailedGuesses,
            });
            return nb;
          });
          return n;
        });
      }
      return;
    }

    const next = [...attempts, guess];
    const nextFailed = [...streakFailedGuesses, guess];
    setAttempts(next);
    setStreakFailedGuesses(nextFailed);
    if (next.length >= maxAttempts) {
      setGameState("lost");
      setIsPlaying(false);
      audioRef.current?.pause();

      if (loggedIn && !syncedLossRef.current) {
        syncedLossRef.current = true;
        const res = await fetch("/api/heardle/loss", {
          method: "POST",
          credentials: "include",
        });
        if (res.ok) {
          const j = (await res.json()) as {
            currentStreak: number;
            bestStreak: number;
          };
          setCurrentStreak(j.currentStreak);
          setBestStreak(j.bestStreak);
        }
      } else if (!loggedIn) {
        const g = readGuestHeardleStreak();
        writeGuestHeardleStreak({
          current: 0,
          best: g.best,
          failedGuesses: nextFailed,
        });
        setGuestCurrent(0);
      }
    } else if (!loggedIn) {
      const g = readGuestHeardleStreak();
      writeGuestHeardleStreak({
        current: g.current,
        best: g.best,
        failedGuesses: nextFailed,
      });
    }
  };

  const restartRound = useCallback(
    (resetFailureLog: boolean) => {
      audioRef.current?.pause();
      setTargetQuote(pickRandomQuote());
      setAttempts([]);
      if (resetFailureLog) {
        setStreakFailedGuesses([]);
        if (!session?.user) {
          const g = readGuestHeardleStreak();
          writeGuestHeardleStreak({
            current: g.current,
            best: g.best,
            failedGuesses: [],
          });
        }
      }
      setGameState("playing");
      setIsPlaying(false);
      syncedWinRef.current = false;
      syncedLossRef.current = false;
      setReactions({
        likeCount: 0,
        dislikeCount: 0,
        liked: false,
        disliked: false,
      });
      setReactionsReady(false);
    },
    [session?.user],
  );

  if (!targetQuote) {
    return (
      <div className="animate-pulse p-10 text-center text-primary">
        Initiating vox link…
      </div>
    );
  }

  const progressPct = (attempts.length / maxAttempts) * 100;
  const displayCurrent = loggedIn ? currentStreak : guestCurrent;
  const displayBest = loggedIn ? bestStreak : guestBest;

  const heresyCooldownUntil = readHeresyCooldownUntil();
  const heresyCooldownActive =
    heresyCooldownUntil !== null && clock < heresyCooldownUntil;
  const blockPlayingUI = gameState === "playing" && heresyCooldownActive;

  return (
    <div className="mx-auto max-w-xl space-y-6 p-4">
      <div className="flex flex-wrap items-center justify-center gap-3 text-center text-[10px] uppercase tracking-widest text-muted-foreground">
        <span className="rounded-md border border-primary/25 bg-primary/10 px-3 py-1.5 font-bold text-primary">
          Win streak: {displayCurrent}
        </span>
        <span className="rounded-md border border-border px-3 py-1.5">
          Best: {displayBest}
        </span>
        {!loggedIn ? (
          <span className="w-full text-[9px] normal-case text-muted-foreground/90">
            Streaks are saved in this browser. Sign in to sync to the archive
            and leaderboard.
          </span>
        ) : null}
      </div>

      {blockPlayingUI && heresyCooldownUntil !== null ? (
        <Card
          className={cn(
            loseCardClass,
            "border-amber-600/35 ring-amber-600/15",
          )}
        >
          <CardHeader className="border-b border-border text-center">
            <CardTitle className="text-xl font-black tracking-[0.2em] text-amber-500 sm:text-2xl">
              Channel quarantined
            </CardTitle>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Heresy protocol // Local lockout
            </p>
          </CardHeader>
          <CardContent className="space-y-4 pt-6 text-center">
            <p className="text-sm text-muted-foreground">
              After confessing heresy, this terminal is sealed for{" "}
              <strong className="text-foreground">five minutes</strong>.
            </p>
            <p className="font-mono text-3xl font-black tabular-nums text-amber-500">
              {formatCooldownRemaining(heresyCooldownUntil, clock)}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Remaining before replacement agent
            </p>
          </CardContent>
        </Card>
      ) : null}

      {!blockPlayingUI ? (
        <>
      <Card className={transmissionCardClass}>
        <CardHeader className="border-b border-border text-center">
          <CardTitle className="text-2xl font-black tracking-[0.3em] text-primary">
            Vox transmission
          </CardTitle>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Atoma Prime — Segmentum Obscurus
          </p>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-6 pt-6">
          <div className="flex h-16 w-full items-center justify-center overflow-hidden rounded-md border border-border bg-zinc-950 dark:bg-black/60">
            <div className="flex h-8 items-end gap-1">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-1 bg-primary transition-all duration-300 ${
                    isPlaying ? "animate-bounce" : "h-2 opacity-30"
                  }`}
                  style={{
                    animationDelay: `${i * 0.1}s`,
                    height: isPlaying ? "100%" : "8px",
                  }}
                />
              ))}
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={playAudio}
            className={cn(
              "size-24 rounded-full! border-4 shadow-none transition-all",
              "focus-visible:ring-[3px] focus-visible:ring-primary/50",
              isPlaying
                ? "animate-pulse border-primary"
                : "border-primary/25 hover:border-primary hover:bg-primary/5",
            )}
            aria-label={isPlaying ? "Playing audio" : "Play transmission"}
          >
            {isPlaying ? (
              <IconAudioLines className="size-7 animate-pulse" />
            ) : (
              <IconPlay className="size-7" />
            )}
          </Button>

          <div className="w-full space-y-2">
            <div className="flex justify-between text-[10px] uppercase tracking-tighter text-muted-foreground">
              <span>Signal integrity</span>
              <span>
                {attempts.length} / {maxAttempts} failed decryptions
              </span>
            </div>
            <Progress
              value={progressPct}
              className="w-full gap-0 [&_[data-slot=progress-track]]:h-1 [&_[data-slot=progress-track]]:bg-white/20 dark:[&_[data-slot=progress-track]]:bg-white/10 [&_[data-slot=progress-indicator]]:bg-red-600"
            />
          </div>
        </CardContent>
      </Card>

      {gameState === "won" ? (
        <Card className={winCardClass}>
          <CardHeader className="border-b border-border text-center">
            <CardTitle className="text-xl font-black tracking-[0.18em] text-green-400 sm:text-2xl sm:tracking-[0.22em]">
              Identified: {targetQuote.correct.personality.toUpperCase()}
            </CardTitle>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Link verified // Channel secure
            </p>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6 pt-6 text-center">
            <p className="max-w-md text-pretty text-sm italic leading-relaxed text-green-300/90">
              {targetQuote.text.trim() ? (
                <>
                  &ldquo;{targetQuote.text.trim()}&rdquo;
                </>
              ) : (
                <span className="text-muted-foreground not-italic">
                  No transcript on file for this vox line.
                </span>
              )}
            </p>
            <Button
              type="button"
              className="bg-green-600 text-white hover:bg-green-500 focus-visible:ring-[3px] focus-visible:ring-green-500/50"
              onClick={() => restartRound(false)}
            >
              Next assignment
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {gameState === "lost" || gameState === "heresy" ? (
        <Card className={loseCardClass}>
          <CardHeader className="border-b border-border text-center">
            <CardTitle className="text-xl font-black tracking-[0.25em] text-red-400 sm:text-2xl sm:tracking-[0.3em]">
              {gameState === "heresy" ? "Heresy confessed" : "Signal lost"}
            </CardTitle>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {gameState === "heresy"
                ? "Certainty bought with shame // Streak forfeit"
                : "Transmission terminated // Vox fade"}
            </p>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6 pt-6 text-center">
            <p className="max-w-sm text-sm text-red-300/90">
              {gameState === "heresy" ? (
                <>
                  The true voice belongs to{" "}
                  <span className="font-semibold text-red-200">
                    {targetQuote.correct.personality}
                  </span>
                  . Your win streak is void.
                </>
              ) : (
                <>
                  The voice was the{" "}
                  <span className="font-semibold text-red-200">
                    {targetQuote.correct.personality}
                  </span>
                  .
                </>
              )}
            </p>
            <Button
              type="button"
              variant="destructive"
              className="focus-visible:ring-[3px] focus-visible:ring-red-500/45"
              onClick={() => restartRound(true)}
            >
              Try again
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {gameState === "won" || gameState === "lost" || gameState === "heresy" ? (
        <Card className={cn(transmissionCardClass, "border-primary/15")}>
          <CardHeader className="border-b border-border py-4 text-center">
            <CardTitle className="text-sm font-black tracking-[0.2em] text-primary">
              Archive verdict
            </CardTitle>
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground">
              One rating per clip · Cannot be changed
            </p>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 py-5">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button
                type="button"
                size="sm"
                variant={reactions.liked ? "default" : "secondary"}
                disabled={
                  !reactionsReady ||
                  reactionBusy ||
                  reactionLocked ||
                  !loggedIn
                }
                className="h-9 gap-1.5 rounded-full px-3"
                onClick={() => void submitHeardleLike()}
                aria-pressed={reactions.liked}
                aria-label="Approve this vox clip"
                title={
                  reactionLocked
                    ? "You already recorded a verdict for this transmission"
                    : undefined
                }
              >
                <IconHeart
                  className="size-4 shrink-0"
                  filled={reactions.liked}
                />
                <span className="min-w-[1.25rem] text-center text-xs font-bold tabular-nums">
                  {!reactionsReady ? "–" : reactions.likeCount}
                </span>
              </Button>
              <Button
                type="button"
                size="sm"
                variant={reactions.disliked ? "destructive" : "secondary"}
                disabled={
                  !reactionsReady ||
                  reactionBusy ||
                  reactionLocked ||
                  !loggedIn
                }
                className="h-9 gap-1.5 rounded-full border border-transparent px-3 hover:border-destructive/40"
                onClick={() => void submitHeardleDislike()}
                aria-pressed={reactions.disliked}
                aria-label="Mark this vox clip as heresy"
                title={
                  reactionLocked
                    ? "You already recorded a verdict for this transmission"
                    : undefined
                }
              >
                <IconHeresySkull
                  className="size-4 shrink-0"
                  filled={reactions.disliked}
                />
                <span className="min-w-[1.25rem] text-center text-xs font-bold tabular-nums">
                  {!reactionsReady ? "–" : reactions.dislikeCount}
                </span>
              </Button>
            </div>
            {!loggedIn ? (
              <p className="text-center text-[10px] text-muted-foreground">
                Sign in to register likes or heresy for this transmission.
              </p>
            ) : reactionLocked ? (
              <p className="text-center text-[10px] font-bold uppercase tracking-widest text-primary/90">
                Verdict sealed // No further edits
              </p>
            ) : reactionsReady ? (
              <p className="text-center text-[10px] text-muted-foreground">
                Approve or condemn — your choice is permanent for this clip.
              </p>
            ) : (
              <p className="text-center text-[10px] text-muted-foreground">
                Loading archive tallies…
              </p>
            )}
          </CardContent>
        </Card>
      ) : null}

      {gameState === "playing" ? (
        <Card className={transmissionCardClass}>
          <CardHeader className="border-b border-border text-center">
            <CardTitle className="text-xl font-black tracking-[0.2em] text-primary sm:text-2xl sm:tracking-[0.28em]">
              Submit identification
            </CardTitle>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Decryption terminal // Personality match
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 pt-6">
            <GuessInput
              key={targetQuote.clipPath}
              onGuess={(g) => {
                void handleGuess(g);
              }}
              attempts={attempts}
            />
            {attempts.length === heresyAfterFailedCount ? (
              <div className="space-y-2 border-t border-border pt-4 text-center">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  One decryption attempt remains
                </p>
                <Button
                  type="button"
                  variant="destructive"
                  className="gap-2 font-black uppercase tracking-wider"
                  onClick={() => void confessHeresy()}
                >
                  <IconHeresySkull className="size-4 shrink-0" filled />
                  Confess heresy
                </Button>
              </div>
            ) : null}
            <div className="flex flex-wrap justify-center gap-2">
              {streakFailedGuesses.map((g, i) => (
                <span
                  key={`streak-fail-${i}`}
                  className="rounded border border-red-500/35 bg-red-500/10 px-2 py-1 text-[10px] text-red-400"
                >
                  {g.personality} ✕
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}
        </>
      ) : null}
    </div>
  );
}
