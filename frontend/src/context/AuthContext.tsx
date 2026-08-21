import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Role } from "../types/enums";
import type { User } from "../types";
import { authService } from "../services/authService";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  error: string | null;
  loginAsRole: (role: Role) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; role: Role; phone?: string; location?: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "agrolink_session";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
  }, []);

  function persist(u: User) {
    setUser(u);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(u));
  }

  async function loginAsRole(role: Role) {
    setLoading(true);
    setError(null);
    try {
      const u = await authService.loginAsRole(role);
      persist(u);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    setLoading(true);
    setError(null);
    try {
      const u = await authService.login(email, password);
      persist(u);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function register(data: { name: string; email: string; role: Role; phone?: string; location?: string }) {
    setLoading(true);
    setError(null);
    try {
      const u = await authService.register(data);
      persist(u);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setUser(null);
    sessionStorage.removeItem(STORAGE_KEY);
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, loginAsRole, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
