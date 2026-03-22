const STORAGE_KEY = "darktidle.heardle.round.v1";

export type HeardleRoundGuess = { personality: string };

export type HeardleRoundGameState =
  | "playing"
  | "won"
  | "lost"
  | "heresy";

export type HeardleRoundPersisted = {
  v: 1;
  clipPath: string;
  attempts: HeardleRoundGuess[];
  gameState: HeardleRoundGameState;
  /** Wrong-guess chips (may include prior rounds in a streak). */
  streakFailedGuesses: HeardleRoundGuess[];
};

function normalizeGuesses(raw: unknown): HeardleRoundGuess[] {
  if (!Array.isArray(raw)) return [];
  const out: HeardleRoundGuess[] = [];
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

function isGameState(x: unknown): x is HeardleRoundGameState {
  return (
    x === "playing" ||
    x === "won" ||
    x === "lost" ||
    x === "heresy"
  );
}

export function readHeardleRound(): HeardleRoundPersisted | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const j = JSON.parse(raw) as Partial<HeardleRoundPersisted>;
    if (j.v !== 1 || typeof j.clipPath !== "string" || !j.clipPath) {
      return null;
    }
    if (!isGameState(j.gameState)) return null;
    const attempts = normalizeGuesses(j.attempts);
    const streakFailedGuesses = normalizeGuesses(
      j.streakFailedGuesses ?? j.attempts,
    );
    return {
      v: 1,
      clipPath: j.clipPath,
      attempts,
      gameState: j.gameState,
      streakFailedGuesses,
    };
  } catch {
    return null;
  }
}

export function writeHeardleRound(data: {
  clipPath: string;
  attempts: HeardleRoundGuess[];
  gameState: HeardleRoundGameState;
  streakFailedGuesses: HeardleRoundGuess[];
}): void {
  if (typeof window === "undefined") return;
  try {
    const payload: HeardleRoundPersisted = {
      v: 1,
      clipPath: data.clipPath,
      attempts: normalizeGuesses(data.attempts),
      gameState: data.gameState,
      streakFailedGuesses: normalizeGuesses(data.streakFailedGuesses),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* quota / private mode */
  }
}

export function clearHeardleRound(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
