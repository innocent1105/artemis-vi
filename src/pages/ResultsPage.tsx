import { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { ResultsDashboard } from "../components/dashboard/ResultsDashboard";
import type { AssessmentRecord } from "../types/assessment";
import { assessmentRepository } from "../storage/assessmentRepository";

interface ResultsPageProps {
  recordId?: string;
}

export function ResultsPage({ recordId }: ResultsPageProps) {
  const [record, setRecord] = useState<AssessmentRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecord = async () => {
      if (!recordId) {
        setLoading(false);
        return;
      }
      const rec = await assessmentRepository.getById(recordId);
      setRecord(rec);
      setLoading(false);
    };
    loadRecord();
  }, [recordId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-astra-slate">
        <div className="animate-spin w-6 h-6 border-2 border-astra-cyan border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!record) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <ChevronLeft size={20} className="text-astra-slate mb-2" />
        <h3 className="text-white font-semibold mb-2">Assessment not found</h3>
      </div>
    );
  }

  return <ResultsDashboard record={record} onBack={() => {}} />;
}
