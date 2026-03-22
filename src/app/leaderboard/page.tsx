import {
  IconMedal,
  IconTarget,
  IconTrophy,
  IconUser,
} from "@/components/mission-icons";

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
        <h1 className="text-4xl font-black tracking-tighter text-primary">
          Vox archive rankings
        </h1>
        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          Top performing agents // Atoma prime sector
        </p>
      </div>

      <div className="grid gap-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {topArchivists.slice(0, 3).map((agent, i) => (
            <div
              key={agent.name}
              className={`rounded-xl border border-zinc-800 bg-zinc-950 p-6 text-center ${
                i === 0
                  ? "border-primary/50 shadow-[0_0_15px_rgba(74,222,128,0.12)]"
                  : ""
              }`}
            >
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
              <p className="mt-2 text-lg font-black tracking-tight">
                {agent.name}
              </p>
              <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-primary">
                {agent.streak} streak
              </div>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-4 border-b border-zinc-800 bg-zinc-900/50 px-6 py-4">
            <IconTarget className="size-5 text-primary" />
            <h2 className="text-xl font-semibold tracking-tight">
              Grand archivists
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-zinc-800 text-[10px] uppercase tracking-widest text-zinc-500">
                  <th className="px-6 py-4 font-medium">Rank</th>
                  <th className="px-6 py-4 font-medium">Agent</th>
                  <th className="px-6 py-4 font-medium">Class</th>
                  <th className="px-6 py-4 text-right font-medium">Max streak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {topArchivists.map((agent) => (
                  <tr
                    key={agent.rank}
                    className="group transition-colors hover:bg-primary/5"
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-zinc-500">
                        #{agent.rank.toString().padStart(2, "0")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded border border-zinc-800 bg-zinc-900 group-hover:border-primary/30">
                          <IconUser className="size-4 text-zinc-500" />
                        </div>
                        <span className="text-sm font-bold">{agent.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs uppercase tracking-tighter text-zinc-400">
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
        </div>

        <div className="flex flex-col gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="size-2 animate-pulse rounded-full bg-primary" />
            <span className="text-xs font-bold uppercase tracking-widest">
              Your current ranking: #1,402
            </span>
          </div>
          <button
            type="button"
            className="text-left text-[10px] font-bold uppercase text-primary hover:underline sm:text-right"
          >
            Refresh vox-link
          </button>
        </div>
      </div>
    </div>
  );
}
