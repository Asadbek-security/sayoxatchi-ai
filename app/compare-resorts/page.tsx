"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n, type DictKey } from "@/lib/i18n";
import { getAnalysis, getResortsByIds, searchResorts } from "@/lib/api";
import { levelVar, METRIC_KEYS, scoreLevel } from "@/lib/score";
import { COMPARE_MAX, useCompare } from "@/lib/store";
import type { AiAnalysis, Resort } from "@/lib/types";
import { IconClose, IconCompareResorts, metricIcon } from "@/components/icons";
import { Scene } from "@/components/signature";
import { ButtonLink, cn, EmptyState, Glass, ScoreBadge, Select, Skeleton, Stars } from "@/components/ui";

export default function CompareResortsPage() {
  const { t } = useI18n();
  const cmp = useCompare();
  const [rows, setRows] = useState<{ r: Resort; a: AiAnalysis | null }[] | null>(null);
  const [all, setAll] = useState<Resort[]>([]);

  useEffect(() => { searchResorts().then(setAll); }, []);
  useEffect(() => {
    getResortsByIds(cmp.ids).then(async (rs) => setRows(await Promise.all(rs.map(async (r) => ({ r, a: await getAnalysis(r.id) })))));
  }, [cmp.ids]);

  const best = (vals: (number | null)[], low = false) => {
    const nums = vals.filter((v): v is number => v != null);
    if (nums.length < 2) return null;
    return low ? Math.min(...nums) : Math.max(...nums);
  };

  const addSelect = cmp.ids.length < COMPARE_MAX && (
    <Select value="" onChange={(e) => e.target.value && cmp.toggle(e.target.value)} aria-label={t("vs.add")} className="w-full sm:w-72">
      <option value="">+ {t("vs.add")}</option>
      {all.filter((r) => !cmp.ids.includes(r.id)).map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
    </Select>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-3 font-display text-[34px] font-extrabold leading-tight md:text-5xl"><IconCompareResorts size={32} className="text-mint" /> {t("vs.title")}</h1>
          <p className="mt-2 max-w-2xl text-lg text-mid">{t("vs.subtitle")}</p>
        </div>
        {addSelect}
      </div>

      {rows === null ? <Skeleton className="h-96" /> : rows.length === 0 ? (
        <EmptyState icon={<IconCompareResorts size={32} />} text={t("vs.empty")} action={<ButtonLink href="/search">{t("nav.search")}</ButtonLink>} />
      ) : (
        <Glass solid className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 w-48 bg-[color:var(--glass-solid-strong)] p-4" />
                  {rows.map(({ r }) => (
                    <th key={r.id} className="p-4 align-top" style={{ width: `${100 / rows.length}%` }}>
                      <div className="relative overflow-hidden rounded-3xl">
                        <Scene type={r.cover} seed={r.id} className="h-24 w-full" />
                        <button onClick={() => cmp.toggle(r.id)} aria-label={`${t("vs.remove")}: ${r.name}`}
                          className="absolute right-2 top-2 grid size-9 place-items-center rounded-full bg-black/40 text-white backdrop-blur hover:bg-black/60"><IconClose size={16} /></button>
                      </div>
                      <Link href={`/resort/${r.id}`} className="mt-3 block font-display text-lg font-bold leading-snug text-hi hover:underline">{r.name}</Link>
                      <p className="text-xs font-normal text-low">{r.district}</p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="[&_td]:border-t [&_td]:border-line [&_td]:p-4 [&_th]:border-t [&_th]:border-line">
                <Row label={t("score.label")}>
                  {rows.map(({ r, a }) => {
                    const b = best(rows.map((x) => x.a?.overall ?? null));
                    return <td key={r.id}><div className="flex items-center gap-3"><ScoreBadge score={a?.overall ?? null} size={56} />{b != null && a?.overall === b && <BestTag />}</div></td>;
                  })}
                </Row>
                <Row label={t("vs.rating")}>
                  {rows.map(({ r }) => <td key={r.id}><span className="flex items-center gap-2"><Stars value={r.rating} /><span className="num">{r.rating}</span></span></td>)}
                </Row>
                <Row label={t("vs.price")}>
                  {rows.map(({ r }) => {
                    const b = best(rows.map((x) => x.r.price_from), true);
                    return <td key={r.id}><span className="num">{r.price_from.toLocaleString("ru-RU")}</span> <span className="text-xs text-low">{t("common.sum")}</span>{b === r.price_from && <BestTag className="ml-2" />}</td>;
                  })}
                </Row>
                {METRIC_KEYS.map((k) => {
                  const Icon = metricIcon[k];
                  const b = best(rows.map((x) => x.a?.[k] ?? null));
                  return (
                    <Row key={k} label={<span className="flex items-center gap-2"><Icon size={20} className="text-mint" />{t(`metric.${k}` as DictKey)}</span>}>
                      {rows.map(({ r, a }) => {
                        const v = a?.[k] ?? null;
                        return (
                          <td key={r.id}>
                            {v == null ? <span className="text-xs text-low">{t("metric.noData")}</span> : (
                              <div className="flex items-center gap-3">
                                <span className={cn("num w-8 text-lg", b === v && "underline decoration-2 underline-offset-4")} style={{ color: levelVar[scoreLevel(v)] }}>{v}</span>
                                <span className="h-2 flex-1 overflow-hidden rounded-full bg-[color:var(--glass-bottom)]"><span className="block h-full rounded-full" style={{ width: `${v}%`, background: levelVar[scoreLevel(v)] }} /></span>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </Row>
                  );
                })}
                <Row label={t("vs.problem")}>
                  {rows.map(({ r }) => <td key={r.id} className="text-sm text-warn">{r.main_problem ? t(`topic.${r.main_problem}` as DictKey) : <span className="text-low">—</span>}</td>)}
                </Row>
              </tbody>
            </table>
          </div>
        </Glass>
      )}
      {rows && rows.length > 0 && <p className="text-xs text-low">{t("vs.max")}</p>}
    </div>
  );
}

function Row({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <tr>
      <th scope="row" className="sticky left-0 z-10 bg-[color:var(--glass-solid-strong)] p-4 text-sm font-medium text-mid">{label}</th>
      {children}
    </tr>
  );
}
function BestTag({ className }: { className?: string }) {
  const { t } = useI18n();
  return <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-bold text-good", className)} style={{ background: "color-mix(in srgb, var(--score-high) 14%, transparent)" }}>{t("vs.best")}</span>;
}
