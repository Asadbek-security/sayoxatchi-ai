"use client";
import { useI18n } from "@/lib/i18n";
import { IconSearch } from "@/components/icons";
import { ButtonLink, Glass } from "@/components/ui";

export default function NotFound() {
  const { t } = useI18n();
  return (
    <Glass level={3} className="mx-auto mt-10 max-w-lg p-10 text-center">
      <p className="num text-7xl text-mint">404</p>
      <h1 className="mt-4 font-display text-2xl font-bold">{t("nf.title")}</h1>
      <p className="mt-2 text-mid">{t("nf.text")}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <ButtonLink href="/">{t("nav.home")}</ButtonLink>
        <ButtonLink href="/search" variant="glass"><IconSearch size={20} /> {t("nav.search")}</ButtonLink>
      </div>
    </Glass>
  );
}
