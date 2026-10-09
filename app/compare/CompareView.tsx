"use client";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { useI18n, type DictKey } from "@/lib/i18n";
import { compareImages, getResort } from "@/lib/api";
import type { ImageCompareResult, Pin } from "@/lib/types";
import { IconAdMatch, IconAnalyze, IconInfo, IconUpload } from "@/components/icons";
import { scoreRgb } from "@/components/signature";
import { Button, cn, EASE, Glass, SectionTitle } from "@/components/ui";

type Slot = { file: File; url: string } | null;
const sevColor = { high: "var(--score-low)", medium: "var(--score-mid)", low: "var(--score-high)" } as const;

export default function CompareView() {
  const { t, l } = useI18n();
  const resortId = useSearchParams().get("resort");
  const [resortName, setResortName] = useState("");
  const [ad, setAd] = useState<Slot>(null);
  const [real, setReal] = useState<Slot>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ImageCompareResult | null>(null);
  const [need, setNeed] = useState(false);
  const [hot, setHot] = useState<number | null>(null);

  useEffect(() => { if (resortId) getResort(resortId).then((r) => setResortName(r?.name ?? "")); }, [resortId]);

  const pick = (set: (s: Slot) => void) => (f?: File) => {
    if (!f || !f.type.startsWith("image/") || f.size > 5 * 1024 * 1024) return;
    set({ file: f, url: URL.createObjectURL(f) });
    setResult(null);
  };
  const demo = () => {
    setAd({ file: new File([], "ad.svg", { type: "image/svg+xml" }), url: "/demo/ad.svg" });
    setReal({ file: new File([], "real.svg", { type: "image/svg+xml" }), url: "/demo/real.svg" });
    setResult(null);
  };
  const run = async () => {
    if (!ad || !real) { setNeed(true); return; }
    setNeed(false);
    setBusy(true);
    setResult(await compareImages(ad.file, real.file));
    setBusy(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-3 font-display text-[34px] font-extrabold leading-tight md:text-5xl">
          <IconAdMatch size={32} active className="text-mint" /> {t("cmp.title")}
        </h1>
        <p className="mt-2 text-lg text-mid">{resortName && <span className="font-semibold text-hi">{resortName} · </span>}{t("cmp.subtitle")}</p>
      </div>

      {!result && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Dropzone label={t("cmp.ad")} slot={ad} onPick={pick(setAd)} />
          <Dropzone label={t("cmp.real")} slot={real} onPick={pick(setReal)} />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {!result ? (
          <>
            <Button size="lg" onClick={run} disabled={busy}>
              <IconAnalyze size={20} className={cn(busy && "animate-spin")} /> {busy ? t("cmp.analyzing") : t("cmp.analyze")}
            </Button>
            <Button variant="glass" size="lg" onClick={demo} disabled={busy}>{t("cmp.demo")}</Button>
            {need && <span role="alert" className="text-sm font-medium text-bad">{t("cmp.need")}</span>}
          </>
        ) : (
          <Button variant="glass" onClick={() => setResult(null)}><IconUpload size={20} /> {t("cmp.change")}</Button>
        )}
      </div>

      {result && ad && real && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} className="space-y-5">
          {/* Desktop: yonma-yon */}
          <div className="hidden gap-4 md:grid md:grid-cols-2">
            <PinnedImage label={t("cmp.ad")} url={ad.url} pins={result.differences.map((d) => d.ad)} hot={hot} />
            <PinnedImage label={t("cmp.real")} url={real.url} pins={result.differences.map((d) => d.real)} hot={hot} />
          </div>
          {/* Mobil: oldin/keyin slayder */}
          <div className="md:hidden"><BeforeAfter ad={ad.url} real={real.url} /></div>

          <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
            <Glass level={3} className="flex flex-col items-center justify-center gap-2 p-6">
              <MatchRing value={result.match_percent} />
              <span className="text-sm font-semibold text-mid">{t("cmp.match")}</span>
            </Glass>
            <Glass solid className="p-6">
              <SectionTitle>{t("cmp.diffs")}</SectionTitle>
              <ol className="space-y-2">
                {result.differences.map((d, i) => (
                  <li key={i} onMouseEnter={() => setHot(i)} onMouseLeave={() => setHot(null)} onFocus={() => setHot(i)} onBlur={() => setHot(null)} tabIndex={0}
                    className={cn("flex items-center gap-3 rounded-2xl p-3 transition", hot === i ? "bg-[color:var(--glass-top)]" : "bg-[color:var(--glass-bottom)]")}>
                    <span className="num grid size-8 shrink-0 place-items-center rounded-full bg-white/90 text-sm text-[#03110d]">{i + 1}</span>
                    <span className="flex-1 text-[15px]">{l(d.label)}</span>
                    <span className="shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold" style={{ color: sevColor[d.severity], background: `color-mix(in srgb, ${sevColor[d.severity]} 13%, transparent)` }}>
                      {t(`cmp.sev.${d.severity}` as DictKey)}
                    </span>
                  </li>
                ))}
              </ol>
              <p className="mt-5 flex items-start gap-2 text-xs text-low"><IconInfo size={16} className="mt-px text-mint" /> {l(result.note)}</p>
            </Glass>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function Dropzone({ label, slot, onPick }: { label: string; slot: Slot; onPick: (f?: File) => void }) {
  const { t } = useI18n();
  const [over, setOver] = useState(false);
  return (
    <label className="group block cursor-pointer"
      onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); onPick(e.dataTransfer.files[0]); }}>
      <span className="mb-2 block text-sm font-semibold">{label}</span>
      <div className={cn("glass g2 relative grid aspect-[4/3] place-items-center overflow-hidden", !slot && "dash-iri", over && "scale-[1.01]")}>
        {slot ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={slot.url} alt={label} className="absolute inset-0 size-full object-cover" />
            <span className="glass g1 absolute bottom-3 right-3 rounded-full! px-3 py-1.5 text-xs font-semibold [--r:999px]">{t("cmp.change")}</span>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 px-6 text-center">
            <span className="grid size-16 place-items-center rounded-2xl bg-[color:var(--glass-top)] text-mint transition group-hover:-translate-y-0.5"><IconUpload size={32} /></span>
            <span className="font-semibold text-hi">{t("cmp.upload")}</span>
            <span className="text-xs text-low">{t("add.photoHint")}</span>
          </div>
        )}
      </div>
      <input type="file" accept="image/jpeg,image/png" className="sr-only" onChange={(e) => onPick(e.target.files?.[0])} />
    </label>
  );
}

function PinnedImage({ label, url, pins, hot }: { label: string; url: string; pins: Pin[]; hot: number | null }) {
  return (
    <figure className="glass g2 overflow-hidden p-2">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[18px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={label} className="absolute inset-0 size-full object-cover" />
        {pins.map((p, i) => (
          <span key={i} className={cn("num glass g1 absolute grid size-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full! text-sm [--r:999px]", hot === i && "pin-pulse scale-110")}
            style={{ left: `${p.x}%`, top: `${p.y}%` }}>{i + 1}</span>
        ))}
      </div>
      <figcaption className="px-2 pb-1 pt-3 text-sm font-semibold text-mid">{label}</figcaption>
    </figure>
  );
}

/** Mobil oldin/keyin slayderi — shisha tutqich, 50% da magnit */
function BeforeAfter({ ad, real }: { ad: string; real: string }) {
  const { t } = useI18n();
  const [pos, setPos] = useState(50);
  const box = useRef<HTMLDivElement>(null);
  const set = (clientX: number) => {
    const b = box.current!.getBoundingClientRect();
    let p = ((clientX - b.left) / b.width) * 100;
    if (Math.abs(p - 50) < 4) p = 50;
    setPos(Math.max(0, Math.min(100, p)));
  };
  return (
    <div className="glass g2 p-2">
      <div ref={box} className="relative aspect-[4/3] touch-none select-none overflow-hidden rounded-[18px]"
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); set(e.clientX); }}
        onPointerMove={(e) => { if (e.buttons) set(e.clientX); }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={real} alt={t("cmp.real")} className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ad} alt={t("cmp.ad")} className="absolute inset-0 size-full object-cover" />
        </div>
        <div className="absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white/90 shadow-[0_0_12px_rgba(255,255,255,.6)]" style={{ left: `${pos}%` }} />
        <div role="slider" aria-label={t("cmp.slider")} aria-valuenow={Math.round(pos)} aria-valuemin={0} aria-valuemax={100} tabIndex={0}
          onKeyDown={(e) => { if (e.key === "ArrowLeft") setPos((p) => Math.max(0, p - 5)); if (e.key === "ArrowRight") setPos((p) => Math.min(100, p + 5)); }}
          className="glass g3 absolute top-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full! [--r:999px]" style={{ left: `${pos}%` }}>
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 7l-5 5 5 5M15 7l5 5-5 5" /></svg>
        </div>
        <span className="glass g1 absolute left-3 top-3 rounded-full! px-3 py-1 text-xs font-semibold [--r:999px]">{t("cmp.ad")}</span>
        <span className="glass g1 absolute right-3 top-3 rounded-full! px-3 py-1 text-xs font-semibold [--r:999px]">{t("cmp.real")}</span>
      </div>
      <p className="px-2 pb-1 pt-3 text-center text-xs text-low">{t("cmp.slider")}</p>
    </div>
  );
}

/** Moslik foizi — to‘ladigan suyuq halqa */
function MatchRing({ value }: { value: number }) {
  const r = 52, c = 2 * Math.PI * r;
  const col = scoreRgb(value);
  return (
    <div className="relative size-40">
      <svg viewBox="0 0 120 120" className="size-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="color-mix(in srgb, var(--mint) 10%, transparent)" strokeWidth="12" />
        <motion.circle cx="60" cy="60" r={r} fill="none" stroke={col} strokeWidth="12" strokeLinecap="round" strokeDasharray={c}
          initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - value / 100) }} transition={{ duration: 1.1, ease: EASE }}
          style={{ filter: `drop-shadow(0 0 8px ${col})` }} />
      </svg>
      <span className="num absolute inset-0 grid place-items-center text-4xl">{value}%</span>
    </div>
  );
}
