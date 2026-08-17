// src/context/AuthContext.tsx
// ──────────────────────────────────────────────────────────────────────────────
//  ROLE-BASED AUTH ENGINE
//  • On login: Firestore users/${id} is the source-of-truth for role.
//  • Firestore role always wins over local/input data — no privilege escalation.
//  • If Firestore is unreachable, local cached user still loads (offline-first).
//  • isLoading unlocks via finally — no infinite Initializing… freeze.
// ──────────────────────────────────────────────────────────────────────────────
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
// Replaced Firebase with backend API proxy calls

/* ═══════════════════════════════════════════════════════════════
   Types
═══════════════════════════════════════════════════════════════ */
export type UserRole =
  | "guest"
  | "citizen"
  | "volunteer"
  | "donor"
  | "admin"
  | "super_admin";

export interface User {
  id: string;
  name: string;
  username?: string;
  phone?: string;
  email?: string;
  avatar?: string;
  role: UserRole;
  displayName?: string;          // alias for name, used by Community feed
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
  /** Helper: true if role is admin, super_admin, or volunteer */
  hasAdminAccess: boolean;
}

/* ═══════════════════════════════════════════════════════════════
   Context & storage keys
═══════════════════════════════════════════════════════════════ */
const AuthContext = createContext<AuthContextType | null>(null);
const STORAGE_KEY = "@rpf_user";
const LANG_KEY = "@rpf_lang";

/* ═══════════════════════════════════════════════════════════════
   Provider
═══════════════════════════════════════════════════════════════ */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("@rpf_token"));
  const [language, setLanguageState] = useState<"en" | "hi">("en");
  const [isLoading, setIsLoading] = useState(true);

  /* ── Bootstrap: load cached user + language on mount ── */
  useEffect(() => {
    loadUser();
    loadLanguage();
  }, []);

  const loadUser = async () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const token = localStorage.getItem("@rpf_token");
      
      if (stored && token) {
        const parsed: User = JSON.parse(stored);
        setUser(parsed);

        // Fetch fresh user data with JWT
        try {
          const res = await fetch(`/api/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
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
                // ✅ IMPORTANT: Protect card status from being wiped on refresh
                janSevaCardStatus:
                  (fresh.janSevaCardStatus as User["janSevaCardStatus"]) ||
                  parsed.janSevaCardStatus ||
                  "none",
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
               // Invalid token or user not found
               localStorage.removeItem(STORAGE_KEY);
               localStorage.removeItem("@rpf_token");
               setToken(null);
               setUser(null);
            }
          } else {
             // Only log the user out if the token was explicitly rejected (401, 403) or user deleted (404)
             if (res.status === 401 || res.status === 403 || res.status === 404) {
               localStorage.removeItem(STORAGE_KEY);
               localStorage.removeItem("@rpf_token");
               setToken(null);
               setUser(null);
             } else {
               // 500/502/503 (Server down/restarting). Keep the cached user.
               console.warn("Auth server unavailable, using cached session.");
             }
          }
        } catch {
          // Backend unreachable - use cached user silently
        }
      } else {
        // No token, ensure clean state
        setUser(null);
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem("@rpf_token");
        setToken(null);
      }
    } catch {
      // Corrupted storage - clear it
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem("@rpf_token");
      setToken(null);
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

  /* ── Persist user locally and in state ── */
  const saveUser = useCallback((u: User) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    setUser(u);
  }, []);

  /* ── Login ── */
  const login = useCallback(async (userData: Partial<User>) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
      });
      if (!res.ok) throw new Error("Backend login failed");
      const data = await res.json();
      if (data.success && data.user) {
        if (data.token) {
          localStorage.setItem("@rpf_token", data.token);
          setToken(data.token);
        }
        saveUser({
          janSevaCardStatus: "none",
          ...data.user,
        });
      }
    } catch (err) {
      console.error("AuthContext login error:", err);
      // Local fallback on offline
      let userId = userData.id || userData.phone ? "usr_" + userData.phone?.replace(/\D/g, "") : "usr_" + Date.now();
      const fallbackUser: User = {
        id: userId,
        name: userData.name ?? "Citizen",
        displayName: userData.name ?? "Citizen",
        role: (userData.role as any) ?? "citizen",
        janSevaCardStatus: "none",
        onboardingCompleted: false,
        points: 25,
        badges: 1,
        ...userData
      };
      saveUser(fallbackUser);
    }
  }, [saveUser]);

  /* ── Guest login ── */
  const loginAsGuest = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "guest" })
      });
      if (!res.ok) throw new Error("Backend guest login failed");
      const data = await res.json();
      if (data.success && data.user) {
        if (data.token) {
          localStorage.setItem("@rpf_token", data.token);
          setToken(data.token);
        }
        saveUser({
          janSevaCardStatus: "none",
          ...data.user,
        });
      }
    } catch (err) {
      console.error("AuthContext guest login error:", err);
      const guestId = "guest_" + Date.now() + Math.random().toString(36).slice(2, 6);
      const guest: User = {
        id: guestId,
        name: "Guest User",
        displayName: "Guest User",
        role: "guest",
        janSevaCardStatus: "none",
        onboardingCompleted: true,
        points: 0,
        badges: 0,
      };
      saveUser(guest);
    }
  }, [saveUser]);

  /* ── Logout ── */
  const logout = useCallback(async () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("@rpf_token");
    setToken(null);
    setUser(null);
  }, []);

  /* ── Update user profile ── */
  const updateUser = useCallback(
    async (updates: Partial<User>) => {
      if (!user) return false;
      
      try {
        const response = await fetch(`/api/users/${user.id}/update`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(updates)
        });
        
        const data = await response.json();
        
        // ✅ Only save locally if backend confirmed success
        if (!response.ok || !data.success) {
          throw new Error(data.error || "User update failed");
        }
        
        const updated: User = {
          ...user,
          ...updates,
          ...(data.user || {}),
        };
        saveUser(updated);
        return true;
      } catch (err) {
        console.error("AuthContext: updateUser backend error:", err);
        throw err;
      }
    },
    [user, token, saveUser]
  );

  /* ── Complete onboarding ── */
  const completeOnboarding = useCallback(
    async (interests: string[]) => {
      if (!user) return;
      
      try {
        const response = await fetch(`/api/users/${user.id}/update`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ interests, onboardingCompleted: true })
        });
        
        const data = await response.json();
        
        if (!response.ok || !data.success) {
          throw new Error(data.error || "Onboarding update failed");
        }
        
        const updated: User = {
          ...user,
          interests,
          onboardingCompleted: true,
          ...(data.user || {}),
        };
        saveUser(updated);
      } catch (err) {
        console.error("AuthContext: completeOnboarding backend error:", err);
        throw err;
      }
    },
    [user, token, saveUser]
  );

  /* ── Computed RBAC helper ── */
  const hasAdminAccess =
    !!user &&
    (user.role === "admin" ||
      user.role === "super_admin" ||
      user.role === "volunteer");

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isLoading,
        isAuthenticated: !!user,
        language,
        setLanguage,
        login,
        loginAsGuest,
        logout,
        updateUser,
        completeOnboarding,
        hasAdminAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}