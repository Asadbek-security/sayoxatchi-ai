"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { getResort } from "@/lib/api";
import type { Resort } from "@/lib/types";
import { IconBack } from "@/components/icons";
import { ReviewForm } from "@/components/ReviewForm";
import { Glass } from "@/components/ui";

export default function AddReviewPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useI18n();
  const [resort, setResort] = useState<Resort | null>(null);
  useEffect(() => { getResort(id).then(setResort); }, [id]);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link href={`/resort/${id}`} className="inline-flex h-11 items-center gap-2 text-sm font-medium text-mid hover:text-hi"><IconBack size={20} /> {resort?.name}</Link>
      <Glass level={2} className="p-6 md:p-8">
        <h1 className="font-display text-[30px] font-extrabold leading-tight md:text-4xl">{t("add.title")}</h1>
        {resort && <p className="mb-8 mt-1 text-mid">{resort.name}</p>}
        <ReviewForm resortId={id} />
      </Glass>
    </div>
  );
}
