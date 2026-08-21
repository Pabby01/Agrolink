import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sprout, Tractor, ShoppingCart, Truck, ShieldCheck, Leaf } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Role } from "../../types/enums";

export function AuthPage() {
  const { loginAsRole, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"demo" | "login" | "register">("demo");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>(Role.Farmer);
  const [error, setError] = useState<string | null>(null);

  async function handleDemoLogin(selectedRole: Role) {
    setError(null);
    try {
      await loginAsRole(selectedRole);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const { authService } = await import("../../services/authService");
      const user = await authService.login(email, password);
      sessionStorage.setItem("agrolink_session", JSON.stringify(user));
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const { authService } = await import("../../services/authService");
      const user = await authService.register({ name, email, role });
      sessionStorage.setItem("agrolink_session", JSON.stringify(user));
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }
  }

  const demoAccounts = [
    { role: Role.Farmer, label: "Farmer", icon: Tractor, desc: "Aisha Farms", email: "aisha@agrolink.com", color: "bg-forest-700" },
    { role: Role.Buyer, label: "Buyer", icon: ShoppingCart, desc: "FreshMart Foods", email: "chidi@freshmart.com", color: "bg-sage-500" },
    { role: Role.Transporter, label: "Transporter", icon: Truck, desc: "SwiftHaul Logistics", email: "emeka@swifthaul.com", color: "bg-gold-500" },
    { role: Role.Admin, label: "Admin", icon: ShieldCheck, desc: "Platform Admin", email: "admin@agrolink.com", color: "bg-forest-600" },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex w-1/2 bg-forest-900 text-ivory-50 p-12 flex-col justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sage-400">
            <Sprout className="h-6 w-6 text-forest-900" />
          </div>
          <div>
            <div className="text-2xl font-bold">Agrolink</div>
            <div className="text-sm text-sage-300">Farm to Market</div>
          </div>
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            The trusted network<br />moving food from<br />farm to market.
          </h1>
          <p className="text-lg text-sage-200 max-w-md">
            Discover verified produce, match with trusted transport, and complete transactions with proof of delivery and dispute protection.
          </p>
          <div className="flex items-center gap-2 text-sm text-sage-300">
            <Leaf className="h-4 w-4" />
            AI-powered crop intelligence included
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gold-400">92</div>
            <div className="text-xs text-sage-300">Farmer trust</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gold-400">95</div>
            <div className="text-xs text-sage-300">Transporter trust</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gold-400">97%</div>
            <div className="text-xs text-sage-300">Fulfilment rate</div>
          </div>
        </div>
      </div>

      {/* Right panel - auth */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-ivory-100">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-800">
              <Sprout className="h-5 w-5 text-sage-300" />
            </div>
            <div className="text-xl font-bold text-forest-900">Agrolink</div>
          </div>

          <h2 className="text-2xl font-bold text-forest-900 mb-2">Welcome to Agrolink</h2>
          <p className="text-sm text-forest-500 mb-6">Sign in to your account or try a demo role.</p>

          {/* Mode tabs */}
          <div className="flex gap-1 p-1 rounded-lg bg-sage-100 mb-6">
            <button
              onClick={() => setMode("demo")}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${mode === "demo" ? "bg-white text-forest-800 shadow-sm" : "text-forest-500"}`}
            >
              Demo Login
            </button>
            <button
              onClick={() => setMode("login")}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${mode === "login" ? "bg-white text-forest-800 shadow-sm" : "text-forest-500"}`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode("register")}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${mode === "register" ? "bg-white text-forest-800 shadow-sm" : "text-forest-500"}`}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {mode === "demo" && (
            <div className="space-y-3">
              {demoAccounts.map((acc) => {
                const Icon = acc.icon;
                return (
                  <button
                    key={acc.role}
                    onClick={() => handleDemoLogin(acc.role)}
                    disabled={loading}
                    className="w-full flex items-center gap-4 rounded-xl border border-sage-200 bg-white px-5 py-4 hover:border-forest-400 hover:shadow-md transition-all disabled:opacity-50 text-left"
                  >
                    <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${acc.color} text-white`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-forest-900">{acc.label}</div>
                      <div className="text-xs text-forest-500">{acc.desc}</div>
                    </div>
                    <div className="text-xs text-forest-400">{acc.email}</div>
                  </button>
                );
              })}
              {loading && <p className="text-center text-sm text-forest-500">Signing in...</p>}
            </div>
          )}

          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  placeholder="you@agrolink.com"
                  required
                />
              </div>
              <div>
                <label className="label">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  placeholder="••••••••"
                  required
                />
              </div>
              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </button>
              <p className="text-xs text-center text-forest-500">
                Demo emails: aisha@agrolink.com, chidi@freshmart.com, emeka@swifthaul.com, admin@agrolink.com
              </p>
            </form>
          )}

          {mode === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="label">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">I am a...</label>
                <select value={role} onChange={(e) => setRole(e.target.value as Role)} className="input">
                  <option value={Role.Farmer}>Farmer</option>
                  <option value={Role.Buyer}>Buyer</option>
                  <option value={Role.Transporter}>Transporter</option>
                </select>
              </div>
              <div>
                <label className="label">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  required
                />
              </div>
              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
