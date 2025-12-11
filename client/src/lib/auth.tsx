// src/lib/auth.tsx
import React, { createContext, useContext, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchUserApi, login as loginApi, logout as logoutApi } from "./api"; // adapt path
import { AuthContextValue, User } from "@/schema";
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();

  // Query to fetch current user; returns null if not authenticated
  const { data: user, isLoading, refetch } = useQuery<User | null>({
    queryKey: ["/api/user"],
    queryFn: fetchUserApi,
    retry: false,
    refetchOnWindowFocus: false,
  });

  // login mutation: calls backend login and then refetches user
  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginApi({ email, password }),
    onSuccess: async () => {
      // refresh user data in cache after successful login
      await qc.invalidateQueries({ queryKey: ["/api/user"] });
      await qc.refetchQueries({ queryKey: ["/api/user"], exact: true });
    },
  });

  // logout mutation: call API and set user to null in cache
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await logoutApi();
    },
    onSuccess: async () => {
      qc.setQueryData(["/api/user"], null);
      // optionally clear other sensitive caches:
      // qc.invalidateQueries(); // careful
    },
  });

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: async (credentials) => {
      return loginMutation.mutateAsync(credentials);
    },
    logout: async () => {
      await logoutMutation.mutateAsync();
    },
    refreshUser: async () => {
      await refetch();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
