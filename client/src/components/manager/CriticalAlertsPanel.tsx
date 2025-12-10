import { AlertTriangle, Clock, DollarSign, Wrench, Users, Car, TrendingDown, FileCheck, Package, AlertCircle, RefreshCw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

interface Alert {
  id: string;
  type: string;
  title: string;
  description: string;
  amount?: number;
  customerId?: string;
  jobCardId?: string;
  priority: 'critical' | 'important' | 'attention';
  createdAt: Date;
  actionRequired: boolean;
}

interface ManagerAlerts {
  critical: Alert[];
  important: Alert[];
  attention: Alert[];
}

const getAlertIcon = (type: string) => {
  const icons = {
    overdue_delivery: Clock,
    payment_overdue: DollarSign,
    equipment_down: Wrench,
    staff_shortage: Users,
    quality_issue: AlertTriangle,
    vehicle_queue: Car,
    target_gap: TrendingDown,
    cash_drawer_issue: DollarSign,
    expense_approval: FileCheck,
    eod_pending: Clock,
    equipment_maintenance: Wrench,
    inventory_low: Package,
    sop_compliance: FileCheck,
    facility_issue: AlertCircle,
  };
  return icons[type as keyof typeof icons] || AlertTriangle;
};

const getPriorityConfig = (priority: string) => {
  switch (priority) {
    case 'critical':
      return {
        bgColor: 'bg-red-50 dark:bg-red-950/20',
        borderColor: 'border-red-200 dark:border-red-800',
        textColor: 'text-red-800 dark:text-red-200',
        badgeVariant: 'destructive' as const,
        iconColor: 'text-red-600 dark:text-red-400'
      };
    case 'important':
      return {
        bgColor: 'bg-amber-50 dark:bg-amber-950/20',
        borderColor: 'border-amber-200 dark:border-amber-800',
        textColor: 'text-amber-800 dark:text-amber-200',
        badgeVariant: 'secondary' as const,
        iconColor: 'text-amber-600 dark:text-amber-400'
      };
    case 'attention':
      return {
        bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
        borderColor: 'border-yellow-200 dark:border-yellow-800',
        textColor: 'text-yellow-800 dark:text-yellow-200',
        badgeVariant: 'outline' as const,
        iconColor: 'text-yellow-600 dark:text-yellow-400'
      };
    default:
      return {
        bgColor: 'bg-gray-50 dark:bg-gray-950/20',
        borderColor: 'border-gray-200 dark:border-gray-800',
        textColor: 'text-gray-800 dark:text-gray-200',
        badgeVariant: 'secondary' as const,
        iconColor: 'text-gray-600 dark:text-gray-400'
      };
  }
};

export default function CriticalAlertsPanel() {
  const [expandedSection, setExpandedSection] = useState<string>('critical');

  const { data: alerts, isLoading, isError, error, refetch } = useQuery<ManagerAlerts>({
    queryKey: ["/api/manager/alerts"],
    refetchInterval: 30000, // Refresh every 30 seconds
    retry: 3,
    retryDelay: 1000,
  });

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Critical Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
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
            Alerts System Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-medium mb-2 text-red-800 dark:text-red-200">Failed to Load Alerts</h3>
            <p className="text-red-600 dark:text-red-400 mb-4 text-sm">
              {error?.message || 'Unable to fetch critical alerts. System monitoring may be affected.'}
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

  const renderAlertSection = (title: string, alertList: Alert[], sectionKey: string, count: number) => {
    if (!alertList || alertList.length === 0) return null;
    
    const isExpanded = expandedSection === sectionKey;
    const config = getPriorityConfig(sectionKey);

    return (
      <div className="space-y-2">
        <button
          onClick={() => setExpandedSection(isExpanded ? '' : sectionKey)}
          className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all
            ${config.bgColor} ${config.borderColor} hover:opacity-80`}
          data-testid={`alert-section-${sectionKey}`}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className={`h-4 w-4 ${config.iconColor}`} />
            <span className={`font-medium ${config.textColor}`}>{title}</span>
            <Badge variant={config.badgeVariant} className="ml-2">
              {count}
            </Badge>
          </div>
          <div className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            ▼
          </div>
        </button>
        
        {isExpanded && (
          <div className="space-y-2 pl-4" data-testid={`alert-list-${sectionKey}`}>
            {alertList.map((alert) => {
              const Icon = getAlertIcon(alert.type);
              return (
                <div
                  key={alert.id}
                  className={`p-3 rounded-md border ${config.bgColor} ${config.borderColor}`}
                  data-testid={`alert-item-${alert.id}`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`h-4 w-4 mt-0.5 ${config.iconColor}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className={`font-medium text-sm ${config.textColor}`}>
                          {alert.title}
                        </h4>
                        {alert.amount && (
                          <Badge variant="outline" className="text-xs">
                            ₹{alert.amount.toLocaleString()}
                          </Badge>
                        )}
                      </div>
                      <p className={`text-xs mt-1 ${config.textColor} opacity-80`}>
                        {alert.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs ${config.textColor} opacity-60`}>
                          {new Date(alert.createdAt).toLocaleTimeString()}
                        </span>
                        {alert.actionRequired && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            data-testid={`action-button-${alert.id}`}
                          >
                            Take Action
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const totalCritical = alerts?.critical?.length || 0;
  const totalImportant = alerts?.important?.length || 0;
  const totalAttention = alerts?.attention?.length || 0;
  const totalAlerts = totalCritical + totalImportant + totalAttention;

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Critical Alerts
          </div>
          {totalAlerts > 0 && (
            <Badge variant="destructive" data-testid="total-alerts-badge">
              {totalAlerts}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 max-h-96 overflow-y-auto">
        {totalAlerts === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No critical alerts at this time</p>
            <p className="text-xs opacity-70">All systems operating normally</p>
          </div>
        ) : (
          <>
            {renderAlertSection("Operational Issues", alerts?.critical || [], 'critical', totalCritical)}
            {renderAlertSection("Financial Alerts", alerts?.important || [], 'important', totalImportant)}
            {renderAlertSection("Maintenance & Attention", alerts?.attention || [], 'attention', totalAttention)}
          </>
        )}
      </CardContent>
    </Card>
  );
}