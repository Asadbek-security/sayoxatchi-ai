// Backend bilan aloqa qatlami. Endpointlar TZ 9-bo'limiga mos.
// NEXT_PUBLIC_API_URL berilmagan bo'lsa, demo (mock) ma'lumotlar qaytariladi.
// Backend dasturchisi: faqat shu faylni o'zgartirish yetarli.
import { analyses, jobs, resorts, reviews, users } from "./mock-data";
import { computeTrustScore } from "./score";
import type { AiAnalysis, AnalysisJob, ImageCompareResult, Resort, Review, User } from "./types";

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
  minScore?: number;
  sort?: "score" | "rating" | "price";
}

// GET /api/v1/search
export async function searchResorts(p: SearchParams = {}): Promise<Resort[]> {
  if (API_URL) return http(`/search?${new URLSearchParams(p as Record<string, string>)}`);
  await delay();
  const q = p.q?.trim().toLowerCase() ?? "";
  let list = resorts.map(withScore).filter((r) =>
    !q || [r.name, r.region, r.district].some((s) => s.toLowerCase().includes(q)),
  );
  if (p.region) list = list.filter((r) => r.region === p.region);
  if (p.minScore) list = list.filter((r) => (r.trust_score ?? 0) >= p.minScore!);
  const sorters = {
    score: (a: Resort, b: Resort) => (b.trust_score ?? -1) - (a.trust_score ?? -1),
    rating: (a: Resort, b: Resort) => b.rating - a.rating,
    price: (a: Resort, b: Resort) => a.price_from - b.price_from,
  };
  return list.sort(sorters[p.sort ?? "score"]);
}

export const regions = () => Array.from(new Set(resorts.map((r) => r.region)));

// GET /api/v1/resorts/{id}
export async function getResort(id: string): Promise<Resort | null> {
  if (API_URL) return http(`/resorts/${id}`);
  await delay(150);
  const r = resorts.find((x) => x.id === id);
  return r ? withScore(r) : null;
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

// GET /api/v1/resorts/{id}/analysis
export async function getAnalysis(id: string): Promise<AiAnalysis | null> {
  if (API_URL) return http(`/resorts/${id}/analysis`);
  await delay(200);
  const a = analyses.find((x) => x.resort_id === id);
  return a ? { ...a, overall: computeTrustScore(a) } : null;
}

// POST /api/v1/resorts/{id}/analyze
export async function startAnalysis(id: string): Promise<AnalysisJob> {
  if (API_URL) return http(`/resorts/${id}/analyze`, { method: "POST" });
  await delay(1200);
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
  await delay(1800);
  return {
    match_percent: 69,
    differences: [
      { label: { uz: "Basseyn o'lchami reklamada kattaroq ko'rinadi", ru: "Бассейн на рекламе выглядит больше" }, severity: "high" },
      { label: { uz: "Mebel eskirganroq, rangi o'chgan", ru: "Мебель более изношена, цвет выцвел" }, severity: "medium" },
      { label: { uz: "Yorug'lik va ranglar kuchaytirilgan", ru: "Освещение и цвета усилены" }, severity: "low" },
      { label: { uz: "Xona tartibi va jihozlar mos", ru: "Планировка и оснащение совпадают" }, severity: "low" },
    ],
    note: {
      uz: "Faqat ko'rinadigan farqlar qayd etildi. Bu ekspert xulosasi emas, ehtimoliy AI tahlil.",
      ru: "Отмечены только видимые различия. Это не экспертное заключение, а вероятностный AI-анализ.",
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
  };
}
export async function adminJobs(): Promise<AnalysisJob[]> { await delay(150); return jobs; }
export async function adminUsers(): Promise<User[]> { await delay(150); return users; }
export async function adminReviews(): Promise<Review[]> {
  await delay(150);
  return [...reviews].sort((a, b) => b.fake_probability - a.fake_probability);
}
