"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { searchResorts } from "@/lib/api";
import { PHOTOS } from "@/lib/photos";
import { LOCATION_PHOTOS } from "@/lib/scene";
import type { Resort } from "@/lib/types";
import { PHOTO_CREDITS } from "@/components/CityBackdrop";
import { IconImage } from "@/components/icons";
import { Glass, SectionTitle } from "@/components/ui";

export default function CreditsPage() {
  const { t } = useI18n();
  const [resorts, setResorts] = useState<Resort[]>([]);
  useEffect(() => { searchResorts().then(setResorts); }, []);
  const bg = [...PHOTO_CREDITS, ...Object.values(LOCATION_PHOTOS).map((p) => ({ place: p.place, author: p.credit, license: p.license, url: p.url }))];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="flex items-center gap-3 font-display text-[34px] font-extrabold leading-tight md:text-5xl"><IconImage size={32} className="text-mint" /> {t("credits.title")}</h1>
        <p className="mt-2 text-lg text-mid">{t("credits.sub")}</p>
      </div>
      <Glass solid className="p-6">
        <SectionTitle>{t("credits.backgrounds")}</SectionTitle>
        <ul className="grid gap-2 sm:grid-cols-2">
          {bg.map((c) => (
            <li key={c.url}><a href={c.url} target="_blank" rel="noreferrer" className="block rounded-2xl bg-[color:var(--glass-bottom)] p-3 text-sm hover:bg-[color:var(--glass-top)]">
              <span className="font-semibold text-hi">{c.place}</span><span className="block text-xs text-low">{c.author} · {c.license}</span>
            </a></li>
          ))}
        </ul>
      </Glass>
      <Glass solid className="p-6">
        <SectionTitle>{t("credits.cards")}</SectionTitle>
        <ul className="grid gap-2 sm:grid-cols-2">
          {resorts.filter((r) => PHOTOS[r.id]).map((r) => (
            <li key={r.id} className="flex items-center gap-3 rounded-2xl bg-[color:var(--glass-bottom)] p-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/photos/${r.id}.webp`} alt="" loading="lazy" className="size-12 shrink-0 rounded-xl object-cover" />
              <span className="min-w-0 text-sm">
                <Link href={`/resort/${r.id}`} className="block truncate font-semibold text-hi hover:underline">{r.name}</Link>
                <a href={PHOTOS[r.id].url} target="_blank" rel="noreferrer" className="block truncate text-xs text-low hover:text-hi">{PHOTOS[r.id].author} · {PHOTOS[r.id].license}</a>
              </span>
            </li>
          ))}
        </ul>
      </Glass>
    </div>
  );
}
