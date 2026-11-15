export type AssessmentType =
  | "full_body"
  | "squat"
  | "shoulder_mobility"
  | "balance"
  | "posture";

export interface AssessmentProtocol {
  id: AssessmentType;
  name: string;
  description: string;
  duration: string;
  healthIndicators: string[];
  steps: AssessmentStep[];
  illustration: string;
  requiredLandmarks: number[];
  minVisibility: number;
}

export interface AssessmentStep {
  id: string;
  instruction: string;
  phase: string;
  expectedDuration?: number;
  requiredLandmarks?: number[];
}

export interface AssessmentSession {
  id: string;
  type: AssessmentType;
  startedAt: number;
  completedAt?: number;
  duration?: number;
  metrics: AssessmentMetrics;
  score: number | null;
  findings: string[];
  recommendations: string[];
  status: "in_progress" | "completed" | "cancelled";
  frames: FrameSnapshot[];
}

export interface FrameSnapshot {
  timestamp: number;
  landmarks: { x: number; y: number; z: number; visibility: number }[];
  angles: Record<string, number | null>;
}

export interface AssessmentMetrics {
  repetitionCount?: number;
  averageKneeFlexion?: number;
  averageHipFlexion?: number;
  squatDepth?: number;
  leftRightSymmetry?: number;
  movementDuration?: number;
  repetitionConsistency?: number;
  maxShoulderElevation?: number;
  shoulderRangeDifference?: number;
  shoulderMovementConsistency?: number;
  shoulderCompletionRate?: number;
  trunkSway?: number;
  hipDisplacement?: number;
  balanceDuration?: number;
  balanceLeftRightDifference?: number;
  shoulderAlignment?: number;
  hipAlignment?: number;
  trunkInclination?: number;
  postureLeftRightAsymmetry?: number;
  detectionQuality?: number;
}

export interface AssessmentRecord {
  id: string;
  type: AssessmentType;
  name: string;
  date: number;
  duration: number;
  metrics: AssessmentMetrics;
  score: number;
  findings: string[];
  recommendations: string[];
  status: "completed";
}

export interface AssessmentComparison {
  recordA: AssessmentRecord;
  recordB: AssessmentRecord;
  metricDiffs: Record<string, { a: number | null; b: number | null; diff: number | null }>;
  scoreDiff: number;
}
