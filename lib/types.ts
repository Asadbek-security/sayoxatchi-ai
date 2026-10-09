// Ma'lumot turlari TZdagi DB sxemasiga mos (11-bo'lim).
// Backend tayyor bo'lgach, API javoblari shu turlarga mos kelishi kerak.

export type Lang = "uz" | "ru";
export type Localized = Record<Lang, string>;

export type Topic =
  | "cleanliness"
  | "food"
  | "service"
  | "staff"
  | "price"
  | "location"
  | "room"
  | "pool"
  | "safety"
  | "other";

export type Sentiment = "positive" | "neutral" | "negative";

export interface Resort {
  id: string;
  name: string;
  region: string;
  district: string;
  address: string;
  lat: number;
  lng: number;
  rating: number; // foydalanuvchi reytingi, 1–5
  trust_score: number | null; // 0–100
  review_count: number;
  price_from: number; // so‘m, bir kecha
  main_problem: Topic | null;
  tags: Topic[];
  cover: Scene; // rasm o‘rniga chizilgan manzara
}

export type Scene = "forest" | "lake" | "mountains" | "garden";

export interface Review {
  id: string;
  resort_id: string;
  author: string;
  rating: number;
  text: string;
  source: "site" | "admin" | "open_api";
  date: string; // ISO
  language: Lang;
  sentiment: Sentiment;
  sentiment_score: number; // 0–1
  fake_probability: number; // 0–100
  topics: Topic[];
  /** Nima uchun shubhali deb belgilangan (hukm emas, faqat indikator) */
  flags: FlagReason[];
}

export type FlagReason = "duplicate" | "burst" | "no_details" | "extreme" | "new_account";

// null = "Ma’lumot yetarli emas"
export interface AiAnalysis {
  resort_id: string;
  reliability: number | null;
  service: number | null;
  cleanliness: number | null;
  food: number | null;
  staff: number | null;
  price: number | null;
  ad_match: number | null;
  overall: number | null;
  confidence: "high" | "medium" | "low";
  summary: Localized;
  strengths: Topic[];
  problems: { topic: Topic; mentions: number }[];
  analyzed_reviews: number;
  updated_at: string;
  /** Oldingi tahlil — "nima o‘zgardi" bloki uchun */
  previous?: { overall: number | null; updated_at: string; metrics: Partial<Record<MetricName, number | null>> };
}

export type MetricName = "reliability" | "service" | "cleanliness" | "food" | "staff" | "price" | "ad_match";

export interface TopicBalance {
  topic: Topic;
  positive: number;
  negative: number;
}

/** Rasm ustidagi nuqta, foizda */
export interface Pin { x: number; y: number }

export interface ImageCompareResult {
  match_percent: number;
  differences: { label: Localized; severity: "low" | "medium" | "high"; ad: Pin; real: Pin }[];
  note: Localized;
}

export type JobStatus = "queued" | "running" | "done" | "failed";

export interface AnalysisJob {
  id: string;
  resort_id: string;
  status: JobStatus;
  progress: number;
  error: string | null;
  started_at: string | null;
  finished_at: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  created_at: string;
  blocked: boolean;
  review_count: number;
}
