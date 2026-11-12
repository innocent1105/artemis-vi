import { ChevronLeft, Clock, ArrowRight } from "lucide-react";
import type { AssessmentRecord } from "../../types/assessment";

interface ResultsDashboardProps {
  record: AssessmentRecord;
  onBack: () => void;
}

export function ResultsDashboard({ record, onBack }: ResultsDashboardProps) {
  const metrics = record.metrics;
  const score = record.score ?? 0;

  const getScoreColor = (s: number) => {
    if (s >= 85) return "text-astra-green";
    if (s >= 70) return "text-astra-cyan";
    if (s >= 55) return "text-astra-amber";
    return "text-astra-red";
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-6 border-b border-astra-border/50">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-astra-cyan hover:text-white transition"
          >
            <ChevronLeft size={18} /> Back to History
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded bg-astra-cyan/20 flex items-center justify-center text-astra-cyan text-xs font-bold">
                {record.type.charAt(0).toUpperCase()}
              </div>
              <h1 className="text-2xl font-bold text-white">{record.name}</h1>
            </div>
            <div className="flex items-center gap-4 text-xs text-astra-slate mb-1">
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {((record.duration || 0) / 1000).toFixed(0)}s
              </span>
              <span className="w-px h-3 bg-white/20" />
              <span>{new Date(record.date).toLocaleString()}</span>
            </div>
          </div>

          {/* Overall Score */}
          <div className="rounded-2xl border border-astra-border/50 bg-black/40 p-8 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
              <div>
                <p className="text-xs font-mono text-astra-slate uppercase tracking-wider">Movement Performance Score</p>
                <p className="text-4xl font-bold text-white mb-1">{score}</p>
                <p className={`text-xs font-mono ${getScoreColor(score)}`}>
                  {scoreLabel(score)} — Movement performance estimate, not a medical score
                </p>
              </div>
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="64"
                    stroke="white/10"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="64"
                    stroke={getScoreColor(score)}
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`402 ${Math.max(0, 402 - (score / 100) * 402)}`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-white">{score}</span>
                  <span className="text-xs text-astra-slate">/ 100</span>
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <MetricCard title="Valid Repetitions" value={metrics.repetitionCount ?? "—"} />
            <MetricCard title="Movement Consistency" value={metrics.repetitionConsistency ?? "—"} subtitle="%" />
            <MetricCard title="Left-Right Symmetry" value={metrics.leftRightSymmetry != null ? Math.round(metrics.leftRightSymmetry) : "—"} subtitle="%" />
            <MetricCard title="Detection Quality" value={metrics.detectionQuality != null ? Math.round(metrics.detectionQuality) : "—"} subtitle="%" />
          </div>

          {/* Findings */}
          <div className="rounded-xl border border-astra-border/50 bg-black/40 p-6 mb-8">
            <h3 className="text-xs font-mono text-astra-slate uppercase mb-4">Assessment Findings</h3>
            <ul className="space-y-3">
              {record.findings.map((f, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-white">
                  <span className="flex shrink-0 mt-1 w-1.5 h-1.5 rounded-full bg-astra-cyan" />
                  <p>{f}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommendations */}
          <div className="rounded-xl border border-astra-amber/30 bg-amber/5 p-6 mb-8">
            <h3 className="text-xs font-mono text-astra-amber uppercase mb-4 flex items-center gap-2">
              <ArrowRight size={14} /> Recommendations
            </h3>
            <ul className="space-y-3 text-sm text-white">
              {record.recommendations.map((r, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex shrink-0 mt-1 w-1.5 h-1.5 rounded-full bg-astra-amber" />
                  <p>{r}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-xs text-astra-slate/60 text-center mt-8">
            This score is a movement performance estimate based on pose estimation. It is not a clinical or medical diagnosis.
          </div>
        </div>
      </div>
    </div>
  );
}

function scoreLabel(score: number): string {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 55) return "Fair";
  if (score >= 40) return "Needs Improvement";
  return "Poor";
}

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
}

function MetricCard({ title, value, subtitle }: MetricCardProps) {
  return (
    <div className="rounded-xl border border-astra-border/50 bg-black/40 p-4">
      <div className="text-xs font-mono text-astra-slate uppercase tracking-wider mb-1">{title}</div>
      <div className="text-xl font-bold text-white">{value}</div>
      {subtitle && <div className="text-xs text-astra-slate mt-1">{subtitle}</div>}
    </div>
  );
}
