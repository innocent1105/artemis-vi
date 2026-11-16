import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardPage } from "./pages/DashboardPage";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { EarthBackdrop } from "./components/layout/EarthBackdrop";

export default function App() {
  return (
    <BrowserRouter>
      <div className="relative min-h-[100svh] overflow-hidden bg-[#020617]">
        <EarthBackdrop />
        <div className="relative z-10 min-h-[100svh]">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
