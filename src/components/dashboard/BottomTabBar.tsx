import { Activity, Bell, UserRound, Clock3, Layers } from "lucide-react";

interface BottomTabBarProps {
  active: "overview" | "alerts" | "profile" | "history" | "timeline";
  onChange: (tab: "overview" | "alerts" | "profile" | "history" | "timeline") => void;
  alertsCount: number;
}

const TABS: Array<{
  id: "overview" | "alerts" | "profile" | "history" | "timeline";
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}> = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "alerts", label: "Alerts", icon: Bell },
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "history", label: "History", icon: Clock3 },
  { id: "timeline", label: "Timeline", icon: Layers },
];

export function BottomTabBar({ active, onChange, alertsCount }: BottomTabBarProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#07111f]/90 backdrop-blur pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="flex items-center justify-around px-4 py-2">
        {TABS.map((tab) => {
          const isActive = active === tab.id;
          const Icon = tab.icon;
          const badge = tab.id === "alerts" && alertsCount > 0;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              aria-label={badge ? `${tab.label}, ${alertsCount} new alerts` : tab.label}
              className="flex flex-col items-center gap-1 min-h-[2.75rem] min-w-[2.75rem] p-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-astra-cyan"
            >
              <div className="relative flex items-center justify-center">
                <Icon size={20} className={isActive ? "text-cyan-300" : "text-slate-500"} />
                {badge && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
                    {alertsCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-semibold uppercase tracking-wider ${isActive ? "text-cyan-300" : "text-slate-500"}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
