import voiceConfig from "./voice-config.json";
import voiceManifest from "./voice-manifest.json";

export interface Quote {
  id: number | string;
  /** Public URL path (leading slash), e.g. /Darktide_Voices/Veteran/... */
  audio: string;
  text: string;
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
    audio: audioUrl(entry.path),
    text:
      typeof entry.text === "string" && entry.text.trim() !== ""
        ? entry.text.trim()
        : placeholder,
    correct: {
      class: archetype.displayClass,
      personality: v.personality,
      gender: entry.gender,
    },
  };
  return [q];
});

export const personalities: Personality[] = [
  ...Object.entries(config.archetypes).flatMap(([, arch]) =>
    Object.values(arch.variants).map((v) => ({
      value: v.personality,
      label: v.label,
    })),
  ),
  { value: "Heavy", label: "Ogryn: Heavy" },
];
