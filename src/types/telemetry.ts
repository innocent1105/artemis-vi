export interface CrewTelemetry {
  astronautId: string;
  timestamp: string;
  heartRate?: number;
  heartRateVariability?: number;
  ambientCO2?: number;
  radiationExposure?: number;
  cabinTemperature?: number;
  cabinPressure?: number;
  sleepQuality?: number;
  stressRating?: number;
  moodRating?: number;
  fatigueRating?: number;
}

export interface TelemetryAlert {
  id: string;
  astronautId: string;
  metric: keyof CrewTelemetry;
  value: number;
  threshold: number;
  severity: "NOMINAL" | "CAUTION" | "CRITICAL";
  timestamp: string;
  acknowledged: boolean;
}
