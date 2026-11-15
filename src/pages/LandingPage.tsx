import { Activity, Moon, ShieldAlert } from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="border border-slate-800 bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 hover:border-slate-600 transition-colors">
      <div className="w-10 h-10 rounded bg-slate-800 flex items-center justify-center text-cyan-400 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}

export function LandingPage() {
  const handleLoginClick = () => {
    console.log("Login clicked");
    // TODO: Route to /login once backend is ready
  };

  return (
    <div
      className="min-h-screen relative flex flex-col text-white font-sans"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=2000&auto=format&fit=crop')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/70 to-slate-950/95 z-0" />

      <div className="relative z-10 flex-1 flex flex-col">
        <header className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded border border-slate-700 bg-slate-900/50 flex items-center justify-center text-cyan-400 text-xs font-bold tracking-wider">
              A
            </div>
            <span className="text-xl font-semibold tracking-tight text-white">ARTEMIS</span>
          </div>
          <span className="text-xs font-medium text-slate-400 border border-slate-700 px-3 py-1 rounded bg-slate-900/40">
            Prototype Environment
          </span>
        </header>

        <main className="flex-1 px-6 py-12 max-w-7xl mx-auto w-full">
          <section className="max-w-2xl">
            <span className="inline-block mb-4 px-3 py-1 rounded text-xs font-semibold text-cyan-400 border border-cyan-500/30 uppercase tracking-wider">
              NASA Human Research Program Prototype
            </span>
            <h1 className="text-4xl md:text-5xl font-light leading-tight text-white mb-6">
              Welcome to ARTEMIS.
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed mb-8 max-w-lg">
              Advanced health monitoring and early-warning system for human
              spaceflight. Unifying physical assessments, sleep tracking, and
              behavioral wellbeing into a single, explainable clinical timeline.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleLoginClick}
                className="flex-1 sm:flex-1 px-5 py-3 bg-white text-[#020617] font-semibold rounded hover:bg-slate-200 transition-colors"
              >
                Get Started
              </button>
              <a
                href="https://www.nasa.gov/hrp/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-1 px-5 py-3 border border-slate-600 text-slate-200 font-semibold rounded hover:bg-slate-800 transition-colors"
              >
                Read Documentation
              </a>
            </div>
          </section>

          <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Activity className="w-5 h-5" />}
              title="Computer Vision"
              description="Movement and posture analysis via MediaPipe pose landmark estimation for physical performance indicators."
            />
            <FeatureCard
              icon={<Moon className="w-5 h-5" />}
              title="Longitudinal Tracking"
              description="Sleep sessions, recovery, and stress/wellbeing check-ins recorded over time against a personal baseline."
            />
            <FeatureCard
              icon={<ShieldAlert className="w-5 h-5" />}
              title="Clinical Rule Engine"
              description="Explainable alerts for flight surgeons based on NASA Human Research Program data and configurable rules."
            />
          </section>
        </main>

        <footer className="border-t border-slate-800/50 bg-slate-950/60 px-6 py-8">
          <p className="text-xs text-slate-500">
            ARTEMIS &copy; 2026. Prototype for demonstration only. Not for
            clinical use.
          </p>
        </footer>
      </div>
    </div>
  );
}
