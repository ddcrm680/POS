import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  UserPlus, 
  Activity, 
  Crown, 
  DollarSign, 
  TrendingUp,
  MapPin,
  Clock
} from "lucide-react";

interface CustomerAnalyticsOverview {
  totalCustomers: number;
  newCustomersThisMonth: number;
  activeCustomers: number;
  vipCustomers: number;
  averageLifetimeValue: number;
  customerRetentionRate: number;
  topCustomerSource: string;
  averageServiceInterval: number;
}

interface CustomerStatsCardsProps {
  className?: string;
}

export default function CustomerStatsCards({ className = "" }: CustomerStatsCardsProps) {
  const { data: analytics, isLoading, error } = useQuery<CustomerAnalyticsOverview>({
    queryKey: ["/api/customers/analytics/overview"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
        <Card className="col-span-full">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Failed to load customer analytics. Please try again later.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Customers",
      value: formatNumber(analytics.totalCustomers),
      icon: Users,
      description: "All registered customers",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "New This Month",
      value: formatNumber(analytics.newCustomersThisMonth),
      icon: UserPlus,
      description: "New customer acquisitions",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Active Customers",
      value: formatNumber(analytics.activeCustomers),
      icon: Activity,
      description: "Customers with recent activity",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "VIP Customers",
      value: formatNumber(analytics.vipCustomers),
      icon: Crown,
      description: "Premium tier customers",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Avg. Lifetime Value",
      value: formatCurrency(analytics.averageLifetimeValue),
      icon: DollarSign,
      description: "Average customer value",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Retention Rate",
      value: `${analytics.customerRetentionRate}%`,
      icon: TrendingUp,
      description: "Customer retention percentage",
      color: analytics.customerRetentionRate >= 70 ? "text-green-600" : 
             analytics.customerRetentionRate >= 50 ? "text-orange-600" : "text-red-600",
      bgColor: analytics.customerRetentionRate >= 70 ? "bg-green-100" : 
               analytics.customerRetentionRate >= 50 ? "bg-orange-100" : "bg-red-100",
    },
    {
      title: "Top Source",
      value: analytics.topCustomerSource,
      icon: MapPin,
      description: "Primary customer acquisition",
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
    },
    {
      title: "Avg. Service Gap",
      value: `${analytics.averageServiceInterval} days`,
      icon: Clock,
      description: "Average time between services",
      color: "text-gray-600",
      bgColor: "bg-gray-100",
    },
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card 
            key={index} 
            className="transition-all hover:shadow-md cursor-pointer"
            data-testid={`card-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div 
                className="text-2xl font-bold"
                data-testid={`value-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
              
              {/* Special badges for certain metrics */}
              {stat.title === "Retention Rate" && (
                <Badge 
                  variant={analytics.customerRetentionRate >= 70 ? "default" : "secondary"} 
                  className="mt-2 text-xs"
                >
                  {analytics.customerRetentionRate >= 70 ? "Excellent" : 
                   analytics.customerRetentionRate >= 50 ? "Good" : "Needs Attention"}
                </Badge>
              )}
              
              {stat.title === "VIP Customers" && analytics.vipCustomers > 0 && (
                <Badge variant="outline" className="mt-2 text-xs">
                  {((analytics.vipCustomers / analytics.totalCustomers) * 100).toFixed(1)}% of total
                </Badge>
              )}
              
              {stat.title === "New This Month" && analytics.newCustomersThisMonth > 0 && (
                <Badge variant="outline" className="mt-2 text-xs">
                  {analytics.newCustomersThisMonth > analytics.totalCustomers * 0.1 ? 
                    "High Growth" : "Steady Growth"}
                </Badge>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}