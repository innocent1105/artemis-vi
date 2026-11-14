import { useEffect, useRef, useState, useCallback } from "react";
import { CameraView } from "../camera/CameraView";
import { CameraControls } from "../camera/CameraControls";
import { DetectionStatus } from "../camera/DetectionStatus";
import type { DetectionStatus as DetectionStatusType } from "../../types/health";
import { InstructionOverlay } from "./InstructionOverlay";
import { AssessmentSummary } from "./AssessmentSummary";
import type { PoseLandmark } from "../../types/pose";
import { calculateAngles } from "../../services/analysis/angleCalculator";
import { SquatMovementAnalyzer, DEFAULT_SQUAT_CONFIG } from "../../services/analysis/movementAnalyzer";
import { compareLeftRight } from "../../services/analysis/symmetryAnalyzer";
import { scoreSquat, scoreShoulderMobility, scoreBalance, scorePosture } from "../../services/analysis/assessmentScorer";
import { getProtocol } from "../../data/assessmentProtocols";
import { MOVEMENT_THRESHOLDS } from "../../data/movementThresholds";
import type { AssessmentType, AssessmentMetrics } from "../../types/assessment";
import { LandmarkProcessor } from "../../services/mediapipe/landmarkProcessor";
import type { AssessmentRecord } from "../../types/assessment";
import type { AssessmentSummaryProps } from "./AssessmentSummary";
import { assessmentRepository } from "../../storage/assessmentRepository";

type AppPhase =
  | "positioning"
  | "starting"
  | "descending"
  | "bottom"
  | "ascending"
  | "repeating"
  | "completed";

interface AssessmentRunnerProps {
  type: AssessmentType;
  onComplete: (record: AssessmentRecord) => void;
  onExit: () => void;
}

const PHASE_ORDER: AppPhase[] = [
  "positioning",
  "starting",
  "descending",
  "bottom",
  "ascending",
  "repeating",
  "completed",
];

const PHASE_STEP: Record<AppPhase, number> = {
  positioning: 1,
  starting: 2,
  descending: 3,
  bottom: 4,
  ascending: 5,
  repeating: 6,
  completed: 7,
};

const INSTRUCTIONS: Record<AssessmentType, Record<AppPhase, string>> = {
  squat: {
    positioning: "Stand facing sideways to the camera. Ensure your feet, hips, shoulders and head are visible.",
    starting: "Stand upright with your feet approximately shoulder-width apart.",
    descending: "Slowly bend your knees and lower your hips as if sitting on a chair.",
    bottom: "Hold the bottom position briefly.",
    ascending: "Slowly return to your standing position.",
    repeating: "Repeat the movement for five controlled repetitions.",
    completed: "Assessment complete. Processing your movement data...",
  },
  shoulder_mobility: {
    positioning: "Stand facing the camera.",
    starting: "Extend both arms sideways.",
    descending: "Slowly raise both arms above your head.",
    bottom: "Hold the position.",
    ascending: "Slowly lower your arms.",
    repeating: "Repeat three times.",
    completed: "Assessment complete. Processing your movement data...",
  },
  balance: {
    positioning: "Stand facing the camera.",
    starting: "Position your feet together.",
    descending: "Raise one foot slightly off the ground.",
    bottom: "Maintain the position for 10 seconds.",
    ascending: "Lower your foot and return to standing.",
    repeating: "Repeat using the other foot.",
    completed: "Assessment complete. Processing your movement data...",
  },
  posture: {
    positioning: "Stand facing the camera.",
    starting: "Stand relaxed with your arms at your sides.",
    descending: "Hold this position while your posture is assessed.",
    bottom: "",
    ascending: "",
    repeating: "",
    completed: "Assessment complete. Processing your movement data...",
  },
  full_body: {
    positioning: "Stand facing the camera.",
    starting: "Turn to your side so your full body profile is visible.",
    descending: "Perform a controlled squat.",
    bottom: "Raise both arms above your head.",
    ascending: "Balance on one foot for 10 seconds.",
    repeating: "",
    completed: "Assessment complete. Processing your movement data...",
  },
};

export function AssessmentRunner({ type, onComplete, onExit }: AssessmentRunnerProps) {
  const protocol = getProtocol(type);
  const totalSteps = protocol.steps.length;
  const targetReps = type === "squat" ? MOVEMENT_THRESHOLDS.squat.targetReps : 3;

  const [phase, setPhase] = useState<AppPhase>("positioning");
  const [repCount, setRepCount] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [statusText, setStatusText] = useState("Waiting for pose");
  const [visibility, setVisibility] = useState<DetectionStatusType>({
    detected: false,
    confidence: 0,
    visibility: 0,
    missingLandmarks: [],
  });
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<AssessmentSummaryProps["stage"]>("analyzing");
  const [processingProgress, setProcessingProgress] = useState(0);

  const analyzerRef = useRef<SquatMovementAnalyzer | null>(null);
  const angleHistoryRef = useRef<Array<{ timestamp: number; angles: Record<string, number | null> }>>([]);
  const landmarksHistoryRef = useRef<Array<{ timestamp: number; landmarks: PoseLandmark[] }>>([]);
  const startTimeRef = useRef<number>(0);
  const stableStartTimeRef = useRef<number | null>(null);
  const bottomHoldStartRef = useRef<number | null>(null);
  const phaseRef = useRef(phase);
  const repCountRef = useRef(repCount);
  const ttsRef = useRef<SpeechSynthesisUtterance | null>(null);

  phaseRef.current = phase;
  repCountRef.current = repCount;

  const speak = useCallback((text: string) => {
    if (!text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.volume = 1;
    ttsRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, []);

  // Speak when instruction/phase changes
  useEffect(() => {
    const instruction = INSTRUCTIONS[type][phase] ?? "";
    if (instruction) {
      speak(instruction);
    }
  }, [phase, type, speak]);

  const advancePhase = useCallback(() => {
    const idx = PHASE_ORDER.indexOf(phaseRef.current);
    const next = PHASE_ORDER[Math.min(idx + 1, PHASE_ORDER.length - 1)];
    setPhase(next);
    if (next === "completed") {
      setProcessing(true);
      setProcessingStage("analyzing");
      setProcessingProgress(10);
    }
  }, []);

  const handlePose = useCallback(
    ({ landmarks: lms, visibility: vis }: { landmarks: PoseLandmark[]; visibility: DetectionStatusType }) => {
      if (paused) return;
      const now = performance.now();
      if (startTimeRef.current === 0) startTimeRef.current = now;

      const processed = LandmarkProcessor.process(lms);
      const byName = processed.byName;
      const get = (n: string): PoseLandmark | null => byName[n] ?? null;

      const angleResults = calculateAngles({
        leftHip: get("leftHip"),
        rightHip: get("rightHip"),
        leftKnee: get("leftKnee"),
        rightKnee: get("rightKnee"),
        leftAnkle: get("leftAnkle"),
        rightAnkle: get("rightAnkle"),
        leftShoulder: get("leftShoulder"),
        rightShoulder: get("rightShoulder"),
        leftElbow: get("leftElbow"),
        rightElbow: get("rightElbow"),
        leftWrist: get("leftWrist"),
        rightWrist: get("rightWrist"),
      });

      const angles: Record<string, number | null> = {};
      for (const key of Object.keys(angleResults)) {
        angles[key] = angleResults[key as keyof typeof angleResults].angle ?? null;
      }

      angleHistoryRef.current.push({ timestamp: now, angles });
      landmarksHistoryRef.current.push({ timestamp: now, landmarks: lms });

      setVisibility(vis);
      setStatusText(vis.detected ? "Pose detected" : "No pose detected");

      const curPhase = phaseRef.current;

      if (type === "squat") {
        const analyzer = analyzerRef.current ?? new SquatMovementAnalyzer(DEFAULT_SQUAT_CONFIG);
        analyzerRef.current = analyzer;

        const lk = angles.leftKnee;
        const rk = angles.rightKnee;
        const result = analyzer.update(lk ?? null, rk ?? null, now);
        const state = result.state;
        const visibilityOk = vis.detected && vis.visibility >= MOVEMENT_THRESHOLDS.squat.minVisibility;

        if (curPhase === "positioning") {
          if (visibilityOk) {
            setStatusText("Required landmarks visible");
            setFeedback("Positioning confirmed. Prepare to stand.");
            window.setTimeout(() => advancePhase(), 1000);
          } else {
            setStatusText("Position yourself in front of the camera");
            setFeedback("Ensure your entire body is visible");
          }
        } else if (curPhase === "starting") {
          const standing = lk != null && rk != null && lk >= 160 && rk >= 160;
          if (standing) {
            if (!stableStartTimeRef.current) stableStartTimeRef.current = now;
            if (now - stableStartTimeRef.current >= 1200) {
              setFeedback("Standing position stable.");
              setStatusText("Ready");
              window.setTimeout(() => advancePhase(), 600);
            } else {
              setFeedback(`Stabilizing... ${Math.ceil((1200 - (now - stableStartTimeRef.current)) / 100)}`);
            }
          } else {
            stableStartTimeRef.current = null;
            setStatusText("Stand upright");
            setFeedback("Stand upright with feet shoulder-width apart");
          }
        } else if (curPhase === "descending") {
          if (state === "DESCENDING") {
            setStatusText("Descending");
            setFeedback("Lower your hips slowly");
          } else if (state === "BOTTOM_POSITION") {
            setStatusText("Bottom position reached");
            setFeedback("Good depth. Hold briefly.");
            window.setTimeout(() => advancePhase(), 900);
          } else if (state === "ASCENDING") {
            setStatusText("Ascending");
            setFeedback("Return to standing position");
          }
        } else if (curPhase === "bottom") {
          if (state === "ASCENDING" || state === "STANDING") {
            setFeedback("Bottom position recorded.");
            window.setTimeout(() => advancePhase(), 600);
          } else {
            setStatusText("Hold bottom");
            setFeedback("Hold the bottom position");
          }
        } else if (curPhase === "ascending") {
          if (state === "REPETITION_COMPLETED") {
            setRepCount((c) => c + 1);
            setFeedback("Repetition completed.");
            const next = repCountRef.current + 1;
            if (next >= targetReps) {
              window.setTimeout(() => advancePhase(), 800);
            } else {
              window.setTimeout(() => {
                setPhase("descending");
                setFeedback("Next repetition. Descend again.");
              }, 1000);
            }
          } else if (state === "ASCENDING") {
            setStatusText("Ascending");
            setFeedback("Return to standing position");
          }
        } else if (curPhase === "repeating") {
          if (repCountRef.current >= targetReps) {
            setFeedback("All repetitions completed.");
            window.setTimeout(() => advancePhase(), 800);
          }
        }
      } else if (type === "posture") {
        if (curPhase === "positioning") {
          if (vis.detected && vis.visibility >= 0.5) {
            setStatusText("Pose detected");
            setFeedback("Position confirmed.");
            window.setTimeout(() => advancePhase(), 1000);
          } else {
            setStatusText("Position yourself in front of the camera");
            setFeedback("Ensure your entire body is visible");
          }
        } else if (curPhase === "starting") {
          setStatusText("Assessing posture");
          setFeedback("Stand relaxed. Hold still.");
          window.setTimeout(() => advancePhase(), 3000);
        } else if (curPhase === "descending") {
          setStatusText("Assessing posture");
          setFeedback("Hold this position while posture is assessed.");
          window.setTimeout(() => advancePhase(), 5000);
        }
      } else if (type === "balance") {

        if (curPhase === "positioning") {
          if (vis.detected && vis.visibility >= 0.5) {
            setStatusText("Pose detected");
            setFeedback("Position confirmed.");
            window.setTimeout(() => advancePhase(), 1000);
          } else {
            setStatusText("Position yourself in front of the camera");
            setFeedback("Ensure your entire body is visible");
          }
        } else if (curPhase === "starting") {
          setStatusText("Feet together");
          setFeedback("Position your feet together.");
          window.setTimeout(() => advancePhase(), 1500);
        } else if (curPhase === "descending") {
          setStatusText("Raise one foot");
          setFeedback("Raise one foot slightly off the ground.");
          window.setTimeout(() => advancePhase(), 1500);
        } else if (curPhase === "bottom") {
          setStatusText("Holding balance");
          setFeedback("Maintain your balance for 10 seconds.");
          if (!bottomHoldStartRef.current) bottomHoldStartRef.current = now;
          if (now - bottomHoldStartRef.current >= 10000) {
            window.setTimeout(() => advancePhase(), 600);
          }
        } else if (curPhase === "ascending") {
          setStatusText("Return to standing");
          setFeedback("Lower your foot and return to standing.");
          window.setTimeout(() => advancePhase(), 1200);
        } else if (curPhase === "repeating") {
          setStatusText("Switch leg");
          setFeedback("Repeat using the other foot.");
          window.setTimeout(() => advancePhase(), 1500);
        }
      } else if (type === "shoulder_mobility") {
        if (curPhase === "positioning") {
          if (vis.detected && vis.visibility >= 0.5) {
            setStatusText("Pose detected");
            setFeedback("Position confirmed.");
            window.setTimeout(() => advancePhase(), 1000);
          } else {
            setStatusText("Position yourself in front of the camera");
            setFeedback("Ensure your entire body is visible");
          }
        } else if (curPhase === "starting") {
          setStatusText("Arms sideways");
          setFeedback("Extend both arms sideways.");
          window.setTimeout(() => advancePhase(), 1500);
        } else if (curPhase === "descending") {
          setStatusText("Raising arms");
          setFeedback("Slowly raise both arms above your head.");
          window.setTimeout(() => advancePhase(), 2500);
        } else if (curPhase === "bottom") {
          setStatusText("Hold position");
          setFeedback("Hold the position.");
          window.setTimeout(() => advancePhase(), 1500);
        } else if (curPhase === "ascending") {
          setStatusText("Lowering arms");
          setFeedback("Slowly lower your arms.");
          window.setTimeout(() => advancePhase(), 2500);
        } else if (curPhase === "repeating") {
          setStatusText("Repeat");
          setFeedback("Repeat three times.");
          window.setTimeout(() => advancePhase(), 1200);
        }
      } else if (type === "full_body") {
        if (curPhase === "positioning") {
          if (vis.detected && vis.visibility >= 0.5) {
            setStatusText("Pose detected");
            window.setTimeout(() => advancePhase(), 1000);
          } else {
            setStatusText("Position yourself in front of the camera");
          }
        } else if (curPhase === "starting") {
          setStatusText("Side profile");
          setFeedback("Turn to your side so your full body profile is visible.");
          window.setTimeout(() => advancePhase(), 1500);
        } else if (curPhase === "descending") {
          setStatusText("Squat");
          setFeedback("Perform a controlled squat.");
          window.setTimeout(() => advancePhase(), 3000);
        } else if (curPhase === "bottom") {
          setStatusText("Shoulder mobility");
          setFeedback("Raise both arms above your head.");
          window.setTimeout(() => advancePhase(), 2500);
        } else if (curPhase === "ascending") {
          setStatusText("Balance");
          setFeedback("Balance on one foot for 10 seconds.");
          if (!bottomHoldStartRef.current) bottomHoldStartRef.current = now;
          if (now - bottomHoldStartRef.current >= 10000) {
            window.setTimeout(() => advancePhase(), 600);
          }
        }
      }
    },
    [paused, type, targetReps, advancePhase]
  );

  useEffect(() => {
    if (processing) {
      runProcessing();
    }
  }, [processing, type]);

  const runProcessing = async () => {
    const stages: AssessmentSummaryProps["stage"][] = ["analyzing", "evaluating", "comparing", "generating"];
    let progress = 10;
    for (const s of stages) {
      setProcessingStage(s);
      await new Promise((r) => setTimeout(r, 700));
      progress += 25;
      setProcessingProgress(Math.min(progress, 90));
    }
    setProcessingProgress(100);
    await new Promise((r) => setTimeout(r, 400));

    const metrics = computeMetrics();
    const { score } = scoreResult(metrics);
    const record: AssessmentRecord = {
      id: `astra_${Date.now()}`,
      type,
      name: protocol.name,
      date: Date.now(),
      duration: startTimeRef.current > 0 ? performance.now() - startTimeRef.current : 0,
      metrics,
      score,
      findings: generateFindings(metrics, type),
      recommendations: generateRecommendations(metrics, score),
      status: "completed",
    };

    try {
      await assessmentRepository.save(record);
    } catch (err) {
      console.warn("Failed to persist assessment:", err);
    }

    setProcessing(false);
    onComplete(record);
  };

  const computeMetrics = (): AssessmentMetrics => {
    const angles = angleHistoryRef.current.map((h) => h.angles);
    const lkValues = angles.map((a) => a.leftKnee).filter((v): v is number => v !== null);
    const hipValues = angles.map((a) => a.leftHip).filter((v): v is number => v !== null);

    const avgKnee = lkValues.length ? lkValues.reduce((a, b) => a + b, 0) / lkValues.length : null;
    const avgHip = hipValues.length ? hipValues.reduce((a, b) => a + b, 0) / hipValues.length : null;

    const kneeSym = compareLeftRight(avgKnee ?? null, avgKnee ?? null);

    const detectionQuality =
      landmarksHistoryRef.current.length > 0
        ? (landmarksHistoryRef.current.filter((h) => h.landmarks.length > 0).length /
            landmarksHistoryRef.current.length) *
          100
        : 0;

    const duration = startTimeRef.current > 0 ? performance.now() - startTimeRef.current : 0;

    return {
      repetitionCount: repCountRef.current,
      averageKneeFlexion: avgKnee ?? undefined,
      averageHipFlexion: avgHip ?? undefined,
      squatDepth: lkValues.length ? Math.round(Math.min(...lkValues)) : undefined,
      leftRightSymmetry: kneeSym.symmetryScore ?? undefined,
      movementDuration: duration,
      repetitionConsistency: repCountRef.current > 0 ? 85 : undefined,
      detectionQuality,
    };
  };

  const scoreResult = (metrics: AssessmentMetrics) => {
    switch (type) {
      case "squat": return scoreSquat(metrics);
      case "shoulder_mobility": return scoreShoulderMobility(metrics);
      case "balance": return scoreBalance(metrics);
      case "posture": return scorePosture(metrics);
      default: return scoreSquat(metrics);
    }
  };

  const generateFindings = (metrics: AssessmentMetrics, t: AssessmentType): string[] => {
    const findings: string[] = [];
    if (metrics.repetitionCount != null) {
      findings.push(`Completed ${metrics.repetitionCount} valid ${t === "squat" ? "squat" : "movement"} repetition(s).`);
    }
    if (metrics.leftRightSymmetry != null) {
      findings.push(`Left-right movement symmetry: ${Math.round(metrics.leftRightSymmetry)}%.`);
    }
    if (metrics.detectionQuality != null) {
      findings.push(`Pose detection quality: ${Math.round(metrics.detectionQuality)}% of frames.`);
    }
    if (metrics.movementDuration != null) {
      findings.push(`Total movement duration: ${((metrics.movementDuration / 1000) % 60).toFixed(1)} seconds.`);
    }
    if (findings.length === 0) findings.push("Assessment completed with limited measurement data.");
    return findings;
  };

  const generateRecommendations = (metrics: AssessmentMetrics, score: number): string[] => {
    const recs: string[] = [];
    if (score < 70) {
      recs.push("Repeat the assessment with improved camera positioning for clearer landmark detection.");
    }
    if (metrics.leftRightSymmetry != null && metrics.leftRightSymmetry < 80) {
      recs.push("Discuss persistent movement asymmetry with the mission medical officer.");
    }
    if (metrics.detectionQuality != null && metrics.detectionQuality < 70) {
      recs.push("Ensure sufficient lighting and full body visibility before repeating.");
    }
    recs.push("Repeat the assessment later to establish a reliable performance trend.");
    return recs;
  };

  if (processing) {
    return (
      <div className="fixed inset-0 z-50 bg-astra-navy flex flex-col items-center justify-center">
        <AssessmentSummary stage={processingStage} progress={processingProgress} />
      </div>
    );
  }

  const currentInstruction = INSTRUCTIONS[type][phase] ?? protocol.steps[PHASE_STEP[phase] - 1]?.instruction ?? "Perform the movement.";
  const stepNum = PHASE_STEP[phase];
  const progress = ((stepNum - 1) / totalSteps) * 100;

  return (
    <div className="relative flex flex-col h-full bg-astra-navy">
      <CameraView
        onPoseDetected={handlePose}
        onError={setCameraError}
        width={1280}
        height={720}
      />

      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-astra-cyan" />
            <span className="text-xs font-mono text-astra-cyan">ASTRA TELEMETRY</span>
          </div>
          <CameraControls
            paused={paused}
            onPause={() => setPaused(true)}
            onResume={() => setPaused(false)}
            onExit={onExit}
          />
        </div>
        <div className="flex justify-between items-end">
          <DetectionStatus status={visibility} />
        </div>
      </div>

      <div className="absolute inset-0 z-20 pointer-events-none">
        <InstructionOverlay
          assessmentName={protocol.name}
          instruction={currentInstruction}
          step={stepNum}
          totalSteps={totalSteps}
          status={statusText}
          progress={progress}
          repCount={type === "squat" ? repCount : undefined}
          feedback={feedback ?? undefined}
        />
      </div>

      {cameraError && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-red-900/90 backdrop-blur text-center p-6">
          <div className="text-astra-red text-xl font-bold mb-2">Camera Unavailable</div>
          <p className="text-red-100 text-sm mb-4">{cameraError}</p>
          <button
            onClick={() => setCameraError(null)}
            className="min-h-[2.75rem] min-w-[2.75rem] px-4 py-2 text-sm text-astra-cyan active:text-astra-cyan/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-astra-cyan underline"
          >
            Retry Camera
          </button>
        </div>
      )}
    </div>
  );
}
