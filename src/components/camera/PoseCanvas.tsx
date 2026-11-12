import { useEffect, useRef } from "react";
import { SkeletonRenderer } from "../../services/mediapipe/skeletonRenderer";
import type { PoseLandmark } from "../../types/pose";

interface PoseCanvasProps {
  landmarks: PoseLandmark[];
  width?: number;
  height?: number;
  mirror?: boolean;
}

export function PoseCanvas({ landmarks, width = 1280, height = 720, mirror = true }: PoseCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<SkeletonRenderer | null>(null);
  const dimsRef = useRef({ width, height });

  dimsRef.current = { width, height };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    rendererRef.current = new SkeletonRenderer(canvas, {
      landmarkColor: "#22d3ee",
      connectionColor: "rgba(34, 211, 238, 0.45)",
      landmarkRadius: 4,
      lineWidth: 2,
      lowVisibilityColor: "rgba(34, 211, 238, 0.2)",
      visibilityThreshold: 0.4,
    });
    rendererRef.current.resize(canvas.clientWidth, canvas.clientHeight);
  }, []);

  useEffect(() => {
    const renderer = rendererRef.current;
    const canvas = canvasRef.current;
    if (!renderer || !canvas) return;

    const vw = dimsRef.current.width;
    const vh = dimsRef.current.height;
    renderer.render(landmarks, vw, vh);
  }, [landmarks]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ transform: mirror ? "scaleX(-1)" : "scaleX(1)" }}
    />
  );
}
