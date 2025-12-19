import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  ClipboardList, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  ArrowRight,
  X
} from "lucide-react";
import { JobCard } from "@/lib/types";
import SOPChecklist from "@/components/forms/sop-checklist";
import { getSOPTemplate, type SOPTemplate } from "@/lib/sop-templates";
import { apiRequest } from "@/lib/queryClient";

interface SOPSlideoutPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobCard: JobCard | null;
  onAdvanceStage?: () => void;
}

export default function SOPSlideoutPanel({
  open,
  onOpenChange,
  jobCard,
  onAdvanceStage
}: SOPSlideoutPanelProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [sopTemplate, setSOPTemplate] = useState<SOPTemplate | null>(null);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [stepPhotos, setStepPhotos] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (!jobCard?.serviceType) return;

    // Get SOP template based on service type
    const template = getSOPTemplate(jobCard.serviceType);
    setSOPTemplate(template);

    // Initialize completed steps and photos from job card data
    if (jobCard.sopChecklists) {
      const checklists = Array.isArray(jobCard.sopChecklists) ? jobCard.sopChecklists : [];
      const completed = checklists
        .filter((item: any) => item.completed)
        .map((item: any) => item.stepId);
      setCompletedSteps(completed);

      // Initialize photos
      const photos: Record<string, string[]> = {};
      checklists.forEach((item: any) => {
        if (item.photos && item.photos.length > 0) {
          photos[item.stepId] = item.photos;
        }
      });
      setStepPhotos(photos);
    }
  }, [jobCard]);

  const updateSOPMutation = useMutation({
    mutationFn: async (sopData: any) => {
      if (!jobCard?.id) throw new Error('No job card selected');
      const response = await apiRequest("PUT", `/api/job-cards/${jobCard.id}/sop`, sopData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/job-cards'] });
      toast({
        title: "SOP Updated",
        description: "SOP checklist has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update SOP checklist",
        variant: "destructive",
      });
    },
  });

  const completeStepMutation = useMutation({
    mutationFn: async (stepId: string) => {
      if (!jobCard?.id) throw new Error('No job card selected');
      const response = await apiRequest("POST", `/api/job-cards/${jobCard.id}/sop/complete-step`, { stepId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/job-cards'] });
    },
    onError: (error: any) => {
      toast({
        title: "Step Completion Failed",
        description: error.message || "Failed to complete SOP step",
        variant: "destructive",
      });
    },
  });

  const addPhotoMutation = useMutation({
    mutationFn: async ({ stepId, photoUrl }: { stepId: string; photoUrl: string }) => {
      if (!jobCard?.id) throw new Error('No job card selected');
      const response = await apiRequest("POST", `/api/job-cards/${jobCard.id}/sop/add-photo`, { 
        stepId, 
        photoUrl 
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/job-cards'] });
    },
    onError: (error: any) => {
      toast({
        title: "Photo Upload Failed",
        description: error.message || "Failed to add photo to SOP step",
        variant: "destructive",
      });
    },
  });

  const handleStepToggle = (stepId: string, completed: boolean) => {
    if (completed) {
      completeStepMutation.mutate(stepId);
      setCompletedSteps(prev => [...prev, stepId]);
    } else {
      // Handle unchecking if needed
      setCompletedSteps(prev => prev.filter(id => id !== stepId));
    }
  };

  const handlePhotoCapture = (stepId: string, photoUrl: string) => {
    addPhotoMutation.mutate({ stepId, photoUrl });
    setStepPhotos(prev => ({
      ...prev,
      [stepId]: [...(prev[stepId] || []), photoUrl]
    }));
  };

  const calculateProgress = () => {
    if (!sopTemplate) return 0;
    return Math.round((completedSteps.length / sopTemplate.steps.length) * 100);
  };

  const getRequiredIncompleteSteps = () => {
    if (!sopTemplate) return [];
    return sopTemplate.steps.filter(step => 
      step.required && !completedSteps.includes(step.stepId)
    );
  };

  const canAdvanceStage = () => {
    return getRequiredIncompleteSteps().length === 0;
  };

  if (!jobCard) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full max-w-2xl">
          <SheetHeader>
            <SheetTitle>No Job Selected</SheetTitle>
            <SheetDescription>
              Select a job card to view its SOP checklist
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-2xl p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <ClipboardList className="h-6 w-6 text-blue-600" />
                <div>
                  <SheetTitle className="text-xl font-semibold text-gray-900">
                    SOP Checklist
                  </SheetTitle>
                  <SheetDescription className="text-sm text-gray-600">
                    Job #{jobCard.keyTag} • {jobCard.serviceType}
                  </SheetDescription>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onOpenChange(false)}
                data-testid="button-close-sop-panel"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Progress Section */}
            <Card className="bg-white/60 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm text-gray-600">
                    {completedSteps.length} of {sopTemplate?.steps.length || 0} steps
                  </span>
                </div>
                <Progress value={calculateProgress()} className="mb-3" />
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>{completedSteps.length} Completed</span>
                  </div>
                  {getRequiredIncompleteSteps().length > 0 && (
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span className="text-red-600">
                        {getRequiredIncompleteSteps().length} Required
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* SOP Checklist Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {sopTemplate ? (
              <SOPChecklist
                template={sopTemplate}
                completedSteps={completedSteps}
                stepPhotos={stepPhotos}
                onStepToggle={handleStepToggle}
                onPhotoCapture={handlePhotoCapture}
                className="space-y-4"
              />
            ) : (
              <div className="text-center py-8">
                <ClipboardList className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No SOP Template</h3>
                <p className="text-gray-600">
                  No SOP checklist found for this service type
                </p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {canAdvanceStage() ? (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Ready to Advance
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <Clock className="h-3 w-3 mr-1" />
                    In Progress
                  </Badge>
                )}
              </div>
              
              <div className="flex gap-2">
                {onAdvanceStage && canAdvanceStage() && (
                  <Button 
                    onClick={onAdvanceStage}
                    className="bg-green-600 hover:bg-green-700"
                    data-testid="button-advance-stage"
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Advance Stage
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}