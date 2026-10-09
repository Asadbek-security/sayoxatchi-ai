"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "motion/react";
import { useI18n, type DictKey } from "@/lib/i18n";
import { addReview, getResort } from "@/lib/api";
import type { Resort } from "@/lib/types";
import { IconBack, IconCheck, IconStar, IconUpload } from "@/components/icons";
import { Button, ButtonLink, cn, Field, fieldCls, Glass } from "@/components/ui";

const MAX_FILE = 5 * 1024 * 1024;
type Errors = Partial<Record<"rating" | "text" | "date" | "file", DictKey>>;

export default function AddReviewPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useI18n();
  const [resort, setResort] = useState<Resort | null>(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState("");
  const [date, setDate] = useState("");
  const [file, setFile] = useState<{ f: File; url: string } | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");

  useEffect(() => { getResort(id).then(setResort); }, [id]);

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

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    const errs = validate();
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;
    setState("sending");
    await addReview(id, { rating, text, date });
    setState("done");
  };

  if (state === "done") {
    return (
      <Glass level={3} className="mx-auto max-w-lg p-10 text-center">
        <motion.span initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="mx-auto grid size-20 place-items-center rounded-full bg-[color:var(--jade)] text-on-jade"><IconCheck size={32} /></motion.span>
        <p className="mt-6 font-display text-xl font-bold">{t("add.success")}</p>
        <ButtonLink href={`/resort/${id}`} className="mt-6">{t("add.backTo")}</ButtonLink>
      </Glass>
    );
  }

  const shown = hover || rating;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link href={`/resort/${id}`} className="inline-flex h-11 items-center gap-2 text-sm font-medium text-mid hover:text-hi"><IconBack size={20} /> {resort?.name}</Link>
      <Glass level={2} className="p-6 md:p-8">
        <h1 className="font-display text-[30px] font-extrabold leading-tight md:text-4xl">{t("add.title")}</h1>
        {resort && <p className="mt-1 text-mid">{resort.name}</p>}
        <form onSubmit={submit} noValidate className="mt-8 space-y-6">
          <fieldset>
            <legend className="mb-3 text-sm font-semibold">{t("add.rating")}</legend>
            <div className="grid grid-cols-5 gap-2" onMouseLeave={() => setHover(0)} role="radiogroup" aria-label={t("add.rating")}>
              {[1, 2, 3, 4, 5].map((i) => (
                <button type="button" key={i} role="radio" aria-checked={rating === i} aria-label={`${i} / 5`}
                  onClick={() => setRating(i)} onMouseEnter={() => setHover(i)}
                  className={cn("glass g1 flex h-16 flex-col items-center justify-center gap-0.5 rounded-2xl! transition [--r:16px]",
                    i <= shown ? "text-[color:var(--score-mid)]" : "text-low")}
                  style={i <= shown ? { background: "linear-gradient(180deg, color-mix(in srgb, var(--score-mid) 24%, transparent), color-mix(in srgb, var(--score-mid) 8%, transparent))" } : undefined}>
                  <IconStar size={24} filled={i <= shown} />
                  <span className="num text-xs">{i}</span>
                </button>
              ))}
            </div>
            {errors.rating && <p role="alert" className="mt-2 text-xs font-medium text-bad">{t(errors.rating)}</p>}
          </fieldset>

          <Field label={t("add.text")} error={errors.text && t(errors.text)}>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} maxLength={2000} placeholder={t("add.textPh")}
              className={cn(fieldCls, "h-auto resize-y py-3 leading-relaxed")} aria-invalid={!!errors.text} />
          </Field>
          <p className="-mt-4 text-right text-xs text-low"><span className="num">{text.length}</span>/2000</p>

          <div className="sm:w-1/2">
            <Field label={t("add.date")} error={errors.date && t(errors.date)}>
              <input type="date" value={date} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setDate(e.target.value)} className={fieldCls} aria-invalid={!!errors.date} />
            </Field>
          </div>

          <div>
            <span className="mb-2 block text-sm font-semibold">{t("add.photo")}</span>
            <label className="dash-iri flex cursor-pointer items-center gap-4 rounded-3xl bg-[color:var(--glass-bottom)] p-4 transition hover:bg-[color:var(--glass-top)]"
              onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); onFile(e.dataTransfer.files[0]); }}>
              {file ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={file.url} alt="" className="size-16 rounded-2xl object-cover" />
              ) : (
                <span className="grid size-16 place-items-center rounded-2xl bg-[color:var(--glass-top)] text-mint"><IconUpload size={32} /></span>
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
      </Glass>
    </div>
  );
}
