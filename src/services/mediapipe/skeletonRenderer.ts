import type { PoseLandmark } from "../../types/pose";

const CONNECTIONS: [number, number][] = [
  [11, 13], [13, 15],
  [12, 14], [14, 16],
  [11, 12],
  [11, 23], [12, 24],
  [23, 24],
  [23, 25], [25, 27],
  [24, 26], [26, 28],
  [11, 7], [12, 8],
  [7, 9], [8, 10],
  [0, 7], [0, 8],
];

export interface RenderConfig {
  landmarkColor: string;
  connectionColor: string;
  landmarkRadius: number;
  lineWidth: number;
  lowVisibilityColor: string;
  visibilityThreshold: number;
}

const DEFAULT_CONFIG: RenderConfig = {
  landmarkColor: "#22d3ee",
  connectionColor: "rgba(34, 211, 238, 0.5)",
  landmarkRadius: 4,
  lineWidth: 2,
  lowVisibilityColor: "rgba(34, 211, 238, 0.2)",
  visibilityThreshold: 0.5,
};

export class SkeletonRenderer {
  private ctx: CanvasRenderingContext2D;
  private config: RenderConfig;

  constructor(canvas: HTMLCanvasElement, config: Partial<RenderConfig> = {}) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context not available");
    this.ctx = ctx;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  resize(width: number, height: number): void {
    this.ctx.canvas.width = width;
    this.ctx.canvas.height = height;
  }

  clear(): void {
    const { width, height } = this.ctx.canvas;
    this.ctx.clearRect(0, 0, width, height);
  }

  render(landmarks: PoseLandmark[], videoWidth: number, videoHeight: number): void {
    this.clear();

    const scaleX = this.ctx.canvas.width / videoWidth;
    const scaleY = this.ctx.canvas.height / videoHeight;

    for (const [a, b] of CONNECTIONS) {
      const lmA = landmarks[a];
      const lmB = landmarks[b];
      if (!lmA || !lmB) continue;

      const visible =
        lmA.visibility >= this.config.visibilityThreshold &&
        lmB.visibility >= this.config.visibilityThreshold;

      this.ctx.beginPath();
      this.ctx.moveTo(lmA.x * scaleX, lmA.y * scaleY);
      this.ctx.lineTo(lmB.x * scaleX, lmB.y * scaleY);
      this.ctx.strokeStyle = visible
        ? this.config.connectionColor
        : this.config.lowVisibilityColor;
      this.ctx.lineWidth = this.config.lineWidth;
      this.ctx.stroke();
    }

    for (const lm of landmarks) {
      const visible = lm.visibility >= this.config.visibilityThreshold;
      this.ctx.beginPath();
      this.ctx.arc(lm.x * scaleX, lm.y * scaleY, this.config.landmarkRadius, 0, Math.PI * 2);
      this.ctx.fillStyle = visible ? this.config.landmarkColor : this.config.lowVisibilityColor;
      this.ctx.fill();
    }
  }

  updateConfig(config: Partial<RenderConfig>): void {
    this.config = { ...this.config, ...config };
  }
}
