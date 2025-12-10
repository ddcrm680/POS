import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import ManagerDashboard from "@/pages/manager-dashboard";
import Customers from "@/pages/customers";
import JobCards from "@/pages/job-cards";
import Workflow from "@/pages/workflow";
import Inventory from "@/pages/inventory";
import Facility from "@/pages/facility";
import Expenses from "@/pages/expenses";
import Payments from "@/pages/payments";
import Reports from "@/pages/reports";
import POSJobCreation from "@/pages/pos-job-creation";
import CustomerProfile from "@/pages/customer-profile";
import WalkInEntry from "@/pages/walk-in-entry";
import AppointmentsPage from "@/pages/appointments";
import FacilityManagement from "@/pages/facility-management";
import EmployeeManagement from "@/pages/employee-management";
import POSLayout from "./components/layout/pos-layout";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
     <Route path="/appointments" component={AppointmentsPage} />
      <Route path="/facility-management" component={FacilityManagement} />
      <Route path="/employee-management" component={EmployeeManagement} />
      <Route path="/manager" component={ManagerDashboard} />
      <Route path="/customers" component={Customers} />
      <Route path="/customers/:id" component={CustomerProfile} />
      <Route path="/job-cards" component={JobCards} />
      <Route path="/workflow" component={Workflow} />
      <Route path="/inventory" component={Inventory} />
      <Route path="/facility" component={Facility} />
      <Route path="/expenses" component={Expenses} />
      <Route path="/payments" component={Payments} />
      <Route path="/reports" component={Reports} />
      <Route path="/pos-job-creation" component={POSJobCreation} />
      <Route path="/walk-in-entry" component={WalkInEntry} />
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
