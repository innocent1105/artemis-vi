import { DashboardPage } from "./pages/DashboardPage";
import { EarthBackdrop } from "./components/layout/EarthBackdrop";
import { AiSymptomAssistant } from "./components/wellbeing/AiSymptomAssistant";

export default function App() {
  return (
    <div className="relative min-h-[100svh] overflow-hidden bg-[#020617]">
      <EarthBackdrop />
      <div className="relative z-10 min-h-[100svh]">
        <DashboardPage />
        <div className="mt-6 max-w-7xl mx-auto px-4 pb-12">
          <AiSymptomAssistant />
        </div>
      </div>
    </div>
  );
}