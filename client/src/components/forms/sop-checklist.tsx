import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { 
  Camera, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Image as ImageIcon,
  MoreHorizontal,
  Play,
  Pause,
  Info,
  ChevronDown,
  ChevronRight,
  ListChecks
} from "lucide-react";
import { type SOPStep, type SOPTemplate } from "@/lib/sop-templates";
import PhotoCaptureModal from "./photo-capture-modal";

interface SOPChecklistProps {
  template: SOPTemplate;
  completedSteps: string[];
  stepPhotos: Record<string, string[]>; // stepId -> photo URLs
  onStepToggle: (stepId: string, completed: boolean) => void;
  onPhotoCapture: (stepId: string, photoUrl: string) => void;
  isReadOnly?: boolean;
  className?: string;
}

interface StepItemProps {
  step: SOPStep;
  isCompleted: boolean;
  photos: string[];
  onToggle: (completed: boolean) => void;
  onPhotoCapture: () => void;
  isReadOnly?: boolean;
  stepIndex: number;
  totalSteps: number;
  completedCheckpoints?: string[];
  onCheckpointToggle?: (checkpoint: string, completed: boolean) => void;
}

function StepItem({ step, isCompleted, photos, onToggle, onPhotoCapture, isReadOnly = false, stepIndex, totalSteps, completedCheckpoints = [], onCheckpointToggle }: StepItemProps) {
  const [showInstructions, setShowInstructions] = useState(false);
  const [showCheckpoints, setShowCheckpoints] = useState(false);
  
  const hasRequiredPhotos = !step.photoRequired || photos.length >= (step.requiredPhotos || 1);
  const hasCompletedCheckpoints = !step.checkpoints || step.checkpoints.every(checkpoint => completedCheckpoints.includes(checkpoint));
  const canComplete = !step.required || (step.required && hasRequiredPhotos && hasCompletedCheckpoints);
  
  const getValidationMessage = () => {
    if (!step.required) return null;
    const issues = [];
    
    if (step.photoRequired && photos.length < (step.requiredPhotos || 1)) {
      issues.push(`Need ${(step.requiredPhotos || 1) - photos.length} more photo${(step.requiredPhotos || 1) - photos.length > 1 ? 's' : ''}`);
    }
    
    if (step.checkpoints) {
      const incompleteCheckpoints = step.checkpoints.filter(checkpoint => !completedCheckpoints.includes(checkpoint));
      if (incompleteCheckpoints.length > 0) {
        issues.push(`${incompleteCheckpoints.length} checkpoint${incompleteCheckpoints.length > 1 ? 's' : ''} remaining`);
      }
    }
    
    return issues.length > 0 ? issues.join(', ') : null;
  };
  
  const validationMessage = getValidationMessage();

  return (
    <div className={`p-4 rounded-lg border-2 transition-all ${
      isCompleted ? 'bg-green-50 dark:bg-green-950 border-green-300 dark:border-green-700 shadow-sm' :
      step.required && !canComplete ? 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 shadow-sm' :
      step.required ? 'bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800 shadow-sm' :
      'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700'
    }`} data-testid={`sop-step-${step.stepId}`}>
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <div className="pt-1">
          <Checkbox
            checked={isCompleted}
            onCheckedChange={onToggle}
            disabled={isReadOnly || (step.required && !canComplete && !isCompleted)}
            className="h-5 w-5"
            data-testid={`checkbox-${step.stepId}`}
          />
        </div>

        {/* Step Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs px-1 py-0 min-w-[2rem] justify-center">
                {stepIndex + 1}/{totalSteps}
              </Badge>
              <h4 className={`text-sm font-medium ${
                isCompleted ? 'line-through text-muted-foreground' : ''
              }`} data-testid={`step-title-${step.stepId}`}>
                {step.name}
                {step.required && (
                  <span className="text-red-500 ml-1 font-bold">*</span>
                )}
              </h4>
            </div>
            {step.required && (
              <Badge variant="secondary" className={`text-xs px-2 py-0 ${
                canComplete ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'
              }`}>
                Required
              </Badge>
            )}
            {step.estimatedTimeMinutes && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {step.estimatedTimeMinutes}m
              </div>
            )}
            {step.area && (
              <Badge variant="outline" className="text-xs px-2 py-0 capitalize">
                {step.area}
              </Badge>
            )}
          </div>

          {step.description && (
            <p className="text-xs text-muted-foreground mb-2" data-testid={`step-description-${step.stepId}`}>
              {step.description}
            </p>
          )}
          
          {/* Validation Message */}
          {validationMessage && !isCompleted && (
            <div className="flex items-center gap-2 mb-2 p-2 bg-orange-100 dark:bg-orange-900 rounded text-xs text-orange-800 dark:text-orange-200" data-testid={`step-validation-${step.stepId}`}>
              <AlertCircle className="h-3 w-3 flex-shrink-0" />
              <span>{validationMessage}</span>
            </div>
          )}
          
          {/* Instructions Section */}
          {(step.instructions || step.photoInstructions) && (
            <Collapsible open={showInstructions} onOpenChange={setShowInstructions}>
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 text-xs mb-2" 
                  data-testid={`button-instructions-${step.stepId}`}
                >
                  <Info className="h-3 w-3 mr-1" />
                  {showInstructions ? 'Hide' : 'Show'} Instructions
                  {showInstructions ? <ChevronDown className="h-3 w-3 ml-1" /> : <ChevronRight className="h-3 w-3 ml-1" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg mb-3 space-y-2">
                  {step.instructions && (
                    <div>
                      <h5 className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-1">Instructions:</h5>
                      <p className="text-xs text-blue-700 dark:text-blue-300" data-testid={`step-instructions-${step.stepId}`}>
                        {step.instructions}
                      </p>
                    </div>
                  )}
                  {step.photoInstructions && (
                    <div>
                      <h5 className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-1 flex items-center gap-1">
                        <Camera className="h-3 w-3" />
                        Photo Requirements:
                      </h5>
                      <p className="text-xs text-blue-700 dark:text-blue-300" data-testid={`step-photo-instructions-${step.stepId}`}>
                        {step.photoInstructions}
                      </p>
                      {step.requiredPhotos && step.requiredPhotos > 1 && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">
                          Required: {step.requiredPhotos} photos
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
          
          {/* Checkpoints Section */}
          {step.checkpoints && step.checkpoints.length > 0 && (
            <Collapsible open={showCheckpoints} onOpenChange={setShowCheckpoints}>
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 text-xs mb-2" 
                  data-testid={`button-checkpoints-${step.stepId}`}
                >
                  <ListChecks className="h-3 w-3 mr-1" />
                  Checkpoints ({completedCheckpoints.length}/{step.checkpoints.length})
                  {showCheckpoints ? <ChevronDown className="h-3 w-3 ml-1" /> : <ChevronRight className="h-3 w-3 ml-1" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg mb-3 space-y-2">
                  {step.checkpoints.map((checkpoint, index) => {
                    const isCheckpointCompleted = completedCheckpoints.includes(checkpoint);
                    return (
                      <div key={index} className="flex items-center gap-2" data-testid={`checkpoint-${step.stepId}-${index}`}>
                        <Checkbox 
                          checked={isCheckpointCompleted}
                          onCheckedChange={(checked) => onCheckpointToggle?.(checkpoint, checked as boolean)}
                          disabled={isReadOnly}
                          className="h-4 w-4"
                          data-testid={`checkbox-checkpoint-${step.stepId}-${index}`}
                        />
                        <span className={`text-xs ${
                          isCheckpointCompleted ? 'line-through text-muted-foreground' : 'text-foreground'
                        }`}>
                          {checkpoint}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Photo Section */}
          {step.photoRequired && (
            <div className="flex items-center gap-2 mt-2">
              <Button
                variant={hasRequiredPhotos ? "default" : "outline"}
                size="sm"
                onClick={onPhotoCapture}
                disabled={isReadOnly}
                className={`h-7 text-xs ${
                  !hasRequiredPhotos ? 'border-red-300 text-red-600 hover:bg-red-50' : ''
                }`}
                data-testid={`button-photo-${step.stepId}`}
              >
                <Camera className="h-3 w-3 mr-1" />
                {photos.length > 0 ? 
                  `${photos.length}/${step.requiredPhotos || 1} Photo${(step.requiredPhotos || 1) > 1 ? 's' : ''}` : 
                  `Add Photo${step.requiredPhotos && step.requiredPhotos > 1 ? `s (${step.requiredPhotos})` : ''}`
                }
              </Button>
              
              {step.photoType && (
                <Badge variant="outline" className={`text-xs px-2 py-0 ${
                  step.photoType === 'before' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                  step.photoType === 'after' ? 'bg-green-50 text-green-700 border-green-200' :
                  step.photoType === 'process' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                  step.photoType === 'damage' ? 'bg-red-50 text-red-700 border-red-200' :
                  step.photoType === 'inspection' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                  'bg-gray-50 text-gray-700 border-gray-200'
                }`}>
                  {step.photoType.toUpperCase()}
                </Badge>
              )}

              {/* Photo Thumbnails */}
              {photos.length > 0 && (
                <div className="flex gap-1" data-testid={`photo-thumbnails-${step.stepId}`}>
                  {photos.slice(0, 3).map((photo, index) => (
                    <div 
                      key={index}
                      className="w-8 h-8 rounded border overflow-hidden bg-gray-100"
                      data-testid={`photo-thumbnail-${step.stepId}-${index}`}
                    >
                      <img 
                        src={photo} 
                        alt={`${step.name} photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  {photos.length > 3 && (
                    <div className="w-8 h-8 rounded border bg-gray-100 flex items-center justify-center text-xs">
                      +{photos.length - 3}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Status Icon */}
        <div className="pt-1">
          {isCompleted ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" data-testid={`status-complete-${step.stepId}`} />
          ) : step.required && !canComplete ? (
            <AlertCircle className="h-4 w-4 text-red-600" data-testid={`status-blocked-${step.stepId}`} />
          ) : step.required ? (
            <AlertCircle className="h-4 w-4 text-orange-600" data-testid={`status-required-${step.stepId}`} />
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function SOPChecklist({ 
  template, 
  completedSteps, 
  stepPhotos,
  onStepToggle, 
  onPhotoCapture,
  isReadOnly = false,
  className = ""
}: SOPChecklistProps) {
  const { toast } = useToast();
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState<SOPStep | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  // Add state for tracking checkpoint completion
  const [stepCheckpoints, setStepCheckpoints] = useState<Record<string, string[]>>({});

  // Calculate progress
  const progress = useMemo(() => {
    if (template.steps.length === 0) return 0;
    return Math.round((completedSteps.length / template.steps.length) * 100);
  }, [template.steps.length, completedSteps.length]);

  // Calculate required steps completion
  const requiredStepsCompleted = useMemo(() => {
    const requiredSteps = template.steps.filter(step => step.required);
    const completedRequired = requiredSteps.filter(step => completedSteps.includes(step.stepId));
    return { completed: completedRequired.length, total: requiredSteps.length };
  }, [template.steps, completedSteps]);

  // Group steps by category
  const stepsByCategory = useMemo(() => {
    const categories: Record<string, SOPStep[]> = {};
    template.steps.forEach(step => {
      const category = step.category || 'general';
      if (!categories[category]) categories[category] = [];
      categories[category].push(step);
    });
    return categories;
  }, [template.steps]);

  const handleCheckpointToggle = useCallback((stepId: string, checkpoint: string, completed: boolean) => {
    setStepCheckpoints(prev => {
      const stepCheckpoints = prev[stepId] || [];
      if (completed) {
        return {
          ...prev,
          [stepId]: [...stepCheckpoints.filter(c => c !== checkpoint), checkpoint]
        };
      } else {
        return {
          ...prev,
          [stepId]: stepCheckpoints.filter(c => c !== checkpoint)
        };
      }
    });
  }, []);
  
  const handleStepToggle = useCallback((stepId: string, completed: boolean) => {
    const step = template.steps.find(s => s.stepId === stepId);
    if (!step) return;
    
    const hasRequiredPhotos = !step.photoRequired || (stepPhotos[stepId] && stepPhotos[stepId].length >= (step.requiredPhotos || 1));
    const hasCompletedCheckpoints = !step.checkpoints || step.checkpoints.every(checkpoint => 
      (stepCheckpoints[stepId] || []).includes(checkpoint)
    );
    
    if (completed && step.required && (!hasRequiredPhotos || !hasCompletedCheckpoints)) {
      if (!hasRequiredPhotos) {
        setSelectedStep(step);
        setPhotoModalOpen(true);
        toast({
          title: "Photos Required",
          description: `Please take ${step.requiredPhotos || 1} photo${(step.requiredPhotos || 1) > 1 ? 's' : ''} before completing this step.`,
          variant: "destructive",
        });
        return;
      }
      
      if (!hasCompletedCheckpoints) {
        toast({
          title: "Checkpoints Required",
          description: "Please complete all checkpoints before marking this step as complete.",
          variant: "destructive",
        });
        return;
      }
    }
    
    onStepToggle(stepId, completed);
    
    if (completed) {
      toast({
        title: "Step Completed",
        description: step?.name || "SOP step marked as complete",
      });
    }
  }, [template.steps, stepPhotos, stepCheckpoints, onStepToggle, toast]);

  const handlePhotoCapture = useCallback((stepId: string, photoUrl: string) => {
    onPhotoCapture(stepId, photoUrl);
    
    // Auto-complete the step when photo is captured
    // Check completion status at the time of capture to avoid dependency loop
    const isAlreadyCompleted = completedSteps.includes(stepId);
    if (!isAlreadyCompleted) {
      onStepToggle(stepId, true);
    }
  }, [onPhotoCapture, onStepToggle]);

  const openPhotoModal = useCallback((step: SOPStep) => {
    setSelectedStep(step);
    setPhotoModalOpen(true);
  }, []);

  const categoryColors = {
    preparation: 'bg-blue-100 text-blue-800',
    cleaning: 'bg-green-100 text-green-800',
    service: 'bg-purple-100 text-purple-800',
    interior: 'bg-orange-100 text-orange-800',
    finishing: 'bg-indigo-100 text-indigo-800',
    quality: 'bg-emerald-100 text-emerald-800',
    inspection: 'bg-yellow-100 text-yellow-800',
    safety: 'bg-red-100 text-red-800',
    enhancement: 'bg-pink-100 text-pink-800',
    protection: 'bg-cyan-100 text-cyan-800',
    verification: 'bg-gray-100 text-gray-800',
    general: 'bg-gray-100 text-gray-800'
  };

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Header */}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold truncate">{template.serviceName}</h3>
          <Badge variant="outline" className="text-xs">
            {template.totalSteps} Steps
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Overall Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Required: {requiredStepsCompleted.completed}/{requiredStepsCompleted.total}</span>
            <span>Est. {template.estimatedDurationMinutes}min</span>
          </div>
        </div>
      </CardHeader>

      {/* Steps List */}
      <CardContent className="flex-1 overflow-auto p-0">
        <div className="px-6 space-y-4">
          {Object.entries(stepsByCategory).map(([category, steps]) => (
            <div key={category} className="space-y-2">
              {/* Category Header */}
              <div 
                className="flex items-center justify-between py-2 px-3 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900"
                onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
              >
                <div className="flex items-center gap-2">
                  <Badge className={`text-xs ${categoryColors[category as keyof typeof categoryColors] || categoryColors.general}`}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {steps.filter(s => completedSteps.includes(s.stepId)).length}/{steps.length}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {expandedCategory === category ? (
                    <Pause className="h-3 w-3" />
                  ) : (
                    <Play className="h-3 w-3" />
                  )}
                </div>
              </div>

              {/* Steps in Category */}
              {(expandedCategory === category || expandedCategory === null) && (
                <div className="space-y-2 ml-2">
                  {steps.map(step => {
                    const stepIndex = template.steps.findIndex(s => s.stepId === step.stepId);
                    return (
                      <StepItem
                        key={step.stepId}
                        step={step}
                        isCompleted={completedSteps.includes(step.stepId)}
                        photos={stepPhotos[step.stepId] || []}
                        onToggle={(completed) => handleStepToggle(step.stepId, completed)}
                        onPhotoCapture={() => openPhotoModal(step)}
                        isReadOnly={isReadOnly}
                        stepIndex={stepIndex}
                        totalSteps={template.steps.length}
                        completedCheckpoints={stepCheckpoints[step.stepId] || []}
                        onCheckpointToggle={(checkpoint, completed) => handleCheckpointToggle(step.stepId, checkpoint, completed)}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>

      {/* Photo Capture Modal */}
      {selectedStep && (
        <PhotoCaptureModal
          open={photoModalOpen}
          onOpenChange={setPhotoModalOpen}
          stepName={selectedStep.name}
          stepId={selectedStep.stepId}
          photoType={selectedStep.photoType}
          onPhotoCapture={handlePhotoCapture}
          existingPhotos={stepPhotos[selectedStep.stepId] || []}
        />
      )}
    </div>
  );
}