import type { PoseLandmark } from "../../types/pose";

export type JointName =
  | "leftKnee"
  | "rightKnee"
  | "leftHip"
  | "rightHip"
  | "leftElbow"
  | "rightElbow"
  | "leftShoulder"
  | "rightShoulder"
  | "trunk";

export interface AngleResult {
  joint: JointName;
  angle: number;
  valid: boolean;
}

interface Point { x: number; y: number; z: number; }

function toPoint(lm: PoseLandmark): Point {
  return { x: lm.x, y: lm.y, z: lm.z };
}

function subtract(a: Point, b: Point): Point {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function dot(a: Point, b: Point): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function magnitude(a: Point): number {
  return Math.sqrt(dot(a, a));
}

export function calculateAngle(a: PoseLandmark, b: PoseLandmark, c: PoseLandmark): number | null {
  if (!a || !b || !c) return null;

  const ba = subtract(toPoint(a), toPoint(b));
  const bc = subtract(toPoint(c), toPoint(b));

  const magBa = magnitude(ba);
  const magBc = magnitude(bc);

  if (magBa === 0 || magBc === 0) return null;

  const cosine = dot(ba, bc) / (magBa * magBc);
  const clamped = Math.max(-1, Math.min(1, cosine));
  return Math.acos(clamped) * (180 / Math.PI);
}

export function calculateJointAngle(
  landmarks: Record<string, PoseLandmark | null>,
  aName: string,
  bName: string,
  cName: string
): number | null {
  const a = landmarks[aName];
  const b = landmarks[bName];
  const c = landmarks[cName];
  if (!a || !b || !c) return null;
  return calculateAngle(a, b, c);
}

export function calculateTrunkInclination(
  landmarks: Record<string, PoseLandmark | null>
): number | null {
  const shoulder = landmarks["leftShoulder"] ?? landmarks["rightShoulder"];
  const hip = landmarks["leftHip"] ?? landmarks["rightHip"];
  if (!shoulder || !hip) return null;

  const dx = hip.x - shoulder.x;
  const dy = hip.y - shoulder.y;
  const angle = Math.atan2(dx, -dy) * (180 / Math.PI);
  return Math.abs(angle);
}

export function calculateAngles(
  landmarks: Record<string, PoseLandmark | null>
): Record<JointName, AngleResult> {
  const results: Record<JointName, AngleResult> = {
    leftKnee: { joint: "leftKnee", angle: 0, valid: false },
    rightKnee: { joint: "rightKnee", angle: 0, valid: false },
    leftHip: { joint: "leftHip", angle: 0, valid: false },
    rightHip: { joint: "rightHip", angle: 0, valid: false },
    leftElbow: { joint: "leftElbow", angle: 0, valid: false },
    rightElbow: { joint: "rightElbow", angle: 0, valid: false },
    leftShoulder: { joint: "leftShoulder", angle: 0, valid: false },
    rightShoulder: { joint: "rightShoulder", angle: 0, valid: false },
    trunk: { joint: "trunk", angle: 0, valid: false },
  };

  const lk = calculateJointAngle(landmarks, "leftHip", "leftKnee", "leftAnkle");
  if (lk !== null) results.leftKnee = { joint: "leftKnee", angle: lk, valid: true };

  const rk = calculateJointAngle(landmarks, "rightHip", "rightKnee", "rightAnkle");
  if (rk !== null) results.rightKnee = { joint: "rightKnee", angle: rk, valid: true };

  const lh = calculateJointAngle(landmarks, "leftShoulder", "leftHip", "leftKnee");
  if (lh !== null) results.leftHip = { joint: "leftHip", angle: lh, valid: true };

  const rh = calculateJointAngle(landmarks, "rightShoulder", "rightHip", "rightKnee");
  if (rh !== null) results.rightHip = { joint: "rightHip", angle: rh, valid: true };

  const le = calculateJointAngle(landmarks, "leftShoulder", "leftElbow", "leftWrist");
  if (le !== null) results.leftElbow = { joint: "leftElbow", angle: le, valid: true };

  const re = calculateJointAngle(landmarks, "rightShoulder", "rightElbow", "rightWrist");
  if (re !== null) results.rightElbow = { joint: "rightElbow", angle: re, valid: true };

  const ls = calculateJointAngle(landmarks, "leftElbow", "leftShoulder", "leftHip");
  if (ls !== null) results.leftShoulder = { joint: "leftShoulder", angle: ls, valid: true };

  const rs = calculateJointAngle(landmarks, "rightElbow", "rightShoulder", "rightHip");
  if (rs !== null) results.rightShoulder = { joint: "rightShoulder", angle: rs, valid: true };

  const trunk = calculateTrunkInclination(landmarks);
  if (trunk !== null) results.trunk = { joint: "trunk", angle: trunk, valid: true };

  return results;
}

export function smoothAngle(
  value: number | null,
  previous: number | null,
  alpha: number = 0.6
): number | null {
  if (value === null) return previous;
  if (previous === null) return value;
  return alpha * value + (1 - alpha) * previous;
}
