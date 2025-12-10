import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  Workflow, 
  Package, 
  Wrench, 
  Receipt, 
  CreditCard,
  BarChart3,
  WashingMachine
} from "lucide-react";

const navigationItems = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/customers", icon: Users, label: "Customers" },
  { path: "/job-cards", icon: ClipboardList, label: "Job Cards" },
  { path: "/workflow", icon: Workflow, label: "Workflow" },
  { path: "/inventory", icon: Package, label: "Inventory" },
  { path: "/facility", icon: Wrench, label: "Facility" },
  { path: "/expenses", icon: Receipt, label: "Expenses" },
  { path: "/payments", icon: CreditCard, label: "Payments" },
  { path: "/reports", icon: BarChart3, label: "Reports" },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <WashingMachine className="text-primary-foreground" size={20} />
          </div>
          <div>
            <h1 className="font-semibold text-lg" data-testid="app-title">Detailing Devils</h1>
            <p className="text-muted-foreground text-sm">Sector 18, Noida</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <Link key={item.path} href={item.path}>
              <div
                className={`px-4 py-3 rounded-lg flex items-center gap-3 cursor-pointer transition-all ${
                  isActive
                    ? "sidebar-active"
                    : "hover:bg-accent hover:text-accent-foreground"
                }`}
                data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground font-medium text-sm">RK</span>
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm" data-testid="user-name">Rajesh Kumar</p>
            <p className="text-muted-foreground text-xs">Store Manager</p>
          </div>
        </div>
      </div>
    </div>
  );
}
