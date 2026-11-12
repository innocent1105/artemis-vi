import type { AssessmentProtocol, AssessmentType, AssessmentStep } from "../types/assessment";

const SQUAT_STEPS: AssessmentStep[] = [
  { id: "positioning", instruction: "Stand facing sideways to the camera. Ensure your feet, hips, shoulders and head are visible.", phase: "Positioning" },
  { id: "starting", instruction: "Stand upright with your feet approximately shoulder-width apart.", phase: "Starting Position" },
  { id: "descending", instruction: "Slowly bend your knees and lower your hips as if sitting on a chair.", phase: "Descending" },
  { id: "bottom", instruction: "Hold the bottom position briefly.", phase: "Bottom Position" },
  { id: "ascending", instruction: "Slowly return to your standing position.", phase: "Returning" },
  { id: "repeat", instruction: "Repeat the movement for five controlled repetitions.", phase: "Repetitions" },
];

const SHOULDER_STEPS: AssessmentStep[] = [
  { id: "facing", instruction: "Stand facing the camera.", phase: "Positioning" },
  { id: "arms_side", instruction: "Extend both arms sideways.", phase: "Arms Sideways" },
  { id: "raising", instruction: "Slowly raise both arms above your head.", phase: "Raising" },
  { id: "hold", instruction: "Hold the position.", phase: "Hold" },
  { id: "lowering", instruction: "Slowly lower your arms.", phase: "Lowering" },
  { id: "repeat", instruction: "Repeat three times.", phase: "Repetitions" },
];

const BALANCE_STEPS: AssessmentStep[] = [
  { id: "facing", instruction: "Stand facing the camera.", phase: "Positioning" },
  { id: "feet", instruction: "Position your feet together.", phase: "Feet Together" },
  { id: "one_leg", instruction: "Raise one foot slightly off the ground.", phase: "One Leg" },
  { id: "hold", instruction: "Maintain the position for 10 seconds.", phase: "Hold" },
  { id: "switch", instruction: "Repeat using the other foot.", phase: "Switch Leg" },
];

const POSTURE_STEPS: AssessmentStep[] = [
  { id: "facing", instruction: "Stand facing the camera.", phase: "Positioning" },
  { id: "relaxed", instruction: "Stand relaxed with your arms at your sides.", phase: "Relaxed Stance" },
  { id: "hold", instruction: "Hold this position while your posture is assessed.", phase: "Assessment" },
];

const FULL_BODY_STEPS: AssessmentStep[] = [
  { id: "facing", instruction: "Stand facing the camera.", phase: "Positioning" },
  { id: "side", instruction: "Turn to your side so your full body profile is visible.", phase: "Side Profile" },
  { id: "squat", instruction: "Perform a controlled squat.", phase: "Squat" },
  { id: "shoulder", instruction: "Raise both arms above your head.", phase: "Shoulder Mobility" },
  { id: "balance", instruction: "Balance on one foot for 10 seconds.", phase: "Balance" },
];

export const ASSESSMENT_PROTOCOLS: Record<AssessmentType, AssessmentProtocol> = {
  full_body: {
    id: "full_body",
    name: "Full Body Movement Assessment",
    description: "A comprehensive evaluation of mobility, balance, posture, and functional movement patterns.",
    duration: "6-8 minutes",
    healthIndicators: ["Mobility", "Balance", "Posture", "Coordination"],
    steps: FULL_BODY_STEPS,
    illustration: "🧑‍🚀",
    requiredLandmarks: [0, 11, 12, 23, 24, 25, 26, 27, 28],
    minVisibility: 0.5,
  },
  squat: {
    id: "squat",
    name: "Squat Performance Assessment",
    description: "Evaluates lower body strength, knee and hip range of motion, and movement symmetry through guided squats.",
    duration: "3-4 minutes",
    healthIndicators: ["Knee Flexion", "Hip Flexion", "Squat Depth", "Left-Right Symmetry"],
    steps: SQUAT_STEPS,
    illustration: "🏋️",
    requiredLandmarks: [23, 24, 25, 26, 27, 28],
    minVisibility: 0.5,
  },
  shoulder_mobility: {
    id: "shoulder_mobility",
    name: "Shoulder Mobility Assessment",
    description: "Measures shoulder range of motion, elevation symmetry, and movement consistency through guided arm raises.",
    duration: "3-4 minutes",
    healthIndicators: ["Shoulder Elevation", "Range of Motion", "Left-Right Symmetry", "Movement Consistency"],
    steps: SHOULDER_STEPS,
    illustration: "💪",
    requiredLandmarks: [11, 12, 13, 14, 15, 16, 23, 24],
    minVisibility: 0.5,
  },
  balance: {
    id: "balance",
    name: "Balance and Stability Assessment",
    description: "Assesses postural stability, trunk sway, and balance control during single-leg stance.",
    duration: "3-4 minutes",
    healthIndicators: ["Trunk Sway", "Hip Alignment", "Balance Duration", "Left-Right Differences"],
    steps: BALANCE_STEPS,
    illustration: "⚖️",
    requiredLandmarks: [23, 24, 25, 26, 27, 28, 0],
    minVisibility: 0.5,
  },
  posture: {
    id: "posture",
    name: "Posture Assessment",
    description: "Evaluates shoulder alignment, hip alignment, trunk inclination, and overall postural symmetry.",
    duration: "2-3 minutes",
    healthIndicators: ["Shoulder Alignment", "Hip Alignment", "Trunk Inclination", "Left-Right Asymmetry"],
    steps: POSTURE_STEPS,
    illustration: "🧍",
    requiredLandmarks: [11, 12, 23, 24, 0],
    minVisibility: 0.5,
  },
};

export const getProtocol = (type: AssessmentType): AssessmentProtocol => ASSESSMENT_PROTOCOLS[type];
