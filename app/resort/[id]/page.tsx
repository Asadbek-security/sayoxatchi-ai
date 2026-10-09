"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useI18n, type DictKey } from "@/lib/i18n";
import { getAnalysis, getResort, getReviews, getTopicBalance, startAnalysis, type AnalysisStep } from "@/lib/api";
import { METRIC_KEYS } from "@/lib/score";
import { useCompare, useRecent, useSaved } from "@/lib/store";
import type { AiAnalysis, Resort, Review, TopicBalance } from "@/lib/types";
import {
  IconAdMatch, IconAlert, IconArrowRight, IconBack, IconCheck, IconCompareResorts, IconEdit, IconJobs, IconLink, IconLocation,
  IconRefresh, IconReliability, IconSaved, IconSend, IconShare, IconSummary, IconTrust, locationIcon,
} from "@/components/icons";
import { AnalysisSteps, LiquidTube, ReviewItem, Scene, TopicBalanceChart, TrustOrb } from "@/components/signature";
import { ReviewForm } from "@/components/ReviewForm";
import { Button, ButtonLink, cn, Condense, Disclaimer, EASE, ErrorState, Glass, LevelLabel, SectionTitle, Skeleton, Stars, TopicChip } from "@/components/ui";

export default function ResortPage() {
  const { id } = useParams<{ id: string }>();
  const { t, l, fmtDate } = useI18n();
  const saved = useSaved();
  const cmp = useCompare();
  const { push: pushRecent } = useRecent();
  const [resort, setResort] = useState<Resort | null | undefined>(undefined);
  const [analysis, setAnalysis] = useState<AiAnalysis | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [balance, setBalance] = useState<TopicBalance[] | null>(null);
  const [error, setError] = useState(false);
  const [job, setJob] = useState<{ step: AnalysisStep | null; progress: number; state: "idle" | "busy" | "done" }>({ step: null, progress: 0, state: "idle" });

  const load = useCallback(() => {
    setError(false);
    setResort(undefined);
    Promise.all([getResort(id), getAnalysis(id), getReviews(id), getTopicBalance(id)])
      .then(([r, a, rv, b]) => { setResort(r); setAnalysis(a); setReviews(rv); setBalance(b); if (r) pushRecent(r.id); })
      .catch(() => setError(true));
  }, [id, pushRecent]);
  useEffect(load, [load]);

  const refresh = async () => {
    setJob({ step: "queued", progress: 0, state: "busy" });
    await startAnalysis(id, (step, progress) => setJob({ step, progress, state: "busy" }));
    setAnalysis(await getAnalysis(id));
    setJob({ step: "summary", progress: 100, state: "done" });
    setTimeout(() => setJob((j) => (j.state === "done" ? { step: null, progress: 0, state: "idle" } : j)), 3000);
  };

  if (error) return <ErrorState onRetry={load} />;
  if (resort === undefined) return <div className="space-y-5"><Skeleton className="h-72" /><div className="grid gap-5 lg:grid-cols-12"><Skeleton className="h-96 lg:col-span-5" /><Skeleton className="h-96 lg:col-span-7" /></div></div>;
  if (resort === null) {
    return (
      <Glass className="mx-auto max-w-md p-10 text-center">
        <p className="font-display text-xl font-bold">{t("resort.notFound")}</p>
        <ButtonLink href="/search" variant="glass" className="mt-5">{t("resort.back")}</ButtonLink>
      </Glass>
    );
  }

  const isSaved = saved.isSaved(resort.id);
  const inCmp = cmp.has(resort.id);
  const maxMentions = Math.max(1, ...(analysis?.problems.map((p) => p.mentions) ?? [1]));

  return (
    <div className="space-y-6">
      <Link href="/search" className="inline-flex h-11 items-center gap-2 text-sm font-medium text-mid hover:text-hi">
        <IconBack size={20} /> {t("resort.back")}
      </Link>

      {/* SARLAVHA — rasm shishaga "eriydi" */}
      <header className="glass g2 overflow-hidden rounded-[32px]! [--r:32px]">
        <div className="relative h-56 md:h-72">
          <Scene type={resort.cover} seed={resort.id} className="absolute inset-0 size-full" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[color:var(--bg-1)]" />
        </div>
        <div className="relative -mt-20 flex flex-col gap-5 px-5 pb-6 md:-mt-24 md:flex-row md:items-end md:justify-between md:px-8 md:pb-8">
          <div>
            <h1 className="font-display text-[34px] font-extrabold leading-tight text-hi md:text-5xl">{resort.name}</h1>
            <a href="#location" className="mt-2 flex items-center gap-1.5 text-mid underline-offset-4 hover:text-hi hover:underline"><IconLocation size={20} className="text-mint" /> {resort.region}, {resort.district} · {resort.address}</a>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <span className="flex items-center gap-1.5"><Stars value={resort.rating} /> <span className="num text-base">{resort.rating}</span> <span className="text-low">· {resort.review_count} {t("card.reviews")}</span></span>
              <span className="text-mid">{t("card.from")} <span className="num text-base text-hi">{resort.price_from.toLocaleString("ru-RU")}</span> {t("card.perNight")}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap [&>*]:w-full sm:[&>*]:w-auto">
            <Button variant="glass" onClick={() => saved.toggle(resort.id)} aria-pressed={isSaved}>
              <IconSaved size={20} active={isSaved} className={isSaved ? "text-mint" : ""} /> {isSaved ? t("resort.saved") : t("resort.save")}
            </Button>
            <ShareButton name={resort.name} score={analysis?.overall ?? null} />
            <Button variant="glass" onClick={() => cmp.toggle(resort.id)} aria-pressed={inCmp} disabled={!inCmp && cmp.full} title={!inCmp && cmp.full ? t("vs.max") : undefined}>
              {inCmp ? <IconCheck size={20} className="text-mint" /> : <IconCompareResorts size={20} />} {inCmp ? t("card.compareIn") : t("nav.versus")}
            </Button>
            <ButtonLink href="#write-review"><IconEdit size={20} /> {t("resort.addReview")}</ButtonLink>
          </div>
        </div>
      </header>

      {/* ORB + AI XULOSA */}
      <div className="grid gap-5 lg:grid-cols-12">
        <Condense className="lg:col-span-5">
          <Glass level={3} className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
            <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-low"><IconTrust size={16} className="text-mint" /> {t("score.label")}</h2>
            {analysis ? <TrustOrb score={analysis.overall} confidence={analysis.confidence} size={260} /> : <Skeleton className="size-64 rounded-full" />}
            {analysis && <LevelLabel score={analysis.overall} className="text-sm" />}
            <p className="max-w-xs text-xs leading-relaxed text-low">{t("score.help")}</p>
          </Glass>
        </Condense>

        <Condense i={1} className="lg:col-span-7">
          <Glass className="flex h-full flex-col p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="flex items-center gap-2.5 font-display text-[22px] font-bold"><IconSummary size={24} className="text-mint" /> {t("resort.aiSummary")}</h2>
              <Button variant="glass" size="sm" onClick={refresh} disabled={job.state === "busy"}>
                {job.state === "done" ? <IconCheck size={16} className="text-good" /> : <IconRefresh size={16} className={cn(job.state === "busy" && "animate-spin")} />}
                {job.state === "busy" ? t("resort.refreshing") : job.state === "done" ? t("resort.refreshed") : t("resort.refresh")}
              </Button>
            </div>
            <AnimatePresence>
              {job.state !== "idle" && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: EASE }} className="overflow-hidden">
                  <div className="mt-5 rounded-3xl bg-[color:var(--glass-bottom)] p-4"><AnalysisSteps step={job.step} progress={job.progress} /></div>
                </motion.div>
              )}
            </AnimatePresence>
            {analysis ? (
              <>
                <p className="mt-5 max-w-[68ch] text-[17px] leading-[1.65] text-hi">{l(analysis.summary)}</p>
                <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm">
                  <div><dt className="text-low">{t("score.confidence")}</dt><dd className={cn("font-semibold", analysis.confidence === "low" ? "text-warn" : "text-hi")}>{t(`conf.${analysis.confidence}` as DictKey)}</dd></div>
                  <div><dt className="text-low">{t("resort.analyzed").replace(/^ta /, "")}</dt><dd className="num text-hi">{analysis.analyzed_reviews}</dd></div>
                  <div><dt className="text-low">{t("resort.updated")}</dt><dd className="font-semibold text-hi">{fmtDate(analysis.updated_at)}</dd></div>
                </dl>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-6">
                  <Disclaimer className="max-w-md" />
                  <Link href={`/resort/${resort.id}/analysis`} className="inline-flex h-11 items-center gap-1.5 text-sm font-semibold text-mint hover:underline">
                    <IconJobs size={20} /> {t("resort.analysisPanel")} <IconArrowRight size={16} />
                  </Link>
                </div>
              </>
            ) : <Skeleton className="mt-5 h-32" />}
          </Glass>
        </Condense>
      </div>

      {/* 7 KO‘RSATKICH + MUAMMOLAR */}
      {analysis && (
        <div className="grid gap-5 lg:grid-cols-2">
          <Condense>
            <Glass className="h-full p-6 md:p-8">
              <SectionTitle icon={<IconReliability size={24} />}>{t("resort.metrics")}</SectionTitle>
              <div className="space-y-5">
                {METRIC_KEYS.map((k, i) => <LiquidTube key={k} k={k} value={analysis[k]} i={i} />)}
              </div>
            </Glass>
          </Condense>
          <div className="flex flex-col gap-5">
            <Condense i={1}>
              <Glass className="p-6 md:p-8">
                <SectionTitle icon={<IconAlert size={24} />}>{t("resort.problems")}</SectionTitle>
                {analysis.problems.length === 0 ? <p className="dash-empty rounded-2xl p-5 text-sm text-low">{t("resort.noProblems")}</p> : (
                  <ol className="space-y-4">
                    {analysis.problems.slice(0, 5).map((p, i) => (
                      <li key={p.topic} className="grid grid-cols-[32px_1fr] items-center gap-3">
                        <span className="num grid size-8 place-items-center rounded-full bg-[color:var(--glass-top)] text-sm text-warn">{i + 1}</span>
                        <div>
                          <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
                            <TopicChip topic={p.topic} tone="bad" />
                            <span className="text-low"><span className="num text-hi">{p.mentions}</span> {t("resort.mentions")}</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-[color:var(--glass-bottom)]">
                            <motion.div className="h-full rounded-full bg-gradient-to-r from-[color:var(--score-mid)] to-[color:var(--score-low)]"
                              initial={{ width: 0 }} whileInView={{ width: `${(p.mentions / maxMentions) * 100}%` }} viewport={{ once: true }} transition={{ duration: 0.7, ease: EASE, delay: i * 0.06 }} />
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
                {analysis.strengths.length > 0 && (
                  <div className="mt-6 border-t border-line pt-5">
                    <p className="mb-3 text-sm font-semibold text-mid">{t("resort.strengths")}</p>
                    <div className="flex flex-wrap gap-2">{analysis.strengths.map((s) => <TopicChip key={s} topic={s} tone="good" />)}</div>
                  </div>
                )}
              </Glass>
            </Condense>
            <Condense i={2}>
              <Glass className="relative overflow-hidden p-6 md:p-8">
                <div className="flex items-start gap-4">
                  <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[color:var(--glass-top)] text-mint"><IconAdMatch size={32} active /></span>
                  <div>
                    <h2 className="font-display text-xl font-bold">{t("resort.adVsReal")}</h2>
                    <p className="mt-1 text-sm leading-relaxed text-mid">{t("resort.adVsRealDesc")}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <ButtonLink href={`/compare?resort=${resort.id}`}>{t("resort.compareBtn")}</ButtonLink>
                      {analysis.ad_match != null && <span className="text-sm text-low">{t("cmp.match")}: <span className="num text-hi">{analysis.ad_match}%</span></span>}
                    </div>
                  </div>
                </div>
              </Glass>
            </Condense>
          </div>
        </div>
      )}

      {/* MAVZULAR BALANSI */}
      <Condense>
        <Glass className="p-6 md:p-8">
          <SectionTitle sub={t("resort.balanceDesc")}>{t("resort.balance")}</SectionTitle>
          {balance ? <TopicBalanceChart data={balance} /> : <Skeleton className="h-48" />}
        </Glass>
      </Condense>

      {/* SHARHLAR */}
      <section>
        <SectionTitle action={
          <div className="flex flex-wrap gap-2">
            <ButtonLink href={`/resort/${resort.id}/reviews`} variant="glass" size="sm">{t("resort.allReviews")} <IconArrowRight size={16} /></ButtonLink>
          </div>
        }>
          {t("resort.reviews")} <span className="num text-lg text-low">{reviews.length}</span>
        </SectionTitle>
        {reviews.length === 0 ? (
          <p className="dash-empty glass g1 p-6 text-sm text-low">{t("rv.empty")}</p>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {reviews.slice(0, 4).map((r, i) => <Condense key={r.id} i={i}><ReviewItem r={r} /></Condense>)}
          </div>
        )}
      </section>

      {/* SHARH QOLDIRISH + JOYLASHUV */}
      <div className="grid gap-5 lg:grid-cols-2">
        <section id="write-review" className="scroll-mt-28">
          <Glass level={2} className="h-full p-6 md:p-8">
            <SectionTitle icon={<IconEdit size={24} />} sub={t("resort.writeReviewDesc")}>{t("resort.writeReview")}</SectionTitle>
            <ReviewForm resortId={resort.id} onAdded={(r) => setReviews((list) => [r, ...list])} />
          </Glass>
        </section>
        <LocationSection resort={resort} />
      </div>
    </div>
  );
}

/** Joylashuv: OpenStreetMap xaritasi (kalit talab qilinmaydi), manzil, tashqi xaritalar, lokatsiya turi */
function LocationSection({ resort }: { resort: Resort }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const { lat, lng } = resort;
  const d = 0.035;
  const embed = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - d},${lat - d * 0.6},${lng + d},${lat + d * 0.6}&layer=mapnik&marker=${lat},${lng}`;
  const address = `${resort.address}, ${resort.district}, ${resort.region}`;
  const copy = async () => {
    try { await navigator.clipboard.writeText(address); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  };
  const links = [
    { href: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, label: t("resort.openGoogle") },
    { href: `https://yandex.uz/maps/?pt=${lng},${lat}&z=13&l=map`, label: t("resort.openYandex") },
  ];
  return (
    <section id="location" className="scroll-mt-28">
      <Glass level={2} className="flex h-full flex-col p-6 md:p-8">
        <SectionTitle icon={<IconLocation size={24} />}>{t("resort.location")}</SectionTitle>
        <div className="relative overflow-hidden rounded-3xl ring-1 ring-[color:var(--line)]">
          <iframe title={`${t("resort.location")}: ${resort.name}`} src={embed} loading="lazy" referrerPolicy="no-referrer"
            className="osm-map block h-72 w-full border-0 md:h-80" />
        </div>
        <p className="mt-2 text-[11px] text-low">{t("resort.mapCredit")}</p>

        <div className="mt-4 flex flex-wrap items-start gap-x-3 gap-y-2 rounded-2xl bg-[color:var(--glass-bottom)] p-4">
          <IconLocation size={20} className="mt-0.5 text-mint" />
          <div className="min-w-[12rem] flex-1">
            <p className="font-medium text-hi">{address}</p>
            <p className="num mt-0.5 text-xs text-low">{lat.toFixed(4)}, {lng.toFixed(4)}</p>
          </div>
          <button onClick={copy} className="ml-8 shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold text-mint hover:bg-[color:var(--glass-top)] sm:ml-0">
            {copied ? t("resort.copied") : t("resort.copyAddress")}
          </button>
        </div>

        {resort.locations.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-sm font-semibold text-mid">{t("search.location")}</p>
            <div className="flex flex-wrap gap-2">
              {resort.locations.map((k) => {
                const Icon = locationIcon[k];
                return (
                  <Link key={k} href={`/search?loc=${k}`} className="glass g1 inline-flex h-10 items-center gap-1.5 rounded-full! px-4 text-sm font-medium text-hi hover:-translate-y-px [--r:999px]">
                    <Icon size={16} className="text-mint" /> {t(`loc.${k}` as DictKey)}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-auto flex flex-wrap gap-2 pt-5">
          <a href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`} target="_blank" rel="noreferrer" className="btn-liquid inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold">
            <IconSend size={20} /> {t("resort.route")}
          </a>
          {links.map((l) => (
            <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="glass g1 inline-flex h-11 items-center rounded-full! px-4 text-sm font-semibold text-hi hover:-translate-y-px [--r:999px]">
              {l.label}
            </a>
          ))}
        </div>
      </Glass>
    </section>
  );
}

/** Ulashish: tizim menyusi bo‘lsa — u, aks holda havola nusxalash / Telegram */
function ShareButton({ name, score }: { name: string; score: number | null }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const text = `${name} — ${t("resort.shareText")} ${score ?? "—"}/100`;
  const onClick = async () => {
    if (typeof navigator.share === "function" && window.matchMedia("(pointer: coarse)").matches) {
      try { await navigator.share({ title: name, text, url: location.href }); } catch {}
      return;
    }
    setOpen((v) => !v);
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  };
  return (
    <div className="relative">
      <Button variant="glass" className="w-full" onClick={onClick} aria-expanded={open} aria-haspopup="menu">
        <IconShare size={20} /> {t("resort.share")}
      </Button>
      <AnimatePresence>
        {open && (
          <motion.div role="menu" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.18, ease: EASE }}
            className="glass g3 glass-solid absolute right-0 top-full z-30 mt-2 w-64 p-2">
            <button role="menuitem" onClick={copy} className="flex h-11 w-full items-center gap-3 rounded-2xl px-3 text-sm font-medium hover:bg-[color:var(--glass-top)]">
              {copied ? <IconCheck size={20} className="text-good" /> : <IconLink size={20} className="text-mint" />} {copied ? t("resort.shared") : t("resort.copyLink")}
            </button>
            <a role="menuitem" target="_blank" rel="noreferrer"
              href={`https://t.me/share/url?url=${encodeURIComponent(typeof location !== "undefined" ? location.href : "")}&text=${encodeURIComponent(text)}`}
              className="flex h-11 w-full items-center gap-3 rounded-2xl px-3 text-sm font-medium hover:bg-[color:var(--glass-top)]">
              <IconSend size={20} className="text-mint" /> {t("resort.shareTelegram")}
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
