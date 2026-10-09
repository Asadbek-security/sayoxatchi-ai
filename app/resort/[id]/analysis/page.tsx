"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useI18n, type DictKey } from "@/lib/i18n";
import { getAnalysis, getResort, startAnalysis, type AnalysisStep } from "@/lib/api";
import { levelVar, METRIC_KEYS, scoreLevel } from "@/lib/score";
import type { AiAnalysis, Resort } from "@/lib/types";
import { IconBack, IconJobs, IconPlay, IconSummary, metricIcon } from "@/components/icons";
import { AnalysisSteps, TrustOrb } from "@/components/signature";
import { Button, cn, Condense, Disclaimer, Glass, SectionTitle, Skeleton } from "@/components/ui";

export default function AnalysisPanelPage() {
  const { id } = useParams<{ id: string }>();
  const { t, l, fmtDate } = useI18n();
  const [resort, setResort] = useState<Resort | null>(null);
  const [a, setA] = useState<AiAnalysis | null>(null);
  const [job, setJob] = useState<{ step: AnalysisStep | null; progress: number; state: "idle" | "busy" | "done" }>({ step: "summary", progress: 100, state: "idle" });

  useEffect(() => { getResort(id).then(setResort); getAnalysis(id).then(setA); }, [id]);

  const run = async () => {
    setJob({ step: "queued", progress: 0, state: "busy" });
    await startAnalysis(id, (step, progress) => setJob({ step, progress, state: "busy" }));
    setA(await getAnalysis(id));
    setJob({ step: "summary", progress: 100, state: "done" });
  };

  return (
    <div className="space-y-6">
      <Link href={`/resort/${id}`} className="inline-flex h-11 items-center gap-2 text-sm font-medium text-mid hover:text-hi"><IconBack size={20} /> {resort?.name}</Link>
      <h1 className="font-display text-[34px] font-extrabold leading-tight md:text-5xl">{t("an.title")}</h1>

      <Glass level={3} className="p-6 md:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2.5 font-display text-xl font-bold"><IconJobs size={24} className="text-mint" /> {t("an.job")}</h2>
          <Button onClick={run} disabled={job.state === "busy"}><IconPlay size={20} /> {t("admin.run")}</Button>
        </div>
        <AnalysisSteps step={job.step} progress={job.progress} />
        <p className={cn("mt-4 text-sm", job.state === "busy" ? "text-mint" : "text-mid")}>
          {job.state === "busy" ? t("an.running") : job.state === "done" ? t("an.done") : t("an.idle")}
        </p>
      </Glass>

      {!a ? <Skeleton className="h-80" /> : (
        <div className="grid gap-5 lg:grid-cols-12">
          <Condense className="lg:col-span-4">
            <Glass className="flex h-full flex-col items-center gap-4 p-6 text-center">
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-low">{t("an.latest")}</h2>
              <TrustOrb score={a.overall} confidence={a.confidence} size={200} caption={`${t("resort.updated")}: ${fmtDate(a.updated_at)}`} />
            </Glass>
          </Condense>
          <Condense i={1} className="lg:col-span-8">
            <Glass className="h-full p-6 md:p-8">
              <SectionTitle icon={<IconSummary size={24} />}>{t("resort.aiSummary")}</SectionTitle>
              <p className="max-w-[68ch] text-[17px] leading-[1.65]">{l(a.summary)}</p>
              <Disclaimer className="mt-5" />
            </Glass>
          </Condense>

          {a.previous && (
            <Condense className="lg:col-span-12">
              <Glass solid className="p-6 md:p-8">
                <SectionTitle sub={`${t("an.prev")}: ${fmtDate(a.previous.updated_at)} → ${t("an.now")}: ${fmtDate(a.updated_at)}`}>{t("an.changes")}</SectionTitle>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <Delta label={t("score.label")} prev={a.previous.overall} now={a.overall} strong />
                  {METRIC_KEYS.map((k) => {
                    const Icon = metricIcon[k];
                    return <Delta key={k} icon={<Icon size={20} />} label={t(`metric.${k}` as DictKey)} prev={a.previous!.metrics[k] ?? null} now={a[k]} />;
                  })}
                </div>
              </Glass>
            </Condense>
          )}
        </div>
      )}
    </div>
  );
}

function Delta({ label, prev, now, icon, strong }: { label: string; prev: number | null; now: number | null; icon?: React.ReactNode; strong?: boolean }) {
  const { t } = useI18n();
  const d = prev != null && now != null ? now - prev : null;
  return (
    <div className={cn("rounded-3xl p-4", strong ? "bg-[color:var(--glass-top)] ring-1 ring-[color:var(--line)]" : "bg-[color:var(--glass-bottom)]")}>
      <p className="flex items-center gap-2 text-sm text-mid"><span className="text-mint">{icon}</span>{label}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="num text-2xl" style={{ color: levelVar[scoreLevel(now)] }}>{now ?? "—"}</span>
        <span className="text-xs text-low">← {prev ?? "—"}</span>
        {d != null && (
          <span className={cn("ml-auto rounded-full px-2 py-0.5 text-xs font-bold", d > 0 ? "text-good" : d < 0 ? "text-bad" : "text-low")}
            style={{ background: d === 0 ? "var(--glass-bottom)" : `color-mix(in srgb, ${d > 0 ? "var(--score-high)" : "var(--score-low)"} 13%, transparent)` }}>
            {d === 0 ? t("an.same") : `${d > 0 ? "▲ +" : "▼ "}${d}`}
          </span>
        )}
      </div>
    </div>
  );
}
