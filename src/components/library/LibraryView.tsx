"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  IconDownload,
  IconMusic,
  IconPlay,
  IconSearch,
} from "@/components/mission-icons";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { allQuotes, type Quote } from "@/data/quotes";

export function LibraryView() {
  const [searchTerm, setSearchTerm] = useState("");
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  const downloadAudio = (publicPath: string) => {
    const link = document.createElement("a");
    link.href = publicPath;
    link.download = publicPath.split("/").pop() ?? "clip.mp3";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    return () => {
      activeAudioRef.current?.pause();
      activeAudioRef.current = null;
    };
  }, []);

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
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current.currentTime = 0;
    }
    const next = new Audio(filename);
    next.play().catch((err) => console.error("Playback failed:", err));
    activeAudioRef.current = next;
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tighter text-primary drop-shadow-[0_0_10px_oklch(0.78_0.19_145_/_0.2)]">
          Vox archive
        </h1>
        <p className="text-sm uppercase tracking-widest text-muted-foreground">
          Authorized personnel only // Decrypted logs
        </p>
      </div>

      <InputGroup className="h-11! rounded-lg! border-primary/20 bg-card transition-colors focus-within:border-primary/45">
        <InputGroupAddon>
          <IconSearch className="size-4 text-muted-foreground" />
        </InputGroupAddon>
        <InputGroupInput
          type="search"
          placeholder="Search by quote text or personality…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-11 text-sm"
        />
      </InputGroup>

      <p className="text-[10px] uppercase tracking-tighter text-muted-foreground">
        Showing {filteredQuotes.length} transmission logs
      </p>

      <ScrollArea className="h-[min(36rem,70vh)] rounded-lg border border-border bg-muted/20 p-4">
        <div className="space-y-3 pr-3">
          {filteredQuotes.map((quote) => (
            <Card
              key={quote.id}
              className="border-border bg-card/50 transition-all hover:border-primary/35 hover:bg-card"
            >
              <CardContent className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="rounded border border-primary/25 bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
                      {quote.correct.personality}
                    </span>
                    <span className="text-[10px] uppercase text-muted-foreground">
                      {quote.correct.class} ({quote.correct.gender})
                    </span>
                  </div>
                  <p className="truncate text-sm italic text-card-foreground/90">
                    &ldquo;{quote.text}&rdquo;
                  </p>
                </div>

                <div className="flex shrink-0 gap-2">
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="secondary"
                    className="rounded-full border border-transparent bg-secondary transition-all hover:border-primary/40 hover:bg-primary hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-primary/45"
                    onClick={() => playPreview(quote.audio)}
                    aria-label="Play clip"
                  >
                    <IconPlay className="size-4 fill-current" />
                  </Button>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="secondary"
                    className="rounded-full border border-transparent bg-secondary transition-all hover:border-primary/40 hover:bg-primary hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-primary/45"
                    onClick={() => downloadAudio(quote.audio)}
                    aria-label="Download clip"
                  >
                    <IconDownload className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredQuotes.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">
              <IconMusic className="mx-auto mb-4 size-12 opacity-25" />
              <p className="text-xs uppercase tracking-widest">
                No matching vox logs found in the warp.
              </p>
            </div>
          ) : null}
        </div>
      </ScrollArea>

      <Card className="border-primary/15 bg-primary/5">
        <CardContent className="p-4 text-[10px] text-primary/80">
          <p className="mb-2 font-bold text-primary">Data recovery status:</p>
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
        </CardContent>
      </Card>
    </div>
  );
}
