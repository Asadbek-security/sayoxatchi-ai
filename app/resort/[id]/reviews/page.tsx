"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useI18n, type DictKey } from "@/lib/i18n";
import { getResort, getReviews } from "@/lib/api";
import type { Resort, Review, Sentiment, Topic } from "@/lib/types";
import { IconBack, IconEdit, IconModeration } from "@/components/icons";
import { ReviewItem, SUSPICIOUS } from "@/components/signature";
import { ButtonLink, Chip, Condense, EmptyState, Field, Glass, Select, Skeleton } from "@/components/ui";

type Rel = "all" | "reliable" | "suspicious";

export default function ReviewsPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useI18n();
  const [resort, setResort] = useState<Resort | null>(null);
  const [list, setList] = useState<Review[] | null>(null);
  const [sent, setSent] = useState<"all" | Sentiment>("all");
  const [topic, setTopic] = useState<"" | Topic>("");
  const [rel, setRel] = useState<Rel>("all");

  useEffect(() => { getResort(id).then(setResort); getReviews(id).then(setList); }, [id]);

  const topics = useMemo(() => Array.from(new Set(list?.flatMap((r) => r.topics) ?? [])), [list]);
  const shown = (list ?? []).filter((r) =>
    (sent === "all" || r.sentiment === sent) &&
    (!topic || r.topics.includes(topic)) &&
    (rel === "all" || (rel === "suspicious" ? r.fake_probability >= SUSPICIOUS : r.fake_probability < SUSPICIOUS)),
  );
  const count = (s: Sentiment) => list?.filter((r) => r.sentiment === s).length ?? 0;

  return (
    <div className="space-y-6">
      <Link href={`/resort/${id}`} className="inline-flex h-11 items-center gap-2 text-sm font-medium text-mid hover:text-hi"><IconBack size={20} /> {resort?.name}</Link>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-[34px] font-extrabold leading-tight md:text-5xl">{t("rv.title")}</h1>
        <ButtonLink href={`/resort/${id}/review`}><IconEdit size={20} /> {t("resort.addReview")}</ButtonLink>
      </div>

      <Glass level={2} className="space-y-5 p-5 md:p-6">
        <div>
          <span className="mb-2.5 block text-sm font-semibold">{t("rv.sentiment")}</span>
          <div className="-mx-1 no-scrollbar flex gap-2 overflow-x-auto px-1 pb-1">
            <Chip active={sent === "all"} onClick={() => setSent("all")}>{t("review.all")} <span className="num opacity-70">{list?.length ?? 0}</span></Chip>
            {(["positive", "neutral", "negative"] as const).map((s) => (
              <Chip key={s} active={sent === s} onClick={() => setSent(s)}>{t(`review.${s}` as DictKey)} <span className="num opacity-70">{count(s)}</span></Chip>
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("rv.topic")}>
            <Select value={topic} onChange={(e) => setTopic(e.target.value as Topic | "")}>
              <option value="">{t("rv.allTopics")}</option>
              {topics.map((tp) => <option key={tp} value={tp}>{t(`topic.${tp}` as DictKey)}</option>)}
            </Select>
          </Field>
          <Field label={t("rv.reliability")}>
            <Select value={rel} onChange={(e) => setRel(e.target.value as Rel)}>
              <option value="all">{t("rv.anyReliability")}</option>
              <option value="reliable">{t("rv.onlyReliable")}</option>
              <option value="suspicious">{t("rv.onlySuspicious")}</option>
            </Select>
          </Field>
        </div>
      </Glass>

      {list === null ? <Skeleton className="h-64" /> : shown.length === 0 ? (
        <EmptyState icon={<IconModeration size={32} />} text={t("rv.empty")} />
      ) : (
        <>
          <p className="text-sm text-low"><span className="num text-base text-hi">{shown.length}</span> {t("rv.shown")}</p>
          <div className="grid gap-3 lg:grid-cols-2">{shown.map((r, i) => <Condense key={r.id} i={i % 6}><ReviewItem r={r} /></Condense>)}</div>
        </>
      )}
    </div>
  );
}
