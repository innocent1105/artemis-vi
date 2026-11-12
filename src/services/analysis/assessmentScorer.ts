import type { AssessmentMetrics } from "../../types/assessment";

export interface ScoreBreakdown {
  repetitionScore: number | null;
  consistencyScore: number | null;
  symmetryScore: number | null;
  depthScore: number | null;
  detectionQualityScore: number | null;
  weights: Record<string, number>;
}

export function scoreSquat(metrics: AssessmentMetrics): { score: number; breakdown: ScoreBreakdown } {
  const weights = { repetition: 0.25, consistency: 0.2, symmetry: 0.2, depth: 0.2, detection: 0.15 };

  let repetitionScore: number | null = null;
  if (metrics.repetitionCount !== null && metrics.repetitionCount !== undefined) {
    repetitionScore = Math.min(100, (metrics.repetitionCount / 5) * 100);
  }

  const consistencyScore = metrics.repetitionConsistency ?? null;
  const symmetryScore = metrics.leftRightSymmetry ?? null;

  let depthScore: number | null = null;
  if (metrics.squatDepth !== null && metrics.squatDepth !== undefined) {
    depthScore = Math.min(100, (metrics.squatDepth / 100) * 100);
  }

  const detectionQualityScore = metrics.detectionQuality ?? null;

  const components: Array<{ value: number | null; weight: number }> = [
    { value: repetitionScore, weight: weights.repetition },
    { value: consistencyScore, weight: weights.consistency },
    { value: symmetryScore, weight: weights.symmetry },
    { value: depthScore, weight: weights.depth },
    { value: detectionQualityScore, weight: weights.detection },
  ];

  const valid = components.filter((c) => c.value !== null);
  if (valid.length === 0) {
    return { score: 0, breakdown: { repetitionScore, consistencyScore, symmetryScore, depthScore, detectionQualityScore, weights } };
  }

  const totalWeight = valid.reduce((sum, c) => sum + c.weight, 0);
  const score = valid.reduce((sum, c) => sum + (c.value! * c.weight), 0) / totalWeight;

  return { score: Math.round(score * 10) / 10, breakdown: { repetitionScore, consistencyScore, symmetryScore, depthScore, detectionQualityScore, weights } };
}

export function scoreShoulderMobility(metrics: AssessmentMetrics): { score: number; breakdown: ScoreBreakdown } {
  const weights = { elevation: 0.3, consistency: 0.25, symmetry: 0.25, completion: 0.2 };

  let elevationScore: number | null = null;
  const elevation = metrics.maxShoulderElevation;
  if (elevation != null) {
    elevationScore = Math.min(100, (elevation / 180) * 100);
  }

  const consistencyScore = metrics.shoulderMovementConsistency ?? null;
  const shoulderRangeDiff = metrics.shoulderRangeDifference;
  const symmetryScore = shoulderRangeDiff != null
    ? Math.max(0, 100 - shoulderRangeDiff)
    : null;
  const completionScore = metrics.shoulderCompletionRate ?? null;

  const components: Array<{ value: number | null; weight: number }> = [
    { value: elevationScore, weight: weights.elevation },
    { value: consistencyScore, weight: weights.consistency },
    { value: symmetryScore, weight: weights.symmetry },
    { value: completionScore, weight: weights.completion },
  ];

  const valid = components.filter((c) => c.value !== null);
  if (valid.length === 0) {
    return { score: 0, breakdown: { repetitionScore: null, consistencyScore, symmetryScore, depthScore: null, detectionQualityScore: null, weights } as ScoreBreakdown };
  }

  const totalWeight = valid.reduce((sum, c) => sum + c.weight, 0);
  const score = valid.reduce((sum, c) => sum + (c.value! * c.weight), 0) / totalWeight;

  return { score: Math.round(score * 10) / 10, breakdown: { repetitionScore: null, consistencyScore, symmetryScore, depthScore: null, detectionQualityScore: null, weights } as ScoreBreakdown };
}

export function scoreBalance(metrics: AssessmentMetrics): { score: number; breakdown: ScoreBreakdown } {
  const weights = { duration: 0.4, sway: 0.3, symmetry: 0.3 };

  let durationScore: number | null = null;
  const duration = metrics.balanceDuration;
  if (duration != null) {
    durationScore = Math.min(100, (duration / 20) * 100);
  }

  let swayScore: number | null = null;
  const sway = metrics.trunkSway;
  if (sway != null) {
    swayScore = Math.max(0, 100 - sway * 1000);
  }

  const balanceDiff = metrics.balanceLeftRightDifference;
  const symmetryScore = balanceDiff != null
    ? Math.max(0, 100 - balanceDiff * 100)
    : null;

  const components: Array<{ value: number | null; weight: number }> = [
    { value: durationScore, weight: weights.duration },
    { value: swayScore, weight: weights.sway },
    { value: symmetryScore, weight: weights.symmetry },
  ];

  const valid = components.filter((c) => c.value !== null);
  if (valid.length === 0) {
    return { score: 0, breakdown: { repetitionScore: null, consistencyScore: null, symmetryScore: null, depthScore: null, detectionQualityScore: null, weights } as ScoreBreakdown };
  }

  const totalWeight = valid.reduce((sum, c) => sum + c.weight, 0);
  const score = valid.reduce((sum, c) => sum + (c.value! * c.weight), 0) / totalWeight;

  return { score: Math.round(score * 10) / 10, breakdown: { repetitionScore: null, consistencyScore: null, symmetryScore: null, depthScore: null, detectionQualityScore: null, weights } as ScoreBreakdown };
}

export function scorePosture(metrics: AssessmentMetrics): { score: number; breakdown: ScoreBreakdown } {
  const weights = { alignment: 0.4, trunk: 0.3, symmetry: 0.3 };

  let alignmentScore: number | null = null;
  if (metrics.shoulderAlignment != null && metrics.hipAlignment != null) {
    const avgMisalignment = (metrics.shoulderAlignment + metrics.hipAlignment) / 2;
    alignmentScore = Math.max(0, 100 - avgMisalignment * 200);
  }

  let trunkScore: number | null = null;
  if (metrics.trunkInclination != null) {
    trunkScore = Math.max(0, 100 - metrics.trunkInclination * 10);
  }

  const symmetryScore = metrics.postureLeftRightAsymmetry != null
    ? Math.max(0, 100 - metrics.postureLeftRightAsymmetry * 200)
    : null;

  const components: Array<{ value: number | null; weight: number }> = [
    { value: alignmentScore, weight: weights.alignment },
    { value: trunkScore, weight: weights.trunk },
    { value: symmetryScore, weight: weights.symmetry },
  ];

  const valid = components.filter((c) => c.value !== null);
  if (valid.length === 0) {
    return { score: 0, breakdown: { repetitionScore: null, consistencyScore: null, symmetryScore: null, depthScore: null, detectionQualityScore: null, weights } as ScoreBreakdown };
  }

  const totalWeight = valid.reduce((sum, c) => sum + c.weight, 0);
  const score = valid.reduce((sum, c) => sum + (c.value! * c.weight), 0) / totalWeight;

  return { score: Math.round(score * 10) / 10, breakdown: { repetitionScore: null, consistencyScore: null, symmetryScore: null, depthScore: null, detectionQualityScore: null, weights } as ScoreBreakdown };
}

export function scoreLabel(score: number): string {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 55) return "Fair";
  if (score >= 40) return "Needs Improvement";
  return "Poor";
}
