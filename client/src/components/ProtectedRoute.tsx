// src/components/ProtectedRoute.tsx
import React from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";

type ProtectedRouteProps = {
  component: React.ComponentType<any>;
  componentProps?: Record<string, any>;
};

export default function ProtectedRoute({
  component: Component,
  componentProps,
}: ProtectedRouteProps) {
  const [location, setLocation] = useLocation();
  const { user, isLoading } = useAuth();

  // 1) Loading state - show centered spinner + text
  if (isLoading) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <div className="p-6 flex items-center gap-3">
          <svg
            className="h-6 w-6 animate-spin text-[#FE0000]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          <p className="font-medium text-[20px] leading-tight">Loading...</p>
        </div>
      </div>
    );
  }

  // 2) Not authenticated -> redirect to /login (preserve intended path as ?next=...)
  if (!user) {
    
    // avoid redirect loop if already on /login
    if (location !== "/login") {
      
      setLocation(`/login`);
      return null;
    }
    // if already on /login, allow login page to render (ProtectedRoute typically won't be used for /login)
    return null;
  }

  // 3) Authenticated user
  // If they manually visit /login while logged in, redirect to /home
  if (location === "/login" || location === "/") {
    setLocation("/home");
    return null;
  }

  // 4) Authenticated + not on login => render requested protected component
  return <Component {...componentProps} />;
}
