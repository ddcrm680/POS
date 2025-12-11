// src/lib/auth.tsx
import React, {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { fetchUserApi, login as loginApi, logout as logoutApi } from "./api";
import { AuthContextValue, User } from "@/schema";
import { cookieStore } from "./cookie"; // your cookie helper

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Helper to clear client-side storage + state
  const clearClientAuth = () => {
    try {
      // remove cookie token if you store it there
      if (cookieStore?.removeItem) {
        cookieStore.removeItem("token");
      } else if (cookieStore?.setItem) {
        // fallback: expire cookie
        cookieStore.setItem("token", "", -1, "/");
      }
    } catch (e) {
      // ignore
    }
    localStorage.removeItem("userInfo");
    localStorage.removeItem("token");
    setUser(null);
  };

  // Initial load:
  // 1. Read userInfo from localStorage and set it (fast UI)
  // 2. If token exists (cookie or localStorage), call fetchUserApi() to validate & refresh
  useEffect(() => {
    let mounted = true;

    async function boot() {
      setIsLoading(true);

      try {
        // 1) Quick boot from localStorage so UI doesn't flash
        const raw = localStorage.getItem("userInfo");
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as User;
            if (mounted) setUser(parsed);
          } catch {
            // invalid JSON - clear it
            localStorage.removeItem("userInfo");
          }
        }

        // 2) If token exists, validate with server
        const tokenFromCookie =
          (cookieStore && cookieStore.getItem && cookieStore.getItem("token")) ||
          null;
        const tokenFromStorage = localStorage.getItem("token") || null;
        const hasToken = !!(tokenFromCookie || tokenFromStorage);

        if (!hasToken) {
          // no token: stop, keep user from localStorage if present (or null)
          if (mounted) setIsLoading(false);
          return;
        }

        // token exists -> validate with server
        try {
          const serverUser = await fetchUserApi();
          // fetchUserApi should return null when unauthorized
          if (!serverUser) {
            // server says no token / invalid -> clear client
            clearClientAuth();
          } else {
            // server returned user -> keep it (or overwrite stale localStorage)
            localStorage.setItem("userInfo", JSON.stringify(serverUser));
            if (mounted) setUser(serverUser);
          }
        } catch (err) {
          // If fetchUserApi throws (network/server), we'll clear only if it's auth error.
          // To be safe: if server returned 401 inside fetchUserApi, it should return null.
          // Here we won't clear if it's maybe network error; you can customize behavior.
          console.error("fetchUserApi error during boot:", err);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    boot();

    return () => {
      mounted = false;
    };
  }, []);

  // login wrapper — calls your loginApi (which already stores cookie/localStorage in your code),
  // then ensures provider state is set
  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const userData = await loginApi(credentials); // your login returns body.data (user)
      // loginApi already stores token and localStorage per your implementation.
      // But ensure localStorage/user state are set here too:
      if (userData) {
        localStorage.setItem("userInfo", JSON.stringify(userData));
        setUser(userData);
      }
      return userData;
    } finally {
      setIsLoading(false);
    }
  };

  // logout wrapper — call server, then clear client
  const Logout = async () => {
    setIsLoading(true);
    try {
      try {
        await logoutApi(); // attempt server-side logout
      } catch (e) {
        // ignore server errors, still clear client
        console.warn("logoutApi error (ignored):", e);
      }

      clearClientAuth();
      qc.invalidateQueries();
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    Logout,
    refreshUser: async () => {
      setIsLoading(true);
      try {
        const u = await fetchUserApi();
        if (u) {
          localStorage.setItem("userInfo", JSON.stringify(u));
          setUser(u);
        } else {
          clearClientAuth();
        }
        return u;
      } finally {
        setIsLoading(false);
      }
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
