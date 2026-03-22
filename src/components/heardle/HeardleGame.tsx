"use client";

import { useEffect, useRef, useState } from "react";
import { allQuotes, type Quote } from "@/data/quotes";
import { GuessInput, type Guess } from "@/components/heardle/GuessInput";
import { IconAudioLines, IconPlay } from "@/components/mission-icons";

type GameStatus = "playing" | "won" | "lost";

const maxAttempts = 7;

export function HeardleGame() {
  const [targetQuote, setTargetQuote] = useState<Quote | null>(null);
  const [attempts, setAttempts] = useState<Guess[]>([]);
  const [gameState, setGameState] = useState<GameStatus>("playing");
  const [isPlaying, setIsPlaying] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const quotes = allQuotes;
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]!;
    setTargetQuote(randomQuote);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!targetQuote) return;
    audioRef.current = new Audio(`/audio/${targetQuote.audio}`);
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
      <div className="rounded-xl border-2 border-primary/20 bg-black/60 shadow-2xl backdrop-blur-md">
        <div className="mb-4 border-b border-white/5 px-6 py-4 text-center">
          <h2 className="text-2xl font-black tracking-[0.3em] text-primary">
            Vox transmission
          </h2>
          <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">
            Atoma Prime — Segmentum Obscurus
          </p>
        </div>

        <div className="flex flex-col items-center gap-6 px-6 pb-6">
          <div className="flex h-16 w-full items-center justify-center overflow-hidden rounded border border-white/10 bg-zinc-950">
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

          <button
            type="button"
            disabled={isPlaying}
            onClick={playAudio}
            className={`flex size-24 items-center justify-center rounded-full border-4 transition-all disabled:opacity-70 ${
              isPlaying
                ? "animate-pulse border-primary"
                : "border-primary/20 hover:border-primary"
            }`}
            aria-label={isPlaying ? "Playing audio" : "Play transmission"}
          >
            {isPlaying ? (
              <IconAudioLines className="size-8 animate-pulse text-primary" />
            ) : (
              <IconPlay className="size-8 text-primary" />
            )}
          </button>

          <div className="w-full space-y-2">
            <div className="flex justify-between text-[10px] uppercase tracking-tighter text-muted-foreground">
              <span>Signal integrity</span>
              <span>
                {attempts.length} / {maxAttempts} failed decryptions
              </span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-white">
              <div
                className="h-full bg-red-600 transition-[width] duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {gameState === "won" ? (
        <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-6 text-center shadow-[0_0_15px_rgba(34,197,94,0.2)]">
          <h3 className="mb-1 text-xl font-black tracking-tighter text-green-400">
            Identified: {targetQuote.correct.personality.toUpperCase()}
          </h3>
          <p className="text-xs italic text-green-300/70">
            &ldquo;The Emperor protects those who listen.&rdquo;
          </p>
          <button
            type="button"
            onClick={restart}
            className="mt-4 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-500"
          >
            Next assignment
          </button>
        </div>
      ) : null}

      {gameState === "lost" ? (
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-6 text-center">
          <h3 className="mb-1 text-xl font-black text-red-400">Signal lost</h3>
          <p className="mb-4 text-xs text-red-300/70">
            The voice was the {targetQuote.correct.personality}.
          </p>
          <button
            type="button"
            onClick={restart}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500"
          >
            Try again
          </button>
        </div>
      ) : null}

      {gameState === "playing" ? (
        <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-6 text-center shadow-[0_0_15px_rgba(34,197,94,0.2)]">
          <p className="text-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Submit identification
          </p>
          <div className="mt-4">
            <GuessInput
              onGuess={handleGuess}
              attempts={attempts}
              disabled={isPlaying}
            />
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {attempts.map((g, i) => (
              <span
                key={`${g.personality}-${i}`}
                className="rounded border border-red-500/30 bg-red-500/10 px-2 py-1 text-[10px] text-red-400"
              >
                {g.personality} ✕
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
