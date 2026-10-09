"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { getResortsByIds } from "@/lib/api";
import { reviews } from "@/lib/mock-data";
import { useSaved } from "@/lib/store";
import type { Resort } from "@/lib/types";
import { IconInfo, IconLogout, IconSaved } from "@/components/icons";
import { Button, Field, fieldCls, Glass, ScoreBadge, Segmented, SectionTitle, Stars } from "@/components/ui";

// Dizayn namunasi: haqiqiy JWT kirish backend tomonidan qo‘shiladi (POST /api/v1/auth/login, /register).
export default function ProfilePage() {
  const { t, lang, setLang, fmtDate } = useI18n();
  const { theme, setTheme } = useTheme();
  const saved = useSaved();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [user, setUser] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [savedList, setSavedList] = useState<Resort[]>([]);
  useEffect(() => { getResortsByIds(saved.ids).then(setSavedList); }, [saved.ids]);

  const settings = (
    <Glass className="p-6">
      <SectionTitle>{t("profile.settings")}</SectionTitle>
      <div className="flex flex-wrap items-center justify-between gap-3 py-2">
        <span className="text-sm font-medium text-mid">{t("lang.label")}</span>
        <Segmented label={t("lang.label")} value={lang} onChange={setLang} options={[{ value: "uz", label: "O‘zbekcha" }, { value: "ru", label: "Русский" }]} />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line py-2 pt-4">
        <span className="text-sm font-medium text-mid">{t("profile.theme")}</span>
        <Segmented label={t("profile.theme")} value={theme} onChange={setTheme} options={[{ value: "dark", label: t("theme.dark") }, { value: "light", label: t("theme.light") }]} />
      </div>
    </Glass>
  );

  if (user) {
    return (
      <div className="mx-auto max-w-3xl space-y-5">
        <Glass level={3} className="flex flex-wrap items-center gap-4 p-6">
          <span className="grid size-16 place-items-center rounded-full bg-gradient-to-br from-[color:var(--jade-400)] to-[color:var(--jade)] font-display text-2xl font-extrabold text-on-jade">{user[0]?.toUpperCase()}</span>
          <div className="flex-1">
            <p className="text-sm text-low">{t("profile.hello")},</p>
            <p className="font-display text-2xl font-bold">{user}</p>
          </div>
          <Button variant="glass" onClick={() => setUser(null)}><IconLogout size={20} /> {t("profile.logout")}</Button>
        </Glass>
        <Glass className="p-6">
          <SectionTitle icon={<IconSaved size={24} />}>{t("profile.saved")}</SectionTitle>
          {savedList.length === 0 ? <p className="text-sm text-low">{t("saved.empty")}</p> : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {savedList.map((r) => (
                <li key={r.id}><Link href={`/resort/${r.id}`} className="flex items-center gap-3 rounded-2xl bg-[color:var(--glass-bottom)] p-3 hover:bg-[color:var(--glass-top)]">
                  <ScoreBadge score={r.trust_score} size={44} /><span className="font-semibold">{r.name}</span>
                </Link></li>
              ))}
            </ul>
          )}
        </Glass>
        <Glass solid className="p-6">
          <SectionTitle>{t("profile.myReviews")}</SectionTitle>
          <ul className="divide-y divide-[color:var(--line)]">
            {reviews.slice(0, 3).map((r) => (
              <li key={r.id} className="py-4">
                <div className="flex items-center gap-3"><Stars value={r.rating} /><span className="text-xs text-low">{fmtDate(r.date)}</span></div>
                <p className="mt-2 leading-relaxed">{r.text}</p>
              </li>
            ))}
          </ul>
        </Glass>
        {settings}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-5">
      <Glass level={3} className="p-6 md:p-8">
        <Segmented className="mb-7 w-full [&>button]:flex-1" label={t("profile.title")} value={tab} onChange={setTab}
          options={[{ value: "login", label: t("profile.login") }, { value: "register", label: t("profile.register") }]} />
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setUser(name || email.split("@")[0] || "Mehmon"); }}>
          {tab === "register" && <Field label={t("profile.name")}><input value={name} onChange={(e) => setName(e.target.value)} className={fieldCls} autoComplete="name" /></Field>}
          <Field label={t("profile.email")}><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={fieldCls} autoComplete="email" /></Field>
          <Field label={t("profile.password")}><input type="password" className={fieldCls} autoComplete={tab === "login" ? "current-password" : "new-password"} /></Field>
          <Button type="submit" size="lg" className="w-full">{tab === "login" ? t("profile.submitLogin") : t("profile.submitRegister")}</Button>
        </form>
        <p className="mt-5 flex items-start gap-2 text-xs text-low"><IconInfo size={16} className="mt-px text-mint" /> {t("profile.demoNote")}</p>
      </Glass>
      {settings}
    </div>
  );
}
