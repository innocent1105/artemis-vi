import type { AssessmentRecord } from "../../types/assessment";

interface ScoreTrendProps {
  records: AssessmentRecord[];
}

export function ScoreTrend({ records }: ScoreTrendProps) {
  const recent = records.slice(0, 8).reverse();
  if (recent.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-[#0d1b2b] p-6">
        <p className="text-xs text-slate-500 text-center">No assessment history yet</p>
      </div>
    );
  }

  const scores = recent.map((r) => r.score ?? 0);
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const range = max - min || 1;

  const avg = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
  const latest = scores[scores.length - 1];
  const first = scores[0];
  const trend = latest >= first ? "up" : latest <= first ? "down" : "neutral";

  return (
    <div className="rounded-xl border border-white/10 bg-[#0d1b2b] p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Score trend</p>
          <p className="mt-1 text-lg font-semibold text-white">{avg}</p>
        </div>
        <span className={`text-xs font-semibold ${trend === "up" ? "text-astra-green" : trend === "down" ? "text-astra-amber" : "text-astra-slate"}`}>
          {trend === "up" ? "Improving" : trend === "down" ? "Declining" : "Steady"}
        </span>
      </div>
      <div className="h-24 w-full flex items-end gap-1">
        {scores.map((s, i) => {
          const h = ((s - min) / range) * 100;
          return (
            <div
              key={i}
              className="flex-1 bg-white/5 rounded-t-sm transition"
              style={{ height: `${Math.max(20, h)}%` }}
              title={`${recent[i]?.name ?? "Assessment"}: ${s}`}
            />
          );
        })}
      </div>
      <div className="mt-3 flex justify-between text-xs text-slate-500">
        <span>{min}</span>
        <span className="text-center">max {max}</span>
        <span className="text-right">{recent.length} assessments</span>
      </div>
    </div>
  );
}
