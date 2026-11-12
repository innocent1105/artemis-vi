export type SquatState =
  | "IDLE"
  | "STANDING"
  | "DESCENDING"
  | "BOTTOM_POSITION"
  | "ASCENDING"
  | "REPETITION_COMPLETED";

export interface SquatAnalyzerConfig {
  standingKneeAngleMin: number;
  descendingKneeAngleMax: number;
  bottomKneeAngleMax: number;
  ascendingKneeAngleMin: number;
  hysteresis: number;
  minRepDurationMs: number;
}

export const DEFAULT_SQUAT_CONFIG: SquatAnalyzerConfig = {
  standingKneeAngleMin: 160,
  descendingKneeAngleMax: 150,
  bottomKneeAngleMax: 110,
  ascendingKneeAngleMin: 140,
  hysteresis: 8,
  minRepDurationMs: 800,
};

export interface SquatFrameAnalysis {
  state: SquatState;
  kneeAngle: number | null;
  repCount: number;
  inBottom: boolean;
  depth: number | null;
}

export class SquatMovementAnalyzer {
  private state: SquatState = "IDLE";
  private repCount = 0;
  private lastTransitionTime = 0;
  private bottomDepth = 0;
  private config: SquatAnalyzerConfig;
  private onStateChange?: (state: SquatState) => void;

  constructor(config: Partial<SquatAnalyzerConfig> = {}, onStateChange?: (state: SquatState) => void) {
    this.config = { ...DEFAULT_SQUAT_CONFIG, ...config };
    this.onStateChange = onStateChange;
  }

  private setState(next: SquatState, now: number): void {
    if (next === this.state) return;
    this.state = next;
    this.lastTransitionTime = now;
    this.onStateChange?.(next);
  }

  update(
    leftKneeAngle: number | null,
    rightKneeAngle: number | null,
    now: number
  ): SquatFrameAnalysis {
    const angle = this.averageAngle(leftKneeAngle, rightKneeAngle);
    const standingMin = this.config.standingKneeAngleMin - this.config.hysteresis / 2;
    const descendingMax = this.config.descendingKneeAngleMax + this.config.hysteresis / 2;
    const bottomMax = this.config.bottomKneeAngleMax + this.config.hysteresis / 2;
    const ascendingMin = this.config.ascendingKneeAngleMin - this.config.hysteresis / 2;

    const inBottom = angle !== null && angle <= bottomMax;

    switch (this.state) {
      case "IDLE":
        if (angle !== null && angle >= standingMin) {
          this.setState("STANDING", now);
        }
        break;

      case "STANDING":
        if (angle !== null && angle <= descendingMax) {
          this.setState("DESCENDING", now);
          this.bottomDepth = 0;
        }
        break;

      case "DESCENDING":
        if (inBottom) {
          this.setState("BOTTOM_POSITION", now);
        } else if (angle !== null && angle >= standingMin) {
          this.setState("STANDING", now);
        }
        break;

      case "BOTTOM_POSITION":
        if (angle !== null && angle >= ascendingMin) {
          this.setState("ASCENDING", now);
        }
        if (inBottom && angle !== null) {
          const depth = bottomMax - angle;
          if (depth > this.bottomDepth) this.bottomDepth = depth;
        }
        break;

      case "ASCENDING":
        if (angle !== null && angle >= standingMin) {
          const duration = now - this.lastTransitionTime;
          if (duration >= this.config.minRepDurationMs || this.state === "ASCENDING") {
            this.setState("REPETITION_COMPLETED", now);
            this.repCount++;
            this.setState("STANDING", now);
          }
        }
        break;

      case "REPETITION_COMPLETED":
        this.setState("STANDING", now);
        break;
    }

    return {
      state: this.state,
      kneeAngle: angle,
      repCount: this.repCount,
      inBottom,
      depth: this.state === "BOTTOM_POSITION" ? this.bottomDepth : null,
    };
  }

  private averageAngle(a: number | null, b: number | null): number | null {
    if (a === null && b === null) return null;
    if (a === null) return b;
    if (b === null) return a;
    return (a + b) / 2;
  }

  getState(): SquatState {
    return this.state;
  }

  getRepCount(): number {
    return this.repCount;
  }

  reset(): void {
    this.state = "IDLE";
    this.repCount = 0;
    this.lastTransitionTime = 0;
    this.bottomDepth = 0;
  }
}

export type ShoulderPhase = "IDLE" | "ARMS_DOWN" | "ARMS_RAISING" | "ARMS_UP" | "ARMS_LOWERING" | "REP_COMPLETED";

export interface ShoulderAnalyzerConfig {
  armDownElbowAngleMin: number;
  armUpElbowAngleMax: number;
  minHoldMs: number;
}

export const DEFAULT_SHOULDER_CONFIG: ShoulderAnalyzerConfig = {
  armDownElbowAngleMin: 150,
  armUpElbowAngleMax: 60,
  minHoldMs: 800,
};

export class ShoulderMobilityAnalyzer {
  private phase: ShoulderPhase = "IDLE";
  private repCount = 0;
  private holdStartTime = 0;
    private maxElevation = 0;
  private config: ShoulderAnalyzerConfig;

  constructor(config: Partial<ShoulderAnalyzerConfig> = {}) {
    this.config = { ...DEFAULT_SHOULDER_CONFIG, ...config };
  }

  update(leftElbowAngle: number | null, rightElbowAngle: number | null, now: number): ShoulderPhase {
    const angle = this.averageAngle(leftElbowAngle, rightElbowAngle);
    if (angle === null) return this.phase;

    const elevation = 180 - angle;
    if (elevation > this.maxElevation) this.maxElevation = elevation;

    switch (this.phase) {
      case "IDLE":
      case "ARMS_DOWN":
        if (angle <= this.config.armUpElbowAngleMax) {
          this.phase = "ARMS_UP";
          this.holdStartTime = now;
        } else if (angle > this.config.armDownElbowAngleMin) {
          this.phase = "ARMS_DOWN";
        }
        break;
      case "ARMS_RAISING":
        if (angle <= this.config.armUpElbowAngleMax) {
          this.phase = "ARMS_UP";
          this.holdStartTime = now;
        }
        break;
      case "ARMS_UP":
        if (angle > this.config.armDownElbowAngleMin) {
          this.phase = "ARMS_LOWERING";
        } else if (now - this.holdStartTime >= this.config.minHoldMs) {
          this.phase = "REP_COMPLETED";
          this.repCount++;
          this.phase = "ARMS_DOWN";
        }
        break;
      case "ARMS_LOWERING":
        if (angle > this.config.armDownElbowAngleMin) {
          this.phase = "ARMS_DOWN";
        }
        break;
      case "REP_COMPLETED":
        this.phase = "ARMS_DOWN";
        break;
    }
    return this.phase;
  }

  private averageAngle(a: number | null, b: number | null): number | null {
    if (a === null && b === null) return null;
    if (a === null) return b;
    if (b === null) return a;
    return (a + b) / 2;
  }

  getPhase(): ShoulderPhase { return this.phase; }
  getRepCount(): number { return this.repCount; }
  getMaxElevation(): number { return this.maxElevation; }
  reset(): void {
    this.phase = "IDLE";
    this.repCount = 0;
    this.holdStartTime = 0;
    this.maxElevation = 0;
  }
}

export type BalancePhase = "IDLE" | "FEET_TOGETHER" | "ONE_LEG" | "HOLDING" | "COMPLETED";

export interface BalanceAnalyzerConfig {
  holdDurationMs: number;
  swayThreshold: number;
}

export const DEFAULT_BALANCE_CONFIG: BalanceAnalyzerConfig = {
  holdDurationMs: 10000,
  swayThreshold: 0.05,
};

export class BalanceAnalyzer {
  private phase: BalancePhase = "IDLE";
  private holdStartTime = 0;
  private maxSway = 0;
  private previousHipX: number | null = null;
  private completed = false;
  private config: BalanceAnalyzerConfig;

  constructor(config: Partial<BalanceAnalyzerConfig> = {}) {
    this.config = { ...DEFAULT_BALANCE_CONFIG, ...config };
  }

  update(hipX: number | null, now: number): BalancePhase {
    if (hipX === null) return this.phase;

    if (this.previousHipX !== null) {
      const sway = Math.abs(hipX - this.previousHipX);
      if (sway > this.maxSway) this.maxSway = sway;
    }
    this.previousHipX = hipX;

    switch (this.phase) {
      case "IDLE":
        this.phase = "FEET_TOGETHER";
        break;
      case "FEET_TOGETHER":
        this.phase = "ONE_LEG";
        this.holdStartTime = now;
        break;
      case "ONE_LEG":
        this.phase = "HOLDING";
        this.holdStartTime = now;
        break;
      case "HOLDING":
        if (now - this.holdStartTime >= this.config.holdDurationMs) {
          this.phase = "COMPLETED";
          this.completed = true;
        }
        break;
      case "COMPLETED":
        break;
    }
    return this.phase;
  }

  getPhase(): BalancePhase { return this.phase; }
  getMaxSway(): number { return this.maxSway; }
  isCompleted(): boolean { return this.completed; }
  reset(): void {
    this.phase = "IDLE";
    this.holdStartTime = 0;
    this.maxSway = 0;
    this.previousHipX = null;
    this.completed = false;
  }
}
