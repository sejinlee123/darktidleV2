import {
  IconAudioLines,
  IconCpu,
  IconInfo,
  IconMail,
  IconSearch,
  IconShieldAlert,
  IconTrophy,
  IconWordGrid,
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
          About Darktidle
        </h1>
        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          Fan operations briefing // Tertium adjacent
        </p>
      </div>

      <div className="grid gap-6">
        <Card className="border-border bg-card ring-1 ring-primary/10 transition-shadow hover:ring-primary/20">
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="rounded-lg bg-primary/12 p-2 ring-1 ring-primary/25">
              <IconCpu className="size-5 text-primary" />
            </div>
            <CardTitle className="text-xl">What this is</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground leading-relaxed">
            <p>
              <strong className="text-foreground">Darktidle</strong> is a
              non-commercial fan site themed around{" "}
              <strong className="text-foreground">
                Warhammer 40,000: Darktide
              </strong>
              . It bundles Heardle, a daily word cipher, a searchable vox
              archive, and a streak leaderboard—built from community-sourced
              voice lines and transcripts (see{" "}
              <strong className="text-foreground">Credits</strong> below). Not
              an official product.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card ring-1 ring-primary/10 transition-shadow hover:ring-primary/20">
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="rounded-lg bg-primary/12 p-2 ring-1 ring-primary/25">
              <IconSearch className="size-5 text-primary" />
            </div>
            <CardTitle className="text-xl">What you can do here</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong className="text-foreground">Vox Heardle</strong> —
                listen once per round, then pick the correct personality from a
                combobox. Seven failed guesses end the transmission. Win streaks
                are stored on your account when logged in; as a guest they are
                kept in <strong className="text-foreground">local storage</strong>{" "}
                for this browser.
              </li>
              <li>
                <strong className="text-foreground">Tertium cipher</strong>{" "}
                (Wordle-style) — one puzzle per local calendar day (same answer
                for everyone on that date), four to seven letters from a
                shuffled Darktide-themed list, six guesses, standard
                green/amber/grey feedback. Streaks live in your browser as a
                guest and sync to your account when signed in.
              </li>
              <li>
                <strong className="text-foreground">Vox archive</strong> —
                search quotes, filter by ability, class, and gender; play clips,
                download files, and (when signed in) like or dislike clips with
                tallies shared across the site.
              </li>
              <li>
                <strong className="text-foreground">Leaderboard</strong> — top
                Heardle best streaks for signed-in players (first 100 ranks,
                paginated).
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-border bg-card ring-1 ring-primary/10 transition-shadow hover:ring-primary/20">
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="rounded-lg bg-primary/12 p-2 ring-1 ring-primary/25">
              <IconInfo className="size-5 text-primary" />
            </div>
            <CardTitle className="text-xl">How Heardle works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <ul className="list-disc space-y-2 pl-5">
              <li>Use the play control to hear the current transmission.</li>
              <li>
                Open the decryption terminal and submit a personality; wrong
                guesses are listed as failed decryptions.
              </li>
              <li>
                You have{" "}
                <strong className="text-foreground">seven</strong> incorrect
                guesses before the round is lost.
              </li>
              <li>
                After a win or loss you can rate the clip (signed in only).
                Starting the next assignment keeps your streak logic without a
                full page reload.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-border bg-card ring-1 ring-primary/10 transition-shadow hover:ring-primary/20">
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="rounded-lg bg-primary/12 p-2 ring-1 ring-primary/25">
              <IconWordGrid className="size-5 text-primary" />
            </div>
            <CardTitle className="text-xl">Cipher (Wordle) rules</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground leading-relaxed">
            <p>
              The daily solution is drawn from the shuffled site word list; your
              guesses can be any letters A–Z matching that day&apos;s length.
              Letters turn{" "}
              <strong className="text-foreground">green</strong> if they are
              correct and in the right place,{" "}
              <strong className="text-foreground">amber</strong> if the letter
              exists elsewhere in the word, and{" "}
              <strong className="text-foreground">grey</strong> if it does not
              appear (with duplicate letters handled like the usual Wordle
              rules).
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card ring-1 ring-primary/10 transition-shadow hover:ring-primary/20">
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="rounded-lg bg-primary/12 p-2 ring-1 ring-primary/25">
              <IconTrophy className="size-5 text-primary" />
            </div>
            <CardTitle className="text-xl">Accounts</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground leading-relaxed">
            <p>
              Register or log in to sync Heardle streaks to the server, appear on
              the leaderboard, and persist likes and dislikes in the archive.
              Guest Heardle streaks never leave your device except in a normal
              browser clear-data flow.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card ring-1 ring-primary/10 transition-shadow hover:ring-primary/20">
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="rounded-lg bg-primary/12 p-2 ring-1 ring-primary/25">
              <IconAudioLines className="size-5 text-primary" />
            </div>
            <CardTitle className="text-xl">Credits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              <strong className="text-foreground">Voice lines</strong> — sourced
              from{" "}
              <a
                href="https://www.youtube.com/@Hypnoleptic"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-primary underline-offset-4 transition-colors hover:text-primary/90 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Hypnoleptic on YouTube
              </a>{" "}
              (<span className="font-mono text-xs">@Hypnoleptic</span>), where
              the clips used on this site were obtained.
            </p>
            <p>
              <strong className="text-foreground">Transcripts</strong> — line
              text in the archive is produced with{" "}
              <strong className="text-foreground">
                AI-assisted speech-to-text
              </strong>
              , followed by <strong className="text-foreground">limited manual review</strong>{" "}
              to catch obvious errors. Transcripts may still contain mistakes;
              treat search and display as approximate.
            </p>
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
              This is a non-commercial, fan-made project. Audio, characters,
              setting, and trademarks belong to{" "}
              <strong className="text-foreground">Fatshark AB</strong> and{" "}
              <strong className="text-foreground">Games Workshop Limited</strong>{" "}
              and their licensors.
            </p>
            <p>
              Darktidle is not affiliated with, endorsed by, or sponsored by
              Fatshark or Games Workshop.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card ring-1 ring-primary/10 transition-shadow hover:ring-primary/20">
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="rounded-lg bg-primary/12 p-2 ring-1 ring-primary/25">
              <IconMail className="size-5 text-primary" />
            </div>
            <CardTitle className="text-xl">Contact me</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-muted-foreground leading-relaxed">
            <p>Questions, feedback, or takedown requests about this project:</p>
            <p>
              <a
                href="mailto:lshredder45@gmail.com"
                className="font-semibold text-primary underline-offset-4 transition-colors hover:text-primary/90 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                lshredder45@gmail.com
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
