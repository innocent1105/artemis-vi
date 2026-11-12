import { useState } from "react";
import { AssessmentSelector } from "../components/assessment/AssessmentSelector";
import { AssessmentRunner } from "../components/assessment/AssessmentRunner";
import { ResultsDashboard } from "../components/dashboard/ResultsDashboard";
import type { AssessmentRecord } from "../types/assessment";

export function AssessmentPage() {
  const [view, setView] = useState<"selector" | "assessment" | "results">("selector");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [record, setRecord] = useState<AssessmentRecord | null>(null);

  if (view === "results" && record) {
    return <ResultsDashboard record={record} onBack={() => { setView("selector"); setRecord(null); }} />;
  }

  if (view === "assessment" && selectedType) {
    return (
      <AssessmentRunner
        type={selectedType as any}
        onComplete={(rec) => { setRecord(rec); setView("results"); }}
        onExit={() => { setView("selector"); setSelectedType(null); }}
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-astra-navy p-8">
      <h2 className="text-2xl font-bold text-white mb-6">Guided Assessment</h2>
      <AssessmentSelector onStart={(type) => { setSelectedType(type); setView("assessment"); }} />
    </div>
  );
}
