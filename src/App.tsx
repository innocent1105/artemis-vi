import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import { DashboardPage } from "./pages/DashboardPage";
import { EarthBackdrop } from "./components/layout/EarthBackdrop";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/dashboard"
          element={
            <div className="relative min-h-[100svh] overflow-hidden bg-[#020617]">
              <EarthBackdrop />
              <div className="relative z-10 min-h-[100svh]">
                <DashboardPage />
              </div>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
