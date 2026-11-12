import type { PoseLandmark } from "../../types/pose";
import { POSE_LANDMARK_NAMES } from "../../types/pose";

export interface ProcessedLandmarks {
  byIndex: Record<number, PoseLandmark>;
  byName: Record<string, PoseLandmark | null>;
  averageVisibility: number;
  visibilityMap: Record<string, number>;
}

export interface VisibilityCheck {
  allVisible: boolean;
  missing: string[];
  lowVisibility: string[];
  averageVisibility: number;
}

export class LandmarkProcessor {
  static process(
    landmarks: Array<{ x: number; y: number; z: number; visibility: number; presence: number }>
  ): ProcessedLandmarks {
    const byIndex: Record<number, PoseLandmark> = {};
    const byName: Record<string, PoseLandmark | null> = {};
    let visibilitySum = 0;
    let count = 0;

    for (let i = 0; i < landmarks.length; i++) {
      const lm = landmarks[i];
      const landmark: PoseLandmark = {
        x: lm.x,
        y: lm.y,
        z: lm.z,
        visibility: lm.visibility,
        presence: lm.presence,
      };
      byIndex[i] = landmark;

      const name = POSE_LANDMARK_NAMES[i];
      if (name) {
        byName[name] = landmark;
      }

      visibilitySum += lm.visibility;
      count++;
    }

    return {
      byIndex,
      byName,
      averageVisibility: count > 0 ? visibilitySum / count : 0,
      visibilityMap: Object.fromEntries(
        Object.entries(byName).map(([name, lm]) => [name, lm?.visibility ?? 0])
      ),
    };
  }

  static checkVisibility(
    processed: ProcessedLandmarks,
    required: string[],
    threshold: number = 0.5
  ): VisibilityCheck {
    const missing: string[] = [];
    const lowVisibility: string[] = [];

    for (const name of required) {
      const lm = processed.byName[name];
      if (!lm) {
        missing.push(name);
        continue;
      }
      if (lm.visibility < threshold) {
        lowVisibility.push(name);
      }
    }

    return {
      allVisible: missing.length === 0 && lowVisibility.length === 0,
      missing,
      lowVisibility,
      averageVisibility: processed.averageVisibility,
    };
  }

  static getLandmark(
    processed: ProcessedLandmarks,
    name: string
  ): PoseLandmark | null {
    return processed.byName[name] ?? null;
  }
}
