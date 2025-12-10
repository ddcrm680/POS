import { 
  UserCheck, 
  Star, 
  ArrowUp, 
  AlertTriangle, 
  MoveRight, 
  Settings, 
  Users, 
  Shield,
  CreditCard,
  FileCheck,
  Banknote,
  Receipt,
  Clock,
  Send,
  ListTodo,
  Calendar
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { useLocation } from "wouter";

interface QuickAction {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  category: 'customer' | 'staff' | 'financial' | 'daily';
  color: string;
  action: () => void;
  requiresAuth?: boolean;
  description: string;
}

export default function QuickActionsGrid() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  // Quick Payment Mutation
  const quickPaymentMutation = useMutation({
    mutationFn: (data: { jobCardId: string; amount: number; paymentMethod: string; recordedBy: string }) =>
      apiRequest('POST', '/api/manager/quick-payment', data),
    onSuccess: () => {
      toast({
        title: "Payment Processed",
        description: "Quick payment has been recorded successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/manager/dashboard-metrics'] });
    },
    onError: () => {
      toast({
        title: "Payment Failed",
        description: "Failed to process payment. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Expense Approval Mutation
  const approveExpenseMutation = useMutation({
    mutationFn: (data: { expenseId: string; approvedBy: string }) =>
      apiRequest('POST', `/api/manager/approve-expense/${data.expenseId}`, { approvedBy: data.approvedBy }),
    onSuccess: () => {
      toast({
        title: "Expense Approved",
        description: "Staff expense has been approved successfully"
      });
    }
  });

  // Priority Move Mutation
  const moveJobPriorityMutation = useMutation({
    mutationFn: (data: { jobCardId: string; newStatus: string; reason: string }) =>
      apiRequest('POST', '/api/manager/move-job-priority', data),
    onSuccess: () => {
      toast({
        title: "Job Priority Updated",
        description: "Job has been moved to priority queue"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/job-cards'] });
    }
  });

  const quickActions: QuickAction[] = [
    // Appointment Management
    {
      id: 'appointments-today',
      title: 'Today\'s Appointments',
      icon: Calendar,
      category: 'daily',
      color: 'bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
      description: 'View and manage today\'s scheduled appointments',
      action: () => {
        setLocation('/appointments');
      }
    },
    {
      id: 'new-appointment',
      title: 'New Appointment',
      icon: Clock,
      category: 'customer',
      color: 'bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
      description: 'Schedule new customer appointment',
      action: () => {
        setLocation('/appointments');
        // Could add a query parameter to open create dialog
      }
    },
    // Customer Operations
    {
      id: 'walk-in-entry',
      title: 'Walk-in Entry',
      icon: UserCheck,
      category: 'customer',
      color: 'bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      description: 'Lightning-fast customer registration and service booking',
      action: () => {
        setLocation('/walk-in-entry');
      }
    },
    {
      id: 'vip-alert',
      title: 'VIP Alert',
      icon: Star,
      category: 'customer',
      color: 'bg-gradient-to-br from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700',
      description: 'Flag VIP customer arrival',
      action: () => {
        toast({
          title: "VIP Alert System",
          description: "VIP customer notification system activated"
        });
      }
    },
    {
      id: 'priority-service',
      title: 'Priority Service',
      icon: ArrowUp,
      category: 'customer',
      color: 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
      description: 'Skip queue for urgent jobs',
      action: () => {
        setIsLoading('priority-service');
        // Show toast for now, implement job selection modal in future
        setTimeout(() => {
          toast({
            title: "Priority Service",
            description: "Please select a job from the job cards page to move to priority queue",
            variant: "default"
          });
          setLocation('/job-cards');
          setIsLoading(null);
        }, 500);
      }
    },
    {
      id: 'customer-issue',
      title: 'Customer Issue',
      icon: AlertTriangle,
      category: 'customer',
      color: 'bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
      description: 'Quick complaint resolution',
      action: () => {
        setLocation('/customers');
      }
    },

    // Staff & Operations
    {
      id: 'move-job-forward',
      title: 'Move Job Forward',
      icon: MoveRight,
      category: 'staff',
      color: 'bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
      description: 'Bypass normal queue for priority',
      action: () => {
        setLocation('/job-cards');
      }
    },
    {
      id: 'equipment-override',
      title: 'Equipment Override',
      icon: Settings,
      category: 'staff',
      color: 'bg-gradient-to-br from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700',
      description: 'Emergency equipment use approval',
      action: () => {
        toast({
          title: "Equipment Override",
          description: "Equipment override authorization panel opened"
        });
      }
    },
    {
      id: 'staff-reassign',
      title: 'Staff Reassign',
      icon: Users,
      category: 'staff',
      color: 'bg-gradient-to-br from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700',
      description: 'Quick staff reallocation',
      action: () => {
        toast({
          title: "Staff Management",
          description: "Staff reassignment panel opened"
        });
      }
    },
    {
      id: 'quality-approve',
      title: 'Quality Approve',
      icon: Shield,
      category: 'staff',
      color: 'bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
      description: 'Instant job quality verification',
      action: () => {
        setLocation('/job-cards');
      }
    },

    // Financial Actions
    {
      id: 'quick-payment',
      title: 'Quick Payment',
      icon: CreditCard,
      category: 'financial',
      color: 'bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700',
      description: 'Fast payment recording',
      action: () => {
        setIsLoading('quick-payment');
        // Show toast for now, implement payment modal in future
        setTimeout(() => {
          toast({
            title: "Quick Payment",
            description: "Please go to payments page to process customer payments",
            variant: "default"
          });
          setLocation('/payments');
          setIsLoading(null);
        }, 500);
      }
    },
    {
      id: 'approve-expense',
      title: 'Approve Expense',
      icon: FileCheck,
      category: 'financial',
      color: 'bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700',
      description: 'One-click staff expense approval',
      action: () => {
        setLocation('/expenses');
      }
    },
    {
      id: 'cash-count',
      title: 'Cash Count',
      icon: Banknote,
      category: 'financial',
      color: 'bg-gradient-to-br from-lime-500 to-lime-600 hover:from-lime-600 hover:to-lime-700',
      description: 'Quick cash drawer reconciliation',
      action: () => {
        toast({
          title: "Cash Count",
          description: "Cash reconciliation panel opened"
        });
      }
    },
    {
      id: 'discount-auth',
      title: 'Discount Auth',
      icon: Receipt,
      category: 'financial',
      color: 'bg-gradient-to-br from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700',
      description: 'On-spot discount authorization',
      action: () => {
        toast({
          title: "Discount Authorization",
          description: "Discount approval system activated"
        });
      }
    },

    // Daily Management
    {
      id: 'eod-start',
      title: 'EOD Start',
      icon: Clock,
      category: 'daily',
      color: 'bg-gradient-to-br from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700',
      description: 'Begin end-of-day procedures',
      action: () => {
        toast({
          title: "End of Day",
          description: "EOD procedures initiated"
        });
      }
    },
    {
      id: 'hq-report',
      title: 'HQ Report',
      icon: Send,
      category: 'daily',
      color: 'bg-gradient-to-br from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700',
      description: 'Send daily report to headquarters',
      action: () => {
        setLocation('/reports');
      }
    },
    {
      id: 'task-assign',
      title: 'Task Assign',
      icon: ListTodo,
      category: 'daily',
      color: 'bg-gradient-to-br from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700',
      description: 'Delegate tasks to staff',
      action: () => {
        toast({
          title: "Task Assignment",
          description: "Task delegation panel opened"
        });
      }
    },
    {
      id: 'schedule-override',
      title: 'Schedule Override',
      icon: Calendar,
      category: 'daily',
      color: 'bg-gradient-to-br from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700',
      description: 'Emergency schedule changes',
      action: () => {
        toast({
          title: "Schedule Override",
          description: "Schedule management panel opened"
        });
      }
    }
  ];

  const categories = [
    { key: 'customer', title: 'Customer Operations', actions: quickActions.filter(a => a.category === 'customer') },
    { key: 'staff', title: 'Staff & Operations', actions: quickActions.filter(a => a.category === 'staff') },
    { key: 'financial', title: 'Financial Actions', actions: quickActions.filter(a => a.category === 'financial') },
    { key: 'daily', title: 'Daily Management', actions: quickActions.filter(a => a.category === 'daily') }
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListTodo className="h-5 w-5 text-blue-500" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {categories.map((category) => (
          <div key={category.key} className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {category.title}
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {category.actions.map((action) => {
                const Icon = action.icon;
                const isActionLoading = isLoading === action.id;
                
                return (
                  <Button
                    key={action.id}
                    onClick={action.action}
                    disabled={isActionLoading}
                    className={`${action.color} text-white h-20 flex flex-col items-center justify-center 
                               text-xs font-medium shadow-lg hover:shadow-xl transform hover:scale-105 
                               transition-all duration-200 active:scale-95 border-0`}
                    data-testid={`quick-action-${action.id}`}
                  >
                    {isActionLoading ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        <Icon size={20} className="mb-1" />
                        <span className="text-center leading-tight">{action.title}</span>
                      </>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}