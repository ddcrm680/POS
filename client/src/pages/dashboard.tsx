import { 
  ShoppingCart, 
  ClipboardCheck, 
  Activity, 
  CreditCard, 
  Package, 
  BarChart3, 
  Users, 
  Receipt,
  RefreshCw,
  Bell,
  AlertTriangle,
  Calendar,
  TrendingDown
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { useLocation } from "wouter";
import POSLayout from "../components/layout/pos-layout";
import { DashboardMetrics } from "../lib/types";
import { useEffect, useState } from "react";
import CustomerLookupModal from "../components/modals/customer-lookup-modal";
// import { InventoryItem, JobCard, FacilityAsset } from "../schema";
import type { LucideProps } from "lucide-react";
import { useAuth } from "@/lib/auth";

interface POSTile {
  id: string;
  title: string;
  icon: React.ComponentType<LucideProps>;
  color: string;
  route?: string;
  action?: () => void;
  badge?: number;
  description?: string;
}

// Types for inventory dashboard data
interface InventoryDashboardMetrics {
  totalItems: number;
  lowStockItems: number;
  criticalStockItems: number;
  expiringItems: number;
  totalValue: number;
}

export default function Dashboard() {
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [, setLocation] = useLocation();

  const { data: metrics, isLoading: metricsLoading }:any = {data : undefined, isLoading : false} ; // Dummy values to avoid errors
  //  useQuery<DashboardMetrics>({
  //   queryKey: ["/api/dashboard/metrics"],
  // });

  const { data: lowStockItems = [] }:any ={data :[]} ; // Dummy values to avoid errors
  //  useQuery<InventoryItem[]>({
  //   queryKey: ["/api/inventory", { lowStock: true }],
  //   refetchInterval: 30000, // Refresh every 30 seconds
  // });

  const { data: criticalStockItems = [] }:any = {data: []}; // Dummy values to avoid errors
  // useQuery<InventoryItem[]>({
  //   queryKey: ["/api/inventory", { critical: true }],
  //   refetchInterval: 30000,
  // });

  const { data: expiringItems = [] }:any =  {data: []};
  // useQuery<InventoryItem[]>({
  //   queryKey: ["/api/inventory", { expiring: true, days: 30 }],
  //   refetchInterval: 30000,
  // });

  const { data: inventoryMetrics }:any = {data: []};
  //  useQuery<InventoryDashboardMetrics>({
  //   queryKey: ["/api/inventory/dashboard-metrics"],
  //   refetchInterval: 30000,
  // });

  const { data: activeJobCards = [] }:any =  {data: []};
  // useQuery<JobCard[]>({
  //   queryKey: ["/api/job-cards"],
  // });

  const { data: facilityAssets = [] }:any = {data: []};
  //  useQuery<FacilityAsset[]>({
  //   queryKey: ["/api/facility-assets"],
  // });

  // Calculate real-time inventory alerts
  const lowStockCount = lowStockItems.length;
  const criticalStockCount = criticalStockItems.length;
  const expiringCount = expiringItems.length;
  
  // Calculate total inventory alerts for notification badge
  const totalInventoryAlerts = criticalStockCount + lowStockCount + expiringCount;

  const activeJobsCount = activeJobCards.filter((jc:any) => jc.serviceStatus !== 'pickup').length;
  const overdueJobsCount = activeJobCards.filter((jc:any) => 
    jc.promisedReadyAt && 
    new Date(jc.promisedReadyAt) < new Date() && 
    jc.serviceStatus !== 'pickup'
  ).length;
  const readyForPickupCount = activeJobCards.filter((jc:any) => jc.serviceStatus === 'pickup').length;
  const billingPendingCount = activeJobCards.filter((jc:any) => 
    jc.serviceStatus === 'billing' || jc.paymentStatus === 'pending'
  ).length;

  // Define POS tiles with real-time data integration
  const posTiles: POSTile[] = [
    {
      id: 'new-sale',
      title: 'New Sale',
      icon: ShoppingCart,
      color: 'bg-emerald-600 hover:bg-emerald-700',
      route: '/register',
      description: 'Start new service'
    },
    {
      id: 'job-status',
      title: 'Workflow Board',
      icon: Activity,
      color: 'bg-blue-600 hover:bg-blue-700',
      route: '/job-cards',
      badge: activeJobsCount > 0 ? activeJobsCount : undefined,
      description: `${activeJobsCount} active jobs`
    },
    {
      id: 'ready-pickup',
      title: 'Ready for Pickup',
      icon: CreditCard,
      color: 'bg-green-600 hover:bg-green-700',
      action: () => {
        setLocation('/job-cards');
        // Navigate to list view with ready filter
        setTimeout(() => {
          const event = new CustomEvent('filter-ready-pickup');
          window.dispatchEvent(event);
        }, 100);
      },
      badge: readyForPickupCount > 0 ? readyForPickupCount : undefined,
      description: readyForPickupCount > 0 ? `${readyForPickupCount} ready` : 'Completed jobs'
    },
    {
      id: 'billing-pending',
      title: 'Billing',
      icon: Receipt,
      color: 'bg-amber-600 hover:bg-amber-700',
      action: () => {
        setLocation('/job-cards');
        // Navigate to billing jobs
        setTimeout(() => {
          const event = new CustomEvent('filter-billing');
          window.dispatchEvent(event);
        }, 100);
      },
      badge: billingPendingCount > 0 ? billingPendingCount : undefined,
      description: billingPendingCount > 0 ? `${billingPendingCount} pending` : 'Process payments'
    },
    {
      id: 'inventory',
      title: 'Inventory Management',
      icon: Package,
      color: criticalStockCount > 0 
        ? 'bg-red-600 hover:bg-red-700'
        : lowStockCount > 0 
          ? 'bg-yellow-600 hover:bg-yellow-700'
          : 'bg-green-600 hover:bg-green-700',
      route: '/inventory',
      badge: totalInventoryAlerts > 0 ? totalInventoryAlerts : undefined,
      description: criticalStockCount > 0 
        ? `${criticalStockCount} critical stock`
        : lowStockCount > 0 
          ? `${lowStockCount} low stock`
          : 'Stock healthy'
    },
    {
      id: 'critical-stock',
      title: 'Critical Stock',
      icon: AlertTriangle,
      color: 'bg-red-600 hover:bg-red-700',
      action: () => {
        setLocation('/inventory');
        // Filter to show critical stock items
        setTimeout(() => {
          const event = new CustomEvent('filter-critical-stock');
          window.dispatchEvent(event);
        }, 100);
      },
      badge: criticalStockCount > 0 ? criticalStockCount : undefined,
      description: criticalStockCount > 0 ? `${criticalStockCount} critical` : 'All stock adequate'
    },
    {
      id: 'expiring-soon',
      title: 'Expiring Soon',
      icon: Calendar,
      color: 'bg-orange-600 hover:bg-orange-700',
      action: () => {
        setLocation('/inventory');
        // Filter to show expiring items
        setTimeout(() => {
          const event = new CustomEvent('filter-expiring');
          window.dispatchEvent(event);
        }, 100);
      },
      badge: expiringCount > 0 ? expiringCount : undefined,
      description: expiringCount > 0 ? `${expiringCount} expiring (30 days)` : 'No items expiring'
    },
    {
      id: 'customers',
      title: 'Customer Search',
      icon: Users,
      color: 'bg-indigo-600 hover:bg-indigo-700',
      action: () => setIsCustomerModalOpen(true),
      description: 'Find customers'
    },
    {
      id: 'reports',
      title: 'Daily Reports',
      icon: BarChart3,
      color: 'bg-cyan-600 hover:bg-cyan-700',
      route: '/reports',
      description: 'View analytics'
    }
  ];
 const { user, isLoading } = useAuth();
  const [userInfo, setUserInfo] = useState<any>();
  useEffect(() => {
    setUserInfo(user || null);
  }, [, user, ]);

  const handleTileClick = (tile: POSTile) => {
    if (tile.action) {
      tile.action();
    } else if (tile.route) {
      setLocation(tile.route);
    }
  };

  if (metricsLoading) {
    return (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );
  }

  return (
    <>
      {/* Top Status Bar */}
      <div className="bg-card border-b border-border px-6 py-4 flex items-center justify-between shadow-sm">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">POS Dashboard</h2>
          <p className="text-muted-foreground text-sm">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })} • Today's Revenue: ₹{metrics?.todayRevenue?.toLocaleString() || '0'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className={` ${userInfo?.is_active ?'bg-green-50 text-green-700 border-green-200':
            'bg-red-50 text-red-700 border-red-200'}`}>
            <div className={`w-2 h-2 ${userInfo?.is_active ? 'bg-green-500':'bg-red-500'} rounded-full mr-2`} />
          {userInfo?.is_active ?'System Online' :'System Offline'}  
          </Badge>
          <Button variant="ghost" className="h-12 w-12" data-testid="button-refresh">
            <RefreshCw size={20} />
          </Button>
          <Button variant="ghost" className="relative h-12 w-12" data-testid="button-notifications">
            <Bell size={20} />
            {totalInventoryAlerts > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
                {totalInventoryAlerts > 99 ? '99+' : totalInventoryAlerts}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* POS Tile Grid */}
      <div className="flex-1 overflow-auto p-6 bg-gradient-to-br from-background to-muted/20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6  mx-auto">
          {posTiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <button
                key={tile.id}
                onClick={() => handleTileClick(tile)}
                className={`pos-tile relative group overflow-hidden rounded-2xl ${tile.color} 
                           text-white shadow-lg hover:shadow-xl transform hover:scale-105 
                           transition-all duration-200 active:scale-95 
                           min-h-[140px] md:min-h-[160px] 
                           flex flex-col items-center justify-center p-6 
                           border-2 border-white/20 hover:border-white/30`}
                data-testid={`pos-tile-${tile.id}`}
              >
                {/* Badge */}
                {tile.badge && tile.badge > 0 && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white 
                                rounded-full w-8 h-8 flex items-center justify-center 
                                text-sm font-bold shadow-lg z-10"
                       data-testid={`badge-${tile.id}`}>
                    {tile.badge > 99 ? '99+' : tile.badge}
                  </div>
                )}
                
                {/* Icon */}
                <div className="mb-3 p-3 bg-white/20 rounded-xl group-hover:bg-white/30 transition-colors">
                  <Icon size={32} className="text-white" />
                </div>
                
                {/* Title */}
                <h3 className="text-lg font-bold text-center leading-tight mb-1" 
                    data-testid={`title-${tile.id}`}>
                  {tile.title}
                </h3>
                
                {/* Description */}
                <p className="text-sm text-white/90 text-center leading-tight"
                   data-testid={`description-${tile.id}`}>
                  {tile.description}
                </p>
                
                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </button>
            );
          })}
        </div>
        
        {/* Quick Stats Bar */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 mx-auto">
          <div className="bg-card rounded-xl p-4 border border-border shadow-sm text-center" data-testid="stat-revenue">
            <p className="text-2xl font-bold text-primary">₹{metrics?.todayRevenue?.toLocaleString() || '0'}</p>
            <p className="text-sm text-muted-foreground">Today's Revenue</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border shadow-sm text-center" data-testid="stat-services">
            <p className="text-2xl font-bold text-green-600">{metrics?.servicesCompleted || 0}</p>
            <p className="text-sm text-muted-foreground">Services Done</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border shadow-sm text-center" data-testid="stat-jobs">
            <p className="text-2xl font-bold text-blue-600">{activeJobsCount}</p>
            <p className="text-sm text-muted-foreground">Active Jobs</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border shadow-sm text-center" data-testid="stat-satisfaction">
            <p className="text-2xl font-bold text-yellow-600">{metrics?.customerSatisfaction || 0}/5</p>
            <p className="text-sm text-muted-foreground">Satisfaction</p>
          </div>
        </div>
      </div>

      {/* Customer Lookup Modal */}
      <CustomerLookupModal
        open={isCustomerModalOpen}
        onOpenChange={setIsCustomerModalOpen}
      />
    </>
  );
}
