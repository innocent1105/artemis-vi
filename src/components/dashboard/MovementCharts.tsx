import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

interface MovementChartsProps {
  angles: Array<{ time: number; leftKnee: number; rightKnee: number }>;
}

export function MovementCharts({ angles }: MovementChartsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="rounded-xl border border-astra-border/50 bg-black/40 p-5">
        <h3 className="text-xs font-mono text-astra-slate uppercase mb-4">Joint Angle Progression</h3>
        <div className="h-48 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={angles}>
              <CartesianGrid strokeDasharray="3 3" stroke="white/5" />
              <XAxis dataKey="time" stroke="white/5" tickFormatter={(v) => `${v}s`} />
              <YAxis stroke="white/5" />
              <Tooltip />
              <Line type="monotone" dataKey="leftKnee" stroke="#22d3ee" name="Left Knee" dot={false} />
              <Line type="monotone" dataKey="rightKnee" stroke="#14b8a6" name="Right Knee" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rounded-xl border border-astra-border/50 bg-black/40 p-5">
        <h3 className="text-xs font-mono text-astra-slate uppercase mb-4">Repetition Consistency</h3>
        <div className="h-48 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={angles}>
              <CartesianGrid strokeDasharray="3 3" stroke="white/5" />
              <XAxis dataKey="time" stroke="white/5" />
              <YAxis stroke="white/5" />
              <Tooltip />
              <Bar dataKey="leftKnee" fill="#22d3ee" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
