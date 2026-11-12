import {
  FilesetResolver,
  PoseLandmarker,
} from "@mediapipe/tasks-vision";

export interface PoseLandmarkerServiceConfig {
  modelPath: string;
  numPoses?: number;
  minPoseDetectionConfidence?: number;
  minTrackingConfidence?: number;
  outputSegmentationMasks?: boolean;
  delegate?: "CPU" | "GPU";
}

export interface DetectionResult {
  landmarks: Array<{ x: number; y: number; z: number; visibility: number; presence: number }>;
  worldLandmarks: Array<{ x: number; y: number; z: number; visibility: number; presence: number }>;
  timestamp: number;
}

const DEFAULT_MODEL_PATH = "/models/pose_landmarker_heavy.task";

export class PoseLandmarkerService {
  private landmarker: PoseLandmarker | null = null;
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;
  private lastProcessedTime = 0;
  private readonly minFrameIntervalMs = 33;

  private readonly config: Required<PoseLandmarkerServiceConfig>;

  constructor(config: Partial<PoseLandmarkerServiceConfig> = {}) {
    this.config = {
      modelPath: DEFAULT_MODEL_PATH,
      numPoses: 1,
      minPoseDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
      outputSegmentationMasks: false,
      delegate: "CPU",
      ...config,
    };
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "/wasm"
        );

        this.landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: this.config.modelPath,
            delegate: this.config.delegate,
          },
          runningMode: "VIDEO",
          numPoses: this.config.numPoses,
          minPoseDetectionConfidence: this.config.minPoseDetectionConfidence,
          minTrackingConfidence: this.config.minTrackingConfidence,
          outputSegmentationMasks: this.config.outputSegmentationMasks,
        });

        this.isInitialized = true;
      } catch (error) {
        this.initPromise = null;
        throw new Error(
          `Failed to initialize MediaPipe Pose Landmarker: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    })();

    return this.initPromise;
  }

  detectForVideo(
    videoElement: HTMLVideoElement,
    timestampMs: number
  ): DetectionResult | null {
    if (!this.isInitialized || !this.landmarker) return null;

    const now = performance.now();
    if (now - this.lastProcessedTime < this.minFrameIntervalMs) {
      return null;
    }
    this.lastProcessedTime = now;

    try {
      const result = this.landmarker.detectForVideo(videoElement, timestampMs);
      if (!result || !result.landmarks || result.landmarks.length === 0) {
        return null;
      }

      const landmarks = result.landmarks[0].map((lm) => ({
        x: lm.x,
        y: lm.y,
        z: lm.z,
        visibility: lm.visibility ?? 0,
        presence: lm.presence ?? 0,
      }));

      const worldLandmarks = result.worldLandmarks?.[0]?.map((lm) => ({
        x: lm.x,
        y: lm.y,
        z: lm.z,
        visibility: lm.visibility ?? 0,
        presence: lm.presence ?? 0,
      })) || [];

      return {
        landmarks,
        worldLandmarks,
        timestamp: timestampMs,
      };
    } catch (error) {
      console.warn("Pose detection error:", error);
      return null;
    }
  }

  get isReady(): boolean {
    return this.isInitialized && this.landmarker !== null;
  }

  async close(): Promise<void> {
    if (this.landmarker) {
      this.landmarker.close();
      this.landmarker = null;
    }
    this.isInitialized = false;
    this.initPromise = null;
    this.lastProcessedTime = 0;
  }
}
