"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, setAuthToken } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { Loader2, ArrowRight, Zap, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ username?: string; password?: string }>({});
  const router = useRouter();
  const { refreshUser } = useAuth();

  const validate = () => {
    const errs: { username?: string; password?: string } = {};
    if (!username.trim()) errs.username = "Username is required";
    else if (username.trim().length < 3) errs.username = "Username must be at least 3 characters";
    if (!password) errs.password = "Password is required";
    else if (password.length < 6) errs.password = "Password must be at least 6 characters";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("username", username.trim());
      formData.append("password", password);

      const res = await api.post("/auth/login", formData);
      setAuthToken(res.data.access_token);
      await refreshUser();
      router.push("/dashboard");
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 401) {
        setError("Incorrect username or password. Please try again.");
      } else if (status === 422) {
        setError("Please check your input and try again.");
      } else if (!err.response) {
        setError("Cannot reach the server. Check your connection.");
      } else {
        setError(err.response?.data?.detail || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 font-dm-sans relative overflow-hidden">
      <div className="w-full max-w-md animate-fade-up relative z-10">
        {/* Logo / Brand */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 bg-violet-600/20 border border-violet-600/30 rounded-[1.25rem] flex items-center justify-center text-violet-400 mb-5 shadow-2xl shadow-violet-900/20">
            <Zap className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight font-syne">Welcome back</h1>
          <p className="text-gray-500 mt-1.5 text-sm">Sign in to your Ritey AI workspace</p>
        </div>

        <div className="glass-panel rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Global error */}
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-500/10 text-red-400 border border-red-500/20 rounded-2xl text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Username */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 ml-1">Username</label>
              <input
                id="login-username"
                type="text"
                placeholder="Your username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, username: undefined }));
                }}
                className={`w-full px-5 py-3.5 bg-white/5 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/40 text-white transition-all placeholder:text-gray-700 ${
                  fieldErrors.username ? "border-red-500/50 bg-red-500/5" : "border-white/10"
                }`}
                autoComplete="username"
                required
              />
              {fieldErrors.username && (
                <p className="text-xs text-red-400 ml-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {fieldErrors.username}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 ml-1">Password</label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  className={`w-full px-5 py-3.5 pr-12 bg-white/5 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/40 text-white transition-all placeholder:text-gray-700 ${
                    fieldErrors.password ? "border-red-500/50 bg-red-500/5" : "border-white/10"
                  }`}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-red-400 ml-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {fieldErrors.password}
                </p>
              )}
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-3.5 px-6 btn-primary text-white font-bold transition-all disabled:opacity-60 active:scale-95 mt-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span className="flex items-center gap-2.5">
                  Sign In <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>

          <div className="mt-7 pt-6 border-t border-white/5 text-center">
            <p className="text-gray-500 text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-violet-400 font-semibold hover:underline underline-offset-4">
                Create one free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
