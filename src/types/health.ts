export type EventSource = "movement" | "sleep" | "wellbeing" | "symptom" | "assistant";

export interface BaseRecord {
  id: string;
  astronautId: string;
  timestamp: string;
  source: EventSource;
  actorId: string;
  reason?: string;
}

export interface SleepSession extends BaseRecord {
  source: "sleep";
  startTime: string;
  endTime: string;
  durationHours: number;
}

export interface WellbeingCheckin extends BaseRecord {
  source: "wellbeing";
  stress: number;
  mood: number;
  fatigue: number;
}

export interface MovementSession extends BaseRecord {
  source: "movement";
  metrics: Record<string, number>;
}

export interface SymptomReport extends BaseRecord {
  source: "symptom";
  description: string;
  severity: "low" | "medium" | "high";
}

export type HealthRecord = SleepSession | WellbeingCheckin | MovementSession | SymptomReport;

export interface Alert {
  id: string;
  astronautId: string;
  ruleId: string;
  severity: "info" | "review" | "urgent";
  title: string;
  explanation: string;
  contributingRecordIds: string[];
  createdAt: string;
  status: "open" | "acknowledged" | "closed";
}

export interface DetectionStatus {
  detected: boolean;
  confidence: number;
  visibility: number;
  missingLandmarks: string[];
}

export interface AstronautProfile {
  id: string;
  name: string;
  crewId: string;
  missionName: string;
  missionRole: string;
  missionStatus: string;
  avatarUrl: string | null;
  isSampleData: boolean;
}

export interface AlertItem {
  id: number;
  title: string;
  detail: string;
  severity: "info" | "attention" | "critical";
  status: "new" | "acknowledged" | "under_review" | "resolved";
  time: string;
  isSampleData?: boolean;
}