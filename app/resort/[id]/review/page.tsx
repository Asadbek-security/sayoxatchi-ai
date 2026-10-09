"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, ImagePlus, Star } from "lucide-react";
import { useI18n, type DictKey } from "@/lib/i18n";
import { addReview, getResort } from "@/lib/api";
import type { Resort } from "@/lib/types";
import { Button, Card, cn, inputCls } from "@/components/ui";

const MAX_FILE = 5 * 1024 * 1024;

export default function AddReviewPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useI18n();
  const [resort, setResort] = useState<Resort | null>(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState("");
  const [date, setDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Partial<Record<"rating" | "text" | "date" | "file", DictKey>>>({});
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");

  useEffect(() => { getResort(id).then(setResort); }, [id]);

  const onFile = (f: File | undefined) => {
    if (!f) return;
    if (!["image/jpeg", "image/png"].includes(f.type) || f.size > MAX_FILE) {
      setErrors((e) => ({ ...e, file: "add.errFile" }));
      setFile(null);
      return;
    }
    setErrors((e) => ({ ...e, file: undefined }));
    setFile(f);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!rating) errs.rating = "add.errRating";
    if (text.trim().length < 20) errs.text = "add.errText";
    if (!date) errs.date = "add.errDate";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setState("sending");
    await addReview(id, { rating, text, date });
    setState("done");
  };

  if (state === "done") {
    return (
      <Card className="mx-auto max-w-lg py-12 text-center">
        <CheckCircle2 className="mx-auto size-14 text-brand-500" />
        <p className="mt-4 text-lg font-semibold text-brand-950">{t("add.success")}</p>
        <Link href={`/resort/${id}`} className="mt-6 inline-block rounded-xl bg-brand-600 px-5 py-2.5 font-semibold text-white">{resort?.name ?? "OK"}</Link>
      </Card>
    );
  }

  const Err = ({ k }: { k: keyof typeof errors }) => errors[k] ? <p className="mt-1 text-xs text-red-600">{t(errors[k]!)}</p> : null;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link href={`/resort/${id}`} className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline">
        <ArrowLeft className="size-4" /> {resort?.name}
      </Link>
      <Card>
        <h1 className="text-2xl font-bold text-brand-950">{t("add.title")}</h1>
        {resort && <p className="mt-1 text-slate-500">{resort.name}</p>}
        <form onSubmit={submit} className="mt-6 space-y-5" noValidate>
          <div>
            <span className="mb-2 block text-sm font-semibold">{t("add.rating")}</span>
            <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
              {[1, 2, 3, 4, 5].map((i) => (
                <button type="button" key={i} onClick={() => setRating(i)} onMouseEnter={() => setHover(i)} aria-label={`${i}`}>
                  <Star className={cn("size-9 transition", i <= (hover || rating) ? "fill-amber-400 text-amber-400" : "text-slate-300")} />
                </button>
              ))}
            </div>
            <Err k="rating" />
          </div>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">{t("add.text")}</span>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} placeholder={t("add.textPh")} className={inputCls} maxLength={2000} />
            <span className="mt-1 flex justify-between"><Err k="text" /><span className="ml-auto text-xs text-slate-400">{text.length}/2000</span></span>
          </label>
          <label className="block sm:w-1/2">
            <span className="mb-2 block text-sm font-semibold">{t("add.date")}</span>
            <input type="date" value={date} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setDate(e.target.value)} className={inputCls} />
            <Err k="date" />
          </label>
          <div>
            <span className="mb-2 block text-sm font-semibold">{t("add.photo")}</span>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-brand-200 p-4 transition hover:border-brand-400 hover:bg-brand-50">
              <ImagePlus className="size-6 text-brand-500" />
              <span className="text-sm">{file ? file.name : <span className="text-slate-500">{t("add.photoHint")}</span>}</span>
              <input type="file" accept="image/jpeg,image/png" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
            </label>
            <Err k="file" />
          </div>
          <Button type="submit" disabled={state === "sending"} className="w-full sm:w-auto">
            {state === "sending" ? t("add.sending") : t("add.submit")}
          </Button>
        </form>
      </Card>
    </div>
  );
}
