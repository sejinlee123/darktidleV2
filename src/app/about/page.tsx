import {
  IconCpu,
  IconGithub,
  IconInfo,
  IconShieldAlert,
} from "@/components/mission-icons";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 p-6">
      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-black tracking-tighter text-primary">
          Project: Darktidle
        </h1>
        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          Classified information // Level 4 clearance required
        </p>
      </div>

      <div className="grid gap-6">
        <section className="rounded-xl border border-zinc-800 bg-zinc-950">
          <div className="flex flex-row items-center gap-4 border-b border-zinc-800/80 px-6 py-4">
            <div className="rounded-lg bg-primary/10 p-2">
              <IconCpu className="size-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold tracking-tight">The mission</h2>
          </div>
          <div className="px-6 py-4 leading-relaxed text-zinc-400">
            <p>
              Darktidle is a fan-made audio recognition game inspired by{" "}
              <strong className="text-zinc-200">Heardle</strong>. The goal is
              simple: identify the character personality from the voice lines
              found within the hive city of Tertium.
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-950">
          <div className="flex flex-row items-center gap-4 border-b border-zinc-800/80 px-6 py-4">
            <div className="rounded-lg bg-primary/10 p-2">
              <IconInfo className="size-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold tracking-tight">How to play</h2>
          </div>
          <div className="space-y-4 px-6 py-4 text-zinc-400">
            <ul className="list-disc space-y-2 pl-5">
              <li>Listen to the audio transmission provided by the vox-link.</li>
              <li>Submit your identification using the search terminal.</li>
              <li>
                You have <strong className="text-zinc-200">7 attempts</strong>{" "}
                to identify the correct personality.
              </li>
              <li>Incorrect guesses will be logged as failed decryptions.</li>
            </ul>
          </div>
        </section>

        <section className="rounded-xl border-2 border-red-900/30 bg-zinc-950">
          <div className="flex flex-row items-center gap-4 border-b border-red-900/20 px-6 py-4">
            <div className="rounded-lg bg-red-500/10 p-2">
              <IconShieldAlert className="size-5 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold tracking-tight text-red-400">
              Legal notice
            </h2>
          </div>
          <div className="space-y-3 px-6 py-4 text-xs text-zinc-500">
            <p>
              This is a non-commercial, fan-made project. All audio assets,
              characters, and world-building elements are property of{" "}
              <strong className="text-zinc-400">Fatshark AB</strong> and{" "}
              <strong className="text-zinc-400">Games Workshop</strong>.
            </p>
            <p>
              Darktidle is not affiliated with, endorsed, or sponsored by
              Fatshark or Games Workshop. We just really like the voice acting
              in Darktide.
            </p>
          </div>
        </section>
      </div>

      <div className="flex justify-center gap-6 pt-6">
        <a
          href="https://github.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-primary"
        >
          <IconGithub className="size-4" />
          Source code
        </a>
      </div>
    </div>
  );
}
