import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";

export type UserRole = "guest" | "citizen" | "volunteer" | "donor" | "admin" | "super_admin";

export interface User {
  id: string;
  name: string;
  username?: string;
  phone?: string;
  email?: string;
  avatar?: string;
  role: UserRole;
  displayName?: string;
  janSevaCardNo?: string;
  registration_number?: string;
  janSevaCardStatus?: "none" | "pending" | "approved" | "rejected";
  gender?: string;
  dob?: string;
  address?: string;
  isVolunteer?: boolean;
  isDonor?: boolean;
  volunteerData?: any;
  blood_group?: string;
  interests?: string[];
  onboardingCompleted?: boolean;
  points?: number;
  badges?: number;
  cover?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  language: "en" | "hi";
  setLanguage: (lang: "en" | "hi") => void;
  login: (userData: Partial<User>, token?: string) => Promise<void>;
  loginAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<boolean>;
  completeOnboarding: (interests: string[]) => Promise<void>;
  hasAdminAccess: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);
const STORAGE_KEY = "@rpf_user";
const LANG_KEY = "@rpf_lang";

// Web deployment can keep using same-origin /api routes. The Android APK runs from
// Capacitor's local WebView origin, so relative /api URLs do not reach the production backend.
const API_BASE = Capacitor.isNativePlatform() ? "https://appapi.therpfoundation.org" : "";
const apiUrl = (path: string) => `${API_BASE}${path}`;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("@rpf_token"));
  const [language, setLanguageState] = useState<"en" | "hi">("en");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
    loadLanguage();
  }, []);

  const clearSession = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("@rpf_token");
    setToken(null);
    setUser(null);
  };

  const loadUser = async () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const storedToken = localStorage.getItem("@rpf_token");
      if (!stored || !storedToken) {
        clearSession();
        return;
      }

      const parsed: User = JSON.parse(stored);
      setUser(parsed);
      try {
        const res = await fetch(apiUrl("/api/auth/me"), {
          headers: { Authorization: `Bearer ${storedToken}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            const fresh = data.user as Partial<User>;
            const merged: User = {
              ...parsed,
              ...fresh,
              role: (fresh.role as UserRole) ?? parsed.role,
              name: fresh.name ?? parsed.name,
              displayName: fresh.displayName ?? fresh.name ?? parsed.name,
              janSevaCardStatus: (fresh.janSevaCardStatus as User["janSevaCardStatus"]) || parsed.janSevaCardStatus || "none",
              janSevaCardNo: fresh.janSevaCardNo || parsed.janSevaCardNo,
              points: fresh.points ?? parsed.points,
              badges: fresh.badges ?? parsed.badges,
              avatar: fresh.avatar ?? parsed.avatar,
              cover: fresh.cover ?? parsed.cover,
              gender: fresh.gender ?? parsed.gender,
              dob: fresh.dob ?? parsed.dob,
              address: fresh.address ?? parsed.address,
              username: fresh.username ?? parsed.username,
              phone: fresh.phone ?? parsed.phone,
              email: fresh.email ?? parsed.email,
              isVolunteer: fresh.isVolunteer ?? parsed.isVolunteer,
              isDonor: fresh.isDonor ?? parsed.isDonor,
              volunteerData: fresh.volunteerData ?? parsed.volunteerData,
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
            setUser(merged);
          } else {
            clearSession();
          }
        } else if (res.status === 401 || res.status === 403 || res.status === 404) {
          clearSession();
        }
      } catch {
        // Keep cached session when the backend is temporarily unreachable.
      }
    } catch {
      clearSession();
    } finally {
      setIsLoading(false);
    }
  };

  const loadLanguage = () => {
    const stored = localStorage.getItem(LANG_KEY) as "en" | "hi" | null;
    if (stored === "en" || stored === "hi") setLanguageState(stored);
  };

  const setLanguage = (lang: "en" | "hi") => {
    localStorage.setItem(LANG_KEY, lang);
    setLanguageState(lang);
  };

  const saveUser = useCallback((u: User) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    setUser(u);
  }, []);

  const login = useCallback(async (userData: Partial<User>) => {
    try {
      const res = await fetch(apiUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
      });
      if (!res.ok) throw new Error(`Backend login failed (${res.status})`);
      const data = await res.json();
      if (!data.success || !data.user) throw new Error(data.error || "Backend login failed");
      if (data.token) {
        localStorage.setItem("@rpf_token", data.token);
        setToken(data.token);
      }
      saveUser({ janSevaCardStatus: "none", ...data.user });
    } catch (err) {
      console.error("AuthContext login error:", err);
      const userId = userData.id || userData.phone ? "usr_" + userData.phone?.replace(/\D/g, "") : "usr_" + Date.now();
      saveUser({
        id: userId,
        name: userData.name ?? "Citizen",
        displayName: userData.name ?? "Citizen",
        role: (userData.role as UserRole) ?? "citizen",
        janSevaCardStatus: "none",
        onboardingCompleted: false,
        points: 25,
        badges: 1,
        ...userData,
      } as User);
      throw err;
    }
  }, [saveUser]);

  const loginAsGuest = useCallback(async () => {
    try {
      const res = await fetch(apiUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "guest" })
      });
      if (!res.ok) throw new Error(`Backend guest login failed (${res.status})`);
      const data = await res.json();
      if (!data.success || !data.user) throw new Error(data.error || "Backend guest login failed");
      if (data.token) {
        localStorage.setItem("@rpf_token", data.token);
        setToken(data.token);
      }
      saveUser({ janSevaCardStatus: "none", ...data.user });
    } catch (err) {
      console.error("AuthContext guest login error:", err);
      saveUser({
        id: "guest_" + Date.now() + Math.random().toString(36).slice(2, 6),
        name: "Guest User",
        displayName: "Guest User",
        role: "guest",
        janSevaCardStatus: "none",
        onboardingCompleted: true,
        points: 0,
        badges: 0,
      });
    }
  }, [saveUser]);

  const logout = useCallback(async () => {
    clearSession();
  }, []);

  const updateUser = useCallback(async (updates: Partial<User>) => {
    if (!user) return false;
    try {
      const response = await fetch(apiUrl(`/api/users/${user.id}/update`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(updates)
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "User update failed");
      saveUser({ ...user, ...updates, ...(data.user || {}) });
      return true;
    } catch (err) {
      console.error("AuthContext: updateUser backend error:", err);
      throw err;
    }
  }, [user, token, saveUser]);

  const completeOnboarding = useCallback(async (interests: string[]) => {
    if (!user) return;
    try {
      const response = await fetch(apiUrl(`/api/users/${user.id}/update`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ interests, onboardingCompleted: true })
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Onboarding update failed");
      saveUser({ ...user, interests, onboardingCompleted: true, ...(data.user || {}) });
    } catch (err) {
      console.error("AuthContext: completeOnboarding backend error:", err);
      throw err;
    }
  }, [user, token, saveUser]);

  const hasAdminAccess = !!user && (user.role === "admin" || user.role === "super_admin" || user.role === "volunteer");

  return (
    <AuthContext.Provider value={{ token, user, isLoading, isAuthenticated: !!user, language, setLanguage, login, loginAsGuest, logout, updateUser, completeOnboarding, hasAdminAccess }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
