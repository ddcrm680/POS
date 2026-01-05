import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/DashBoard/nonDefaultDashboard";
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
import Login from "./pages/login/login";
import ProtectedRoute from "./components/ProtectedRoute";
import { login } from "./lib/api";
import ProfileDetails from "./pages/profile/profile-details";
import Master from "./pages/masters/master";
import StoreForm from "./pages/masters/store/storeForm";
import TerritoryMasterForm from "./pages/masters/territoryMaster.tsx/territoryMasterForm";
import StoreFormHandler from "./pages/masters/store/storeViewHandler";
import { useAuth } from "./lib/auth";
import { useEffect, useState } from "react";
import DefaultDashboard from "./pages/DashBoard/DefaultDashboard";
import StoreDetails from "./pages/storeDetails/storeDetails";
import Store from "./pages/masters/store/store";
export function Router() {
    const [isDefaultView, setIsDefaultView] = useState<boolean>(false);
  
    const { user,  } = useAuth();
    useEffect(() => {
      const nonDefaultViewers = ['admin', "super-admin", 'store-manager']
      setIsDefaultView(!nonDefaultViewers.includes((user?.role)))
    }, [user])
    const dashboard = isDefaultView ? DefaultDashboard : Dashboard
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/">
        <Redirect to="/login" />
      </Route>
      <Route path="/home" component={() => <ProtectedRoute component={  dashboard} />} />
      <Route path="/store-details" component={() => <ProtectedRoute component={StoreDetails} />} />
      <Route path="/profile" component={() => <ProtectedRoute component={ProfileDetails} />} />
      <Route path="/master" component={() => <ProtectedRoute component={Master} 
      />} />
        <Route path="/stores" component={() => <ProtectedRoute component={Store} 
      />} />
      {/* <Route path="/master/stores" component={() => <ProtectedRoute component={Store} 
      />} /> */}
       <Route path="/master/territory/manage" component={() => <ProtectedRoute component={TerritoryMasterForm} />} />
  
      <Route path="/master/stores/manage" component={() => <ProtectedRoute component={StoreFormHandler} />} />
      
      {/* <Route path="/test" component={() => <ProtectedRoute component={ManagerDashboard} />} /> */}
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