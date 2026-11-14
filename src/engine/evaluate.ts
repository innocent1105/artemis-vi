import { RULES } from "./rules";

export function evaluateAll(records: any[], astronautId: string): any[] {
  const alerts: any[] = [];

  for (const rule of RULES) {
    const result = rule.evaluate(records);
    if (result) {
      alerts.push({
        id: crypto.randomUUID(),
        ruleId: rule.id,
        astronautId,
        title: result.title,
        explanation: result.explanation,
        severity: rule.severity,
        status: "open",
        contributingRecordIds: result.contributingRecordIds ?? [],
        createdAt: new Date().toISOString(),
      });
    }
  }

  return alerts;
}

export function getAlerts(): any[] {
  try {
    const raw = localStorage.getItem("astra.alerts");
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
