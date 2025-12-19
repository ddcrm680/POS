import { useState } from "react";
import POSLayout from "@/components/layout/pos-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  BarChart3, 
  Filter, 
  Zap,
  Settings,
  Search,
  Plus
} from "lucide-react";

// Import our new customer components
import CustomerStatsCards from "@/components/customer/customer-stats-cards";
import CustomerList from "@/components/customer/customer-list";
import CustomerAnalyticsCharts from "@/components/customer/customer-analytics-charts";
import CustomerFiltersSidebar from "@/components/customer/customer-filters-sidebar";
import CustomerQuickActions from "@/components/customer/customer-quick-actions";
import { type Customer } from "@/lib/types";

interface CustomerFilters {
  search: string;
  segment: string;
  loyaltyTier: string;
  customerSource: string;
  vipStatus: string;
  city: string;
  state: string;
  customerLifecycleStage: string;
  lastServiceDateFrom: string;
  lastServiceDateTo: string;
  lifetimeValueRange: {
    min: string;
    max: string;
  };
  totalServicesRange: {
    min: string;
    max: string;
  };
  whatsappConsent: string;
  marketingConsent: string;
}

export default function Customers() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedCustomers, setSelectedCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | undefined>();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<CustomerFilters>({
    search: "",
    segment: "",
    loyaltyTier: "",
    customerSource: "",
    vipStatus: "",
    city: "",
    state: "",
    customerLifecycleStage: "",
    lastServiceDateFrom: "",
    lastServiceDateTo: "",
    lifetimeValueRange: { min: "", max: "" },
    totalServicesRange: { min: "", max: "" },
    whatsappConsent: "",
    marketingConsent: ""
  });

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomerId(customer.id);
    // Toggle selection for bulk operations
    const isSelected = selectedCustomers.some(c => c.id === customer.id);
    if (isSelected) {
      setSelectedCustomers(prev => prev.filter(c => c.id !== customer.id));
    } else {
      setSelectedCustomers(prev => [...prev, customer]);
    }
  };

  const handleFiltersChange = (newFilters: CustomerFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      search: "",
      segment: "",
      loyaltyTier: "",
      customerSource: "",
      vipStatus: "",
      city: "",
      state: "",
      customerLifecycleStage: "",
      lastServiceDateFrom: "",
      lastServiceDateTo: "",
      lifetimeValueRange: { min: "", max: "" },
      totalServicesRange: { min: "", max: "" },
      whatsappConsent: "",
      marketingConsent: ""
    });
  };

  const handleCustomerCreated = (customer: Customer) => {
    // Refresh customer data after creation
    setActiveTab("customers");
  };

  return (
    <>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Customer Management</h1>
              <p className="text-muted-foreground">
                Comprehensive customer analytics and management dashboard
              </p>
            </div>
            <div className="flex items-center gap-3">
              {selectedCustomers.length > 0 && (
                <Badge variant="outline" className="text-sm">
                  {selectedCustomers.length} selected
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                data-testid="button-toggle-filters"
              >
                <Filter size={16} className="mr-1" />
                Filters
              </Button>
              <Button size="sm" data-testid="button-add-customer">
                <Plus size={16} className="mr-1" />
                Add Customer
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-80 flex-shrink-0">
              <CustomerFiltersSidebar
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onClearFilters={handleClearFilters}
                isOpen={showFilters}
                onToggle={() => setShowFilters(!showFilters)}
              />
            </div>
          )}

          {/* Main Dashboard Content */}
          <div className="flex-1 min-w-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger 
                  value="overview" 
                  className="flex items-center gap-2"
                  data-testid="tab-overview"
                >
                  <BarChart3 size={16} />
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="customers" 
                  className="flex items-center gap-2"
                  data-testid="tab-customers"
                >
                  <Users size={16} />
                  Customers
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics" 
                  className="flex items-center gap-2"
                  data-testid="tab-analytics"
                >
                  <BarChart3 size={16} />
                  Analytics
                </TabsTrigger>
                <TabsTrigger 
                  value="actions" 
                  className="flex items-center gap-2"
                  data-testid="tab-actions"
                >
                  <Zap size={16} />
                  Quick Actions
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="space-y-6">
                  {/* KPI Cards */}
                  <CustomerStatsCards data-testid="customer-stats-overview" />

                  {/* Quick Preview of Customer List */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <CustomerList
                      onCustomerSelect={handleCustomerSelect}
                      selectedCustomerId={selectedCustomerId}
                      className="lg:col-span-1"
                    />
                    <CustomerQuickActions
                      selectedCustomers={selectedCustomers}
                      totalCustomers={0} // This would come from the stats
                      onCustomerCreated={handleCustomerCreated}
                      className="lg:col-span-1"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Customers Tab */}
              <TabsContent value="customers" className="space-y-6">
                <CustomerList
                  onCustomerSelect={handleCustomerSelect}
                  selectedCustomerId={selectedCustomerId}
                />
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-6">
                <CustomerAnalyticsCharts />
              </TabsContent>

              {/* Quick Actions Tab */}
              <TabsContent value="actions" className="space-y-6">
                <CustomerQuickActions
                  selectedCustomers={selectedCustomers}
                  totalCustomers={0} // This would come from the stats
                  onCustomerCreated={handleCustomerCreated}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
}
