"use client";
import { useEffect, useRef, useState } from "react";
import { useI18n, type DictKey } from "@/lib/i18n";
import { LOCATION_PHOTOS, onScene } from "@/lib/scene";
import type { LocationType } from "@/lib/types";

// Fon: to‘rtta dam olish zonasi — chap yuqoridan o‘ng pastga "/" bilan bo‘lingan diagonal lavhalar.
// Rasmlar: Wikimedia Commons (mualliflar — PHOTO_CREDITS).
export const CITIES: { key: DictKey; src: string; pos: string }[] = [
  { key: "zone.chimyon", src: "/bg/chimyon.webp", pos: "45% 50%" },
  { key: "zone.chorvoq", src: "/bg/chorvoq.webp", pos: "55% 55%" },
  { key: "zone.urungach", src: "/bg/urungach.webp", pos: "50% 45%" },
  { key: "zone.aydarkul", src: "/bg/aydarkul.webp", pos: "50% 55%" },
];

export const PHOTO_CREDITS = [
  { place: "Chimyon", author: "LBM1948", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:Chimgan_09.jpg" },
  { place: "Chorvoq suv ombori", author: "Muxriddin Azimov", license: "CC0", url: "https://commons.wikimedia.org/wiki/File:Chorvoq_suv_ombori_20230420.jpg" },
  { place: "Yuqori Urungach", author: "AnastasiyaPunko", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:UpperUrungach_2.jpg" },
  { place: "Aydarko‘l", author: "Galiev Yaroslav", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:%D0%97%D0%B0%D0%BA%D0%B0%D1%82_%D0%BD%D0%B0_%D0%BE%D0%B7%D0%B5%D1%80%D0%B5_%D0%90%D0%B9%D0%B4%D0%B0%D1%80%D0%BA%D1%83%D0%BB%D1%8C.jpg" },
];

const W = 25; // har bir lavha kengligi, %

export function CityBackdrop() {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const [scene, setSceneState] = useState<LocationType | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Bosh sahifadagi lokatsiya bo‘limi fonni almashtiradi
  useEffect(() => onScene((s) => {
    if (s === "preload") { setLoaded(true); return; }
    if (s) setLoaded(true);
    setSceneState(s);
  }), []);

  // Parallaks + hero’dan keyin shahar asta xiralashadi va qorayadi
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      const k = Math.min(1, y / (window.innerHeight * 0.8));
      el.style.setProperty("--py", reduce ? "0px" : `${-Math.min(40, y * 0.15)}px`);
      el.style.setProperty("--fy", reduce ? "0px" : `${-Math.min(40, y * 0.3)}px`);
      el.style.setProperty("--bb", `${(k * 10).toFixed(1)}px`);
      el.style.setProperty("--dim", (k * 0.45).toFixed(3));
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", on, { passive: true });
    return () => { window.removeEventListener("scroll", on); cancelAnimationFrame(raf); };
  }, []);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-bg-0 [--s:7] max-md:[--s:12]">
      <div className="absolute inset-0 transition-opacity duration-[900ms] ease-[var(--ease)]" style={{ opacity: scene ? 0 : 1 }}>
      <div
        className="absolute inset-x-0 -top-10 -bottom-10 animate-[fade-in_900ms_var(--ease)_both]"
        style={{ transform: "translate3d(0, var(--py, 0px), 0)", filter: "blur(var(--bb, 0px))" }}
      >
        {CITIES.map((c, i) => {
          const L = i * W;
          const R = L + W;
          const s = "calc(var(--s) * 1%)";
          return (
            <div
              key={c.key}
              className="absolute inset-0"
              style={{
                clipPath: `polygon(calc(${L}% + ${s}) 0, calc(${R}% + ${s}) 0, calc(${R}% - ${s}) 100%, calc(${L}% - ${s}) 100%)`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c.src}
                alt=""
                decoding="async"
                fetchPriority={i < 2 ? "high" : "low"}
                className="city-photo absolute top-0 h-full object-cover"
                style={{ left: `calc(${L}% - ${s})`, width: `calc(${W}% + 2 * ${s})`, objectPosition: c.pos }}
              />
            </div>
          );
        })}

        {/* zumrad rang gradatsiyasi */}
        <div className="city-grade absolute inset-0" />

        {/* "/" shisha ajratgichlar */}
        <svg className="absolute inset-0 size-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {[1, 2, 3].map((i) => (
            <g key={i} className="[--x:calc(var(--s)*1)]">
              <line x1={i * W + 7} y1="0" x2={i * W - 7} y2="100" className="max-md:hidden" stroke="rgba(139,245,208,.22)" strokeWidth="10" vectorEffect="non-scaling-stroke" style={{ filter: "blur(6px)" }} />
              <line x1={i * W + 7} y1="0" x2={i * W - 7} y2="100" className="max-md:hidden" stroke="rgba(255,255,255,.55)" strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
              <line x1={i * W + 12} y1="0" x2={i * W - 12} y2="100" className="md:hidden" stroke="rgba(255,255,255,.5)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            </g>
          ))}
        </svg>

        {/* zona nomlari — "/ CHORVOQ" */}
        <div className="absolute inset-x-0 top-[132px] hidden md:block">
          {CITIES.map((c, i) => (
            <span
              key={c.key}
              className="absolute -translate-x-1/2 font-display text-[11px] font-bold uppercase tracking-[0.32em] text-[color:var(--text-mid)]"
              style={{ left: `${i * W + W / 2 - 3}%` }}
            >
              <span className="mr-1.5 text-[color:var(--mint)]">/</span>
              {t(c.key)}
            </span>
          ))}
        </div>
      </div>

      {/* tuman qatlami — 0.3× parallaks */}
      <div className="city-fog absolute inset-x-[-10%] bottom-[-5%] h-[55%]" style={{ transform: "translate3d(0, var(--fy, 0px), 0)" }} />

      {/* matn ostidagi qoraytirish */}
      <div className="city-scrim absolute inset-0" />
      <div className="absolute inset-0 bg-bg-0" style={{ opacity: "var(--dim, 0)" }} />
      </div>

      {/* lokatsiya fonlari — aniq (blur yo‘q), sekin "nafas oluvchi" zoom bilan almashadi */}
      {loaded && (Object.keys(LOCATION_PHOTOS) as LocationType[]).map((k) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={k}
          src={LOCATION_PHOTOS[k].src}
          alt=""
          decoding="async"
          className="loc-photo absolute inset-0 size-full object-cover transition-[opacity,transform] duration-[1100ms] ease-[var(--ease)]"
          style={{ objectPosition: LOCATION_PHOTOS[k].pos, opacity: scene === k ? 1 : 0, transform: scene === k ? "scale(1)" : "scale(1.06)" }}
        />
      ))}
      <div className="loc-scrim absolute inset-0 transition-opacity duration-[900ms]" style={{ opacity: scene ? 1 : 0 }} />
      <Grain />
    </div>
  );
}

/** Kursor ostidagi shisha yuzaga yaltirash koordinatalarini beradi */
export function GlassPointer() {
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    let raf = 0;
    let ev: PointerEvent | null = null;
    const tick = () => {
      raf = 0;
      if (!ev) return;
      const el = (ev.target as Element | null)?.closest?.(".glass") as HTMLElement | null;
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${(((ev.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
      el.style.setProperty("--my", `${(((ev.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
    };
    const on = (e: PointerEvent) => { ev = e; if (!raf) raf = requestAnimationFrame(tick); };
    document.addEventListener("pointermove", on, { passive: true });
    return () => document.removeEventListener("pointermove", on);
  }, []);
  return null;
}

/** 3–4% don (grain) — gradient "zinapoyasi"ni yo‘qotadi */
export function Grain() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-[0.05]"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
      }}
    />
  );
}
