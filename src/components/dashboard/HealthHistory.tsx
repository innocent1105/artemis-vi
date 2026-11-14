import { useEffect, useState } from "react";
import type { ComponentType } from "react";
import { AlertTriangle, Check, CheckCircle2, Clock, Filter, Info, Search } from "lucide-react";
import { assessmentRepository } from "../../storage/assessmentRepository";
import type { AlertItem } from "../../types/health";
import type { AssessmentRecord, AssessmentType } from "../../types/assessment";
import { ResultsDashboard } from "./ResultsDashboard";

type FilterType = AssessmentType | "all";
type SortOrder = "newest" | "oldest";

interface HealthHistoryProps {
  alerts: AlertItem[];
  onAcknowledgeAlert: (id: number) => void;
}

const SEVERITY_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; Icon: ComponentType<{ size?: number; className?: string }> }> = {
  critical: {
    label: "Critical",
    color: "text-rose-300",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    Icon: AlertTriangle,
  },
  attention: {
    label: "Attention",
    color: "text-amber-300",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    Icon: AlertTriangle,
  },
  info: {
    label: "Information",
    color: "text-cyan-300",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    Icon: Info,
  },
};

const ASSESSMENT_TYPE_LABELS: Record<AssessmentType, string> = {
  full_body: "Full Body",
  squat: "Squat",
  shoulder_mobility: "Shoulder Mobility",
  balance: "Balance",
  posture: "Posture",
};

function scoreColor(score: number | null): string {
  if (score === null) return "text-astra-slate";
  if (score >= 85) return "text-astra-green";
  if (score >= 70) return "text-astra-cyan";
  if (score >= 55) return "text-astra-amber";
  return "text-astra-red";
}

export function HealthHistory({ alerts, onAcknowledgeAlert }: HealthHistoryProps) {
  const [records, setRecords] = useState<AssessmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [selectedRecord, setSelectedRecord] = useState<AssessmentRecord | null>(null);

  useEffect(() => {
    let mounted = true;
    assessmentRepository
      .getAll()
      .then((data) => {
        if (mounted) {
          setRecords(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to load assessment history.");
          setLoading(false);
        }
      });
    return () => { mounted = false; };
  }, []);

  const filteredRecords = records
    .filter((r) => filterType === "all" || r.type === filterType)
    .filter((r) => r.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => (sortOrder === "newest" ? b.date - a.date : a.date - b.date));

  if (selectedRecord) {
    return (
      <div className="min-h-[600px] flex flex-col">
        <ResultsDashboard record={selectedRecord} onBack={() => setSelectedRecord(null)} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500">
        <div className="animate-spin w-6 h-6 border-2 border-astra-cyan border-t-transparent rounded-full mb-2" />
        <span>Loading assessment history...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 text-slate-500">
          <Clock size={24} />
        </div>
        <h3 className="text-white font-semibold mb-2">Failed to load history</h3>
        <p className="text-slate-500 text-sm mb-4">{error}</p>
          <button
            onClick={() => {
              setLoading(true);
              setError(null);
              assessmentRepository
                .getAll()
                .then((data) => { setRecords(data); setLoading(false); })
                .catch((err) => { setError(err instanceof Error ? err.message : "Failed to load assessment history."); setLoading(false); });
            }}
            className="min-h-[2.75rem] min-w-[2.75rem] text-cyan-300 underline text-base active:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-astra-cyan"
          >
            Retry
          </button>
      </div>
    );
  }

  if (filteredRecords.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 text-slate-500">
          <Filter size={24} />
        </div>
        <h3 className="text-white font-semibold mb-2">No matching assessments</h3>
        <p className="text-slate-500 text-sm mb-4">
          Try adjusting the filter, search, or sort options.
        </p>
          <button
            onClick={() => {
              setFilterType("all");
              setSearchQuery("");
              setSortOrder("newest");
            }}
            className="min-h-[2.75rem] min-w-[2.75rem] text-cyan-300 underline text-base active:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-astra-cyan"
          >
            Clear all filters
          </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/10 bg-[#0d1b2b] p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-300">Health history</p>
            <h2 className="mt-1 text-lg font-semibold">Assessment records</h2>
          </div>
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-astra-slate" />
              <input
                type="text"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full min-h-[2.75rem] bg-white/5 border border-white/10 rounded-lg px-4 py-2 pl-10 text-base text-white focus:border-astra-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-astra-cyan transition"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as FilterType)}
              className="w-full min-h-[2.75rem] sm:w-64 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-base text-white focus:border-astra-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-astra-cyan transition"
            >
              <option value="all">All assessment types</option>
              {Object.entries(ASSESSMENT_TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortOrder)}
              className="w-full min-h-[2.75rem] sm:w-64 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-base text-white focus:border-astra-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-astra-cyan transition"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-astra-slate">{filteredRecords.length} matching assessment(s)</span>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#0d1b2b] p-5 sm:p-6">
        <div className="space-y-3">
          {filteredRecords.map((r) => (
            <div
              key={r.id}
              role="button"
              onClick={() => setSelectedRecord(r)}
              className="cursor-pointer rounded-lg border border-white/10 bg-white/[0.02] p-4 min-h-[2.75rem] active:border-astra-cyan/50 active:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-astra-cyan transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-astra-cyan/20 flex items-center justify-center text-astra-cyan text-xs font-bold">
                    {r.type.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">{r.name}</p>
                    <p className="text-[10px] text-slate-500">
                      {new Date(r.date).toLocaleDateString()} · {ASSESSMENT_TYPE_LABELS[r.type]}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${scoreColor(r.score)}`}>{r.score}</p>
                  <p className="text-[10px] text-slate-500">Completed</p>
                </div>
              </div>
              <p className="mt-2 text-[10px] text-slate-500">Movement performance estimate, not a clinical result</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#0d1b2b] p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-amber-200">Alert review</p>
            <h2 className="mt-1 text-lg font-semibold">Alerts & notifications</h2>
          </div>
          <span className="rounded-full bg-amber-300/10 px-2.5 py-1 text-[10px] font-semibold text-amber-200">
            {alerts.length} open
          </span>
        </div>
        <p className="text-[10px] text-slate-500 mb-4">The alerts below are demonstration items for interface review. They are not clinical alerts.</p>
        {alerts.length === 0 ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="mx-auto mb-2 text-emerald-300" size={24} />
            <p className="text-sm font-medium text-slate-200">All demonstration alerts reviewed</p>
            <p className="mt-1 text-xs text-slate-500">There are no remaining sample alerts.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => {
              const config = severity(alert.severity);
              const Icon = config.Icon;
              return (
                <div key={alert.id} className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-4">
                  <div className="flex items-start gap-3">
                    <span className={`mt-0.5 rounded-lg p-2 ${config.bg} ${config.color}`}>
                      <Icon size={15} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs font-semibold text-slate-200">{alert.title}</p>
                        <span className={`rounded px-1.5 py-0.5 text-[9px] uppercase tracking-wider ${config.bg} ${config.color}`}>
                          {config.label}
                        </span>
                        {alert.isSampleData && (
                          <span className="rounded px-1.5 py-0.5 text-[9px] uppercase tracking-wider border border-white/10 text-slate-500">Sample</span>
                        )}
                      </div>
                      <p className="mt-1.5 text-[11px] leading-5 text-slate-400">{alert.detail}</p>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <span className="text-[10px] text-slate-500">{alert.time}</span>
                        <button
                          onClick={() => onAcknowledgeAlert(alert.id)}
                          className="inline-flex items-center gap-1 min-h-[2.75rem] min-w-[2.75rem] text-[10px] font-semibold text-cyan-300 active:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-astra-cyan"
                        >
                          <Check size={12} /> Acknowledge
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );

  function severity(s: string) {
    return SEVERITY_CONFIG[s] ?? SEVERITY_CONFIG.info;
  }
}
