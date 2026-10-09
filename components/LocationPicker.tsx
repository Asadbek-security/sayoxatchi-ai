"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { useI18n, type DictKey } from "@/lib/i18n";
import { LOCATION_TYPES, searchResorts } from "@/lib/api";
import { LOCATION_PHOTOS, setScene } from "@/lib/scene";
import type { LocationType, Resort } from "@/lib/types";
import { IconArrowRight, locationIcon } from "./icons";
import { ButtonLink, cn, EASE, Glass, ScoreBadge } from "./ui";

/**
 * "Qayerda dam olmoqchisiz?" — lokatsiya kategoriyalari.
 * Har bir kategoriya — to‘liq ekranli "slayd"; u ekran markaziga kelganda butun sayt foni shu manzaraga almashadi.
 */
export function LocationPicker() {
  const { t } = useI18n();
  const [resorts, setResorts] = useState<Resort[]>([]);
  const [active, setActive] = useState<LocationType | null>(null);
  const section = useRef<HTMLElement>(null);
  const slides = useRef<Partial<Record<LocationType, HTMLElement | null>>>({});
  const chipBar = useRef<HTMLDivElement>(null);

  useEffect(() => { searchResorts().then(setResorts); }, []);

  // Bo‘lim yaqinlashganda rasmlarni oldindan yuklash
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setScene("preload"); io.disconnect(); } }, { rootMargin: "900px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Ekran markazidagi slayd — faol kategoriya
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const mid = window.innerHeight / 2;
      let cur: LocationType | null = null;
      for (const k of LOCATION_TYPES) {
        const r = slides.current[k]?.getBoundingClientRect();
        if (r && r.top <= mid && r.bottom >= mid) cur = k;
      }
      setActive(cur);
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); cancelAnimationFrame(raf); };
  }, []);

  useEffect(() => {
    setScene(active);
    // mobil chip-panelda faol kategoriyani markazga surish
    const bar = chipBar.current;
    const btn = active && bar?.querySelector<HTMLElement>(`[data-k="${active}"]`);
    if (bar && btn) bar.scrollTo({ left: btn.offsetLeft - (bar.clientWidth - btn.clientWidth) / 2, behavior: "smooth" });
  }, [active]);
  useEffect(() => () => setScene(null), []);

  const goTo = (k: LocationType) => slides.current[k]?.scrollIntoView({ behavior: "smooth", block: "center" });

  return (
    <section ref={section} id="locations" aria-labelledby="loc-title">
      <div className="mb-8">
        <h2 id="loc-title" className="font-display text-[30px] font-extrabold leading-tight md:text-5xl">{t("loc.title")}</h2>
        <p className="mt-2 max-w-2xl text-lg text-mid">{t("loc.sub")}</p>
      </div>

      {/* Kategoriya plitkalari — manzara rasmi bilan */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        {LOCATION_TYPES.map((k, i) => {
          const Icon = locationIcon[k];
          const n = resorts.filter((r) => r.locations.includes(k)).length;
          return (
            <motion.div key={k} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: EASE, delay: i * 0.06 }}>
              <Link href={`/search?loc=${k}`} className="glass g2 glass-hover group relative block aspect-[3/4] overflow-hidden p-0 sm:aspect-[4/5]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={LOCATION_PHOTOS[k].src} alt={`${t(`loc.${k}` as DictKey)} — ${LOCATION_PHOTOS[k].place}`} loading="lazy" decoding="async"
                  className="absolute inset-0 size-full rounded-[24px] object-cover transition-transform duration-700 group-hover:scale-[1.05]" style={{ objectPosition: LOCATION_PHOTOS[k].pos }} />
                <span className="absolute inset-0 rounded-[24px] bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <span className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2 md:inset-x-4 md:bottom-4">
                  <span>
                    <span className="mb-2 grid size-10 place-items-center rounded-2xl bg-white/15 text-white backdrop-blur-md"><Icon size={20} /></span>
                    <span className="block font-display text-[17px] font-bold leading-tight text-white md:text-xl">{t(`loc.${k}` as DictKey)}</span>
                    <span className="text-xs text-white/75"><span className="num">{n}</span> {t("loc.count")}</span>
                  </span>
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/15 text-white backdrop-blur-md transition group-hover:bg-white/30"><IconArrowRight size={16} /></span>
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Mobil: yopishqoq kategoriya chiplari */}
      <div className="sticky top-[84px] z-30 mt-10 lg:hidden">
        <div ref={chipBar} className="glass g1 glass-solid no-scrollbar mx-auto flex w-fit max-w-full gap-1 overflow-x-auto rounded-full! p-1 [--r:999px]">
          {LOCATION_TYPES.map((k) => {
            const Icon = locationIcon[k];
            return (
              <button key={k} data-k={k} onClick={() => goTo(k)} aria-current={active === k}
                className={cn("flex h-10 shrink-0 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold transition", active === k ? "bg-[color:var(--jade)] text-on-jade" : "text-mid")}>
                <Icon size={16} /> {t(`loc.${k}` as DictKey)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative lg:grid lg:grid-cols-[1fr_240px] lg:gap-8">
        {/* Slaydlar */}
        <div>
          {LOCATION_TYPES.map((k, i) => (
            <Slide key={k} k={k} i={i} active={active === k} resorts={resorts.filter((r) => r.locations.includes(k))}
              setRef={(el) => { slides.current[k] = el; }} />
          ))}
        </div>

        {/* Desktop: yopishqoq navigatsiya — miniatyura + nom */}
        <nav aria-label={t("loc.title")} className="hidden lg:block">
          <ol className="glass g1 sticky top-[calc(50vh-150px)] space-y-1 p-2">
            {LOCATION_TYPES.map((k, i) => (
              <li key={k}>
                <button onClick={() => goTo(k)} aria-current={active === k}
                  className={cn("flex w-full items-center gap-3 rounded-2xl p-2 text-left transition", active === k ? "bg-[color:var(--glass-top)] ring-1 ring-[color:var(--mint)]/40" : "hover:bg-[color:var(--glass-bottom)]")}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={LOCATION_PHOTOS[k].src} alt="" loading="lazy" className={cn("size-12 rounded-xl object-cover transition", active !== k && "opacity-70 grayscale-[.4]")} />
                  <span className="min-w-0">
                    <span className="num block text-[11px] text-low">0{i + 1}</span>
                    <span className={cn("block truncate text-sm font-semibold", active === k ? "text-hi" : "text-mid")}>{t(`loc.${k}` as DictKey)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </section>
  );
}

function Slide({ k, i, active, resorts, setRef }: { k: LocationType; i: number; active: boolean; resorts: Resort[]; setRef: (el: HTMLElement | null) => void }) {
  const { t } = useI18n();
  const Icon = locationIcon[k];
  const scored = resorts.filter((r) => r.trust_score != null);
  const avg = scored.length ? Math.round(scored.reduce((s, r) => s + r.trust_score!, 0) / scored.length) : null;
  const photo = LOCATION_PHOTOS[k];
  return (
    <article ref={setRef} data-loc={k} className="flex min-h-[100svh] items-end pb-28 pt-40 md:items-center md:py-20">
      <motion.div
        animate={{ opacity: active ? 1 : 0.35, y: active ? 0 : 16, scale: active ? 1 : 0.98 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="w-full max-w-xl"
      >
        <Glass level={3} className="p-5 md:p-8">
          <div className="flex items-center gap-3">
            <span className="glass g1 grid size-14 place-items-center rounded-2xl! text-mint [--r:16px]"><Icon size={32} active={active} /></span>
            <span className="num text-sm text-low">0{i + 1} / 04</span>
          </div>
          <h3 className="mt-5 font-display text-[34px] font-extrabold leading-[1.1] md:text-[48px]">{t(`loc.${k}` as DictKey)}</h3>
          <p className="mt-3 max-w-[52ch] text-[15px] leading-relaxed text-mid md:text-[17px]">{t(`loc.${k}.d` as DictKey)}</p>

          <dl className="mt-5 flex gap-8 md:mt-6">
            <div><dd className="num text-3xl">{resorts.length}</dd><dt className="text-sm text-low">{t("loc.count")}</dt></div>
            <div><dd className="num text-3xl text-mint">{avg ?? "—"}</dd><dt className="text-sm text-low">{t("loc.avg")}</dt></div>
          </dl>

          {resorts.length > 0 && (
            <ul className="mt-6 hidden space-y-2 md:block">
              {resorts.slice(0, 3).map((r) => (
                <li key={r.id}>
                  <Link href={`/resort/${r.id}`} className="flex items-center gap-3 rounded-2xl bg-[color:var(--glass-bottom)] p-2.5 pr-4 transition hover:bg-[color:var(--glass-top)]">
                    <ScoreBadge score={r.trust_score} size={44} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-hi">{r.name}</span>
                      <span className="block truncate text-xs text-low">{r.region}, {r.district}</span>
                    </span>
                    <IconArrowRight size={16} className="text-mint" />
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <ButtonLink href={`/search?loc=${k}`} size="lg" className="mt-6">{t("loc.cta")} <IconArrowRight size={20} /></ButtonLink>
          <p className="mt-5 text-[11px] text-low">
            {t("loc.photo")}: <a href={photo.url} target="_blank" rel="noreferrer" className="hover:text-hi">{photo.place} — {photo.credit}, {photo.license}</a>
          </p>
        </Glass>
      </motion.div>
    </article>
  );
}
