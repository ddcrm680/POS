import { useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import POSLayout from "./components/layout/pos-layout";
import { Router } from "./route";

export default function App() {
  const [location] = useLocation();
  const hideLayoutList=["/login"];
  const isAuthPage =hideLayoutList.includes(location)

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />

        {isAuthPage ? (
          <Router />
        ) : (
          <POSLayout>
            <Router />
          </POSLayout>
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
}
