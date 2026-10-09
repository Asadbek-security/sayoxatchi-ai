import type { AiAnalysis, MetricName } from "./types";

// TZ 14.4 — Trust Score og‘irliklari
export const WEIGHTS: Record<MetricName, number> = {
  reliability: 0.25,
  service: 0.2,
  cleanliness: 0.15,
  staff: 0.1,
  food: 0.1,
  price: 0.1,
  ad_match: 0.1,
};

export type MetricKey = MetricName;
export const METRIC_KEYS = Object.keys(WEIGHTS) as MetricKey[];

/** Mavjud ko‘rsatkichlar bo‘yicha og‘irliklangan o‘rtacha. Ma’lumot yetarli bo‘lmasa — null. */
export function computeTrustScore(a: Pick<AiAnalysis, MetricKey>): number | null {
  let sum = 0;
  let weight = 0;
  for (const k of METRIC_KEYS) {
    const v = a[k];
    if (v == null) continue;
    sum += v * WEIGHTS[k];
    weight += WEIGHTS[k];
  }
  if (weight < 0.5) return null;
  return Math.round(sum / weight);
}

export type ScoreLevel = "good" | "mid" | "bad" | "none";

/** Rang shkalasi: ≥70 yashil, 40–69 sariq, <40 marjon */
export function scoreLevel(score: number | null): ScoreLevel {
  if (score == null) return "none";
  if (score >= 70) return "good";
  if (score >= 40) return "mid";
  return "bad";
}

export const levelVar: Record<ScoreLevel, string> = {
  good: "var(--score-high)",
  mid: "var(--score-mid)",
  bad: "var(--score-low)",
  none: "var(--text-low)",
};

/** Skor bo‘yicha ravon rang (orb suyuqligi uchun) */
export function liquidColor(score: number | null): [string, string] {
  if (score == null) return ["#5b7a70", "#30463f"];
  if (score >= 70) return ["#7ff0a8", "#16c79a"];
  if (score >= 40) return ["#ffd97a", "#f0a52c"];
  return ["#ff9a8c", "#e2483a"];
}
