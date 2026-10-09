"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useI18n, type DictKey } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { useCompare } from "@/lib/store";
import {
  IconClose, IconCompareResorts, IconDashboard, IconHome, IconImage, IconMoon, IconProfile, IconSaved, IconSearch, IconSun,
  type IconProps,
} from "./icons";
import { PHOTO_CREDITS } from "./CityBackdrop";
import { cn, Disclaimer, Logo } from "./ui";

type NavItem = { href: string; key: DictKey; icon: (p: IconProps) => React.JSX.Element };
const desktopNav: NavItem[] = [
  { href: "/", key: "nav.home", icon: IconHome },
  { href: "/search", key: "nav.search", icon: IconSearch },
  { href: "/compare", key: "nav.compare", icon: IconImage },
  { href: "/compare-resorts", key: "nav.versus", icon: IconCompareResorts },
  { href: "/saved", key: "nav.saved", icon: IconSaved },
];
const tabNav: NavItem[] = [
  { href: "/", key: "nav.home", icon: IconHome },
  { href: "/search", key: "nav.search", icon: IconSearch },
  { href: "/compare", key: "nav.compareShort", icon: IconImage },
  { href: "/saved", key: "nav.saved", icon: IconSaved },
  { href: "/profile", key: "nav.profile", icon: IconProfile },
];

const isActive = (path: string, href: string) => (href === "/" ? path === "/" : path === href || path.startsWith(`${href}/`));

function LangSwitch() {
  const { lang, setLang, t } = useI18n();
  return (
    <div className="glass g1 flex h-11 items-center rounded-full p-1" role="group" aria-label={t("lang.label")}>
      {(["uz", "ru"] as const).map((l) => (
        <button key={l} onClick={() => setLang(l)} aria-pressed={lang === l}
          className={cn("relative h-9 min-w-9 rounded-full px-2.5 text-xs font-bold uppercase transition", lang === l ? "text-on-jade" : "text-mid hover:text-hi")}>
          {lang === l && <motion.span layoutId="lang-pill" className="absolute inset-0 rounded-full bg-[color:var(--jade)]" transition={{ type: "spring", stiffness: 260, damping: 26 }} />}
          <span className="relative">{l}</span>
        </button>
      ))}
    </div>
  );
}

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const { t } = useI18n();
  const next = theme === "dark" ? "light" : "dark";
  return (
    <button onClick={() => setTheme(next)} aria-label={t(next === "light" ? "theme.light" : "theme.dark")} title={t(next === "light" ? "theme.light" : "theme.dark")}
      className={cn("glass g1 grid size-11 place-items-center rounded-full text-mid transition hover:text-hi", className)}>
      {theme === "dark" ? <IconSun size={20} /> : <IconMoon size={20} />}
    </button>
  );
}

export function Header() {
  const { t } = useI18n();
  const path = usePathname();
  return (
    <header className="sticky top-0 z-40 px-4 pt-3 md:px-6">
      <div className="glass g1 mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-3 rounded-full! pl-3 pr-2 [--r:999px]">
        <Logo />
        <nav aria-label={t("nav.menu")} className="hidden items-center gap-0.5 lg:flex">
          {desktopNav.map((n) => {
            const active = isActive(path, n.href);
            return (
              <Link key={n.href} href={n.href} aria-current={active ? "page" : undefined}
                className={cn("relative flex h-11 items-center gap-2 rounded-full px-3.5 text-sm font-medium transition", active ? "text-hi" : "text-mid hover:text-hi")}>
                {active && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-[color:var(--glass-top)] ring-1 ring-[color:var(--line)]" transition={{ type: "spring", stiffness: 260, damping: 26 }} />}
                <n.icon size={20} active={active} className="relative" />
                <span className="relative">{t(n.key)}</span>
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-1.5">
          <Link href="/admin" aria-label={t("nav.admin")} title={t("nav.admin")}
            className={cn("glass g1 hidden size-11 place-items-center rounded-full transition hover:text-hi sm:grid", path.startsWith("/admin") ? "text-mint" : "text-mid")}>
            <IconDashboard size={20} />
          </Link>
          <ThemeToggle />
          <LangSwitch />
          <Link href="/profile" aria-label={t("nav.profile")}
            className={cn("glass g1 hidden size-11 place-items-center rounded-full transition hover:text-hi lg:grid", path === "/profile" ? "text-mint" : "text-mid")}>
            <IconProfile size={20} />
          </Link>
        </div>
      </div>
    </header>
  );
}

/** Mobil: suzuvchi shisha tab-bar, faol belgi — morflanadigan suyuq tomchi */
export function FloatingTabBar() {
  const { t } = useI18n();
  const path = usePathname();
  return (
    <nav aria-label={t("nav.menu")} className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+10px)] z-40 lg:hidden">
      <svg width="0" height="0" className="absolute" aria-hidden>
        <filter id="goo"><feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b" /><feColorMatrix in="b" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9" /></filter>
      </svg>
      <div className="glass g2 relative mx-auto grid h-[68px] max-w-md grid-cols-5 rounded-full! px-1.5 [--r:999px]">
        {tabNav.map(({ href, key, icon: Icon }) => {
          const active = isActive(path, href);
          return (
            <Link key={href} href={href} aria-current={active ? "page" : undefined}
              className={cn("relative flex flex-col items-center justify-center gap-0.5 rounded-full text-[10.5px] font-semibold transition", active ? "text-on-jade" : "text-mid")}>
              {active && (
                <motion.span layoutId="tab-drop" className="absolute inset-x-1 inset-y-1.5" style={{ filter: "url(#goo)" }}
                  transition={{ type: "spring", stiffness: 260, damping: 22 }}>
                  <span className="absolute inset-0 rounded-full bg-gradient-to-b from-[color:var(--jade-400)] to-[color:var(--jade)]" />
                </motion.span>
              )}
              <Icon size={20} className="relative" />
              <span className="relative max-w-full truncate px-1">{t(key)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/** Tanlangan maskanlar uchun suzuvchi "solishtirish" paneli */
export function CompareTray() {
  const { t } = useI18n();
  const path = usePathname();
  const { ids, clear } = useCompare();
  const show = ids.length > 0 && path !== "/compare-resorts" && !path.startsWith("/admin");
  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ type: "spring", stiffness: 260, damping: 26 }}
          className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+88px)] z-40 flex justify-center px-4 lg:bottom-6">
          <div className="glass g3 sheen flex h-14 items-center gap-2 rounded-full! pl-5 pr-1.5 [--r:999px]">
            <IconCompareResorts size={20} className="text-mint" />
            <span className="text-sm font-semibold"><span className="num">{ids.length}</span> {t("vs.tray")}</span>
            <Link href="/compare-resorts" className="btn-liquid ml-2 inline-flex h-11 items-center rounded-full px-5 text-sm font-semibold">{t("vs.open")}</Link>
            <button onClick={clear} aria-label={t("vs.clear")} className="grid size-11 place-items-center rounded-full text-mid hover:text-hi"><IconClose size={20} /></button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="px-4 pb-32 pt-16 md:px-6 lg:pb-10">
      <div className="glass g2 glass-solid mx-auto grid max-w-[1280px] gap-8 p-6 md:grid-cols-[1.2fr_1fr] md:p-8">
        <div className="space-y-4">
          <Logo />
          <Disclaimer className="max-w-md" />
          <p className="text-xs text-low">© 2026 SAYOXATCHI AI · {t("footer.made")}</p>
          <div className="flex gap-4 text-xs font-medium text-mid">
            <Link href="/icons" className="hover:text-hi">{t("nav.icons")}</Link>
            <Link href="/admin" className="hover:text-hi">{t("nav.admin")}</Link>
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-low">{t("footer.photos")} · Wikimedia Commons</p>
          <ul className="space-y-1.5 text-xs text-mid">
            {PHOTO_CREDITS.map((c) => (
              <li key={c.url}>
                <a href={c.url} target="_blank" rel="noreferrer" className="hover:text-hi">
                  {c.place} — {c.author}, <span className="text-low">{c.license}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
