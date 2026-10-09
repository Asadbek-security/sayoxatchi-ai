"use client";
import Link from "next/link";
import { AlertTriangle, ChevronRight, Info, MapPin, Star, Trees } from "lucide-react";
import { useI18n, type DictKey } from "@/lib/i18n";
import { levelColor, scoreLevel } from "@/lib/score";
import type { Resort, Topic } from "@/lib/types";

export function cn(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2 font-extrabold tracking-tight">
      <span className="grid size-9 place-items-center rounded-xl bg-brand-600 text-white shadow-sm">
        <Trees className="size-5" />
      </span>
      <span className={cn("text-lg", light ? "text-white" : "text-brand-900")}>
        SAYOXATCHI <span className="text-brand-500">AI</span>
      </span>
    </Link>
  );
}

const levelKey = { good: "score.good", mid: "score.mid", bad: "score.bad", none: "score.none" } as const;

/** Katta doira ko'rinishidagi Trust Score */
export function ScoreRing({ score, size = 120 }: { score: number | null; size?: number }) {
  const { t } = useI18n();
  const lvl = scoreLevel(score);
  const r = 44;
  const c = 2 * Math.PI * r;
  const pct = score ?? 0;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" className="size-full -rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" stroke="#e2efe7" strokeWidth="9" />
          <circle cx="50" cy="50" r={r} fill="none" stroke={levelColor[lvl].stroke} strokeWidth="9" strokeLinecap="round"
            strokeDasharray={c} strokeDashoffset={c - (c * pct) / 100} className="transition-[stroke-dashoffset] duration-700" />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <div className={cn("font-extrabold leading-none", levelColor[lvl].text)} style={{ fontSize: size * 0.3 }}>
              {score ?? "—"}
            </div>
            <div className="text-[11px] font-medium text-slate-500">/ 100</div>
          </div>
        </div>
      </div>
      <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", levelColor[lvl].bg, levelColor[lvl].text)}>
        {t(levelKey[lvl])}
      </span>
    </div>
  );
}

/** Kichik score belgisi (kartochkalar uchun) */
export function ScorePill({ score }: { score: number | null }) {
  const lvl = scoreLevel(score);
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-bold", levelColor[lvl].bg, levelColor[lvl].text)}>
      {score ?? "—"}
      <span className="text-[10px] font-medium opacity-70">/100</span>
    </span>
  );
}

export function MetricBar({ label, value }: { label: string; value: number | null }) {
  const { t } = useI18n();
  const lvl = scoreLevel(value);
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className={cn("font-bold", levelColor[lvl].text)}>{value ?? t("metric.noData")}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-brand-50">
        <div className={cn("h-full rounded-full transition-[width] duration-700", levelColor[lvl].bar)} style={{ width: `${value ?? 0}%` }} />
      </div>
    </div>
  );
}

export function Stars({ value, size = "size-4" }: { value: number; size?: string }) {
  return (
    <span className="inline-flex" aria-label={`${value} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={cn(size, i <= Math.round(value) ? "fill-amber-400 text-amber-400" : "text-slate-300")} />
      ))}
    </span>
  );
}

export function TopicChip({ topic, tone = "neutral" }: { topic: Topic; tone?: "good" | "bad" | "neutral" }) {
  const { t } = useI18n();
  const tones = {
    good: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    bad: "bg-red-50 text-red-700 ring-red-200",
    neutral: "bg-slate-50 text-slate-600 ring-slate-200",
  };
  return <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium ring-1", tones[tone])}>{t(`topic.${topic}` as DictKey)}</span>;
}

/** Rasm o'rniga yashil gradient muqova */
export function Cover({ gradient, className, children }: { gradient: string; className?: string; children?: React.ReactNode }) {
  return (
    <div className={cn("relative overflow-hidden bg-gradient-to-br", gradient, className)}>
      <svg viewBox="0 0 400 200" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-2/3 w-full opacity-30" aria-hidden>
        <path d="M0 200 L0 120 L70 60 L130 110 L200 30 L270 100 L330 70 L400 120 L400 200 Z" fill="white" />
        <path d="M0 200 L0 160 L90 120 L170 150 L260 110 L340 150 L400 140 L400 200 Z" fill="white" opacity="0.6" />
      </svg>
      {children}
    </div>
  );
}

export function ResortCard({ r }: { r: Resort }) {
  const { t } = useI18n();
  return (
    <Link href={`/resort/${r.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Cover gradient={r.cover} className="h-32">
        <div className="absolute right-3 top-3"><ScorePill score={r.trust_score} /></div>
      </Cover>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-bold text-brand-950">{r.name}</h3>
        <p className="flex items-center gap-1 text-sm text-slate-500">
          <MapPin className="size-3.5" /> {r.region}, {r.district}
        </p>
        <div className="flex items-center gap-2 text-sm">
          <Stars value={r.rating} />
          <span className="font-semibold">{r.rating}</span>
          <span className="text-slate-400">· {r.review_count} {t("card.reviews")}</span>
        </div>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          {r.main_problem ? (
            <span className="flex items-center gap-1 text-xs text-amber-700">
              <AlertTriangle className="size-3.5" /> {t("card.mainProblem")}: <b>{t(`topic.${r.main_problem}` as DictKey)}</b>
            </span>
          ) : (
            <span className="text-xs text-slate-400">{t("score.none")}</span>
          )}
          <ChevronRight className="size-4 text-brand-400 transition group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
}

export function Disclaimer({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <p className={cn("flex items-start gap-2 rounded-xl bg-brand-50 p-3 text-xs text-brand-800", className)}>
      <Info className="mt-0.5 size-4 shrink-0" /> {t("home.disclaimer")}
    </p>
  );
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <section className={cn("rounded-2xl border border-brand-100 bg-white p-5 shadow-sm", className)}>{children}</section>;
}

export function Button({ variant = "primary", className, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" }) {
  const v = {
    primary: "bg-brand-600 text-white hover:bg-brand-700 disabled:bg-brand-300",
    ghost: "bg-white text-brand-700 ring-1 ring-brand-200 hover:bg-brand-50",
    danger: "bg-white text-red-600 ring-1 ring-red-200 hover:bg-red-50",
  };
  return <button {...p} className={cn("inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed", v[variant], className)} />;
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-brand-100/60", className)} />;
}

export const inputCls = "w-full rounded-xl border border-brand-200 bg-white px-3.5 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100";
