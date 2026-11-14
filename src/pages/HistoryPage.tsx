import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { AssessmentHistory } from "../components/dashboard/AssessmentHistory";
import { ResultsDashboard } from "../components/dashboard/ResultsDashboard";
import type { AssessmentRecord } from "../types/assessment";

export function HistoryPage() {
  const [selectedRecord, setSelectedRecord] = useState<AssessmentRecord | null>(null);

  return (
    <div className="flex flex-col min-h-[100svh] bg-astra-navy">
      <header className="border-b border-astra-border/50 bg-black/50 p-6">
        <div className="max-w-6xl mx-auto flex items-center gap-2">
          <button
            onClick={() => setSelectedRecord(null)}
            className="flex items-center gap-1 min-h-[2.75rem] min-w-[2.75rem] text-astra-cyan active:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-astra-cyan transition"
            disabled={!selectedRecord}
          >
            <ChevronLeft size={18} /> Back
          </button>
          {selectedRecord && (
            <span className="text-xs font-mono text-astra-slate ml-4">{selectedRecord.name}</span>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 pb-[env(safe-area-inset-bottom)]">
        {selectedRecord ? (
          <ResultsDashboard record={selectedRecord} onBack={() => setSelectedRecord(null)} />
        ) : (
          <AssessmentHistory onSelectRecord={setSelectedRecord} />
        )}
      </div>
    </div>
  );
}
