interface AssessmentProgressProps {
  step: number;
  totalSteps: number;
  phase: string;
}

export function AssessmentProgress({ step, totalSteps, phase }: AssessmentProgressProps) {
  const progress = totalSteps > 0 ? (step / totalSteps) * 100 : 0;
  return (
    <div className="w-full">
      <div className="flex justify-between text-[10px] font-mono text-astra-slate uppercase tracking-wider mb-1">
        <span>Step {step}</span>
        <span>{phase}</span>
        <span>{totalSteps}</span>
      </div>
      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-astra-cyan transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
