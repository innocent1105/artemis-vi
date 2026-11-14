import type { AstronautProfile } from "../../types/health";
import { UserRound } from "lucide-react";

interface AstronautProfileProps {
  profile: AstronautProfile;
}

export function AstronautProfile({ profile }: AstronautProfileProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#0d1b2b] p-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/20 bg-gradient-to-br from-cyan-300/20 to-blue-500/10 text-cyan-200">
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full rounded-2xl object-cover" />
          ) : (
            <UserRound size={30} />
          )}
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">{profile.name}</h2>
          <p className="mt-1 text-xs text-slate-400">
            Crew ID {profile.crewId} · {profile.missionRole} · {profile.isSampleData ? "Fictional demo record" : ""}
          </p>
        </div>
        <span className="ml-auto rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-xs text-emerald-200">
          {profile.missionStatus}{profile.isSampleData ? " · demo" : ""}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Mission</p>
          <p className="mt-1 text-xs font-medium text-slate-200">{profile.missionName}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Role</p>
          <p className="mt-1 text-xs font-medium text-slate-200">{profile.missionRole}</p>
        </div>
      </div>
    </section>
  );
}
