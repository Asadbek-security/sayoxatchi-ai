"use client";
import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useI18n, type DictKey } from "@/lib/i18n";
import { levelVar, scoreLevel } from "@/lib/score";
import type { Topic } from "@/lib/types";
import { IconAlert, IconClose, IconInfo, IconStar, LogoMark, topicIcon } from "./icons";

export function cn(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

export const EASE = [0.22, 1, 0.36, 1] as const;

/* ---------- Shisha ---------- */
type GlassProps = React.HTMLAttributes<HTMLDivElement> & {
  level?: 1 | 2 | 3;
  solid?: boolean;
  sheen?: boolean;
  as?: "div" | "section" | "article" | "aside";
};
export function Glass({ level = 2, solid, sheen, as: Tag = "div", className, ...p }: GlassProps) {
  return <Tag {...p} className={cn("glass", `g${level}`, solid && "glass-solid", sheen && "sheen", className)} />;
}

/** Panel paydo bo‘lishi: blur 0 → qiymat, opacity, y +12 → 0 */
export function Condense({ children, i = 0, className }: { children: React.ReactNode; i?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, ease: EASE, delay: i * 0.06 }}
    >
      {children}
    </motion.div>
  );
}

/* ---------- Tugmalar ---------- */
type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "liquid" | "glass" | "ghost" | "danger"; size?: "sm" | "md" | "lg" };
const btnBase = "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition select-none disabled:cursor-not-allowed disabled:opacity-60";
const btnSize = { sm: "h-9 px-3.5 text-[13px]", md: "h-11 px-5 text-sm", lg: "h-14 px-7 text-[15px]" };
const btnVar = {
  liquid: "btn-liquid",
  glass: "glass g1 glass-hover text-hi hover:-translate-y-px",
  ghost: "text-mid hover:text-hi hover:bg-[color:var(--glass-top)]",
  danger: "glass g1 text-bad hover:-translate-y-px",
};
export function Button({ variant = "liquid", size = "md", className, ...p }: BtnProps) {
  return <button {...p} className={cn(btnBase, btnSize[size], btnVar[variant], className)} />;
}
export function ButtonLink({ variant = "liquid", size = "md", className, ...p }: React.ComponentProps<typeof Link> & { variant?: BtnProps["variant"]; size?: BtnProps["size"] }) {
  return <Link {...p} className={cn(btnBase, btnSize[size], btnVar[variant], className)} />;
}

/* ---------- Kiritish ---------- */
export const fieldCls =
  "h-12 w-full rounded-2xl border border-line bg-[color:var(--glass-bottom)] px-4 text-[15px] text-hi outline-none transition placeholder:text-low focus:border-[color:var(--mint)] focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--mint)_15%,transparent)]";

export function Field({ label, error, children, hint }: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-hi">{label}</span>
      {children}
      {error ? <span role="alert" className="mt-1.5 flex items-center gap-1 text-xs font-medium text-bad"><IconAlert size={16} /> {error}</span>
        : hint ? <span className="mt-1.5 block text-xs text-low">{hint}</span> : null}
    </label>
  );
}

export function Select({ className, ...p }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <span className={cn("relative block", className)}>
      <select {...p} className={cn(fieldCls, "appearance-none pr-10 [&>option]:bg-[color:var(--bg-1)]")} />
      <svg className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-low" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 9l6 6 6-6" /></svg>
    </span>
  );
}

/* ---------- Chip / Badge ---------- */
export function Chip({ active, className, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      {...p}
      aria-pressed={active}
      className={cn(
        "inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-medium transition",
        active ? "bg-[color:var(--jade)] text-on-jade shadow-[0_6px_20px_-8px_var(--jade)]" : "glass g1 text-mid hover:text-hi",
        className,
      )}
    />
  );
}

export function TopicChip({ topic, tone = "neutral" }: { topic: Topic; tone?: "good" | "bad" | "neutral" }) {
  const { t } = useI18n();
  const Icon = topicIcon[topic];
  const tones = {
    good: "text-good bg-[color:color-mix(in_srgb,var(--score-high)_12%,transparent)]",
    bad: "text-bad bg-[color:color-mix(in_srgb,var(--score-low)_12%,transparent)]",
    neutral: "text-mid bg-[color:var(--glass-top)]",
  };
  return (
    <span className={cn("inline-flex h-7 items-center gap-1 rounded-full pl-1.5 pr-2.5 text-xs font-medium", tones[tone])}>
      <Icon size={16} /> {t(`topic.${topic}` as DictKey)}
    </span>
  );
}

const levelKey = { good: "score.good", mid: "score.mid", bad: "score.bad", none: "score.none" } as const;

/** Kichik orb-badge (kartochkalar uchun) */
export function ScoreBadge({ score, size = 52 }: { score: number | null; size?: number }) {
  const lvl = scoreLevel(score);
  const pct = score ?? 0;
  const id = useId();
  return (
    <span className="relative inline-grid shrink-0 place-items-center" style={{ width: size, height: size }} title={`Trust Score ${score ?? "—"}`}>
      <svg viewBox="0 0 40 40" className="absolute inset-0 size-full" aria-hidden>
        <defs>
          <clipPath id={`c${id}`}><circle cx="20" cy="20" r="17" /></clipPath>
        </defs>
        <circle cx="20" cy="20" r="18.5" fill="rgba(3,17,13,.55)" stroke="rgba(255,255,255,.35)" strokeWidth="1" />
        <rect clipPath={`url(#c${id})`} x="0" y={3 + 34 * (1 - pct / 100)} width="40" height="40" fill={levelVar[lvl]} opacity=".85" />
        <ellipse cx="14" cy="11" rx="6" ry="3" fill="#fff" opacity=".25" />
      </svg>
      <span className="num relative text-[15px] text-white drop-shadow-[0_1px_2px_rgba(0,0,0,.6)]">{score ?? "—"}</span>
    </span>
  );
}

export function LevelLabel({ score, className }: { score: number | null; className?: string }) {
  const { t } = useI18n();
  const lvl = scoreLevel(score);
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold", className)} style={{ color: levelVar[lvl] }}>
      <span className="size-2 rounded-full" style={{ background: levelVar[lvl] }} />
      {t(levelKey[lvl])}
    </span>
  );
}

export function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex text-[color:var(--score-mid)]" role="img" aria-label={`${value} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= Math.round(value) ? "" : "opacity-30"}><IconStar size={size} filled={i <= Math.round(value)} /></span>
      ))}
    </span>
  );
}

/* ---------- Tooltip ---------- */
export function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <span className="relative inline-flex" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}>
      <span tabIndex={0} aria-describedby={id} className="inline-flex rounded-full">{children}</span>
      <AnimatePresence>
        {open && (
          <motion.span
            id={id}
            role="tooltip"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.16, ease: EASE }}
            className="glass g1 glass-solid absolute bottom-full left-1/2 z-50 mb-2 w-max max-w-64 -translate-x-1/2 rounded-xl! px-3 py-2 text-xs font-medium text-hi"
          >
            {text}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

/* ---------- Segmentlangan tablar ---------- */
export function Segmented<T extends string>({ value, onChange, options, label, className }: {
  value: T; onChange: (v: T) => void; options: { value: T; label: React.ReactNode }[]; label: string; className?: string;
}) {
  const id = useId();
  return (
    <div role="tablist" aria-label={label} className={cn("glass g1 inline-flex rounded-full p-1", className)}>
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn("relative h-9 rounded-full px-3.5 text-[13px] font-semibold transition", value === o.value ? "text-on-jade" : "text-mid hover:text-hi")}
        >
          {value === o.value && (
            <motion.span layoutId={`seg-${id}`} className="absolute inset-0 rounded-full bg-[color:var(--jade)]" transition={{ type: "spring", stiffness: 260, damping: 26 }} />
          )}
          <span className="relative">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ---------- Bottom sheet (mobil) ---------- */
export function BottomSheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  const { t } = useI18n();
  useEffect(() => {
    if (!open) return;
    const on = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", on);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", on); document.body.style.overflow = ""; };
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label={title}>
          <motion.button aria-label={t("common.close")} className="absolute inset-0 bg-black/50" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.div
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, i) => { if (i.offset.y > 120) onClose(); }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className="glass g3 glass-solid absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-b-none! rounded-t-[32px]! px-5 pb-[calc(env(safe-area-inset-bottom)+24px)] pt-3 [--r:32px]"
          >
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-[color:var(--text-low)]" />
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold">{title}</h2>
              <button onClick={onClose} aria-label={t("common.close")} className="grid size-11 place-items-center rounded-full text-mid hover:text-hi"><IconClose size={20} /></button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ---------- Holatlar ---------- */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-3xl", className)} />;
}

export function EmptyState({ icon, text, action }: { icon: React.ReactNode; text: string; action?: React.ReactNode }) {
  return (
    <Glass className="dash-empty flex flex-col items-center gap-4 px-6 py-14 text-center">
      <span className="grid size-16 place-items-center rounded-2xl bg-[color:var(--glass-top)] text-mint">{icon}</span>
      <p className="max-w-sm text-mid">{text}</p>
      {action}
    </Glass>
  );
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  const { t } = useI18n();
  return (
    <Glass className="flex flex-col items-center gap-4 px-6 py-14 text-center">
      <span className="grid size-16 place-items-center rounded-2xl text-bad" style={{ background: "color-mix(in srgb, var(--score-low) 14%, transparent)" }}><IconAlert size={32} /></span>
      <p className="max-w-sm text-mid">{t("resort.errorLoad")}</p>
      <Button variant="glass" onClick={onRetry}>{t("resort.retry")}</Button>
    </Glass>
  );
}

export function Disclaimer({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <p className={cn("flex items-start gap-2 text-xs leading-relaxed text-low", className)}>
      <IconInfo size={16} className="mt-px text-mint" /> {t("home.disclaimer")}
    </p>
  );
}

export function SectionTitle({ icon, children, action, sub }: { icon?: React.ReactNode; children: React.ReactNode; action?: React.ReactNode; sub?: string }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="flex items-center gap-2.5 font-display text-[22px] font-bold leading-tight md:text-[26px]">
          {icon && <span className="text-mint">{icon}</span>}
          {children}
        </h2>
        {sub && <p className="mt-1 text-sm text-low">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 rounded-full pr-1" aria-label="SAYOXATCHI AI">
      <LogoMark size={36} />
      <span className="whitespace-nowrap font-display text-[17px] font-extrabold tracking-tight text-hi">
        SAYOXATCHI <span className="text-mint">AI</span>
      </span>
    </Link>
  );
}

/** Kichik sparkline (admin KPI) */
export function Sparkline({ data, color = "var(--mint)" }: { data: number[]; color?: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 100},${28 - ((v - min) / (max - min || 1)) * 24}`).join(" ");
  return (
    <svg viewBox="0 0 100 30" className="h-8 w-full" preserveAspectRatio="none" aria-hidden>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}
