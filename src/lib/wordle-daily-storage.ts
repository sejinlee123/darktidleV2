import type { WordleTile } from "@/lib/wordle-score";

import {
  addCalendarDaysToKey,
  formatLocalDateKey,
  nextStreakOnWin,
  normalizeWordleStreak,
} from "@/lib/wordle-daily";

const STORAGE_KEY = "darktidle.wordle.daily.v1";
const HERESY_LOCK_KEY = "darktidle.wordle.heresyLock.v1";

export type WordlePersistRow = { guess: string; tiles: WordleTile[] };

export type WordleDailyPersisted = {
  v: 1;
  dateKey: string;
  rows: WordlePersistRow[];
  status: "playing" | "won" | "lost";
  /** Legacy: Heresy used to end the day as a loss. */
  lossKind?: "heresy";
  /** True after Wordle Heresy: answer was shown; puzzle stays playable after penance. */
  revealedViaHeresy?: boolean;
  lastWinDate: string | null;
  currentStreak: number;
  maxStreak: number;
};

export type WordleHeresyLock = { dateKey: string; until: number };

export function readHeresyLock(): WordleHeresyLock | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(HERESY_LOCK_KEY);
    if (!raw) return null;
    const j = JSON.parse(raw) as Partial<WordleHeresyLock>;
    if (typeof j.dateKey !== "string" || typeof j.until !== "number")
      return null;
    return { dateKey: j.dateKey, until: j.until };
  } catch {
    return null;
  }
}

export function writeHeresyLock(dateKey: string, durationMs: number): void {
  if (typeof window === "undefined") return;
  try {
    const payload: WordleHeresyLock = {
      dateKey,
      until: Date.now() + durationMs,
    };
    localStorage.setItem(HERESY_LOCK_KEY, JSON.stringify(payload));
  } catch {
    /* quota */
  }
}

function defaultPersist(dateKey: string): WordleDailyPersisted {
  return {
    v: 1,
    dateKey,
    rows: [],
    status: "playing",
    lastWinDate: null,
    currentStreak: 0,
    maxStreak: 0,
  };
}

export function readWordleDaily(dateKey: string): WordleDailyPersisted {
  if (typeof window === "undefined") {
    return defaultPersist(dateKey);
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultPersist(dateKey);
    const j = JSON.parse(raw) as Partial<WordleDailyPersisted>;
    if (j.v !== 1 || typeof j.dateKey !== "string") {
      return defaultPersist(dateKey);
    }
    const base: WordleDailyPersisted = {
      v: 1,
      dateKey: j.dateKey,
      rows: Array.isArray(j.rows) ? j.rows : [],
      status:
        j.status === "won" || j.status === "lost" || j.status === "playing"
          ? j.status
          : "playing",
      lossKind: j.lossKind === "heresy" ? "heresy" : undefined,
      revealedViaHeresy: j.revealedViaHeresy === true,
      lastWinDate:
        typeof j.lastWinDate === "string" || j.lastWinDate === null
          ? j.lastWinDate
          : null,
      currentStreak:
        typeof j.currentStreak === "number" ? Math.max(0, j.currentStreak) : 0,
      maxStreak:
        typeof j.maxStreak === "number" ? Math.max(0, j.maxStreak) : 0,
    };
    if (base.dateKey !== dateKey) {
      const normalized = normalizeWordleStreak(
        base.lastWinDate,
        base.currentStreak,
        dateKey,
      );
      return {
        ...defaultPersist(dateKey),
        lastWinDate: base.lastWinDate,
        currentStreak: normalized,
        maxStreak: base.maxStreak,
      };
    }
    return {
      ...base,
      currentStreak: normalizeWordleStreak(
        base.lastWinDate,
        base.currentStreak,
        dateKey,
      ),
    };
  } catch {
    return defaultPersist(dateKey);
  }
}

export function writeWordleDaily(next: WordleDailyPersisted): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* quota / private mode */
  }
}

export function applyWinToPersist(
  prev: WordleDailyPersisted,
  dateKey: string,
): WordleDailyPersisted {
  const nextStreak = nextStreakOnWin(
    prev.lastWinDate,
    prev.currentStreak,
    dateKey,
  );
  const maxStreak = Math.max(prev.maxStreak, nextStreak);
  return {
    ...prev,
    dateKey,
    lastWinDate: dateKey,
    currentStreak: nextStreak,
    maxStreak,
  };
}

export function applyLossToPersist(prev: WordleDailyPersisted): WordleDailyPersisted {
  return {
    ...prev,
    currentStreak: 0,
  };
}

export { formatLocalDateKey, addCalendarDaysToKey };
