import { shuffledWordlePool } from "@/data/darktidle-wordle-words";

/** Local calendar day as YYYY-MM-DD (user's browser timezone). */
export function formatLocalDateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addCalendarDaysToKey(dateKey: string, deltaDays: number): string {
  const [ys, ms, ds] = dateKey.split("-");
  const y = Number(ys);
  const mo = Number(ms);
  const d = Number(ds);
  const dt = new Date(y, mo - 1, d + deltaDays);
  return formatLocalDateKey(dt);
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)!;
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Daily solution from the shuffled Darktide pool; index derived from local date.
 * Length is 4–7 depending on which word is chosen that day.
 */
export function dailyRoundForDateKey(dateKey: string): {
  length: number;
  solution: string;
} {
  const list = shuffledWordlePool as string[];
  const h = hashString(`${dateKey}|darktidle.cipher|v2`);
  const idx = list.length ? h % list.length : 0;
  const solution = list[idx] ?? "CHAOS";
  return { length: solution.length, solution };
}

/** Streak is valid going into `todayKey` (no gap > 1 day since last win). */
export function normalizeWordleStreak(
  lastWinDate: string | null,
  storedStreak: number,
  todayKey: string,
): number {
  if (!lastWinDate || storedStreak <= 0) return 0;
  if (lastWinDate === todayKey) return storedStreak;
  const yesterday = addCalendarDaysToKey(todayKey, -1);
  if (lastWinDate === yesterday) return storedStreak;
  return 0;
}

export function nextStreakOnWin(
  lastWinDate: string | null,
  currentStreak: number,
  todayKey: string,
): number {
  const yesterday = addCalendarDaysToKey(todayKey, -1);
  if (lastWinDate === todayKey) return currentStreak;
  if (lastWinDate === yesterday) return currentStreak + 1;
  return 1;
}
