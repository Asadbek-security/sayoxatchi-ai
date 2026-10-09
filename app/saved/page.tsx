"use client";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { getResortsByIds } from "@/lib/api";
import { useSaved } from "@/lib/store";
import type { Resort } from "@/lib/types";
import { IconSaved } from "@/components/icons";
import { ResortCard } from "@/components/signature";
import { ButtonLink, Condense, EmptyState, Skeleton } from "@/components/ui";

export default function SavedPage() {
  const { t } = useI18n();
  const { ids } = useSaved();
  const [list, setList] = useState<Resort[] | null>(null);
  useEffect(() => { getResortsByIds(ids).then(setList); }, [ids]);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-[34px] font-extrabold leading-tight md:text-5xl">{t("saved.title")}</h1>
      {list === null ? <Skeleton className="h-80" /> : list.length === 0 ? (
        <EmptyState icon={<IconSaved size={32} />} text={t("saved.empty")} action={<ButtonLink href="/search">{t("nav.search")}</ButtonLink>} />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{list.map((r, i) => <Condense key={r.id} i={i}><ResortCard r={r} /></Condense>)}</div>
      )}
    </div>
  );
}
