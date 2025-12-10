import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  DollarSign,
  Calculator,
  Send,
  Download,
  RefreshCw,
  Lock,
  Unlock,
  Calendar,
  Target,
  TrendingUp,
  Users,
  ShoppingCart,
  CreditCard,
  Receipt,
  Building
} from "lucide-react";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";

const eodCompletionSchema = z.object({
  cashDrawerReconciled: z.boolean().refine(val => val === true, "Must reconcile cash drawer"),
  inventoryChecked: z.boolean().refine(val => val === true, "Must verify inventory"),
  expensesRecorded: z.boolean().refine(val => val === true, "Must record all expenses"),
  dailyReportGenerated: z.boolean().refine(val => val === true, "Must generate daily report"),
  equipmentSecured: z.boolean().refine(val => val === true, "Must secure all equipment"),
  premisesSecured: z.boolean().refine(val => val === true, "Must secure premises"),
  notes: z.string().optional(),
  managerSignature: z.string().min(1, "Manager signature required")
});

type EODFormData = z.infer<typeof eodCompletionSchema>;

interface EODTask {
  id: string;
  name: string;
  description: string;
  isCompleted: boolean;
  completedAt?: string;
  isRequired: boolean;
  category: string;
  icon: any;
}

interface DailySummary {
  businessDate: string;
  totalRevenue: number;
  totalJobsCompleted: number;
  totalJobsStarted: number;
  cashRevenue: number;
  cardRevenue: number;
  upiRevenue: number;
  totalExpenses: number;
  grossProfit: number;
  netProfit: number;
  isEodCompleted: boolean;
  completedBy?: string;
  completedAt?: string;
  eodNotes?: string;
}

interface CashDrawerStatus {
  isOpen: boolean;
  currentBalance: number;
  isReconciled: boolean;
  variance?: number;
}

interface HQReport {
  id: string;
  businessDate: string;
  reportData: any;
  sentAt?: string;
  acknowledgementReceived: boolean;
}

export default function EODProcedures() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("checklist");
  const today = format(new Date(), 'yyyy-MM-dd');

  const form = useForm<EODFormData>({
    resolver: zodResolver(eodCompletionSchema),
    defaultValues: {
      cashDrawerReconciled: false,
      inventoryChecked: false,
      expensesRecorded: false,
      dailyReportGenerated: false,
      equipmentSecured: false,
      premisesSecured: false,
      managerSignature: ""
    }
  });

  // Get daily summary and EOD status
  const { data: dailySummary, isLoading: summaryLoading } = useQuery<DailySummary>({
    queryKey: ["/api/eod/daily-summary", today],
    refetchInterval: 30000,
  });

  // Get cash drawer status
  const { data: cashDrawerStatus } = useQuery<CashDrawerStatus>({
    queryKey: ["/api/cash-drawer/current"],
    refetchInterval: 30000,
  });

  // Get HQ report status
  const { data: hqReportStatus } = useQuery<HQReport>({
    queryKey: ["/api/hq-reports/status", today],
    refetchInterval: 60000,
  });

  // Generate daily summary mutation
  const generateSummaryMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/eod/generate/${today}`, {});
    },
    onSuccess: () => {
      toast({
        title: "Daily Summary Generated",
        description: "Daily summary has been generated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/eod/daily-summary"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Generate Summary",
        description: error.message || "Unable to generate daily summary.",
        variant: "destructive",
      });
    }
  });

  // Complete EOD mutation
  const completeEODMutation = useMutation({
    mutationFn: async (data: EODFormData) => {
      return apiRequest("PUT", `/api/eod/complete/${today}`, {
        completedBy: data.managerSignature,
        notes: data.notes
      });
    },
    onSuccess: () => {
      toast({
        title: "EOD Procedures Completed",
        description: "All end of day procedures have been completed successfully. You can now clock out.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/eod/daily-summary"] });
      queryClient.invalidateQueries({ queryKey: ["/api/manager/time-clock/session"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Complete EOD",
        description: error.message || "Unable to complete EOD procedures.",
        variant: "destructive",
      });
    }
  });

  // Send HQ report mutation
  const sendHQReportMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/hq-reports/send/${today}`, {});
    },
    onSuccess: () => {
      toast({
        title: "Report Sent to HQ",
        description: "Daily report has been sent to headquarters successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/hq-reports/status"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Send Report",
        description: error.message || "Unable to send report to HQ.",
        variant: "destructive",
      });
    }
  });

  const eodTasks: EODTask[] = [
    {
      id: "cash_drawer",
      name: "Cash Drawer Reconciliation",
      description: "Count cash drawer and reconcile with system records",
      isCompleted: cashDrawerStatus?.isReconciled || false,
      isRequired: true,
      category: "financial",
      icon: <DollarSign className="h-4 w-4" />
    },
    {
      id: "inventory",
      name: "Inventory Check",
      description: "Verify critical inventory levels and update stock counts",
      isCompleted: form.watch("inventoryChecked"),
      isRequired: true,
      category: "operations",
      icon: <ShoppingCart className="h-4 w-4" />
    },
    {
      id: "expenses",
      name: "Record All Expenses",
      description: "Ensure all daily expenses are recorded and categorized",
      isCompleted: form.watch("expensesRecorded"),
      isRequired: true,
      category: "financial",
      icon: <Receipt className="h-4 w-4" />
    },
    {
      id: "daily_report",
      name: "Generate Daily Report",
      description: "Generate comprehensive daily business summary",
      isCompleted: !!dailySummary && !summaryLoading,
      isRequired: true,
      category: "reporting",
      icon: <FileText className="h-4 w-4" />
    },
    {
      id: "equipment",
      name: "Secure Equipment",
      description: "Lock and secure all equipment and tools",
      isCompleted: form.watch("equipmentSecured"),
      isRequired: true,
      category: "security",
      icon: <Lock className="h-4 w-4" />
    },
    {
      id: "premises",
      name: "Secure Premises",
      description: "Lock all doors, windows, and activate security systems",
      isCompleted: form.watch("premisesSecured"),
      isRequired: true,
      category: "security",
      icon: <Building className="h-4 w-4" />
    }
  ];

  const completedTasksCount = eodTasks.filter(task => task.isCompleted).length;
  const totalTasks = eodTasks.length;
  const progressPercentage = (completedTasksCount / totalTasks) * 100;
  const canCompleteEOD = completedTasksCount === totalTasks;

  const onSubmit = (data: EODFormData) => {
    if (!canCompleteEOD) {
      toast({
        title: "Cannot Complete EOD",
        description: "Please complete all required tasks before finalizing EOD procedures.",
        variant: "destructive",
      });
      return;
    }
    completeEODMutation.mutate(data);
  };

  return (
    <div className="space-y-6" data-testid="eod-procedures">
      
      {/* Progress Overview */}
      <Card className="enhanced-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                End of Day Procedures
              </CardTitle>
              <CardDescription>
                {format(new Date(), 'EEEE, MMMM do, yyyy')} - Complete all tasks before clocking out
              </CardDescription>
            </div>
            <Badge className={`text-lg px-4 py-2 ${
              dailySummary?.isEodCompleted 
                ? 'bg-green-100 text-green-800' 
                : progressPercentage === 100 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-orange-100 text-orange-800'
            }`}>
              {dailySummary?.isEodCompleted ? (
                <><CheckCircle className="h-4 w-4 mr-1" />Completed</>
              ) : progressPercentage === 100 ? (
                <><Target className="h-4 w-4 mr-1" />Ready to Close</>
              ) : (
                <><Clock className="h-4 w-4 mr-1" />In Progress</>
              )}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Progress: {completedTasksCount} of {totalTasks} tasks completed</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
            
            {!dailySummary?.isEodCompleted && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900 dark:text-blue-300">
                    {progressPercentage === 100 ? "Ready to Complete EOD" : "Tasks Remaining"}
                  </span>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  {progressPercentage === 100 
                    ? "All tasks completed! You can now finalize EOD procedures and clock out."
                    : `Complete all ${totalTasks - completedTasksCount} remaining tasks to finish EOD procedures.`
                  }
                </p>
              </div>
            )}
            
            {dailySummary?.isEodCompleted && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-900 dark:text-green-300">EOD Completed</span>
                </div>
                <p className="text-sm text-green-700 dark:text-green-400">
                  Completed by {dailySummary.completedBy} on {format(new Date(dailySummary.completedAt!), 'MMM dd, yyyy at h:mm a')}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Card className="enhanced-card">
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="checklist" data-testid="tab-checklist">Task Checklist</TabsTrigger>
              <TabsTrigger value="summary" data-testid="tab-summary">Daily Summary</TabsTrigger>
              <TabsTrigger value="finalize" data-testid="tab-finalize">Finalize EOD</TabsTrigger>
            </TabsList>
            
            <TabsContent value="checklist" className="space-y-4">
              <div className="space-y-3">
                {eodTasks.map((task) => (
                  <Card key={task.id} className={`transition-all ${
                    task.isCompleted ? 'bg-green-50 dark:bg-green-900/10 border-green-200' : 'bg-background'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${
                          task.isCompleted ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {task.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold">{task.name}</h4>
                            {task.isCompleted ? (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />Completed
                              </Badge>
                            ) : (
                              <Badge variant="outline">
                                <Clock className="h-3 w-3 mr-1" />Pending
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                          
                          {task.id === "cash_drawer" && !task.isCompleted && (
                            <div className="mt-2">
                              <Button size="sm" variant="outline" onClick={() => setActiveTab("summary")}>
                                <Calculator className="h-3 w-3 mr-1" />
                                Go to Cash Reconciliation
                              </Button>
                            </div>
                          )}
                          
                          {task.id === "daily_report" && !task.isCompleted && (
                            <div className="mt-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => generateSummaryMutation.mutate()}
                                disabled={generateSummaryMutation.isPending}
                              >
                                <RefreshCw className="h-3 w-3 mr-1" />
                                Generate Report
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="summary" className="space-y-4">
              {summaryLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                  <span className="ml-2">Loading daily summary...</span>
                </div>
              ) : dailySummary ? (
                <div className="space-y-4">
                  
                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">Total Revenue</span>
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          ₹{dailySummary.totalRevenue.toLocaleString()}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium">Jobs Completed</span>
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                          {dailySummary.totalJobsCompleted}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Calculator className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium">Net Profit</span>
                        </div>
                        <div className="text-2xl font-bold text-purple-600">
                          ₹{dailySummary.netProfit.toLocaleString()}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Revenue Breakdown */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Revenue Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="font-medium">Cash</span>
                          </div>
                          <span className="font-bold text-green-600">₹{dailySummary.cashRevenue.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">Card</span>
                          </div>
                          <span className="font-bold text-blue-600">₹{dailySummary.cardRevenue.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-purple-600" />
                            <span className="font-medium">UPI</span>
                          </div>
                          <span className="font-bold text-purple-600">₹{dailySummary.upiRevenue.toLocaleString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* HQ Report Status */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        HQ Report Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          {hqReportStatus?.sentAt ? (
                            <div className="flex items-center gap-2 text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              <span>Report sent to HQ on {format(new Date(hqReportStatus.sentAt), 'MMM dd, yyyy at h:mm a')}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-orange-600">
                              <Clock className="h-4 w-4" />
                              <span>Report not yet sent to HQ</span>
                            </div>
                          )}
                        </div>
                        
                        {!hqReportStatus?.sentAt && dailySummary && (
                          <Button
                            onClick={() => sendHQReportMutation.mutate()}
                            disabled={sendHQReportMutation.isPending}
                            data-testid="button-send-hq-report"
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Send to HQ
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">Daily summary not yet generated</p>
                  <Button onClick={() => generateSummaryMutation.mutate()} disabled={generateSummaryMutation.isPending}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate Daily Summary
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="finalize" className="space-y-4">
              {dailySummary?.isEodCompleted ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-600" />
                  <h3 className="text-xl font-semibold mb-2">EOD Procedures Completed</h3>
                  <p className="text-muted-foreground mb-4">
                    All end of day procedures have been completed successfully.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Completed by {dailySummary.completedBy} on {format(new Date(dailySummary.completedAt!), 'MMM dd, yyyy at h:mm a')}
                  </p>
                  {dailySummary.eodNotes && (
                    <div className="mt-4 p-4 bg-muted/50 rounded text-left">
                      <h4 className="font-medium mb-2">EOD Notes:</h4>
                      <p className="text-sm">{dailySummary.eodNotes}</p>
                    </div>
                  )}
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    
                    {!canCompleteEOD && (
                      <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-4 w-4 text-orange-600" />
                          <span className="font-medium text-orange-900 dark:text-orange-300">Tasks Incomplete</span>
                        </div>
                        <p className="text-sm text-orange-700 dark:text-orange-400">
                          Please complete all required tasks in the checklist before finalizing EOD procedures.
                        </p>
                      </div>
                    )}
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Final Verification</h3>
                      
                      {/* Verification Checkboxes */}
                      <div className="space-y-3">
                        <FormField
                          control={form.control}
                          name="cashDrawerReconciled"
                          render={({ field }) => (
                            <FormItem className="flex items-center gap-3">
                              <FormControl>
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  disabled={cashDrawerStatus?.isReconciled}
                                  className="rounded"
                                  data-testid="checkbox-cash-drawer"
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal flex-1">
                                Cash drawer has been reconciled and balanced
                              </FormLabel>
                              {cashDrawerStatus?.isReconciled && (
                                <Badge className="bg-green-100 text-green-800">✓ Completed</Badge>
                              )}
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="inventoryChecked"
                          render={({ field }) => (
                            <FormItem className="flex items-center gap-3">
                              <FormControl>
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="rounded"
                                  data-testid="checkbox-inventory"
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal flex-1">
                                Inventory levels have been verified and updated
                              </FormLabel>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="expensesRecorded"
                          render={({ field }) => (
                            <FormItem className="flex items-center gap-3">
                              <FormControl>
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="rounded"
                                  data-testid="checkbox-expenses"
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal flex-1">
                                All daily expenses have been recorded
                              </FormLabel>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="dailyReportGenerated"
                          render={({ field }) => (
                            <FormItem className="flex items-center gap-3">
                              <FormControl>
                                <input
                                  type="checkbox"
                                  checked={field.value || !!dailySummary}
                                  onChange={field.onChange}
                                  disabled={!!dailySummary}
                                  className="rounded"
                                  data-testid="checkbox-daily-report"
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal flex-1">
                                Daily report has been generated and reviewed
                              </FormLabel>
                              {dailySummary && (
                                <Badge className="bg-green-100 text-green-800">✓ Generated</Badge>
                              )}
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="equipmentSecured"
                          render={({ field }) => (
                            <FormItem className="flex items-center gap-3">
                              <FormControl>
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="rounded"
                                  data-testid="checkbox-equipment"
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal flex-1">
                                All equipment and tools have been secured
                              </FormLabel>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="premisesSecured"
                          render={({ field }) => (
                            <FormItem className="flex items-center gap-3">
                              <FormControl>
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="rounded"
                                  data-testid="checkbox-premises"
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal flex-1">
                                All doors, windows, and security systems are secured
                              </FormLabel>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>EOD Notes (Optional)</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Any notes or observations for the day..." rows={3} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="managerSignature"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Manager Signature *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Type your full name to confirm" data-testid="input-manager-signature" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button
                      type="submit"
                      disabled={!canCompleteEOD || completeEODMutation.isPending}
                      className={`w-full ${canCompleteEOD ? '' : 'opacity-50'}`}
                      data-testid="button-complete-eod"
                    >
                      {canCompleteEOD ? (
                        <><Unlock className="h-4 w-4 mr-2" />Complete EOD Procedures</>
                      ) : (
                        <><Lock className="h-4 w-4 mr-2" />Complete All Tasks First</>
                      )}
                    </Button>
                  </form>
                </Form>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}