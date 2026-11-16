import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, UserPlus, ArrowLeft } from "lucide-react";
import { userRepository } from "../storage/userRepository";

export function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username || !password) {
      setError("Username and password are required.");
      return;
    }
    const existing = userRepository.get();
    if (existing.username && existing.username === username) {
      setError("An account with that username already exists.");
      return;
    }
    userRepository.save({
      username,
      userRole: role || "Crew member",
      position: "",
      healthStatus: "",
      medicalHistory: "",
      currentIssues: "",
    });
    navigate("/login");
  };

  return (
    <div className="min-h-[100svh] bg-[#020617] text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Link
            to="/login"
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 bg-black/40 hover:bg-white/5 transition-colors"
          >
            <ArrowLeft size={16} /> Back to login
          </Link>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 rounded bg-[#22d3ee]/20 flex items-center justify-center text-[#22d3ee] mx-auto mb-4">
            <UserPlus size={28} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Create account</h1>
          <p className="mt-2 text-sm text-slate-400">Join ARTEMIS mission control</p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-900/20 border border-red-500/30 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="crew-member-01"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">Password</label>
            <div className="relative">
              <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full pr-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50"
            >
              <option value="">Select a role</option>
              <option value="Crew member">Crew member</option>
              <option value="Medical officer">Medical officer</option>
              <option value="Flight surgeon">Flight surgeon</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#22d3ee] text-[#020617] font-semibold hover:bg-cyan-300 transition-colors"
          >
            <UserPlus size={18} /> Create account
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Already have an account?{" "}
          <Link to="/login" className="text-cyan-400 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}
