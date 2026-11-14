import { useState } from "react";
import { Activity, ShieldCheck, Moon, Brain, } from "lucide-react";
import { HealthTimelinePage } from "./HealthTimelinePage.tsx";

export function DashboardPage() {
  const [tab, setTab] = useState<"overview" | "timeline">("timeline");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans">
      
      {/* Top Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/50 p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-blue-500 w-8 h-8" />
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide">ASTRA HEALTH</h1>
              <p className="text-xs text-slate-400">Mission Control Dashboard</p>
            </div>
          </div>
          
          <nav className="flex gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button 
              onClick={() => setTab("timeline")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${tab === "timeline" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              Health Timeline & Alerts
            </button>
            <button 
              onClick={() => setTab("overview")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${tab === "overview" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              System Overview
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4">
        {tab === "timeline" ? (
           // THIS IS WHERE YOUR TASK 4 WORK RENDERS
           <HealthTimelinePage />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
              <Activity className="text-emerald-400 w-8 h-8 mb-4" />
              <h2 className="text-lg font-bold text-white mb-2">Physical</h2>
              <p className="text-sm text-slate-400">MediaPipe posture analysis module active.</p>
            </div>
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
              <Moon className="text-indigo-400 w-8 h-8 mb-4" />
              <h2 className="text-lg font-bold text-white mb-2">Sleep</h2>
              <p className="text-sm text-slate-400">Sleep tracking and recovery analysis active.</p>
            </div>
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
              <Brain className="text-purple-400 w-8 h-8 mb-4" />
              <h2 className="text-lg font-bold text-white mb-2">Wellbeing</h2>
              <p className="text-sm text-slate-400">Stress and AI assistant modules active.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}