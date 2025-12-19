import { useState, useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Camera, 
  Image as ImageIcon, 
  CheckCircle2, 
  AlertTriangle,
  Plus,
  X,
  Eye,
  Trash2,
  Video,
  Target,
  MapPin,
  Clock,
  Star,
  Zap,
  Filter,
  Grid3X3,
  Info,
  TrendingUp,
  Award,
  Timer,
  PlayCircle
} from "lucide-react";
import { JobCard } from "@/lib/types";
import PhotoCaptureModal from "@/components/forms/photo-capture-modal";
import { getSOPTemplate } from "@/lib/sop-templates";
import { apiRequest } from "@/lib/queryClient";

interface PhotoSlideoutPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobCard: JobCard | null;
}

interface PhotoStep {
  stepId: string;
  stepName: string;
  photoType: 'before' | 'after' | 'process' | 'damage' | 'inspection';
  required: boolean;
  photos: string[];
  completed: boolean;
  requiredPhotos?: number;
  photoInstructions?: string;
  instructions?: string;
  area?: 'interior' | 'exterior' | 'engine' | 'trunk' | 'general';
  category?: string;
  checkpoints?: string[];
  estimatedTimeMinutes?: number;
}

interface AreaProgress {
  area: string;
  total: number;
  completed: number;
  required: number;
  completedRequired: number;
  steps: PhotoStep[];
}

interface QualityMetrics {
  totalPhotos: number;
  requiredPhotos: number;
  completedRequired: number;
  qualityScore: number;
  timeSpent: number;
  efficiencyRating: 'excellent' | 'good' | 'needs-improvement';
}

export default function PhotoSlideoutPanel({
  open,
  onOpenChange,
  jobCard
}: PhotoSlideoutPanelProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedStep, setSelectedStep] = useState<PhotoStep | null>(null);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [selectedPhotoForView, setSelectedPhotoForView] = useState<string | null>(null);
  const [activeArea, setActiveArea] = useState<string>('all');
  const [showOnlyRequired, setShowOnlyRequired] = useState(false);
  const [sortBy, setSortBy] = useState<'order' | 'priority' | 'area'>('order');
  const [showCompletedSteps, setShowCompletedSteps] = useState(true);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  // Enhanced photo steps with area grouping and quality metrics
  const photoSteps = useMemo(() => {
    if (!jobCard?.serviceType) return [];

    // Get SOP template and extract photo-required steps
    const template = getSOPTemplate(jobCard.serviceType);
    if (!template) return [];

    const photoRequiredSteps = template.steps.filter(step => step.photoRequired);
    
    // Get existing photo data from job card
    const existingChecklists = Array.isArray(jobCard.sopChecklists) ? jobCard.sopChecklists : [];
    
    return photoRequiredSteps.map(step => {
      const existingStep = existingChecklists.find((item: any) => item.stepId === step.stepId);
      return {
        stepId: step.stepId,
        stepName: step.name,
        photoType: step.photoType || 'process',
        required: step.required,
        photos: existingStep?.photos || [],
        completed: existingStep?.completed || false,
        requiredPhotos: step.requiredPhotos || 1,
        photoInstructions: step.photoInstructions,
        instructions: step.instructions,
        area: step.area || 'general',
        category: step.category,
        checkpoints: step.checkpoints || [],
        estimatedTimeMinutes: step.estimatedTimeMinutes
      };
    });
  }, [jobCard?.serviceType, jobCard?.sopChecklists]);
  
  // Group steps by area for better organization
  const areaProgress = useMemo((): AreaProgress[] => {
    const areas = ['exterior', 'interior', 'engine', 'trunk', 'general'];
    
    return areas.map(area => {
      const areaSteps = photoSteps.filter(step => step.area === area);
      const completed = areaSteps.filter(step => step.photos.length > 0).length;
      const required = areaSteps.filter(step => step.required).length;
      const completedRequired = areaSteps.filter(step => step.required && step.photos.length > 0).length;
      
      return {
        area,
        total: areaSteps.length,
        completed,
        required,
        completedRequired,
        steps: areaSteps
      };
    }).filter(area => area.total > 0);
  }, [photoSteps]);
  
  // Calculate quality metrics
  const qualityMetrics = useMemo((): QualityMetrics => {
    const totalPhotos = photoSteps.reduce((sum, step) => sum + step.photos.length, 0);
    const requiredPhotos = photoSteps.filter(step => step.required).length;
    const completedRequired = photoSteps.filter(step => step.required && step.photos.length > 0).length;
    const completionRate = requiredPhotos > 0 ? completedRequired / requiredPhotos : 0;
    
    let efficiencyRating: 'excellent' | 'good' | 'needs-improvement' = 'needs-improvement';
    if (completionRate >= 0.9) efficiencyRating = 'excellent';
    else if (completionRate >= 0.7) efficiencyRating = 'good';
    
    return {
      totalPhotos,
      requiredPhotos,
      completedRequired,
      qualityScore: Math.round(completionRate * 100),
      timeSpent: photoSteps.reduce((sum, step) => sum + (step.estimatedTimeMinutes || 0), 0),
      efficiencyRating
    };
  }, [photoSteps]);
  
  // Filter and sort steps based on user preferences
  const filteredSteps = useMemo(() => {
    let filtered = [...photoSteps];
    
    // Filter by area
    if (activeArea !== 'all') {
      filtered = filtered.filter(step => step.area === activeArea);
    }
    
    // Filter by required only
    if (showOnlyRequired) {
      filtered = filtered.filter(step => step.required);
    }
    
    // Filter completed steps
    if (!showCompletedSteps) {
      filtered = filtered.filter(step => step.photos.length === 0);
    }
    
    // Sort steps
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          if (a.required !== b.required) return a.required ? -1 : 1;
          return a.stepName.localeCompare(b.stepName);
        case 'area':
          if (a.area !== b.area) return a.area!.localeCompare(b.area!);
          return a.stepName.localeCompare(b.stepName);
        default:
          return a.stepName.localeCompare(b.stepName);
      }
    });
    
    return filtered;
  }, [photoSteps, activeArea, showOnlyRequired, showCompletedSteps, sortBy]);

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
      toast({
        title: "Photo Added",
        description: "Photo has been successfully added to the SOP step.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Photo Upload Failed",
        description: error.message || "Failed to add photo to SOP step",
        variant: "destructive",
      });
    },
  });

  const handlePhotoCapture = (stepId: string, photoUrl: string, mediaType?: 'photo' | 'video') => {
    addPhotoMutation.mutate({ stepId, photoUrl });
    
    // No need to update local state - photoSteps will be recomputed
    // when the mutation succeeds and queryClient.invalidateQueries runs
    
    setShowCameraModal(false);
    setSelectedStep(null);
  };

  const handleTakePhoto = (step: PhotoStep) => {
    setSelectedStep(step);
    setShowCameraModal(true);
  };
  
  // Smart recommendations for photo order
  const getNextRecommendedStep = (): PhotoStep | null => {
    // Prioritize required steps first
    const requiredIncomplete = photoSteps.filter(step => step.required && step.photos.length === 0);
    if (requiredIncomplete.length > 0) {
      return requiredIncomplete[0];
    }
    
    // Then optional steps
    const optionalIncomplete = photoSteps.filter(step => !step.required && step.photos.length === 0);
    return optionalIncomplete.length > 0 ? optionalIncomplete[0] : null;
  };
  
  const nextRecommendedStep = getNextRecommendedStep();

  const calculatePhotoProgress = () => {
    const totalRequired = photoSteps.filter(step => step.required).length;
    const completedRequired = photoSteps.filter(step => step.required && step.photos.length > 0).length;
    return totalRequired > 0 ? Math.round((completedRequired / totalRequired) * 100) : 100;
  };
  
  // Toggle step expansion
  const toggleStepExpansion = (stepId: string) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };
  
  // Get area icon
  const getAreaIcon = (area: string) => {
    switch (area) {
      case 'exterior': return '🚗';
      case 'interior': return '🪑';
      case 'engine': return '⚙️';
      case 'trunk': return '📦';
      default: return '📋';
    }
  };
  
  // Get efficiency color
  const getEfficiencyColor = (rating: string) => {
    switch (rating) {
      case 'excellent': return 'text-green-600 bg-green-50';
      case 'good': return 'text-blue-600 bg-blue-50';
      default: return 'text-orange-600 bg-orange-50';
    }
  };

  const getPhotoTypeColor = (photoType: string) => {
    switch (photoType) {
      case 'before': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'after': return 'bg-green-100 text-green-800 border-green-300';
      case 'process': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'damage': return 'bg-red-100 text-red-800 border-red-300';
      case 'inspection': return 'bg-purple-100 text-purple-800 border-purple-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPhotoTypeIcon = (photoType: string) => {
    switch (photoType) {
      case 'before': return '📋';
      case 'after': return '✅';
      case 'process': return '🔄';
      case 'damage': return '⚠️';
      case 'inspection': return '🔍';
      default: return '📸';
    }
  };
  
  // Get step priority level
  const getStepPriority = (step: PhotoStep): 'high' | 'medium' | 'low' => {
    if (step.required && step.photos.length === 0) return 'high';
    if (step.required && step.photos.length < (step.requiredPhotos || 1)) return 'medium';
    return 'low';
  };
  
  // Get step status
  const getStepStatus = (step: PhotoStep): 'complete' | 'partial' | 'pending' => {
    if (step.photos.length >= (step.requiredPhotos || 1)) return 'complete';
    if (step.photos.length > 0) return 'partial';
    return 'pending';
  };

  if (!jobCard) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full max-w-3xl">
          <SheetHeader>
            <SheetTitle>No Job Selected</SheetTitle>
            <SheetDescription>
              Select a job card to manage photos and videos
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full max-w-4xl p-0 overflow-hidden">
          <div className="flex flex-col h-full">
            {/* Enhanced Header */}
            <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <Camera className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <SheetTitle className="text-xl font-semibold text-gray-900">
                      Smart Photo Capture
                    </SheetTitle>
                    <SheetDescription className="text-sm text-gray-600">
                      Job #{jobCard.keyTag} • {jobCard.serviceType}
                    </SheetDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {nextRecommendedStep && (
                    <Button 
                      onClick={() => handleTakePhoto(nextRecommendedStep)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      size="sm"
                      data-testid="button-next-recommended"
                    >
                      <Zap className="h-4 w-4 mr-1" />
                      Next: {nextRecommendedStep.stepName}
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onOpenChange(false)}
                    data-testid="button-close-photo-panel"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Quality Metrics Dashboard */}
              <div className="grid grid-cols-4 gap-4 mb-4">
                <Card className="bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-3 text-center">
                    <div className="text-2xl font-bold text-blue-600">{qualityMetrics.qualityScore}%</div>
                    <div className="text-xs text-gray-600">Quality Score</div>
                  </CardContent>
                </Card>
                <Card className="bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-3 text-center">
                    <div className="text-2xl font-bold text-green-600">{qualityMetrics.completedRequired}</div>
                    <div className="text-xs text-gray-600">Required Done</div>
                  </CardContent>
                </Card>
                <Card className="bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-3 text-center">
                    <div className="text-2xl font-bold text-purple-600">{qualityMetrics.totalPhotos}</div>
                    <div className="text-xs text-gray-600">Total Photos</div>
                  </CardContent>
                </Card>
                <Card className="bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-3 text-center">
                    <div className={`text-lg font-bold px-2 py-1 rounded ${getEfficiencyColor(qualityMetrics.efficiencyRating)}`}>
                      <Award className="h-4 w-4 inline mr-1" />
                      {qualityMetrics.efficiencyRating.charAt(0).toUpperCase() + qualityMetrics.efficiencyRating.slice(1)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Progress Section */}
              <Card className="bg-white/60 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Overall Progress</span>
                    <span className="text-sm text-gray-600">
                      {qualityMetrics.completedRequired} of {qualityMetrics.requiredPhotos} required completed
                    </span>
                  </div>
                  <Progress value={calculatePhotoProgress()} className="mb-3" />
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>{photoSteps.filter(step => step.photos.length > 0).length} Captured</span>
                    </div>
                    {photoSteps.filter(step => step.required && step.photos.length === 0).length > 0 && (
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span className="text-red-600">
                          {photoSteps.filter(step => step.required && step.photos.length === 0).length} Required
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Timer className="h-4 w-4 text-blue-500" />
                      <span className="text-blue-600">~{qualityMetrics.timeSpent}min</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Content with Tabs */}
            <div className="flex-1">
              <Tabs defaultValue="capture" className="h-full flex flex-col">
                <div className="px-6 pt-4">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="capture" className="flex items-center gap-2">
                      <Camera className="h-4 w-4" />
                      Capture
                    </TabsTrigger>
                    <TabsTrigger value="areas" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      By Area
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Analytics
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="capture" className="flex-1 mt-0">
                  <div className="p-6 pt-4">
                    {/* Filters and Controls */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-gray-500" />
                        <select 
                          value={activeArea} 
                          onChange={(e) => setActiveArea(e.target.value)}
                          className="text-sm border rounded px-2 py-1"
                        >
                          <option value="all">All Areas</option>
                          {areaProgress.map(area => (
                            <option key={area.area} value={area.area}>
                              {area.area.charAt(0).toUpperCase() + area.area.slice(1)} ({area.completed}/{area.total})
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Checkbox
  id="required-only"
  checked={showOnlyRequired}
  onCheckedChange={(checked) => {
    // only accept boolean, ignore "indeterminate"
    if (typeof checked === "boolean") {
      setShowOnlyRequired(checked);
    }
  }}
/>

                        <label htmlFor="required-only" className="text-sm">Required only</label>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Checkbox
  id="show-completed"
  checked={showCompletedSteps}
  onCheckedChange={(checked) => {
    // only accept boolean, ignore "indeterminate"
    if (typeof checked === "boolean") {
      setShowCompletedSteps(checked);
    }
  }}
/>

                        <label htmlFor="show-completed" className="text-sm">Show completed</label>
                      </div>
                    </div>
                    
                    <ScrollArea className="h-[calc(100vh-420px)]">
                      <div className="space-y-4">
                        {filteredSteps.map((step) => {
                          const priority = getStepPriority(step);
                          const status = getStepStatus(step);
                          const isExpanded = expandedSteps.has(step.stepId);
                          
                          return (
                            <Card key={step.stepId} className={`transition-all border-l-4 ${
                              priority === 'high' ? 'border-l-red-500 bg-red-50/30' :
                              priority === 'medium' ? 'border-l-yellow-500 bg-yellow-50/30' :
                              'border-l-gray-300'
                            } ${
                              status === 'complete' ? 'bg-green-50/30' :
                              status === 'partial' ? 'bg-blue-50/30' : ''
                            }`}>
                              <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3 flex-1">
                                    <div className="relative">
                                      <span className="text-2xl">{getPhotoTypeIcon(step.photoType)}</span>
                                      {step.area && (
                                        <span className="absolute -top-1 -right-1 text-xs">
                                          {getAreaIcon(step.area)}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <CardTitle className="text-base font-medium">
                                          {step.stepName}
                                        </CardTitle>
                                        {step.required && (
                                          <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                                            Required
                                          </Badge>
                                        )}
                                        {step === nextRecommendedStep && (
                                          <Badge className="text-xs px-1.5 py-0.5 bg-green-600">
                                            <Zap className="h-3 w-3 mr-1" />Next
                                          </Badge>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Badge className={`text-xs border ${getPhotoTypeColor(step.photoType)}`}>
                                          {step.photoType.toUpperCase()}
                                        </Badge>
                                        {step.area && step.area !== 'general' && (
                                          <Badge variant="outline" className="text-xs">
                                            {step.area}
                                          </Badge>
                                        )}
                                        {step.photos.length > 0 && (
                                          <Badge className={`text-xs ${
                                            status === 'complete' ? 'bg-green-100 text-green-800' :
                                            'bg-blue-100 text-blue-800'
                                          }`}>
                                            {step.photos.length}/{step.requiredPhotos || 1} photos
                                          </Badge>
                                        )}
                                        {step.estimatedTimeMinutes && (
                                          <Badge variant="outline" className="text-xs">
                                            <Clock className="h-3 w-3 mr-1" />
                                            {step.estimatedTimeMinutes}min
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    {step.checkpoints && step.checkpoints.length > 0 && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => toggleStepExpansion(step.stepId)}
                                        className="h-8 w-8 p-0"
                                        data-testid={`button-expand-${step.stepId}`}
                                      >
                                        <Info className="h-4 w-4" />
                                      </Button>
                                    )}
                                    <Button 
                                      onClick={() => handleTakePhoto(step)}
                                      variant={priority === 'high' ? 'default' : 'outline'}
                                      size="sm"
                                      className={`flex items-center gap-2 ${
                                        priority === 'high' ? 'bg-red-600 hover:bg-red-700 text-white' : ''
                                      }`}
                                      data-testid={`button-add-photo-${step.stepId}`}
                                    >
                                      <Plus className="h-4 w-4" />
                                      {step.photos.length > 0 ? 'Add More' : 'Capture'}
                                    </Button>
                                  </div>
                                </div>
                                
                                {/* Progress bar for this step */}
                                {step.requiredPhotos && step.requiredPhotos > 1 && (
                                  <div className="mt-2">
                                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                      <span>Photo Progress</span>
                                      <span>{step.photos.length}/{step.requiredPhotos}</span>
                                    </div>
                                    <Progress 
                                      value={(step.photos.length / step.requiredPhotos) * 100} 
                                      className="h-2"
                                    />
                                  </div>
                                )}
                              </CardHeader>
                              
                              {/* Expanded Details */}
                              {isExpanded && step.checkpoints && step.checkpoints.length > 0 && (
                                <CardContent className="pt-0 pb-3">
                                  <div className="bg-gray-50 dark:bg-gray-900 rounded p-3">
                                    <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                                      <CheckCircle2 className="h-4 w-4" />
                                      Quality Checkpoints:
                                    </h4>
                                    <div className="grid grid-cols-1 gap-1">
                                      {step.checkpoints.map((checkpoint, index) => (
                                        <div key={index} className="flex items-start gap-2 text-sm">
                                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                          <span className="text-gray-700 dark:text-gray-300">{checkpoint}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </CardContent>
                              )}
                              
                              {/* Photo Gallery */}
                              {step.photos.length > 0 && (
                                <CardContent className="pt-0">
                                  <div className="grid grid-cols-4 gap-2">
                                    {step.photos.map((photoUrl:string, index:number) => (
                                      <div key={index} className="relative group">
                                        <img
                                          src={photoUrl}
                                          alt={`${step.stepName} photo ${index + 1}`}
                                          className="w-full h-16 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                                          onClick={() => setSelectedPhotoForView(photoUrl)}
                                        />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
                                          <Eye className="h-4 w-4 text-white" />
                                        </div>
                                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-5 w-5 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              // Handle photo deletion if needed
                                            }}
                                          >
                                            <X className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </CardContent>
                              )}
                            </Card>
                          );
                        })}

                        {filteredSteps.length === 0 && (
                          <div className="text-center py-8">
                            <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              {photoSteps.length === 0 ? 'No Photo Requirements' : 'No Steps Match Filters'}
                            </h3>
                            <p className="text-gray-600">
                              {photoSteps.length === 0 
                                ? 'This service type doesn\'t require photo documentation'
                                : 'Try adjusting your filters to see more steps'
                              }
                            </p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </TabsContent>
                
                <TabsContent value="areas" className="flex-1 mt-0">
                  <ScrollArea className="h-full">
                    <div className="p-6 space-y-4">
                      {areaProgress.map((area) => (
                        <Card key={area.area} className="overflow-hidden">
                          <CardHeader className="pb-3 bg-gradient-to-r from-gray-50 to-gray-100">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-3xl">{getAreaIcon(area.area)}</span>
                                <div>
                                  <CardTitle className="text-lg font-semibold capitalize">
                                    {area.area} Inspection
                                  </CardTitle>
                                  <div className="flex items-center gap-4 mt-1">
                                    <span className="text-sm text-gray-600">
                                      {area.completed}/{area.total} completed
                                    </span>
                                    <span className="text-sm text-gray-600">
                                      {area.completedRequired}/{area.required} required done
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-blue-600">
                                  {area.total > 0 ? Math.round((area.completed / area.total) * 100) : 0}%
                                </div>
                                <div className="text-xs text-gray-500">Complete</div>
                              </div>
                            </div>
                            <Progress value={area.total > 0 ? (area.completed / area.total) * 100 : 0} className="mt-3" />
                          </CardHeader>
                          
                          <CardContent className="p-4">
                            <div className="grid grid-cols-1 gap-2">
                              {area.steps.map((step) => {
                                const status = getStepStatus(step);
                                return (
                                  <div key={step.stepId} className={`flex items-center justify-between p-2 rounded border ${
                                    status === 'complete' ? 'bg-green-50 border-green-200' :
                                    status === 'partial' ? 'bg-blue-50 border-blue-200' :
                                    step.required ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
                                  }`}>
                                    <div className="flex items-center gap-2">
                                      <span className="text-lg">{getPhotoTypeIcon(step.photoType)}</span>
                                      <div>
                                        <div className="text-sm font-medium">{step.stepName}</div>
                                        <div className="flex items-center gap-1 text-xs text-gray-600">
                                          <Badge className={`text-xs border ${getPhotoTypeColor(step.photoType)}`}>
                                            {step.photoType}
                                          </Badge>
                                          {step.required && (
                                            <Badge variant="destructive" className="text-xs">Required</Badge>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {step.photos.length > 0 && (
                                        <Badge className={`text-xs ${
                                          status === 'complete' ? 'bg-green-100 text-green-800' :
                                          'bg-blue-100 text-blue-800'
                                        }`}>
                                          {step.photos.length}/{step.requiredPhotos || 1}
                                        </Badge>
                                      )}
                                      <Button
                                        onClick={() => handleTakePhoto(step)}
                                        variant="outline"
                                        size="sm"
                                        className="h-7 px-2 text-xs"
                                      >
                                        <Plus className="h-3 w-3 mr-1" />
                                        {step.photos.length > 0 ? 'Add' : 'Start'}
                                      </Button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="analytics" className="flex-1 mt-0">
                  <ScrollArea className="h-full">
                    <div className="p-6 space-y-6">
                      {/* Quality Metrics */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5" />
                            Quality Analytics
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                              <div className="text-3xl font-bold text-blue-600">{qualityMetrics.qualityScore}%</div>
                              <div className="text-sm text-blue-800">Overall Quality Score</div>
                            </div>
                            <div className={`text-center p-4 rounded-lg ${getEfficiencyColor(qualityMetrics.efficiencyRating)}`}>
                              <div className="text-lg font-bold">{qualityMetrics.efficiencyRating.toUpperCase()}</div>
                              <div className="text-sm">Efficiency Rating</div>
                            </div>
                          </div>
                          
                          <Separator />
                          
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Required Photos Completed</span>
                              <span className="font-medium">{qualityMetrics.completedRequired}/{qualityMetrics.requiredPhotos}</span>
                            </div>
                            <Progress value={(qualityMetrics.completedRequired / qualityMetrics.requiredPhotos) * 100} />
                            
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Total Photos Captured</span>
                              <span className="font-medium">{qualityMetrics.totalPhotos}</span>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Estimated Time Investment</span>
                              <span className="font-medium">{qualityMetrics.timeSpent} minutes</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      {/* Area Breakdown */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            Area Breakdown
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {areaProgress.map((area) => (
                              <div key={area.area} className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg">{getAreaIcon(area.area)}</span>
                                    <span className="font-medium capitalize">{area.area}</span>
                                  </div>
                                  <span className="text-sm text-gray-600">
                                    {area.completed}/{area.total} ({Math.round((area.completed / area.total) * 100) || 0}%)
                                  </span>
                                </div>
                                <Progress value={area.total > 0 ? (area.completed / area.total) * 100 : 0} className="h-2" />
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </div>

            {/* Enhanced Footer */}
            <div className="p-4 border-t bg-gray-50 dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <ImageIcon className="h-4 w-4" />
                    <span>{qualityMetrics.totalPhotos} Total Photos</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>{calculatePhotoProgress()}% Complete</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Timer className="h-4 w-4 text-blue-500" />
                    <span>~{qualityMetrics.timeSpent}min estimated</span>
                  </div>
                </div>
                
                {nextRecommendedStep && (
                  <Button 
                    onClick={() => handleTakePhoto(nextRecommendedStep)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    size="sm"
                  >
                    <PlayCircle className="h-4 w-4 mr-1" />
                    Continue with {nextRecommendedStep.stepName}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Enhanced Photo Capture Modal */}
      {selectedStep && (
        <PhotoCaptureModal
          open={showCameraModal}
          onOpenChange={setShowCameraModal}
          stepName={selectedStep.stepName}
          stepId={selectedStep.stepId}
          photoType={selectedStep.photoType}
          onPhotoCapture={handlePhotoCapture}
          existingPhotos={selectedStep.photos}
          requiredPhotos={selectedStep.requiredPhotos}
          photoInstructions={selectedStep.photoInstructions}
          instructions={selectedStep.instructions}
          checkpoints={selectedStep.checkpoints}
          area={selectedStep.area}
          allowVideo={true}
          videoTimeLimit={30}
        />
      )}

      {/* Photo View Modal */}
      {selectedPhotoForView && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPhotoForView(null)}
        >
          <div className="max-w-4xl max-h-full">
            <img
              src={selectedPhotoForView}
              alt="Full size photo"
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 text-white hover:bg-white/20"
            onClick={() => setSelectedPhotoForView(null)}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
      )}
    </>
  );
}