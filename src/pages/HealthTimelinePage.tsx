import { useEffect, useState } from "react";
import { Activity, Moon, Brain, ShieldCheck, AlertTriangle } from "lucide-react";
import { evaluateAll, getAlerts } from "../engine/evaluate";
import type { HealthRecord, Alert } from "../types/health";

export function HealthTimelinePage() {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [highlightedIds, setHighlightedIds] = useState<string[]>([]);

  useEffect(() => {
    // 1. Load records from localStorage
    const rawRecords = JSON.parse(localStorage.getItem("astra.records") || "[]");
    setRecords(rawRecords.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));

    // 2. Run the engine on the loaded records
    evaluateAll(rawRecords, "astro-1");
    
    // 3. Load the generated alerts
    setAlerts(getAlerts());
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 max-w-7xl mx-auto">
      
      {/* LEFT COLUMN: ALERTS */}
      <div className="lg:col-span-4 space-y-4">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <AlertTriangle className="text-amber-500" /> Active Alerts
        </h2>
        
        {alerts.length === 0 && <p className="text-slate-500 text-sm">No alerts fired. Data is within baseline.</p>}
        
        {alerts.map(alert => (
          <div 
            key={alert.id} 
            onClick={() => setHighlightedIds(alert.contributingRecordIds || [])}
            className={`cursor-pointer p-4 rounded-lg border-l-4 transition-all ${
              alert.severity === 'urgent' ? 'bg-red-900/20 border-red-500 hover:bg-red-900/30' : 
              alert.severity === 'review' ? 'bg-amber-900/20 border-amber-500 hover:bg-amber-900/30' : 
              'bg-slate-800 border-slate-600'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-white text-sm">{alert.title}</h3>
              <span className="text-[10px] uppercase px-2 py-0.5 bg-slate-900 rounded">{alert.severity}</span>
            </div>
            <p className="text-xs text-slate-300 mb-3">{alert.explanation}</p>
            <span className="text-[10px] text-slate-500">Status: {alert.status}</span>
          </div>
        ))}
      </div>

      {/* RIGHT COLUMN: TIMELINE */}
      <div className="lg:col-span-8 space-y-4">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Activity className="text-blue-400" /> Central Health Timeline
        </h2>
        
        <div className="space-y-2">
          {records.map((record) => {
            const isHighlighted = highlightedIds.includes(record.id);
            return (
              <div 
                key={record.id} 
                className={`p-3 rounded-lg flex items-start gap-3 transition-all ${
                  isHighlighted ? 'bg-blue-900/40 border border-blue-500/50 shadow-lg shadow-blue-900/20' : 'bg-slate-800/50 border border-transparent'
                }`}
              >
                <div className={`p-1.5 rounded-full mt-1 ${isHighlighted ? 'bg-blue-800' : 'bg-slate-700'}`}>
                  {record.source === "sleep" && <Moon className="w-4 h-4 text-indigo-400" />}
                  {record.source === "wellbeing" && <Brain className="w-4 h-4 text-purple-400" />}
                  {record.source === "movement" && <Activity className="w-4 h-4 text-emerald-400" />}
                  {record.source === "symptom" && <ShieldCheck className="w-4 h-4 text-red-400" />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="font-medium capitalize text-sm text-white">{record.source} Session</span>
                    <span className="text-[10px] text-slate-400">{new Date(record.timestamp).toLocaleString()}</span>
                  </div>
                  
                  <p className="text-xs text-slate-300">
                    {record.source === "sleep" && `Duration: ${record.durationHours} hours`}
                    {record.source === "wellbeing" && `Stress: ${record.stress}/10 | Mood: ${record.mood}/10`}
                    {record.source === "movement" && `Mobility Score: ${record.metrics?.mobilityScore || "N/A"}`}
                    {record.source === "symptom" && `Severity: ${record.severity} | ${record.description}`}
                  </p>
                  
                  <div className="mt-1 text-[10px] text-slate-500 flex gap-3">
                    <span>Actor: {record.actorId || "astro-1"}</span>
                    {record.reason && <span>Reason: {record.reason}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}