/**
 * Regenerate src/data/wordle-darktide.pool.json from wordle-darktide.txt
 * Run: node scripts/build-wordle-pool.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const raw = fs.readFileSync(
  path.join(root, "src/data/wordle-darktide.txt"),
  "utf8",
);

const MIN = 4;
const MAX = 7;
const seen = new Set();
const words = [];
for (const line of raw.split(/\r?\n/)) {
  const w = line
    .trim()
    .toUpperCase()
    .replace(/[^A-Z]/g, "");
  if (w.length < MIN || w.length > MAX) continue;
  if (seen.has(w)) continue;
  seen.add(w);
  words.push(w);
}

fs.writeFileSync(
  path.join(root, "src/data/wordle-darktide.pool.json"),
  JSON.stringify({ v: 1, words }, null, 0) + "\n",
  "utf8",
);
console.log(`Wrote ${words.length} words (length ${MIN}–${MAX})`);
