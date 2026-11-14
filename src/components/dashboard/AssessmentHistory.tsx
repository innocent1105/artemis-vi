import { useEffect, useState } from "react";
import { Clock, ChevronRight } from "lucide-react";
import { assessmentRepository } from "../../storage/assessmentRepository";
import type { AssessmentRecord } from "../../types/assessment";

interface AssessmentHistoryProps {
  onSelectRecord: (record: AssessmentRecord) => void;
}

export function AssessmentHistory({ onSelectRecord }: AssessmentHistoryProps) {
  const [records, setRecords] = useState<AssessmentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    assessmentRepository
      .getAll()
      .then((data) => {
        setRecords(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-astra-slate">
        <div className="animate-spin w-6 h-6 border-2 border-astra-cyan border-t-transparent rounded-full" />
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 text-astra-slate">
          <Clock size={24} />
        </div>
        <h3 className="text-white font-semibold mb-2">No assessments yet</h3>
        <p className="text-astra-slate text-sm max-w-xs">
          Complete an assessment to track your movement performance history.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Assessment History</h2>
            <p className="text-astra-slate text-sm">Track your movement performance over time.</p>
          </div>
          <div className="text-xs text-astra-slate">
            {records.length} total assessments
          </div>
        </div>

        <div className="rounded-xl border border-astra-border/50 bg-black/40 overflow-hidden">
          <div className="space-y-3 md:hidden">
            {records.map((r) => (
              <button
                key={r.id}
                onClick={() => onSelectRecord(r)}
                aria-label={`Assessment ${r.name}, ${new Date(r.date).toLocaleDateString()}, score ${r.score ?? "—"}`}
                className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-4 min-h-[2.75rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-astra-cyan active:bg-white/[0.05] transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-astra-cyan/20 flex items-center justify-center text-astra-cyan text-xs font-bold">
                      {r.type.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{r.name}</p>
                      <p className="text-[10px] text-slate-500">
                        {new Date(r.date).toLocaleDateString()} · {r.type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${scoreColor(r.score)}`}>{r.score}</p>
                    <p className="text-[10px] text-slate-500">Completed</p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2 text-xs text-astra-slate mt-2 border-t border-white/10 pt-2">
                  <div>
                    <p className="text-slate-400">Reps</p>
                    <p className="text-white">{r.metrics.repetitionCount ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Duration</p>
                    <p className="text-white text-right">{((r.duration || 0) / 1000).toFixed(0)}s</p>
                  </div>
                  <div className="col-span-2 text-right">
                    <p className="text-slate-400">Time</p>
                    <p className="text-white text-right">
                      {new Date(r.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
                <ChevronRight size={14} className="ml-auto mt-2 text-astra-slate shrink-0" aria-hidden="true" />
              </button>
            ))}
          </div>

          <table className="hidden md:block">
            <thead>
              <tr className="border-b border-astra-border/50 bg-black/60">
                <th className="px-4 py-3 text-xs font-mono text-astra-slate uppercase">Date</th>
                <th className="px-4 py-3 text-xs font-mono text-astra-slate uppercase">Type</th>
                <th className="px-4 py-3 text-xs font-mono text-astra-slate uppercase">Score</th>
                <th className="px-4 py-3 text-xs font-mono text-astra-slate uppercase">Reps</th>
                <th className="px-4 py-3 text-xs font-mono text-astra-slate uppercase text-right">Duration</th>
                <th className="px-4 py-3 text-xs font-mono text-astra-slate uppercase">Status</th>
                <th className="px-4 py-3 text-right" />
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => onSelectRecord(r)}
                  className="cursor-pointer active:bg-white/5 transition border-b border-white/5"
                >
                  <td className="px-4 py-4 text-sm text-white">
                    {new Date(r.date).toLocaleDateString()}
                    <br />
                    <span className="text-xs text-astra-slate">
                      {new Date(r.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-white">
                    {r.name}
                    <br />
                    <span className="text-xs text-astra-slate capitalize">{r.type}</span>
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <span className={`font-mono font-bold ${scoreColor(r.score)}`}>
                      {r.score}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-white">
                    {r.metrics.repetitionCount ?? "—"}
                  </td>
                  <td className="px-4 py-4 text-sm text-right text-white">
                    {((r.duration || 0) / 1000).toFixed(0)}s
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <span className="text-xs font-mono text-astra-green">Completed</span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <ChevronRight size={14} className="text-astra-slate" aria-hidden="true" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function scoreColor(score: number | null): string {
  if (score === null) return "text-astra-slate";
  if (score >= 85) return "text-astra-green";
  if (score >= 70) return "text-astra-cyan";
  if (score >= 55) return "text-astra-amber";
  return "text-astra-red";
}
