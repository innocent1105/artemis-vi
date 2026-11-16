/**
 * ASTRA HEALTH Registration Page.
 * Astronaut registration with email, password, and full name.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { UserPlus, Mail, Lock, User, AlertCircle, ArrowRight } from "lucide-react";

interface RegisterFormData {
  email: string;
  password: string;
  full_name: string;
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, state } = useAuth();

  const [formData, setFormData] = useState<RegisterFormData>({
    email: "",
    password: "",
    full_name: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const { [name]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      errors.full_name = "Full name is required";
    } else if (formData.full_name.trim().length < 2) {
      errors.full_name = "Full name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email address";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await register(formData.email, formData.password, formData.full_name.trim());
      navigate("/dashboard");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Registration failed";
      if (message.includes("already exists")) {
        setFieldErrors({ email: message });
      } else {
        setFieldErrors({ _form: message });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-astra-navy">
      <div className="flex-1 min-h-0 flex items-center justify-center">
        <div className="w-full max-w-md px-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded bg-astra-cyan flex items-center justify-center">
              <UserPlus size={20} strokeWidth={2} />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Create Account
            </h1>
          </div>

          {state.error && (
            <div className="mb-6 p-3 rounded bg-astra-red/10 border border-astra-red/20 text-astra-red text-sm">
              <AlertCircle size={16} className="mr-2" />
              {state.error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-astra-slate mb-1">
                Full name
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-astra-slate" />
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Astronaut Name"
                  className={`w-full pl-10 pr-4 py-3 rounded bg-white/5 border text-white placeholder-astra-slate/50 focus:border-astra-cyan focus:outline-none focus:ring-1 focus:ring-astra-cyan transition ${
                    fieldErrors.full_name ? "border-astra-red" : ""
                  }`}
                />
              </div>
              {fieldErrors.full_name && (
                <p className="mt-1 text-xs text-astra-red">{fieldErrors.full_name}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-astra-slate mb-1">
                Email address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-astra-slate" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="astronaut@astra.health"
                  className={`w-full pl-10 pr-4 py-3 rounded bg-white/5 border text-white placeholder-astra-slate/50 focus:border-astra-cyan focus:outline-none focus:ring-1 focus:ring-astra-cyan transition ${
                    fieldErrors.email ? "border-astra-red" : ""
                  }`}
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-astra-red">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-astra-slate mb-1">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-astra-slate" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-4 py-3 rounded bg-white/5 border text-white placeholder-astra-slate/50 focus:border-astra-cyan focus:outline-none focus:ring-1 focus:ring-astra-cyan transition ${
                    fieldErrors.password ? "border-astra-red" : ""
                  }`}
                />
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-astra-red">{fieldErrors.password}</p>
              )}
            </div>

            {fieldErrors._form && (
              <p className="mt-1 text-xs text-astra-red">{fieldErrors._form}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting || state.isLoading}
              className={`w-full px-4 py-3 rounded bg-astra-cyan text-white font-medium hover:bg-astra-cyanDark disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-transparent rounded-full animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <ArrowRight size={16} />
                  <span>Register</span>
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-astra-slate">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-astra-cyan hover:text-astra-cyanDark underline underline-offset-2"
            >
              Sign in
            </a>
          </p>
          <p className="mt-2 text-center text-xs text-astra-slate">
            Your account will be created with astronaut status and pending approval.
          </p>
        </div>
      </div>
    </div>
  );
}
