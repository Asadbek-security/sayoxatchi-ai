"use client";
import { useEffect, useRef } from "react";
import { useI18n, type DictKey } from "@/lib/i18n";

// Fon: to‘rtta shahar — chap yuqoridan o‘ng pastga "/" bilan bo‘lingan diagonal lavhalar.
// Rasmlar: Wikimedia Commons (mualliflar — PHOTO_CREDITS).
export const CITIES: { key: DictKey; src: string; pos: string }[] = [
  { key: "city.navoiy", src: "/bg/navoiy.webp", pos: "50% 45%" },
  { key: "city.toshkent", src: "/bg/toshkent.webp", pos: "62% 30%" },
  { key: "city.fargona", src: "/bg/fargona.webp", pos: "50% 50%" },
  { key: "city.namangan", src: "/bg/namangan.webp", pos: "55% 45%" },
];

export const PHOTO_CREDITS = [
  { place: "Rabati Malik, Navoiy", author: "Bernard Gagnon", license: "CC0", url: "https://commons.wikimedia.org/wiki/File:Rabati_Malik_caravanserai_03.jpg" },
  { place: "Teleminora, Toshkent", author: "Ruhshona Ozodova", license: "CC BY 4.0", url: "https://commons.wikimedia.org/wiki/File:Tungi_teleminora.jpg" },
  { place: "Xudoyorxon o‘rdasi, Qo‘qon", author: "Bgag", license: "CC0", url: "https://commons.wikimedia.org/wiki/File:Palace_of_Khudayar_Khan.jpg" },
  { place: "Mulla Qirg‘iz madrasasi, Namangan", author: "Jamshid Nurkulov", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:Mulla_Qirg%CA%BBiz_madrasasi_01.jpg" },
];

const W = 25; // har bir lavha kengligi, %

export function CityBackdrop() {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);

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

        {/* shahar nomlari — "/ TOSHKENT" */}
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
