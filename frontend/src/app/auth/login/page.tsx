"use client";

import { useState } from "react";
import { User, Lock, Eye, EyeOff, LogIn, Shield, TrendingUp, Users } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/users/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Login successful, data:", data);
        console.log("User data from backend:", data.user);
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        console.log("User data stored in localStorage");
        console.log("Verify storage:", localStorage.getItem("token"), localStorage.getItem("user"));
        window.location.href = "/admin/dashboard";
      } else {
        const errorData = await response.json();
        console.error("Login error response:", errorData);
        setError(errorData.error || "Invalid credentials");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative w-full h-screen overflow-hidden flex">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/login picture background .png')",
        }}
      />

      {/* Dark blue overlay for left side text readability */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(5, 40, 82, 0.97) 0%, rgba(7, 54, 105, 0.92) 35%, rgba(10, 77, 140, 0.45) 55%, rgba(10, 77, 140, 0.08) 72%, rgba(10, 77, 140, 0) 100%)",
        }}
      />

      {/* Left content */}
      <div className="relative z-10 w-[55%] min-h-screen p-10 flex flex-col">
        {/* Logo - top left */}
        <div className="absolute top-8 left-10">
          <img
            src="/sws-logo-current.png"
            alt="Spencer Water Services"
            className="w-40 h-auto object-contain"
          />
        </div>

        {/* Hero content */}
        <div className="mt-24 max-w-xl">
          <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-4">
            Smart <span className="text-[#1ca9e8]">Water</span> Solutions
            <br />
            for a Sustainable Future
          </h1>

          <p className="text-base text-white/85 leading-relaxed max-w-md mb-6">
            Managing water projects, operations and resources efficiently for
            communities that rely on us.
          </p>

          {/* Blue accent line */}
          <div className="w-20 h-1 bg-[#54c7f5] rounded-full mb-6" />

          {/* Features */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-[#1d8fe0] to-[#0752b5] shadow-lg shadow-blue-500/35">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg text-white font-semibold mb-0.5">
                  Secure Access
                </h3>
                <p className="text-sm text-white/75">
                  Your data is protected with enterprise security
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-[#1d8fe0] to-[#0752b5] shadow-lg shadow-blue-500/35">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg text-white font-semibold mb-0.5">
                  Real-time Insights
                </h3>
                <p className="text-sm text-white/75">
                  Make informed decisions with accurate data
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-[#1d8fe0] to-[#0752b5] shadow-lg shadow-blue-500/35">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg text-white font-semibold mb-0.5">
                  Team Collaboration
                </h3>
                <p className="text-sm text-white/75">
                  Work together for greater impact
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom slogan */}
        <div className="mt-auto pb-4 flex items-center gap-3 text-[#9edcf8] text-xs font-semibold tracking-widest">
          <span className="w-8 h-0.5 bg-[#54c7f5] rounded-full" />
          CLEAN WATER • HEALTHY COMMUNITIES • A BRIGHTER FUTURE
        </div>
      </div>

      {/* Login panel */}
      <div className="relative z-20 w-[45%] h-screen flex items-center justify-center p-8">
        <div className="bg-white/96 backdrop-blur-sm rounded-3xl shadow-2xl w-full max-w-lg h-[calc(100vh-4rem)] pt-2 px-8 pb-4 flex flex-col">
          {/* Logo */}
          <div className="flex justify-center mt-0 mb-0">
            <img
              src="/sws-logo-current.png"
              alt="SWS Logo"
              className="h-36 w-full object-contain"
            />
          </div>

          {/* Header */}
          <div className="text-center mb-2">
            <h1 className="text-xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-sm text-gray-600 mt-0">
              Sign in to your account
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-2 bg-red-50 border border-red-200 rounded-lg p-2 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-2 flex-1">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Username or Email
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username or email"
                  required
                  className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <a
                href="#"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              <LogIn className="h-4 w-4" />
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-2 text-center text-xs text-gray-500">
            <p>© {new Date().getFullYear()} Spencer Water Services Ltd</p>
          </div>
        </div>
      </div>
    </main>
  );
}
