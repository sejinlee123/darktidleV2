import rawData from "./quotes.json";

export interface Quote {
  id: number | string;
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

type QuoteGroup = {
  meta: { class: string; personality: string; gender: string };
  audioPrefix: string;
  quotes: { id: string; suffix: string; text: string }[];
};

export const allQuotes: Quote[] = (rawData as QuoteGroup[]).flatMap((group) =>
  group.quotes.map((q) => ({
    id: `${group.meta.personality}-${group.audioPrefix}-${q.id}`,
    audio: `${group.audioPrefix}_${q.suffix}.mp3`,
    text: q.text,
    correct: group.meta,
  })),
);

export const personalities: Personality[] = [
  { value: "Professional", label: "Veteran: Professional" },
  { value: "LooseCannon", label: "Veteran: Loose Cannon" },
  { value: "CutThroat", label: "Veteran: Cutthroat" },

  { value: "Enforcer", label: "Arbitrator: Enforcer" },
  { value: "Punisher", label: "Arbitrator: Punisher" },
  { value: "Nuncio", label: "Arbitrator: Nuncio" },

  { value: "Judge", label: "Zealot: Judge" },
  { value: "Agitator", label: "Zealot: Agitator" },
  { value: "Fanatic", label: "Zealot: Fanatic" },

  { value: "Savant", label: "Psyker: Savant" },
  { value: "Loner", label: "Psyker: Loner" },
  { value: "Seer", label: "Psyker: Seer" },

  { value: "Bodyguard", label: "Ogryn: Bodyguard" },
  { value: "Brawler", label: "Ogryn: Brawler" },
  { value: "Bully", label: "Ogryn: Bully" },
  { value: "Heavy", label: "Ogryn: Heavy" },

  { value: "Anarchist", label: "Hive Scum: Anarchist" },
  { value: "Scrapper", label: "Hive Scum: Scrapper" },
  { value: "Ganger", label: "Hive Scum: Ganger" },
];
