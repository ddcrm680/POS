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
import { Redirect, Route, Switch } from "wouter";
import Login from "./pages/login";
import ProtectedRoute from "./components/ProtectedRoute";
import { login } from "./lib/api";
import ProfileDetails from "./pages/profile-details";
import Master from "./pages/master";
import UserList from "./pages/list";
export function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/">
        <Redirect to="/login" />
      </Route>
       <Route path="/list" component={() => <ProtectedRoute component={UserList} />} />
      <Route path="/home" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/profile" component={() => <ProtectedRoute component={ProfileDetails} />} />
    <Route path="/master" component={() => <ProtectedRoute component={Master} />} />
      <Route path="/manager" component={() => <ProtectedRoute component={ManagerDashboard} />} />
      <Route path="/customers" component={() => <ProtectedRoute component={Customers} />} />
      <Route path="/job-cards" component={() => <ProtectedRoute component={JobCards} />} />
      <Route path="/appointments" component={() => <ProtectedRoute component={AppointmentsPage} />} />
      <Route path="/facility-management" component={() => <ProtectedRoute component={FacilityManagement} />} />
      <Route path="/employee-management" component={() => <ProtectedRoute component={EmployeeManagement} />} />
      <Route path="/customers/:id" component={() => <ProtectedRoute component={CustomerProfile} />} />
      <Route path="/workflow" component={() => <ProtectedRoute component={Workflow} />} />
      <Route path="/inventory" component={() => <ProtectedRoute component={Inventory} />} />
      <Route path="/facility" component={() => <ProtectedRoute component={Facility} />} />
      <Route path="/expenses" component={() => <ProtectedRoute component={Expenses} />} />
      <Route path="/payments" component={() => <ProtectedRoute component={Payments} />} />
      <Route path="/reports" component={() => <ProtectedRoute component={Reports} />} />
      <Route path="/pos-job-creation" component={() => <ProtectedRoute component={POSJobCreation} />} />
      <Route path="/walk-in-entry" component={() => <ProtectedRoute component={WalkInEntry} />} />

      <Route component={() => <ProtectedRoute component={NotFound} />} />
    </Switch>
  );
}