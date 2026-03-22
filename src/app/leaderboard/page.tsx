import {
  IconMedal,
  IconTarget,
  IconTrophy,
  IconUser,
} from "@/components/mission-icons";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const topArchivists = [
  { rank: 1, name: "Varlet_77", streak: 42, accuracy: "98%", class: "Veteran" },
  {
    rank: 2,
    name: "Beloveds_BFF",
    streak: 38,
    accuracy: "94%",
    class: "Psyker",
  },
  {
    rank: 3,
    name: "Ration_Hoarder",
    streak: 31,
    accuracy: "89%",
    class: "Ogryn",
  },
  {
    rank: 4,
    name: "Tertium_Ghost",
    streak: 25,
    accuracy: "91%",
    class: "Veteran",
  },
  {
    rank: 5,
    name: "Chainsword_Enthusiast",
    streak: 19,
    accuracy: "85%",
    class: "Zealot",
  },
];

export default function LeaderboardPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 p-6">
      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-black tracking-tighter text-primary drop-shadow-[0_0_12px_oklch(0.78_0.19_145_/_0.25)]">
          Vox archive rankings
        </h1>
        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          Top performing agents // Atoma prime sector
        </p>
      </div>

      <div className="grid gap-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {topArchivists.slice(0, 3).map((agent, i) => (
            <Card
              key={agent.name}
              className={
                i === 0
                  ? "border-primary/45 bg-card shadow-[0_0_18px_oklch(0.78_0.19_145_/_0.15)] ring-2 ring-primary/30"
                  : "border-border bg-card ring-1 ring-border"
              }
            >
              <CardContent className="space-y-2 pt-6 text-center">
                <div className="flex justify-center">
                  {i === 0 ? (
                    <IconTrophy className="size-8 text-yellow-500" />
                  ) : null}
                  {i === 1 ? (
                    <IconMedal className="size-8 text-zinc-400" />
                  ) : null}
                  {i === 2 ? (
                    <IconMedal className="size-8 text-amber-700" />
                  ) : null}
                </div>
                <p className="text-lg font-black tracking-tight">{agent.name}</p>
                <div className="text-[10px] font-bold uppercase tracking-widest text-primary">
                  {agent.streak} streak
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="overflow-hidden border-border ring-1 ring-primary/10">
          <CardHeader className="border-b border-border bg-muted/40">
            <div className="flex items-center gap-4">
              <IconTarget className="size-5 text-primary" />
              <CardTitle className="text-xl">Grand archivists</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-border text-[10px] uppercase tracking-widest text-muted-foreground">
                    <th className="px-6 py-4 font-medium">Rank</th>
                    <th className="px-6 py-4 font-medium">Agent</th>
                    <th className="px-6 py-4 font-medium">Class</th>
                    <th className="px-6 py-4 text-right font-medium">
                      Max streak
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {topArchivists.map((agent) => (
                    <tr
                      key={agent.rank}
                      className="group transition-colors hover:bg-primary/10"
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-muted-foreground">
                          #{agent.rank.toString().padStart(2, "0")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-8 items-center justify-center rounded border border-border bg-muted/50 ring-1 ring-transparent transition-[box-shadow] group-hover:border-primary/35 group-hover:ring-primary/20">
                            <IconUser className="size-4 text-muted-foreground" />
                          </div>
                          <span className="text-sm font-bold">{agent.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs uppercase tracking-tighter text-muted-foreground">
                          {agent.class}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-black text-primary">
                          {agent.streak}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 rounded-xl border border-primary/25 bg-primary/8 p-4 ring-1 ring-primary/15 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="size-2 animate-pulse rounded-full bg-primary shadow-[0_0_8px_oklch(0.78_0.19_145_/_0.7)]" />
            <span className="text-xs font-bold uppercase tracking-widest text-foreground">
              Your current ranking: #1,402
            </span>
          </div>
          <Button
            type="button"
            variant="link"
            className="h-auto p-0 text-[10px] font-bold uppercase text-primary hover:text-primary/90 focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            Refresh vox-link
          </Button>
        </div>
      </div>
    </div>
  );
}
