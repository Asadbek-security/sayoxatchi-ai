"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n, type DictKey } from "@/lib/i18n";
import { searchResorts } from "@/lib/api";
import { METRIC_KEYS, WEIGHTS } from "@/lib/score";
import type { Resort } from "@/lib/types";
import { IconAdMatch, IconArrowRight, IconReliability, IconSuspicious, IconTrust, metricIcon } from "@/components/icons";
import { ResortCard } from "@/components/signature";
import { Condense, Disclaimer, Glass, SectionTitle, Skeleton } from "@/components/ui";

export default function TrustScorePage() {
  const { t } = useI18n();
  const [popular, setPopular] = useState<Resort[] | null>(null);
  useEffect(() => { searchResorts({ sort: "rating" }).then((r) => setPopular(r.slice(0, 4))); }, []);

  const steps = [
    { icon: IconReliability, t: t("home.how1.t"), d: t("home.how1.d") },
    { icon: IconSuspicious, t: t("home.how2.t"), d: t("home.how2.d") },
    { icon: IconAdMatch, t: t("home.how3.t"), d: t("home.how3.d") },
  ];
  const scale = [
    { range: "70–100", key: "score.good", color: "var(--score-high)" },
    { range: "40–69", key: "score.mid", color: "var(--score-mid)" },
    { range: "0–39", key: "score.bad", color: "var(--score-low)" },
    { range: "—", key: "score.none", color: "var(--text-low)" },
  ] as const;

  return (
    <div className="space-y-16">
      <header className="max-w-3xl">
        <h1 className="flex items-center gap-3 font-display text-[34px] font-extrabold leading-tight md:text-5xl">
          <IconTrust size={32} active className="text-mint" /> {t("home.how")}
        </h1>
        <p className="mt-3 text-lg leading-relaxed text-mid">{t("ts.subtitle")}</p>
      </header>

      {/* QANDAY ISHLAYDI */}
      <section className="grid gap-4 md:grid-cols-3">
        {steps.map((s, i) => (
          <Condense key={i} i={i}>
            <Glass className="h-full p-7">
              <span className="glass g3 sheen relative grid size-[72px] place-items-center rounded-[22px]! text-hi [--r:22px]">
                <span className="absolute inset-2 rounded-[16px] bg-gradient-to-br from-[color:var(--mint)]/20 to-[color:var(--aqua)]/5" />
                <s.icon size={32} active />
              </span>
              <h2 className="mt-6 font-display text-xl font-bold text-hi">{s.t}</h2>
              <p className="mt-2 leading-relaxed text-mid">{s.d}</p>
            </Glass>
          </Condense>
        ))}
      </section>

      {/* OG‘IRLIKLAR + SHKALA */}
      <section className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Condense>
          <Glass className="h-full p-6 md:p-8">
            <SectionTitle>{t("ts.weights")}</SectionTitle>
            <ul className="space-y-4">
              {METRIC_KEYS.map((k) => {
                const Icon = metricIcon[k];
                const w = Math.round(WEIGHTS[k] * 100);
                return (
                  <li key={k} className="grid grid-cols-[32px_1fr_48px] items-center gap-3">
                    <span className="grid size-8 place-items-center rounded-xl bg-[color:var(--glass-top)] text-mint"><Icon size={20} /></span>
                    <div>
                      <p className="mb-1.5 text-[15px] font-medium">{t(`metric.${k}` as DictKey)}</p>
                      <div className="h-2.5 overflow-hidden rounded-full bg-[color:var(--glass-bottom)]">
                        <div className="h-full rounded-full bg-gradient-to-r from-[color:var(--jade)] to-[color:var(--aqua)]" style={{ width: `${w * 4}%` }} />
                      </div>
                    </div>
                    <span className="num text-right text-lg">{w}%</span>
                  </li>
                );
              })}
            </ul>
          </Glass>
        </Condense>
        <Condense i={1}>
          <Glass className="h-full p-6 md:p-8">
            <SectionTitle>{t("ts.scale")}</SectionTitle>
            <ul className="space-y-3">
              {scale.map((x) => (
                <li key={x.key} className="flex items-center gap-4 rounded-2xl bg-[color:var(--glass-bottom)] p-4">
                  <span className="size-4 shrink-0 rounded-full" style={{ background: x.color, boxShadow: `0 0 12px ${x.color}` }} />
                  <span className="num w-20 whitespace-nowrap text-lg">{x.range}</span>
                  <span className="font-medium" style={{ color: x.color }}>{t(x.key)}</span>
                </li>
              ))}
            </ul>
            <Disclaimer className="mt-6" />
          </Glass>
        </Condense>
      </section>

      {/* MASHHUR MASKANLAR */}
      <section>
        <SectionTitle action={<Link href="/search" className="inline-flex h-11 items-center gap-1.5 text-sm font-semibold text-mint hover:underline">{t("home.all")} <IconArrowRight size={16} /></Link>}>
          {t("home.popular")}
        </SectionTitle>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {popular ? popular.map((r, i) => <Condense key={r.id} i={i}><ResortCard r={r} /></Condense>) : [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-[360px]" />)}
        </div>
      </section>
    </div>
  );
}
