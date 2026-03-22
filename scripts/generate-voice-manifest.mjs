/**
 * Scans public/Darktide_Voices for *.mp3 and writes src/data/voice-manifest.json.
 * Preserves existing `text` per `path` when re-running (e.g. after transcription).
 * Run: node scripts/generate-voice-manifest.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "public", "Darktide_Voices");
const out = path.join(__dirname, "..", "src", "data", "voice-manifest.json");

const basenameRe =
  /^(Arbites|Ogryn|Psyker|Scum|Veteran|Zealot)_([ABC])_(Male|Female)_(.+)_(\d+)\.mp3$/;

function walk(dir, acc = []) {
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, name.name);
    if (name.isDirectory()) walk(p, acc);
    else if (name.name.endsWith(".mp3")) acc.push(p);
  }
  return acc;
}

/** Carry forward transcription (or other) text keyed by relative path. */
function loadPreviousTextByPath() {
  const map = new Map();
  if (!fs.existsSync(out)) return map;
  try {
    const prev = JSON.parse(fs.readFileSync(out, "utf8"));
    for (const e of prev.entries || []) {
      if (typeof e.text === "string" && e.text.length > 0) {
        map.set(e.path, e.text);
      }
    }
  } catch {
    /* ignore */
  }
  return map;
}

const previousText = loadPreviousTextByPath();

if (!fs.existsSync(root)) {
  console.warn("generate-voice-manifest: missing", root, "— writing empty manifest.");
  fs.writeFileSync(
    out,
    JSON.stringify({ generatedAt: new Date().toISOString(), entries: [] }, null, 2),
  );
  process.exit(0);
}

const files = walk(root).sort();
const entries = [];

for (const abs of files) {
  const rel = path.relative(root, abs).split(path.sep).join("/");
  const parts = rel.split("/");
  if (parts.length < 3) continue;
  const folder = parts[0];
  const category = parts[1];
  const baseName = parts[parts.length - 1];
  const m = baseName.match(basenameRe);
  if (!m) {
    console.warn("skip (unexpected name):", rel);
    continue;
  }
  const [, fileClass, variant, genderRaw, , indexStr] = m;
  if (fileClass !== folder) {
    console.warn("skip (folder/class mismatch):", rel);
    continue;
  }
  entries.push({
    path: rel,
    folder,
    category,
    variant,
    gender: genderRaw === "Male" ? "Male" : "Female",
    clipIndex: parseInt(indexStr, 10),
    text: previousText.has(rel) ? previousText.get(rel) : "Placeholder",
  });
}

const payload = {
  generatedAt: new Date().toISOString(),
  count: entries.length,
  entries,
};

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(payload, null, 2));
console.log("Wrote", out, "—", entries.length, "clips");
