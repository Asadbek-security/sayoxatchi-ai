"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useI18n, type DictKey } from "@/lib/i18n";
import { districts, LOCATION_TYPES, regions, searchResorts, type SearchParams } from "@/lib/api";
import type { LocationType, Resort } from "@/lib/types";
import { IconFilter, IconSearch, IconStar, locationIcon } from "@/components/icons";
import { ResortCard } from "@/components/signature";
import { BottomSheet, Button, Chip, Condense, EmptyState, Field, Glass, Segmented, Select, Skeleton, fieldCls } from "@/components/ui";

type Sort = NonNullable<SearchParams["sort"]>;

export default function SearchView() {
  const { t } = useI18n();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [region, setRegion] = useState(params.get("region") ?? "");
  const [district, setDistrict] = useState("");
  const initLoc = params.get("loc");
  const [loc, setLoc] = useState<LocationType | "">(LOCATION_TYPES.includes(initLoc as LocationType) ? (initLoc as LocationType) : "");
  const [minScore, setMinScore] = useState(0);
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState<Sort>("score");
  const [list, setList] = useState<Resort[] | null>(null);
  const [sheet, setSheet] = useState(false);

  useEffect(() => {
    setList(null);
    const id = setTimeout(() => searchResorts({ q, region, district, minScore, minRating, location: loc, sort }).then(setList), 200);
    return () => clearTimeout(id);
  }, [q, region, district, minScore, minRating, loc, sort]);

  const reset = () => { setQ(""); setLoc(""); setRegion(""); setDistrict(""); setMinScore(0); setMinRating(0); setSort("score"); };
  const activeFilters = [loc, region, district, minScore, minRating].filter(Boolean).length;

  const filters = (
    <div className="space-y-6">
      <div>
        <span className="mb-3 block text-sm font-semibold text-hi">{t("search.location")}</span>
        <div className="flex flex-wrap gap-2">
          <Chip active={!loc} onClick={() => setLoc("")}>{t("loc.all")}</Chip>
          {LOCATION_TYPES.map((k) => {
            const Icon = locationIcon[k];
            return <Chip key={k} active={loc === k} onClick={() => setLoc(k)}><Icon size={16} /> {t(`loc.${k}` as DictKey)}</Chip>;
          })}
        </div>
      </div>
      <Field label={t("search.region")}>
        <Select value={region} onChange={(e) => { setRegion(e.target.value); setDistrict(""); }}>
          <option value="">{t("search.allRegions")}</option>
          {regions().map((r) => <option key={r}>{r}</option>)}
        </Select>
      </Field>
      <Field label={t("search.district")}>
        <Select value={district} onChange={(e) => setDistrict(e.target.value)}>
          <option value="">{t("search.allDistricts")}</option>
          {districts(region || undefined).map((d) => <option key={d}>{d}</option>)}
        </Select>
      </Field>
      <div>
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-hi">{t("search.minScore")}</span>
          <span className="num text-lg text-mint">{minScore || t("search.any")}</span>
        </div>
        <input type="range" min={0} max={90} step={10} value={minScore} onChange={(e) => setMinScore(Number(e.target.value))}
          className="liquid-range w-full" style={{ "--p": `${(minScore / 90) * 100}%` } as React.CSSProperties} aria-label={t("search.minScore")} />
        <div className="mt-2 flex justify-between text-[11px] text-low"><span>0</span><span>45</span><span>90</span></div>
      </div>
      <div>
        <span className="mb-3 block text-sm font-semibold text-hi">{t("search.minRating")}</span>
        <div className="flex flex-wrap gap-2">
          {[0, 4, 4.5].map((r) => (
            <Chip key={r} active={minRating === r} onClick={() => setMinRating(r)}>
              {r === 0 ? t("search.any") : <><IconStar size={16} filled /> {r}+</>}
            </Chip>
          ))}
        </div>
      </div>
      {activeFilters > 0 && <Button variant="ghost" className="w-full" onClick={reset}>{t("search.reset")}</Button>}
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="font-display text-[34px] font-extrabold leading-tight md:text-5xl">{t("search.title")}</h1>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="glass g2 flex h-14 flex-1 items-center gap-3 rounded-full! px-5 [--r:999px]">
          <IconSearch size={20} className="text-mint" />
          <span className="sr-only">{t("search.title")}</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("home.searchPlaceholder")} className="h-full w-full bg-transparent text-hi outline-none placeholder:text-low" />
        </label>
        <div className="flex items-center gap-2">
          <Button variant="glass" className="h-14 lg:hidden" onClick={() => setSheet(true)}>
            <IconFilter size={20} /> {t("search.filters")} {activeFilters > 0 && <span className="num grid size-6 place-items-center rounded-full bg-[color:var(--jade)] text-xs text-on-jade">{activeFilters}</span>}
          </Button>
          <div className="hidden md:block">
            <Segmented label={t("search.sort")} value={sort} onChange={setSort}
              options={[{ value: "score", label: t("search.sort.score") }, { value: "rating", label: t("search.sort.rating") }, { value: "price", label: t("search.sort.price") }]} />
          </div>
          <label className="md:hidden flex-1">
            <span className="sr-only">{t("search.sort")}</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className={`${fieldCls} h-14 rounded-full`}>
              <option value="score">{t("search.sort.score")}</option>
              <option value="rating">{t("search.sort.rating")}</option>
              <option value="price">{t("search.sort.price")}</option>
            </select>
          </label>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <Glass level={2} className="sticky top-28 p-6">
            <h2 className="mb-5 flex items-center gap-2 font-display text-lg font-bold"><IconFilter size={20} className="text-mint" /> {t("search.filters")}</h2>
            {filters}
          </Glass>
        </aside>

        <div>
          {list === null ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-[360px]" />)}</div>
          ) : list.length === 0 ? (
            <EmptyState icon={<IconSearch size={32} />} text={t("search.empty")} action={<Button variant="glass" onClick={reset}>{t("search.reset")}</Button>} />
          ) : (
            <>
              <p className="mb-4 text-sm text-low"><span className="num text-base text-hi">{list.length}</span> {t("search.found")}</p>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {list.map((r, i) => <Condense key={r.id} i={i}><ResortCard r={r} /></Condense>)}
              </div>
            </>
          )}
        </div>
      </div>

      <BottomSheet open={sheet} onClose={() => setSheet(false)} title={t("search.filters")}>
        {filters}
        <Button className="mt-6 w-full" size="lg" onClick={() => setSheet(false)}>{t("search.apply")}{list ? ` · ${list.length}` : ""}</Button>
      </BottomSheet>
    </div>
  );
}
