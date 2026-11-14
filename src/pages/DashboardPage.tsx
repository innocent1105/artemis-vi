import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bell,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  HeartPulse,
  Menu,
  Orbit,
  Radio,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { AssessmentSelector } from "../components/assessment/AssessmentSelector";
import { AssessmentRunner } from "../components/assessment/AssessmentRunner";
import { ResultsDashboard } from "../components/dashboard/ResultsDashboard";
import { AstronautProfile } from "../components/dashboard/AstronautProfile";
import { HealthHistory } from "../components/dashboard/HealthHistory";
import { AlertQueue } from "../components/dashboard/AlertQueue";
import { AlertReviewPanel } from "../components/dashboard/AlertReviewPanel";
import { AstronautRoster } from "../components/dashboard/AstronautRoster";
import { ScoreTrend } from "../components/dashboard/ScoreTrend";
import { BottomTabBar } from "../components/dashboard/BottomTabBar";
import type { AssessmentRecord } from "../types/assessment";
import type { AlertItem, AstronautProfile as AstronautProfileType } from "../types/health";
import { assessmentRepository } from "../storage/assessmentRepository";
import { useMedicalData } from "../hooks/useMedicalData";

type View = "dashboard" | "selector" | "assessment" | "results";
type Tab = "overview" | "alerts" | "profile" | "history";

const demoVitals = [
  { label: "Heart rate", value: "68", unit: "bpm", note: "Example reading", icon: HeartPulse },
  { label: "Blood oxygen", value: "98", unit: "%", note: "Example reading", icon: Activity },
  { label: "Body temperature", value: "36.8", unit: "°C", note: "Example reading", icon: Radio },
  { label: "Movement score", value: "86", unit: "/100", note: "Pose-estimation example", icon: ClipboardCheck },
];

const sampleAstronautProfile: AstronautProfileType = {
  id: "ast-001",
  name: "Commander Maya Chen",
  crewId: "AST-0472",
  missionName: "AURORA-07",
  missionRole: "Expedition specialist",
  missionStatus: "Mission active",
  avatarUrl: null,
  isSampleData: true,
};

export function DashboardPage() {
  const {
    astronauts,
    selectedAstronaut,
    selectedAstronautId,
    setSelectedAstronautId,
    alerts,
    alertsToReview,
    acknowledgeAlert,
    resolveAlert,
    records,
    setRecords,
    totalAstronauts,
    assessmentsToday,
  } = useMedicalData();
  const [recordsLoading, setRecordsLoadingLocal] = useState(true);

  const [view, setView] = useState<View>("dashboard");
  const [tab, setTab] = useState<Tab>("overview");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [record, setRecord] = useState<AssessmentRecord | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [clock, setClock] = useState(() => new Date().toLocaleTimeString());
  const [alertReviewOpen, setAlertReviewOpen] = useState(false);
  const [alertReviewId, setAlertReviewId] = useState<number | null>(null);
  const [recordsError, setRecordsError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date().toLocaleTimeString()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let mounted = true;
    setRecordsLoadingLocal(true);
    assessmentRepository
      .getAll()
      .then((data) => {
        if (mounted) {
          setRecords(data);
          setRecordsError(null);
          setRecordsLoadingLocal(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setRecordsError(err instanceof Error ? err.message : "Failed to load assessment history.");
          setRecordsLoadingLocal(false);
        }
      });
    return () => { mounted = false; };
  }, [setRecords]);

  const refreshRecords = async () => {
    setRecordsError(null);
    try {
      const data = await assessmentRepository.getAll();
      setRecords(data);
    } catch (err) {
      setRecordsError(err instanceof Error ? err.message : "Failed to refresh assessment history.");
    }
  };

  const hasSampleData =
    selectedAstronaut?.isSampleData || alerts.some((a) => a.isSampleData) || records.length > 0;

  const openAlertReview = (alert: AlertItem) => {
    setAlertReviewId(alert.id);
    setAlertReviewOpen(true);
  };

  if (view === "results" && record) {
    return (
      <div className="min-h-[100svh] bg-astra-navy text-white">
        <ResultsDashboard record={record} onBack={() => { setView("dashboard"); setRecord(null); }} />
      </div>
    );
  }

  if (view === "assessment" && selectedType) {
    return (
      <div className="min-h-[100svh] bg-astra-navy text-white">
        <AssessmentRunner
          type={selectedType as any}
          onComplete={(completedRecord) => { setRecord(completedRecord); setView("dashboard"); refreshRecords(); }}
          onExit={() => { setView("dashboard"); setSelectedType(null); }}
        />
      </div>
    );
  }

  if (view === "selector") {
    return (
      <div className="min-h-[100svh] bg-astra-navy text-white">
        <header className="border-b border-astra-border/60 bg-black/40 px-5 py-4 sm:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <Brand />
            <button onClick={() => setView("dashboard")} className="rounded-lg border border-astra-border min-h-[2.75rem] min-w-[2.75rem] px-4 py-2 text-sm text-astra-cyan active:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-astra-cyan transition">
              Back to dashboard
            </button>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 pb-[env(safe-area-inset-bottom)]">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-astra-cyan">Medical operations / movement analysis</p>
          <h1 className="mb-2 text-2xl font-semibold text-white sm:text-3xl">Start an assessment</h1>
          <p className="mb-8 max-w-2xl text-sm leading-6 text-astra-slate">Choose a guided movement assessment. Results are pose-estimation estimates for this prototype, not clinical measurements.</p>
          <AssessmentSelector onStart={(type) => { setSelectedType(type); setView("assessment"); }} />
        </main>
      </div>
    );
  }

  // Dashboard shell (tabbed: overview / alerts / profile / history)
  return (
    <div className="min-h-[100svh] bg-[#07111f]/60 backdrop-blur-md text-white">
      <div className="flex min-h-[100svh]">
        {/* Sidebar (desktop only) */}
        <aside className={`${mobileNavOpen ? "fixed inset-y-0 left-0 z-40 flex" : "hidden"} w-64 shrink-0 flex-col border-r border-white/10 bg-[#091827]/60 backdrop-blur-md px-5 py-6 lg:static lg:flex`}>
          <div className="mb-10 flex items-center justify-between">
            <Brand />
            <button onClick={() => setMobileNavOpen(false)} className="rounded-md min-h-[2.75rem] min-w-[2.75rem] p-2 text-slate-400 active:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-astra-cyan lg:hidden" aria-label="Close navigation"><X size={18} /></button>
          </div>
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Workspace</p>
          <nav className="space-y-1">
            <NavItem icon={<Activity size={17} />} label="Overview" active={tab === "overview"} onClick={() => { setTab("overview"); setMobileNavOpen(false); }} />
            <NavItem icon={<Bell size={17} />} label="Alerts" active={tab === "alerts"} onClick={() => { setTab("alerts"); setMobileNavOpen(false); }} />
            <NavItem icon={<UserRound size={17} />} label="Astronaut profile" active={tab === "profile"} onClick={() => { setTab("profile"); setMobileNavOpen(false); }} />
            <NavItem icon={<ClipboardCheck size={17} />} label="Movement assessments" onClick={() => { setView("selector"); setMobileNavOpen(false); }} />
            <NavItem icon={<Clock3 size={17} />} label="Health history" active={tab === "history"} onClick={() => { setTab("history"); setMobileNavOpen(false); }} />
          </nav>
          <div className="mt-auto rounded-xl border border-cyan-400/15 bg-cyan-400/[0.06] p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-cyan-300"><ShieldCheck size={15} /> Prototype environment</div>
            <p className="text-xs leading-5 text-slate-400">Demo interface only. No live spacecraft or clinical data is connected.</p>
          </div>
        </aside>

        {mobileNavOpen && <button className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setMobileNavOpen(false)} aria-label="Close navigation overlay" />}

        <main className="min-w-0 flex-1 pb-[env(safe-area-inset-bottom)] relative z-10">
          <header className="sticky top-0 z-20 border-b border-white/10 bg-[#07111f]/50 backdrop-blur-md px-5 py-4 sm:px-8">
            <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button onClick={() => setMobileNavOpen(true)} className="rounded-lg border border-white/10 min-h-[2.75rem] min-w-[2.75rem] p-2 text-slate-300 active:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-astra-cyan lg:hidden" aria-label="Open navigation"><Menu size={18} /></button>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Mission control / medical operations</p>
                  <p className="mt-1 text-sm font-semibold text-white">{selectedAstronaut ? selectedAstronaut.name : "Astronaut health overview"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:gap-5">
                <div className="flex items-center gap-2 text-xs text-emerald-300"><span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.65)]" /> Interface online</div>
                <span className="hidden font-mono text-xs tabular-nums text-slate-400 md:inline">{clock}</span>
                <div className="relative">
                  <button onClick={() => setTab("alerts")} className="relative rounded-lg border border-white/10 min-h-[2.75rem] min-w-[2.75rem] p-2.5 text-slate-300 active:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-astra-cyan transition" aria-label={`Notifications, ${alertsToReview.length} awaiting review`}>
                    <Bell size={17} />
                    {alertsToReview.length > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">{alertsToReview.length}</span>}
                  </button>
                </div>
                <div className="hidden h-9 w-9 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-300/10 text-xs font-bold text-cyan-200 sm:flex">MP</div>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-[1500px] space-y-7 px-5 py-7 sm:px-8 sm:py-9 pb-[env(safe-area-inset-bottom)]">
            {tab === "overview" && (
              <>
                <section className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
                  <div>
                    {hasSampleData && (
                      <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/[0.07] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-300" /> Demonstration data · not live telemetry
                      </div>
                    )}
                    <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Good day, Medical Team</h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Monitor astronaut wellbeing, review movement assessments and follow up on items requiring attention.</p>
                  </div>
                  <button onClick={() => setView("selector")} className="inline-flex items-center justify-center gap-2 self-start min-h-[2.75rem] rounded-lg bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-950/30 active:bg-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-astra-cyan transition xl:self-auto">
                    <Activity size={17} /> New movement assessment <ArrowRight size={16} />
                  </button>
                </section>

                <section className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
                  <SummaryCard label="Astronauts monitored" value={String(totalAstronauts).padStart(2, "0")} detail="Crew roster" icon={<UserRound size={18} />} accent="cyan" />
                  <SummaryCard label="Assessments today" value={String(assessmentsToday).padStart(2, "0")} detail="Completed assessments" icon={<ClipboardCheck size={18} />} accent="blue" />
                  <SummaryCard
                    label="Alerts to review"
                    value={String(alertsToReview.length).padStart(2, "0")}
                    detail="Tap to open queue"
                    icon={<AlertTriangle size={18} />}
                    accent="amber"
                    onClick={() => setTab("alerts")}
                  />
                  <SummaryCard label="Active mission" value={selectedAstronaut?.missionName ?? "—"} detail={selectedAstronaut?.missionRole ?? "—"} icon={<Orbit size={18} />} accent="violet" compact />
                </section>

                <section className="grid gap-5 2xl:grid-cols-[1.45fr_0.85fr]">
                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d1b2b]/80 backdrop-blur-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-5 sm:px-6">
                      <div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300">Astronaut overview</p></div>
                    </div>
                    <div className="grid gap-5 p-5 sm:grid-cols-[1fr_1.2fr] sm:p-6">
                      <AstronautProfile profile={selectedAstronaut ?? sampleAstronautProfile} />
                      <div className="grid grid-cols-2 gap-4">
                        <InfoBlock label="Mission day" value="042" />
                        <InfoBlock label="Location" value="Low Earth Orbit" />
                        <InfoBlock label="Next check-in" value="14:30 UTC" />
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-white/[0.02] px-5 py-4 sm:px-6">
                      <p className="text-xs text-slate-500">All astronaut details above are fictional sample data.</p>
                      <button onClick={() => setTab("profile")} className="min-h-[2.75rem] min-w-[2.75rem] inline-flex items-center gap-1 text-xs font-semibold text-cyan-300 active:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-astra-cyan transition">Open astronaut profile <ChevronRight size={14} /></button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-[#0d1b2b]/80 backdrop-blur-sm p-5 sm:p-6">
                    <div className="mb-5 flex items-center justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300">Mission status</p><h2 className="mt-1 text-lg font-semibold">Current overview</h2></div><Orbit className="text-slate-500" size={20} /></div>
                    <div className="space-y-4">
                      <StatusRow label="Crew communication" value="Nominal (demo)" color="green" />
                      <StatusRow label="Movement programme" value="In progress" color="cyan" />
                      <StatusRow label="Medical review queue" value={`${alertsToReview.length} pending`} color={alertsToReview.length ? "amber" : "green"} />
                      <StatusRow label="Sensor connection" value="Not connected" color="slate" />
                    </div>
                    <div className="mt-5 rounded-xl border border-amber-300/15 bg-amber-300/[0.05] p-3 text-xs leading-5 text-amber-100/80">This prototype currently uses example values. It does not receive live spacecraft telemetry or sensor readings.</div>
                  </div>
                </section>

                <section>
                  <div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300">Health indicators</p><h2 className="mt-1 text-lg font-semibold">Example monitoring data</h2></div><span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Sample values only</span></div>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {demoVitals.map(({ label, value, unit, note, icon: Icon }) => <div key={label} className="rounded-xl border border-white/10 bg-[#0d1b2b]/80 backdrop-blur-sm p-4 transition active:border-cyan-300/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-astra-cyan">
                      <div className="mb-4 flex items-center justify-between"><span className="text-xs text-slate-400">{label}</span><span className="rounded-lg bg-white/[0.05] p-2 text-cyan-300"><Icon size={16} /></span></div>
                      <div className="flex items-baseline gap-1.5"><span className="text-2xl font-semibold tracking-tight text-white">{value}</span><span className="text-xs text-slate-400">{unit}</span></div>
                      <p className="mt-2 text-[10px] text-slate-500">{note}</p>
                    </div>)}
                  </div>
                  <p className="mt-3 text-[11px] leading-5 text-slate-500">Movement score is a pose-estimation performance estimate. The other readings are placeholders for interface demonstration; none should be treated as validated medical measurements.</p>
                </section>

                <section className="grid gap-5 2xl:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-2xl border border-white/10 bg-[#0d1b2b]/80 backdrop-blur-sm">
                    <div className="flex items-center justify-between border-b border-white/10 px-5 py-5 sm:px-6"><div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300">Assessment activity</p><h2 className="mt-1 text-lg font-semibold">Recent movement assessments</h2></div><button onClick={() => setView("selector")} className="min-h-[2.75rem] min-w-[2.75rem] text-xs font-semibold text-cyan-300 active:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-astra-cyan">Start assessment</button></div>
                    <div className="divide-y divide-white/[0.06]">
                      {recordsLoading ? (
                        <div className="flex items-center justify-center py-8 text-slate-500">
                          <Clock3 size={16} className="animate-spin mr-2" />
                          <span>Loading assessments...</span>
                        </div>
                      ) : recordsError ? (
                        <div className="p-6 text-center text-slate-500">
                          <p className="mb-2">Failed to load assessment history.</p>
                          <button onClick={refreshRecords} className="min-h-[2.75rem] min-w-[2.75rem] text-cyan-300 underline text-sm active:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-astra-cyan">Retry</button>
                        </div>
                      ) : records.length === 0 ? (
                        <div className="p-6 text-center text-slate-500">
                          <p className="mb-2">No completed assessments yet.</p>
                          <p className="text-xs">Complete a movement assessment to see results here.</p>
                        </div>
                      ) : (
                        records.map((r) => (
                          <button
                            key={r.id}
                            onClick={() => { setRecord(r); setView("results"); }}
                            aria-label={`Assessment ${r.name}, ${new Date(r.date).toLocaleDateString()}, score ${r.score}`}
                            className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6 min-h-[2.75rem] active:bg-white/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-astra-cyan transition"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="rounded-lg bg-cyan-300/[0.08] p-2.5 text-cyan-300"><ClipboardCheck size={17} /></div>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-slate-200">{r.name}</p>
                                <p className="mt-1 text-[10px] text-slate-500">{new Date(r.date).toLocaleDateString()} · {r.type}</p>
                              </div>
                            </div>
                            <div className="shrink-0 text-right">
                              <p className="text-sm font-semibold text-white">{r.score}<span className="ml-1 text-[10px] font-normal text-slate-500">/100</span></p>
                              <p className="mt-1 text-[10px] text-emerald-300">{r.status}</p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                    <div className="border-t border-white/10 px-5 py-3 sm:px-6"><p className="text-[10px] text-slate-500">Completed assessments are saved locally and shown above.</p></div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-[#0d1b2b]/80 backdrop-blur-sm">
                    <div className="flex items-center justify-between border-b border-white/10 px-5 py-5 sm:px-6"><div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-200">Attention centre</p><h2 className="mt-1 text-lg font-semibold">Alerts & notifications</h2></div><span className="rounded-full bg-amber-300/10 px-2.5 py-1 text-[10px] font-semibold text-amber-200">{alertsToReview.length} open</span></div>
                    <div className="space-y-3 p-4 sm:p-5">
                      {alertsToReview.length === 0 ? (
                        <div className="py-8 text-center"><CheckCircle2 className="mx-auto mb-2 text-emerald-300" size={24} /><p className="text-sm font-medium text-slate-200">All demo alerts reviewed</p><p className="mt-1 text-xs text-slate-500">There are no remaining sample alerts.</p></div>
                      ) : (
                        <AlertQueue alerts={alerts} onAlertSelect={openAlertReview} />
                      )}
                    </div>
                  </div>
                </section>

                <footer className="border-t border-white/10 pt-5 text-center text-[10px] leading-5 text-slate-600">ASTRA HEALTH prototype · Movement-analysis estimates are not clinical diagnoses · Demo content is not connected to live medical systems.</footer>
              </>
            )}

            {tab === "alerts" && (
              <section>
                <AlertQueue alerts={alerts} onAlertSelect={openAlertReview} />
              </section>
            )}

            {tab === "profile" && (
              <section className="space-y-6">
                {!selectedAstronaut ? (
                  <AstronautRoster astronauts={astronauts} selectedId={selectedAstronautId} onSelect={setSelectedAstronautId} />
                ) : (
                  <>
                    <button onClick={() => setSelectedAstronautId(null)} className="min-h-[2.75rem] min-w-[2.75rem] inline-flex items-center gap-1 text-xs font-semibold text-cyan-300 active:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-astra-cyan transition mb-6">
                      <ArrowRight size={14} className="-mr-1" /> Back to roster
                    </button>
                    <AstronautProfile profile={selectedAstronaut} />
                    <ScoreTrend records={records} />
                    <div className="rounded-2xl border border-white/10 bg-[#0d1b2b]/80 backdrop-blur-sm p-5 sm:p-6">
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-3">Assessment history</p>
                      <HealthHistory alerts={alerts} onAcknowledgeAlert={acknowledgeAlert} />
                    </div>
                  </>
                )}
              </section>
            )}

            {tab === "history" && (
              <HealthHistory alerts={alerts} onAcknowledgeAlert={acknowledgeAlert} />
            )}
          </div>
        </main>
      </div>

      {/* Bottom tab bar (phones only) */}
      <BottomTabBar active={tab} onChange={setTab} alertsCount={alertsToReview.length} />

      {/* Alert review panel */}
      <AlertReviewPanel
        open={alertReviewOpen}
        alert={alerts.find((a) => a.id === alertReviewId) ?? null}
        onClose={() => setAlertReviewOpen(false)}
        onAcknowledge={(id) => { acknowledgeAlert(id); setAlertReviewOpen(false); }}
        onResolve={(id) => { resolveAlert(id); setAlertReviewOpen(false); }}
      />
    </div>
  );
}

function Brand() {
  return <div className="flex items-center gap-2.5"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-300 text-slate-950"><Activity size={20} strokeWidth={2.5} /></div><div><p className="text-sm font-bold tracking-wide text-white">ASTRA <span className="text-cyan-300">HEALTH</span></p><p className="text-[9px] uppercase tracking-[0.18em] text-slate-500">Medical operations</p></div></div>;
}

function NavItem({ icon, label, active = false, onClick }: { icon: ReactNode; label: string; active?: boolean; onClick: () => void }) {
  return <button onClick={onClick} className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 min-h-[2.75rem] text-left text-xs font-medium transition ${active ? "border border-cyan-300/15 bg-cyan-300/[0.08] text-cyan-200" : "text-slate-400 active:bg-white/[0.06] active:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-astra-cyan"}`}>{icon}<span>{label}</span>{active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-300" />}</button>;
}

function SummaryCard({ label, value, detail, icon, accent, compact = false, onClick }: { label: string; value: string; detail: string; icon: ReactNode; accent: "cyan" | "blue" | "amber" | "violet"; compact?: boolean; onClick?: () => void }) {
  const tones = { cyan: "text-cyan-300 bg-cyan-300/10", blue: "text-blue-300 bg-blue-300/10", amber: "text-amber-200 bg-amber-300/10", violet: "text-violet-300 bg-violet-300/10" };
  const clickable = !!onClick;
  return (
    <div
      onClick={onClick}
      role={clickable ? "button" : undefined}
      aria-label={clickable ? `${label}: ${value}` : undefined}
      className={`rounded-xl border border-white/10 bg-[#0d1b2b]/80 backdrop-blur-sm p-4 sm:p-5 min-h-[2.75rem] transition ${clickable ? "cursor-pointer active:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-astra-cyan" : ""}`}
    >
      <div className="mb-4 flex items-center justify-between"><p className="text-xs text-slate-400">{label}</p><span className={`rounded-lg p-2 ${tones[accent]}`}>{icon}</span></div>
      <p className={`${compact ? "text-xl" : "text-3xl"} font-semibold tracking-tight text-white`}>{value}</p>
      <p className="mt-2 text-[10px] text-slate-500">{detail}</p>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return <div><p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p><p className="mt-1 text-xs font-medium text-slate-200">{value}</p></div>;
}

function StatusRow({ label, value, color }: { label: string; value: string; color: "green" | "cyan" | "amber" | "slate" }) {
  const dot = { green: "bg-emerald-300", cyan: "bg-cyan-300", amber: "bg-amber-300", slate: "bg-slate-500" };
  const text = { green: "text-emerald-200", cyan: "text-cyan-200", amber: "text-amber-200", slate: "text-slate-400" };
  return <div className="flex items-center justify-between gap-3"><span className="text-xs text-slate-400">{label}</span><span className={`inline-flex items-center gap-2 text-[11px] font-medium ${text[color]}`}><span className={`h-1.5 w-1.5 rounded-full ${dot[color]}`} />{value}</span></div>;
}
