"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export interface User {
  id: string;
  email: string;
  name: string;
  account_type: "admin" | "employer" | "candidate" | "student" | "immigration_client";
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
        setUser(normalizedUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        if (typeof window !== "undefined") localStorage.removeItem("gjc_token");
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
      credentials: "omit", // Better for proxies, handles cookies differently if needed
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Login failed");
    }

    if (typeof window !== "undefined" && data.access_token) {
      localStorage.setItem("gjc_token", data.access_token);
    }
    setUser(data.user);
    setIsAuthenticated(true);
    return data;
  };

  const register = async (name: string, email: string, password: string, accountType: string) => {
    const response = await fetch(`/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "omit",
      body: JSON.stringify({ name, email, password, account_type: accountType }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Registration failed");
    }

    if (typeof window !== "undefined" && data.access_token) {
      localStorage.setItem("gjc_token", data.access_token);
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
      if (typeof window !== "undefined") localStorage.removeItem("gjc_token");
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "omit",
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
    case "student":
      return "/portal/student";
    case "immigration_client":
      return "/portal/immigration";
    case "candidate":
    default:
      return "/portal/candidate";
  }
}
