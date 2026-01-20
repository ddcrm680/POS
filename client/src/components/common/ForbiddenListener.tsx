import { useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export function ForbiddenListener() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const handler = (e: Event) => {
      const event = e as CustomEvent<{
        message?: string;
        from?: string;
      }>;

      // 🔔 Show toast
      toast({
        title: "Unauthorized",
        description: event.detail?.message ?? "Access denied",
        variant: "destructive",
      });
      localStorage.removeItem('sidebar_active_parent')
      // 🧭 Redirect to dashboard
      navigate("/home", { replace: true });
    };

    window.addEventListener("auth:forbidden", handler);

    return () => {
      window.removeEventListener("auth:forbidden", handler);
    };
  }, [navigate, toast]);

  return null;
}