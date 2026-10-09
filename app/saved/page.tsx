"use client";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { searchResorts } from "@/lib/api";
import { useSaved } from "@/lib/saved";
import type { Resort } from "@/lib/types";
import { ResortCard } from "@/components/ui";

export default function SavedPage() {
  const { t } = useI18n();
  const { ids } = useSaved();
  const [all, setAll] = useState<Resort[]>([]);
  useEffect(() => { searchResorts().then(setAll); }, []);
  const list = all.filter((r) => ids.includes(r.id));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-brand-950 md:text-3xl">{t("saved.title")}</h1>
      {list.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-brand-200 bg-white py-16 text-center">
          <Heart className="size-10 text-brand-300" />
          <p className="max-w-sm text-slate-600">{t("saved.empty")}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{list.map((r) => <ResortCard key={r.id} r={r} />)}</div>
      )}
    </div>
  );
}
