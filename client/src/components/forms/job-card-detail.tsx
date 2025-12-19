import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { type JobCard, type Customer, type Vehicle } from "@/lib/types";
import { 
  Car, 
  User, 
  Key, 
  MapPin, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  DollarSign,
  Package,
  Calendar,
  Phone,
  Mail,
  Loader2,
  ClipboardCheck,
  ExternalLink,
  History,
  CreditCard,
  Wrench
} from "lucide-react";
import { Link } from "wouter";
import SOPDrawer from "./sop-drawer";
import SOPOverrideModal from "./sop-override-modal";
import { getSOPTemplate, type SOPStep } from "@/lib/sop-templates";
import { format, differenceInHours, isPast } from "date-fns";

interface JobCardDetailProps {
  jobCardId: string;
  onStatusUpdate?: (jobCard: JobCard) => void;
  onClose?: () => void;
}

// Status configurations with colors and next status
type StatusKey = 'check-in' | 'inspect' | 'prep' | 'service' | 'qc' | 'billing' | 'pickup';

const statusConfig: Record<StatusKey, {
  label: string;
  color: string;
  next: StatusKey | null;
  progress: number;
}> = {
  'check-in': { 
    label: 'Check-In', 
    color: 'bg-blue-500', 
    next: 'inspect',
    progress: 14
  },
  'inspect': { 
    label: 'Inspect', 
    color: 'bg-yellow-500', 
    next: 'prep',
    progress: 28
  },
  'prep': { 
    label: 'Prep', 
    color: 'bg-orange-500', 
    next: 'service',
    progress: 42
  },
  'service': { 
    label: 'Service', 
    color: 'bg-purple-500', 
    next: 'qc',
    progress: 57
  },
  'qc': { 
    label: 'Quality Check', 
    color: 'bg-indigo-500', 
    next: 'billing',
    progress: 71
  },
  'billing': { 
    label: 'Billing', 
    color: 'bg-green-500', 
    next: 'pickup',
    progress: 85
  },
  'pickup': { 
    label: 'Ready for Pickup', 
    color: 'bg-emerald-500', 
    next: null,
    progress: 100
  }
};

// Helper function to safely get status config
const getStatusConfig = (status: string | null | undefined) => {
  if (!status || !(status in statusConfig)) {
    return statusConfig['check-in']; // fallback to check-in
  }
  return statusConfig[status as StatusKey];
};

export default function JobCardDetail({ jobCardId, onStatusUpdate, onClose }: JobCardDetailProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showSOPOverride, setShowSOPOverride] = useState(false);
  const [incompleteRequiredSteps, setIncompleteRequiredSteps] = useState<SOPStep[]>([]);
  const [isProcessingOverride, setIsProcessingOverride] = useState(false);

  // Fetch job card details
  const { data: jobCard, isLoading } = useQuery<JobCard>({
    queryKey: ["/api/job-cards", jobCardId],
    enabled: !!jobCardId,
  });

  // Fetch customer details
  const { data: customer } = useQuery<Customer>({
    queryKey: ["/api/customers", jobCard?.customerId],
    enabled: !!jobCard?.customerId,
  });

  // Fetch vehicle details
  const { data: vehicle } = useQuery<Vehicle>({
    queryKey: ["/api/vehicles", jobCard?.vehicleId],
    enabled: !!jobCard?.vehicleId,
  });
  
  // Fetch customer service history for interlinking
  const { data: customerHistory } = useQuery({
    queryKey: ["/api/customers", jobCard?.customerId, "service-history"],
    enabled: !!jobCard?.customerId,
  });
  
  // Fetch vehicle service history for interlinking
  const { data: vehicleHistory } = useQuery({
    queryKey: ["/api/vehicles", jobCard?.vehicleId, "service-history"],
    enabled: !!jobCard?.vehicleId,
  });
  
  // Fetch job validation data for workflow interlinking
  const { data: jobValidation } = useQuery({
    queryKey: ["/api/job-cards", jobCardId, "validation"],
    enabled: !!jobCardId,
    refetchInterval: 30000, // Refresh every 30 seconds for real-time status
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      const response = await apiRequest("PUT", `/api/job-cards/${jobCardId}/status`, {
        status: newStatus
      });
      return response.json();
    },
    onSuccess: (updatedJobCard) => {
      const statusInfo = getStatusConfig(updatedJobCard.serviceStatus);
      toast({
        title: "Status Updated",
        description: `Job card moved to ${statusInfo.label}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/job-cards"] });
      onStatusUpdate?.(updatedJobCard);
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    },
  });

  const handleStatusAdvance = async () => {
    if (!jobCard) return;
    
    const currentStatusConfig = getStatusConfig(jobCard.serviceStatus);
    const nextStatus = currentStatusConfig.next;
    
    if (!nextStatus) return;

    // Check SOP requirements before advancing
    const template = jobCard.sopTemplateId ? getSOPTemplate(jobCard.sopTemplateId) : null;
    
    if (template) {
      const sopChecklists = (jobCard.sopChecklists as any[]) || [];
      const completedSteps = sopChecklists.filter(step => step.completed).map(step => step.stepId);
      
      // Find incomplete required steps
      const requiredSteps = template.steps.filter(step => step.required);
      const incompleteRequired = requiredSteps.filter(step => !completedSteps.includes(step.stepId));
      
      if (incompleteRequired.length > 0) {
        // Show SOP override modal
        setIncompleteRequiredSteps(incompleteRequired);
        setShowSOPOverride(true);
        return;
      }
    }

    // Proceed with normal advancement
    await advanceStatus(nextStatus);
  };

  const advanceStatus = async (nextStatus: string, overrideReason?: string) => {
    if (!jobCard) return;

    setIsUpdatingStatus(true);
    try {
      // If there's an override reason, send it with the request
      const requestBody = overrideReason 
        ? { status: nextStatus, override: true, overrideReason }
        : { status: nextStatus };
      
      const response = await apiRequest("PUT", `/api/job-cards/${jobCard.id}/status`, requestBody);
      const updatedJobCard = await response.json();
      
      const nextStatusInfo = getStatusConfig(nextStatus);
      toast({
        title: "Status Updated",
        description: overrideReason 
          ? `Status advanced with SOP override: ${nextStatusInfo.label}`
          : `Job card moved to ${nextStatusInfo.label}`,
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/job-cards"] });
      onStatusUpdate?.(updatedJobCard);
    } catch (error: any) {
      console.error('Status advancement error:', error);
      
      // Handle SOP validation errors with detailed feedback
      if (error.status === 409 && error.code === 'SOP_REQUIREMENTS_NOT_MET') {
        const details = error.details || {};
        let detailMessage = "Missing SOP requirements:\n";
        
        if (details.missingSteps?.length > 0) {
          detailMessage += `\n• Required steps: ${details.missingSteps.join(', ')}`;
        }
        if (details.missingPhotos?.length > 0) {
          detailMessage += `\n• Missing photos: ${details.missingPhotos.join(', ')}`;
        }
        if (details.missingCheckpoints?.length > 0) {
          detailMessage += `\n• Incomplete checkpoints: ${details.missingCheckpoints.join(', ')}`;
        }
        if (details.missingInspections?.length > 0) {
          detailMessage += `\n• Missing inspections: ${details.missingInspections.join(', ')}`;
        }
        
        toast({
          title: "Cannot Advance Status",
          description: detailMessage,
          variant: "destructive",
        });
        
        // Show SOP drawer to help user complete requirements
        // setShowSOPDrawer(true);
        return;
      }
      
      // Handle other errors
      toast({
        title: "Status Update Failed",
        description: error.message || "Failed to advance status",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSOPOverride = async (reason: string) => {
    if (!jobCard) return;
    
    const currentStatusConfig = getStatusConfig(jobCard.serviceStatus);
    const nextStatus = currentStatusConfig.next;
    
    if (!nextStatus) return;

    setIsProcessingOverride(true);
    try {
      await advanceStatus(nextStatus, reason);
      setShowSOPOverride(false);
      setIncompleteRequiredSteps([]);
    } finally {
      setIsProcessingOverride(false);
    }
  };

  const handleSOPOverrideCancel = () => {
    setShowSOPOverride(false);
    setIncompleteRequiredSteps([]);
  };

  if (isLoading) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!jobCard) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">Job card not found</p>
        </CardContent>
      </Card>
    );
  }

  const currentStatusConfig = getStatusConfig(jobCard.serviceStatus);
  const nextStatus = currentStatusConfig.next;
  const isOverdue = jobCard.promisedReadyAt && isPast(new Date(jobCard.promisedReadyAt));
  const hoursRemaining = jobCard.promisedReadyAt 
    ? differenceInHours(new Date(jobCard.promisedReadyAt), new Date())
    : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with Job Card ID and Status */}
      <Card>
        <CardHeader className="text-center">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">{jobCard.id}</CardTitle>
            {onClose && (
              <Button variant="outline" onClick={onClose} data-testid="button-close">
                ✕
              </Button>
            )}
          </div>
          
          {/* Large Status Badge */}
          <div className="flex justify-center mt-4">
            <Badge className={`${currentStatusConfig?.color || 'bg-gray-500'} text-white text-lg px-6 py-3`}>
              {currentStatusConfig?.label || 'Unknown Status'}
            </Badge>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <Progress value={currentStatusConfig?.progress || 0} className="h-3" />
            <p className="text-sm text-muted-foreground mt-2">
              {currentStatusConfig?.progress || 0}% Complete
            </p>
          </div>

          {/* SLA Alert */}
          {isOverdue && (
            <Alert className="mt-4 border-red-500 bg-red-50 dark:bg-red-950">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-700 dark:text-red-300">
                <strong>OVERDUE:</strong> Promised ready time was{" "}
                {jobCard.promisedReadyAt && format(new Date(jobCard.promisedReadyAt), "MMM d, h:mm a")}
              </AlertDescription>
            </Alert>
          )}

          {/* Time Remaining */}
          {!isOverdue && hoursRemaining !== null && (
            <div className="flex items-center justify-center gap-2 mt-2">
              <Clock className="h-4 w-4" />
              <span className={`text-sm ${hoursRemaining < 2 ? 'text-orange-600' : 'text-muted-foreground'}`}>
                {hoursRemaining > 0 ? `${hoursRemaining}h remaining` : 'Due today'}
              </span>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* SOP Checklist and Status Advancement */}
      <Card>
        <CardContent className="p-6 space-y-4">
          {/* SOP Drawer Trigger */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <ClipboardCheck className="h-5 w-5 text-muted-foreground" />
              <div>
                <h4 className="font-medium text-sm">Standard Operating Procedure</h4>
                <p className="text-xs text-muted-foreground">
                  {(jobCard.sopProgress !== undefined && jobCard.sopProgress !== null) 
                    ? `${jobCard.sopProgress}% complete`
                    : 'No SOP assigned'
                  }
                </p>
              </div>
            </div>
            <SOPDrawer jobCard={jobCard}>
              <Button 
                variant="outline" 
                size="sm"
                data-testid="button-open-sop-drawer"
              >
                <ClipboardCheck className="h-4 w-4 mr-1" />
                View SOP
              </Button>
            </SOPDrawer>
          </div>

          {/* Status Advancement */}
          {nextStatus && (
            <Button
              size="lg"
              className="w-full h-16 text-lg"
              onClick={handleStatusAdvance}
              disabled={isUpdatingStatus}
              data-testid="button-advance-status"
            >
              {isUpdatingStatus ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <ArrowRight className="h-5 w-5 mr-2" />
                  Advance to {getStatusConfig(nextStatus).label}
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <>
        {/* Customer & Vehicle Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer & Vehicle
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div>
            {customer && (
              <div>
                <h4 className="font-semibold">{customer.fullName}</h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  {customer.phoneNumber}
                </div>
                {customer.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    {customer.email}
                  </div>
                )}
                {customer.vipStatus && (
                  <Badge variant="secondary" className="mt-1">
                    VIP Customer
                  </Badge>
                )}
              </div>
            )}

            <Separator />

            {vehicle && (
              <div>
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  <span className="font-semibold">{vehicle.registrationNumber}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {vehicle.make} {vehicle.model}
                </p>
                {vehicle.currentOdometer && (
                  <p className="text-sm text-muted-foreground">
                    Odometer: {vehicle.currentOdometer.toLocaleString()} km
                  </p>
                )}
              </div>
            )}</div>
          </CardContent>
        </Card>

        {/* Service Details */}
        <Card>
          <div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Service Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <>
            {/* Key Tag */}
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              <span className="font-medium">Key Tag:</span>
              <Badge variant="outline">{jobCard.keyTag || 'Not assigned'}</Badge>
            </div>

            {/* Parking Location */}
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="font-medium">Parking:</span>
              <span>{jobCard.parkingLocation || 'Not assigned'}</span>
            </div>

              {/*  Service Bay  */}
              
                {jobCard.bayId && (
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    <span className="font-medium">Bay:</span>
                    <Badge variant="secondary">{String(jobCard.bayId)}</Badge>
                  </div>
                )}

            {/* Promised Time */}
            {jobCard.promisedReadyAt && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">Promised:</span>
                <span className={isOverdue ? 'text-red-600' : ''}>
                  {jobCard.promisedReadyAt && format(new Date(jobCard.promisedReadyAt), "MMM d, h:mm a")}
                </span>
              </div>
            )}

            {/* Services */}
            {jobCard.services && Array.isArray(jobCard.services) && jobCard.services.length > 0 && (
              <div>
                <span className="font-medium">Services:</span>
                <div className="mt-2 space-y-1">
                  {(jobCard.services as any[]).map((service: any, index: number) => (
                    <Badge key={index} variant="outline" className="mr-2">
                      {String(service.name || service.id || 'Unknown Service')}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            </>
          </CardContent>
          </div>
        </Card>

        {/* Financial Summary */}
        {(jobCard.totalAmount !== "0.00" || jobCard.finalAmount !== "0.00") && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Financial Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <>
              <div className="flex justify-between">
                <span>Total Amount:</span>
                <span>₹{parseFloat(jobCard.totalAmount || '0').toLocaleString()}</span>
              </div>
              {parseFloat(jobCard.discountAmount || '0') > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount:</span>
                  <span>-₹{parseFloat(jobCard.discountAmount || '0').toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>CGST:</span>
                <span>₹{parseFloat(jobCard.cgst || '0').toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>SGST:</span>
                <span>₹{parseFloat(jobCard.sgst || '0').toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Final Amount:</span>
                <span>₹{parseFloat(jobCard.finalAmount || '0').toLocaleString()}</span>
              </div>
              <Badge 
                variant={jobCard.paymentStatus === 'completed' ? 'default' : 'secondary'}
                className="w-full justify-center"
              >
                Payment: {String(jobCard.paymentStatus || 'pending')}
              </Badge>
              </>
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {jobCard.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{String(jobCard.notes || '')}</p>
            </CardContent>
          </Card>
        )}

        {/* Materials Allocated */}
        {jobCard.materialsAllocated && Array.isArray(jobCard.materialsAllocated) && jobCard.materialsAllocated.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Materials Allocated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(jobCard.materialsAllocated as any[]).map((material: any, index: number) => (
                  <div key={index} className="flex justify-between items-center">
                    <span>{String(material.name || 'Unknown')}</span>
                    <Badge variant="outline">
                      {String(material.quantity || 0)} {String(material.unit || '')}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        </>
      </div>

      {/* Timestamps */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <span className="font-medium">Created:</span>{" "}
              {jobCard.createdAt && format(new Date(jobCard.createdAt), "MMM d, yyyy h:mm a")}
            </div>
            <div>
              <span className="font-medium">Last Updated:</span>{" "}
              {jobCard.updatedAt && format(new Date(jobCard.updatedAt), "MMM d, yyyy h:mm a")}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* SOP Override Modal */}
      <SOPOverrideModal
        open={showSOPOverride}
        onOpenChange={setShowSOPOverride}
        jobCardId={jobCard.id}
        incompleteRequiredSteps={incompleteRequiredSteps}
        onOverride={handleSOPOverride}
        onCancel={handleSOPOverrideCancel}
        isProcessing={isProcessingOverride}
      />
    </div>
  );
}