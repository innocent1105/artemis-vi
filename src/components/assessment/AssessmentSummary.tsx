export interface AssessmentSummaryProps {
  stage: "analyzing" | "evaluating" | "comparing" | "generating" | "complete";
  progress: number;
}

const STAGES: Record<string, string> = {
  analyzing: "Analyzing movement patterns...",
  evaluating: "Evaluating joint angles...",
  comparing: "Comparing movement consistency...",
  generating: "Generating your assessment...",
  complete: "Assessment ready.",
};

export function AssessmentSummary({ stage, progress }: AssessmentSummaryProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8">
      <div className="relative w-24 h-24 mb-6">
        <svg className="w-full h-full animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#22d3ee" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="#22d3ee"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
      <p className="text-astra-slate text-sm">{STAGES[stage]}</p>
      <div className="w-64 mt-6 h-1 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-astra-cyan transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
