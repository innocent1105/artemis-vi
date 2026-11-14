import { UserRound } from "lucide-react";
import type { AstronautProfile } from "../../types/health";

interface AstronautRosterProps {
  astronauts: AstronautProfile[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function AstronautRoster({ astronauts, selectedId, onSelect }: AstronautRosterProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#0d1b2b] p-5 sm:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-cyan-300">Crew roster</p>
          <h2 className="mt-1 text-lg font-semibold text-white">Select an astronaut</h2>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold text-white">
          {astronauts.length} crew
        </span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {astronauts.map((a) => {
          const active = selectedId === a.id;
          return (
            <button
              key={a.id}
              onClick={() => onSelect(a.id)}
              aria-label={`Select ${a.name}, ${a.missionRole}`}
              className={`flex flex-col gap-3 rounded-xl border p-4 min-h-[3rem] transition ${active ? "border-cyan-300/50 bg-cyan-300/[0.06]" : "border-white/10 bg-white/[0.02] active:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-astra-cyan"}`}
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/20 bg-gradient-to-br from-cyan-300/20 to-blue-500/10 text-cyan-200">
                {a.avatarUrl ? (
                  <img src={a.avatarUrl} alt={a.name} className="w-full h-full rounded-2xl object-cover" />
                ) : (
                  <UserRound size={28} />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{a.name}</p>
                <p className="text-[10px] text-slate-500">{a.crewId} · {a.missionRole}</p>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${active ? "text-cyan-950 bg-cyan-300" : "text-slate-500 bg-white/10"}`}>
                {a.missionStatus}{a.isSampleData ? " · demo" : ""}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
