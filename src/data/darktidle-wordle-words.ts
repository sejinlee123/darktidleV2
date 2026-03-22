/**
 * Darktide Wordle pool from `wordle-darktide.txt` → `wordle-darktide.pool.json`.
 * Regenerate JSON after editing the txt: `pnpm wordle:pool`
 */
import poolData from "./wordle-darktide.pool.json";

/** Word lengths present in the pool (4–7 letters). */
export type WordleLength = 4 | 5 | 6 | 7;

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)!;
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(items: readonly T[], seed: number): T[] {
  const a = [...items];
  const rand = mulberry32(seed);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

const PARSED_WORDS: readonly string[] = poolData.words;

const SHUFFLE_SEED = hashString("darktidle|wordlist|shuffle|v1");

/** Deterministic permutation of the txt list (same order for every player). */
export const shuffledWordlePool: readonly string[] = seededShuffle(
  PARSED_WORDS,
  SHUFFLE_SEED,
);

const allowedAll = new Set<string>(PARSED_WORDS);

export function wordsForLength(len: number): readonly string[] {
  return PARSED_WORDS.filter((w) => w.length === len);
}

export function pickRandomSolution(len: WordleLength, seed?: number): string {
  const list = wordsForLength(len) as string[];
  if (list.length === 0) return "CHAOS";
  if (seed != null) {
    const x = Math.sin(seed) * 10000;
    const i = Math.floor((x - Math.floor(x)) * list.length);
    return list[i]!;
  }
  return list[Math.floor(Math.random() * list.length)]!;
}

export function pickRandomRound(): { length: WordleLength; solution: string } {
  const list = shuffledWordlePool as string[];
  const w = list[Math.floor(Math.random() * list.length)]!;
  return { length: w.length as WordleLength, solution: w };
}

export function isAllowedWord(word: string, len: number): boolean {
  const u = word.toUpperCase().replace(/[^A-Z]/g, "");
  if (u.length !== len) return false;
  return allowedAll.has(u);
}
