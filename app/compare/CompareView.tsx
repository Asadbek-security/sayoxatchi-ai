"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, ScanSearch, Upload } from "lucide-react";
import { useI18n, type DictKey } from "@/lib/i18n";
import { compareImages, getResort } from "@/lib/api";
import { levelColor, scoreLevel } from "@/lib/score";
import type { ImageCompareResult } from "@/lib/types";
import { Button, Card, cn } from "@/components/ui";

type Slot = { file: File; url: string } | null;
const sevStyle = { high: "bg-red-50 text-red-700", medium: "bg-amber-50 text-amber-700", low: "bg-emerald-50 text-emerald-700" };

export default function CompareView() {
  const { t, l } = useI18n();
  const resortId = useSearchParams().get("resort");
  const [resortName, setResortName] = useState("");
  const [ad, setAd] = useState<Slot>(null);
  const [real, setReal] = useState<Slot>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ImageCompareResult | null>(null);
  const [error, setError] = useState(false);

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
    if (!ad || !real) { setError(true); return; }
    setError(false);
    setBusy(true);
    setResult(await compareImages(ad.file, real.file));
    setBusy(false);
  };

  const lvl = scoreLevel(result?.match_percent ?? null);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-950 md:text-3xl">{t("cmp.title")}</h1>
        <p className="mt-1 text-slate-600">{resortName && <b className="text-brand-700">{resortName} · </b>}{t("cmp.subtitle")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <UploadSlot label={t("cmp.ad")} slot={ad} onPick={pick(setAd)} />
        <UploadSlot label={t("cmp.real")} slot={real} onPick={pick(setReal)} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={run} disabled={busy}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : <ScanSearch className="size-4" />}
          {busy ? t("cmp.analyzing") : t("cmp.analyze")}
        </Button>
        <Button variant="ghost" onClick={demo} disabled={busy}>{t("cmp.demo")}</Button>
        {error && <span className="text-sm text-red-600">{t("cmp.need")}</span>}
      </div>

      {result && (
        <Card>
          <div className="grid gap-6 md:grid-cols-[200px_1fr]">
            <div className={cn("flex flex-col items-center justify-center rounded-2xl p-6", levelColor[lvl].bg)}>
              <span className="text-sm font-semibold text-slate-600">{t("cmp.match")}</span>
              <span className={cn("text-5xl font-extrabold", levelColor[lvl].text)}>{result.match_percent}%</span>
            </div>
            <div>
              <h2 className="mb-3 font-bold text-brand-950">{t("cmp.diffs")}</h2>
              <ul className="space-y-2">
                {result.differences.map((d, i) => (
                  <li key={i} className="flex items-start justify-between gap-3 rounded-xl border border-brand-50 p-3 text-sm">
                    <span>{l(d.label)}</span>
                    <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-xs font-medium", sevStyle[d.severity])}>{t(`cmp.sev.${d.severity}` as DictKey)}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-slate-500">{l(result.note)}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

function UploadSlot({ label, slot, onPick }: { label: string; slot: Slot; onPick: (f?: File) => void }) {
  const { t } = useI18n();
  return (
    <label className="group block cursor-pointer"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); onPick(e.dataTransfer.files[0]); }}>
      <span className="mb-2 block text-sm font-semibold text-brand-900">{label}</span>
      <div className="relative grid aspect-[4/3] place-items-center overflow-hidden rounded-2xl border-2 border-dashed border-brand-200 bg-white transition group-hover:border-brand-400">
        {slot ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={slot.url} alt={label} className="absolute inset-0 size-full object-cover" />
            <span className="absolute bottom-2 right-2 rounded-lg bg-white/90 px-2 py-1 text-xs font-semibold text-brand-700">{t("cmp.change")}</span>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-brand-500">
            <Upload className="size-8" />
            <span className="text-sm font-semibold">{t("cmp.upload")}</span>
            <span className="text-xs text-slate-400">{t("add.photoHint")}</span>
          </div>
        )}
      </div>
      <input type="file" accept="image/jpeg,image/png" className="sr-only" onChange={(e) => onPick(e.target.files?.[0])} />
    </label>
  );
}
