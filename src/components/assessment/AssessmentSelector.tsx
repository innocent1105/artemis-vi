import { useState } from "react";
import { Play, Timer, Users, Activity, BadgeCheck } from "lucide-react";
import type { AssessmentType } from "../../types/assessment";
import { getProtocol } from "../../data/assessmentProtocols";

const ICONS: Record<AssessmentType, React.ComponentType<{ className?: string }>> = {
  full_body: Activity,
  squat: BadgeCheck,
  shoulder_mobility: Users,
  balance: Activity,
  posture: Timer,
};

interface AssessmentSelectorProps {
  onStart: (type: AssessmentType) => void;
}

export function AssessmentSelector({ onStart }: AssessmentSelectorProps) {
  const [selected, setSelected] = useState<AssessmentType | null>(null);
  const types: AssessmentType[] = [
    "full_body",
    "squat",
    "shoulder_mobility",
    "balance",
    "posture",
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">ASTRA Motion Intelligence</h1>
              <p className="text-astra-slate mt-1">Astronaut movement and posture assessment system</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelected(null)}
                className={`px-4 py-2 min-h-[2.75rem] min-w-[2.75rem] rounded border text-sm font-medium transition ${
                  selected ? "bg-astra-cyan/10 border-astra-cyan text-astra-cyan active:bg-astra-cyan/20" : "border-astra-border/50 text-astra-slate active:bg-white/5"
                } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-astra-cyan`}
              >
                All Assessments
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {types.map((type) => {
              const protocol = getProtocol(type);
              const Icon = ICONS[type];
              const isSelected = selected === type;
              return (
                <div
                  key={type}
                  role="button"
                  onClick={() => setSelected(isSelected ? null : type)}
                  className={`group cursor-pointer rounded-xl border p-6 min-h-[2.75rem] transition-all ${
                    isSelected
                      ? "bg-astra-cyan/10 border-astra-cyan shadow-[0_0_20px_rgba(34,211,238,0.15)] active:bg-astra-cyan/20"
                      : "border-astra-border/50 bg-black/30 active:border-astra-cyan/50 active:bg-black/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-astra-cyan"
                  }`}
                >
                  <div className="w-12 h-12 rounded-lg bg-astra-navyLight flex items-center justify-center mb-4 group-hover:scale-110 transition">
                    <Icon className="w-6 h-6 text-astra-cyan" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{protocol.name}</h3>
                  <p className="text-astra-slate text-sm mb-4 line-clamp-2">{protocol.description}</p>
                  <div className="space-y-2 text-xs text-astra-slate mb-6">
                    <div className="flex items-center gap-1">
                      <Timer className="w-3 h-3" />
                      <span>{protocol.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BadgeCheck className="w-3 h-3" />
                      <span>{protocol.healthIndicators[0]}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelected(type);
                    }}
                    className="w-full min-h-[2.75rem] py-2 rounded border text-sm font-medium transition text-astra-slate border-astra-border/50 active:bg-white/5 active:border-astra-cyan active:text-astra-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-astra-cyan"
                  >
                    {isSelected ? "Deselect" : "Select"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
          <div role="dialog" aria-modal="true" aria-labelledby="assessment-dialog-title" className="bg-astra-navy rounded-2xl border border-astra-border w-full max-w-md p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-astra-cyan/10 flex items-center justify-center">
                <Play className="w-5 h-5 text-astra-cyan" />
              </div>
              <div>
                <h3 id="assessment-dialog-title" className="text-white font-semibold">Start Assessment</h3>
                <p className="text-astra-slate text-xs">{getProtocol(selected).name}</p>
              </div>
            </div>
            <p className="text-astra-slate text-sm mb-6">
              Prepare your camera and positioning before beginning. You will be guided through each movement step.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => onStart(selected!)}
                className="w-full min-h-[2.75rem] py-3 bg-astra-cyan text-astra-navy font-semibold rounded-lg active:bg-astra-cyan/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-astra-cyan transition"
              >
                Start Assessment
              </button>
              <button
                onClick={() => setSelected(null)}
                className="w-full min-h-[2.75rem] py-2 rounded border border-astra-border/50 text-astra-slate text-sm font-medium active:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-astra-cyan transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
