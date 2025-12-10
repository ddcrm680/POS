import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  CheckCircle2, 
  Circle, 
  AlertTriangle,
  DollarSign,
  Package,
  Shield,
  FileText,
  Clock,
  Users,
  TrendingUp,
  Calculator,
  Building,
  ChevronRight,
  CheckSquare
} from "lucide-react";

interface EODStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  required: boolean;
  completed: boolean;
  data?: any;
}

interface EODChecklist {
  id: string;
  businessDate: string;
  overallProgress: number;
  isCompleted: boolean;
  completedBy?: string;
  completedAt?: string;
  steps: EODStep[];
}

const eodStepTemplates = [
  {
    id: 'cash_reconciliation',
    title: 'Cash Reconciliation',
    description: 'Count physical cash and match with system records',
    icon: DollarSign,
    required: true,
    fields: ['physicalCash', 'systemCash', 'variance', 'notes']
  },
  {
    id: 'inventory_verification',
    title: 'Inventory Check',
    description: 'Verify critical inventory levels and secure storage',
    icon: Package,
    required: true,
    fields: ['criticalItems', 'shortages', 'securityCheck']
  },
  {
    id: 'equipment_security',
    title: 'Equipment & Security',
    description: 'Lock equipment, arm security systems, check facility',
    icon: Shield,
    required: true,
    fields: ['equipmentSecured', 'alarmsSet', 'facilityClosed']
  },
  {
    id: 'daily_reporting',
    title: 'Daily Report Generation',
    description: 'Generate and review daily business summary',
    icon: FileText,
    required: true,
    fields: ['revenueReview', 'expenseReview', 'reportGenerated']
  },
  {
    id: 'staff_handover',
    title: 'Staff Management',
    description: 'Confirm all staff clocked out and handover complete',
    icon: Users,
    required: true,
    fields: ['staffClockout', 'handoverNotes', 'nextDayPrep']
  },
  {
    id: 'performance_review',
    title: 'Performance Summary',
    description: 'Review daily KPIs and performance metrics',
    icon: TrendingUp,
    required: false,
    fields: ['kpiReview', 'performanceNotes', 'improvementPlan']
  }
];

export default function EODWorkflowSystem() {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepData, setStepData] = useState<Record<string, any>>({});
  const { toast } = useToast();

  // Get today's date for EOD
  const today = new Date().toISOString().split('T')[0];

  // Fetch EOD status
  const { data: eodStatus, isLoading } = useQuery({
    queryKey: ['/api/manager/eod/status', today],
    enabled: true
  });

  // Initialize EOD checklist
  const [checklist, setChecklist] = useState<EODChecklist>({
    id: `eod-${today}`,
    businessDate: today,
    overallProgress: 0,
    isCompleted: false,
    steps: eodStepTemplates.map(template => ({
      ...template,
      completed: false,
      data: {}
    }))
  });

  // Update step completion
  const updateStepMutation = useMutation({
    mutationFn: (data: { stepId: string; stepData: any; completed: boolean }) =>
      apiRequest('POST','/api/manager/eod/update-step',JSON.stringify({
          businessDate: today,
          ...data
        })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/manager/eod/status', today] });
    }
  });

  // Complete entire EOD process
  const completeEODMutation = useMutation({
    mutationFn: () =>
      apiRequest('POST','/api/manager/eod/complete',JSON.stringify({
          businessDate: today,
          completedBy: "manager",
          checklistData: checklist
        })),
    onSuccess: () => {
      toast({ title: "EOD procedures completed successfully!" });
      queryClient.invalidateQueries({ queryKey: ['/api/manager/eod/status', today] });
    },
    onError: () => {
      toast({ title: "Failed to complete EOD procedures", variant: "destructive" });
    }
  });

  const updateStepData = (stepId: string, field: string, value: any) => {
    setStepData(prev => ({
      ...prev,
      [stepId]: {
        ...prev[stepId],
        [field]: value
      }
    }));
  };

  const completeStep = (stepIndex: number) => {
    const step = checklist.steps[stepIndex];
    const data = stepData[step.id] || {};
    
    // Mark step as completed
    const updatedSteps = [...checklist.steps];
    updatedSteps[stepIndex] = { ...step, completed: true, data };
    
    const completedCount = updatedSteps.filter(s => s.completed).length;
    const totalRequired = updatedSteps.filter(s => s.required).length;
    const progress = (completedCount / updatedSteps.length) * 100;
    
    setChecklist(prev => ({
      ...prev,
      steps: updatedSteps,
      overallProgress: progress,
      isCompleted: completedCount >= totalRequired
    }));

    // Update backend
    updateStepMutation.mutate({
      stepId: step.id,
      stepData: data,
      completed: true
    });

    // Move to next step
    if (stepIndex < checklist.steps.length - 1) {
      setCurrentStep(stepIndex + 1);
    }

    toast({ title: `${step.title} completed` });
  };

  const renderStepContent = (step: EODStep, stepIndex: number) => {
    const IconComponent = step.icon;
    const data = stepData[step.id] || {};

    return (
      <Card className={`${step.completed ? 'border-green-500 bg-green-50 dark:bg-green-950' : ''}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${step.completed ? 'bg-green-500' : 'bg-blue-500'}`}>
              <IconComponent className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                {step.title}
                {step.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                {step.completed && <CheckCircle2 className="h-5 w-5 text-green-500" />}
              </div>
              <p className="text-sm text-muted-foreground font-normal">{step.description}</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {step.id === 'cash_reconciliation' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Physical Cash Count</Label>
                  <Input
                    type="number"
                    placeholder="₹0.00"
                    value={data.physicalCash || ''}
                    onChange={(e) => updateStepData(step.id, 'physicalCash', e.target.value)}
                    data-testid="input-physical-cash"
                  />
                </div>
                <div>
                  <Label>System Cash Balance</Label>
                  <Input
                    type="number"
                    placeholder="₹0.00"
                    value={data.systemCash || ''}
                    onChange={(e) => updateStepData(step.id, 'systemCash', e.target.value)}
                    data-testid="input-system-cash"
                  />
                </div>
              </div>
              {data.physicalCash && data.systemCash && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="flex justify-between">
                    <span>Variance:</span>
                    <span className={`font-bold ${
                      Math.abs(parseFloat(data.physicalCash) - parseFloat(data.systemCash)) > 100 
                        ? 'text-red-600' : 'text-green-600'
                    }`}>
                      ₹{(parseFloat(data.physicalCash) - parseFloat(data.systemCash)).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
              <Textarea
                placeholder="Add notes about cash reconciliation..."
                value={data.notes || ''}
                onChange={(e) => updateStepData(step.id, 'notes', e.target.value)}
                data-testid="textarea-cash-notes"
              />
            </div>
          )}

          {step.id === 'inventory_verification' && (
            <div className="space-y-4">
              <div>
                <Label>Critical Items Check</Label>
                <Textarea
                  placeholder="List any critical inventory items that need attention..."
                  value={data.criticalItems || ''}
                  onChange={(e) => updateStepData(step.id, 'criticalItems', e.target.value)}
                  data-testid="textarea-critical-items"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="security-check"
                  checked={data.securityCheck || false}
                  onChange={(e) => updateStepData(step.id, 'securityCheck', e.target.checked)}
                  data-testid="checkbox-security-check"
                />
                <Label htmlFor="security-check">Storage areas properly secured</Label>
              </div>
            </div>
          )}

          {step.id === 'equipment_security' && (
            <div className="space-y-4">
              <div className="space-y-3">
                {[
                  { id: 'equipmentSecured', label: 'All equipment powered down and secured' },
                  { id: 'alarmsSet', label: 'Security alarms activated' },
                  { id: 'facilityClosed', label: 'Facility properly locked and secured' }
                ].map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={item.id}
                      checked={data[item.id] || false}
                      onChange={(e) => updateStepData(step.id, item.id, e.target.checked)}
                      data-testid={`checkbox-${item.id}`}
                    />
                    <Label htmlFor={item.id}>{item.label}</Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step.id === 'daily_reporting' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="revenue-review"
                    checked={data.revenueReview || false}
                    onChange={(e) => updateStepData(step.id, 'revenueReview', e.target.checked)}
                    data-testid="checkbox-revenue-review"
                  />
                  <Label htmlFor="revenue-review">Daily revenue reviewed</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="expense-review"
                    checked={data.expenseReview || false}
                    onChange={(e) => updateStepData(step.id, 'expenseReview', e.target.checked)}
                    data-testid="checkbox-expense-review"
                  />
                  <Label htmlFor="expense-review">Expenses verified</Label>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => updateStepData(step.id, 'reportGenerated', true)}
                disabled={data.reportGenerated}
                data-testid="button-generate-report"
              >
                {data.reportGenerated ? 'Report Generated' : 'Generate Daily Report'}
              </Button>
            </div>
          )}

          {step.id === 'staff_handover' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="staff-clockout"
                  checked={data.staffClockout || false}
                  onChange={(e) => updateStepData(step.id, 'staffClockout', e.target.checked)}
                  data-testid="checkbox-staff-clockout"
                />
                <Label htmlFor="staff-clockout">All staff properly clocked out</Label>
              </div>
              <Textarea
                placeholder="Handover notes for next shift..."
                value={data.handoverNotes || ''}
                onChange={(e) => updateStepData(step.id, 'handoverNotes', e.target.value)}
                data-testid="textarea-handover-notes"
              />
            </div>
          )}

          {step.id === 'performance_review' && (
            <div className="space-y-4">
              <Textarea
                placeholder="Daily performance notes and insights..."
                value={data.performanceNotes || ''}
                onChange={(e) => updateStepData(step.id, 'performanceNotes', e.target.value)}
                data-testid="textarea-performance-notes"
              />
            </div>
          )}

          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-muted-foreground">
              Step {stepIndex + 1} of {checklist.steps.length}
            </div>
            <Button
              onClick={() => completeStep(stepIndex)}
              disabled={step.completed || updateStepMutation.isPending}
              data-testid={`button-complete-step-${step.id}`}
            >
              {step.completed ? 'Completed' : 'Mark Complete'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">End of Day Procedures</h2>
          <p className="text-muted-foreground">Complete all required steps before closing</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={checklist.isCompleted ? "default" : "secondary"}>
            {checklist.isCompleted ? "Completed" : "In Progress"}
          </Badge>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Progress</div>
            <div className="text-lg font-bold">{Math.round(checklist.overallProgress)}%</div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Clock className="h-5 w-5 text-blue-600" />
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Progress</span>
                <span>{checklist.steps.filter(s => s.completed).length} of {checklist.steps.length} completed</span>
              </div>
              <Progress value={checklist.overallProgress} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Navigation */}
      <Card>
        <CardHeader>
          <CardTitle>Checklist Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {checklist.steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <Button
                  key={step.id}
                  variant={currentStep === index ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentStep(index)}
                  className="justify-start"
                  data-testid={`nav-step-${step.id}`}
                >
                  {step.completed ? (
                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                  ) : (
                    <IconComponent className="h-4 w-4 mr-2" />
                  )}
                  <span className="truncate">{step.title}</span>
                  {step.required && <span className="text-red-500 ml-1">*</span>}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Current Step */}
      <div>
        {renderStepContent(checklist.steps[currentStep], currentStep)}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          data-testid="button-previous-step"
        >
          Previous Step
        </Button>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.min(checklist.steps.length - 1, currentStep + 1))}
            disabled={currentStep === checklist.steps.length - 1}
            data-testid="button-next-step"
          >
            Next Step
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
          
          {checklist.isCompleted && (
            <Button
              onClick={() => completeEODMutation.mutate()}
              disabled={completeEODMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
              data-testid="button-finalize-eod"
            >
              <CheckSquare className="h-4 w-4 mr-2" />
              Finalize EOD
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}