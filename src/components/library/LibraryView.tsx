"use client";

import { useEffect, useMemo, useState } from "react";
import { allQuotes, type Quote } from "@/data/quotes";
import {
  IconDownload,
  IconMusic,
  IconPlay,
  IconSearch,
} from "@/components/mission-icons";

export function LibraryView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeAudio, setActiveAudio] = useState<HTMLAudioElement | null>(null);

  const downloadAudio = (filename: string) => {
    const link = document.createElement("a");
    link.href = `/audio/${filename}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    return () => {
      activeAudio?.pause();
    };
  }, [activeAudio]);

  const quotes = allQuotes as Quote[];

  const filteredQuotes = useMemo(() => {
    const lower = searchTerm.toLowerCase();
    return quotes.filter(
      (quote) =>
        quote.text.toLowerCase().includes(lower) ||
        quote.correct.personality.toLowerCase().includes(lower),
    );
  }, [searchTerm, quotes]);

  const playPreview = (filename: string) => {
    if (activeAudio) {
      activeAudio.pause();
      activeAudio.currentTime = 0;
    }
    const next = new Audio(`/audio/${filename}`);
    next.play().catch((err) => console.error("Playback failed:", err));
    setActiveAudio(next);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tighter text-primary drop-shadow-[0_0_10px_rgba(74,222,128,0.2)]">
          Vox archive
        </h1>
        <p className="text-sm uppercase tracking-widest text-muted-foreground">
          Authorized personnel only // Decrypted logs
        </p>
      </div>

      <div className="relative">
        <IconSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
        <input
          type="search"
          placeholder="Search by quote text or personality…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-11 w-full rounded-md border border-zinc-800 bg-zinc-950 py-2 pl-10 pr-3 text-sm text-foreground transition-colors placeholder:text-zinc-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <p className="text-[10px] uppercase tracking-tighter text-zinc-500">
        Showing {filteredQuotes.length} transmission logs
      </p>

      <div className="max-h-[min(36rem,70vh)] overflow-y-auto rounded-md border border-zinc-800 bg-black/20 p-4">
        <div className="space-y-3">
          {filteredQuotes.map((quote) => (
            <div
              key={quote.id}
              className="group flex items-center justify-between gap-4 rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 transition-all hover:border-primary/30 hover:bg-zinc-900/60"
            >
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="rounded border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
                    {quote.correct.personality}
                  </span>
                  <span className="text-[10px] uppercase text-zinc-500">
                    {quote.correct.class} ({quote.correct.gender})
                  </span>
                </div>
                <p className="truncate text-sm italic text-zinc-200 transition-colors group-hover:text-white">
                  &ldquo;{quote.text}&rdquo;
                </p>
              </div>

              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => playPreview(quote.audio)}
                  className="flex size-10 items-center justify-center rounded-full bg-zinc-800 text-foreground transition-all hover:bg-primary hover:text-black"
                  aria-label="Play clip"
                >
                  <IconPlay className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => downloadAudio(quote.audio)}
                  className="flex size-10 items-center justify-center rounded-full bg-zinc-800 text-foreground transition-all hover:bg-primary hover:text-black"
                  aria-label="Download clip"
                >
                  <IconDownload className="size-4" />
                </button>
              </div>
            </div>
          ))}

          {filteredQuotes.length === 0 ? (
            <div className="py-20 text-center text-zinc-600">
              <IconMusic className="mx-auto mb-4 size-12 opacity-20" />
              <p className="text-xs uppercase tracking-widest">
                No matching vox logs found in the warp.
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="rounded border border-primary/10 bg-primary/5 p-4 text-[10px] text-primary/80">
        <p className="mb-1 font-bold">Data recovery status:</p>
        <div className="flex flex-wrap gap-4">
          <span>
            Veteran: <span className="text-green-500">Complete</span>
          </span>
          <span>
            Zealot: <span className="text-yellow-500">80%</span>
          </span>
          <span>
            Ogryn: <span className="text-red-500">Missing</span>
          </span>
        </div>
      </div>
    </div>
  );
}
