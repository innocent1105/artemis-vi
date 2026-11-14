export type PoseLandmark = {
  x: number;
  y: number;
  z: number;
  visibility: number;
  presence: number;
};

export interface PoseLandmarks {
  [key: number]: PoseLandmark;
}

export interface PoseResult {
  landmarks: PoseLandmark[];
  worldLandmarks: PoseLandmark[];
  timestamp: number;
}

export interface FrameAnalysis {
  timestamp: number;
  landmarks: PoseLandmark[];
  visibility: number;
  angles: Record<string, number | null>;
}

export const POSE_LANDMARK_NAMES: Record<number, string> = {
  0: "nose",
  1: "left_eye_inner",
  2: "left_eye",
  3: "left_eye_outer",
  4: "right_eye_inner",
  5: "right_eye",
  6: "right_eye_outer",
  7: "left_ear",
  8: "right_ear",
  9: "mouth_left",
  10: "mouth_right",
  11: "left_shoulder",
  12: "right_shoulder",
  13: "left_elbow",
  14: "right_elbow",
  15: "left_wrist",
  16: "right_wrist",
  23: "left_hip",
  24: "right_hip",
  25: "left_knee",
  26: "right_knee",
  27: "left_ankle",
  28: "right_ankle",
};

export const KEY_POSE_LANDMARKS: Record<string, number> = {
  nose: 0,
  leftShoulder: 11,
  rightShoulder: 12,
  leftElbow: 13,
  rightElbow: 14,
  leftWrist: 15,
  rightWrist: 16,
  leftHip: 23,
  rightHip: 24,
  leftKnee: 25,
  rightKnee: 26,
  leftAnkle: 27,
  rightAnkle: 28,
};
