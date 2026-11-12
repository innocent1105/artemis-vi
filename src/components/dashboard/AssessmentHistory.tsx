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
    <div className="flex-1 overflow-y-auto p-6">
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
          <table className="w-full text-left border-collapse">
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
                  className="cursor-pointer hover:bg-white/5 transition border-b border-white/5"
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
                    <ChevronRight size={14} className="text-astra-slate" />
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
