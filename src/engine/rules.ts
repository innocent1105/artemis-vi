export type Rule = {
  id: string;
  name: string;
  severity: string;
  evaluate(records: any[]): any | null;
};

export const RULES: Rule[] = [
  {
    id: "sleep-decline",
    name: "Sleep Decline",
    severity: "review",
    evaluate(records: any[]): any | null {
      const sleepRecords = records
        .filter((r) => r.source === "sleep")
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 3);

      if (sleepRecords.length < 3) return null;

      const avg =
        sleepRecords.reduce((sum, r) => sum + (r.durationHours ?? 0), 0) /
        sleepRecords.length;

      if (avg < 6) {
        return {
          id: crypto.randomUUID(),
          ruleId: "sleep-decline",
          title: "Sleep Decline Detected",
          explanation:
            `Sleep is declining. Average over last 3 nights is ${avg.toFixed(1)} hours. NASA HRP behavioral health research indicates that chronic sleep loss and isolation degrade performance and immune function. Recommend schedule review and light therapy.`,
          severity: "review",
          status: "open",
          contributingRecordIds: sleepRecords.map((r) => r.id),
          createdAt: new Date().toISOString(),
        };
      }

      return null;
    },
  },
  {
    id: "stress-rising",
    name: "Stress Rising",
    severity: "review",
    evaluate(records: any[]): any | null {
      const wellbeingRecords = records
        .filter((r) => r.source === "wellbeing")
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 3);

      if (wellbeingRecords.length < 3) return null;

      const [latest, middle, oldest] = wellbeingRecords;

      const stressLatest = latest.stress ?? 0;
      const stressMiddle = middle.stress ?? 0;
      const stressOldest = oldest.stress ?? 0;

      const isStrictlyIncreasing = stressLatest > stressMiddle && stressMiddle > stressOldest;

      if (isStrictlyIncreasing && stressLatest >= 7) {
        return {
          id: crypto.randomUUID(),
          ruleId: "stress-rising",
          title: "Stress Rising",
          explanation:
            "Self-reported stress has increased for 3 consecutive check-ins. NASA research notes that isolation and confinement are the greatest behavioral risks on long missions. Recommend psychological support.",
          severity: "review",
          status: "open",
          contributingRecordIds: wellbeingRecords.map((r) => r.id),
          createdAt: new Date().toISOString(),
        };
      }

      return null;
    },
  },
  {
    id: "sans-risk",
    name: "SANS / Vision Risk",
    severity: "urgent",
    evaluate(records: any[]): any | null {
      const symptomRecords = records.filter((r) => r.source === "symptom");

      const hasVisionIssue = symptomRecords.some(
        (r) =>
          /blurry vision|vision changes/i.test(r.description ?? "")
      );
      const hasHeadache = symptomRecords.some(
        (r) => /headache/i.test(r.description ?? "")
      );

      if (hasVisionIssue && hasHeadache) {
        return {
          id: crypto.randomUUID(),
          ruleId: "sans-risk",
          title: "SANS / Vision Risk",
          explanation:
            "Astronaut reported visual changes alongside headaches. Fluid shifts in microgravity can cause Spaceflight-Associated Neuro-ocular Syndrome (SANS). Requires urgent ophthalmic review per NASA HRP guidelines.",
          severity: "urgent",
          status: "open",
          contributingRecordIds: symptomRecords.map((r) => r.id),
          createdAt: new Date().toISOString(),
        };
      }

      return null;
    },
  },
  {
    id: "immune-reactivation",
    name: "Immune Reactivation Risk",
    severity: "review",
    evaluate(records: any[]): any | null {
      const wellbeingRecords = records.filter((r) => r.source === "wellbeing");
      const symptomRecords = records.filter((r) => r.source === "symptom");

      const highStress = wellbeingRecords.some((r) => (r.stress ?? 0) >= 7);
      const viralSymptoms = symptomRecords.some((r) =>
        /cold sore|rash|shingles/i.test(r.description ?? "")
      );

      if (highStress && viralSymptoms) {
        return {
          id: crypto.randomUUID(),
          ruleId: "immune-reactivation",
          title: "Immune Reactivation Risk",
          explanation:
            "High stress combined with viral symptoms detected. NASA's Immune Biomarkers research indicates spaceflight stress can reactivate dormant viruses (like shingles). Recommend Crew Medical Officer review.",
          severity: "review",
          status: "open",
          contributingRecordIds: [
            ...wellbeingRecords.map((r) => r.id),
            ...symptomRecords.map((r) => r.id),
          ],
          createdAt: new Date().toISOString(),
        };
      }

      return null;
    },
  },
];
