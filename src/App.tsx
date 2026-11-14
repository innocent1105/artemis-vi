import { useState, useEffect } from "react";
import { DashboardPage } from "./pages/DashboardPage";
import { EarthBackdrop } from "./components/layout/EarthBackdrop";
import {
  AiSymptomAssistant,
  type LoggedAssessment,
} from "./components/wellbeing/AiSymptomAssistant";

const STORAGE_KEY = "astra_mission_triage_logs";

export default function App() {
  const [missionTriageLogs, setMissionTriageLogs] = useState<LoggedAssessment[]>(
    () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
  );

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(missionTriageLogs));
    } catch {
      // Ignore storage quota errors
    }
  }, [missionTriageLogs]);

  const handleClearMissionLogs = () => {
    setMissionTriageLogs([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div className="relative min-h-[100svh] overflow-hidden bg-[#020617]">
      <EarthBackdrop />
      <div className="relative z-10 min-h-[100svh]">
        <DashboardPage missionTriageLogs={missionTriageLogs} />

        <div className="mt-6 max-w-7xl mx-auto px-4 pb-12 space-y-6">
          <AiSymptomAssistant />

          {/* Central Mission Triage Ledger (Persisted across sessions) */}
          {missionTriageLogs.length > 0 && (
            <div className="bg-slate-900/95 border border-slate-800 rounded-xl p-5 text-slate-100 shadow-xl max-w-4xl mx-auto">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                    Central Mission Triage Ledger ({missionTriageLogs.length})
                  </h4>
                  <p className="text-xs text-slate-400">
                    Synced autonomous decision-support logs queued for ground telemetry downlink
                  </p>
                </div>
                <button
                  onClick={handleClearMissionLogs}
                  className="text-xs text-rose-400 hover:text-rose-300 cursor-pointer"
                >
                  Purge Ledger
                </button>
              </div>

              <div className="space-y-2.5 max-h-60 overflow-y-auto">
                {missionTriageLogs.map((log) => (
                  <div
                    key={log.id}
                    className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 text-xs flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            log.severity === "CRITICAL"
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                              : log.severity === "CAUTION"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                              : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          }`}
                        >
                          {log.severity}
                        </span>
                        <span className="font-semibold text-slate-200">
                          {log.crewName}
                        </span>
                        <span className="text-indigo-400">• {log.category}</span>
                      </div>
                      <span className="text-slate-500">{log.timestamp}</span>
                    </div>
                    <p className="text-slate-400 leading-relaxed">{log.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}