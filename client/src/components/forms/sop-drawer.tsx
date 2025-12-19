import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ClipboardCheck, Camera, CheckCircle2, AlertCircle, X } from "lucide-react";
import { type JobCard } from "@/lib/types";
import { getSOPTemplate, type SOPTemplate, calculateSOPProgress } from "@/lib/sop-templates";
import SOPChecklist from "./sop-checklist";

interface SOPDrawerProps {
  jobCard: JobCard;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode; // Trigger button
}

export default function SOPDrawer({ jobCard, isOpen = false, onOpenChange, children }: SOPDrawerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [localOpen, setLocalOpen] = useState(isOpen);

  // Get SOP template and data
  const template = jobCard.sopTemplateId ? getSOPTemplate(jobCard.sopTemplateId) : null;
  const sopChecklists = (jobCard.sopChecklists as any[]) || [];
  const completedSteps = sopChecklists.filter(step => step.completed).map(step => step.stepId);
  const stepPhotos = sopChecklists.reduce((acc, step) => {
    acc[step.stepId] = (step.photos || []).map((p: any) => p.url);
    return acc;
  }, {} as Record<string, string[]>);

  const progress = template ? calculateSOPProgress(template.steps, completedSteps) : 0;

  // Mutations for SOP operations
  const updateSOPMutation = useMutation({
    mutationFn: async (sopData: any) => {
      const response = await apiRequest("PUT", `/api/job-cards/${jobCard.id}/sop`, sopData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-cards"] });
      queryClient.invalidateQueries({ queryKey: ["/api/job-cards", jobCard.id] });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update SOP",
        variant: "destructive",
      });
    }
  });

  const completeStepMutation = useMutation({
    mutationFn: async (stepId: string) => {
      const response = await apiRequest("POST", `/api/job-cards/${jobCard.id}/sop/complete-step`, { stepId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-cards"] });
      queryClient.invalidateQueries({ queryKey: ["/api/job-cards", jobCard.id] });
    },
  });

  const addPhotoMutation = useMutation({
    mutationFn: async ({ stepId, photoUrl }: { stepId: string; photoUrl: string }) => {
      const response = await apiRequest("POST", `/api/job-cards/${jobCard.id}/sop/add-photo`, { stepId, photoUrl });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-cards"] });
      queryClient.invalidateQueries({ queryKey: ["/api/job-cards", jobCard.id] });
    },
  });

  const handleStepToggle = async (stepId: string, completed: boolean) => {
    if (completed) {
      await completeStepMutation.mutateAsync(stepId);
    } else {
      // Handle uncomplete logic if needed
      console.log('Uncomplete step:', stepId);
    }
  };

  const handlePhotoCapture = async (stepId: string, photoUrl: string) => {
    await addPhotoMutation.mutateAsync({ stepId, photoUrl });
  };

  const initializeSOPTemplate = async (templateId: string) => {
    const template = getSOPTemplate(templateId);
    if (!template) return;

    const initialChecklists = template.steps.map(step => ({
      stepId: step.stepId,
      name: step.name,
      description: step.description,
      required: step.required,
      photoRequired: step.photoRequired,
      completed: false,
      photos: [],
      timestamp: null
    }));

    await updateSOPMutation.mutateAsync({
      sopChecklists: initialChecklists,
      sopTemplateId: templateId,
      sopProgress: 0,
      sopRequiredPhotos: template.steps.filter(s => s.required && s.photoRequired).length,
      sopCompletedPhotos: 0
    });

    toast({
      title: "SOP Template Assigned",
      description: `${template.serviceName} checklist is now active`,
    });
  };

  const handleOpenChange = (open: boolean) => {
    setLocalOpen(open);
    onOpenChange?.(open);
  };

  // Compact status display for tablet
  const StatusDisplay = () => (
    <div className="flex items-center gap-2 text-sm">
      {template ? (
        <>
          <div className="flex items-center gap-1">
            <ClipboardCheck className="h-4 w-4" />
            <span className="font-medium">{progress}%</span>
          </div>
          <div className="w-16 bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-green-500 h-1.5 rounded-full transition-all" 
              style={{ width: `${progress}%` }}
            />
          </div>
          {jobCard.sopCompletedPhotos !== undefined && jobCard.sopRequiredPhotos !== undefined && (
            <div className="flex items-center gap-1 text-xs">
              <Camera className="h-3 w-3" />
              <span>{jobCard.sopCompletedPhotos}/{jobCard.sopRequiredPhotos}</span>
            </div>
          )}
        </>
      ) : (
        <Badge variant="outline" className="text-xs">No SOP</Badge>
      )}
    </div>
  );

  return (
    <Sheet open={localOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        {children || (
          <Button 
            variant="outline" 
            size="sm"
            className="h-8 px-3 text-xs"
            data-testid="button-open-sop"
          >
            <ClipboardCheck className="h-3 w-3 mr-1" />
            SOP {progress}%
          </Button>
        )}
      </SheetTrigger>
      
      <SheetContent 
        side="right" 
        className="w-[400px] sm:w-[500px] p-0 overflow-hidden"
        data-testid="sop-drawer"
      >
        <SheetHeader className="p-4 pb-2 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg">SOP Checklist</SheetTitle>
            <StatusDisplay />
          </div>
          
          <div className="text-sm text-muted-foreground">
            {jobCard.id} • {jobCard.serviceStatus}
          </div>
          
          {template && (
            <div className="flex items-center gap-2 pt-2">
              <Badge variant="secondary" className="text-xs">
                {template.serviceName}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {template.estimatedDurationMinutes}min estimated
              </span>
            </div>
          )}
        </SheetHeader>

        <div className="flex-1 overflow-hidden">
          {template ? (
            <SOPChecklist
              template={template}
              completedSteps={completedSteps}
              stepPhotos={stepPhotos}
              onStepToggle={handleStepToggle}
              onPhotoCapture={handlePhotoCapture}
              className="h-full"
            />
          ) : (
            <div className="p-6 text-center space-y-4">
              <div className="text-muted-foreground">
                <ClipboardCheck className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <h3 className="font-medium mb-1">No SOP Template Assigned</h3>
                <p className="text-sm">Select a service template to begin checklist</p>
              </div>
              
              <div className="space-y-2">
                <Button 
                  onClick={() => initializeSOPTemplate('car-wash-basic')}
                  variant="outline" 
                  size="sm"
                  className="w-full"
                  data-testid="button-assign-basic-wash"
                >
                  Basic Car Wash
                </Button>
                <Button 
                  onClick={() => initializeSOPTemplate('full-detailing')}
                  variant="outline" 
                  size="sm"
                  className="w-full"
                  data-testid="button-assign-detailing"
                >
                  Full Detailing
                </Button>
                <Button 
                  onClick={() => initializeSOPTemplate('oil-change')}
                  variant="outline" 
                  size="sm"
                  className="w-full"
                  data-testid="button-assign-oil-change"
                >
                  Oil Change
                </Button>
                <Button 
                  onClick={() => initializeSOPTemplate('tire-service')}
                  variant="outline" 
                  size="sm"
                  className="w-full"
                  data-testid="button-assign-tire-service"
                >
                  Tire Service
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}