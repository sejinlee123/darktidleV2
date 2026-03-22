import {
  IconCpu,
  IconGithub,
  IconInfo,
  IconShieldAlert,
} from "@/components/mission-icons";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 p-6">
      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-black tracking-tighter text-primary drop-shadow-[0_0_12px_oklch(0.78_0.19_145_/_0.25)]">
          Project: Darktidle
        </h1>
        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          Classified information // Level 4 clearance required
        </p>
      </div>

      <div className="grid gap-6">
        <Card className="border-border bg-card ring-1 ring-primary/10 transition-shadow hover:ring-primary/20">
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="rounded-lg bg-primary/12 p-2 ring-1 ring-primary/25">
              <IconCpu className="size-5 text-primary" />
            </div>
            <CardTitle className="text-xl">The mission</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground leading-relaxed">
            <p>
              Darktidle is a fan-made audio recognition game inspired by{" "}
              <strong className="text-foreground">Heardle</strong>. The goal is
              simple: identify the character personality from the voice lines
              found within the hive city of Tertium.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card ring-1 ring-primary/10 transition-shadow hover:ring-primary/20">
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="rounded-lg bg-primary/12 p-2 ring-1 ring-primary/25">
              <IconInfo className="size-5 text-primary" />
            </div>
            <CardTitle className="text-xl">How to play</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <ul className="list-disc space-y-2 pl-5">
              <li>Listen to the audio transmission provided by the vox-link.</li>
              <li>Submit your identification using the search terminal.</li>
              <li>
                You have <strong className="text-foreground">7 attempts</strong>{" "}
                to identify the correct personality.
              </li>
              <li>Incorrect guesses will be logged as failed decryptions.</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-500/35 bg-card ring-1 ring-red-500/15">
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="rounded-lg bg-red-500/12 p-2 ring-1 ring-red-500/30">
              <IconShieldAlert className="size-5 text-red-500" />
            </div>
            <CardTitle className="text-xl text-red-400">Legal notice</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-muted-foreground">
            <p>
              This is a non-commercial, fan-made project. All audio assets,
              characters, and world-building elements are property of{" "}
              <strong className="text-foreground">Fatshark AB</strong> and{" "}
              <strong className="text-foreground">Games Workshop</strong>.
            </p>
            <p>
              Darktidle is not affiliated with, endorsed, or sponsored by
              Fatshark or Games Workshop. We just really like the voice acting
              in Darktide.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center gap-6 pt-6">
        <a
          href="https://github.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:rounded-md"
        >
          <IconGithub className="size-4" />
          Source code
        </a>
      </div>
    </div>
  );
}
