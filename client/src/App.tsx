import { useEffect, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import POSLayout from "./components/layout/pos-layout";
import { Router } from "./route";
import { AuthProvider } from "./lib/auth";
import { subscribeServiceDown } from "@/lib/systemStatus";
import ServiceUnavailableOverlay from "./ServiceUnavailableOverlay";

export default function App() {
  const [serviceDown, setServiceDown] = useState(false);

  useEffect(() => {
    return subscribeServiceDown(setServiceDown);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />

          {/* 🚨 SYSTEM OVERLAY (NOT ROUTE, NOT LAYOUT) */}
          {serviceDown && <ServiceUnavailableOverlay />}

          {/* 🧠 Layout rendered ONLY when service is healthy */}
          {!serviceDown ? (
            <POSLayout>
              <Router />
            </POSLayout>
          ) : (
            <Router /> // Router still mounted but visually blocked
          )}
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
