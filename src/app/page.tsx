import Link from "next/link";
import {
  IconAudioLines,
  IconRadio,
  IconShield,
  IconTrophy,
} from "@/components/mission-icons";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center space-y-10 py-10">
      <div className="space-y-4 text-center">
        <h1 className="text-6xl font-black tracking-tighter text-primary drop-shadow-[0_0_15px_rgba(74,222,128,0.3)]">
          Darktidle
        </h1>
        <p className="text-sm uppercase tracking-widest text-muted-foreground">
          Vox-link identification training // Tertium hive
        </p>
      </div>

      <div className="grid w-full max-w-4xl grid-cols-1 gap-6 px-4 md:grid-cols-2">
        <div className="group flex flex-col rounded-xl border border-primary/20 bg-zinc-950 transition-all hover:border-primary/50">
          <div className="flex flex-1 flex-col gap-2 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold tracking-tight">
                Daily assignment
              </h2>
              <IconRadio className="size-6 text-primary group-hover:animate-pulse" />
            </div>
            <p className="text-sm text-muted-foreground">
              Decrypt the vox-transmission and identify the agent.
            </p>
          </div>
          <div className="p-6 pt-0">
            <Link
              href="/heardle"
              className="flex h-11 w-full items-center justify-center rounded-md bg-primary text-sm font-bold text-black transition-colors hover:bg-primary/80"
            >
              Initialize mission
            </Link>
          </div>
        </div>

        <div className="group flex flex-col rounded-xl border border-primary/20 bg-zinc-950 transition-all hover:border-primary/50">
          <div className="flex flex-1 flex-col gap-2 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold tracking-tight">
                Vox archive
              </h2>
              <IconAudioLines className="size-6 text-primary group-hover:animate-pulse" />
            </div>
            <p className="text-sm text-muted-foreground">
              Review all vox traffic records.
            </p>
          </div>
          <div className="p-6 pt-0">
            <Link
              href="/library"
              className="flex h-11 w-full items-center justify-center rounded-md bg-primary text-sm font-bold text-black transition-colors hover:bg-primary/80"
            >
              Access database
            </Link>
          </div>
        </div>
      </div>

      <div className="flex w-full max-w-2xl flex-wrap justify-center gap-8 border-t border-white/5 pt-8">
        <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground">
          <IconShield className="size-4 shrink-0" />
          <span>Active agents: 21</span>
        </div>
        <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground">
          <IconTrophy className="size-4 shrink-0" />
          <span>Best streak: 5 days</span>
        </div>
      </div>
    </div>
  );
}
