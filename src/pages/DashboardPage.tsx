import { useState } from "react";
import { useMedicalData } from "../hooks/useMedicalData";
import { BottomTabBar } from "../components/dashboard/BottomTabBar";
import { AlertQueue } from "../components/dashboard/AlertQueue";
import { AlertReviewPanel } from "../components/dashboard/AlertReviewPanel";
import { HealthHistory } from "../components/dashboard/HealthHistory";
import { AstronautRoster } from "../components/dashboard/AstronautRoster";
import { AstronautProfile } from "../components/dashboard/AstronautProfile";
import { MetricCard } from "../components/dashboard/MetricCard";
import { ScoreTrend } from "../components/dashboard/ScoreTrend";
import type { AlertItem } from "../types/health";

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
    assessmentsToday,
    totalAstronauts,
  } = useMedicalData();

  const [activeTab, setActiveTab] = useState<"overview" | "alerts" | "profile" | "history">("overview");
  const [reviewAlert, setReviewAlert] = useState<AlertItem | null>(null);

  const openAlertCount = alertsToReview.length;

  const handleAlertSelect = (alert: AlertItem) => {
    setReviewAlert(alert);
  };

  return (
    <div className="flex flex-col min-h-[100svh] bg-astra-navy">
      {activeTab === "overview" && (
        <div className="flex-1 overflow-y-auto p-6 pb-[env(safe-area-inset-bottom)]">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">ASTRA Dashboard</h1>
                <p className="text-astra-slate mt-1">
                  Astronaut movement & health monitoring
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedAstronautId(null)}
                  className={`px-4 py-2 min-h-[2.75rem] min-w-[2.75rem] rounded border transition ${
                    !selectedAstronautId
                      ? "bg-astra-cyan/10 border-astra-cyan text-astra-cyan active:bg-astra-cyan/20"
                      : "border-astra-border/50 text-astra-slate active:bg-white/5"
                  } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-astra-cyan`}
                >
                  All Crew
                </button>
              </div>
            </div>

            {selectedAstronaut ? (
              <AstronautProfile profile={selectedAstronaut} />
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <MetricCard title="Total Crew" value={totalAstronauts} trend="neutral" />
                  <MetricCard title="Assessments Today" value={assessmentsToday} trend="up" />
                  <MetricCard title="Alerts Pending" value={openAlertCount} trend={openAlertCount > 0 ? "down" : "neutral"} />
                  <MetricCard title="System Status" value="Online" trend="neutral" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  <div className="lg:col-span-2">
                    <ScoreTrend records={records} />
                  </div>
                  <div className="lg:col-span-1">
                    <AstronautRoster
                      astronauts={astronauts}
                      selectedId={selectedAstronautId ?? null}
                      onSelect={setSelectedAstronautId}
                    />
                  </div>
                </div>

                <HealthHistory
                  alerts={alerts}
                  onAcknowledgeAlert={acknowledgeAlert}
                />
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === "alerts" && (
        <div className="flex-1 overflow-y-auto p-6 pb-[env(safe-area-inset-bottom)]">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">Alert Review</h2>
                <p className="text-astra-slate mt-1">Review and manage crew health alerts.</p>
              </div>
            </div>
            <AlertQueue alerts={alerts} onAlertSelect={handleAlertSelect} />
          </div>
        </div>
      )}

      {activeTab === "profile" && (
        <div className="flex-1 overflow-y-auto p-6 pb-[env(safe-area-inset-bottom)]">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-white mb-6">Crew Profile</h2>
            <AstronautRoster
              astronauts={astronauts}
              selectedId={selectedAstronautId ?? null}
              onSelect={setSelectedAstronautId}
            />
            {selectedAstronaut && (
              <div className="mt-8">
                <AstronautProfile profile={selectedAstronaut} />
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <div className="flex-1 overflow-y-auto p-6 pb-[env(safe-area-inset-bottom)]">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-xl font-bold text-white mb-6">Assessment History</h2>
            <HealthHistory
              alerts={alerts}
              onAcknowledgeAlert={acknowledgeAlert}
            />
          </div>
        </div>
      )}

      <AlertReviewPanel
        open={reviewAlert !== null}
        alert={reviewAlert}
        onClose={() => setReviewAlert(null)}
        onAcknowledge={acknowledgeAlert}
        onResolve={resolveAlert}
      />

      <BottomTabBar
        active={activeTab}
        onChange={setActiveTab}
        alertsCount={openAlertCount}
      />
    </div>
  );
}
