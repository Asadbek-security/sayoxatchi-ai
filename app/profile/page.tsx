"use client";
import { useState } from "react";
import { Info, LogOut } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { reviews } from "@/lib/mock-data";
import { Button, Card, cn, inputCls, Stars } from "@/components/ui";

// Dizayn namunasi: haqiqiy JWT kirish backend tomonidan qo'shiladi (POST /api/v1/auth/login, /register).
export default function ProfilePage() {
  const { t } = useI18n();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [user, setUser] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  if (user) {
    const mine = reviews.slice(0, 3);
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Card className="flex items-center gap-4">
          <span className="grid size-14 place-items-center rounded-full bg-brand-600 text-xl font-bold text-white">{user[0]?.toUpperCase()}</span>
          <div className="flex-1">
            <p className="text-sm text-slate-500">{t("profile.hello")},</p>
            <p className="text-lg font-bold text-brand-950">{user}</p>
          </div>
          <Button variant="ghost" onClick={() => setUser(null)}><LogOut className="size-4" /> {t("profile.logout")}</Button>
        </Card>
        <Card>
          <h2 className="mb-3 text-lg font-bold text-brand-950">{t("profile.myReviews")}</h2>
          <ul className="divide-y divide-brand-50">
            {mine.map((r) => (
              <li key={r.id} className="py-3">
                <Stars value={r.rating} size="size-3.5" />
                <p className="mt-1 text-sm text-slate-700">{r.text}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <div className="mb-6 grid grid-cols-2 rounded-xl bg-brand-50 p-1">
          {(["login", "register"] as const).map((k) => (
            <button key={k} onClick={() => setTab(k)}
              className={cn("rounded-lg py-2 text-sm font-semibold transition", tab === k ? "bg-white text-brand-700 shadow-sm" : "text-slate-500")}>
              {t(`profile.${k}`)}
            </button>
          ))}
        </div>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setUser(name || email.split("@")[0] || "Mehmon"); }}>
          {tab === "register" && (
            <label className="block"><span className="mb-1.5 block text-sm font-semibold">{t("profile.name")}</span>
              <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} autoComplete="name" /></label>
          )}
          <label className="block"><span className="mb-1.5 block text-sm font-semibold">{t("profile.email")}</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} autoComplete="email" /></label>
          <label className="block"><span className="mb-1.5 block text-sm font-semibold">{t("profile.password")}</span>
            <input type="password" className={inputCls} autoComplete={tab === "login" ? "current-password" : "new-password"} /></label>
          <Button type="submit" className="w-full">{tab === "login" ? t("profile.submitLogin") : t("profile.submitRegister")}</Button>
        </form>
        <p className="mt-4 flex items-start gap-2 text-xs text-slate-500"><Info className="mt-0.5 size-4 shrink-0" /> {t("profile.demoNote")}</p>
      </Card>
    </div>
  );
}
