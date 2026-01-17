import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import POSLayout from "@/components/layout/pos-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  PieChart,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Banknote,
  BarChart3
} from "lucide-react";

interface DailySummary {
  id: string;
  businessDate: string;
  totalRevenue: string;
  totalJobsCompleted: number;
  totalJobsStarted: number;
  totalJobsInProgress: number;
  cashRevenue: string;
  cardRevenue: string;
  upiRevenue: string;
  revenueByService: Record<string, number>;
  totalMaterialCost: string;
  totalExpenses: string;
  grossProfit: string;
  netProfit: string;
  totalCgst: string;
  totalSgst: string;
  totalDiscounts: string;
  openingCash: string;
  closingCash: string;
  expectedCash: string;
  cashDifference: string;
  isEodCompleted: boolean;
  eodCompletedBy?: string;
  eodCompletedAt?: string;
}

interface CashRegister {
  id: string;
  businessDate: string;
  openingAmount: string;
  closingAmount?: string;
  expectedAmount: string;
  variance: string;
  denominationBreakdown?: any;
  isCompleted: boolean;
  openingRecordedBy: string;
  closingRecordedBy?: string;
}

interface OutstandingJobsReport {
  totalOutstanding: number;
  jobsByStatus: Record<string, number>;
  overdueJobs: any[];
  avgCompletionTime: number;
}

export default function Reports() {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [openingAmount, setOpeningAmount] = useState('');
  const [closingAmount, setClosingAmount] = useState('');
  const [closingNotes, setClosingNotes] = useState('');
  const [eodStaff, setEodStaff] = useState('');
  const [activeAction, setActiveAction] = useState<string | null>(null);

  // Fetch daily summary
  const { data: dailySummary, isLoading: loadingSummary } = useQuery<DailySummary>({
    queryKey: ['/api/eod/summary', selectedDate],
    enabled: !!selectedDate,
  });

  // Fetch cash register
  const { data: cashRegister, isLoading: loadingCashRegister } = useQuery<CashRegister>({
    queryKey: ['/api/cash-register', selectedDate],
    enabled: !!selectedDate,
  });

  // Fetch outstanding jobs
  const { data: outstandingJobs, isLoading: loadingOutstanding } = useQuery<OutstandingJobsReport>({
    queryKey: ['/api/reports/outstanding-jobs'],
  });

  // Generate daily summary mutation
  const generateSummaryMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/eod/generate/${selectedDate}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/eod/summary', selectedDate] });
      toast({ title: "Daily summary generated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to generate daily summary", variant: "destructive" });
    }
  });

  // Open cash register mutation
  const openCashMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/cash-register/${selectedDate}/open`, {
        openingAmount: parseFloat(openingAmount),
        recordedBy: 'System User', // In real app, get from auth context
        notes: 'Opening cash for the day'
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cash-register', selectedDate] });
      setOpeningAmount('');
      toast({ title: "Cash register opened successfully" });
    },
    onError: () => {
      toast({ title: "Failed to open cash register", variant: "destructive" });
    }
  });

  // Close cash register mutation
  const closeCashMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('PUT', `/api/cash-register/${selectedDate}/close`, {
        closingAmount: parseFloat(closingAmount),
        denominationBreakdown: {}, // Would be filled with actual denomination counts
        recordedBy: 'System User',
        notes: closingNotes
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cash-register', selectedDate] });
      setClosingAmount('');
      setClosingNotes('');
      toast({ title: "Cash register closed successfully" });
    },
    onError: () => {
      toast({ title: "Failed to close cash register", variant: "destructive" });
    }
  });

  // Complete EOD mutation
  const completeEodMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('PUT', `/api/eod/complete/${selectedDate}`, {
        completedBy: eodStaff || 'System User'
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/eod/summary', selectedDate] });
      setEodStaff('');
      toast({ title: "End of Day completed successfully" });
    },
    onError: () => {
      toast({ title: "Failed to complete EOD", variant: "destructive" });
    }
  });

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(num || 0);
  };

  return (
    <>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold" data-testid="heading-reports">Reports & Analytics</h1>
            <p className="text-muted-foreground">End-of-day processing and business analytics</p>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-auto"
              data-testid="input-business-date"
            />
          </div>
        </div>

        {/* EOD Status Summary - Always Visible */}
        {(dailySummary || cashRegister) && (
          <Card className="border-gray-200 bg-gray-50 mb-6">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-lg font-semibold text-gray-800">End of Day Progress:</div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className={`flex items-center gap-1 ${dailySummary ? 'text-green-600' : 'text-gray-400'}`}>
                      {dailySummary ? '✅' : '⚪'} Summary Generated
                    </div>
                    <div className={`flex items-center gap-1 ${cashRegister ? 'text-blue-600' : 'text-gray-400'}`}>
                      {cashRegister ? '✅' : '⚪'} Cash Counted
                    </div>
                    <div className={`flex items-center gap-1 ${dailySummary?.isEodCompleted ? 'text-red-600' : 'text-gray-400'}`}>
                      {dailySummary?.isEodCompleted ? '✅' : '⚪'} Day Closed
                    </div>
                  </div>
                </div>
                {dailySummary && (
                  <div className="text-sm text-gray-600">
                    Sales: ₹{dailySummary.totalRevenue} • Jobs: {dailySummary.totalJobsCompleted}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step-by-Step EOD Process - Simple & Clear */}
        <div className="space-y-6">
          
          {/* Step 1: Generate Daily Summary */}
          {!dailySummary && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white text-xl font-bold">1</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-green-800">Start End of Day</h3>
                    <p className="text-green-700">First, let's see how your business did today</p>
                  </div>
                  <Button
                    onClick={() => generateSummaryMutation.mutate()}
                    disabled={generateSummaryMutation.isPending}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg h-auto"
                    data-testid="button-start-eod"
                  >
                    {generateSummaryMutation.isPending ? "Loading..." : "Start EOD Process"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Show Today's Results */}
          {dailySummary && !cashRegister && !dailySummary.isEodCompleted && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">2</div>
                    <div>
                      <h3 className="text-xl font-bold text-blue-800">Today's Business Summary</h3>
                      <p className="text-blue-700">Here's how your business performed today</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
                    <div className="text-center p-3 bg-white rounded-lg border">
                      <div className="text-3xl font-bold text-green-600">₹{dailySummary.totalRevenue}</div>
                      <div className="text-sm text-gray-600">Total Sales</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border">
                      <div className="text-3xl font-bold text-blue-600">{dailySummary.totalJobsCompleted}</div>
                      <div className="text-sm text-gray-600">Jobs Completed</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border">
                      <div className="text-3xl font-bold text-purple-600">₹{dailySummary.netProfit}</div>
                      <div className="text-sm text-gray-600">Net Profit</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border">
                      <div className="text-3xl font-bold text-orange-600">{dailySummary.totalJobsInProgress}</div>
                      <div className="text-sm text-gray-600">Jobs Pending</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <p className="text-blue-700 font-medium">Next: Count the cash in your register</p>
                    </div>
                    <Button
                      onClick={() => setActiveAction('count-cash')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg h-auto"
                      data-testid="button-count-cash"
                    >
                      Count Cash →
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Count Cash */}
          {dailySummary && !cashRegister && activeAction === 'count-cash' && (
            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">3</div>
                    <div>
                      <h3 className="text-xl font-bold text-purple-800">Count Your Cash</h3>
                      <p className="text-purple-700">Count all the cash in your register right now</p>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg border space-y-3">
                    <Label htmlFor="cash-amount" className="text-lg font-semibold">How much cash do you have in total?</Label>
                    <Input
                      id="cash-amount"
                      type="number"
                      value={openingAmount}
                      onChange={(e) => setOpeningAmount(e.target.value)}
                      placeholder="Enter amount (example: 5000)"
                      className="text-2xl h-16 text-center"
                      data-testid="input-cash-amount"
                    />
                    <Button
                      onClick={() => openCashMutation.mutate()}
                      disabled={openCashMutation.isPending || !openingAmount || isNaN(parseFloat(openingAmount))}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 text-lg h-auto"
                      data-testid="button-record-cash"
                    >
                      {openCashMutation.isPending ? "Recording..." : "✅ Record Cash Amount"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Close Day */}
          {dailySummary && cashRegister && !dailySummary.isEodCompleted && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white text-xl font-bold">4</div>
                    <div>
                      <h3 className="text-xl font-bold text-red-800">Close Day & Lock Records</h3>
                      <p className="text-red-700">Final step: Close the day and secure all records</p>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg border space-y-3">
                    <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 text-yellow-800">
                      <div className="font-semibold">✅ Cash Recorded: ₹{cashRegister.openingAmount}</div>
                      <div className="text-sm mt-1">Ready to close the day</div>
                    </div>
                    
                    <Label htmlFor="staff-name" className="text-lg font-semibold">Who is closing today?</Label>
                    <Input
                      id="staff-name"
                      value={eodStaff}
                      onChange={(e) => setEodStaff(e.target.value)}
                      placeholder="Enter your name"
                      className="text-xl h-12"
                      data-testid="input-staff-name"
                    />
                    
                    <Button
                      onClick={() => completeEodMutation.mutate()}
                      disabled={completeEodMutation.isPending || !eodStaff || eodStaff.trim().length === 0}
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-4 text-lg h-auto"
                      data-testid="button-close-day"
                    >
                      {completeEodMutation.isPending ? "Closing..." : "🔒 Close Day & Lock All Records"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Completion State */}
          {dailySummary?.isEodCompleted && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="text-center py-12">
                <div className="text-8xl mb-6">✅</div>
                <div className="text-3xl font-bold text-green-600 mb-4">Day Closed Successfully!</div>
                <div className="text-xl text-green-700 mb-2">All records are locked for {selectedDate}</div>
                <div className="text-lg text-green-600">
                  Sales: ₹{dailySummary.totalRevenue} • Jobs: {dailySummary.totalJobsCompleted} • Profit: ₹{dailySummary.netProfit}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Current Action Content */}
        <div className="space-y-6">
          {activeAction === 'view-summary' && dailySummary && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">📊 Today's Business Summary</CardTitle>
                <CardDescription>Simple overview of today's performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(dailySummary.totalRevenue)}</div>
                    <div className="text-sm text-green-700">Total Sales</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{dailySummary.totalJobsCompleted}</div>
                    <div className="text-sm text-blue-700">Jobs Done</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{formatCurrency(dailySummary.netProfit)}</div>
                    <div className="text-sm text-purple-700">Profit Made</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{dailySummary.totalJobsInProgress}</div>
                    <div className="text-sm text-orange-700">Jobs Pending</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeAction === 'count-cash' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">💰 Count Your Cash</CardTitle>
                <CardDescription>Count the money in your cash register</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!cashRegister?.isCompleted ? (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="opening-amount" className="text-lg">How much cash do you have right now?</Label>
                      <Input
                        id="opening-amount"
                        type="number"
                        value={openingAmount}
                        onChange={(e) => setOpeningAmount(e.target.value)}
                        placeholder="Enter amount in ₹"
                        className="text-xl h-16 text-center"
                        data-testid="input-cash-amount"
                      />
                    </div>
                    <Button
                      onClick={() => openCashMutation.mutate()}
                      disabled={openCashMutation.isPending || !openingAmount}
                      className="w-full h-16 text-lg"
                      data-testid="button-record-cash"
                    >
                      ✅ Record This Amount
                    </Button>
                  </div>
                ) : (
                  <div className="text-center space-y-3">
                    <div className="text-3xl">✅</div>
                    <div className="text-xl font-semibold">Cash Counted!</div>
                    <div className="text-lg">Opening: {formatCurrency(cashRegister.openingAmount)}</div>
                    {cashRegister.closingAmount && (
                      <div className="text-lg">Closing: {formatCurrency(cashRegister.closingAmount)}</div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeAction === 'close-day' && dailySummary && !dailySummary.isEodCompleted && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">🔒 Close Today</CardTitle>
                <CardDescription>Finish today and lock all records</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="text-yellow-800">
                    <div className="font-semibold">Before closing:</div>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                      <li>Make sure all jobs are completed</li>
                      <li>Count your cash</li>
                      <li>Check that everything looks right</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <Label htmlFor="staff-name" className="text-lg">Who is closing today?</Label>
                  <Input
                    id="staff-name"
                    value={eodStaff}
                    onChange={(e) => setEodStaff(e.target.value)}
                    placeholder="Enter your name"
                    className="text-xl h-16"
                    data-testid="input-staff-name"
                  />
                </div>

                <Button
                  onClick={() => completeEodMutation.mutate()}
                  disabled={completeEodMutation.isPending || !eodStaff}
                  className="w-full h-16 text-lg bg-red-600 hover:bg-red-700"
                  data-testid="button-close-today"
                >
                  🔒 Close Today & Lock Records
                </Button>
              </CardContent>
            </Card>
          )}

          {dailySummary?.isEodCompleted && (
            <Card>
              <CardContent className="text-center py-8">
                <div className="text-6xl mb-4">✅</div>
                <div className="text-2xl font-bold text-green-600 mb-2">Day Closed Successfully!</div>
                <div className="text-lg text-muted-foreground">All records are locked for {selectedDate}</div>
              </CardContent>
            </Card>
          )}
        </div>

        <Tabs defaultValue="eod" className="w-full hidden">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="eod" data-testid="tab-eod">End of Day</TabsTrigger>
            <TabsTrigger value="bookkeeping" data-testid="tab-bookkeeping">Bookkeeping</TabsTrigger>
            <TabsTrigger value="cash" data-testid="tab-cash">Cash Management</TabsTrigger>
            <TabsTrigger value="outstanding" data-testid="tab-outstanding">Outstanding Jobs</TabsTrigger>
          </TabsList>

          <TabsContent value="eod" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card data-testid="card-revenue-summary">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="value-total-revenue">
                    {dailySummary ? formatCurrency(dailySummary.totalRevenue) : '₹0.00'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {dailySummary?.totalJobsCompleted || 0} jobs completed
                  </p>
                </CardContent>
              </Card>

              <Card data-testid="card-profit-summary">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="value-net-profit">
                    {dailySummary ? formatCurrency(dailySummary.netProfit) : '₹0.00'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Gross: {dailySummary ? formatCurrency(dailySummary.grossProfit) : '₹0.00'}
                  </p>
                </CardContent>
              </Card>

              <Card data-testid="card-jobs-summary">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Jobs Status</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="value-jobs-in-progress">
                    {dailySummary?.totalJobsInProgress || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {dailySummary?.totalJobsStarted || 0} started today
                  </p>
                </CardContent>
              </Card>

              <Card data-testid="card-eod-status">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">EOD Status</CardTitle>
                  {dailySummary?.isEodCompleted ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Clock className="h-4 w-4 text-orange-500" />
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Badge 
                      variant={dailySummary?.isEodCompleted ? "default" : "secondary"}
                      data-testid="badge-eod-status"
                    >
                      {dailySummary?.isEodCompleted ? "Completed" : "Pending"}
                    </Badge>
                    {!dailySummary && (
                      <Button
                        onClick={() => generateSummaryMutation.mutate()}
                        disabled={generateSummaryMutation.isPending}
                        size="sm"
                        className="w-full"
                        data-testid="button-generate-summary"
                      >
                        Generate Summary
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {dailySummary && !dailySummary.isEodCompleted && (
              <Card data-testid="card-complete-eod">
                <CardHeader>
                  <CardTitle>Complete End of Day</CardTitle>
                  <CardDescription>
                    Finalize the day's operations and lock the records
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label htmlFor="eod-staff">Completed by (Staff Name)</Label>
                    <Input
                      id="eod-staff"
                      value={eodStaff}
                      onChange={(e) => setEodStaff(e.target.value)}
                      placeholder="Enter staff name"
                      data-testid="input-eod-staff"
                    />
                  </div>
                  <Button
                    onClick={() => completeEodMutation.mutate()}
                    disabled={completeEodMutation.isPending || !eodStaff}
                    className="w-full"
                    data-testid="button-complete-eod"
                  >
                    Complete End of Day
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="bookkeeping" className="space-y-6">
            {dailySummary && (
              <div className="grid gap-6 md:grid-cols-2">
                <Card data-testid="card-revenue-breakdown">
                  <CardHeader>
                    <CardTitle>Revenue Breakdown</CardTitle>
                    <CardDescription>Payment methods and service types</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-2">By Payment Method</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Cash</span>
                          <span data-testid="value-cash-revenue">{formatCurrency(dailySummary.cashRevenue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Card</span>
                          <span data-testid="value-card-revenue">{formatCurrency(dailySummary.cardRevenue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>UPI</span>
                          <span data-testid="value-upi-revenue">{formatCurrency(dailySummary.upiRevenue)}</span>
                        </div>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-2">By Service Type</h4>
                      <div className="space-y-2">
                        {Object.entries(dailySummary.revenueByService || {}).map(([service, amount]) => (
                          <div key={service} className="flex justify-between">
                            <span className="capitalize">{service.replace('-', ' ')}</span>
                            <span>{formatCurrency(amount)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card data-testid="card-cost-analysis">
                  <CardHeader>
                    <CardTitle>Cost Analysis</CardTitle>
                    <CardDescription>Material costs and expenses</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Material Costs</span>
                        <span data-testid="value-material-costs">{formatCurrency(dailySummary.totalMaterialCost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Operating Expenses</span>
                        <span data-testid="value-expenses">{formatCurrency(dailySummary.totalExpenses)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-medium">
                        <span>Total Costs</span>
                        <span data-testid="value-total-costs">
                          {formatCurrency(
                            parseFloat(dailySummary.totalMaterialCost) + parseFloat(dailySummary.totalExpenses)
                          )}
                        </span>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>CGST</span>
                        <span data-testid="value-cgst">{formatCurrency(dailySummary.totalCgst)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>SGST</span>
                        <span data-testid="value-sgst">{formatCurrency(dailySummary.totalSgst)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Discounts</span>
                        <span data-testid="value-discounts">{formatCurrency(dailySummary.totalDiscounts)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2" data-testid="card-profit-loss">
                  <CardHeader>
                    <CardTitle>Profit & Loss Summary</CardTitle>
                    <CardDescription>Daily P&L statement</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-lg">
                        <span>Total Revenue</span>
                        <span className="font-medium">{formatCurrency(dailySummary.totalRevenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>- Material Costs</span>
                        <span className="text-red-600">({formatCurrency(dailySummary.totalMaterialCost)})</span>
                      </div>
                      <div className="flex justify-between">
                        <span>= Gross Profit</span>
                        <span className="font-medium">{formatCurrency(dailySummary.grossProfit)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>- Operating Expenses</span>
                        <span className="text-red-600">({formatCurrency(dailySummary.totalExpenses)})</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-xl font-bold">
                        <span>Net Profit</span>
                        <span 
                          className={parseFloat(dailySummary.netProfit) >= 0 ? "text-green-600" : "text-red-600"}
                          data-testid="value-final-net-profit"
                        >
                          {formatCurrency(dailySummary.netProfit)}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Margin: {((parseFloat(dailySummary.netProfit) / parseFloat(dailySummary.totalRevenue)) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="cash" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card data-testid="card-open-cash">
                <CardHeader>
                  <CardTitle>Open Cash Register</CardTitle>
                  <CardDescription>Record opening cash amount for the day</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {!cashRegister ? (
                    <>
                      <div>
                        <Label htmlFor="opening-amount">Opening Amount (₹)</Label>
                        <Input
                          id="opening-amount"
                          type="number"
                          value={openingAmount}
                          onChange={(e) => setOpeningAmount(e.target.value)}
                          placeholder="0.00"
                          data-testid="input-opening-amount"
                        />
                      </div>
                      <Button
                        onClick={() => openCashMutation.mutate()}
                        disabled={openCashMutation.isPending || !openingAmount}
                        className="w-full"
                        data-testid="button-open-cash"
                      >
                        Open Cash Register
                      </Button>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <Badge variant="default">Cash register opened</Badge>
                      <p>Opening amount: {formatCurrency(cashRegister.openingAmount)}</p>
                      <p>Opened by: {cashRegister.openingRecordedBy}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card data-testid="card-close-cash">
                <CardHeader>
                  <CardTitle>Close Cash Register</CardTitle>
                  <CardDescription>Record closing cash amount and reconcile</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {cashRegister && !cashRegister.isCompleted ? (
                    <>
                      <div>
                        <Label htmlFor="closing-amount">Closing Amount (₹)</Label>
                        <Input
                          id="closing-amount"
                          type="number"
                          value={closingAmount}
                          onChange={(e) => setClosingAmount(e.target.value)}
                          placeholder="0.00"
                          data-testid="input-closing-amount"
                        />
                      </div>
                      <div>
                        <Label htmlFor="closing-notes">Notes (optional)</Label>
                        <Input
                          id="closing-notes"
                          value={closingNotes}
                          onChange={(e) => setClosingNotes(e.target.value)}
                          placeholder="Any notes about cash closing"
                          data-testid="input-closing-notes"
                        />
                      </div>
                      <Button
                        onClick={() => closeCashMutation.mutate()}
                        disabled={closeCashMutation.isPending || !closingAmount}
                        className="w-full"
                        data-testid="button-close-cash"
                      >
                        Close Cash Register
                      </Button>
                    </>
                  ) : cashRegister?.isCompleted ? (
                    <div className="space-y-2">
                      <Badge variant="default">Cash register closed</Badge>
                      <p>Closing amount: {formatCurrency(cashRegister.closingAmount || '0')}</p>
                      <p>Expected: {formatCurrency(cashRegister.expectedAmount)}</p>
                      <p className={`font-medium ${parseFloat(cashRegister.variance) === 0 ? 'text-green-600' : 'text-red-600'}`}>
                        Variance: {formatCurrency(cashRegister.variance)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Open cash register first</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="outstanding" className="space-y-6">
            <Card data-testid="card-outstanding-jobs">
              <CardHeader>
                <CardTitle>Outstanding Jobs Analysis</CardTitle>
                <CardDescription>Jobs requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                {outstandingJobs && (
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold" data-testid="value-total-outstanding">
                        {outstandingJobs.totalOutstanding}
                      </div>
                      <p className="text-sm text-muted-foreground">Total Outstanding</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600" data-testid="value-overdue-jobs">
                        {outstandingJobs.overdueJobs.length}
                      </div>
                      <p className="text-sm text-muted-foreground">Overdue Jobs</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold" data-testid="value-avg-completion">
                        {outstandingJobs.avgCompletionTime.toFixed(1)}h
                      </div>
                      <p className="text-sm text-muted-foreground">Avg Completion Time</p>
                    </div>
                  </div>
                )}
                {loadingOutstanding && (
                  <div className="text-center text-muted-foreground">Loading outstanding jobs...</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
