import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Plus, 
  Receipt, 
  TrendingUp, 
  Calendar, 
  Filter,
  Download,
  Eye,
  Edit,
  Check,
  X,
  AlertCircle,
  Building,
  Car,
  Wrench,
  Lightbulb,
  ShoppingCart,
  CreditCard,
  DollarSign,
  FileText,
  BarChart3,
  Users
} from "lucide-react";

interface Expense {
  id: string;
  category: string;
  finalAmount: number;
  description: string;
  createdAt: string;
  requestedBy: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  receiptUrl?: string;
  notes?: string;
  businessDate: string;
}

interface ExpenseCategory {
  id: string;
  name: string;
  icon: any;
  color: string;
  description: string;
}

const expenseCategories: ExpenseCategory[] = [
  { 
    id: 'office_supplies', 
    name: 'Office Supplies', 
    icon: FileText, 
    color: 'bg-blue-500',
    description: 'Stationery, printing, office materials' 
  },
  { 
    id: 'equipment', 
    name: 'Equipment', 
    icon: Wrench, 
    color: 'bg-green-500',
    description: 'Tools, machinery, equipment purchases' 
  },
  { 
    id: 'maintenance', 
    name: 'Maintenance', 
    icon: Car, 
    color: 'bg-orange-500',
    description: 'Facility and equipment maintenance' 
  },
  { 
    id: 'utilities', 
    name: 'Utilities', 
    icon: Lightbulb, 
    color: 'bg-yellow-500',
    description: 'Electricity, water, internet, phone' 
  },
  { 
    id: 'marketing', 
    name: 'Marketing', 
    icon: TrendingUp, 
    color: 'bg-purple-500',
    description: 'Advertising, promotional materials' 
  },
  { 
    id: 'inventory', 
    name: 'Inventory', 
    icon: ShoppingCart, 
    color: 'bg-red-500',
    description: 'Product inventory and supplies' 
  },
  { 
    id: 'facilities', 
    name: 'Facilities', 
    icon: Building, 
    color: 'bg-gray-500',
    description: 'Rent, security, facility costs' 
  },
  { 
    id: 'staff', 
    name: 'Staff Expenses', 
    icon: Users, 
    color: 'bg-indigo-500',
    description: 'Training, uniforms, staff costs' 
  }
];

export default function ExpenseManagementSystem() {
  const [activeTab, setActiveTab] = useState("add");
  const [newExpense, setNewExpense] = useState({
    category: '',
    finalAmount: '',
    description: '',
    notes: '',
    receiptUrl: ''
  });
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [dateRange, setDateRange] = useState("today");
  const { toast } = useToast();

  // Fetch expenses

const { data: expenses = [], isLoading } = useQuery<Expense[]>({
  queryKey:['/api/manager/expenses', { status: filterStatus, category: filterCategory }],
  queryFn: async () => {
    const res = await fetch('/api/job-cards?status=billing');
    if (!res.ok) throw new Error('Failed to fetch job cards');
    return res.json() as Promise<Expense[]>;
  },
  enabled: true
});
  // Fetch expense analytics
 
const { data: analytics = {},  } = useQuery<any>({
   queryKey: ['/api/manager/expenses/analytics', dateRange],
   queryFn: async () => {
    const res = await fetch('/api/job-cards?status=billing');
    if (!res.ok) throw new Error('Failed to fetch job cards');
    return res.json() as Promise<any[]>;
  },
  enabled: true
});
  // Add expense mutation
  const addExpenseMutation = useMutation({
    mutationFn: (expenseData: any) => apiRequest('POST','/api/manager/expenses', JSON.stringify(expenseData)),
    onSuccess: () => {
      toast({ title: "Expense added successfully!" });
      setNewExpense({ category: '', finalAmount: '', description: '', notes: '', receiptUrl: '' });
      setActiveTab("manage");
      queryClient.invalidateQueries({ queryKey: ['/api/manager/expenses', { status: filterStatus, category: filterCategory }] });
      queryClient.invalidateQueries({ queryKey: ['/api/manager/expenses/analytics', dateRange] });
    },
    onError: () => {
      toast({ title: "Failed to add expense", variant: "destructive" });
    }
  });

  // Approve/reject expense mutation
  const approvalMutation = useMutation({
    mutationFn: ({ id, action, notes }: { id: string; action: 'approve' | 'reject'; notes?: string }) =>
      apiRequest('POST',`/api/manager/expenses/${id}/${action}`,JSON.stringify({ notes, approvedBy: "manager" })),
    onSuccess: (_, variables) => {
      toast({ title: `Expense ${variables.action}d successfully!` });
      queryClient.invalidateQueries({ queryKey: ['/api/manager/expenses', { status: filterStatus, category: filterCategory }] });
      queryClient.invalidateQueries({ queryKey: ['/api/manager/expenses/analytics', dateRange] });
    },
    onError: () => {
      toast({ title: "Failed to process expense", variant: "destructive" });
    }
  });

  const addExpense = () => {
    if (!newExpense.category || !newExpense.finalAmount || !newExpense.description) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    const finalAmount = parseFloat(newExpense.finalAmount);
    if (finalAmount <= 0) {
      toast({ title: "Amount must be greater than zero", variant: "destructive" });
      return;
    }

    addExpenseMutation.mutate({
      ...newExpense,
      finalAmount,
      requestedBy: "manager",
      businessDate: new Date().toISOString().split('T')[0]
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const getCategoryInfo = (categoryId: string) => {
    return expenseCategories.find(cat => cat.id === categoryId) || {
      name: categoryId,
      icon: Receipt,
      color: 'bg-gray-500'
    };
  };

  const filteredExpenses = expenses.filter((expense: Expense) => {
    const statusMatch = filterStatus === "all" || expense.approvalStatus === filterStatus;
    const categoryMatch = filterCategory === "all" || expense.category === filterCategory;
    return statusMatch && categoryMatch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Expense Management</h2>
          <p className="text-muted-foreground">Track, approve, and analyze business expenses</p>
        </div>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-green-600" />
          <span className="text-lg font-semibold text-green-600">Financial Control</span>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-muted-foreground">Today's Expenses</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              ₹{analytics?.todayTotal?.toLocaleString() || '0'}
            </div>
            <div className="text-xs text-muted-foreground">
              {analytics?.todayCount || 0} transactions
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-muted-foreground">Pending Approval</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">
              {analytics?.pendingCount || 0}
            </div>
            <div className="text-xs text-muted-foreground">
              ₹{analytics?.pendingAmount?.toLocaleString() || '0'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-muted-foreground">This Month</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              ₹{analytics?.monthlyTotal?.toLocaleString() || '0'}
            </div>
            <div className="text-xs text-muted-foreground">
              {analytics?.monthlyCount || 0} expenses
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-muted-foreground">Avg Daily</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              ₹{analytics?.averageDaily?.toLocaleString() || '0'}
            </div>
            <div className="text-xs text-muted-foreground">
              Last 7 days
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="add" data-testid="tab-add-expense">Add Expense</TabsTrigger>
          <TabsTrigger value="manage" data-testid="tab-manage-expenses">Manage Expenses</TabsTrigger>
          <TabsTrigger value="reports" data-testid="tab-expense-reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add New Expense
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Category Selection */}
              <div>
                <Label className="text-base font-medium">Expense Category</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                  {expenseCategories.map((category) => {
                    const IconComponent = category.icon;
                    return (
                      <Card
                        key={category.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          newExpense.category === category.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                            : 'hover:border-gray-300'
                        }`}
                        onClick={() => setNewExpense(prev => ({ ...prev, category: category.id }))}
                        data-testid={`category-${category.id}`}
                      >
                        <CardContent className="p-3 text-center">
                          <div className={`w-8 h-8 rounded-full ${category.color} flex items-center justify-center mx-auto mb-2`}>
                            <IconComponent className="h-4 w-4 text-white" />
                          </div>
                          <div className="text-sm font-medium">{category.name}</div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Expense Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Amount (₹)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={newExpense.finalAmount}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, finalAmount: e.target.value }))}
                    data-testid="input-expense-amount"
                  />
                </div>
                <div>
                  <Label htmlFor="receipt">Receipt/Invoice</Label>
                  <Input
                    id="receipt"
                    placeholder="Receipt URL or number"
                    value={newExpense.receiptUrl}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, receiptUrl: e.target.value }))}
                    data-testid="input-receipt-url"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Brief description of the expense"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                  data-testid="input-expense-description"
                />
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional details or justification..."
                  value={newExpense.notes}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, notes: e.target.value }))}
                  data-testid="textarea-expense-notes"
                />
              </div>

              <Button
                onClick={addExpense}
                disabled={addExpenseMutation.isPending}
                className="w-full"
                size="lg"
                data-testid="button-submit-expense"
              >
                {addExpenseMutation.isPending ? 'Adding...' : 'Add Expense'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Expense Management
                </CardTitle>
                <div className="flex gap-2">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {expenseCategories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {isLoading ? (
                  <div className="text-center py-8">Loading expenses...</div>
                ) : filteredExpenses.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No expenses found matching your filters
                  </div>
                ) : (
                  filteredExpenses.map((expense: Expense) => {
                    const categoryInfo = getCategoryInfo(expense.category);
                    const IconComponent = categoryInfo.icon;
                    
                    return (
                      <Card key={expense.id} className="transition-all hover:shadow-md">
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-full ${categoryInfo.color}`}>
                                <IconComponent className="h-4 w-4 text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold">{expense.description}</h3>
                                  {getStatusBadge(expense.approvalStatus)}
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {categoryInfo.name} • {new Date(expense.createdAt).toLocaleDateString()} • By {expense.requestedBy}
                                </p>
                                {expense.notes && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{expense.notes}</p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold">₹{expense.finalAmount.toLocaleString()}</div>
                              {expense.approvalStatus === 'pending' && (
                                <div className="flex gap-1 mt-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => approvalMutation.mutate({ id: expense.id, action: 'approve' })}
                                    disabled={approvalMutation.isPending}
                                    data-testid={`button-approve-${expense.id}`}
                                  >
                                    <Check className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => approvalMutation.mutate({ id: expense.id, action: 'reject' })}
                                    disabled={approvalMutation.isPending}
                                    data-testid={`button-reject-${expense.id}`}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {expenseCategories.map(category => {
                    const categoryExpenses = expenses.filter((e: Expense) => e.category === category.id);
                    const total = categoryExpenses.reduce((sum: number, e: Expense) => sum + e.finalAmount, 0);
                    const IconComponent = category.icon;
                    
                    return (
                      <div key={category.id} className="flex items-center justify-between p-2 rounded">
                        <div className="flex items-center gap-2">
                          <div className={`p-1 rounded ${category.color}`}>
                            <IconComponent className="h-3 w-3 text-white" />
                          </div>
                          <span className="text-sm">{category.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold">₹{total.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">{categoryExpenses.length} items</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" data-testid="button-export-expenses">
                  <Download className="h-4 w-4 mr-2" />
                  Export Monthly Report
                </Button>
                <Button variant="outline" className="w-full justify-start" data-testid="button-pending-summary">
                  <Eye className="h-4 w-4 mr-2" />
                  View Pending Summary
                </Button>
                <Button variant="outline" className="w-full justify-start" data-testid="button-budget-analysis">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Budget Analysis
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}