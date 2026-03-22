import voiceConfig from "./voice-config.json";
import voiceManifest from "./voice-manifest.json";

export interface Quote {
  id: number | string;
  /** Manifest-relative path, e.g. Arbites/Grenade/....mp3 — stable id for likes */
  clipPath: string;
  /** Public URL path (leading slash), e.g. /Darktide_Voices/Veteran/... */
  audio: string;
  text: string;
  /** Path segment after class folder (e.g. Grenade) — “ability name” in archive search */
  category: string;
  /** Archetype key from files (e.g. Scum) — “class” in archive search alongside display name */
  folderKey: string;
  correct: {
    class: string;
    personality: string;
    gender: string;
  };
}

interface Personality {
  value: string;
  label: string;
}

type VariantConfig = { personality: string; label: string };

type ArchetypeConfig = {
  displayClass: string;
  variants: Record<string, VariantConfig>;
};

type VoiceConfigFile = {
  _readme?: string;
  version: number;
  assetBase: string;
  placeholderText: string;
  archetypes: Record<string, ArchetypeConfig>;
};

type ManifestEntry = {
  path: string;
  folder: string;
  category: string;
  variant: string;
  gender: string;
  clipIndex: number;
  /** From local Whisper (see scripts/transcribe_voice_manifest.py); falls back to voice-config placeholder */
  text?: string;
};

type VoiceManifestFile = {
  entries: ManifestEntry[];
};

const config = voiceConfig as VoiceConfigFile;
const manifest = voiceManifest as VoiceManifestFile;

const base = config.assetBase.replace(/\/$/, "");

function audioUrl(relativePath: string): string {
  return `${base}/${relativePath}`.replace(/\/{2,}/g, "/");
}

const placeholder = config.placeholderText;

export const allQuotes: Quote[] = manifest.entries.flatMap((entry) => {
  const archetype = config.archetypes[entry.folder];
  if (!archetype) return [];
  const v = archetype.variants[entry.variant];
  if (!v) return [];
  const q: Quote = {
    id: `${entry.folder}-${entry.category}-${v.personality}-${entry.gender}-${entry.clipIndex}`,
    clipPath: entry.path,
    audio: audioUrl(entry.path),
    text:
      typeof entry.text === "string" && entry.text.trim() !== ""
        ? entry.text.trim()
        : placeholder,
    category: entry.category,
    folderKey: entry.folder,
    correct: {
      class: archetype.displayClass,
      personality: v.personality,
      gender: entry.gender,
    },
  };
  return [q];
});

/** Distinct clip categories (ability names) for the library filter dropdown. */
export const abilityNameOptions: string[] = Array.from(
  new Set(allQuotes.map((q) => q.category)),
).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

export const personalities: Personality[] = Object.entries(
  config.archetypes,
).flatMap(([, arch]) =>
  Object.values(arch.variants).map((v) => ({
    value: v.personality,
    label: v.label,
  })),
);

/** Archetype folder keys + display names for library class filter (matches `Quote.folderKey`). */
export type ArchetypeClassOption = {
  folderKey: string;
  label: string;
};

export const archetypeClassOptions: ArchetypeClassOption[] = Object.entries(
  config.archetypes,
)
  .map(([folderKey, arch]) => ({
    folderKey,
    label: arch.displayClass,
  }))
  .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));
