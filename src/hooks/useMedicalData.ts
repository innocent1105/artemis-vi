import { useCallback, useMemo, useState } from "react";
import type { AlertItem } from "../types/health";
import type { AssessmentRecord } from "../types/assessment";

const ASTRONAUTS: Array<{
  id: string;
  name: string;
  crewId: string;
  missionName: string;
  missionRole: string;
  missionStatus: string;
  avatarUrl: string | null;
  isSampleData: boolean;
}> = [
  {
    id: "ast-001",
    name: "Commander Maya Chen",
    crewId: "AST-0472",
    missionName: "AURORA-07",
    missionRole: "Expedition specialist",
    missionStatus: "Mission active",
    avatarUrl: null,
    isSampleData: true,
  },
  {
    id: "ast-002",
    name: "Flight Engineer Raj Patel",
    crewId: "AST-0489",
    missionName: "AURORA-07",
    missionRole: "Systems engineer",
    missionStatus: "Mission active",
    avatarUrl: null,
    isSampleData: true,
  },
  {
    id: "ast-003",
    name: "Pilot Elena Vasquez",
    crewId: "AST-0501",
    missionName: "ORION-12",
    missionRole: "Flight pilot",
    missionStatus: "Pre-flight",
    avatarUrl: null,
    isSampleData: true,
  },
];

const INITIAL_ALERTS: AlertItem[] = [
  {
    id: 1,
    title: "Movement assessment requires review",
    detail: "A sample shoulder-mobility result has been flagged for medical personnel review.",
    severity: "attention",
    status: "new",
    time: "12 min ago",
    isSampleData: true,
  },
  {
    id: 2,
    title: "Routine assessment reminder",
    detail: "A balance assessment is listed in the example mission schedule.",
    severity: "info",
    status: "new",
    time: "1 hr ago",
    isSampleData: true,
  },
  {
    id: 3,
    title: "Elevated stress indicator",
    detail: "Self-reported stress has been above baseline for three consecutive days.",
    severity: "critical",
    status: "under_review",
    time: "4 hr ago",
    isSampleData: true,
  },
];

export function useMedicalData() {
  const [astronauts] = useState(ASTRONAUTS);
  const [selectedAstronautId, setSelectedAstronautId] = useState<string | null>("ast-001");
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [records, setRecords] = useState<AssessmentRecord[]>([]);

  const selectedAstronaut = useMemo(
    () => astronauts.find((a) => a.id === selectedAstronautId) ?? null,
    [astronauts, selectedAstronautId],
  );

  const alertsToReview = useMemo(
    () => alerts.filter((a) => a.status === "new" || a.status === "acknowledged" || a.status === "under_review"),
    [alerts],
  );

  const assessmentsToday = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = today.getTime();
    today.setHours(23, 59, 59, 999);
    const end = today.getTime();
    return records.filter((r) => r.date >= start && r.date <= end).length;
  }, [records]);

  const acknowledgeAlert = useCallback((id: number) => {
    setAlerts((current) =>
      current.map((a) => (a.id === id ? { ...a, status: "acknowledged" as const } : a)),
    );
  }, []);

  const resolveAlert = useCallback((id: number) => {
    setAlerts((current) =>
      current.map((a) => (a.id === id ? { ...a, status: "resolved" as const } : a)),
    );
  }, []);

  const setAlertStatus = useCallback((id: number, status: AlertItem["status"]) => {
    setAlerts((current) => current.map((a) => (a.id === id ? { ...a, status } : a)));
  }, []);

  return {
    astronauts,
    selectedAstronaut,
    selectedAstronautId,
    setSelectedAstronautId,
    alerts,
    alertsToReview,
    acknowledgeAlert,
    resolveAlert,
    setAlertStatus,
    records,
    setRecords,
    assessmentsToday,
    totalAstronauts: astronauts.length,
  };
}
