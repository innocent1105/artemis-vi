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
