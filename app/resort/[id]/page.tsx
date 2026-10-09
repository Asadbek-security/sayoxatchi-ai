"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AlertTriangle, ArrowLeft, Check, Heart, ImageIcon, MapPin, PenLine, RefreshCw, Sparkles, ThumbsUp } from "lucide-react";
import { useI18n, type DictKey } from "@/lib/i18n";
import { getAnalysis, getResort, getReviews, startAnalysis } from "@/lib/api";
import { METRIC_KEYS } from "@/lib/score";
import { useSaved } from "@/lib/saved";
import type { AiAnalysis, Resort, Review, Sentiment } from "@/lib/types";
import { Button, Card, cn, Cover, Disclaimer, MetricBar, ScoreRing, Skeleton, Stars, TopicChip } from "@/components/ui";

type Filter = "all" | Sentiment | "suspicious";
const SUSPICIOUS = 60;

export default function ResortPage() {
  const { id } = useParams<{ id: string }>();
  const { t, l, lang } = useI18n();
  const { isSaved, toggle } = useSaved();
  const [resort, setResort] = useState<Resort | null | undefined>(undefined);
  const [analysis, setAnalysis] = useState<AiAnalysis | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [refresh, setRefresh] = useState<"idle" | "busy" | "done">("idle");

  useEffect(() => {
    getResort(id).then(setResort);
    getAnalysis(id).then(setAnalysis);
    getReviews(id).then(setReviews);
  }, [id]);

  const filtered = useMemo(() => reviews.filter((r) =>
    filter === "all" ? true : filter === "suspicious" ? r.fake_probability >= SUSPICIOUS : r.sentiment === filter,
  ), [reviews, filter]);

  const onRefresh = async () => {
    setRefresh("busy");
    await startAnalysis(id);
    setAnalysis(await getAnalysis(id));
    setRefresh("done");
    setTimeout(() => setRefresh("idle"), 2500);
  };

  if (resort === undefined) return <div className="space-y-4"><Skeleton className="h-48" /><Skeleton className="h-64" /></div>;
  if (resort === null) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg font-semibold">{t("resort.notFound")}</p>
        <Link href="/search" className="mt-3 inline-block text-brand-600 underline">{t("resort.back")}</Link>
      </div>
    );
  }

  const saved = isSaved(resort.id);
  const maxMentions = Math.max(1, ...(analysis?.problems.map((p) => p.mentions) ?? [1]));
  const filters: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: t("review.all"), count: reviews.length },
    { key: "positive", label: t("review.positive"), count: reviews.filter((r) => r.sentiment === "positive").length },
    { key: "neutral", label: t("review.neutral"), count: reviews.filter((r) => r.sentiment === "neutral").length },
    { key: "negative", label: t("review.negative"), count: reviews.filter((r) => r.sentiment === "negative").length },
    { key: "suspicious", label: t("review.suspicious"), count: reviews.filter((r) => r.fake_probability >= SUSPICIOUS).length },
  ];

  return (
    <div className="space-y-6">
      <Link href="/search" className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline">
        <ArrowLeft className="size-4" /> {t("resort.back")}
      </Link>

      <Cover gradient={resort.cover} className="rounded-3xl px-5 pb-6 pt-16 text-white md:px-8 md:pt-24">
        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold drop-shadow-sm md:text-4xl">{resort.name}</h1>
            <p className="mt-1 flex items-center gap-1 text-white/90"><MapPin className="size-4" /> {resort.region}, {resort.district} · {resort.address}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded-lg bg-white/90 px-2 py-1 text-slate-800"><Stars value={resort.rating} /> <b>{resort.rating}</b></span>
              <span className="text-white/90">{resort.review_count} {t("card.reviews")}</span>
              <span className="text-white/90">{t("card.from")} {resort.price_from.toLocaleString("ru-RU")} {t("card.perNight")}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => toggle(resort.id)} aria-pressed={saved}>
              <Heart className={cn("size-4", saved && "fill-red-500 text-red-500")} /> {saved ? t("resort.saved") : t("resort.save")}
            </Button>
            <Link href={`/resort/${resort.id}/review`} className="inline-flex items-center gap-2 rounded-xl bg-brand-950/40 px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-white/40 backdrop-blur hover:bg-brand-950/60">
              <PenLine className="size-4" /> {t("resort.addReview")}
            </Link>
          </div>
        </div>
      </Cover>

      {/* Trust Score + AI xulosa */}
      <div className="grid gap-4 md:grid-cols-[260px_1fr]">
        <Card className="flex flex-col items-center justify-center gap-3 text-center">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{t("score.label")}</h2>
          {analysis ? <ScoreRing score={analysis.overall} size={140} /> : <Skeleton className="size-36 rounded-full" />}
          <p className="text-xs leading-relaxed text-slate-500">{t("score.help")}</p>
        </Card>
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-lg font-bold text-brand-950"><Sparkles className="size-5 text-brand-500" /> {t("resort.aiSummary")}</h2>
            <Button variant="ghost" onClick={onRefresh} disabled={refresh === "busy"}>
              {refresh === "done" ? <Check className="size-4" /> : <RefreshCw className={cn("size-4", refresh === "busy" && "animate-spin")} />}
              {refresh === "busy" ? t("resort.refreshing") : refresh === "done" ? t("resort.refreshed") : t("resort.refresh")}
            </Button>
          </div>
          {analysis ? (
            <>
              <p className="mt-3 leading-relaxed text-slate-700">{l(analysis.summary)}</p>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
                <span>{t("score.confidence")}: <b className="text-slate-700">{t(`conf.${analysis.confidence}` as DictKey)}</b></span>
                <span><b className="text-slate-700">{analysis.analyzed_reviews}</b> {t("resort.analyzed")}</span>
                <span>{t("resort.updated")}: {new Date(analysis.updated_at).toLocaleDateString(lang === "ru" ? "ru-RU" : "uz-UZ")}</span>
              </div>
              <Disclaimer className="mt-4" />
            </>
          ) : <Skeleton className="mt-3 h-24" />}
        </Card>
      </div>

      {/* Ko'rsatkichlar va muammolar */}
      {analysis && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <h2 className="mb-4 text-lg font-bold text-brand-950">{t("resort.metrics")}</h2>
            <div className="space-y-4">
              {METRIC_KEYS.map((k) => <MetricBar key={k} label={t(`metric.${k}` as DictKey)} value={analysis[k]} />)}
            </div>
          </Card>
          <div className="space-y-4">
            <Card>
              <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-brand-950"><AlertTriangle className="size-5 text-amber-500" /> {t("resort.problems")}</h2>
              {analysis.problems.length === 0 ? <p className="text-sm text-slate-500">{t("resort.noProblems")}</p> : (
                <ul className="space-y-3">
                  {analysis.problems.map((p, i) => (
                    <li key={p.topic}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="font-medium">{i + 1}. {t(`topic.${p.topic}` as DictKey)}</span>
                        <span className="text-slate-500">{p.mentions} {t("resort.mentions")}</span>
                      </div>
                      <div className="h-2 rounded-full bg-amber-50"><div className="h-full rounded-full bg-amber-400" style={{ width: `${(p.mentions / maxMentions) * 100}%` }} /></div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
            <Card>
              <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-brand-950"><ThumbsUp className="size-5 text-brand-500" /> {t("resort.strengths")}</h2>
              <div className="flex flex-wrap gap-2">
                {analysis.strengths.length ? analysis.strengths.map((s) => <TopicChip key={s} topic={s} tone="good" />) : <span className="text-sm text-slate-500">{t("score.none")}</span>}
              </div>
            </Card>
            <Card className="bg-gradient-to-br from-brand-50 to-white">
              <h2 className="flex items-center gap-2 text-lg font-bold text-brand-950"><ImageIcon className="size-5 text-brand-500" /> {t("resort.adVsReal")}</h2>
              <p className="mt-1 text-sm text-slate-600">{t("resort.adVsRealDesc")}</p>
              <Link href={`/compare?resort=${resort.id}`} className="mt-3 inline-flex rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
                {t("resort.compareBtn")}
              </Link>
            </Card>
          </div>
        </div>
      )}

      {/* Sharhlar */}
      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-brand-950">{t("resort.reviews")}</h2>
          <Link href={`/resort/${resort.id}/review`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline">
            <PenLine className="size-4" /> {t("resort.addReview")}
          </Link>
        </div>
        <div className="-mx-1 mb-4 flex gap-2 overflow-x-auto px-1 pb-1">
          {filters.map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={cn("shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium ring-1 transition",
                filter === f.key ? "bg-brand-600 text-white ring-brand-600" : "bg-white text-slate-600 ring-brand-100 hover:ring-brand-300")}>
              {f.label} <span className="opacity-70">{f.count}</span>
            </button>
          ))}
        </div>
        <ul className="divide-y divide-brand-50">
          {filtered.map((r) => <ReviewItem key={r.id} r={r} />)}
        </ul>
      </Card>
    </div>
  );
}

const sentimentStyle: Record<Sentiment, string> = {
  positive: "bg-emerald-50 text-emerald-700",
  neutral: "bg-slate-100 text-slate-600",
  negative: "bg-red-50 text-red-700",
};

function ReviewItem({ r }: { r: Review }) {
  const { t, lang } = useI18n();
  const suspicious = r.fake_probability >= SUSPICIOUS;
  return (
    <li className="py-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="grid size-8 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">{r.author[0]}</span>
        <span className="font-semibold">{r.author}</span>
        <Stars value={r.rating} size="size-3.5" />
        <span className="text-xs text-slate-400">{new Date(r.date).toLocaleDateString(lang === "ru" ? "ru-RU" : "uz-UZ")}</span>
        <span className={cn("ml-auto rounded-full px-2 py-0.5 text-xs font-medium", sentimentStyle[r.sentiment])}>{t(`review.${r.sentiment}` as DictKey)}</span>
      </div>
      <p className={cn("mt-2 text-sm leading-relaxed text-slate-700", suspicious && "opacity-70")}>{r.text}</p>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {r.topics.map((tp) => <TopicChip key={tp} topic={tp} />)}
        <span title={t("review.suspiciousHint")}
          className={cn("ml-auto inline-flex cursor-help items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
            suspicious ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200" : "text-slate-400")}>
          {suspicious && <AlertTriangle className="size-3" />}
          {suspicious ? t("review.suspicious") : t("review.reliable")} · {r.fake_probability}%
        </span>
      </div>
    </li>
  );
}
