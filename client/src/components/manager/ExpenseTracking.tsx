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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Receipt,
  Plus,
  Search,
  Filter,
  Download,
  Calendar,
  DollarSign,
  CreditCard,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  Banknote,
  Truck,
  Zap,
  Wrench,
  ShoppingCart
} from "lucide-react";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";

const expenseSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.string().min(1, "Amount is required"),
  category: z.enum([
    "supplies", "utilities", "maintenance", "fuel", "equipment", 
    "marketing", "office", "professional_services", "insurance", 
    "rent", "employee_benefits", "other"
  ]),
  paymentMethod: z.enum(["cash", "card", "bank_transfer", "cheque", "petty_cash"]),
  vendor: z.string().min(1, "Vendor is required"),
  receiptNumber: z.string().optional(),
  notes: z.string().optional(),
  expenseDate: z.string().min(1, "Expense date is required"),
  isRecurring: z.boolean().default(false),
  requiresApproval: z.boolean().default(false)
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  paymentMethod: string;
  vendor: string;
  receiptNumber?: string;
  notes?: string;
  expenseDate: string;
  createdBy: string;
  approvalStatus: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
}

interface ExpenseSummary {
  todayTotal: number;
  weekTotal: number;
  monthTotal: number;
  pendingApproval: number;
  categoryBreakdown: Record<string, number>;
}

const categoryIcons = {
  supplies: <ShoppingCart className="h-4 w-4" />,
  utilities: <Zap className="h-4 w-4" />,
  maintenance: <Wrench className="h-4 w-4" />,
  fuel: <Truck className="h-4 w-4" />,
  equipment: <Wrench className="h-4 w-4" />,
  marketing: <FileText className="h-4 w-4" />,
  office: <FileText className="h-4 w-4" />,
  professional_services: <FileText className="h-4 w-4" />,
  insurance: <FileText className="h-4 w-4" />,
  rent: <FileText className="h-4 w-4" />,
  employee_benefits: <FileText className="h-4 w-4" />,
  other: <FileText className="h-4 w-4" />
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function ExpenseTracking() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("add");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");

  const form = useForm<any>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      category: "supplies",
      paymentMethod: "cash",
      expenseDate: format(new Date(), 'yyyy-MM-dd'),
      isRecurring: false,
      requiresApproval: false
    }
  });

  // Get expense summary
  const { data: expenseSummary } = useQuery<ExpenseSummary>({
    queryKey: ["/api/expenses/summary"],
    refetchInterval: 30000,
  });

  // Get expenses list
  const { data: expenses = [], isLoading } = useQuery<Expense[]>({
    queryKey: ["/api/expenses", { category: filterCategory, status: filterStatus }],
    refetchInterval: 30000,
  });

  // Create expense mutation
  const createExpenseMutation = useMutation({
    mutationFn: async (data: ExpenseFormData) => {
      return apiRequest("POST", "/api/expenses", {
        ...data,
        amount: parseFloat(data.amount),
        expenseDate: new Date(data.expenseDate).toISOString()
      });
    },
    onSuccess: () => {
      toast({
        title: "Expense Added Successfully",
        description: "The expense has been recorded and will be included in today's report.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/expenses/summary"] });
      form.reset({
        category: "supplies",
        paymentMethod: "cash",
        expenseDate: format(new Date(), 'yyyy-MM-dd'),
        isRecurring: false,
        requiresApproval: false
      });
      setActiveTab("list");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Add Expense",
        description: error.message || "Unable to record expense. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Approve expense mutation
  const approveExpenseMutation = useMutation({
    mutationFn: async (expenseId: string) => {
      return apiRequest("PUT", `/api/expenses/${expenseId}/approve`, {});
    },
    onSuccess: () => {
      toast({
        title: "Expense Approved",
        description: "The expense has been approved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/expenses/summary"] });
    }
  });

  const onSubmit = (data: ExpenseFormData) => {
    createExpenseMutation.mutate(data);
  };

  const filteredExpenses = expenses.filter(expense => {
    const categoryMatch = !filterCategory || expense.category === filterCategory;
    const statusMatch = !filterStatus || expense.approvalStatus === filterStatus;
    return categoryMatch && statusMatch;
  });

  return (
    <div className="space-y-6" data-testid="expense-tracking">
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="enhanced-card">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-muted-foreground">Today</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              ₹{expenseSummary?.todayTotal?.toLocaleString() || '0'}
            </div>
          </CardContent>
        </Card>
        
        <Card className="enhanced-card">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-muted-foreground">This Week</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              ₹{expenseSummary?.weekTotal?.toLocaleString() || '0'}
            </div>
          </CardContent>
        </Card>
        
        <Card className="enhanced-card">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-muted-foreground">This Month</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              ₹{expenseSummary?.monthTotal?.toLocaleString() || '0'}
            </div>
          </CardContent>
        </Card>
        
        <Card className="enhanced-card">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-muted-foreground">Pending</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">
              ₹{expenseSummary?.pendingApproval?.toLocaleString() || '0'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="enhanced-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Daily Expense Management
          </CardTitle>
          <CardDescription>
            Record and track all business expenses for accurate daily reporting
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="add" data-testid="tab-add-expense">Add Expense</TabsTrigger>
              <TabsTrigger value="list" data-testid="tab-expense-list">Expense List</TabsTrigger>
            </TabsList>
            
            <TabsContent value="add" className="space-y-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., Office supplies for store" data-testid="input-expense-description" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount (₹) *</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" step="0.01" placeholder="0.00" data-testid="input-expense-amount" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-expense-category">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="supplies">Office Supplies</SelectItem>
                              <SelectItem value="utilities">Utilities</SelectItem>
                              <SelectItem value="maintenance">Maintenance</SelectItem>
                              <SelectItem value="fuel">Fuel & Transport</SelectItem>
                              <SelectItem value="equipment">Equipment</SelectItem>
                              <SelectItem value="marketing">Marketing</SelectItem>
                              <SelectItem value="professional_services">Professional Services</SelectItem>
                              <SelectItem value="insurance">Insurance</SelectItem>
                              <SelectItem value="rent">Rent</SelectItem>
                              <SelectItem value="employee_benefits">Employee Benefits</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Method *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-payment-method">
                                <SelectValue placeholder="Select payment method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="cash">Cash</SelectItem>
                              <SelectItem value="card">Card</SelectItem>
                              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                              <SelectItem value="cheque">Cheque</SelectItem>
                              <SelectItem value="petty_cash">Petty Cash</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="vendor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vendor/Supplier *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., ABC Suppliers" data-testid="input-expense-vendor" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="receiptNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Receipt Number</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., RCP-001" data-testid="input-receipt-number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="expenseDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expense Date *</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" data-testid="input-expense-date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex items-center gap-4">
                      <FormField
                        control={form.control}
                        name="isRecurring"
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-2">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="rounded"
                                data-testid="checkbox-recurring"
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">Recurring Expense</FormLabel>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="requiresApproval"
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-2">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="rounded"
                                data-testid="checkbox-requires-approval"
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">Requires Approval</FormLabel>
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
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Additional notes about this expense..." rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button
                    type="submit"
                    disabled={createExpenseMutation.isPending}
                    className="w-full md:w-auto"
                    data-testid="button-add-expense"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {createExpenseMutation.isPending ? "Adding Expense..." : "Add Expense"}
                  </Button>
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="list" className="space-y-3">
              
              {/* Filters */}
              <div className="flex flex-wrap gap-4">
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    <SelectItem value="supplies">Office Supplies</SelectItem>
                    <SelectItem value="utilities">Utilities</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="fuel">Fuel & Transport</SelectItem>
                    <SelectItem value="equipment">Equipment</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Expense List */}
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                  <span className="ml-2">Loading expenses...</span>
                </div>
              ) : filteredExpenses.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No expenses found for the selected filters.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredExpenses.map((expense) => (
                    <Card key={expense.id} className="enhanced-card">
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              {categoryIcons[expense.category as keyof typeof categoryIcons]}
                              <h4 className="font-semibold">{expense.description}</h4>
                              <Badge className={getStatusColor(expense.approvalStatus)}>
                                {expense.approvalStatus}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                              <div>
                                <span className="font-medium">Amount:</span> ₹{expense.amount.toLocaleString()}
                              </div>
                              <div>
                                <span className="font-medium">Category:</span> {expense.category}
                              </div>
                              <div>
                                <span className="font-medium">Payment:</span> {expense.paymentMethod}
                              </div>
                              <div>
                                <span className="font-medium">Date:</span> {format(new Date(expense.expenseDate), 'MMM dd, yyyy')}
                              </div>
                              <div>
                                <span className="font-medium">Vendor:</span> {expense.vendor}
                              </div>
                              {expense.receiptNumber && (
                                <div>
                                  <span className="font-medium">Receipt:</span> {expense.receiptNumber}
                                </div>
                              )}
                            </div>
                            
                            {expense.notes && (
                              <p className="text-sm text-muted-foreground mt-2 p-2 bg-muted/50 rounded">
                                {expense.notes}
                              </p>
                            )}
                          </div>
                          
                          {expense.approvalStatus === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => approveExpenseMutation.mutate(expense.id)}
                              disabled={approveExpenseMutation.isPending}
                              data-testid={`button-approve-${expense.id}`}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Approve
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}