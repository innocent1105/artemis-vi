import { AlertTriangle, CheckCircle2, ChevronRight, Info } from "lucide-react";
import type { AlertItem } from "../../types/health";

interface AlertQueueProps {
  alerts: AlertItem[];
  onAlertSelect: (alert: AlertItem) => void;
}

const SEVERITY_CONFIG: Record<string, { color: string; bg: string; Icon: typeof AlertTriangle }> = {
  critical: { color: "text-rose-200", bg: "bg-rose-500/10", Icon: AlertTriangle },
  attention: { color: "text-amber-200", bg: "bg-amber-300/10", Icon: AlertTriangle },
  info: { color: "text-cyan-200", bg: "bg-cyan-300/10", Icon: Info },
};

export function AlertQueue({ alerts, onAlertSelect }: AlertQueueProps) {
  const reviewable = alerts.filter((a) => a.status === "new" || a.status === "acknowledged" || a.status === "under_review");

  if (reviewable.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-[#0d1b2b] p-6 text-center">
        <CheckCircle2 className="mx-auto mb-2 text-emerald-300" size={24} />
        <p className="text-sm font-medium text-slate-200">All alerts reviewed</p>
        <p className="mt-1 text-xs text-slate-500">There are no alerts awaiting review.</p>
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-[#0d1b2b] p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-amber-200">Alert queue</p>
          <h2 className="mt-1 text-lg font-semibold text-white">Alerts to review</h2>
        </div>
        <span className="rounded-full bg-amber-300/10 px-2.5 py-1 text-[10px] font-semibold text-amber-200">
          {reviewable.length} open
        </span>
      </div>
      <div className="space-y-3">
        {reviewable.map((alert) => {
          const config = SEVERITY_CONFIG[alert.severity] ?? SEVERITY_CONFIG.info;
          return (
            <button
              key={alert.id}
              onClick={() => onAlertSelect(alert)}
              aria-label={`Review alert: ${alert.title}`}
              className="flex items-start gap-3 rounded-xl border border-white/[0.08] bg-white/[0.025] p-4 min-h-[2.75rem] active:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-astra-cyan transition"
            >
              <span className={`mt-0.5 rounded-lg p-2 ${config.bg} ${config.color}`}>
                <config.Icon size={15} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs font-semibold text-slate-200">{alert.title}</p>
                  <span className={`rounded px-1.5 py-0.5 text-[9px] uppercase tracking-wider ${config.bg} ${config.color}`}>
                    {alert.status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </span>
                  {alert.isSampleData && (
                    <span className="rounded px-1.5 py-0.5 text-[9px] uppercase tracking-wider border border-white/10 text-slate-500">Sample</span>
                  )}
                </div>
                <p className="mt-1.5 text-[11px] leading-5 text-slate-400">{alert.detail}</p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-[10px] text-slate-500">{alert.time}</span>
                  <ChevronRight size={14} className="text-astra-slate shrink-0" aria-hidden="true" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
