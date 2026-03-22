const STORAGE_KEY = "darktidle.heardle.heresyCooldownUntil.v1";

/** Lockout after confessing heresy (ms). */
export const HERESY_COOLDOWN_MS = 5 * 60 * 1000;

/** Unix ms when the player may use the transmission again, or null if clear. */
export function readHeresyCooldownUntil(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const n = Number(raw);
    if (!Number.isFinite(n)) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    if (n <= Date.now()) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return n;
  } catch {
    return null;
  }
}

export function startHeresyCooldown(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, String(Date.now() + HERESY_COOLDOWN_MS));
  } catch {
    /* quota / private mode */
  }
}

export function formatCooldownRemaining(untilMs: number, nowMs: number): string {
  const ms = Math.max(0, untilMs - nowMs);
  const totalSec = Math.ceil(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
