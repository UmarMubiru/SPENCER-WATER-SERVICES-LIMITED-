"use client";

import { useState, FormEvent } from "react";
import { Lock, User, Eye, EyeOff, LogIn } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(username, password);
      window.location.href = "/admin/dashboard";
    } catch (err: any) {
      setError(err.message || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-3xl bg-white p-12 shadow-2xl border border-slate-100">
      <div className="mb-10 text-center">
        <div className="flex justify-center mb-6">
          <div className="h-24 w-24 bg-gradient-to-br from-[#0b2e5c] to-[#0066ff] rounded-2xl flex items-center justify-center shadow-lg">
            <img
              src="/sws-logo-current.png"
              alt="SWS Logo"
              className="h-20 w-20 object-contain"
            />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h2>
        <p className="text-base text-slate-500">
          Sign in to your Spencer Water Services account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="username"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Username or Email
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username or email"
              required
              className="w-full rounded-xl border-2 border-slate-200 py-4 pl-12 pr-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#0066ff] focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full rounded-xl border-2 border-slate-200 py-4 pl-12 pr-12 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#0066ff] focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <div className="text-right">
          <a
            href="/auth/forgot-password"
            className="text-sm font-medium text-[#0066ff] hover:text-[#0055dd]"
          >
            Forgot password?
          </a>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#0066ff] to-[#1e63b8] py-4 text-base font-semibold text-white transition-all hover:from-[#0055dd] hover:to-[#1a55a8] disabled:opacity-60 shadow-lg hover:shadow-xl"
        >
          <LogIn className="h-5 w-5" />
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Don&apos;t have an account?{" "}
        <a href="/auth/signup" className="font-medium text-[#0066ff] hover:text-[#0055dd]">
          Sign up
        </a>
      </p>
    </div>
  );
}
