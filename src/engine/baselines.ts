export function sleepAverage(records: any[], days: number): number | null {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const sleepRecords = records.filter(
    (r) => r.source === "sleep" && r.timestamp >= cutoff
  );
  if (sleepRecords.length === 0) return null;
  const total = sleepRecords.reduce((sum, r) => sum + (r.durationHours ?? 0), 0);
  return total / sleepRecords.length;
}

export function stressAverage(records: any[], days: number): number | null {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const wellbeingRecords = records.filter(
    (r) => r.source === "wellbeing" && r.timestamp >= cutoff
  );
  if (wellbeingRecords.length === 0) return null;
  const total = wellbeingRecords.reduce((sum, r) => sum + (r.stress ?? 0), 0);
  return total / wellbeingRecords.length;
}
