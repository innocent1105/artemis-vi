export interface RepetitionCounterConfig {
  thresholdUp: number;
  thresholdDown: number;
  minDurationMs: number;
}

export interface RepetitionCounterState {
  count: number;
  active: boolean;
  phase: "idle" | "active" | "completed";
}

export class RepetitionCounter {
  private count = 0;
  private active = false;
  private phaseStartTime = 0;
  private config: RepetitionCounterConfig;

  constructor(config: RepetitionCounterConfig) {
    this.config = config;
  }

  update(value: number, now: number): RepetitionCounterState {
    if (!this.active) {
      if (value >= this.config.thresholdUp) {
        this.active = true;
        this.phaseStartTime = now;
      }
      return { count: this.count, active: false, phase: "idle" };
    }

    if (value <= this.config.thresholdDown) {
      const duration = now - this.phaseStartTime;
      if (duration >= this.config.minDurationMs) {
        this.count++;
      }
      this.active = false;
      return { count: this.count, active: false, phase: "completed" };
    }

    return { count: this.count, active: true, phase: "active" };
  }

  getCount(): number {
    return this.count;
  }

  reset(): void {
    this.count = 0;
    this.active = false;
    this.phaseStartTime = 0;
  }
}
