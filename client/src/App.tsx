import { Switch, Route } from "wouter";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import NotFound from "./pages/not-found";
import Dashboard from "./pages/dashboard";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import POSLayout from "./components/layout/pos-layout";
import JobCards from "./pages/job-cards";


function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/job-cards" component={JobCards} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <POSLayout>
        <Router />
        </POSLayout>
      </TooltipProvider>
      </QueryClientProvider>
  );
}

export default App;
