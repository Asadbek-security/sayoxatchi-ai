// Backend bilan aloqa qatlami. Endpointlar TZ 9-bo‘limiga mos.
// NEXT_PUBLIC_API_URL berilmagan bo‘lsa, demo (mock) ma’lumotlar qaytariladi.
// Backend dasturchisi: faqat shu faylni o‘zgartirish yetarli.
import { analyses, jobs, resorts, reviews, users } from "./mock-data";
import { computeTrustScore, METRIC_KEYS } from "./score";
import type { AiAnalysis, AnalysisJob, ImageCompareResult, LocationType, Resort, Review, Topic, TopicBalance, User } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}/api/v1${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

const withScore = (r: Resort): Resort => {
  const a = analyses.find((x) => x.resort_id === r.id);
  return { ...r, trust_score: a ? computeTrustScore(a) : null };
};

export interface SearchParams {
  q?: string;
  region?: string;
  district?: string;
  minScore?: number;
  minRating?: number;
  location?: LocationType | "";
  sort?: "score" | "rating" | "price";
}

// GET /api/v1/search
export async function searchResorts(p: SearchParams = {}): Promise<Resort[]> {
  if (API_URL) return http(`/search?${new URLSearchParams(p as Record<string, string>)}`);
  await delay();
  const q = p.q?.trim().toLowerCase() ?? "";
  let list = resorts.map(withScore).filter((r) =>
    !q || [r.name, r.region, r.district, r.address].some((s) => s.toLowerCase().includes(q)),
  );
  if (p.region) list = list.filter((r) => r.region === p.region);
  if (p.district) list = list.filter((r) => r.district === p.district);
  if (p.minScore) list = list.filter((r) => (r.trust_score ?? 0) >= p.minScore!);
  if (p.minRating) list = list.filter((r) => r.rating >= p.minRating!);
  if (p.location) list = list.filter((r) => r.locations.includes(p.location as LocationType));
  const sorters = {
    score: (a: Resort, b: Resort) => (b.trust_score ?? -1) - (a.trust_score ?? -1),
    rating: (a: Resort, b: Resort) => b.rating - a.rating,
    price: (a: Resort, b: Resort) => a.price_from - b.price_from,
  };
  return list.sort(sorters[p.sort ?? "score"]);
}

export const regions = () => Array.from(new Set(resorts.map((r) => r.region)));
export const districts = (region?: string) =>
  Array.from(new Set(resorts.filter((r) => !region || r.region === region).map((r) => r.district)));

export const LOCATION_TYPES: LocationType[] = ["mountain", "snow", "green", "water"];

/** Mashhur hududlar (bosh sahifadagi chiplar) */
export const popularAreas = ["Chorvoq", "Chimyon", "Zomin", "Bo‘stonliq", "Samarqand", "Farg‘ona"];

// GET /api/v1/resorts/{id}
export async function getResort(id: string): Promise<Resort | null> {
  if (API_URL) return http(`/resorts/${id}`);
  await delay(150);
  const r = resorts.find((x) => x.id === id);
  return r ? withScore(r) : null;
}

/** Bir nechta maskan (solishtirish, saqlanganlar, yaqinda ko‘rilganlar) */
export async function getResortsByIds(ids: string[]): Promise<Resort[]> {
  const list = await Promise.all(ids.map(getResort));
  return list.filter((r): r is Resort => !!r);
}

// GET /api/v1/resorts/{id}/reviews
export async function getReviews(id: string): Promise<Review[]> {
  if (API_URL) return http(`/resorts/${id}/reviews`);
  await delay(150);
  return reviews.filter((r) => r.resort_id === id);
}

// POST /api/v1/resorts/{id}/reviews
export async function addReview(id: string, data: { rating: number; text: string; date: string }): Promise<{ ok: true }> {
  if (API_URL) return http(`/resorts/${id}/reviews`, { method: "POST", body: JSON.stringify(data) });
  await delay(600);
  return { ok: true };
}

// Demo: oldingi tahlil — joriy ko‘rsatkichlardan barqaror farq bilan yasaladi
const DRIFT = [-6, 4, -3, 5, -2, 7, -4];
function withPrevious(a: AiAnalysis): AiAnalysis {
  const metrics = Object.fromEntries(
    METRIC_KEYS.map((k, i) => [k, a[k] == null ? null : Math.max(0, Math.min(100, a[k]! + DRIFT[i]))]),
  ) as Record<(typeof METRIC_KEYS)[number], number | null>;
  return {
    ...a,
    overall: computeTrustScore(a),
    previous: { overall: computeTrustScore(metrics), updated_at: "2026-09-24T09:00:00Z", metrics },
  };
}

// GET /api/v1/resorts/{id}/analysis
export async function getAnalysis(id: string): Promise<AiAnalysis | null> {
  if (API_URL) return http(`/resorts/${id}/analysis`);
  await delay(200);
  const a = analyses.find((x) => x.resort_id === id);
  return a ? withPrevious(a) : null;
}

/** Mavzular balansi: ijobiy (o‘ngga) va salbiy (chapga) eslatmalar soni */
export async function getTopicBalance(id: string): Promise<TopicBalance[]> {
  await delay(150);
  const list = reviews.filter((r) => r.resort_id === id);
  if (list.length >= 10) {
    const map = new Map<Topic, TopicBalance>();
    for (const r of list) {
      for (const t of r.topics) {
        if (t === "other") continue;
        const row = map.get(t) ?? { topic: t, positive: 0, negative: 0 };
        if (r.sentiment === "positive") row.positive++;
        else if (r.sentiment === "negative") row.negative++;
        map.set(t, row);
      }
    }
    return [...map.values()].sort((a, b) => b.positive + b.negative - (a.positive + a.negative));
  }
  // Sharhlar kam — tahlil ko‘rsatkichlaridan taxminiy balans
  const a = analyses.find((x) => x.resort_id === id);
  if (!a || a.overall == null) return [];
  const scale = a.analyzed_reviews / 8;
  const pairs: [Topic, number | null][] = [["cleanliness", a.cleanliness], ["food", a.food], ["service", a.service], ["staff", a.staff], ["price", a.price]];
  return pairs.filter(([, v]) => v != null).map(([topic, v]) => ({
    topic,
    positive: Math.round((v! / 100) * scale),
    negative: Math.round(((100 - v!) / 100) * scale),
  }));
}

export const ANALYSIS_STEPS = ["queued", "sentiment", "topics", "suspicious", "summary"] as const;
export type AnalysisStep = (typeof ANALYSIS_STEPS)[number];

// POST /api/v1/resorts/{id}/analyze — keyin GET /analysis_jobs/{id} bilan holatini kuzatish
export async function startAnalysis(id: string, onStep?: (step: AnalysisStep, progress: number) => void): Promise<AnalysisJob> {
  if (API_URL) return http(`/resorts/${id}/analyze`, { method: "POST" });
  for (let i = 0; i < ANALYSIS_STEPS.length; i++) {
    onStep?.(ANALYSIS_STEPS[i], Math.round((i / ANALYSIS_STEPS.length) * 100));
    await delay(i === 0 ? 400 : 650);
  }
  onStep?.("summary", 100);
  return { id: `j-${Date.now()}`, resort_id: id, status: "done", progress: 100, error: null, started_at: new Date().toISOString(), finished_at: new Date().toISOString() };
}

// POST /api/v1/images/upload + /api/v1/images/compare
export async function compareImages(ad: File, real: File): Promise<ImageCompareResult> {
  if (API_URL) {
    const fd = new FormData();
    fd.append("ad", ad);
    fd.append("real", real);
    const res = await fetch(`${API_URL}/api/v1/images/compare`, { method: "POST", body: fd });
    if (!res.ok) throw new Error(`API ${res.status}`);
    return res.json();
  }
  await delay(1600);
  return {
    match_percent: 69,
    differences: [
      { label: { uz: "Basseyn reklamada kattaroq ko‘rinadi", ru: "Бассейн на рекламе выглядит больше" }, severity: "high", ad: { x: 48, y: 82 }, real: { x: 35, y: 82 } },
      { label: { uz: "Osmon va ranglar kuchaytirilgan", ru: "Небо и цвета усилены" }, severity: "medium", ad: { x: 25, y: 22 }, real: { x: 25, y: 22 } },
      { label: { uz: "Bino oynalari va tom rangi o‘chgan", ru: "Окна и крыша здания выцвели" }, severity: "medium", ad: { x: 77, y: 48 }, real: { x: 77, y: 48 } },
      { label: { uz: "Hovlidagi o‘t-o‘lan quruqroq", ru: "Газон во дворе суше" }, severity: "low", ad: { x: 15, y: 68 }, real: { x: 15, y: 68 } },
    ],
    note: {
      uz: "Faqat ko‘rinadigan farqlar qayd etildi. Bu ekspert xulosasi emas — AI indikatori.",
      ru: "Отмечены только видимые различия. Это не экспертное заключение, а индикатор AI.",
    },
  };
}

// --- Admin ---
export async function adminStats() {
  await delay(150);
  return {
    resorts: resorts.length,
    reviews: resorts.reduce((s, r) => s + r.review_count, 0),
    analyses: analyses.length,
    errors: jobs.filter((j) => j.status === "failed").length,
    suspicious: reviews.filter((r) => r.fake_probability >= 60).length,
    // so‘nggi 7 kun — sparkline uchun
    trend: {
      resorts: [5, 5, 6, 6, 7, 7, 8],
      reviews: [150, 162, 171, 186, 199, 214, 228],
      analyses: [3, 4, 4, 5, 6, 7, 8],
      errors: [0, 1, 0, 2, 1, 0, 1],
    },
  };
}
export async function adminJobs(): Promise<AnalysisJob[]> { await delay(150); return jobs; }
export async function adminUsers(): Promise<User[]> { await delay(150); return users; }
export async function adminReviews(): Promise<Review[]> {
  await delay(150);
  return [...reviews].sort((a, b) => b.fake_probability - a.fake_probability);
}
