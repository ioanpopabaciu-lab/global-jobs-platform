"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export interface User {
  id: string;
  email: string;
  name: string;
  account_type: "admin" | "employer" | "candidate" | "student" | "immigration_client" | "agency" | "migration_client";
  role?: string;
  created_at?: string;
  profile_completed?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ user: User }>;
  register: (name: string, email: string, password: string, accountType: string) => Promise<{ user: User }>;
  loginWithGoogle: () => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuth = useCallback(async () => {
    // Skip if we're on the OAuth callback page
    if (typeof window !== "undefined" && window.location.hash?.includes("session_id=")) {
      setLoading(false);
      return;
    }

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("gjc_token") : null;
      
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      } else {
        // No token, cannot check auth
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/auth/me`, {
        headers,
      });

      if (response.ok) {
        const userData = await response.json();
        const normalizedUser: User = {
          id: userData.id || userData.user_id,
          email: userData.email,
          name: userData.name,
          account_type: userData.account_type,
          created_at: userData.created_at,
          profile_completed: userData.profile_completed,
        };

        // CRITICAL SYNC: Ensure middleware sees the cookie on rapid subsequent route navigations
        if (token && typeof window !== "undefined") {
          document.cookie = `session_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=lax${window.location.protocol === 'https:' ? '; secure' : ''}`;
        }

        setUser(normalizedUser);
        setIsAuthenticated(true);
      } else {
        // Token invalid sau expirat — curăță tot ca middleware să nu mai redirecționeze
        setUser(null);
        setIsAuthenticated(false);
        if (typeof window !== "undefined") {
          localStorage.removeItem("gjc_token");
          document.cookie = "session_token=; path=/; max-age=0; samesite=lax";
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string, password: string) => {
    const response = await fetch(`/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin", // Enable cookie passing
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Login failed");
    }

    if (typeof window !== "undefined" && data.access_token) {
      localStorage.setItem("gjc_token", data.access_token);
      
      // Explicitly set the cookie purely on the client-side to bypass Vercel header strip issues
      // This allows Next.js middleware.ts to see the cookie perfectly upon route transition
      document.cookie = `session_token=${data.access_token}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=lax${window.location.protocol === 'https:' ? '; secure' : ''}`;
    }
    setUser(data.user);
    setIsAuthenticated(true);
    return data;
  };

  const register = async (name: string, email: string, password: string, accountType: string) => {
    const response = await fetch(`/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ name, email, password, account_type: accountType }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Registration failed");
    }

    if (typeof window !== "undefined" && data.access_token) {
      localStorage.setItem("gjc_token", data.access_token);
      
      // Explicitly sync cookie for middleware
      document.cookie = `session_token=${data.access_token}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=lax${window.location.protocol === 'https:' ? '; secure' : ''}`;
    }
    setUser(data.user);
    setIsAuthenticated(true);
    return data;
  };

  const loginWithGoogle = () => {
    alert("Google login coming soon");
  };

  const logout = async () => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("gjc_token");
        // Clear middleware cookie natively
        document.cookie = "session_token=; path=/; max-age=0";
      }
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "same-origin",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    loginWithGoogle,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Helper function to get redirect path based on account type
export function getRedirectPath(accountType: string): string {
  switch (accountType) {
    case "admin":
      return "/admin";
    case "employer":
      return "/portal/employer";
    case "agency":
      return "/portal/agency";
    case "student":
      return "/portal/student";
    case "immigration_client":
      return "/portal/immigration";
    case "migration_client":
      return "/portal/immigration";
    case "candidate":
    default:
      return "/portal/candidate";
  }
}
