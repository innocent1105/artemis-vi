import { DashboardPage } from "./pages/DashboardPage";
import { EarthBackdrop } from "./components/layout/EarthBackdrop";

export default function App() {
  return (
    <div className="relative min-h-[100svh] overflow-hidden bg-[#020617]">
      <EarthBackdrop />
      <div className="relative z-10 min-h-[100svh]">
        <DashboardPage />
      </div>
    </div>
  );
}
