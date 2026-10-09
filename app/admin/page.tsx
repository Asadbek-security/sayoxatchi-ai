"use client";
import { useEffect, useState } from "react";
import { AlertTriangle, Building2, Cpu, ImageIcon, LayoutDashboard, MessageSquare, Play, Plus, RotateCw, Trash2, Users, X } from "lucide-react";
import { useI18n, type DictKey } from "@/lib/i18n";
import { adminJobs, adminReviews, adminStats, adminUsers, regions, searchResorts } from "@/lib/api";
import type { AnalysisJob, JobStatus, Resort, Review, User } from "@/lib/types";
import { Button, Card, cn, inputCls, ScorePill } from "@/components/ui";

type Tab = "dashboard" | "resorts" | "reviews" | "images" | "jobs" | "users";
const tabs: { key: Tab; label: DictKey; icon: typeof Users }[] = [
  { key: "dashboard", label: "admin.dashboard", icon: LayoutDashboard },
  { key: "resorts", label: "admin.resorts", icon: Building2 },
  { key: "reviews", label: "admin.reviews", icon: MessageSquare },
  { key: "images", label: "admin.images", icon: ImageIcon },
  { key: "jobs", label: "admin.jobs", icon: Cpu },
  { key: "users", label: "admin.users", icon: Users },
];

const jobStyle: Record<JobStatus, string> = {
  queued: "bg-slate-100 text-slate-600",
  running: "bg-sky-50 text-sky-700",
  done: "bg-emerald-50 text-emerald-700",
  failed: "bg-red-50 text-red-700",
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
    const job: AnalysisJob = { id: `j-${Date.now()}`, resort_id, status: "queued", progress: 0, error: null, started_at: null, finished_at: null };
    setJobs((j) => [job, ...j]);
    setTab("jobs");
    setTimeout(() => setJobs((j) => j.map((x) => (x.id === job.id ? { ...x, status: "running", progress: 40, started_at: new Date().toISOString() } : x))), 800);
    setTimeout(() => setJobs((j) => j.map((x) => (x.id === job.id ? { ...x, status: "done", progress: 100, finished_at: new Date().toISOString() } : x))), 2600);
  };

  const statCards = stats ? [
    { label: t("admin.stat.resorts"), value: stats.resorts, icon: Building2, tone: "text-brand-600 bg-brand-50" },
    { label: t("admin.stat.reviews"), value: stats.reviews, icon: MessageSquare, tone: "text-brand-600 bg-brand-50" },
    { label: t("admin.stat.analyses"), value: stats.analyses, icon: Cpu, tone: "text-sky-600 bg-sky-50" },
    { label: t("admin.stat.suspicious"), value: stats.suspicious, icon: AlertTriangle, tone: "text-amber-600 bg-amber-50" },
    { label: t("admin.stat.errors"), value: stats.errors, icon: X, tone: "text-red-600 bg-red-50" },
  ] : [];

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-brand-950 md:text-3xl">{t("admin.title")}</h1>
      <div className="grid gap-5 md:grid-cols-[200px_1fr]">
        <nav className="-mx-4 flex gap-1 overflow-x-auto px-4 md:mx-0 md:flex-col md:px-0">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={cn("flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                tab === key ? "bg-brand-600 text-white" : "text-slate-600 hover:bg-brand-50")}>
              <Icon className="size-4" /> {t(label)}
            </button>
          ))}
        </nav>

        <div className="min-w-0 space-y-4">
          {tab === "dashboard" && (
            <>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                {statCards.map((s) => (
                  <Card key={s.label} className="p-4">
                    <span className={cn("grid size-9 place-items-center rounded-lg", s.tone)}><s.icon className="size-4" /></span>
                    <p className="mt-3 text-2xl font-extrabold text-brand-950">{s.value}</p>
                    <p className="text-xs text-slate-500">{s.label}</p>
                  </Card>
                ))}
              </div>
              <Card>
                <h2 className="mb-3 font-bold text-brand-950">{t("admin.recent")}</h2>
                <JobsTable jobs={jobs.slice(0, 4)} resortName={resortName} />
              </Card>
            </>
          )}

          {tab === "resorts" && (
            <Card>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-bold text-brand-950">{t("admin.resorts")}</h2>
                <Button onClick={() => setShowForm((v) => !v)}><Plus className="size-4" /> {t("admin.add")}</Button>
              </div>
              {showForm && <ResortForm onCancel={() => setShowForm(false)} onSave={(r) => { setResorts((x) => [r, ...x]); setShowForm(false); }} />}
              <Table head={[t("admin.name"), t("admin.region"), "Trust Score", t("admin.actions")]}>
                {resorts.map((r) => (
                  <tr key={r.id}>
                    <td className="font-medium">{r.name}</td>
                    <td className="text-slate-500">{r.region}</td>
                    <td><ScorePill score={r.trust_score} /></td>
                    <td>
                      <div className="flex gap-2">
                        <Button variant="ghost" className="px-2.5 py-1.5 text-xs" onClick={() => runJob(r.id)}><Play className="size-3.5" /> {t("admin.run")}</Button>
                        <Button variant="danger" className="px-2.5 py-1.5" aria-label={t("admin.delete")} onClick={() => setResorts((x) => x.filter((y) => y.id !== r.id))}><Trash2 className="size-3.5" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </Table>
            </Card>
          )}

          {tab === "reviews" && (
            <Card>
              <h2 className="mb-4 font-bold text-brand-950">{t("admin.reviews")}</h2>
              <Table head={[t("admin.author"), t("admin.text"), t("admin.risk"), t("admin.actions")]}>
                {reviews.map((r) => (
                  <tr key={r.id} className={cn(hidden.includes(r.id) && "opacity-40")}>
                    <td className="whitespace-nowrap font-medium">{r.author}<div className="text-xs font-normal text-slate-400">{resortName(r.resort_id)}</div></td>
                    <td className="max-w-xs truncate text-slate-600" title={r.text}>{r.text}</td>
                    <td>
                      <span className={cn("rounded-full px-2 py-0.5 text-xs font-bold", r.fake_probability >= 60 ? "bg-amber-50 text-amber-700" : "bg-slate-50 text-slate-500")}>{r.fake_probability}%</span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <Button variant="ghost" className="px-2.5 py-1.5 text-xs" onClick={() => setHidden((h) => h.filter((x) => x !== r.id))}>{t("admin.approve")}</Button>
                        <Button variant="danger" className="px-2.5 py-1.5 text-xs" onClick={() => setHidden((h) => [...h, r.id])}>{t("admin.hide")}</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </Table>
            </Card>
          )}

          {tab === "images" && (
            <Card className="py-12 text-center">
              <ImageIcon className="mx-auto size-10 text-brand-300" />
              <p className="mt-3 text-sm text-slate-500">{t("admin.imagesEmpty")}</p>
            </Card>
          )}

          {tab === "jobs" && (
            <Card>
              <h2 className="mb-4 font-bold text-brand-950">{t("admin.jobs")}</h2>
              <JobsTable jobs={jobs} resortName={resortName} onRetry={runJob} />
            </Card>
          )}

          {tab === "users" && (
            <Card>
              <h2 className="mb-4 font-bold text-brand-950">{t("admin.users")}</h2>
              <Table head={[t("profile.name"), t("admin.role"), t("admin.status"), t("admin.actions")]}>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="font-medium">{u.name}<div className="text-xs font-normal text-slate-400">{u.email}</div></td>
                    <td><span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", u.role === "admin" ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600")}>{u.role}</span></td>
                    <td className={u.blocked ? "text-red-600" : "text-emerald-600"}>{u.blocked ? t("admin.blocked") : t("admin.active")}</td>
                    <td>
                      {u.role !== "admin" && (
                        <Button variant={u.blocked ? "ghost" : "danger"} className="px-2.5 py-1.5 text-xs"
                          onClick={() => setUsers((x) => x.map((y) => (y.id === u.id ? { ...y, blocked: !y.blocked } : y)))}>
                          {u.blocked ? t("admin.unblock") : t("admin.block")}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </Table>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="-mx-5 overflow-x-auto px-5">
      <table className="w-full min-w-[560px] text-left text-sm [&_td]:py-3 [&_td]:pr-4 [&_tr]:border-b [&_tr]:border-brand-50">
        <thead><tr>{head.map((h) => <th key={h} className="pb-2 pr-4 text-xs font-semibold uppercase tracking-wide text-slate-400">{h}</th>)}</tr></thead>
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
          <td className="font-mono text-xs text-slate-400">{j.id}</td>
          <td className="font-medium">{resortName(j.resort_id)}{j.error && <div className="text-xs font-normal text-red-500">{j.error}</div>}</td>
          <td><span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", jobStyle[j.status])}>{t(`admin.job.${j.status}` as DictKey)}</span></td>
          <td className="w-40">
            <div className="h-2 rounded-full bg-brand-50">
              <div className={cn("h-full rounded-full transition-[width] duration-500", j.status === "failed" ? "bg-red-400" : "bg-brand-500")} style={{ width: `${j.progress}%` }} />
            </div>
          </td>
          <td>{j.status === "failed" && onRetry && <Button variant="ghost" className="px-2.5 py-1.5 text-xs" onClick={() => onRetry(j.resort_id)}><RotateCw className="size-3.5" /> {t("admin.retry")}</Button>}</td>
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
    <form className="mb-5 grid gap-3 rounded-xl bg-brand-50 p-4 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!f.name.trim()) return;
        onSave({ id: `new-${Date.now()}`, name: f.name, region: f.region, district: f.district, address: f.address, lat: 0, lng: 0, rating: 0, trust_score: null, review_count: 0, price_from: Number(f.price) || 0, main_problem: null, tags: [], cover: "from-brand-500 to-brand-800" });
      }}>
      <input required placeholder={t("admin.name")} value={f.name} onChange={set("name")} className={inputCls} />
      <select value={f.region} onChange={set("region")} className={inputCls}>{regions().map((r) => <option key={r}>{r}</option>)}</select>
      <input placeholder={t("admin.district")} value={f.district} onChange={set("district")} className={inputCls} />
      <input placeholder={t("admin.address")} value={f.address} onChange={set("address")} className={inputCls} />
      <input type="number" min={0} placeholder={t("admin.price")} value={f.price} onChange={set("price")} className={inputCls} />
      <div className="flex gap-2">
        <Button type="submit" className="flex-1">{t("admin.save")}</Button>
        <Button type="button" variant="ghost" onClick={onCancel}>{t("admin.cancel")}</Button>
      </div>
    </form>
  );
}
