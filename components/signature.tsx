"use client";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";
import { useI18n, type DictKey } from "@/lib/i18n";
import { levelVar, scoreLevel, WEIGHTS, type MetricKey } from "@/lib/score";
import { useCompare } from "@/lib/store";
import type { AnalysisStep } from "@/lib/api";
import type { AiAnalysis, Resort, Review, Scene as SceneT, TopicBalance } from "@/lib/types";
import {
  IconAlert, IconArrowRight, IconCheck, IconCompareResorts, IconLocation, IconSuspicious, metricIcon, topicIcon,
} from "./icons";
import { cn, EASE, Glass, ScoreBadge, Stars, TopicChip, Tooltip } from "./ui";

/* ============================================================
   Skor rangini ravon aralashtirish: marjon → sariq → yashil → jade
   ============================================================ */
const STOPS: [number, [number, number, number]][] = [
  [0, [255, 111, 97]], [40, [255, 194, 75]], [70, [91, 227, 138]], [100, [22, 199, 154]],
];
export function scoreRgb(score: number | null, light = 0): string {
  if (score == null) return "rgb(92,122,112)";
  let a = STOPS[0], b = STOPS[STOPS.length - 1];
  for (let i = 0; i < STOPS.length - 1; i++) if (score >= STOPS[i][0] && score <= STOPS[i + 1][0]) { a = STOPS[i]; b = STOPS[i + 1]; break; }
  const k = (score - a[0]) / (b[0] - a[0] || 1);
  const c = a[1].map((v, i) => Math.round(v + (b[1][i] - v) * k + (255 - v) * light));
  return `rgb(${c.join(",")})`;
}

function useCountUp(target: number | null, ms = 1200) {
  const reduce = useReducedMotion();
  const [v, setV] = useState(0);
  useEffect(() => {
    if (target == null) return;
    if (reduce) { setV(target); return; }
    let raf = 0;
    const t0 = performance.now();
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / ms);
      setV(Math.round(target * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, ms, reduce]);
  return v;
}

/* ============================================================
   Trust Orb — suyuqlik darajasi = skor
   ============================================================ */
export function TrustOrb({ score, size = 240, confidence, caption }: {
  score: number | null; size?: number; confidence?: AiAnalysis["confidence"]; caption?: string;
}) {
  const { t } = useI18n();
  const id = useId().replace(/:/g, "");
  const reduce = useReducedMotion();
  const shown = useCountUp(score);
  const pct = score ?? 0;
  const level = 182 - 164 * (pct / 100);
  const c1 = scoreRgb(score, 0.25);
  const c2 = scoreRgb(score);
  const wave = "M0 0 Q 25 -7 50 0 T 100 0 T 150 0 T 200 0 T 250 0 T 300 0 T 350 0 T 400 0 V 220 H 0 Z";
  const lowConf = confidence === "low" || score == null;

  return (
    <figure className="flex flex-col items-center gap-3" aria-label={`Trust Score: ${score ?? t("score.none")}`}>
      <div className="relative" style={{ width: size, height: size }}>
        {/* yumshoq shu’la */}
        <div className="absolute inset-[8%] rounded-full blur-2xl" style={{ background: c2, opacity: 0.28 }} />
        <svg viewBox="0 0 200 200" className="relative size-full overflow-visible">
          <defs>
            <clipPath id={`clip${id}`}><circle cx="100" cy="100" r="86" /></clipPath>
            <radialGradient id={`body${id}`} cx="35%" cy="28%" r="80%">
              <stop offset="0" stopColor="#fff" stopOpacity=".2" />
              <stop offset=".55" stopColor="#dffbef" stopOpacity=".05" />
              <stop offset="1" stopColor="#03110d" stopOpacity=".35" />
            </radialGradient>
            <linearGradient id={`liq${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={c1} />
              <stop offset="1" stopColor={c2} stopOpacity=".95" />
            </linearGradient>
            <linearGradient id={`rim${id}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#fff" stopOpacity=".75" />
              <stop offset=".45" stopColor="#8BF5D0" stopOpacity=".25" />
              <stop offset=".8" stopColor="#4FD8E8" stopOpacity=".45" />
              <stop offset="1" stopColor="#B9B3FF" stopOpacity=".35" />
            </linearGradient>
            <filter id={`refr${id}`}>
              <feTurbulence type="fractalNoise" baseFrequency=".012 .03" numOctaves="2" seed="3" />
              <feDisplacementMap in="SourceGraphic" scale="6" />
            </filter>
          </defs>

          <circle cx="100" cy="100" r="92" fill="rgba(3,17,13,.45)" />
          <g clipPath={`url(#clip${id})`} filter={`url(#refr${id})`}>
            <motion.g
              initial={{ y: reduce ? level : 200 }}
              animate={{ y: level }}
              transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 60, damping: 14, mass: 1.2 }}
            >
              <g className="wave-slow" style={{ opacity: 0.55 }}>
                <path d={wave} fill={c2} transform="translate(0 4)" />
              </g>
              <g className="wave">
                <path d={wave} fill={`url(#liq${id})`} />
              </g>
              {/* menisk yaltirashi */}
              <rect x="20" y="-1.5" width="160" height="3" rx="1.5" fill="#fff" opacity=".35" />
            </motion.g>
          </g>
          <circle cx="100" cy="100" r="92" fill={`url(#body${id})`} />
          <circle cx="100" cy="100" r="91.5" fill="none" stroke={`url(#rim${id})`} strokeWidth="2" />
          <ellipse cx="70" cy="52" rx="34" ry="16" transform="rotate(-28 70 52)" fill="#fff" opacity=".2" />
          <ellipse cx="140" cy="160" rx="22" ry="6" transform="rotate(-30 140 160)" fill="#fff" opacity=".08" />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <div className="num leading-none text-white drop-shadow-[0_2px_10px_rgba(0,0,0,.45)]" style={{ fontSize: size * 0.3 }}>
              {score == null ? "—" : shown}
            </div>
            <div className="mt-1 text-xs font-semibold tracking-wide text-white/80">/ 100</div>
          </div>
        </div>
      </div>
      <figcaption className="flex flex-col items-center gap-1 text-center">
        {confidence && (
          <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", lowConf ? "text-warn" : "text-mid")}
            style={{ background: lowConf ? "color-mix(in srgb, var(--score-mid) 14%, transparent)" : "var(--glass-top)" }}>
            {t("score.confidence")}: {t(`conf.${confidence}` as DictKey)}
          </span>
        )}
        {caption && <span className="text-xs text-low">{caption}</span>}
      </figcaption>
    </figure>
  );
}

/* ============================================================
   Suyuq naycha — 7 ko‘rsatkichdan biri
   ============================================================ */
export function LiquidTube({ k, value, i = 0 }: { k: MetricKey; value: number | null; i?: number }) {
  const { t } = useI18n();
  const Icon = metricIcon[k];
  const color = scoreRgb(value);
  return (
    <div>
      <div className="mb-2 flex items-center gap-2.5">
        <span className="grid size-8 place-items-center rounded-xl bg-[color:var(--glass-top)] text-mint"><Icon size={20} /></span>
        <span className="text-[15px] font-medium text-hi">{t(`metric.${k}` as DictKey)}</span>
        <span className="text-xs text-low">{Math.round(WEIGHTS[k] * 100)}%</span>
        <span className={cn("ml-auto", value == null ? "text-xs font-medium text-low" : "num text-lg")} style={value == null ? undefined : { color: levelVar[scoreLevel(value)] }}>
          {value ?? t("metric.noData")}
        </span>
      </div>
      <div
        className={cn("relative h-3.5 overflow-hidden rounded-full", value == null && "dash-empty")}
        style={{ background: "color-mix(in srgb, var(--mint) 8%, transparent)", boxShadow: "inset 0 1px 3px rgba(0,0,0,.35), inset 0 -1px 0 rgba(255,255,255,.08)" }}
        role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value ?? undefined} aria-label={t(`metric.${k}` as DictKey)}
      >
        {value != null && (
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ background: `linear-gradient(90deg, ${scoreRgb(value, 0.15)}, ${color})`, boxShadow: `0 0 14px -2px ${color}` }}
            initial={{ width: 0 }}
            whileInView={{ width: `${value}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.1 + i * 0.06 }}
          >
            <span className="absolute inset-x-1.5 top-[3px] h-[3px] rounded-full bg-white/40" />
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   Manzara — rasm o‘rniga chizilgan muqova
   ============================================================ */
function rand(seed: string) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)) >>> 0) / 4294967296;
}
export function Scene({ type, seed, className }: { type: SceneT; seed: string; className?: string }) {
  const r = rand(seed);
  const id = useId().replace(/:/g, "");
  const ridge = (base: number, amp: number, n: number) => {
    const pts = Array.from({ length: n + 1 }, (_, i) => `${(i / n) * 400},${base - r() * amp}`);
    return `M0 220 L${pts.join(" L")} L400 220 Z`;
  };
  const hue = { forest: ["#0b3a2e", "#14614a"], lake: ["#0a3340", "#0f6b6a"], mountains: ["#102e3a", "#1d5a57"], garden: ["#163a2a", "#2b6a45"] }[type];
  return (
    <svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden>
      <defs>
        <linearGradient id={`sky${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#062019" />
          <stop offset=".65" stopColor={hue[1]} />
          <stop offset="1" stopColor="#8bf5d0" stopOpacity=".55" />
        </linearGradient>
      </defs>
      <rect width="400" height="220" fill={`url(#sky${id})`} />
      <circle cx={60 + r() * 280} cy={34 + r() * 20} r="11" fill="#dffbef" opacity=".85" />
      {Array.from({ length: 14 }, (_, i) => <circle key={i} cx={r() * 400} cy={r() * 80} r={r() * 0.9 + 0.3} fill="#fff" opacity={0.3 + r() * 0.5} />)}
      <path d={ridge(110, 50, 7)} fill={hue[1]} opacity=".55" />
      <path d={ridge(140, 40, 9)} fill={hue[0]} opacity=".85" />
      {type === "lake" && (
        <>
          <rect y="150" width="400" height="70" fill="#0c4a52" />
          {Array.from({ length: 6 }, (_, i) => <rect key={i} x={40 + r() * 300} y={160 + i * 9} width={30 + r() * 60} height="1.5" rx=".75" fill="#8bf5d0" opacity=".25" />)}
        </>
      )}
      {type === "forest" && Array.from({ length: 18 }, (_, i) => {
        const x = i * 23 + r() * 10, h = 30 + r() * 26;
        return <path key={i} d={`M${x} 190 L${x + 9} ${190 - h} L${x + 18} 190 Z`} fill="#062019" opacity=".9" />;
      })}
      {type === "garden" && (
        <>
          {Array.from({ length: 9 }, (_, i) => <circle key={i} cx={i * 48 + r() * 20} cy={178 + r() * 10} r={16 + r() * 10} fill="#0a2e24" />)}
          <path d="M285 168 h44 v-18 a22 22 0 0 0 -44 0z" fill="#0a2e24" />
          <path d="M296 150 a11 11 0 0 1 22 0" fill="#1b7a72" />
        </>
      )}
      {type === "mountains" && <path d="M120 150 L175 70 L198 98 L214 82 L270 150 Z" fill="#dffbef" opacity=".12" />}
      <path d={ridge(196, 16, 12)} fill="#03110d" />
      {/* iliq deraza chiroqlari — tizimdagi yagona iliq rang */}
      <rect x={150 + r() * 80} y="182" width="36" height="16" rx="2" fill="#03110d" />
      {Array.from({ length: 4 }, (_, i) => <rect key={i} x={0} y="0" width="3" height="3" rx=".6" fill="#ffc46b" opacity=".9"
        transform={`translate(${158 + i * 7 + r() * 70} ${186 + (i % 2) * 5})`} />)}
    </svg>
  );
}

/* ============================================================
   Maskan kartochkasi
   ============================================================ */
export function ResortCard({ r }: { r: Resort }) {
  const { t } = useI18n();
  const cmp = useCompare();
  const reduce = useReducedMotion();
  const rx = useSpring(useMotionValue(0), { stiffness: 260, damping: 26 });
  const ry = useSpring(useMotionValue(0), { stiffness: 260, damping: 26 });
  const inCmp = cmp.has(r.id);
  return (
    <motion.article
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      onPointerMove={(e) => {
        if (reduce || e.pointerType !== "mouse") return;
        const b = e.currentTarget.getBoundingClientRect();
        ry.set(((e.clientX - b.left) / b.width - 0.5) * 5);
        rx.set(-((e.clientY - b.top) / b.height - 0.5) * 5);
      }}
      onPointerLeave={() => { rx.set(0); ry.set(0); }}
      whileHover={reduce ? undefined : { y: -2 }}
      className="glass g2 glass-hover group flex flex-col overflow-hidden"
    >
      <div className="relative h-44 overflow-hidden rounded-t-[24px]">
        <Scene type={r.cover} seed={r.id} className="absolute inset-0 size-full transition-transform duration-700 group-hover:scale-[1.04]" />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[color:var(--bg-1)]/80 to-transparent" />
        <button
          type="button"
          onClick={() => cmp.toggle(r.id)}
          disabled={!inCmp && cmp.full}
          aria-pressed={inCmp}
          title={!inCmp && cmp.full ? t("vs.max") : undefined}
          className={cn(
            "absolute left-3 top-3 z-10 inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold backdrop-blur-md transition",
            inCmp ? "bg-[color:var(--jade)] text-on-jade" : "bg-black/35 text-white hover:bg-black/50 disabled:opacity-50",
          )}
        >
          {inCmp ? <IconCheck size={16} /> : <IconCompareResorts size={16} />}
          {inCmp ? t("card.compareIn") : t("card.compareAdd")}
        </button>
        <div className="absolute right-3 top-3"><ScoreBadge score={r.trust_score} /></div>
      </div>
      <Link href={`/resort/${r.id}`} className="flex flex-1 flex-col gap-2.5 p-5 pt-4 focus-visible:rounded-b-[24px]">
        <h3 className="font-display text-lg font-bold leading-snug text-hi">{r.name}</h3>
        <p className="flex items-center gap-1.5 text-sm text-mid"><IconLocation size={16} className="text-mint" /> {r.region}, {r.district}</p>
        <div className="flex items-center gap-2 text-sm">
          <Stars value={r.rating} size={16} />
          <span className="num text-[15px]">{r.rating}</span>
          <span className="text-low">· {r.review_count} {t("card.reviews")}</span>
        </div>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          {r.main_problem ? (
            <span className="inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium text-warn" style={{ background: "color-mix(in srgb, var(--score-mid) 13%, transparent)" }}>
              <IconAlert size={16} /> {t(`topic.${r.main_problem}` as DictKey)}
            </span>
          ) : (
            <span className="text-xs text-low">{r.trust_score == null ? t("score.none") : t("card.noProblem")}</span>
          )}
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-mint">{t("card.details")} <IconArrowRight size={16} /></span>
        </div>
      </Link>
    </motion.article>
  );
}

/* ============================================================
   Sharh
   ============================================================ */
export const SUSPICIOUS = 60;
const sentimentStyle = {
  positive: { c: "var(--score-high)", k: "review.positive" },
  neutral: { c: "var(--text-mid)", k: "review.neutral" },
  negative: { c: "var(--score-low)", k: "review.negative" },
} as const;

export function ReviewItem({ r }: { r: Review }) {
  const { t, fmtDate } = useI18n();
  const suspicious = r.fake_probability >= SUSPICIOUS;
  const s = sentimentStyle[r.sentiment];
  return (
    <Glass as="article" level={1} solid className={cn("p-5", suspicious && "dash-amber")}>
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="grid size-10 place-items-center rounded-full bg-[color:var(--glass-top)] font-display text-sm font-bold text-mint">{r.author[0]}</span>
        <div className="min-w-0">
          <p className="font-semibold text-hi">{r.author}</p>
          <p className="text-xs text-low">{fmtDate(r.date)}</p>
        </div>
        <Stars value={r.rating} size={16} />
        <span className="ml-auto inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold" style={{ color: s.c, background: `color-mix(in srgb, ${s.c} 12%, transparent)` }}>
          <span className="size-1.5 rounded-full" style={{ background: s.c }} /> {t(s.k)}
        </span>
      </header>
      <p className={cn("mt-3 max-w-[68ch] leading-relaxed text-hi", suspicious && "text-mid")}>{r.text}</p>
      <footer className="mt-3 flex flex-wrap items-center gap-1.5">
        {r.topics.map((tp) => <TopicChip key={tp} topic={tp} />)}
        <span className="ml-auto">
          {suspicious ? (
            <Tooltip text={t("review.suspiciousHint")}>
              <span className="inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold text-warn" style={{ background: "color-mix(in srgb, var(--score-mid) 13%, transparent)" }}>
                <IconSuspicious size={16} /> {t("review.suspicious")} · {r.fake_probability}%
              </span>
            </Tooltip>
          ) : (
            <span className="inline-flex h-7 items-center gap-1.5 text-xs text-low"><IconCheck size={16} className="text-good" /> {t("review.reliable")} · {r.fake_probability}%</span>
          )}
        </span>
      </footer>
      {suspicious && r.flags.length > 0 && (
        <details className="group mt-3 rounded-2xl bg-[color:var(--glass-bottom)] px-4 py-3 text-sm">
          <summary className="cursor-pointer list-none font-medium text-warn marker:hidden">{t("review.why")} ↓</summary>
          <ul className="mt-2 space-y-1 text-mid">
            {r.flags.map((f) => <li key={f}>• {t(`flag.${f}` as DictKey)}</li>)}
          </ul>
        </details>
      )}
    </Glass>
  );
}

/* ============================================================
   Mavzular balansi — salbiy chapga, ijobiy o‘ngga
   ============================================================ */
export function TopicBalanceChart({ data }: { data: TopicBalance[] }) {
  const { t } = useI18n();
  if (!data.length) return <p className="dash-empty rounded-2xl p-5 text-sm text-low">{t("resort.balanceEmpty")}</p>;
  const max = Math.max(1, ...data.flatMap((d) => [d.positive, d.negative]));
  return (
    <div>
      <div className="mb-3 flex justify-between text-xs font-semibold">
        <span className="text-bad">← {t("resort.balanceNeg")}</span>
        <span className="text-good">{t("resort.balancePos")} →</span>
      </div>
      <ul className="space-y-2.5">
        {data.map((d, i) => {
          const Icon = topicIcon[d.topic];
          return (
            <li key={d.topic} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <div className="flex items-center justify-end gap-2">
                <span className="num text-xs text-bad">{d.negative || ""}</span>
                <motion.span className="h-3 rounded-l-full rounded-r-sm" style={{ background: "linear-gradient(270deg, var(--score-low), color-mix(in srgb, var(--score-low) 55%, transparent))" }}
                  initial={{ width: 0 }} whileInView={{ width: `${(d.negative / max) * 100}%` }} viewport={{ once: true }} transition={{ duration: 0.7, ease: EASE, delay: i * 0.05 }} />
              </div>
              <span className="flex w-28 items-center justify-center gap-1.5 text-center text-xs font-medium text-mid sm:w-32">
                <Icon size={16} className="text-mint" /> {t(`topic.${d.topic}` as DictKey)}
              </span>
              <div className="flex items-center gap-2">
                <motion.span className="h-3 rounded-l-sm rounded-r-full" style={{ background: "linear-gradient(90deg, var(--score-high), color-mix(in srgb, var(--score-high) 55%, transparent))" }}
                  initial={{ width: 0 }} whileInView={{ width: `${(d.positive / max) * 100}%` }} viewport={{ once: true }} transition={{ duration: 0.7, ease: EASE, delay: i * 0.05 }} />
                <span className="num text-xs text-good">{d.positive || ""}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ============================================================
   AI tahlil bosqichlari
   ============================================================ */
export const STEP_KEYS: AnalysisStep[] = ["queued", "sentiment", "topics", "suspicious", "summary"];

export function AnalysisSteps({ step, progress }: { step: AnalysisStep | null; progress: number }) {
  const { t } = useI18n();
  const cur = step ? STEP_KEYS.indexOf(step) : -1;
  const done = progress >= 100;
  return (
    <div aria-live="polite">
      <ol className="mb-3 grid grid-cols-5 gap-1.5">
        {STEP_KEYS.map((s, i) => {
          const state = done || i < cur ? "done" : i === cur ? "now" : "todo";
          return (
            <li key={s} className="flex flex-col items-center gap-1.5 text-center">
              <span className={cn("grid size-8 place-items-center rounded-full text-xs font-bold transition",
                state === "done" && "bg-[color:var(--jade)] text-on-jade",
                state === "now" && "bg-[color:var(--glass-top)] text-mint ring-2 ring-[color:var(--mint)]",
                state === "todo" && "bg-[color:var(--glass-bottom)] text-low")}>
                {state === "done" ? <IconCheck size={16} /> : i + 1}
              </span>
              <span className={cn("text-[11px] font-medium leading-tight", state === "todo" ? "text-low" : "text-hi")}>{t(`step.${s}` as DictKey)}</span>
            </li>
          );
        })}
      </ol>
      <div className="relative h-2.5 overflow-hidden rounded-full bg-[color:var(--glass-bottom)]">
        <motion.div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[color:var(--jade)] to-[color:var(--aqua)]"
          animate={{ width: `${Math.max(4, progress)}%` }} transition={{ duration: 0.4, ease: EASE }} />
      </div>
    </div>
  );
}

/** Ekranga chiqqanda bir marta ishlaydigan hook (lazy) */
export function useInView<T extends Element>() {
  const ref = useRef<T>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); io.disconnect(); } });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, v] as const;
}
