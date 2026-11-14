import { useEffect, useRef, useState, useCallback } from "react";
import { PoseLandmarkerService } from "../../services/mediapipe/poseLandmarker";
import { LandmarkProcessor } from "../../services/mediapipe/landmarkProcessor";
import { PoseCanvas } from "./PoseCanvas";
import type { PoseLandmark } from "../../types/pose";
import type { DetectionStatus } from "../../types/health";

interface CameraViewProps {
  width?: number;
  height?: number;
  mirror?: boolean;
  onPoseDetected?: (result: {
    landmarks: PoseLandmark[];
    visibility: DetectionStatus;
  }) => void;
  onError?: (error: string) => void;
}

export function CameraView({
  width = 1280,
  height = 720,
  mirror = true,
  onPoseDetected,
  onError,
}: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const serviceRef = useRef<PoseLandmarkerService | null>(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const initRef = useRef<(() => Promise<void>) | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [landmarks, setLandmarks] = useState<PoseLandmark[]>([]);

  const initializeCamera = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: width }, height: { ideal: height }, facingMode: "user" },
      });
      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) throw new Error("Video element not found");
      video.srcObject = stream;

      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve();
        video.onerror = () => reject(new Error("Failed to load video metadata"));
      });

      await video.play();

      const svc = new PoseLandmarkerService();
      await svc.initialize();
      serviceRef.current = svc;

      setVideoReady(true);
      setIsLoading(false);

      requestAnimationFrame(processFrame);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      setIsLoading(false);
      onError?.(msg);
    }
  }, [width, height, onError]);

  initRef.current = initializeCamera;

  useEffect(() => {
    initRef.current?.();
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (serviceRef.current) {
        serviceRef.current.close();
        serviceRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      const video = videoRef.current;
      if (video) {
        video.srcObject = null;
      }
      setVideoReady(false);
      setLandmarks([]);
    };
  }, []);

  const processFrame = useCallback(() => {
    const video = videoRef.current;
    const svc = serviceRef.current;

    if (!video || !svc) {
      rafRef.current = requestAnimationFrame(processFrame);
      return;
    }

    if (video.readyState >= 2) {
      const timestamp = performance.now();
      const result = svc.detectForVideo(video, timestamp);
      if (result) {
        const processed = LandmarkProcessor.process(result.landmarks);
        const vis = computeVisibility(processed);
        setLandmarks(result.landmarks);
        onPoseDetected?.({ landmarks: result.landmarks, visibility: vis });
      }
    }

    rafRef.current = requestAnimationFrame(processFrame);
  }, [onPoseDetected]);

  const computeVisibility = useCallback(
    (processed: ReturnType<typeof LandmarkProcessor.process>): DetectionStatus => {
      const names = Object.keys(processed.byName);
      let totalConf = 0;
      let count = 0;
      const missing: string[] = [];

      for (const name of names) {
        const lm = processed.byName[name];
        if (!lm) continue;
        totalConf += lm.visibility;
        count++;
        if (lm.visibility < 0.5) missing.push(name);
      }

      const confidence = count > 0 ? totalConf / count : 0;
      return {
        detected: processed.averageVisibility >= 0.3,
        confidence,
        visibility: processed.averageVisibility,
        missingLandmarks: missing,
      };
    },
    []
  );

  return (
    <div className="relative w-full h-full bg-astra-navy overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
        style={{ transform: mirror ? "scaleX(-1)" : "scaleX(1)" }}
      />
      <PoseCanvas landmarks={landmarks} width={width} height={height} mirror={mirror} />
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-astra-navy/90 backdrop-blur-sm z-20">
          <div className="animate-pulse w-12 h-12 rounded-full border-2 border-astra-cyan border-t-transparent mb-4"></div>
          <span className="text-astra-cyan text-sm font-mono tracking-widest">Initializing camera & pose model</span>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/90 backdrop-blur z-30 text-center p-6">
          <div className="text-astra-red text-2xl font-bold mb-2">Camera Error</div>
          <p className="text-red-100 text-sm max-w-xs">{error}</p>
          <button
            onClick={() => {
              setError(null);
              initRef.current?.();
            }}
            className="mt-4 min-h-[2.75rem] min-w-[2.75rem] px-4 py-2 text-sm text-astra-cyan active:text-astra-cyan/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-astra-cyan underline"
          >
            Retry
          </button>
        </div>
      )}
      {!videoReady && !isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center text-astra-slate text-sm">
          Camera not active
        </div>
      )}
    </div>
  );
}

export type { CameraViewProps };
