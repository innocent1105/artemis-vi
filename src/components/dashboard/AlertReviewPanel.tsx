import { Check, X, AlertTriangle, Info } from "lucide-react";
import type { AlertItem } from "../../types/health";

interface AlertReviewPanelProps {
  open: boolean;
  alert: AlertItem | null;
  onClose: () => void;
  onAcknowledge: (id: number) => void;
  onResolve: (id: number) => void;
}

const SEVERITY_CONFIG: Record<string, { color: string; bg: string; Icon: typeof AlertTriangle }> = {
  critical: { color: "text-rose-300", bg: "bg-rose-500/10", Icon: AlertTriangle },
  attention: { color: "text-amber-300", bg: "bg-amber-500/10", Icon: AlertTriangle },
  info: { color: "text-cyan-300", bg: "bg-cyan-500/10", Icon: Info },
};

export function AlertReviewPanel({
  open,
  alert,
  onClose,
  onAcknowledge,
  onResolve,
}: AlertReviewPanelProps) {
  if (!open || !alert) return null;

  const config = SEVERITY_CONFIG[alert.severity] ?? SEVERITY_CONFIG.info;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <button
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/60 md:hidden"
        aria-label="Close alert review"
      />
      {/* Panel */}
      <div
        className={`
          fixed left-0 right-0 z-50
          md:top-0 md:bottom-0 md:right-0 md:w-[420px]
          bottom-0
          transform transition-transform duration-300
          ${open ? "translate-y-0 md:translate-x-0" : "translate-y-full md:translate-x-full"}
          rounded-t-2xl md:rounded-none md:border-l border-white/10 bg-[#07111f] text-white shadow-2xl
        `}
        role="dialog"
        aria-modal="true"
        aria-label="Alert review"
      >
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between">
          <button onClick={onClose} className="rounded-md min-h-[2.75rem] min-w-[2.75rem] p-2 text-slate-400 active:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-astra-cyan" aria-label="Close alert review">
            <X size={18} />
          </button>
          <h2 className="text-sm font-semibold text-white">Alert review</h2>
          <span className="w-8" />
        </div>
        <div className="p-5 sm:p-6 overflow-y-auto max-h-[60svh] md:max-h-full">
          <div className="flex items-start gap-3 mb-5">
            <span className={`mt-0.5 shrink-0 rounded-lg p-2 ${config.bg} ${config.color}`}>
              <config.Icon size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <p className="text-xs font-semibold text-slate-200">{alert.title}</p>
                <span className={`rounded px-1.5 py-0.5 text-[9px] uppercase tracking-wider ${config.bg} ${config.color}`}>
                  {alert.status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </span>
                {alert.isSampleData && (
                  <span className="rounded px-1.5 py-0.5 text-[9px] uppercase tracking-wider border border-white/10 text-slate-500">Sample</span>
                )}
              </div>
              <p className="text-sm leading-6 text-slate-300">{alert.detail}</p>
              <p className="mt-2 text-[10px] text-slate-500">{alert.time}</p>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-white/10">
            <button
              onClick={() => onAcknowledge(alert.id)}
              disabled={alert.status === "acknowledged" || alert.status === "resolved"}
              className={`w-full min-h-[2.75rem] inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition ${
                alert.status === "acknowledged" || alert.status === "resolved"
                  ? "border-white/10 text-slate-500"
                  : "border-astra-cyan text-astra-cyan active:bg-astra-cyan/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-astra-cyan"
              }`}
            >
              <Check size={16} />
              Mark acknowledged
            </button>
            <button
              onClick={() => onResolve(alert.id)}
              disabled={alert.status === "resolved"}
              className={`w-full min-h-[2.75rem] inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition ${
                alert.status === "resolved"
                  ? "border-white/10 text-slate-500"
                  : "border-white/20 text-white active:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-astra-cyan"
              }`}
            >
              Mark resolved
            </button>
          </div>
        </div>
        <div className="pb-[env(safe-area-inset-bottom)]" />
      </div>
    </div>
  );
}
