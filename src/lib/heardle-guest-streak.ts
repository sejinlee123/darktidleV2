const STORAGE_KEY = "darktidle.heardle.guest.v1";

export type GuestHeardleFailedGuess = { personality: string };

export type GuestHeardleStreak = {
  current: number;
  best: number;
  /** Wrong guesses since last streak reset; guests only, persisted locally. */
  failedGuesses: GuestHeardleFailedGuess[];
};

function clampStreak(n: number): number {
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(999, Math.floor(n));
}

function normalizeFailedGuesses(raw: unknown): GuestHeardleFailedGuess[] {
  if (!Array.isArray(raw)) return [];
  const out: GuestHeardleFailedGuess[] = [];
  for (const item of raw) {
    if (
      item &&
      typeof item === "object" &&
      typeof (item as { personality?: unknown }).personality === "string"
    ) {
      const p = (item as { personality: string }).personality.trim();
      if (p) out.push({ personality: p });
    }
  }
  return out;
}

export function readGuestHeardleStreak(): GuestHeardleStreak {
  if (typeof window === "undefined") {
    return { current: 0, best: 0, failedGuesses: [] };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { current: 0, best: 0, failedGuesses: [] };
    const j = JSON.parse(raw) as {
      current?: unknown;
      best?: unknown;
      failedGuesses?: unknown;
    };
    const current = clampStreak(Number(j.current));
    const best = clampStreak(Number(j.best));
    const failedGuesses = normalizeFailedGuesses(j.failedGuesses);
    return {
      current,
      best: Math.max(best, current),
      failedGuesses,
    };
  } catch {
    return { current: 0, best: 0, failedGuesses: [] };
  }
}

export function writeGuestHeardleStreak(next: GuestHeardleStreak): void {
  if (typeof window === "undefined") return;
  try {
    const current = clampStreak(next.current);
    const best = Math.max(clampStreak(next.best), current);
    const failedGuesses = normalizeFailedGuesses(next.failedGuesses);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ current, best, failedGuesses }),
    );
  } catch {
    /* private mode / quota */
  }
}
