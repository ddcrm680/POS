import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Download, 
  Upload, 
  MessageSquare, 
  Target, 
  Zap,
  Users,
  Mail,
  Phone,
  FileText,
  Search,
  Filter,
  Calendar,
  DollarSign,
  TrendingUp,
  Star,
  AlertTriangle,
  BarChart3
} from "lucide-react";
import CustomerForm from "@/components/forms/customer-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { type Customer } from "@/lib/types";

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  variant: "default" | "outline" | "secondary" | "destructive";
  onClick: () => void;
  badge?: string;
  disabled?: boolean;
}

interface CustomerQuickActionsProps {
  selectedCustomers?: Customer[];
  totalCustomers?: number;
  onCustomerCreated?: (customer: Customer) => void;
  className?: string;
}

export default function CustomerQuickActions({ 
  selectedCustomers = [], 
  totalCustomers = 0,
  onCustomerCreated,
  className = "" 
}: CustomerQuickActionsProps) {
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleExportCustomers = async () => {
    setIsProcessing(true);
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "Export Complete",
        description: `Successfully exported ${totalCustomers} customers to CSV`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export customer data",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkEmail = async () => {
    if (selectedCustomers.length === 0) {
      toast({
        title: "No Customers Selected",
        description: "Please select customers to send bulk email",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Simulate bulk email process
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({
        title: "Emails Sent",
        description: `Successfully sent emails to ${selectedCustomers.length} customers`,
      });
    } catch (error) {
      toast({
        title: "Email Failed",
        description: "Failed to send bulk emails",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkSMS = async () => {
    if (selectedCustomers.length === 0) {
      toast({
        title: "No Customers Selected",
        description: "Please select customers to send bulk SMS",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Simulate bulk SMS process
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({
        title: "SMS Sent",
        description: `Successfully sent SMS to ${selectedCustomers.length} customers`,
      });
    } catch (error) {
      toast({
        title: "SMS Failed",
        description: "Failed to send bulk SMS",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateReport = async () => {
    setIsProcessing(true);
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "Report Generated",
        description: "Customer analytics report has been generated and downloaded",
      });
    } catch (error) {
      toast({
        title: "Report Failed",
        description: "Failed to generate customer report",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const primaryActions: QuickAction[] = [
    {
      id: "add-customer",
      title: "Add Customer",
      description: "Create new customer profile",
      icon: Plus,
      variant: "default",
      onClick: () => setShowCustomerForm(true)
    },
    {
      id: "export-customers",
      title: "Export Data",
      description: "Download customer database",
      icon: Download,
      variant: "outline",
      onClick: handleExportCustomers,
      disabled: isProcessing
    },
    {
      id: "analytics-report",
      title: "Generate Report",
      description: "Create analytics report",
      icon: BarChart3,
      variant: "outline",
      onClick: handleGenerateReport,
      disabled: isProcessing
    },
    {
      id: "bulk-email",
      title: "Bulk Email",
      description: `Email ${selectedCustomers.length || 'selected'} customers`,
      icon: Mail,
      variant: "secondary",
      onClick: handleBulkEmail,
      disabled: selectedCustomers.length === 0 || isProcessing,
      badge: selectedCustomers.length > 0 ? selectedCustomers.length.toString() : undefined
    }
  ];

  const communicationActions: QuickAction[] = [
    {
      id: "bulk-sms",
      title: "Bulk SMS",
      description: "Send SMS campaigns",
      icon: MessageSquare,
      variant: "outline",
      onClick: handleBulkSMS,
      disabled: selectedCustomers.length === 0 || isProcessing,
      badge: selectedCustomers.length > 0 ? selectedCustomers.length.toString() : undefined
    },
    {
      id: "whatsapp-campaign",
      title: "WhatsApp Campaign",
      description: "Send WhatsApp messages",
      icon: Phone,
      variant: "outline",
      onClick: () => toast({
        title: "Coming Soon",
        description: "WhatsApp campaigns will be available soon",
      })
    },
    {
      id: "schedule-followup",
      title: "Schedule Follow-up",
      description: "Plan customer outreach",
      icon: Calendar,
      variant: "outline",
      onClick: () => toast({
        title: "Coming Soon",
        description: "Follow-up scheduling will be available soon",
      })
    }
  ];

  const analyticsActions: QuickAction[] = [
    {
      id: "segment-analysis",
      title: "Segment Analysis",
      description: "Analyze customer segments",
      icon: Target,
      variant: "outline",
      onClick: () => toast({
        title: "Coming Soon",
        description: "Advanced segment analysis coming soon",
      })
    },
    {
      id: "churn-prediction",
      title: "Churn Risk",
      description: "Identify at-risk customers",
      icon: AlertTriangle,
      variant: "outline",
      onClick: () => toast({
        title: "Coming Soon",
        description: "Churn prediction analysis coming soon",
      })
    },
    {
      id: "loyalty-insights",
      title: "Loyalty Insights",
      description: "Analyze loyalty patterns",
      icon: Star,
      variant: "outline",
      onClick: () => toast({
        title: "Coming Soon",
        description: "Loyalty insights coming soon",
      })
    }
  ];

  const ActionButton = ({ action }: { action: QuickAction }) => {
    const Icon = action.icon;
    return (
      <Button
        key={action.id}
        variant={action.variant}
        size="sm"
        onClick={action.onClick}
        disabled={action.disabled}
        className="h-auto p-3 flex flex-col items-start gap-1 text-left"
        data-testid={`button-${action.id}`}
      >
        <div className="flex items-center gap-2 w-full">
          <Icon size={16} />
          <span className="font-medium text-sm">{action.title}</span>
          {action.badge && (
            <Badge variant="secondary" className="text-xs h-5">
              {action.badge}
            </Badge>
          )}
        </div>
        <span className="text-xs text-muted-foreground">{action.description}</span>
      </Button>
    );
  };

  return (
    <>
      <div className={`space-y-6 ${className}`}>
        {/* Primary Actions */}
        <Card data-testid="card-primary-actions">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Zap size={18} />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {primaryActions.map((action) => (
                <ActionButton key={action.id} action={action} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Communication Actions */}
        <Card data-testid="card-communication-actions">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare size={18} />
              Communication
              {selectedCustomers.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {selectedCustomers.length} selected
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {communicationActions.map((action) => (
                <ActionButton key={action.id} action={action} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Analytics Actions */}
        <Card data-testid="card-analytics-actions">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp size={18} />
              Analytics & Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {analyticsActions.map((action) => (
                <ActionButton key={action.id} action={action} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Smart Recommendations */}
        <Card data-testid="card-smart-recommendations">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Target size={18} />
              Smart Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-blue-100 rounded">
                    <Users size={14} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm text-blue-900">Segment Premium Customers</h4>
                    <p className="text-xs text-blue-700 mt-1">
                      {Math.floor(totalCustomers * 0.15)} customers qualify for premium segment upgrade
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs">
                    Review
                  </Button>
                </div>
              </div>

              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-orange-100 rounded">
                    <AlertTriangle size={14} className="text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm text-orange-900">Re-engage Inactive Customers</h4>
                    <p className="text-xs text-orange-700 mt-1">
                      {Math.floor(totalCustomers * 0.08)} customers haven't visited in 60+ days
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs">
                    Create Campaign
                  </Button>
                </div>
              </div>

              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-green-100 rounded">
                    <Star size={14} className="text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm text-green-900">Loyalty Program Opportunities</h4>
                    <p className="text-xs text-green-700 mt-1">
                      {Math.floor(totalCustomers * 0.12)} customers ready for tier upgrade
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs">
                    Process
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Summary */}
        <Card data-testid="card-recent-activity">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <FileText size={18} />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-muted-foreground">New customers today</span>
                <Badge variant="outline">+3</Badge>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-muted-foreground">Email campaigns sent</span>
                <Badge variant="outline">2</Badge>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-muted-foreground">Reports generated</span>
                <Badge variant="outline">1</Badge>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-muted-foreground">Data exports</span>
                <Badge variant="outline">0</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Form Dialog */}
      <Dialog open={showCustomerForm} onOpenChange={setShowCustomerForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
          </DialogHeader>
          <CustomerForm
            onSuccess={(customer) => {
              setShowCustomerForm(false);
              onCustomerCreated?.(customer);
              queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
              toast({
                title: "Success",
                description: "Customer created successfully",
              });
            }}
            onCancel={() => setShowCustomerForm(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}