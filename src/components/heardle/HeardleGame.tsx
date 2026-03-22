"use client";

import { useEffect, useRef, useState } from "react";
import { IconAudioLines, IconPlay } from "@/components/mission-icons";

import { GuessInput, type Guess } from "@/components/heardle/GuessInput";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { allQuotes, type Quote } from "@/data/quotes";
import { cn } from "@/lib/utils";

type GameStatus = "playing" | "won" | "lost";

const maxAttempts = 7;

const transmissionCardClass =
  "border-2 border-primary/25 bg-card/80 shadow-2xl backdrop-blur-md ring-1 ring-primary/10";

const winCardClass = cn(
  transmissionCardClass,
  "border-green-500/45 ring-green-500/20 shadow-[0_0_28px_-6px_rgba(34,197,94,0.22)]",
);

const loseCardClass = cn(
  transmissionCardClass,
  "border-red-500/40 ring-red-500/20 shadow-[0_0_28px_-6px_rgba(239,68,68,0.18)]",
);

function pickRandomQuote(): Quote {
  const quotes = allQuotes;
  return quotes[Math.floor(Math.random() * quotes.length)]!;
}

export function HeardleGame() {
  const [targetQuote] = useState<Quote | null>(() => pickRandomQuote());
  const [attempts, setAttempts] = useState<Guess[]>([]);
  const [gameState, setGameState] = useState<GameStatus>("playing");
  const [isPlaying, setIsPlaying] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!targetQuote) return;
    audioRef.current = new Audio(targetQuote.audio);
    audioRef.current.onended = () => setIsPlaying(false);
    return () => {
      audioRef.current?.pause();
    };
  }, [targetQuote]);

  const playAudio = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current
      .play()
      .catch((err) => console.error("Audio playback failed:", err));
    setIsPlaying(true);
  };

  const handleGuess = (guess: Guess) => {
    if (gameState !== "playing" || !targetQuote) return;

    const isCorrect =
      guess.personality.toLowerCase() ===
      targetQuote.correct.personality.toLowerCase();

    if (isCorrect) {
      setGameState("won");
      setIsPlaying(false);
      audioRef.current?.pause();
    } else {
      const next = [...attempts, guess];
      setAttempts(next);
      if (next.length >= maxAttempts) setGameState("lost");
    }
  };

  const restart = () => {
    window.location.reload();
  };

  if (!targetQuote) {
    return (
      <div className="animate-pulse p-10 text-center text-primary">
        Initiating vox link…
      </div>
    );
  }

  const progressPct = (attempts.length / maxAttempts) * 100;

  return (
    <div className="mx-auto max-w-xl space-y-6 p-4">
      <Card className={transmissionCardClass}>
        <CardHeader className="border-b border-border text-center">
          <CardTitle className="text-2xl font-black tracking-[0.3em] text-primary">
            Vox transmission
          </CardTitle>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Atoma Prime — Segmentum Obscurus
          </p>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-6 pt-6">
          <div className="flex h-16 w-full items-center justify-center overflow-hidden rounded-md border border-border bg-zinc-950 dark:bg-black/60">
            <div className="flex h-8 items-end gap-1">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-1 bg-primary transition-all duration-300 ${
                    isPlaying ? "animate-bounce" : "h-2 opacity-30"
                  }`}
                  style={{
                    animationDelay: `${i * 0.1}s`,
                    height: isPlaying ? "100%" : "8px",
                  }}
                />
              ))}
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={isPlaying}
            onClick={playAudio}
            className={cn(
              "size-24 rounded-full! border-4 shadow-none transition-all",
              "focus-visible:ring-[3px] focus-visible:ring-primary/50",
              isPlaying
                ? "animate-pulse border-primary"
                : "border-primary/25 hover:border-primary hover:bg-primary/5",
            )}
            aria-label={isPlaying ? "Playing audio" : "Play transmission"}
          >
            {isPlaying ? (
              <IconAudioLines className="size-7 animate-pulse" />
            ) : (
              <IconPlay className="size-7" />
            )}
          </Button>

          <div className="w-full space-y-2">
            <div className="flex justify-between text-[10px] uppercase tracking-tighter text-muted-foreground">
              <span>Signal integrity</span>
              <span>
                {attempts.length} / {maxAttempts} failed decryptions
              </span>
            </div>
            <Progress
              value={progressPct}
              className="w-full gap-0 [&_[data-slot=progress-track]]:h-1 [&_[data-slot=progress-track]]:bg-white/20 dark:[&_[data-slot=progress-track]]:bg-white/10 [&_[data-slot=progress-indicator]]:bg-red-600"
            />
          </div>
        </CardContent>
      </Card>

      {gameState === "won" ? (
        <Card className={winCardClass}>
          <CardHeader className="border-b border-border text-center">
            <CardTitle className="text-xl font-black tracking-[0.18em] text-green-400 sm:text-2xl sm:tracking-[0.22em]">
              Identified: {targetQuote.correct.personality.toUpperCase()}
            </CardTitle>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Link verified // Channel secure
            </p>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6 pt-6 text-center">
            <p className="max-w-sm text-sm italic text-green-300/90">
              &ldquo;The Emperor protects those who listen.&rdquo;
            </p>
            <Button
              type="button"
              className="bg-green-600 text-white hover:bg-green-500 focus-visible:ring-[3px] focus-visible:ring-green-500/50"
              onClick={restart}
            >
              Next assignment
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {gameState === "lost" ? (
        <Card className={loseCardClass}>
          <CardHeader className="border-b border-border text-center">
            <CardTitle className="text-xl font-black tracking-[0.25em] text-red-400 sm:text-2xl sm:tracking-[0.3em]">
              Signal lost
            </CardTitle>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Transmission terminated // Vox fade
            </p>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6 pt-6 text-center">
            <p className="max-w-sm text-sm text-red-300/90">
              The voice was the{" "}
              <span className="font-semibold text-red-200">
                {targetQuote.correct.personality}
              </span>
              .
            </p>
            <Button
              type="button"
              variant="destructive"
              className="focus-visible:ring-[3px] focus-visible:ring-red-500/45"
              onClick={restart}
            >
              Try again
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {gameState === "playing" ? (
        <Card className={transmissionCardClass}>
          <CardHeader className="border-b border-border text-center">
            <CardTitle className="text-xl font-black tracking-[0.2em] text-primary sm:text-2xl sm:tracking-[0.28em]">
              Submit identification
            </CardTitle>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Decryption terminal // Personality match
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 pt-6">
            <GuessInput
              onGuess={handleGuess}
              attempts={attempts}
              disabled={isPlaying}
            />
            <div className="flex flex-wrap justify-center gap-2">
              {attempts.map((g, i) => (
                <span
                  key={`${g.personality}-${i}`}
                  className="rounded border border-red-500/35 bg-red-500/10 px-2 py-1 text-[10px] text-red-400"
                >
                  {g.personality} ✕
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
