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
import { useLocation } from "wouter";
import { ForbiddenListener } from "./components/common/ForbiddenListener";
import NotificationRealtimeBridge from "./components/system/NotificationRealtimeBridge";


export default function App() {
  const [location] = useLocation();
  const hideLayoutList = ["/login"];
  const isAuthPage = hideLayoutList.includes(location)
  const [serviceDown, setServiceDown] = useState(false);

  useEffect(() => {
    localStorage.removeItem('sidebar_active_parent')
    localStorage.removeItem('product_active_tab')
    localStorage.removeItem('master_active_tab')
    return subscribeServiceDown(setServiceDown);
  }, []);
  const content = isAuthPage ? (
    <Router />
  ) : (
    <POSLayout>
      <Router />
    </POSLayout>
  );
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
         {/* 🔔 REALTIME NOTIFICATIONS */}
          <NotificationRealtimeBridge />

        <TooltipProvider>
          <Toaster />
          <ForbiddenListener />

          {/* 🚨 SYSTEM OVERLAY (NOT ROUTE, NOT LAYOUT) */}
          {serviceDown && <ServiceUnavailableOverlay />}

          {/* 🧠 Layout rendered ONLY when service is healthy */}
          {content}
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
