"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ImageIcon, MessageSquareText, Search, ShieldCheck, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { searchResorts } from "@/lib/api";
import type { Resort } from "@/lib/types";
import { Disclaimer, ResortCard, Skeleton } from "@/components/ui";

export default function HomePage() {
  const { t } = useI18n();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [popular, setPopular] = useState<Resort[] | null>(null);

  useEffect(() => {
    searchResorts({ sort: "rating" }).then((r) => setPopular(r.slice(0, 4)));
  }, []);

  const steps = [
    { icon: MessageSquareText, t: t("home.how1.t"), d: t("home.how1.d") },
    { icon: ShieldCheck, t: t("home.how2.t"), d: t("home.how2.d") },
    { icon: ImageIcon, t: t("home.how3.t"), d: t("home.how3.d") },
  ];

  return (
    <div className="space-y-14">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 px-5 py-12 text-white shadow-lg md:px-12 md:py-20">
        <svg viewBox="0 0 800 200" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-1/2 w-full opacity-15" aria-hidden>
          <path d="M0 200 L0 110 L120 40 L220 120 L340 20 L470 110 L590 50 L700 120 L800 70 L800 200Z" fill="white" />
        </svg>
        <div className="relative mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold ring-1 ring-white/25">
            <Sparkles className="size-3.5" /> {t("home.badge")}
          </span>
          <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight md:text-5xl">{t("home.title")}</h1>
          <p className="mx-auto mt-4 max-w-xl text-brand-50/90 md:text-lg">{t("home.subtitle")}</p>
          <form
            onSubmit={(e) => { e.preventDefault(); router.push(`/search?q=${encodeURIComponent(q)}`); }}
            className="mx-auto mt-8 flex max-w-xl flex-col gap-2 rounded-2xl bg-white p-2 shadow-xl sm:flex-row">
            <label className="flex flex-1 items-center gap-2 px-3">
              <Search className="size-5 shrink-0 text-brand-500" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("home.searchPlaceholder")}
                className="w-full bg-transparent py-3 text-slate-800 outline-none placeholder:text-slate-400" aria-label={t("home.searchPlaceholder")} />
            </label>
            <button className="rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white transition hover:bg-brand-700">{t("home.check")}</button>
          </form>
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-end justify-between">
          <h2 className="text-2xl font-bold text-brand-950">{t("home.popular")}</h2>
          <Link href="/search" className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">
            {t("home.all")} <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {popular ? popular.map((r) => <ResortCard key={r.id} r={r} />) : [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-64" />)}
        </div>
      </section>

      <section>
        <h2 className="mb-5 text-2xl font-bold text-brand-950">{t("home.how")}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={i} className="rounded-2xl border border-brand-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-600"><s.icon className="size-5" /></span>
                <span className="text-sm font-bold text-brand-300">0{i + 1}</span>
              </div>
              <h3 className="font-bold text-brand-950">{s.t}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{s.d}</p>
            </div>
          ))}
        </div>
        <Disclaimer className="mt-4" />
      </section>
    </div>
  );
}
