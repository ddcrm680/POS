import { TrendingUp, Target, Star, Users, Clock, Gauge, DollarSign, TrendingDown, AlertTriangle, RefreshCw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

interface ManagerMetrics {
  todayRevenue: number;
  dailyTarget: number;
  jobsCompleted: number;
  jobsTarget: number;
  averageRating: number;
  staffProductivity: number;
  serviceTimeEfficiency: number;
  equipmentUtilization: number;
  averageWaitTime: number;
  qualityScore: number;
  grossMargin: number;
  upsellRate: number;
  paymentCollection: number;
  costControlPercentage: number;
}

interface KPICardProps {
  title: string;
  value: string | number;
  target?: number;
  icon: React.ComponentType<any>;
  trend?: 'up' | 'down' | 'stable';
  unit?: string;
  subtitle?: string;
  progress?: number;
  status?: 'good' | 'warning' | 'critical';
  testId?: string;
}

function KPICard({ 
  title, 
  value, 
  target, 
  icon: Icon, 
  trend, 
  unit = '', 
  subtitle, 
  progress, 
  status = 'good',
  testId 
}: KPICardProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'critical': return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20';
      case 'warning': return 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20';
      default: return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20';
    }
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="h-3 w-3 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="h-3 w-3 text-red-500" />;
    return null;
  };

  return (
    <Card className={`border-2 ${getStatusColor()}`} data-testid={testId}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Icon className="h-5 w-5 text-muted-foreground" />
          {getTrendIcon()}
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold" data-testid={`${testId}-value`}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </span>
            {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
            {target && (
              <span className="text-xs text-muted-foreground ml-2">
                / {target.toLocaleString()}{unit}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
          {progress !== undefined && (
            <div className="mt-2">
              <Progress value={progress} className="h-1" />
              <p className="text-xs text-muted-foreground mt-1">
                {progress.toFixed(1)}% of target
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function ManagerKPIDashboard() {
  const { data: metrics, isLoading, isError, error, refetch } = useQuery<ManagerMetrics>({
    queryKey: ["/api/manager/dashboard-metrics"],
    refetchInterval: 30000, // Refresh every 30 seconds
    retry: 3,
    retryDelay: 1000,
  });

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5 text-blue-500" />
            Real-Time KPIs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="h-full border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
            <AlertTriangle className="h-5 w-5" />
            KPI Dashboard Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-medium mb-2 text-red-800 dark:text-red-200">Failed to Load KPIs</h3>
            <p className="text-red-600 dark:text-red-400 mb-4 text-sm">
              {error?.message || 'Unable to fetch dashboard metrics. Please check your connection and try again.'}
            </p>
            <Button onClick={() => refetch()} variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5 text-blue-500" />
            Real-Time KPIs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Gauge className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No metrics data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const revenueProgress = metrics.dailyTarget > 0 ? (metrics.todayRevenue / metrics.dailyTarget) * 100 : 0;
  const jobsProgress = metrics.jobsTarget > 0 ? (metrics.jobsCompleted / metrics.jobsTarget) * 100 : 0;

  // Determine status based on performance
  const getRevenueStatus = () => {
    if (revenueProgress >= 90) return 'good';
    if (revenueProgress >= 70) return 'warning';
    return 'critical';
  };

  const getJobsStatus = () => {
    if (jobsProgress >= 90) return 'good';
    if (jobsProgress >= 70) return 'warning';
    return 'critical';
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gauge className="h-5 w-5 text-blue-500" />
            Real-Time KPIs
          </div>
          <Badge variant="outline" className="text-xs">
            Live • {new Date().toLocaleTimeString()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Daily Performance */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Daily Performance
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard
                title="Revenue Progress"
                value={metrics.todayRevenue}
                target={metrics.dailyTarget}
                icon={DollarSign}
                unit="₹"
                progress={revenueProgress}
                status={getRevenueStatus()}
                trend={revenueProgress >= 100 ? 'up' : 'stable'}
                testId="kpi-revenue"
              />
              <KPICard
                title="Jobs Completed"
                value={metrics.jobsCompleted}
                target={metrics.jobsTarget}
                icon={Target}
                progress={jobsProgress}
                status={getJobsStatus()}
                trend={jobsProgress >= 100 ? 'up' : 'stable'}
                testId="kpi-jobs"
              />
              <KPICard
                title="Customer Satisfaction"
                value={metrics.averageRating.toFixed(1)}
                icon={Star}
                unit="/5.0"
                status={metrics.averageRating >= 4.0 ? 'good' : metrics.averageRating >= 3.5 ? 'warning' : 'critical'}
                trend={metrics.averageRating >= 4.0 ? 'up' : 'down'}
                subtitle="Average rating"
                testId="kpi-satisfaction"
              />
              <KPICard
                title="Staff Productivity"
                value={metrics.staffProductivity.toFixed(1)}
                icon={Users}
                unit=" jobs/staff"
                status={metrics.staffProductivity >= 2.0 ? 'good' : 'warning'}
                trend={metrics.staffProductivity >= 2.0 ? 'up' : 'down'}
                testId="kpi-productivity"
              />
            </div>
          </div>

          {/* Operational Metrics */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Operational Metrics
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard
                title="Service Time Efficiency"
                value={metrics.serviceTimeEfficiency}
                icon={Clock}
                unit="%"
                status={metrics.serviceTimeEfficiency >= 90 ? 'good' : metrics.serviceTimeEfficiency >= 80 ? 'warning' : 'critical'}
                trend={metrics.serviceTimeEfficiency >= 90 ? 'up' : 'down'}
                subtitle="Within standard time"
                testId="kpi-efficiency"
              />
              <KPICard
                title="Equipment Utilization"
                value={metrics.equipmentUtilization}
                icon={Gauge}
                unit="%"
                status={metrics.equipmentUtilization >= 75 ? 'good' : 'warning'}
                trend={metrics.equipmentUtilization >= 75 ? 'up' : 'down'}
                subtitle="Active usage"
                testId="kpi-equipment"
              />
              <KPICard
                title="Average Wait Time"
                value={metrics.averageWaitTime}
                icon={Clock}
                unit=" min"
                status={metrics.averageWaitTime <= 10 ? 'good' : metrics.averageWaitTime <= 15 ? 'warning' : 'critical'}
                trend={metrics.averageWaitTime <= 10 ? 'up' : 'down'}
                subtitle="Target: <10 min"
                testId="kpi-wait-time"
              />
              <KPICard
                title="Quality Score"
                value={metrics.qualityScore}
                icon={Star}
                unit="%"
                status={metrics.qualityScore >= 95 ? 'good' : metrics.qualityScore >= 90 ? 'warning' : 'critical'}
                trend={metrics.qualityScore >= 95 ? 'up' : 'down'}
                subtitle="SOP compliance"
                testId="kpi-quality"
              />
            </div>
          </div>

          {/* Financial Metrics */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Financial Metrics
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard
                title="Gross Margin"
                value={metrics.grossMargin}
                icon={TrendingUp}
                unit="%"
                status={metrics.grossMargin >= 45 ? 'good' : metrics.grossMargin >= 40 ? 'warning' : 'critical'}
                trend={metrics.grossMargin >= 45 ? 'up' : 'down'}
                subtitle={`₹${(metrics.todayRevenue * metrics.grossMargin / 100).toLocaleString()} profit`}
                testId="kpi-margin"
              />
              <KPICard
                title="Upsell Rate"
                value={metrics.upsellRate}
                icon={TrendingUp}
                unit="%"
                status={metrics.upsellRate >= 25 ? 'good' : metrics.upsellRate >= 20 ? 'warning' : 'critical'}
                trend={metrics.upsellRate >= 25 ? 'up' : 'down'}
                subtitle="Additional services"
                testId="kpi-upsell"
              />
              <KPICard
                title="Payment Collection"
                value={metrics.paymentCollection}
                icon={DollarSign}
                unit="%"
                status={metrics.paymentCollection >= 95 ? 'good' : metrics.paymentCollection >= 90 ? 'warning' : 'critical'}
                trend={metrics.paymentCollection >= 95 ? 'up' : 'down'}
                subtitle="On-time payments"
                testId="kpi-collection"
              />
              <KPICard
                title="Cost Control"
                value={metrics.costControlPercentage}
                icon={Target}
                unit="% of budget"
                status={metrics.costControlPercentage <= 100 ? 'good' : metrics.costControlPercentage <= 110 ? 'warning' : 'critical'}
                trend={metrics.costControlPercentage <= 100 ? 'up' : 'down'}
                subtitle={metrics.costControlPercentage > 100 ? `₹${((metrics.costControlPercentage - 100) * metrics.todayRevenue / 100).toLocaleString()} over` : 'Under budget'}
                testId="kpi-cost-control"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}