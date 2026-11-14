export interface HealthScore {
  value: number;
  max: number;
  label: string;
  isMedical: boolean;
}

export interface AssessmentFinding {
  id: string;
  text: string;
  severity: "info" | "attention" | "critical";
}

export interface AssessmentRecommendation {
  id: string;
  text: string;
  priority: "low" | "medium" | "high";
}

export interface LandmarkVisibility {
  landmark: string;
  visible: boolean;
  visibility: number;
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

export type HealthRecord = any;
export type Alert = any;
