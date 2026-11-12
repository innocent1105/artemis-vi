import type { PoseLandmark } from "../../types/pose";

export interface PostureMetrics {
  shoulderAlignment: number | null;
  hipAlignment: number | null;
  trunkInclination: number | null;
  leftRightAsymmetry: number | null;
}

export function analyzePosture(
  landmarks: Record<string, PoseLandmark | null>
): PostureMetrics {
  const leftShoulder = landmarks["leftShoulder"];
  const rightShoulder = landmarks["rightShoulder"];
  const leftHip = landmarks["leftHip"];
  const rightHip = landmarks["rightHip"];

  let shoulderAlignment: number | null = null;
  if (leftShoulder && rightShoulder) {
    shoulderAlignment = Math.abs(leftShoulder.y - rightShoulder.y) * 100;
  }

  let hipAlignment: number | null = null;
  if (leftHip && rightHip) {
    hipAlignment = Math.abs(leftHip.y - rightHip.y) * 100;
  }

  let trunkInclination: number | null = null;
  const shoulder = leftShoulder ?? rightShoulder;
  const hip = leftHip ?? rightHip;
  if (shoulder && hip) {
    const dx = hip.x - shoulder.x;
    const dy = hip.y - shoulder.y;
    trunkInclination = Math.abs(Math.atan2(dx, -dy) * (180 / Math.PI));
  }

  let leftRightAsymmetry: number | null = null;
  if (shoulderAlignment !== null && hipAlignment !== null) {
    leftRightAsymmetry = (shoulderAlignment + hipAlignment) / 2;
  }

  return { shoulderAlignment, hipAlignment, trunkInclination, leftRightAsymmetry };
}
