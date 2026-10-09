"use client";
import { useI18n } from "@/lib/i18n";
import * as I from "@/components/icons";
import { Glass } from "@/components/ui";

const SET: [string, (p: I.IconProps) => React.JSX.Element][] = Object.entries(I)
  .filter(([k, v]) => k.startsWith("Icon") && k !== "IconDefs" && typeof v === "function")
  .map(([k, v]) => [k.replace("Icon", ""), v as (p: I.IconProps) => React.JSX.Element]);

const SIZES = [16, 20, 24, 32] as const;

export default function IconsPage() {
  const { t } = useI18n();
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <I.LogoMark size={56} />
        <div>
          <h1 className="font-display text-[34px] font-extrabold leading-tight md:text-5xl">{t("ic.title")}</h1>
          <p className="mt-1 text-mid">{t("ic.subtitle")}</p>
        </div>
      </div>
      {(["#03110D", "#EEF7F2"] as const).map((bg) => (
        <Glass key={bg} solid className="overflow-hidden p-0">
          <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-3" style={{ background: bg, color: bg === "#03110D" ? "#EFFFF8" : "#072A21" }}>
            {SET.map(([name, Icon]) => (
              <div key={name} className="flex items-center gap-4 p-4" style={{ boxShadow: "inset 0 0 0 .5px rgba(127,127,127,.18)" }}>
                <div className="flex items-end gap-3">
                  {SIZES.map((s) => <Icon key={s} size={s} />)}
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <span title={t("ic.hover")} className="rounded-lg p-1 hover:bg-white/5"><Icon size={24} /></span>
                  <span title={t("ic.active")} style={{ color: "#3EE0B0" }}><Icon size={24} active /></span>
                </div>
                <span className="w-28 truncate text-right text-xs opacity-60">{name}</span>
              </div>
            ))}
          </div>
        </Glass>
      ))}
      <p className="text-xs text-low">{t("ic.default")} · {t("ic.hover")} · {t("ic.active")}</p>
    </div>
  );
}
