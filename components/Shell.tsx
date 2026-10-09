"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, ImageIcon, Search, Shield, User } from "lucide-react";
import { useI18n, type DictKey } from "@/lib/i18n";
import { cn, Logo } from "./ui";

const nav: { href: string; key: DictKey; icon: typeof Home }[] = [
  { href: "/", key: "nav.home", icon: Home },
  { href: "/search", key: "nav.search", icon: Search },
  { href: "/compare", key: "nav.compare", icon: ImageIcon },
  { href: "/saved", key: "nav.saved", icon: Heart },
  { href: "/profile", key: "nav.profile", icon: User },
];

const isActive = (path: string, href: string) => (href === "/" ? path === "/" : path.startsWith(href));

function LangSwitch() {
  const { lang, setLang } = useI18n();
  return (
    <div className="flex rounded-lg bg-brand-50 p-0.5 text-xs font-bold ring-1 ring-brand-100" role="group" aria-label="Language">
      {(["uz", "ru"] as const).map((l) => (
        <button key={l} onClick={() => setLang(l)} aria-pressed={lang === l}
          className={cn("rounded-md px-2.5 py-1 uppercase transition", lang === l ? "bg-white text-brand-700 shadow-sm" : "text-slate-500 hover:text-brand-700")}>
          {l}
        </button>
      ))}
    </div>
  );
}

export function Header() {
  const { t } = useI18n();
  const path = usePathname();
  return (
    <header className="sticky top-0 z-30 border-b border-brand-100 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((n) => (
            <Link key={n.href} href={n.href}
              className={cn("rounded-lg px-3 py-2 text-sm font-medium transition", isActive(path, n.href) ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:text-brand-700")}>
              {t(n.key)}
            </Link>
          ))}
          <Link href="/admin" className={cn("ml-1 flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition", path.startsWith("/admin") ? "bg-brand-50 text-brand-700" : "text-slate-400 hover:text-brand-700")}>
            <Shield className="size-4" /> {t("nav.admin")}
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/admin" className="text-slate-400 md:hidden" aria-label={t("nav.admin")}><Shield className="size-5" /></Link>
          <LangSwitch />
        </div>
      </div>
    </header>
  );
}

export function BottomNav() {
  const { t } = useI18n();
  const path = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-brand-100 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <div className="grid grid-cols-5">
        {nav.map(({ href, key, icon: Icon }) => {
          const active = isActive(path, href);
          return (
            <Link key={href} href={href} className={cn("flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium", active ? "text-brand-600" : "text-slate-500")}>
              <Icon className={cn("size-5", active && "stroke-[2.5]")} />
              {t(key)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="mt-16 border-t border-brand-100 bg-white pb-20 md:pb-0">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-3 px-4 py-6 text-sm text-slate-500 md:flex-row md:items-center">
        <Logo />
        <p className="max-w-md text-xs">{t("home.disclaimer")}</p>
        <p className="text-xs">© 2026 SAYOXATCHI AI</p>
      </div>
    </footer>
  );
}
