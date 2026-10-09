import type { AiAnalysis } from "./types";

// TZ 14.4 — Trust Score og'irliklari
export const WEIGHTS = {
  reliability: 0.25,
  service: 0.2,
  cleanliness: 0.15,
  staff: 0.1,
  food: 0.1,
  price: 0.1,
  ad_match: 0.1,
} as const;

export type MetricKey = keyof typeof WEIGHTS;
export const METRIC_KEYS = Object.keys(WEIGHTS) as MetricKey[];

/** Mavjud ko'rsatkichlar bo'yicha og'irliklangan o'rtacha. Yetarli ma'lumot bo'lmasa null. */
export function computeTrustScore(a: Pick<AiAnalysis, MetricKey>): number | null {
  let sum = 0;
  let weight = 0;
  for (const k of METRIC_KEYS) {
    const v = a[k];
    if (v == null) continue;
    sum += v * WEIGHTS[k];
    weight += WEIGHTS[k];
  }
  // Og'irlikning yarmidan kami ma'lum bo'lsa — xulosa chiqarmaymiz
  if (weight < 0.5) return null;
  return Math.round(sum / weight);
}

export type ScoreLevel = "good" | "mid" | "bad" | "none";

export function scoreLevel(score: number | null): ScoreLevel {
  if (score == null) return "none";
  if (score >= 75) return "good";
  if (score >= 55) return "mid";
  return "bad";
}

export const levelColor: Record<ScoreLevel, { text: string; bg: string; stroke: string; bar: string }> = {
  good: { text: "text-emerald-700", bg: "bg-emerald-50", stroke: "#059669", bar: "bg-emerald-500" },
  mid: { text: "text-amber-700", bg: "bg-amber-50", stroke: "#d97706", bar: "bg-amber-500" },
  bad: { text: "text-red-700", bg: "bg-red-50", stroke: "#dc2626", bar: "bg-red-500" },
  none: { text: "text-slate-500", bg: "bg-slate-100", stroke: "#94a3b8", bar: "bg-slate-300" },
};
