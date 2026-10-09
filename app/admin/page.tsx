"use client";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useI18n, type DictKey } from "@/lib/i18n";
import { adminJobs, adminReviews, adminStats, adminUsers, regions, searchResorts } from "@/lib/api";
import type { AnalysisJob, JobStatus, Resort, Review, User } from "@/lib/types";
import {
  IconAlert, IconCheck, IconDashboard, IconImage, IconJobs, IconLocation, IconModeration, IconPlay, IconPlus, IconRefresh,
  IconSuspicious, IconTrash, IconUsers, type IconProps,
} from "@/components/icons";
import { SUSPICIOUS } from "@/components/signature";
import { Button, cn, EASE, EmptyState, fieldCls, Glass, ScoreBadge, Select, Sparkline } from "@/components/ui";

type Tab = "dashboard" | "resorts" | "reviews" | "images" | "jobs" | "users";
const tabs: { key: Tab; label: DictKey; icon: (p: IconProps) => React.JSX.Element }[] = [
  { key: "dashboard", label: "admin.dashboard", icon: IconDashboard },
  { key: "resorts", label: "admin.resorts", icon: IconLocation },
  { key: "reviews", label: "admin.reviews", icon: IconModeration },
  { key: "images", label: "admin.images", icon: IconImage },
  { key: "jobs", label: "admin.jobs", icon: IconJobs },
  { key: "users", label: "admin.users", icon: IconUsers },
];

const jobColor: Record<JobStatus, string> = {
  queued: "var(--text-mid)",
  running: "var(--info)",
  done: "var(--score-high)",
  failed: "var(--score-low)",
};

export default function AdminPage() {
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [stats, setStats] = useState<Awaited<ReturnType<typeof adminStats>> | null>(null);
  const [resorts, setResorts] = useState<Resort[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [jobs, setJobs] = useState<AnalysisJob[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [hidden, setHidden] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    adminStats().then(setStats);
    searchResorts().then(setResorts);
    adminReviews().then(setReviews);
    adminJobs().then(setJobs);
    adminUsers().then(setUsers);
  }, []);

  const resortName = (id: string) => resorts.find((r) => r.id === id)?.name ?? id;

  const runJob = (resort_id: string) => {
    const job: AnalysisJob = { id: `j-${String(Date.now()).slice(-4)}`, resort_id, status: "queued", progress: 0, error: null, started_at: null, finished_at: null };
    setJobs((j) => [job, ...j]);
    setTab("jobs");
    const upd = (p: Partial<AnalysisJob>) => setJobs((j) => j.map((x) => (x.id === job.id ? { ...x, ...p } : x)));
    setTimeout(() => upd({ status: "running", progress: 25, started_at: new Date().toISOString() }), 700);
    setTimeout(() => upd({ progress: 60 }), 1500);
    setTimeout(() => upd({ progress: 85 }), 2200);
    setTimeout(() => upd({ status: "done", progress: 100, finished_at: new Date().toISOString() }), 2900);
  };

  const kpis = stats ? [
    { label: t("admin.stat.resorts"), value: stats.resorts, icon: IconLocation, trend: stats.trend.resorts, color: "var(--mint)" },
    { label: t("admin.stat.reviews"), value: stats.reviews, icon: IconModeration, trend: stats.trend.reviews, color: "var(--mint)" },
    { label: t("admin.stat.analyses"), value: stats.analyses, icon: IconJobs, trend: stats.trend.analyses, color: "var(--info)" },
    { label: t("admin.stat.errors"), value: stats.errors, icon: IconAlert, trend: stats.trend.errors, color: "var(--score-low)" },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-[34px] font-extrabold leading-tight md:text-5xl">{t("admin.title")}</h1>
        {stats && <span className="inline-flex h-9 items-center gap-2 rounded-full px-3 text-sm font-semibold text-warn" style={{ background: "color-mix(in srgb, var(--score-mid) 13%, transparent)" }}>
          <IconSuspicious size={16} /> <span className="num">{stats.suspicious}</span> {t("admin.stat.suspicious")}
        </span>}
      </div>

      <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
        <Glass level={1} as="aside" className="-mx-1 flex h-fit gap-1 overflow-x-auto p-2 lg:sticky lg:top-28 lg:mx-0 lg:flex-col">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)} aria-current={tab === key}
              className={cn("relative flex h-11 shrink-0 items-center gap-2.5 rounded-2xl px-3.5 text-sm font-medium transition", tab === key ? "text-on-jade" : "text-mid hover:text-hi")}>
              {tab === key && <motion.span layoutId="admin-tab" className="absolute inset-0 rounded-2xl bg-[color:var(--jade)]" transition={{ type: "spring", stiffness: 260, damping: 26 }} />}
              <Icon size={20} className="relative" /> <span className="relative">{t(label)}</span>
            </button>
          ))}
        </Glass>

        <div className="min-w-0 space-y-5">
          {tab === "dashboard" && (
            <>
              <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                {kpis.map((k) => (
                  <Glass key={k.label} solid className="p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-mid">{k.label}</span>
                      <span style={{ color: k.color }}><k.icon size={20} /></span>
                    </div>
                    <p className="num mt-2 text-[32px] leading-none">{k.value}</p>
                    <div className="mt-3"><Sparkline data={k.trend} color={k.color} /></div>
                    <p className="text-[11px] text-low">{t("admin.week")}</p>
                  </Glass>
                ))}
              </div>
              <Panel title={t("admin.recent")}><JobsTable jobs={jobs.slice(0, 4)} resortName={resortName} /></Panel>
            </>
          )}

          {tab === "resorts" && (
            <Panel title={t("admin.resorts")} action={<Button size="sm" onClick={() => setShowForm((v) => !v)}><IconPlus size={16} /> {t("admin.add")}</Button>}>
              {showForm && <ResortForm onCancel={() => setShowForm(false)} onSave={(r) => { setResorts((x) => [r, ...x]); setShowForm(false); }} />}
              <Table head={[t("admin.name"), t("admin.region"), "Trust Score", t("admin.actions")]}>
                {resorts.map((r) => (
                  <tr key={r.id}>
                    <td className="font-semibold">{r.name}</td>
                    <td className="text-mid">{r.region}</td>
                    <td><ScoreBadge score={r.trust_score} size={40} /></td>
                    <td>
                      <div className="flex gap-2">
                        <Button variant="glass" size="sm" onClick={() => runJob(r.id)}><IconPlay size={16} /> {t("admin.run")}</Button>
                        <Button variant="danger" size="sm" aria-label={t("admin.delete")} onClick={() => setResorts((x) => x.filter((y) => y.id !== r.id))}><IconTrash size={16} /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </Table>
            </Panel>
          )}

          {tab === "reviews" && (
            <div className="space-y-3">
              {reviews.map((r) => {
                const sus = r.fake_probability >= SUSPICIOUS;
                const isHidden = hidden.includes(r.id);
                return (
                  <Glass key={r.id} solid className={cn("p-5 transition", sus && "dash-amber", isHidden && "opacity-45")}>
                    <div className="flex flex-wrap items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{r.author} <span className="text-xs font-normal text-low">· {resortName(r.resort_id)}</span></p>
                        <p className="mt-1.5 max-w-[68ch] text-[15px] leading-relaxed text-mid">{r.text}</p>
                        {sus && r.flags.length > 0 && (
                          <div className="mt-3 rounded-2xl p-3 text-sm" style={{ background: "color-mix(in srgb, var(--score-mid) 9%, transparent)" }}>
                            <p className="mb-1 flex items-center gap-1.5 font-semibold text-warn"><IconSuspicious size={16} /> {t("review.why")}</p>
                            <ul className="space-y-0.5 text-mid">{r.flags.map((f) => <li key={f}>• {t(`flag.${f}` as DictKey)}</li>)}</ul>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="num rounded-full px-2.5 py-1 text-xs" style={{ color: sus ? "var(--score-mid)" : "var(--text-low)", background: sus ? "color-mix(in srgb, var(--score-mid) 13%, transparent)" : "var(--glass-bottom)" }}>
                          {t("admin.risk")}: {r.fake_probability}%
                        </span>
                        <div className="flex gap-2">
                          <Button variant="glass" size="sm" onClick={() => setHidden((h) => h.filter((x) => x !== r.id))}><IconCheck size={16} /> {t("admin.approve")}</Button>
                          <Button variant="danger" size="sm" onClick={() => setHidden((h) => [...h, r.id])}>{isHidden ? t("admin.hidden") : t("admin.hide")}</Button>
                        </div>
                      </div>
                    </div>
                  </Glass>
                );
              })}
            </div>
          )}

          {tab === "images" && <EmptyState icon={<IconImage size={32} />} text={t("admin.imagesEmpty")} />}

          {tab === "jobs" && <Panel title={t("admin.jobs")}><JobsTable jobs={jobs} resortName={resortName} onRetry={runJob} /></Panel>}

          {tab === "users" && (
            <Panel title={t("admin.users")}>
              <Table head={[t("profile.name"), t("admin.role"), t("admin.status"), t("admin.actions")]}>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="font-semibold">{u.name}<div className="text-xs font-normal text-low">{u.email}</div></td>
                    <td><span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", u.role === "admin" ? "bg-[color:var(--jade)] text-on-jade" : "bg-[color:var(--glass-top)] text-mid")}>{u.role}</span></td>
                    <td className={u.blocked ? "text-bad" : "text-good"}>{u.blocked ? t("admin.blocked") : t("admin.active")}</td>
                    <td>
                      {u.role !== "admin" && (
                        <Button variant={u.blocked ? "glass" : "danger"} size="sm" onClick={() => setUsers((x) => x.map((y) => (y.id === u.id ? { ...y, blocked: !y.blocked } : y)))}>
                          {u.blocked ? t("admin.unblock") : t("admin.block")}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </Table>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}

function Panel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <Glass solid className="p-5 md:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-bold">{title}</h2>
        {action}
      </div>
      {children}
    </Glass>
  );
}

function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="-mx-5 overflow-x-auto px-5 md:-mx-6 md:px-6">
      <table className="w-full min-w-[600px] text-left text-sm [&_td]:py-3 [&_td]:pr-4 [&_tbody_tr]:border-t [&_tbody_tr]:border-line">
        <thead><tr>{head.map((h) => <th key={h} className="pb-3 pr-4 text-xs font-semibold uppercase tracking-[0.12em] text-low">{h}</th>)}</tr></thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function JobsTable({ jobs, resortName, onRetry }: { jobs: AnalysisJob[]; resortName: (id: string) => string; onRetry?: (id: string) => void }) {
  const { t } = useI18n();
  return (
    <Table head={["ID", t("admin.name"), t("admin.status"), t("admin.progress"), ""]}>
      {jobs.map((j) => (
        <tr key={j.id}>
          <td className="num text-xs text-low">{j.id}</td>
          <td className="font-semibold">{resortName(j.resort_id)}{j.error && <div className="text-xs font-normal text-bad">{j.error}</div>}</td>
          <td>
            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold" style={{ color: jobColor[j.status], background: `color-mix(in srgb, ${jobColor[j.status]} 13%, transparent)` }}>
              {j.status === "running" ? <IconRefresh size={16} className="animate-spin" /> : <span className="size-1.5 rounded-full" style={{ background: jobColor[j.status] }} />}
              {t(`admin.job.${j.status}` as DictKey)}
            </span>
          </td>
          <td className="w-44">
            <div className="flex items-center gap-2">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-[color:var(--glass-bottom)]">
                <motion.div className="h-full rounded-full" style={{ background: jobColor[j.status] }} animate={{ width: `${j.progress}%` }} transition={{ duration: 0.4, ease: EASE }} />
              </div>
              <span className="num w-9 text-right text-xs text-low">{j.progress}%</span>
            </div>
          </td>
          <td>{j.status === "failed" && onRetry && <Button variant="glass" size="sm" onClick={() => onRetry(j.resort_id)}><IconRefresh size={16} /> {t("admin.retry")}</Button>}</td>
        </tr>
      ))}
    </Table>
  );
}

function ResortForm({ onSave, onCancel }: { onSave: (r: Resort) => void; onCancel: () => void }) {
  const { t } = useI18n();
  const [f, setF] = useState({ name: "", region: regions()[0], district: "", address: "", price: "" });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });
  return (
    <form className="mb-5 grid gap-3 rounded-3xl bg-[color:var(--glass-bottom)] p-4 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!f.name.trim()) return;
        onSave({ id: `new-${Date.now()}`, name: f.name, region: f.region, district: f.district, address: f.address, lat: 0, lng: 0, rating: 0, trust_score: null, review_count: 0, price_from: Number(f.price) || 0, main_problem: null, tags: [], cover: "mountains" });
      }}>
      <input required placeholder={t("admin.name")} aria-label={t("admin.name")} value={f.name} onChange={set("name")} className={fieldCls} />
      <Select value={f.region} onChange={set("region")} aria-label={t("admin.region")}>{regions().map((r) => <option key={r}>{r}</option>)}</Select>
      <input placeholder={t("admin.district")} aria-label={t("admin.district")} value={f.district} onChange={set("district")} className={fieldCls} />
      <input placeholder={t("admin.address")} aria-label={t("admin.address")} value={f.address} onChange={set("address")} className={fieldCls} />
      <input type="number" min={0} placeholder={t("admin.price")} aria-label={t("admin.price")} value={f.price} onChange={set("price")} className={fieldCls} />
      <div className="flex gap-2">
        <Button type="submit" className="flex-1">{t("admin.save")}</Button>
        <Button type="button" variant="ghost" onClick={onCancel}>{t("admin.cancel")}</Button>
      </div>
    </form>
  );
}
