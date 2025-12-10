import { useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import POSLayout from "@/components/layout/pos-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft,
  User, 
  Car, 
  MessageSquare, 
  Settings, 
  BarChart3, 
  Zap,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Star,
  TrendingUp,
  Clock,
  DollarSign,
  AlertTriangle,
  Shield
} from "lucide-react";
import { type Customer } from "@/schema";

// Import customer profile components
import CustomerProfileHeader from "@/components/customer/customer-profile-header";
import VehicleInformationPanel from "@/components/customer/vehicle-information-panel";
import CommunicationHistoryPanel from "@/components/customer/communication-history-panel";
import CustomerPreferencesPanel from "@/components/customer/customer-preferences-panel";

interface CustomerProfileParams {
  id: string;
}

export default function CustomerProfile() {
  const { id } = useParams<CustomerProfileParams>();
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch customer data
  const { data: customer, isLoading: customerLoading, error: customerError } = useQuery<Customer>({
    queryKey: ["/api/customers", id],
    enabled: !!id,
  });

  // Fetch customer analytics overview
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/customers", id, "analytics"],
    enabled: !!id,
  });

  const handleBackToCustomers = () => {
    setLocation("/customers");
  };

  if (customerError) {
    return (
      <>
        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center py-12">
              <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Customer Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The customer you're looking for could not be found.
              </p>
              <Button onClick={handleBackToCustomers} data-testid="button-back-to-customers">
                <ArrowLeft size={16} className="mr-2" />
                Back to Customers
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (customerLoading || !customer) {
    return (
      <>
        <div className="p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header Skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-8 w-64" />
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
              </div>
            </div>
            
            {/* Content Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-96" />
              </div>
              <div className="space-y-6">
                <Skeleton className="h-64" />
                <Skeleton className="h-64" />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(numAmount);
  };

  const formatDate = (dateStr: string | null | undefined | Date) => {
    if (!dateStr) return 'Never';
    try {
      const date = dateStr instanceof Date ? dateStr : new Date(dateStr);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'Invalid';
    }
  };

  const getLoyaltyTierColor = (tier: string | null) => {
    switch (tier) {
      case 'Platinum': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Gold': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Silver': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Bronze': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getLifecycleStageColor = (stage: string | null) => {
    switch (stage) {
      case 'New': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Active': return 'bg-green-100 text-green-800 border-green-200';
      case 'At-Risk': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Churned': return 'bg-red-100 text-red-800 border-red-200';
      case 'Won-Back': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <>
      <div className="p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center justify-between">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/customers" data-testid="link-customers">
                      Customers
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{customer.fullName}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            
            <Button 
              variant="outline" 
              onClick={handleBackToCustomers}
              data-testid="button-back-to-customers"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Customers
            </Button>
          </div>

          {/* Customer Profile Header */}
          <CustomerProfileHeader 
            customer={customer}
            onEditCustomer={() => {
              console.log('Edit customer functionality');
            }}
            onSendMessage={() => {
              setActiveTab('communication');
            }}
          />

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid">
              <TabsTrigger 
                value="overview" 
                className="flex items-center gap-2"
                data-testid="tab-overview"
              >
                <BarChart3 size={16} />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger 
                value="vehicles" 
                className="flex items-center gap-2"
                data-testid="tab-vehicles"
              >
                <Car size={16} />
                <span className="hidden sm:inline">Vehicles</span>
              </TabsTrigger>
              <TabsTrigger 
                value="communication" 
                className="flex items-center gap-2"
                data-testid="tab-communication"
              >
                <MessageSquare size={16} />
                <span className="hidden sm:inline">Communication</span>
              </TabsTrigger>
              <TabsTrigger 
                value="preferences" 
                className="flex items-center gap-2"
                data-testid="tab-preferences"
              >
                <Settings size={16} />
                <span className="hidden sm:inline">Preferences</span>
              </TabsTrigger>
              <TabsTrigger 
                value="analytics" 
                className="flex items-center gap-2"
                data-testid="tab-analytics"
              >
                <TrendingUp size={16} />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
              <TabsTrigger 
                value="actions" 
                className="flex items-center gap-2"
                data-testid="tab-actions"
              >
                <Zap size={16} />
                <span className="hidden sm:inline">Actions</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {/* Service History - Enhanced existing component */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar size={18} />
                        Service History Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        Complete service history and timeline will be displayed here.
                        This will use the enhanced ServiceHistoryPanel component.
                      </p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="space-y-6">
                  {/* Quick Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap size={18} />
                        Quick Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button className="w-full justify-start" data-testid="button-schedule-service">
                        <Calendar size={16} className="mr-2" />
                        Schedule New Service
                      </Button>
                      <Button variant="outline" className="w-full justify-start" data-testid="button-send-message">
                        <MessageSquare size={16} className="mr-2" />
                        Send Message
                      </Button>
                      <Button variant="outline" className="w-full justify-start" data-testid="button-add-vehicle">
                        <Car size={16} className="mr-2" />
                        Add Vehicle
                      </Button>
                      <Button variant="outline" className="w-full justify-start" data-testid="button-update-details">
                        <User size={16} className="mr-2" />
                        Update Details
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Customer Stats */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield size={18} />
                        Customer Health
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Satisfaction Score</span>
                          <span className="font-medium">{customer.averageRating || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Vehicles Registered</span>
                          <span className="font-medium">{customer.vehicleCount || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>WhatsApp Consent</span>
                          <span className="font-medium">
                            {customer.whatsappConsent ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Vehicle Information Tab */}
            <TabsContent value="vehicles" className="space-y-6">
              <VehicleInformationPanel 
                customerId={customer.id}
                onVehicleSelect={(vehicle) => {
                  console.log('Vehicle selected:', vehicle);
                }}
              />
            </TabsContent>

            {/* Communication History Tab */}
            <TabsContent value="communication" className="space-y-6">
              <CommunicationHistoryPanel customer={customer} />
            </TabsContent>

            {/* Customer Preferences Tab */}
            <TabsContent value="preferences" className="space-y-6">
              <CustomerPreferencesPanel customer={customer} />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Customer-specific analytics and insights will be displayed here.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="actions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Customer management actions and tools will be available here.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}