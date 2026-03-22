"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { dailyRoundForDateKey, formatLocalDateKey } from "@/lib/wordle-daily";
import {
  applyWinToPersist,
  readHeresyLock,
  readWordleDaily,
  writeHeresyLock,
  writeWordleDaily,
} from "@/lib/wordle-daily-storage";
import { authClient } from "@/lib/auth-client";
import { type WordleTile, scoreWordleGuess } from "@/lib/wordle-score";
import { cn } from "@/lib/utils";

/** First row index (0-based) at which extra guesses are allowed; Heresy is offered after this many commits. */
const HERESY_OFFER_AFTER = 6;
const MIN_GRID_ROWS_PLAYING = 6;
const PENANCE_MS = 30 * 1000;

function formatPenanceClock(ms: number) {
  const sec = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACK"],
] as const;

const TILE_RANK: Record<WordleTile, number> = {
  absent: 0,
  present: 1,
  correct: 2,
};

function mergeKeyHints(
  prev: Record<string, WordleTile>,
  guess: string,
  tiles: WordleTile[],
): Record<string, WordleTile> {
  const next = { ...prev };
  for (let i = 0; i < guess.length; i++) {
    const ch = guess[i]!.toUpperCase();
    if (ch < "A" || ch > "Z") continue;
    const t = tiles[i]!;
    const old = next[ch];
    if (old == null || TILE_RANK[t] > TILE_RANK[old]) next[ch] = t;
  }
  return next;
}

function keyHintsFromRows(rows: { guess: string; tiles: WordleTile[] }[]) {
  let hints: Record<string, WordleTile> = {};
  for (const r of rows) {
    hints = mergeKeyHints(hints, r.guess, r.tiles);
  }
  return hints;
}

function tileClasses(state: WordleTile | "empty" | "typing", revealed: boolean) {
  if (state === "empty" || state === "typing") {
    return cn(
      "border-2 border-primary/30 bg-card/80 text-foreground shadow-inner",
      state === "typing" && "border-primary/60 ring-1 ring-primary/25",
    );
  }
  if (!revealed) {
    return "border-2 border-primary/35 bg-primary/10 text-primary";
  }
  switch (state) {
    case "correct":
      return "border-2 border-green-600 bg-green-600 text-white shadow-[0_0_12px_rgba(22,163,74,0.35)]";
    case "present":
      return "border-2 border-amber-500 bg-amber-500 text-zinc-950 shadow-[0_0_10px_rgba(245,158,11,0.3)]";
    case "absent":
      return "border-2 border-zinc-950 bg-black text-zinc-500";
    default:
      return "";
  }
}

function keyCapClasses(hint: WordleTile | undefined) {
  const base =
    "flex h-10 w-full min-w-0 items-center justify-center rounded-md px-0.5 text-[11px] font-black uppercase tracking-wide sm:px-1 sm:text-sm";
  if (!hint) return cn(base, "bg-muted text-foreground hover:bg-muted/80");
  switch (hint) {
    case "correct":
      return cn(base, "bg-green-600 text-white hover:bg-green-500");
    case "present":
      return cn(base, "bg-amber-500 text-zinc-950 hover:bg-amber-400");
    case "absent":
      return cn(
        base,
        "cursor-not-allowed border border-zinc-950 bg-black text-zinc-600 opacity-80 shadow-inner",
      );
    default:
      return base;
  }
}

type RowState = { guess: string; tiles: WordleTile[] };

type ServerStats = {
  currentStreak: number;
  maxStreak: number;
  today: { won: boolean; guessCount: number } | null;
};

export function DarktidleWordle() {
  const { data: session } = authClient.useSession();
  const [todayKey, setTodayKey] = useState(() => formatLocalDateKey());

  const round = useMemo(() => dailyRoundForDateKey(todayKey), [todayKey]);
  const wordLength = round.length;
  const solution = round.solution;

  const [rows, setRows] = useState<RowState[]>([]);
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState<"playing" | "won" | "lost">("playing");
  const [message, setMessage] = useState<string | null>(null);
  const [shakeRow, setShakeRow] = useState(false);
  const [keyHints, setKeyHints] = useState<Record<string, WordleTile>>({});
  const [serverLocked, setServerLocked] = useState(false);
  const [serverStats, setServerStats] = useState<ServerStats | null>(null);
  const [localStreak, setLocalStreak] = useState({ current: 0, max: 0 });
  const [revealedViaHeresy, setRevealedViaHeresy] = useState(false);
  const [lockTick, setLockTick] = useState(0);
  const completeSyncedRef = useRef(false);

  useEffect(() => {
    const id = window.setInterval(() => {
      const next = formatLocalDateKey();
      setTodayKey((prev) => (prev === next ? prev : next));
    }, 60_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    completeSyncedRef.current = false;
    const persist = readWordleDaily(todayKey);
    const validRows = persist.rows.filter((r) => r.guess.length === wordLength);
    setRows(validRows);
    setDraft("");
    setMessage(null);
    setKeyHints(keyHintsFromRows(validRows));
    if (validRows.length !== persist.rows.length && persist.rows.length > 0) {
      setStatus("playing");
    } else {
      setStatus(persist.status);
    }
    setRevealedViaHeresy(persist.revealedViaHeresy === true);
    setLocalStreak({
      current: persist.currentStreak,
      max: persist.maxStreak,
    });
  }, [todayKey, wordLength]);

  useEffect(() => {
    const lock = readHeresyLock();
    if (
      lock == null ||
      lock.dateKey !== todayKey ||
      lock.until <= Date.now()
    ) {
      return;
    }
    const id = window.setInterval(() => {
      setLockTick((x) => x + 1);
      const L = readHeresyLock();
      if (L == null || L.until <= Date.now()) {
        window.clearInterval(id);
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [todayKey, revealedViaHeresy]);

  const penanceRemainingMs = useMemo(() => {
    if (typeof window === "undefined") return 0;
    const lock = readHeresyLock();
    if (!lock || lock.dateKey !== todayKey) return 0;
    return Math.max(0, lock.until - Date.now());
  }, [todayKey, lockTick]);

  const refreshServerStats = useCallback(async () => {
    const res = await fetch(
      `/api/wordle/stats?dateKey=${encodeURIComponent(todayKey)}`,
      { credentials: "include" },
    );
    if (!res.ok) return;
    const data = (await res.json()) as {
      loggedIn: boolean;
      currentStreak: number;
      maxStreak: number;
      today: { won: boolean; guessCount: number } | null;
    };
    if (!data.loggedIn) {
      setServerStats(null);
      setServerLocked(false);
      return;
    }
    setServerStats({
      currentStreak: data.currentStreak,
      maxStreak: data.maxStreak,
      today: data.today,
    });
    if (data.today) {
      const persist = readWordleDaily(todayKey);
      const localFinished =
        persist.status === "won" || persist.status === "lost";
      if (persist.rows.length > 0 && localFinished) {
        setServerLocked(false);
      } else {
        setServerLocked(true);
        setStatus(data.today.won ? "won" : "lost");
        setRows([]);
        setDraft("");
        setKeyHints({});
      }
    } else {
      setServerLocked(false);
    }
  }, [todayKey]);

  useEffect(() => {
    void refreshServerStats();
  }, [refreshServerStats, session?.user?.id]);

  const displayStreak =
    session?.user && serverStats !== null
      ? Math.max(serverStats.currentStreak, localStreak.current)
      : localStreak.current;
  const displayBest =
    session?.user && serverStats !== null
      ? Math.max(serverStats.maxStreak, localStreak.max)
      : localStreak.max;

  const postComplete = useCallback(
    async (won: boolean, guessCount: number) => {
      if (!session?.user?.id) return;
      try {
        const res = await fetch("/api/wordle/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ dateKey: todayKey, won, guessCount }),
        });
        if (res.ok) {
          const j = (await res.json()) as {
            currentStreak: number;
            maxStreak: number;
          };
          setServerStats((prev) =>
            prev
              ? {
                  ...prev,
                  currentStreak: j.currentStreak,
                  maxStreak: j.maxStreak,
                  today: { won, guessCount },
                }
              : {
                  currentStreak: j.currentStreak,
                  maxStreak: j.maxStreak,
                  today: { won, guessCount },
                },
          );
        }
      } catch {
        /* offline */
      }
    },
    [session?.user?.id, todayKey],
  );

  const commitHeresy = useCallback(() => {
    if (status !== "playing" || serverLocked) return;
    if (rows.length < HERESY_OFFER_AFTER) return;
    if (revealedViaHeresy) return;

    writeHeresyLock(todayKey, PENANCE_MS);
    setLockTick((t) => t + 1);
    setRevealedViaHeresy(true);

    const prev = readWordleDaily(todayKey);
    writeWordleDaily({
      ...prev,
      dateKey: todayKey,
      rows,
      status: "playing",
      revealedViaHeresy: true,
      lossKind: undefined,
    });
  }, [
    revealedViaHeresy,
    rows,
    serverLocked,
    status,
    todayKey,
  ]);

  const commitGuess = useCallback(() => {
    if (status !== "playing" || serverLocked || penanceRemainingMs > 0) return;
    const g = draft.toUpperCase();
    if (g.length !== wordLength) {
      setMessage(`Enter ${wordLength} letters`);
      setShakeRow(true);
      window.setTimeout(() => setShakeRow(false), 450);
      return;
    }
    if (!/^[A-Z]+$/.test(g)) {
      setMessage("Letters A–Z only");
      setShakeRow(true);
      window.setTimeout(() => setShakeRow(false), 450);
      return;
    }

    const tiles = scoreWordleGuess(g, solution);
    setKeyHints((prev) => mergeKeyHints(prev, g, tiles));
    const nextRows = [...rows, { guess: g, tiles }];
    setRows(nextRows);
    setDraft("");
    setMessage(null);

    const guessCount = nextRows.length;

    if (g === solution) {
      setStatus("won");
      const prev = readWordleDaily(todayKey);
      const afterWin = applyWinToPersist(
        {
          ...prev,
          dateKey: todayKey,
          rows: nextRows,
          status: "won",
          lossKind: undefined,
          revealedViaHeresy: undefined,
        },
        todayKey,
      );
      writeWordleDaily(afterWin);
      setLocalStreak({
        current: afterWin.currentStreak,
        max: afterWin.maxStreak,
      });
      if (session?.user?.id && !completeSyncedRef.current) {
        completeSyncedRef.current = true;
        void postComplete(true, guessCount);
      }
      return;
    }

    const prev = readWordleDaily(todayKey);
    writeWordleDaily({
      ...prev,
      dateKey: todayKey,
      rows: nextRows,
      status: "playing",
    });
  }, [
    draft,
    solution,
    status,
    wordLength,
    rows,
    todayKey,
    serverLocked,
    session?.user?.id,
    postComplete,
    penanceRemainingMs,
  ]);

  const onKey = useCallback(
    (key: string) => {
      if (status !== "playing" || serverLocked || penanceRemainingMs > 0)
        return;
      setMessage(null);
      const k = key.toUpperCase();
      if (k === "BACK" || k === "BACKSPACE") {
        setDraft((d) => d.slice(0, -1));
        return;
      }
      if (k === "ENTER") {
        commitGuess();
        return;
      }
      if (
        k.length === 1 &&
        k >= "A" &&
        k <= "Z" &&
        draft.length < wordLength &&
        keyHints[k] !== "absent"
      ) {
        setDraft((d) => d + k);
      }
    },
    [
      commitGuess,
      draft.length,
      keyHints,
      penanceRemainingMs,
      status,
      wordLength,
      serverLocked,
    ],
  );

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (status !== "playing" || serverLocked || penanceRemainingMs > 0)
        return;
      if (e.key === "Enter") {
        e.preventDefault();
        commitGuess();
        return;
      }
      if (e.key === "Backspace") {
        e.preventDefault();
        setDraft((d) => d.slice(0, -1));
        return;
      }
      if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
        e.preventDefault();
        const ch = e.key.toUpperCase();
        if (keyHints[ch] === "absent") return;
        setDraft((d) => (d.length < wordLength ? d + ch : d));
      }
    };
    window.addEventListener("keydown", onDown);
    return () => window.removeEventListener("keydown", onDown);
  }, [
    commitGuess,
    keyHints,
    penanceRemainingMs,
    status,
    wordLength,
    serverLocked,
  ]);

  /** Tile size + grid width scale with glyph count so 4-letter days feel roomy and 7-letter days still fit. */
  const { gridMaxWidthRem, tileTextClass } = useMemo(() => {
    const gapRem = 0.375;
    let tileRem: number;
    let text: string;
    if (wordLength <= 4) {
      tileRem = 3.5;
      text = "text-xl sm:text-2xl";
    } else if (wordLength === 5) {
      tileRem = 3.125;
      text = "text-lg sm:text-xl";
    } else if (wordLength === 6) {
      tileRem = 2.875;
      text = "text-base sm:text-lg";
    } else {
      tileRem = 2.625;
      text = "text-sm sm:text-base";
    }
    const maxW = wordLength * tileRem + (wordLength - 1) * gapRem;
    return { gridMaxWidthRem: maxW, tileTextClass: text };
  }, [wordLength]);

  const grid = useMemo(() => {
    const gridRowCount =
      status === "playing"
        ? Math.max(MIN_GRID_ROWS_PLAYING, rows.length + 1)
        : Math.max(rows.length, 1);
    const cells: {
      letter: string;
      tile: WordleTile | "empty" | "typing";
      revealed: boolean;
    }[][] = [];
    for (let r = 0; r < gridRowCount; r++) {
      const row: (typeof cells)[number] = [];
      const committed = rows[r];
      for (let c = 0; c < wordLength; c++) {
        if (committed) {
          row.push({
            letter: committed.guess[c] ?? "",
            tile: committed.tiles[c] ?? "absent",
            revealed: true,
          });
        } else if (r === rows.length) {
          const ch = draft[c] ?? "";
          row.push({
            letter: ch,
            tile: ch ? "typing" : "empty",
            revealed: false,
          });
        } else {
          row.push({ letter: "", tile: "empty", revealed: false });
        }
      }
      cells.push(row);
    }
    return cells;
  }, [draft, rows, wordLength, status]);

  const playing =
    status === "playing" &&
    !serverLocked &&
    penanceRemainingMs <= 0;
  const showHeresy =
    status === "playing" &&
    !serverLocked &&
    rows.length >= HERESY_OFFER_AFTER &&
    !revealedViaHeresy;
  const showPenanceOverlay = penanceRemainingMs > 0;

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-8">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-black tracking-tighter text-primary drop-shadow-[0_0_14px_oklch(0.78_0.19_145_/_0.2)]">
          Tertium cipher
        </h1>
        <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
          Daily puzzle · {wordLength} glyphs · {todayKey}
        </p>
        <p className="text-xs font-semibold text-muted-foreground">
          Streak{" "}
          <span className="font-mono text-foreground">{displayStreak}</span>
          {" · "}
          Best{" "}
          <span className="font-mono text-foreground">{displayBest}</span>
          {session?.user ? (
            <span className="block text-[10px] font-normal uppercase tracking-widest text-primary/70">
              Synced when signed in
            </span>
          ) : (
            <span className="block text-[10px] font-normal uppercase tracking-widest text-muted-foreground">
              Saved on this device
            </span>
          )}
        </p>
      </div>

      <Card className="border-2 border-primary/20 bg-card/85 shadow-xl ring-1 ring-primary/10 backdrop-blur-sm">
        <CardHeader className="space-y-3 border-b border-border pb-4">
          <CardTitle className="text-base font-black tracking-widest text-primary">
            Briefing
          </CardTitle>
          <p className="text-[10px] leading-relaxed text-muted-foreground">
            One cipher per local calendar day. Everyone gets the same answer for
            that date (length is four to seven glyphs). The grid starts at six
            rows and grows if you need more. Any word of the right length (A–Z)
            is accepted — letters may appear more than once in the answer and in
            your guesses. After six guesses you may keep trying or use REDACTED.
            Green = correct, Amber = wrong position. Streaks break if you skip a
            day or fail the puzzle without solving it — sign in to sync streaks
            across devices.
          </p>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {serverLocked && rows.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">
              You already finished today&apos;s cipher on this account. The
              guess grid is only stored on the device where you played; streak
              counts are synced when you&apos;re signed in.
            </p>
          ) : null}

          <div className="relative">
            {showPenanceOverlay ? (
              <div
                className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 rounded-lg border border-destructive/40 bg-background/92 p-6 text-center shadow-[0_0_24px_oklch(0.55_0.22_25_/_0.2)] backdrop-blur-md"
                aria-live="polite"
              >
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-destructive">
                  Penance
                </p>
                <p className="font-mono text-3xl font-black tabular-nums text-foreground">
                  {formatPenanceClock(penanceRemainingMs)}
                </p>
                <p className="text-xs text-muted-foreground">
                  The answer was{" "}
                  <span className="font-mono font-bold text-primary">
                    {solution}
                  </span>
                  . Reflect until the lock lifts.
                </p>
              </div>
            ) : null}

            <div
              className={cn(
                "mx-auto flex w-full min-w-0 flex-col gap-1.5",
                shakeRow && "animate-wordle-shake",
                showPenanceOverlay && "pointer-events-none select-none opacity-40",
              )}
              style={{
                maxWidth: `min(100%, ${gridMaxWidthRem}rem)`,
              }}
            >
            {grid.map((row, ri) => (
              <div
                key={ri}
                className="grid min-w-0 gap-1.5"
                style={{
                  gridTemplateColumns: `repeat(${wordLength}, minmax(0, 1fr))`,
                }}
              >
                {row.map((cell, ci) => (
                  <div
                    key={ci}
                    className={cn(
                      "flex aspect-square min-h-0 w-full min-w-0 items-center justify-center rounded-md font-black uppercase tracking-widest",
                      tileTextClass,
                      tileClasses(cell.tile, cell.revealed),
                    )}
                  >
                    {cell.letter}
                  </div>
                ))}
              </div>
            ))}
            </div>
          </div>

          {message ? (
            <p className="text-center text-sm font-semibold text-amber-500">
              {message}
            </p>
          ) : null}

          {status === "won" ? (
            <p className="text-center text-sm font-bold text-green-500">
              Cipher broken — the Emperor&apos;s lexicon holds.
            </p>
          ) : null}
          {status === "lost" ? (
            <p className="text-center text-sm font-bold text-red-400">
              Signal lost. The word was{" "}
              <span className="font-mono text-primary">{solution}</span>.
            </p>
          ) : null}

          {revealedViaHeresy &&
          status === "playing" &&
          !showPenanceOverlay ? (
            <p className="text-center text-sm font-semibold text-amber-600">
              Heresy revealed the word:{" "}
              <span className="font-mono text-primary">{solution}</span>. You can
              still win after the lock ends.
            </p>
          ) : null}

          {showHeresy ? (
            <div className="flex flex-col items-center gap-2">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="text-[10px] font-black uppercase tracking-widest"
                onClick={() => commitHeresy()}
              >
                Heresy — reveal and penance
              </Button>
            </div>
          ) : null}

          <div
            className={cn(
              "space-y-2",
              showPenanceOverlay && "pointer-events-none select-none opacity-40",
            )}
          >
            <div className="grid w-full max-w-full grid-cols-10 gap-0.5 sm:gap-1">
              {KEYBOARD_ROWS[0].map((k) => {
                const absent = keyHints[k] === "absent";
                return (
                  <button
                    key={k}
                    type="button"
                    disabled={!playing || absent}
                    className={keyCapClasses(keyHints[k])}
                    onClick={() => onKey(k)}
                  >
                    {k}
                  </button>
                );
              })}
            </div>
            <div className="grid w-full max-w-full grid-cols-9 gap-0.5 sm:gap-1">
              {KEYBOARD_ROWS[1].map((k) => {
                const absent = keyHints[k] === "absent";
                return (
                  <button
                    key={k}
                    type="button"
                    disabled={!playing || absent}
                    className={keyCapClasses(keyHints[k])}
                    onClick={() => onKey(k)}
                  >
                    {k}
                  </button>
                );
              })}
            </div>
            <div
              className="grid w-full max-w-full grid-cols-[minmax(2.25rem,3.25rem)_repeat(7,minmax(0,1fr))_minmax(2.25rem,3.25rem)] gap-0.5 sm:gap-1"
            >
              <Button
                type="button"
                variant="default"
                size="sm"
                disabled={!playing}
                className={cn(
                  "h-10 min-h-10 w-full min-w-0 shrink-0 px-0.5 text-[9px] font-black uppercase leading-tight sm:px-2 sm:text-xs",
                  "shadow-[0_0_16px_oklch(0.62_0.2_145_/_0.45)] ring-2 ring-primary/60 ring-offset-2 ring-offset-background",
                  "hover:ring-primary/80",
                )}
                onClick={() => onKey("ENTER")}
              >
                Enter
              </Button>
              {KEYBOARD_ROWS[2].slice(1, -1).map((k) => {
                const absent = keyHints[k] === "absent";
                return (
                  <button
                    key={k}
                    type="button"
                    disabled={!playing || absent}
                    className={keyCapClasses(keyHints[k])}
                    onClick={() => onKey(k)}
                  >
                    {k}
                  </button>
                );
              })}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={!playing}
                className="h-10 min-h-10 w-full min-w-0 shrink-0 px-0.5 text-sm font-black sm:px-2"
                onClick={() => onKey("BACK")}
              >
                ⌫
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
