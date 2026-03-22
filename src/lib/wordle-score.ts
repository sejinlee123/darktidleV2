export type WordleTile = "correct" | "present" | "absent";

/** Standard Wordle letter scoring (greens first, then yellows with multiset). */
export function scoreWordleGuess(guess: string, solution: string): WordleTile[] {
  const g = guess.toUpperCase();
  const s = solution.toUpperCase();
  const n = s.length;
  if (g.length !== n) {
    return Array.from({ length: n }, () => "absent");
  }

  const result: WordleTile[] = Array.from({ length: n }, () => "absent");
  const remaining = new Map<string, number>();

  for (let i = 0; i < n; i++) {
    const c = s[i]!;
    remaining.set(c, (remaining.get(c) ?? 0) + 1);
  }

  for (let i = 0; i < n; i++) {
    if (g[i] === s[i]) {
      result[i] = "correct";
      const c = g[i]!;
      const next = (remaining.get(c) ?? 0) - 1;
      if (next <= 0) remaining.delete(c);
      else remaining.set(c, next);
    }
  }

  for (let i = 0; i < n; i++) {
    if (result[i] === "correct") continue;
    const c = g[i]!;
    const cnt = remaining.get(c) ?? 0;
    if (cnt > 0) {
      result[i] = "present";
      const next = cnt - 1;
      if (next <= 0) remaining.delete(c);
      else remaining.set(c, next);
    }
  }

  return result;
}
