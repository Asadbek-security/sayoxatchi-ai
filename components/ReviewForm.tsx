"use client";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useI18n, type DictKey } from "@/lib/i18n";
import { addReview } from "@/lib/api";
import type { Review } from "@/lib/types";
import { IconCheck, IconStar, IconUpload } from "./icons";
import { Button, cn, Field, fieldCls } from "./ui";

const MAX_FILE = 5 * 1024 * 1024;
type Errors = Partial<Record<"rating" | "text" | "date" | "file", DictKey>>;

/** Sharh qoldirish formasi — maskan sahifasida ham, alohida sahifada ham ishlatiladi */
export function ReviewForm({ resortId, onAdded }: { resortId: string; onAdded?: (r: Review) => void }) {
  const { t, lang } = useI18n();
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState("");
  const [date, setDate] = useState("");
  const [file, setFile] = useState<{ f: File; url: string } | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");

  const validate = (): Errors => {
    const e: Errors = {};
    if (!rating) e.rating = "add.errRating";
    if (text.trim().length < 20) e.text = "add.errText";
    if (!date) e.date = "add.errDate";
    if (errors.file) e.file = errors.file;
    return e;
  };
  // jonli (inline) validatsiya — birinchi urinishdan keyin
  useEffect(() => { if (touched) setErrors(validate()); }, [rating, text, date]); // eslint-disable-line react-hooks/exhaustive-deps

  const onFile = (f?: File) => {
    if (!f) return;
    if (!["image/jpeg", "image/png"].includes(f.type) || f.size > MAX_FILE) {
      setErrors((e) => ({ ...e, file: "add.errFile" }));
      setFile(null);
      return;
    }
    setErrors((e) => ({ ...e, file: undefined }));
    setFile({ f, url: URL.createObjectURL(f) });
  };

  const reset = () => {
    setName(""); setRating(0); setText(""); setDate(""); setFile(null); setErrors({}); setTouched(false); setState("idle");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    const errs = validate();
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;
    setState("sending");
    const review = await addReview(resortId, { author: name.trim() || t("add.guest"), rating, text, date, language: lang });
    onAdded?.(review);
    setState("done");
  };

  if (state === "done") {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center" role="status">
        <motion.span initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="grid size-16 place-items-center rounded-full bg-[color:var(--jade)] text-on-jade"><IconCheck size={32} /></motion.span>
        <p className="max-w-sm font-display text-lg font-bold">{t("add.successInline")}</p>
        <Button variant="glass" onClick={reset}>{t("add.another")}</Button>
      </div>
    );
  }

  const shown = hover || rating;

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <fieldset>
        <legend className="mb-3 text-sm font-semibold">{t("add.rating")}</legend>
        <div className="grid grid-cols-5 gap-2" onMouseLeave={() => setHover(0)} role="radiogroup" aria-label={t("add.rating")}>
          {[1, 2, 3, 4, 5].map((i) => (
            <button type="button" key={i} role="radio" aria-checked={rating === i} aria-label={`${i} / 5`}
              onClick={() => setRating(i)} onMouseEnter={() => setHover(i)}
              className={cn("glass g1 flex h-14 flex-col items-center justify-center gap-0.5 rounded-2xl! transition [--r:16px]", i <= shown ? "text-[color:var(--score-mid)]" : "text-low")}
              style={i <= shown ? { background: "linear-gradient(180deg, color-mix(in srgb, var(--score-mid) 24%, transparent), color-mix(in srgb, var(--score-mid) 8%, transparent))" } : undefined}>
              <IconStar size={20} filled={i <= shown} />
              <span className="num text-[11px]">{i}</span>
            </button>
          ))}
        </div>
        {errors.rating && <p role="alert" className="mt-2 text-xs font-medium text-bad">{t(errors.rating)}</p>}
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("add.name")}>
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} placeholder={t("add.namePh")} className={fieldCls} autoComplete="name" />
        </Field>
        <Field label={t("add.date")} error={errors.date && t(errors.date)}>
          <input type="date" value={date} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setDate(e.target.value)} className={fieldCls} aria-invalid={!!errors.date} />
        </Field>
      </div>

      <div>
        <Field label={t("add.text")} error={errors.text && t(errors.text)}>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} maxLength={2000} placeholder={t("add.textPh")}
            className={cn(fieldCls, "h-auto resize-y py-3 leading-relaxed")} aria-invalid={!!errors.text} />
        </Field>
        <p className="mt-1 text-right text-xs text-low"><span className="num">{text.length}</span>/2000</p>
      </div>

      <div>
        <span className="mb-2 block text-sm font-semibold">{t("add.photo")}</span>
        <label className="dash-iri flex cursor-pointer items-center gap-4 rounded-3xl bg-[color:var(--glass-bottom)] p-3 transition hover:bg-[color:var(--glass-top)]"
          onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); onFile(e.dataTransfer.files[0]); }}>
          {file ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={file.url} alt="" className="size-14 rounded-2xl object-cover" />
          ) : (
            <span className="grid size-14 place-items-center rounded-2xl bg-[color:var(--glass-top)] text-mint"><IconUpload size={24} /></span>
          )}
          <span className="min-w-0 text-sm">
            <span className="block truncate font-medium text-hi">{file ? file.f.name : t("cmp.upload")}</span>
            <span className="text-low">{t("add.photoHint")}</span>
          </span>
          <input type="file" accept="image/jpeg,image/png" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
        </label>
        {errors.file && <p role="alert" className="mt-2 text-xs font-medium text-bad">{t(errors.file)}</p>}
      </div>

      <Button type="submit" size="lg" disabled={state === "sending"} className="w-full sm:w-auto">
        {state === "sending" ? t("add.sending") : t("add.submit")}
      </Button>
    </form>
  );
}
