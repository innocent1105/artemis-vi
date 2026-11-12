export const MOVEMENT_THRESHOLDS = {
  squat: {
    standingKneeAngleMin: 160,
    descendingKneeAngleMax: 150,
    bottomKneeAngleMax: 110,
    ascendingKneeAngleMin: 140,
    hysteresis: 8,
    minRepDurationMs: 800,
    targetReps: 5,
    minVisibility: 0.5,
  },
  shoulder: {
    armDownElbowAngleMin: 150,
    armUpElbowAngleMax: 60,
    minHoldMs: 800,
    targetReps: 3,
    minVisibility: 0.5,
  },
  balance: {
    holdDurationMs: 10000,
    swayThreshold: 0.05,
    minVisibility: 0.5,
  },
  posture: {
    minVisibility: 0.5,
    assessmentDurationMs: 8000,
  },
} as const;

export const LANDMARK_VISIBILITY_THRESHOLD = 0.5;
export const POSE_CONFIDENCE_THRESHOLD = 0.5;
