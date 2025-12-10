import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { type JobCard, type Customer, type Vehicle } from "@/schema";
import { 
  Plus, 
  MoreHorizontal, 
  Clock, 
  AlertTriangle, 
  User, 
  Car,
  Key,
  MapPin,
  CreditCard,
  CheckCircle,
  Camera,
  ClipboardCheck,
  Eye,
  ArrowRight,
  Phone,
  Wrench
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, differenceInHours, isPast } from "date-fns";
import SOPSlideoutPanel from "@/components/kanban/sop-slideout-panel";
import PhotoSlideoutPanel from "@/components/kanban/photo-slideout-panel";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface KanbanBoardProps {
  onCardClick?: (jobCard: JobCard) => void;
  onCreateService?: () => void;
}

// 6-Stage Enhanced Job Queue
const columns = [
  { id: 'check-in', title: 'Check-In', description: 'Vehicle arrival, keys received', color: 'bg-blue-500', textColor: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
  { id: 'prep', title: 'Preparation', description: 'Setup, cleaning prep, photos', color: 'bg-orange-500', textColor: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
  { id: 'service', title: 'Service', description: 'Main detailing work', color: 'bg-purple-500', textColor: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
  { id: 'qc', title: 'Quality Check', description: 'Final inspection & validation', color: 'bg-indigo-500', textColor: 'text-indigo-600', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-200' },
  { id: 'billing', title: 'Billing', description: 'Payment processing', color: 'bg-green-500', textColor: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
  { id: 'pickup', title: 'Ready for Pickup', description: 'Completed, awaiting customer', color: 'bg-emerald-500', textColor: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' },
];

const getCardColor = (status: string) => {
  switch (status) {
    case 'check-in': return 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950 dark:border-blue-800';
    case 'inspect': return 'bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-950 dark:border-orange-800'; // Merge inspect into prep visually
    case 'prep': return 'bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-950 dark:border-orange-800';
    case 'service': return 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-950 dark:border-purple-800';
    case 'qc': return 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950 dark:border-indigo-800';
    case 'billing': return 'bg-green-50 border-green-200 text-green-700 dark:bg-green-950 dark:border-green-800';
    case 'pickup': return 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950 dark:border-emerald-800';
    default: return 'bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-950 dark:border-gray-800';
  }
};

// Enhanced job card component with drag-and-drop
interface JobCardComponentProps {
  jobCard: JobCard;
  customer?: Customer;
  vehicle?: Vehicle;
  onCardClick?: (jobCard: JobCard) => void;
  onStatusChange?: (jobCardId: string, newStatus: string) => void;
  onTakePayment?: (jobCard: JobCard) => void;
  onOpenSOPPanel?: (jobCard: JobCard) => void;
  onOpenPhotoPanel?: (jobCard: JobCard) => void;
}

function JobCardComponent({ jobCard, customer, vehicle, onCardClick, onStatusChange, onTakePayment, onOpenSOPPanel, onOpenPhotoPanel }: JobCardComponentProps) {
  const [isDragging, setIsDragging] = useState(false);
  const isOverdue = jobCard.promisedReadyAt && isPast(new Date(jobCard.promisedReadyAt));
  const hoursRemaining = jobCard.promisedReadyAt 
    ? differenceInHours(new Date(jobCard.promisedReadyAt), new Date())
    : null;

  // Calculate SOP progress
  const sopChecklists = (jobCard.sopChecklists as any[]) || [];
  const requiredSteps = sopChecklists.filter(step => step.required);
  const completedRequiredSteps = requiredSteps.filter(step => step.completed);
  const sopProgress = requiredSteps.length > 0 
    ? `${completedRequiredSteps.length}/${requiredSteps.length}` 
    : '0/0';

  // Mock technician assignment - in real app this would come from API
  const assignedTechnician = {
    name: 'John S.',
    avatar: null, // Would be actual avatar URL
    initials: 'JS'
  };

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData("jobCardId", jobCard.id);
    e.dataTransfer.setData("currentStatus", jobCard.serviceStatus || '');
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCardClick?.(jobCard);
  };

  const handleNextClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Advance to next status logic would go here
    console.log('Advance status for:', jobCard.id);
  };

  return (
    <div
      className={`bg-white border-2 border-gray-200 rounded-xl p-4 cursor-grab transition-all hover:shadow-lg hover:border-gray-300 ${isDragging ? 'opacity-50 transform rotate-3' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      data-testid={`kanban-card-${jobCard.id}`}
    >
      {/* Header Section */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold text-gray-800">{jobCard.id}</span>
            {isOverdue && (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            )}
          </div>
          
          {/* Customer Name */}
          {customer && (
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {customer.fullName}
            </h3>
          )}
          
          {/* Phone Number */}
          {customer && (
            <div className="flex items-center gap-1 text-gray-600 mb-2">
              <Phone className="h-3 w-3" />
              <span className="text-sm">{customer.phoneNumber}</span>
            </div>
          )}
        </div>
        
        {/* Technician Avatar */}
        <div className="flex flex-col items-center">
          <Avatar className="h-8 w-8 mb-1">
            <AvatarImage src={assignedTechnician.avatar || undefined} />
            <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
              {assignedTechnician.initials || 'T'}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-gray-500">{assignedTechnician.name}</span>
        </div>
      </div>

      {/* Service Type */}
      <div className="flex items-center gap-1 mb-3">
        <Wrench className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">
          {jobCard.serviceType?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Standard Service'}
        </span>
      </div>

      {/* Vehicle Info */}
      {vehicle && (
        <div className="flex items-center gap-1 mb-3">
          <Car className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">{vehicle.registrationNumber}</span>
        </div>
      )}

      {/* Time Information */}
      {jobCard.promisedReadyAt && (
        <div className="flex items-center gap-1 mb-3">
          <Clock className="h-4 w-4 text-gray-500" />
          <span className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
            {isOverdue 
              ? `Overdue ${Math.abs(hoursRemaining || 0)}h`
              : hoursRemaining !== null && hoursRemaining > 0
                ? `${hoursRemaining}h left`
                : 'Due today'
            }
          </span>
        </div>
      )}

      {/* SOP Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Required:</span>
          <span className="text-sm font-medium text-gray-800">{sopProgress}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-200" 
            style={{ 
              width: requiredSteps.length > 0 
                ? `${(completedRequiredSteps.length / requiredSteps.length) * 100}%` 
                : '0%' 
            }}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        {/* Quick Action Buttons */}
        <div className="flex gap-1">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onOpenSOPPanel?.(jobCard);
            }}
            variant="outline"
            size="sm"
            className="flex-1 text-xs h-7"
            data-testid={`button-sop-${jobCard.id}`}
          >
            <ClipboardCheck className="h-3 w-3 mr-1" />
            SOP
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onOpenPhotoPanel?.(jobCard);
            }}
            variant="outline"
            size="sm"
            className="flex-1 text-xs h-7"
            data-testid={`button-photos-${jobCard.id}`}
          >
            <Camera className="h-3 w-3 mr-1" />
            Photos
          </Button>
        </div>
        
        {/* Main Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleViewClick}
            variant="outline"
            size="sm"
            className="flex-1 text-xs h-8"
            data-testid={`button-view-${jobCard.id}`}
          >
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
          <Button
            onClick={handleNextClick}
            size="sm"
            className="flex-1 text-xs h-8 bg-blue-600 hover:bg-blue-700"
            data-testid={`button-next-${jobCard.id}`}
          >
            Next
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </div>

      {/* VIP Badge */}
      {customer?.vipStatus && (
        <div className="mt-2">
          <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
            VIP Customer
          </Badge>
        </div>
      )}
    </div>
  );
}

// Drop zone component for columns
interface DropZoneProps {
  status: string;
  onDrop: (jobCardId: string, newStatus: string) => void;
  children: React.ReactNode;
}

function DropZone({ status, onDrop, children }: DropZoneProps) {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    
    const jobCardId = e.dataTransfer.getData("jobCardId");
    const currentStatus = e.dataTransfer.getData("currentStatus");
    
    if (!jobCardId || currentStatus === status) return;

    // Check SOP requirements before allowing the drop
    try {
      const response = await fetch(`/api/job-cards/${jobCardId}/can-advance`);
      if (response.ok) {
        const { canAdvance } = await response.json();
        
        if (!canAdvance) {
          // Show visual feedback that drop was prevented
          console.warn(`SOP Requirements Not Met: Cannot move job ${jobCardId} - complete required SOP steps first`);
          return; // Prevent the drop
        }
      }
    } catch (error) {
      console.error("Error checking SOP requirements for drag:", error);
      // Allow drop if API fails (graceful degradation)
    }
    
    onDrop(jobCardId, status);
  };

  return (
    <div
      className={`min-h-[200px] p-2 rounded-lg transition-colors ${
        isOver ? 'bg-primary/10 border-2 border-primary border-dashed' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {children}
    </div>
  );
}

export default function KanbanBoard({ onCardClick, onCreateService }: KanbanBoardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Slide-out panel state
  const [selectedJobForSOP, setSelectedJobForSOP] = useState<JobCard | null>(null);
  const [selectedJobForPhotos, setSelectedJobForPhotos] = useState<JobCard | null>(null);
  const [showSOPPanel, setShowSOPPanel] = useState(false);
  const [showPhotoPanel, setShowPhotoPanel] = useState(false);

  // Panel handlers
  const handleOpenSOPPanel = (jobCard: JobCard) => {
    setSelectedJobForSOP(jobCard);
    setShowSOPPanel(true);
    setShowPhotoPanel(false); // Close other panel
  };

  const handleOpenPhotoPanel = (jobCard: JobCard) => {
    setSelectedJobForPhotos(jobCard);
    setShowPhotoPanel(true);
    setShowSOPPanel(false); // Close other panel
  };

  const handleAdvanceStage = () => {
    // Handle stage advancement logic
    toast({
      title: "Stage Advanced",
      description: "Job has been moved to the next stage.",
    });
    setShowSOPPanel(false);
  };

  // Fetch all active job cards
  const { data: jobCards = [], isLoading } = useQuery<JobCard[]>({
    queryKey: ["/api/job-cards"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch customers for all job cards - memoize to prevent infinite loops
  const customerIds = useMemo(() => 
    Array.from(new Set(jobCards.map(jc => jc.customerId))), 
    [jobCards]
  );
  const customerQueries = useQuery({
    queryKey: ["/api/customers", "bulk", customerIds],
    queryFn: async () => {
      const customers: Customer[] = [];
      for (const customerId of customerIds) {
        try {
          const response = await apiRequest("GET", `/api/customers/${customerId}`);
          const customer = await response.json();
          customers.push(customer);
        } catch (error) {
          console.warn(`Failed to fetch customer ${customerId}:`, error);
        }
      }
      return customers;
    },
    enabled: customerIds.length > 0,
  });

  // Fetch vehicles for all job cards - memoize to prevent infinite loops
  const vehicleIds = useMemo(() => 
    Array.from(new Set(jobCards.map(jc => jc.vehicleId))), 
    [jobCards]
  );
  const vehicleQueries = useQuery({
    queryKey: ["/api/vehicles", "bulk", vehicleIds],
    queryFn: async () => {
      const vehicles: Vehicle[] = [];
      for (const vehicleId of vehicleIds) {
        try {
          // Note: We don't have a direct vehicle endpoint, so we'll need to work with what we have
          // For now, we'll skip vehicle details - could be enhanced later
        } catch (error) {
          console.warn(`Failed to fetch vehicle ${vehicleId}:`, error);
        }
      }
      return vehicles;
    },
    enabled: false, // Disable for now since we don't have vehicle endpoint
  });

  const customers = customerQueries.data || [];
  const vehicles: Vehicle[] = [];

  // Mutation for updating job card status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ jobCardId, newStatus }: { jobCardId: string; newStatus: string }) => {
      const response = await apiRequest("PUT", `/api/job-cards/${jobCardId}/status`, {
        status: newStatus
      });
      return response.json();
    },
    onSuccess: (updatedJobCard) => {
      toast({
        title: "Status Updated",
        description: `Job card moved to ${updatedJobCard.serviceStatus}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/job-cards"] });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    },
  });

  // Mutation for processing payment
  const processPaymentMutation = useMutation({
    mutationFn: async ({ jobCardId, paymentMethod }: { jobCardId: string; paymentMethod: string }) => {
      // Update payment status and advance to pickup
      const paymentResponse = await apiRequest("PUT", `/api/job-cards/${jobCardId}`, {
        paymentStatus: "completed"
      });
      
      // Auto-advance to pickup stage
      const statusResponse = await apiRequest("PUT", `/api/job-cards/${jobCardId}/status`, {
        status: "pickup"
      });
      
      return statusResponse.json();
    },
    onSuccess: (updatedJobCard) => {
      toast({
        title: "Payment Successful",
        description: `Payment completed for job card ${updatedJobCard.id}. Ready for pickup!`,
        duration: 5000,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/job-cards"] });
    },
    onError: (error) => {
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process payment",
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (jobCardId: string, newStatus: string) => {
    updateStatusMutation.mutate({ jobCardId, newStatus });
  };

  const handleTakePayment = (jobCard: JobCard) => {
    // Simple payment confirmation dialog
    const amount = parseFloat(jobCard.finalAmount || '0');
    const confirmed = window.confirm(
      `Process payment of ₹${amount.toLocaleString()} for job card ${jobCard.id}?\n\nThis will:\n- Mark payment as completed\n- Move to pickup stage\n- Notify customer for pickup`
    );
    
    if (confirmed) {
      // In a real system, this would open a payment modal
      // For now, we'll just process the payment
      processPaymentMutation.mutate({ 
        jobCardId: jobCard.id, 
        paymentMethod: "cash" // Default for now
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading workflow...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-sm">
        <CardHeader className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Service Workflow Board</h3>
            <div className="flex gap-2">
              <Button 
                onClick={onCreateService}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                data-testid="button-new-service"
              >
                <Plus size={16} className="mr-2" />
                New Service
              </Button>
              <Button variant="ghost" className="h-12 w-12" data-testid="button-more-options">
                <MoreHorizontal size={20} />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="grid grid-cols-6 gap-4">
            {/* 6 Distinct Stage Columns */}
            {columns.map((column) => {
              // Handle inspect status by merging into prep column
              let columnCards = jobCards.filter(card => {
                if (column.id === 'prep') {
                  return card.serviceStatus === 'prep' || card.serviceStatus === 'inspect';
                }
                return card.serviceStatus === column.id;
              });
              
              return (
                <DropZone 
                  key={column.id} 
                  status={column.id} 
                  onDrop={handleStatusChange}
                >
                  <div className={`${column.bgColor} ${column.borderColor} border-2 rounded-lg p-3`}>
                    <div className="text-center mb-3">
                      <h4 className="font-semibold text-sm mb-1 text-gray-800">{column.title}</h4>
                      <p className="text-xs text-gray-600 mb-2">{column.description}</p>
                      <div className="flex items-center justify-center gap-2">
                        <div className={`w-8 h-1 rounded ${column.color}`} />
                        <Badge variant="secondary" className="text-xs px-2 py-1 bg-white border">
                          {columnCards.length}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-3 min-h-[350px]">
                      {columnCards.map((jobCard) => {
                        const customer = customers.find(c => c.id === jobCard.customerId);
                        const vehicle = vehicles.find(v => v.id === jobCard.vehicleId);
                        
                        return (
                          <JobCardComponent
                            key={jobCard.id}
                            jobCard={jobCard}
                            customer={customer}
                            vehicle={vehicle}
                            onCardClick={onCardClick}
                            onStatusChange={handleStatusChange}
                            onTakePayment={handleTakePayment}
                            onOpenSOPPanel={handleOpenSOPPanel}
                            onOpenPhotoPanel={handleOpenPhotoPanel}
                          />
                        );
                      })}
                      
                      {columnCards.length === 0 && (
                        <div className="text-center text-gray-500 text-sm py-8">
                          No jobs in {column.title.toLowerCase()}
                        </div>
                      )}
                    </div>
                  </div>
                </DropZone>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* SOP Slide-out Panel */}
      <SOPSlideoutPanel
        open={showSOPPanel}
        onOpenChange={setShowSOPPanel}
        jobCard={selectedJobForSOP}
        onAdvanceStage={handleAdvanceStage}
      />
      
      {/* Photo Slide-out Panel */}
      <PhotoSlideoutPanel
        open={showPhotoPanel}
        onOpenChange={setShowPhotoPanel}
        jobCard={selectedJobForPhotos}
      />
    </>
  );
}
