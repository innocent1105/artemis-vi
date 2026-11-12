interface DetectionStatusProps {
  status: {
    detected: boolean;
    confidence: number;
    visibility: number;
    missingLandmarks: string[];
  };
}

export function DetectionStatus({ status }: DetectionStatusProps) {
  const ok = status.detected && status.visibility >= 0.5;
  const color = ok ? "text-astra-green" : status.detected ? "text-astra-amber" : "text-astra-red";
  const dotColor = ok ? "bg-astra-green" : status.detected ? "bg-astra-amber" : "bg-astra-red";

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-astra-border/50 bg-black/40 backdrop-blur text-xs font-mono">
      <span className={`w-2 h-2 rounded-full ${dotColor} animate-pulse`} aria-hidden="true" />
      <span className={color}>{status.detected ? "POSE DETECTED" : "NO POSE"}</span>
      <span className="text-astra-slate">| {Math.round(status.visibility * 100)}% visibility</span>
      {status.missingLandmarks.length > 0 && (
        <span className="text-astra-amber">Missing: {status.missingLandmarks.join(", ")}</span>
      )}
    </div>
  );
}
