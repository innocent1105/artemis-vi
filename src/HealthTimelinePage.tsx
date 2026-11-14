import { useEffect, useState } from "react";
import { Activity, ShieldCheck, Moon, Brain } from "lucide-react";
import type { HealthRecord, Alert } from "./types/health";

const ICON_BY_SOURCE: Record<string, React.ElementType> = {
  sleep: Moon,
  wellbeing: Brain,
  movement: Activity,
  symptom: ShieldCheck,
};

export function HealthTimelinePage() {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [highlightedIds, setHighlightedIds] = useState<string[]>([]);

  useEffect(() => {
    setRecords([]);
    setAlerts([]);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
      <div className="lg:col-span-4 space-y-4">
        <h2 className="text-lg font-semibold text-white">Active Alerts</h2>
        {alerts.map((alert) => (
          <div
            key={alert.id}
            onClick={() => setHighlightedIds(alert.contributingRecordIds)}
            className="cursor-pointer p-4 rounded-lg bg-slate-900 border-l-4 border-red-500"
          >
            <h3 className="font-bold text-white text-sm">{alert.title}</h3>
            <p className="text-xs text-slate-300">{alert.explanation}</p>
          </div>
        ))}
        {alerts.length === 0 && (
          <div className="p-4 rounded-lg bg-slate-900 text-center text-slate-500 text-xs">
            No active alerts
          </div>
        )}
      </div>
      <div className="lg:col-span-8 space-y-2">
        <h2 className="text-lg font-semibold text-white">Central Health Timeline</h2>
        {records.map((record) => {
          const Icon = ICON_BY_SOURCE[record.source] ?? Activity;
          return (
            <div
              key={record.id}
              className={`p-3 rounded-lg flex items-start gap-3 ${highlightedIds.includes(record.id) ? "bg-blue-900/40 border border-blue-500/50" : "bg-slate-900/50"}`}
            >
              <Icon size={16} className="text-astra-cyan shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-medium capitalize text-sm text-white">
                  {record.source} Session
                </span>
                <p className="text-xs text-slate-300">{record.reason ?? "No reason provided"}</p>
              </div>
            </div>
          );
        })}
        {records.length === 0 && (
          <div className="p-8 rounded-lg bg-slate-900/50 text-center text-slate-500 text-xs">
            No health records available
          </div>
        )}
      </div>
    </div>
  );
}
