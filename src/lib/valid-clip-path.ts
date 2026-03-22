import voiceManifest from "@/data/voice-manifest.json";

type ManifestEntry = { path: string };

type VoiceManifestFile = {
  entries: ManifestEntry[];
};

const manifest = voiceManifest as VoiceManifestFile;

/** Manifest `path` values — the only clip ids accepted by reaction APIs. */
const VALID_CLIP_PATHS = new Set(
  manifest.entries.map((e) => e.path).filter((p) => typeof p === "string" && p.length > 0),
);

export function isKnownClipPath(clipPath: string): boolean {
  return VALID_CLIP_PATHS.has(clipPath);
}

/** Keeps order, dedupes implicitly via filter; drops unknown paths. */
export function filterKnownClipPaths(paths: string[]): string[] {
  return paths.filter((p) => VALID_CLIP_PATHS.has(p));
}
