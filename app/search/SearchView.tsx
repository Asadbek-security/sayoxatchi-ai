"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SearchX } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { regions, searchResorts, type SearchParams } from "@/lib/api";
import type { Resort } from "@/lib/types";
import { Button, inputCls, ResortCard, Skeleton } from "@/components/ui";

export default function SearchView() {
  const { t } = useI18n();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [region, setRegion] = useState("");
  const [minScore, setMinScore] = useState(0);
  const [sort, setSort] = useState<NonNullable<SearchParams["sort"]>>("score");
  const [list, setList] = useState<Resort[] | null>(null);

  useEffect(() => {
    setList(null);
    const id = setTimeout(() => searchResorts({ q, region, minScore, sort }).then(setList), 200);
    return () => clearTimeout(id);
  }, [q, region, minScore, sort]);

  const reset = () => { setQ(""); setRegion(""); setMinScore(0); setSort("score"); };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-brand-950 md:text-3xl">{t("search.title")}</h1>

      <div className="grid gap-3 rounded-2xl border border-brand-100 bg-white p-4 shadow-sm md:grid-cols-[2fr_1fr_1fr_1fr]">
        <label className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-brand-500" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("home.searchPlaceholder")} className={`${inputCls} pl-9`} aria-label={t("search.title")} />
        </label>
        <select value={region} onChange={(e) => setRegion(e.target.value)} className={inputCls} aria-label={t("search.region")}>
          <option value="">{t("search.allRegions")}</option>
          {regions().map((r) => <option key={r}>{r}</option>)}
        </select>
        <select value={minScore} onChange={(e) => setMinScore(Number(e.target.value))} className={inputCls} aria-label={t("search.minScore")}>
          <option value={0}>{t("search.minScore")}: {t("search.any")}</option>
          {[50, 60, 70, 80].map((n) => <option key={n} value={n}>{t("search.minScore")}: {n}+</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className={inputCls} aria-label={t("search.sort")}>
          <option value="score">{t("search.sort.score")}</option>
          <option value="rating">{t("search.sort.rating")}</option>
          <option value="price">{t("search.sort.price")}</option>
        </select>
      </div>

      {list === null ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-64" />)}</div>
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-brand-200 bg-white py-16 text-center">
          <SearchX className="size-10 text-brand-300" />
          <p className="max-w-sm text-slate-600">{t("search.empty")}</p>
          <Button variant="ghost" onClick={reset}>{t("search.reset")}</Button>
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-500"><b className="text-brand-700">{list.length}</b> {t("search.found")}</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{list.map((r) => <ResortCard key={r.id} r={r} />)}</div>
        </>
      )}
    </div>
  );
}
