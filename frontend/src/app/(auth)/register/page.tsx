"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Link from "next/link";
import { Loader2, ArrowRight, Zap, Eye, EyeOff, Sparkles, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

function getStrength(pw: string): 0 | 1 | 2 | 3 {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9!@#$%^&*]/.test(pw)) score++;
  return score as 0 | 1 | 2 | 3;
}

const STRENGTH_LABEL = ["", "Weak", "Fair", "Strong"];
const STRENGTH_COLOR = ["", "bg-red-500", "bg-yellow-500", "bg-emerald-500"];
const STRENGTH_TEXT = ["", "text-red-400", "text-yellow-400", "text-emerald-400"];

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ username?: string; password?: string; confirm?: string }>({});
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const strength = getStrength(password);

  const validate = () => {
    const errs: { username?: string; password?: string; confirm?: string } = {};
    const u = username.trim();
    if (!u) errs.username = "Username is required";
    else if (u.length < 3) errs.username = "Username must be at least 3 characters";
    else if (u.length > 32) errs.username = "Username must be 32 characters or fewer";

    if (!password) errs.password = "Password is required";
    else if (password.length < 6) errs.password = "Password must be at least 6 characters";

    if (!confirmPassword) errs.confirm = "Please confirm your password";
    else if (confirmPassword !== password) errs.confirm = "Passwords don't match";

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError("");

    try {
      await api.post("/auth/register", {
        username: username.trim(),
        password,
      });
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 400) {
        setError("Username is already taken. Please choose another one.");
      } else if (status === 422) {
        const detail = err.response?.data?.detail;
        if (Array.isArray(detail)) {
          setError(detail[0]?.msg || "Invalid input. Please check your details.");
        } else {
          setError(detail || "Invalid input.");
        }
      } else if (!err.response) {
        setError("Cannot reach the server. Check your connection.");
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 font-dm-sans relative overflow-hidden">
      <div className="w-full max-w-md animate-fade-up relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 bg-violet-600/20 border border-violet-600/30 rounded-[1.25rem] flex items-center justify-center text-violet-400 mb-5 shadow-2xl shadow-violet-900/20">
            <Zap className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight font-syne">Create account</h1>
          <p className="text-gray-500 mt-1.5 text-sm">Join Ritey AI and start creating</p>
        </div>

        <div className="glass-panel rounded-3xl p-8 shadow-2xl">
          {success ? (
            <div className="text-center py-8 space-y-5">
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white font-syne">Account created!</h2>
                <p className="text-gray-400 text-sm mt-1">Redirecting you to sign in...</p>
              </div>
              <Loader2 className="w-5 h-5 animate-spin mx-auto text-violet-500" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
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
                  id="register-username"
                  type="text"
                  placeholder="e.g., alex_creator"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setFieldErrors((p) => ({ ...p, username: undefined }));
                  }}
                  className={cn(
                    "w-full px-5 py-3.5 bg-white/5 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/40 text-white transition-all placeholder:text-gray-700",
                    fieldErrors.username ? "border-red-500/50 bg-red-500/5" : "border-white/10"
                  )}
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
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setFieldErrors((p) => ({ ...p, password: undefined }));
                    }}
                    className={cn(
                      "w-full px-5 py-3.5 pr-12 bg-white/5 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/40 text-white transition-all placeholder:text-gray-700",
                      fieldErrors.password ? "border-red-500/50 bg-red-500/5" : "border-white/10"
                    )}
                    autoComplete="new-password"
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

                {/* Strength bar */}
                {password && (
                  <div className="space-y-1.5">
                    <div className="flex gap-1.5">
                      {[1, 2, 3].map((level) => (
                        <div
                          key={level}
                          className={cn(
                            "h-1 flex-1 rounded-full transition-all duration-300",
                            strength >= level ? STRENGTH_COLOR[strength] : "bg-white/10"
                          )}
                        />
                      ))}
                    </div>
                    <p className={cn("text-xs ml-1", STRENGTH_TEXT[strength])}>
                      {STRENGTH_LABEL[strength]} password
                      {strength < 3 && " — add uppercase letters, numbers or symbols"}
                    </p>
                  </div>
                )}

                {fieldErrors.password && (
                  <p className="text-xs text-red-400 ml-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {fieldErrors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 ml-1">Confirm Password</label>
                <div className="relative">
                  <input
                    id="register-confirm-password"
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setFieldErrors((p) => ({ ...p, confirm: undefined }));
                    }}
                    className={cn(
                      "w-full px-5 py-3.5 pr-12 bg-white/5 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/40 text-white transition-all placeholder:text-gray-700",
                      fieldErrors.confirm
                        ? "border-red-500/50 bg-red-500/5"
                        : confirmPassword && confirmPassword === password
                        ? "border-emerald-500/40"
                        : "border-white/10"
                    )}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  {confirmPassword && confirmPassword === password && (
                    <CheckCircle className="absolute right-11 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                  )}
                </div>
                {fieldErrors.confirm && (
                  <p className="text-xs text-red-400 ml-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {fieldErrors.confirm}
                  </p>
                )}
              </div>

              <button
                id="register-submit"
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center py-3.5 px-6 btn-primary text-white font-bold transition-all disabled:opacity-60 active:scale-95 mt-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <span className="flex items-center gap-2.5">
                    Create Account <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </button>
            </form>
          )}

          {!success && (
            <div className="mt-7 pt-6 border-t border-white/5 text-center">
              <p className="text-gray-500 text-sm">
                Already have an account?{" "}
                <Link href="/login" className="text-violet-400 font-semibold hover:underline underline-offset-4">
                  Sign in
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
