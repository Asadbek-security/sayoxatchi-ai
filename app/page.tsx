"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { useI18n } from "@/lib/i18n";
import { getAnalysis, getResortsByIds, popularAreas, regions, searchResorts } from "@/lib/api";
import { useRecent } from "@/lib/store";
import type { AiAnalysis, Resort } from "@/lib/types";
import { IconAdMatch, IconArrowRight, IconRecent, IconReliability, IconSearch, IconSuspicious } from "@/components/icons";
import { ResortCard, TrustOrb } from "@/components/signature";
import { Condense, EASE, Glass, ScoreBadge, SectionTitle, Skeleton } from "@/components/ui";

export default function HomePage() {
  const { t } = useI18n();
  const router = useRouter();
  const reduce = useReducedMotion();
  const [q, setQ] = useState("");
  const [region, setRegion] = useState("");
  const [popular, setPopular] = useState<Resort[] | null>(null);
  const [demo, setDemo] = useState<AiAnalysis | null>(null);
  const recent = useRecent();
  const [recentList, setRecentList] = useState<Resort[]>([]);
  const { scrollY } = useScroll();
  const orbY = useTransform(scrollY, [0, 600], [0, reduce ? 0 : -60]);

  useEffect(() => {
    searchResorts({ sort: "rating" }).then((r) => setPopular(r.slice(0, 4)));
    getAnalysis("yashil-vodiy").then(setDemo);
  }, []);
  useEffect(() => { getResortsByIds(recent.ids).then(setRecentList); }, [recent.ids]);

  const go = (query: string, reg = region) => {
    const p = new URLSearchParams();
    if (query) p.set("q", query);
    if (reg) p.set("region", reg);
    router.push(`/search${p.size ? `?${p}` : ""}`);
  };

  const steps = [
    { icon: IconReliability, t: t("home.how1.t"), d: t("home.how1.d") },
    { icon: IconSuspicious, t: t("home.how2.t"), d: t("home.how2.d") },
    { icon: IconAdMatch, t: t("home.how3.t"), d: t("home.how3.d") },
  ];

  return (
    <div className="space-y-24">
      {/* HERO */}
      <section className="grid min-h-[calc(100dvh-140px)] grid-cols-1 items-center gap-10 pb-6 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-7">
          <motion.h1
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE }}
            className="font-display text-[40px] font-extrabold leading-[1.08] text-balance text-hi sm:text-[52px] lg:text-[68px]"
          >
            {t("home.title")}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE, delay: 0.08 }}
            className="mt-5 max-w-xl text-lg leading-relaxed text-mid">
            {t("home.subtitle")}
          </motion.p>

          <motion.form
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE, delay: 0.16 }}
            onSubmit={(e) => { e.preventDefault(); go(q); }}
            className="glass g3 sheen mt-9 flex flex-col gap-2 rounded-[32px]! p-2 transition-transform duration-300 focus-within:scale-[1.01] focus-within:[&::before]:opacity-100 sm:h-16 sm:flex-row sm:items-center sm:rounded-full! sm:p-1.5 [--r:999px]"
          >
            <label className="flex h-14 flex-1 items-center gap-3 pl-4 sm:h-full">
              <IconSearch size={24} className="text-mint" />
              <span className="sr-only">{t("home.searchPlaceholder")}</span>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("home.searchPlaceholder")}
                className="h-full w-full min-w-0 bg-transparent text-[16px] text-hi outline-none placeholder:text-low" />
            </label>
            <div className="flex gap-2">
              <label className="relative flex-1 sm:flex-none">
                <span className="sr-only">{t("search.region")}</span>
                <select value={region} onChange={(e) => setRegion(e.target.value)}
                  className="h-13 w-full appearance-none rounded-full bg-[color:var(--glass-top)] pl-4 pr-9 text-sm font-medium text-hi outline-none sm:w-44 [&>option]:bg-[color:var(--bg-1)]">
                  <option value="">{t("home.regionAll")}</option>
                  {regions().map((r) => <option key={r}>{r}</option>)}
                </select>
                <svg className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-low" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 9l6 6 6-6" /></svg>
              </label>
              <button className="btn-liquid h-13 rounded-full px-7 text-[15px] font-bold">{t("home.check")}</button>
            </div>
          </motion.form>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.3 }} className="mt-5">
            <p className="mb-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-low">{t("home.areas")}</p>
            <div className="-mx-4 no-scrollbar flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
              {popularAreas.map((a) => (
                <button key={a} onClick={() => go(a, "")} className="glass g1 h-10 shrink-0 rounded-full! px-4 text-sm font-medium text-mid transition hover:text-hi [--r:999px]">
                  {a}
                </button>
              ))}
            </div>
          </motion.div>

          <StatsRow />
        </div>

        <motion.div style={{ y: orbY }} className="relative flex min-w-0 justify-center lg:col-span-5 lg:justify-end">
          <Glass level={3} className="relative flex flex-col items-center px-8 pb-6 pt-8 lg:mt-24 lg:translate-x-4">
            <span className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-low">Trust Score</span>
            {demo ? <TrustOrb score={demo.overall} confidence={demo.confidence} size={232} caption={t("home.orbCaption")} /> : <Skeleton className="size-56 rounded-full" />}
            <Link href="/resort/yashil-vodiy" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-mint hover:underline">
              {t("card.details")} <IconArrowRight size={16} />
            </Link>
          </Glass>
        </motion.div>
      </section>

      {/* YAQINDA KO‘RILGANLAR */}
      {recentList.length > 0 && (
        <section>
          <SectionTitle icon={<IconRecent size={24} />} action={<button onClick={recent.clear} className="text-sm font-medium text-low hover:text-hi">{t("home.recentClear")}</button>}>
            {t("home.recent")}
          </SectionTitle>
          <div className="-mx-4 no-scrollbar flex snap-x gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
            {recentList.map((r) => (
              <Link key={r.id} href={`/resort/${r.id}`} className="glass g1 glass-hover flex w-64 shrink-0 snap-start items-center gap-3 p-3 pr-4">
                <ScoreBadge score={r.trust_score} size={44} />
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-hi">{r.name}</span>
                  <span className="block truncate text-xs text-low">{r.district}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* QANDAY ISHLAYDI */}
      <section>
        <SectionTitle>{t("home.how")}</SectionTitle>
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((s, i) => (
            <Condense key={i} i={i}>
              <Glass className="h-full p-7">
                <HeroIconTile><s.icon size={32} active /></HeroIconTile>
                <h3 className="mt-6 font-display text-xl font-bold text-hi">{s.t}</h3>
                <p className="mt-2 leading-relaxed text-mid">{s.d}</p>
              </Glass>
            </Condense>
          ))}
        </div>
      </section>

      {/* MASHHUR */}
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

/** 64–80px "qahramon" ikonka: muzlatilgan suyuq shisha plitka + iridessent chet */
function HeroIconTile({ children }: { children: React.ReactNode }) {
  return (
    <span className="glass g3 sheen relative grid size-[72px] place-items-center rounded-[22px]! text-hi [--r:22px]">
      <span className="absolute inset-2 rounded-[16px] bg-gradient-to-br from-[color:var(--mint)]/20 to-[color:var(--aqua)]/5" />
      {children}
    </span>
  );
}

function StatsRow() {
  const { t } = useI18n();
  const items = [
    { n: "8", l: t("home.stat.resorts") },
    { n: "228", l: t("home.stat.reviews") },
    { n: "7", l: t("home.stat.weights") },
  ];
  return (
    <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
      {items.map((x) => (
        <div key={x.l}>
          <dt className="sr-only">{x.l}</dt>
          <dd className="num text-3xl text-hi">{x.n}</dd>
          <dd className="text-sm text-low">{x.l}</dd>
        </div>
      ))}
    </dl>
  );
}
