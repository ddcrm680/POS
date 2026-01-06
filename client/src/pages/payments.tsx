import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CreditCard, 
  Wallet, 
  Banknote, 
  Smartphone, 
  Plus, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  DollarSign,
  Receipt,
  Calculator
} from "lucide-react";
import { format } from "date-fns";

interface PaymentDashboardMetrics {
  todayRevenue: number;
  todayCashCollected: number;
  todayDigitalPayments: number;
  pendingPayments: number;
  overduePayments: number;
  cashDrawerBalance: number;
  recentTransactions: any[];
  topPaymentMethods: Array<{method: string; amount: number; percentage: number}>;
}

interface DailyPaymentSummary {
  totalReceived: number;
  totalRefunded: number;
  paymentMethodBreakdown: Record<string, number>;
  paymentTypeBreakdown: Record<string, number>;
  transactionCount: number;
  averageTransaction: number;
  cashCollected: number;
  digitalPayments: number;
}

interface CashDrawer {
  id: string;
  businessDate: string;
  openingBalance: number;
  currentBalance: number;
  totalCashIn: number;
  totalCashOut: number;
  drawerStatus: string;
  isReconciled: boolean;
}

const paymentMethodIcons = {
  upi: <Smartphone className="h-4 w-4" />,
  cash: <Banknote className="h-4 w-4" />,
  card: <CreditCard className="h-4 w-4" />,
  wallet: <Wallet className="h-4 w-4" />,
  bank_transfer: <CreditCard className="h-4 w-4" />,
  cheque: <Receipt className="h-4 w-4" />
};

const getPaymentMethodColor = (method: string) => {
  const colors = {
    upi: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    cash: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    card: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    wallet: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    bank_transfer: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
    cheque: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
  };
  return colors[method as keyof typeof colors] || "bg-gray-100 text-gray-800";
};

export default function PaymentsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Fetch dashboard metrics
  const { data: dashboardMetrics, isLoading: metricsLoading } = useQuery<PaymentDashboardMetrics>({
    queryKey: ['payment-dashboard-metrics', selectedDate],
    queryFn: async () => {
      const response = await fetch(`/api/payments/dashboard/metrics?date=${selectedDate}`);
      if (!response.ok) throw new Error('Failed to fetch dashboard metrics');
      return response.json();
    }
  });

  // Fetch daily payment summary
  const { data: dailySummary, isLoading: summaryLoading } = useQuery<DailyPaymentSummary>({
    queryKey: ['daily-payment-summary', selectedDate],
    queryFn: async () => {
      const response = await fetch(`/api/payments/summary/daily/${selectedDate}`);
      if (!response.ok) throw new Error('Failed to fetch daily summary');
      return response.json();
    }
  });

  // Fetch cash drawer status
  const { data: cashDrawer, isLoading: drawerLoading } = useQuery<CashDrawer>({
    queryKey: ['cash-drawer', selectedDate],
    queryFn: async () => {
      const response = await fetch(`/api/cash-drawer/${selectedDate}`);
      if (!response.ok) throw new Error('Failed to fetch cash drawer');
      return response.json();
    }
  });

  // Fetch pending payments
  const { data: pendingPayments } = useQuery({
    queryKey: ['pending-payments'],
    queryFn: async () => {
      const response = await fetch('/api/payments/pending');
      if (!response.ok) throw new Error('Failed to fetch pending payments');
      return response.json();
    }
  });

  // Fetch overdue payments
  const { data: overduePayments } = useQuery({
    queryKey: ['overdue-payments'],
    queryFn: async () => {
      const response = await fetch('/api/payments/overdue');
      if (!response.ok) throw new Error('Failed to fetch overdue payments');
      return response.json();
    }
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'refunded':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (metricsLoading || summaryLoading || drawerLoading) {
    return (
      <div className="flex items-center justify-center h-64" data-testid="loading-payments">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4" data-testid="payments-dashboard">
      {/* Header with Quick Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight" data-testid="page-title">
            Payment Management
          </h1>
          <p className="text-muted-foreground">
            Manage payments, cash drawer, and financial operations
          </p>
        </div>
        <div className="flex gap-2">
          <Button data-testid="button-new-payment" className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            New Payment
          </Button>
          <Button data-testid="button-cash-drawer" variant="outline">
            <Calculator className="h-4 w-4 mr-2" />
            Cash Drawer
          </Button>
        </div>
      </div>

      {/* Date Selector */}
      <div className="flex items-center gap-2">
        <label htmlFor="date-select" className="text-sm font-medium">Date:</label>
        <input
          id="date-select"
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-3 py-1 border rounded-md"
          data-testid="input-date-selector"
        />
      </div>

      {/* Revenue Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card data-testid="card-today-revenue">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-today-revenue">
              {formatCurrency(dashboardMetrics?.todayRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {dailySummary?.transactionCount || 0} transactions
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-cash-collected">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Collected</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="text-cash-collected">
              {formatCurrency(dashboardMetrics?.todayCashCollected || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Current drawer: {formatCurrency(cashDrawer?.currentBalance || 0)}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-digital-payments">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Digital Payments</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600" data-testid="text-digital-payments">
              {formatCurrency(dashboardMetrics?.todayDigitalPayments || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              UPI, Cards, Wallets
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-pending-payments">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600" data-testid="text-pending-payments">
              {dashboardMetrics?.pendingPayments || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardMetrics?.overduePayments || 0} overdue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4" data-testid="payment-tabs">
        <TabsList>
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions" data-testid="tab-transactions">Transactions</TabsTrigger>
          <TabsTrigger value="cash-drawer" data-testid="tab-cash-drawer">Cash Drawer</TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Payment Methods Breakdown */}
            <Card data-testid="card-payment-methods">
              <CardHeader>
                <CardTitle>Payment Methods Today</CardTitle>
                <CardDescription>Revenue breakdown by payment method</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardMetrics?.topPaymentMethods?.map((method, index) => (
                    <div key={method.method} className="flex items-center justify-between" data-testid={`payment-method-${method.method}`}>
                      <div className="flex items-center gap-2">
                        {paymentMethodIcons[method.method as keyof typeof paymentMethodIcons]}
                        <span className="font-medium capitalize">
                          {method.method.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(method.amount)}</div>
                        <div className="text-xs text-muted-foreground">{method.percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card data-testid="card-recent-transactions">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Latest payment activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardMetrics?.recentTransactions?.slice(0, 5).map((transaction, index) => (
                    <div key={transaction.id} className="flex items-center justify-between border-b pb-2" data-testid={`transaction-${transaction.id}`}>
                      <div className="space-y-1">
                        <div className="font-medium">Customer #{transaction.customerId?.slice(-8)}</div>
                        <div className="flex items-center gap-2">
                          <Badge className={`${getPaymentMethodColor(transaction.paymentMethod)} text-xs`}>
                            {transaction.paymentMethod.toUpperCase()}
                          </Badge>
                          <Badge className={`${getStatusColor(transaction.paymentStatus)} text-xs`}>
                            {transaction.paymentStatus}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(transaction.finalAmount)}</div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(transaction.createdAt), 'HH:mm')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cash Drawer Status */}
          <Card data-testid="card-cash-drawer-status">
            <CardHeader>
              <CardTitle>Cash Drawer Status</CardTitle>
              <CardDescription>Current cash drawer information for {format(new Date(selectedDate), 'dd MMM yyyy')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Opening Balance</div>
                  <div className="text-lg font-semibold" data-testid="text-opening-balance">
                    {formatCurrency(cashDrawer?.openingBalance || 0)}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Current Balance</div>
                  <div className="text-lg font-semibold" data-testid="text-current-balance">
                    {formatCurrency(cashDrawer?.currentBalance || 0)}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Status</div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      className={cashDrawer?.drawerStatus === 'open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} 
                      data-testid="badge-drawer-status"
                    >
                      {cashDrawer?.drawerStatus?.toUpperCase() || 'CLOSED'}
                    </Badge>
                    {cashDrawer?.isReconciled && (
                      <Badge className="bg-blue-100 text-blue-800" data-testid="badge-reconciled">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Reconciled
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card data-testid="card-transactions-list">
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>All payments for {format(new Date(selectedDate), 'dd MMM yyyy')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Transaction list component will be implemented here</p>
                <p className="text-sm">This will show detailed transaction history with filters</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cash-drawer">
          <Card data-testid="card-cash-drawer-management">
            <CardHeader>
              <CardTitle>Cash Drawer Management</CardTitle>
              <CardDescription>Manage cash drawer operations and reconciliation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Cash drawer management interface will be implemented here</p>
                <p className="text-sm">This will include opening/closing drawer, denomination counting, and reconciliation</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card data-testid="card-analytics">
            <CardHeader>
              <CardTitle>Payment Analytics</CardTitle>
              <CardDescription>Revenue trends and payment insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Analytics dashboard will be implemented here</p>
                <p className="text-sm">This will show charts, trends, and detailed payment analytics</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}