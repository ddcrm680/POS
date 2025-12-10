import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield,
  Clock,
  DollarSign,
  FileText,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  Calendar,
  Target,
  Receipt,
  Lock,
  Unlock,
  Phone,
  MessageSquare,
  ArrowRight,
  Bell,
  User,
  Timer,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import POSLayout from "@/components/layout/pos-layout";
import CashierPaymentSystem from "@/components/manager/CashierPaymentSystem";
import EODWorkflowSystem from "@/components/manager/EODWorkflowSystem";
import ExpenseManagementSystem from "@/components/manager/ExpenseManagementSystem";
import ManagerTimeClock from "@/components/manager/ManagerTimeClock";

// Critical Alert Card Component with Enhanced Features
const CriticalAlertCard = ({ alert, onAction }: { alert: any; onAction: (action: string, alert: any) => void }) => {
  // Calculate time urgency colors based on how long ago alert was created
  const timeElapsed = Date.now() - new Date(alert.timestamp).getTime();
  const minutesElapsed = Math.floor(timeElapsed / (1000 * 60));
  
  // Dynamic urgency colors based on time elapsed
  const getUrgencyColor = () => {
    if (alert.type === 'critical') {
      if (minutesElapsed > 30) return 'border-l-red-700 bg-red-100/70 dark:bg-red-900/20 animate-pulse';
      if (minutesElapsed > 15) return 'border-l-red-600 bg-red-50/60 dark:bg-red-900/15';
      return 'border-l-red-500 bg-red-50/50 dark:bg-red-900/10';
    }
    if (alert.type === 'urgent') {
      if (minutesElapsed > 60) return 'border-l-orange-700 bg-orange-100/70 dark:bg-orange-900/20';
      return 'border-l-orange-500 bg-orange-50/50 dark:bg-orange-900/10';
    }
    return 'border-l-blue-500 bg-blue-50/50 dark:bg-blue-900/10';
  };

  // Smart suggestions based on alert type
  const getSmartSuggestion = () => {
    if (alert.type === 'critical' && alert.customer) {
      return "💡 Suggested: Call customer to explain delay and provide updated timeline";
    }
    if (alert.title.includes('Inventory')) {
      return "💡 Suggested: Check with supplier or inform team about stock shortage";
    }
    if (alert.customer && alert.title.includes('Waiting')) {
      return "💡 Suggested: Greet customer personally and offer complimentary beverage";
    }
    return null;
  };

  const suggestion = getSmartSuggestion();

  return (
    <Card className={`transition-all duration-500 hover:shadow-lg hover:scale-[1.02] cursor-pointer border-l-4 transform-gpu ${getUrgencyColor()}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {alert.type === 'critical' ? (
                <AlertTriangle className="h-4 w-4 text-red-600 animate-bounce" />
              ) : alert.type === 'urgent' ? (
                <Clock className="h-4 w-4 text-orange-600" />
              ) : (
                <Bell className="h-4 w-4 text-blue-600" />
              )}
              <p className="font-semibold text-sm">{alert.title}</p>
              <Badge variant={alert.type === 'critical' ? 'destructive' : alert.type === 'urgent' ? 'secondary' : 'outline'} 
                     className={`text-xs transition-all duration-300 ${alert.type === 'critical' && minutesElapsed > 30 ? 'animate-pulse' : ''}`}>
                {alert.type.toUpperCase()}
              </Badge>
              {minutesElapsed > 0 && (
                <Badge variant="outline" className="text-xs">
                  {minutesElapsed}m ago
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
            
            {/* Smart Suggestion */}
            {suggestion && (
              <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border-l-2 border-l-blue-400">
                <p className="text-xs text-blue-700 dark:text-blue-300">{suggestion}</p>
              </div>
            )}

            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {format(new Date(alert.timestamp), "h:mm a")}
              </span>
              {alert.customer && (
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {alert.customer}
                </span>
              )}
            </div>

            {/* Communication Actions - Only show if customer exists */}
            {alert.customer && (
              <div className="flex gap-2 mb-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300 touch-manipulation h-7 px-3 text-xs transition-all duration-300 hover:scale-105"
                  onClick={() => onAction('whatsapp', alert)}
                  data-testid={`button-whatsapp-${alert.id}`}
                >
                  <MessageSquare className="h-3 w-3 mr-1" />
                  WhatsApp
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300 touch-manipulation h-7 px-3 text-xs transition-all duration-300 hover:scale-105"
                  onClick={() => onAction('call', alert)}
                  data-testid={`button-call-${alert.id}`}
                >
                  <Phone className="h-3 w-3 mr-1" />
                  Call
                </Button>
              </div>
            )}
          </div>
          <Button
            size="sm"
            className="touch-manipulation h-8 px-3 transition-all duration-300 hover:scale-110"
            onClick={() => onAction('resolve', alert)}
            data-testid={`button-resolve-${alert.id}`}
          >
            <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// To-Do Item Card Component
const TodoCard = ({ todo, onAction }: { todo: any; onAction: (action: string, todo: any) => void }) => {
  return (
    <Card className="transition-all duration-300 hover:shadow-md cursor-pointer border-l-4 border-l-green-500 bg-green-50/30 dark:bg-green-900/10">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <p className="font-semibold text-sm">{todo.title}</p>
              {todo.priority && (
                <Badge variant="outline" className="text-xs bg-white">
                  {todo.priority}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-2">{todo.description}</p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {todo.dueTime && (
                <span className="flex items-center gap-1">
                  <Timer className="h-3 w-3" />
                  Due: {format(new Date(todo.dueTime), "h:mm a")}
                </span>
              )}
              {todo.assignedTo && (
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {todo.assignedTo}
                </span>
              )}
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="touch-manipulation h-8 px-3"
            onClick={() => onAction('complete', todo)}
            data-testid={`button-complete-${todo.id}`}
          >
            <CheckCircle2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Quick Stats Component
const QuickStats = ({ stats }: { stats: any }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs opacity-90">Today's Revenue</p>
              <p className="text-lg font-bold" data-testid="revenue-today">
                ₹{stats?.todayRevenue?.toLocaleString() || '0'}
              </p>
            </div>
            <DollarSign className="h-5 w-5 opacity-80" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs opacity-90">Jobs Today</p>
              <p className="text-lg font-bold" data-testid="jobs-today">
                {stats?.jobsCompleted || 0}/{stats?.jobsTarget || 0}
              </p>
            </div>
            <Target className="h-5 w-5 opacity-80" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs opacity-90">Active Customers</p>
              <p className="text-lg font-bold" data-testid="customers-active">
                {stats?.activeCustomers || 0}
              </p>
            </div>
            <Users className="h-5 w-5 opacity-80" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs opacity-90">Urgent Items</p>
              <p className="text-lg font-bold" data-testid="urgent-count">
                {stats?.urgentAlerts || 0}
              </p>
            </div>
            <AlertCircle className="h-5 w-5 opacity-80" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface ManagerDashboardMetrics {
  todayRevenue: number;
  dailyTarget: number;
  completedJobs: number;
  activeJobs: number;
  employeesOnDuty: number;
  cashDrawerBalance: number;
  pendingExpenses: number;
  eodStatus: {
    isCompleted: boolean;
    completedTasks: number;
    totalTasks: number;
    canClockOut: boolean;
  };
  timeClockStatus: {
    isClockedIn: boolean;
    sessionDuration: number;
    todayHours: number;
    isOnBreak: boolean;
  };
}

interface ManagerAlert {
  id: string;
  type: "critical" | "important" | "attention";
  title: string;
  description: string;
  action?: string;
  createdAt: string;
}

export default function ManagerDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  // Get manager dashboard metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery<ManagerDashboardMetrics>({
    queryKey: ["/api/manager/dashboard-metrics"],
    refetchInterval: 30000,
  });

  // Get manager alerts including legacy alerts
  const { data: legacyAlerts = [], isLoading: legacyAlertsLoading } = useQuery({
    queryKey: ["/api/manager/alerts"],
    refetchInterval: 60000,
  });

  // Mock data for legacy alerts (to maintain existing functionality)
  const criticalAlerts = [
    {
      id: '1',
      type: 'critical',
      title: 'Service Overdue',
      message: 'Vehicle #DJ-1234 exceeded scheduled completion time by 2 hours',
      timestamp: new Date(Date.now() - 35 * 60 * 1000),
      customer: 'Rajesh Kumar'
    },
    {
      id: '2', 
      type: 'urgent',
      title: 'Low Inventory',
      message: 'Car shampoo stock below minimum threshold (2 bottles remaining)',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      customer: null
    }
  ];

  const handleAlertAction = (action: string, alert: any) => {
    console.log('Alert action:', action, alert);
    
    if (action === 'whatsapp' && alert.customer) {
      const message = `Hi ${alert.customer}, this is regarding your service appointment.`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    } else if (action === 'call' && alert.customer) {
      window.alert('📞 Calling ' + alert.customer + '...');
    } else if (action === 'resolve') {
      window.alert('✅ Alert resolved successfully!');
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'important':
        return <Clock className="h-4 w-4 text-orange-600" />;
      default:
        return <FileText className="h-4 w-4 text-blue-600" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'important':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <>
      <div className="p-6 space-y-6" data-testid="manager-dashboard">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              Manager Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              {format(new Date(), 'EEEE, MMMM do, yyyy')} - Complete daily operations management
            </p>
          </div>
          
          {metrics?.timeClockStatus && (
            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                <Badge className={`${
                  metrics.timeClockStatus.isClockedIn 
                    ? metrics.timeClockStatus.isOnBreak 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {metrics.timeClockStatus.isClockedIn ? (
                    metrics.timeClockStatus.isOnBreak ? "On Break" : "Active"
                  ) : (
                    "Clocked Out"
                  )}
                </Badge>
                {!metrics.eodStatus.canClockOut && metrics.timeClockStatus.isClockedIn && (
                  <Badge className="bg-orange-100 text-orange-800">
                    <Lock className="h-3 w-3 mr-1" />
                    EOD Required
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                Today: {Math.round((metrics.timeClockStatus.todayHours || 0) * 10) / 10}h
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card className="enhanced-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-muted-foreground">Revenue</span>
              </div>
              <div className="text-xl font-bold text-green-600">
                ₹{metrics?.todayRevenue?.toLocaleString() || '0'}
              </div>
              <div className="text-xs text-muted-foreground">
                Target: ₹{metrics?.dailyTarget?.toLocaleString() || '0'}
              </div>
            </CardContent>
          </Card>
          
          <Card className="enhanced-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-muted-foreground">Completed</span>
              </div>
              <div className="text-xl font-bold text-blue-600">
                {metrics?.completedJobs || 0}
              </div>
              <div className="text-xs text-muted-foreground">
                Active: {metrics?.activeJobs || 0}
              </div>
            </CardContent>
          </Card>
          
          <Card className="enhanced-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-muted-foreground">Staff</span>
              </div>
              <div className="text-xl font-bold text-purple-600">
                {metrics?.employeesOnDuty || 0}
              </div>
              <div className="text-xs text-muted-foreground">On Duty</div>
            </CardContent>
          </Card>
          
          <Card className="enhanced-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-muted-foreground">Cash</span>
              </div>
              <div className="text-xl font-bold text-green-600">
                ₹{metrics?.cashDrawerBalance?.toLocaleString() || '0'}
              </div>
              <div className="text-xs text-muted-foreground">Drawer</div>
            </CardContent>
          </Card>
          
          <Card className="enhanced-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Receipt className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-muted-foreground">Expenses</span>
              </div>
              <div className="text-xl font-bold text-orange-600">
                {metrics?.pendingExpenses || 0}
              </div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </CardContent>
          </Card>
          
          <Card className="enhanced-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-muted-foreground">EOD</span>
              </div>
              <div className="text-xl font-bold text-blue-600">
                {metrics?.eodStatus?.completedTasks || 0}/{metrics?.eodStatus?.totalTasks || 6}
              </div>
              <div className="text-xs text-muted-foreground">
                {metrics?.eodStatus?.isCompleted ? "Completed" : "In Progress"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Legacy Alerts Section */}
        {criticalAlerts.length > 0 && (
          <Card className="enhanced-card border-orange-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Urgent Alerts ({criticalAlerts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {criticalAlerts.slice(0, 2).map((alert) => (
                  <CriticalAlertCard
                    key={alert.id}
                    alert={alert}
                    onAction={handleAlertAction}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Tabs */}
        <Card className="enhanced-card">
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
                <TabsTrigger value="payments" data-testid="tab-payments">Payment System</TabsTrigger>
                <TabsTrigger value="expenses" data-testid="tab-expenses">Expense Management</TabsTrigger>
                <TabsTrigger value="eod" data-testid="tab-eod">EOD Workflow</TabsTrigger>
                <TabsTrigger value="timeclock" data-testid="tab-timeclock">Time Clock</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-6">
                <div className="space-y-6">
                  {metricsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                      <span className="ml-2">Loading dashboard...</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      
                      {/* Daily Progress */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Daily Progress
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Revenue Target</span>
                              <span>{Math.round(((metrics?.todayRevenue || 0) / (metrics?.dailyTarget || 1)) * 100)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                                style={{ 
                                  width: `${Math.min(((metrics?.todayRevenue || 0) / (metrics?.dailyTarget || 1)) * 100, 100)}%` 
                                }}
                              />
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>EOD Progress</span>
                              <span>{Math.round(((metrics?.eodStatus.completedTasks || 0) / (metrics?.eodStatus.totalTasks || 6)) * 100)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                                style={{ 
                                  width: `${((metrics?.eodStatus.completedTasks || 0) / (metrics?.eodStatus.totalTasks || 6)) * 100}%` 
                                }}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      {/* Quick Actions */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-3">
                            <Button 
                              variant="outline" 
                              className="h-16 flex flex-col gap-1"
                              onClick={() => setActiveTab("timeclock")}
                              data-testid="quick-action-timeclock"
                            >
                              <Clock className="h-5 w-5" />
                              <span className="text-xs">Time Clock</span>
                            </Button>
                            
                            <Button 
                              variant="outline" 
                              className="h-16 flex flex-col gap-1"
                              onClick={() => setActiveTab("expenses")}
                              data-testid="quick-action-expenses"
                            >
                              <Receipt className="h-5 w-5" />
                              <span className="text-xs">Add Expense</span>
                            </Button>
                            
                            <Button 
                              variant="outline" 
                              className="h-16 flex flex-col gap-1"
                              onClick={() => setActiveTab("eod")}
                              data-testid="quick-action-eod"
                            >
                              {metrics?.eodStatus.isCompleted ? (
                                <><CheckCircle className="h-5 w-5" /><span className="text-xs">EOD Done</span></>
                              ) : (
                                <><Target className="h-5 w-5" /><span className="text-xs">EOD Tasks</span></>
                              )}
                            </Button>
                            
                            <Button 
                              variant="outline" 
                              className="h-16 flex flex-col gap-1"
                              disabled={!metrics?.eodStatus.canClockOut}
                              data-testid="quick-action-logout"
                            >
                              {metrics?.eodStatus.canClockOut ? (
                                <><Unlock className="h-5 w-5" /><span className="text-xs">Clock Out</span></>
                              ) : (
                                <><Lock className="h-5 w-5" /><span className="text-xs">Complete EOD</span></>
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="payments" className="mt-6">
                <CashierPaymentSystem />
              </TabsContent>
              
              <TabsContent value="expenses" className="mt-6">
                <ExpenseManagementSystem />
              </TabsContent>
              
              <TabsContent value="eod" className="mt-6">
                <EODWorkflowSystem />
              </TabsContent>
              
              <TabsContent value="timeclock" className="mt-6">
                <ManagerTimeClock />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </>
  );
}