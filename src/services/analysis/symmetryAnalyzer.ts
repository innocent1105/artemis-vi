import type { PoseLandmark } from "../../types/pose";

export interface SymmetryResult {
  leftRightDifference: number | null;
  symmetryScore: number | null;
  valid: boolean;
}

export function compareLeftRight(
  left: number | null,
  right: number | null,
  maxExpected: number = 180
): SymmetryResult {
  if (left === null || right === null) {
    return { leftRightDifference: null, symmetryScore: null, valid: false };
  }

  const diff = Math.abs(left - right);
  const symmetryScore = Math.max(0, 100 - (diff / maxExpected) * 100);

  return {
    leftRightDifference: diff,
    symmetryScore,
    valid: true,
  };
}

export function compareLandmarkPosition(
  left: PoseLandmark | null,
  right: PoseLandmark | null,
  axis: "x" | "y" | "z"
): { difference: number | null; valid: boolean } {
  if (!left || !right) return { difference: null, valid: false };
  return { difference: Math.abs(left[axis] - right[axis]), valid: true };
}

export function computeAverageSymmetry(results: SymmetryResult[]): { score: number; valid: boolean } {
  const valid = results.filter((r) => r.valid);
  if (valid.length === 0) return { score: 0, valid: false };
  const score = valid.reduce((sum, r) => sum + (r.symmetryScore ?? 0), 0) / valid.length;
  return { score, valid: true };
}
