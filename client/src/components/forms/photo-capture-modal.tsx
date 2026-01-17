import { useState, useRef, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Camera, 
  X, 
  Check, 
  RotateCcw, 
  ImageIcon, 
  Video, 
  Eye, 
  Target,
  Grid3X3,
  Sun,
  Smartphone,
  ZoomIn,
  Clock,
  AlertCircle,
  CheckCircle2,
  Info,
  ArrowRight,
  ArrowLeft,
  Pause,
  Square
} from "lucide-react";

interface PhotoCaptureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stepName: string;
  stepId: string;
  photoType?: 'before' | 'after' | 'process' | 'damage' | 'inspection';
  onPhotoCapture: (stepId: string, photoUrl: string, mediaType?: 'photo' | 'video') => void;
  existingPhotos?: string[];
  requiredPhotos?: number;
  photoInstructions?: string;
  instructions?: string;
  checkpoints?: string[];
  area?: 'interior' | 'exterior' | 'engine' | 'trunk' | 'damage' | 'general';
  allowVideo?: boolean;
  videoTimeLimit?: number;
}

interface CaptureGuide {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  tips: string[];
}

interface QualityIndicator {
  type: 'error' | 'warning' | 'success';
  message: string;
  suggestion?: string;
}

export default function PhotoCaptureModal({ 
  open, 
  onOpenChange, 
  stepName, 
  stepId, 
  photoType = 'process',
  onPhotoCapture,
  existingPhotos = [],
  requiredPhotos = 1,
  photoInstructions,
  instructions,
  checkpoints = [],
  area = 'general',
  allowVideo = false,
  videoTimeLimit = 30
}: PhotoCaptureModalProps) {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [captureMode, setCaptureMode] = useState<'photo' | 'video'>('photo');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [qualityFeedback, setQualityFeedback] = useState<QualityIndicator[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const remainingPhotos = requiredPhotos - existingPhotos.length;
  const canComplete = existingPhotos.length >= requiredPhotos;
  
  // Timer effect for video recording
  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= videoTimeLimit) {
            stopVideoRecording();
            return videoTimeLimit;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      setRecordingTime(0);
    }
    
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [isRecording, videoTimeLimit]);
  
  // Get capture guides based on photo type and area
  const getCaptureGuides = (): CaptureGuide[] => {
    const guides: CaptureGuide[] = [];
    
    if (photoType === 'before' || photoType === 'after') {
      guides.push({
        id: 'angles',
        title: 'Multiple Angles',
        description: 'Capture from different angles',
        icon: <Target className="h-4 w-4" />,
        tips: ['Front, rear, both sides', 'Include surrounding area', 'Consistent lighting']
      });
    }
    
    if (area === 'damage' || photoType === 'damage') {
      guides.push({
        id: 'scale',
        title: 'Size Reference',
        description: 'Include scale reference',
        icon: <ZoomIn className="h-4 w-4" />,
        tips: ['Use coin or ruler', 'Close-up of damage', 'Multiple angles of same damage']
      });
    }
    
    if (area === 'interior') {
      guides.push({
        id: 'lighting',
        title: 'Interior Lighting',
        description: 'Ensure adequate lighting',
        icon: <Sun className="h-4 w-4" />,
        tips: ['Turn on interior lights', 'Avoid shadows', 'Clear view of surfaces']
      });
    }
    
    guides.push({
      id: 'focus',
      title: 'Sharp Focus',
      description: 'Ensure image is clear',
      icon: <Eye className="h-4 w-4" />,
      tips: ['Tap to focus', 'Hold steady', 'Good lighting']
    });
    
    return guides;
  };
  
  // Enhanced photo quality validation
  const validatePhotoQuality = (imageData: string): QualityIndicator[] => {
    const indicators: QualityIndicator[] = [];
    
    // File size analysis
    const sizeKB = imageData.length * 0.75 / 1024; // Approximate size in KB
    
    if (sizeKB < 50) {
      indicators.push({
        type: 'error',
        message: 'Image file too small',
        suggestion: 'Ensure camera is focused and try again'
      });
    } else if (sizeKB < 100) {
      indicators.push({
        type: 'warning',
        message: 'Image quality may be low',
        suggestion: 'Clean camera lens and ensure good lighting'
      });
    }
    
    // Check for very large files (might indicate blur or poor compression)
    if (sizeKB > 2000) {
      indicators.push({
        type: 'warning',
        message: 'Large file size detected',
        suggestion: 'Image may be blurry - try holding steady'
      });
    }
    
    // Area-specific validation
    if (area === 'interior' && sizeKB < 80) {
      indicators.push({
        type: 'warning',
        message: 'Interior photos need good lighting',
        suggestion: 'Turn on interior lights and cabin lights'
      });
    }
    
    if (photoType === 'damage' && sizeKB < 120) {
      indicators.push({
        type: 'warning',
        message: 'Damage documentation needs clear detail',
        suggestion: 'Move closer and ensure sharp focus on damage'
      });
    }
    
    // Photo type specific guidance
    if (photoType === 'before' || photoType === 'after') {
      if (currentPhotoIndex === 0) {
        indicators.push({
          type: 'success',
          message: `Good ${photoType} photo captured`,
          suggestion: requiredPhotos > 1 ? 'Continue with additional angles' : undefined
        });
      }
    }
    
    if (indicators.length === 0) {
      indicators.push({
        type: 'success',
        message: 'Excellent image quality detected'
      });
    }
    
    return indicators;
  };
  
  // Get contextual help based on current step
  const getContextualHelp = (): string[] => {
    const tips: string[] = [];
    
    if (photoType === 'before') {
      tips.push('Capture the initial condition before any work begins');
      tips.push('Include surrounding area for context');
      tips.push('Ensure adequate lighting for clear documentation');
    }
    
    if (photoType === 'damage') {
      tips.push('Include a size reference like a coin or ruler');
      tips.push('Take multiple angles of the same damage');
      tips.push('Capture close-up details and wider context shots');
    }
    
    if (area === 'interior') {
      tips.push('Turn on all interior lights');
      tips.push('Clean any dust or debris from surfaces');
      tips.push('Capture from multiple seating positions');
    }
    
    if (area === 'exterior') {
      tips.push('Walk around the vehicle for complete coverage');
      tips.push('Avoid harsh shadows - use even lighting');
      tips.push('Include wheels, trim, and glass surfaces');
    }
    
    return tips;
  };
  
  // Smart angle detection (simulation)
  const getAngleGuidance = (): string => {
    if (photoType === 'before' || photoType === 'after') {
      const angles = ['Front 45°', 'Rear 45°', 'Driver Side', 'Passenger Side'];
      return angles[currentPhotoIndex] || 'Additional angle';
    }
    
    if (area === 'damage') {
      return currentPhotoIndex === 0 ? 'Wide shot with context' : 'Close-up detail shot';
    }
    
    return 'Optimal angle for documentation';
  };
  
  const getPhotoTypeColor = () => {
    switch (photoType) {
      case 'before': return 'bg-blue-500';
      case 'after': return 'bg-green-500';
      case 'process': return 'bg-orange-500';
      case 'damage': return 'bg-red-500';
      case 'inspection': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };
  
  const getPhotoTypeGuidance = () => {
    switch (photoType) {
      case 'before': return 'Capture the initial state before starting work';
      case 'after': return 'Capture the final result after completion';
      case 'process': return 'Document the work in progress';
      case 'damage': return 'Document any damage or issues found';
      case 'inspection': return 'Capture evidence for inspection verification';
      default: return 'Capture photo as required';
    }
  };

  // Initialize camera stream
  const startCamera = useCallback(async () => {
    try {
      const constraints = {
        video: { 
          width: { ideal: 1920 }, 
          height: { ideal: 1080 },
          facingMode: { ideal: 'environment' } // Use back camera on mobile
        },
        audio: allowVideo // Include audio for video recording
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
        
        // Setup media recorder for video capture
        if (allowVideo && MediaRecorder.isTypeSupported('video/webm')) {
          const recorder = new MediaRecorder(stream, {
            mimeType: 'video/webm'
          });
          setMediaRecorder(recorder);
        }
      }
    } catch (error) {
      console.error('Camera access error:', error);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please try uploading a photo instead.",
        variant: "destructive",
      });
    }
  }, [toast, allowVideo]);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  }, []);

  // Capture photo from camera
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (context && video.videoWidth > 0) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      const photoUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedPhoto(photoUrl);
      
      // Validate photo quality
      const qualityIndicators = validatePhotoQuality(photoUrl);
      setQualityFeedback(qualityIndicators);
      
      if (!allowVideo) {
        stopCamera();
      }
    }
  }, [stopCamera, allowVideo]);
  
  // Start video recording
  const startVideoRecording = useCallback(() => {
    if (!mediaRecorder || isRecording) return;
    
    const chunks: BlobPart[] = [];
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const videoUrl = URL.createObjectURL(blob);
      setRecordedVideo(videoUrl);
    };
    
    mediaRecorder.start();
    setIsRecording(true);
  }, [mediaRecorder, isRecording]);
  
  // Stop video recording
  const stopVideoRecording = useCallback(() => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  }, [mediaRecorder, isRecording]);

  // Handle file upload
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setCapturedPhoto(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Save captured media
  const saveMedia = useCallback(async () => {
    const mediaToSave = captureMode === 'photo' ? capturedPhoto : recordedVideo;
    if (!mediaToSave) return;
    
    setIsProcessing(true);
    try {
      // In production, upload to cloud storage
      // For now, using base64 data URL or blob URL
      onPhotoCapture(stepId, mediaToSave, captureMode);
      
      const newPhotoCount = existingPhotos.length + 1;
      const stillNeedMore = newPhotoCount < requiredPhotos;
      
      toast({
        title: captureMode === 'photo' ? "Photo Saved" : "Video Saved",
        description: stillNeedMore 
          ? `${captureMode} saved (${newPhotoCount}/${requiredPhotos}). ${requiredPhotos - newPhotoCount} more needed.`
          : `${captureMode} evidence completed for: ${stepName}`,
      });
      
      setCapturedPhoto(null);
      setRecordedVideo(null);
      setQualityFeedback([]);
      
      // Move to next photo if more needed
      if (stillNeedMore) {
        setCurrentPhotoIndex(prev => Math.min(prev + 1, requiredPhotos - 1));
        if (isStreaming) {
          // Continue with camera for next photo
        } else {
          startCamera();
        }
      } else {
        onOpenChange(false);
      }
    } catch (error) {
      toast({
        title: "Save Failed",
        description: `Failed to save ${captureMode}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [capturedPhoto, recordedVideo, captureMode, stepId, stepName, onPhotoCapture, toast, onOpenChange, existingPhotos.length, requiredPhotos, currentPhotoIndex, isStreaming, startCamera]);

  // Reset and retake
  const retakeMedia = useCallback(() => {
    setCapturedPhoto(null);
    setRecordedVideo(null);
    setQualityFeedback([]);
    if (!isStreaming) {
      startCamera();
    }
  }, [startCamera, isStreaming]);
  
  // Toggle capture mode
  const toggleCaptureMode = useCallback(() => {
    if (allowVideo) {
      setCaptureMode(prev => prev === 'photo' ? 'video' : 'photo');
      setCapturedPhoto(null);
      setRecordedVideo(null);
      setQualityFeedback([]);
    }
  }, [allowVideo]);
  
  // Next/Previous photo guidance
  const nextPhoto = useCallback(() => {
    if (currentPhotoIndex < requiredPhotos - 1) {
      setCurrentPhotoIndex(prev => prev + 1);
      setCapturedPhoto(null);
      setRecordedVideo(null);
      setQualityFeedback([]);
    }
  }, [currentPhotoIndex, requiredPhotos]);
  
  const previousPhoto = useCallback(() => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(prev => prev - 1);
      setCapturedPhoto(null);
      setRecordedVideo(null);
      setQualityFeedback([]);
    }
  }, [currentPhotoIndex]);

  // Close modal handler
  const handleClose = useCallback(() => {
    stopCamera();
    if (isRecording) {
      stopVideoRecording();
    }
    setCapturedPhoto(null);
    setRecordedVideo(null);
    setQualityFeedback([]);
    setCurrentPhotoIndex(0);
    onOpenChange(false);
  }, [stopCamera, isRecording, stopVideoRecording, onOpenChange]);

  // Start camera when modal opens
  const handleOpenChange = useCallback((open: boolean) => {
    if (open && !capturedPhoto && !recordedVideo) {
      startCamera();
    } else if (!open) {
      handleClose();
    }
    onOpenChange(open);
  }, [capturedPhoto, recordedVideo, startCamera, handleClose, onOpenChange]);
  
  // Mobile optimization - handle orientation changes
  useEffect(() => {
    const handleOrientationChange = () => {
      // Restart camera on orientation change for better mobile experience
      if (isStreaming) {
        setTimeout(() => {
          stopCamera();
          startCamera();
        }, 500);
      }
    };
    
    window.addEventListener('orientationchange', handleOrientationChange);
    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [isStreaming, stopCamera, startCamera]);
  
  // Get mobile-optimized button size
  const getMobileButtonSize = () => {
    const isMobile = window.innerWidth < 768;
    return isMobile ? 'w-24 h-24' : 'w-20 h-20';
  };
  
  // Get current angle guidance
  const currentAngleGuidance = getAngleGuidance();
  const contextualHelp = getContextualHelp();

  const photoTypeColors = {
    before: 'bg-blue-500',
    after: 'bg-green-500',
    process: 'bg-orange-500',
    damage: 'bg-red-500'
  };

  const captureGuides = getCaptureGuides();
  const hasMedia = capturedPhoto || recordedVideo;
  const currentGuide = captureGuides[currentPhotoIndex] || captureGuides[0];
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl w-full h-[90vh] max-h-[700px] md:max-h-[600px] p-0 overflow-hidden touch-manipulation">
        <DialogHeader className="p-3 pb-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <DialogTitle className="text-lg font-semibold">{stepName}</DialogTitle>
              <Badge className={`${getPhotoTypeColor()} text-white text-xs`}>
                {photoType.toUpperCase()}
              </Badge>
              {area !== 'general' && (
                <Badge variant="outline" className="text-xs">
                  {area.toUpperCase()}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {allowVideo && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleCaptureMode}
                  data-testid="button-toggle-capture-mode"
                >
                  {captureMode === 'photo' ? <Video className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
                  {captureMode === 'photo' ? 'Video' : 'Photo'}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowGrid(!showGrid)}
                className={showGrid ? 'bg-blue-100' : ''}
                data-testid="button-toggle-grid"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleClose} data-testid="button-close-photo-modal">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Enhanced Photo Requirements and Guidance */}
          <div className="space-y-3">
            {/* Progress and Requirements */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  <span className="text-muted-foreground">Progress:</span>
                  <Badge variant={canComplete ? "default" : "secondary"} className="text-xs ml-2">
                    {existingPhotos.length + (hasMedia ? 1 : 0)}/{requiredPhotos}
                    {canComplete && " ✓"}
                  </Badge>
                </div>
                {requiredPhotos > 1 && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Current:</span>
                    <Badge variant="outline" className="text-xs ml-2">
                      {currentPhotoIndex + 1} of {requiredPhotos}
                    </Badge>
                  </div>
                )}
              </div>
              
              {/* Photo Navigation */}
              {requiredPhotos > 1 && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={previousPhoto}
                    disabled={currentPhotoIndex === 0}
                    data-testid="button-previous-photo"
                  >
                    <ArrowLeft className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextPhoto}
                    disabled={currentPhotoIndex >= requiredPhotos - 1}
                    data-testid="button-next-photo"
                  >
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
            
            <Progress value={(existingPhotos.length / requiredPhotos) * 100} className="h-2" />
            
            {/* Enhanced Current Guidance */}
            {showGuide && (
              <div className="space-y-3">
                {/* Angle Guidance */}
                <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-green-900 text-sm flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Recommended Angle: {currentAngleGuidance}
                      </h4>
                      <Badge className="bg-green-600 text-white text-xs">
                        {currentPhotoIndex + 1} of {requiredPhotos}
                      </Badge>
                    </div>
                    <p className="text-green-800 text-xs">
                      {photoType === 'before' && 'Position camera to show vehicle from this angle for initial documentation'}
                      {photoType === 'after' && 'Capture final result from this angle to match initial photos'}
                      {photoType === 'damage' && (currentPhotoIndex === 0 ? 'Start with overview showing damage location' : 'Get close-up detail of damage area')}
                      {photoType === 'process' && 'Document work in progress from optimal viewing angle'}
                      {photoType === 'inspection' && 'Position for clear inspection documentation'}
                    </p>
                  </CardContent>
                </Card>
                
                {/* Current Guide */}
                {currentGuide && (
                  <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200">
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <div className="text-blue-600 mt-0.5">{currentGuide.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-blue-900 dark:text-blue-100 text-sm">
                              {currentGuide.title}
                            </h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowGuide(false)}
                              className="h-6 w-6 p-0 text-blue-600"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-blue-800 dark:text-blue-200 text-xs mb-2">
                            {currentGuide.description}
                          </p>
                          <ul className="text-blue-700 dark:text-blue-300 text-xs space-y-1">
                            {currentGuide.tips.map((tip, index) => (
                              <li key={index} className="flex items-center gap-1">
                                <div className="w-1 h-1 bg-blue-600 rounded-full" />
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Contextual Help */}
                {contextualHelp.length > 0 && (
                  <Card className="bg-amber-50 border-amber-200">
                    <CardContent className="p-3">
                      <h4 className="font-medium text-amber-900 text-sm flex items-center gap-2 mb-2">
                        <Info className="h-4 w-4" />
                        Pro Tips for {area} {photoType} photos:
                      </h4>
                      <ul className="text-amber-800 text-xs space-y-1">
                        {contextualHelp.map((tip, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-1 h-1 bg-amber-600 rounded-full mt-1.5 flex-shrink-0" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
            
            {/* Instructions */}
            {photoInstructions && (
              <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded text-sm border border-amber-200">
                <p className="font-medium mb-1 flex items-center gap-1 text-amber-800 dark:text-amber-200">
                  <Info className="h-3 w-3" />
                  Photo Instructions:
                </p>
                <p className="text-amber-700 dark:text-amber-300 text-xs">{photoInstructions}</p>
              </div>
            )}
            
            {/* Checkpoints */}
            {checkpoints.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-950 p-3 rounded border">
                <p className="font-medium mb-2 text-sm flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Quality Checkpoints:
                </p>
                <div className="grid grid-cols-1 gap-1">
                  {checkpoints.map((checkpoint, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      <div className="w-1 h-1 bg-gray-400 rounded-full" />
                      <span className="text-gray-700 dark:text-gray-300">{checkpoint}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 flex">
          {/* Camera/Media View */}
          <div className="flex-1 bg-black relative flex items-center justify-center">
            {/* Grid Overlay */}
            {showGrid && isStreaming && (
              <div className="absolute inset-0 pointer-events-none z-10">
                <div className="w-full h-full grid grid-cols-3 grid-rows-3">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="border border-white/30" />
                  ))}
                </div>
              </div>
            )}
            
            {/* Recording Indicator */}
            {isRecording && (
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="text-sm font-medium">
                  REC {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                </span>
              </div>
            )}
            
            {/* Quality Feedback Overlay */}
            {qualityFeedback.length > 0 && (
              <div className="absolute top-4 right-4 z-20 space-y-2">
                {qualityFeedback.map((feedback, index) => (
                  <div key={index} className={`px-3 py-1 rounded text-sm flex items-center gap-2 ${
                    feedback.type === 'error' ? 'bg-red-600 text-white' :
                    feedback.type === 'warning' ? 'bg-yellow-600 text-white' :
                    'bg-green-600 text-white'
                  }`}>
                    {feedback.type === 'error' ? <AlertCircle className="h-3 w-3" /> :
                     feedback.type === 'warning' ? <AlertCircle className="h-3 w-3" /> :
                     <CheckCircle2 className="h-3 w-3" />}
                    {feedback.message}
                  </div>
                ))}
              </div>
            )}
            
            {/* Media Display */}
            {capturedPhoto ? (
              <img 
                src={capturedPhoto} 
                alt="Captured"
                className="max-w-full max-h-full object-contain"
                data-testid="captured-photo"
              />
            ) : recordedVideo ? (
              <video
                src={recordedVideo}
                controls
                className="max-w-full max-h-full object-contain"
                data-testid="recorded-video"
              />
            ) : isStreaming ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="max-w-full max-h-full object-contain"
                data-testid="camera-video"
              />
            ) : (
              <div className="text-white text-center p-8">
                <div className="mb-4">
                  {captureMode === 'photo' ? 
                    <Camera className="h-16 w-16 mx-auto opacity-50" /> :
                    <Video className="h-16 w-16 mx-auto opacity-50" />
                  }
                </div>
                <p className="text-lg mb-2">
                  {captureMode === 'photo' ? 'Camera' : 'Video'} Loading...
                </p>
                <p className="text-sm opacity-75">Please allow camera access</p>
              </div>
            )}
            
            <canvas ref={canvasRef} className="hidden" />
          </div>
          
          {/* Side Panel with Detailed Guidance - Hidden on mobile */}
          {showGuide && captureGuides.length > 0 && (
            <div className="hidden lg:block w-80 bg-gray-50 dark:bg-gray-900 border-l">
              <ScrollArea className="h-full">
                <div className="p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm">Capture Guide</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowGuide(false)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  {captureGuides.map((guide, index) => (
                    <Card key={guide.id} className={`transition-all ${
                      index === currentPhotoIndex ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : ''
                    }`}>
                      <CardContent className="p-3">
                        <div className="flex items-start gap-2 mb-2">
                          <div className="text-blue-600 mt-0.5">{guide.icon}</div>
                          <div>
                            <h4 className="font-medium text-sm">{guide.title}</h4>
                            <p className="text-xs text-muted-foreground">{guide.description}</p>
                          </div>
                        </div>
                        <ul className="space-y-1">
                          {guide.tips.map((tip, tipIndex) => (
                            <li key={tipIndex} className="flex items-start gap-2 text-xs">
                              <div className="w-1 h-1 bg-blue-600 rounded-full mt-2" />
                              <span className="text-gray-700 dark:text-gray-300">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

          {/* Enhanced Controls */}
          <div className="p-3 bg-card border-t">
            {hasMedia ? (
              <div className="space-y-3">
                {/* Quality Feedback */}
                {qualityFeedback.length > 0 && (
                  <div className="space-y-2">
                    {qualityFeedback.map((feedback, index) => (
                      <div key={index} className={`p-2 rounded text-sm flex items-center gap-2 ${
                        feedback.type === 'error' ? 'bg-red-50 text-red-800 border-red-200' :
                        feedback.type === 'warning' ? 'bg-yellow-50 text-yellow-800 border-yellow-200' :
                        'bg-green-50 text-green-800 border-green-200'
                      } border`}>
                        {feedback.type === 'error' ? <AlertCircle className="h-4 w-4" /> :
                         feedback.type === 'warning' ? <AlertCircle className="h-4 w-4" /> :
                         <CheckCircle2 className="h-4 w-4" />}
                        <div className="flex-1">
                          <p className="font-medium">{feedback.message}</p>
                          {feedback.suggestion && (
                            <p className="text-xs opacity-75 mt-1">{feedback.suggestion}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex items-center justify-center gap-4">
                  <Button 
                    variant="outline" 
                    onClick={retakeMedia}
                    data-testid="button-retake-media"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Retake
                  </Button>
                  <Button 
                    onClick={saveMedia}
                    disabled={isProcessing}
                    className="bg-green-600 hover:bg-green-700 text-white px-8"
                    data-testid="button-save-media"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    {isProcessing ? 'Saving...' : `Save ${captureMode === 'photo' ? 'Photo' : 'Video'}`}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Mobile-Optimized Capture Mode Info */}
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-2">
                    {captureMode === 'photo' ? '📸 Tap to capture photo' : `🎥 Record up to ${videoTimeLimit}s video`}
                  </div>
                  {/* Mobile guidance shortcuts */}
                  <div className="md:hidden bg-blue-50 p-2 rounded text-xs text-blue-800 mb-2">
                    <strong>{currentAngleGuidance}</strong>
                    {contextualHelp.length > 0 && (
                      <div className="mt-1 text-blue-700">
                        💡 {contextualHelp[0]}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Controls Row */}
                <div className="flex items-center justify-center gap-4">
                  {/* Upload from gallery */}
                  <Button 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                    data-testid="button-upload-photo"
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                  
                  {/* Main Capture Button */}
                  {captureMode === 'photo' ? (
                    <Button
                      onClick={capturePhoto}
                      disabled={!isStreaming}
                      size="lg"
                      className={`bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white ${getMobileButtonSize()} rounded-full p-0 transition-all transform active:scale-95 touch-manipulation`}
                      data-testid="button-capture-photo"
                    >
                      <Camera className="h-8 w-8" />
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={isRecording ? stopVideoRecording : startVideoRecording}
                        disabled={!isStreaming || !mediaRecorder}
                        size="lg"
                        className={`w-20 h-20 rounded-full p-0 ${
                          isRecording 
                            ? 'bg-red-600 hover:bg-red-700 text-white' 
                            : 'bg-red-500 hover:bg-red-600 text-white'
                        }`}
                        data-testid="button-record-video"
                      >
                        {isRecording ? <Square className="h-8 w-8" /> : <Video className="h-8 w-8" />}
                      </Button>
                      
                      {isRecording && (
                        <div className="text-sm text-red-600 font-medium">
                          {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                          <br />
                          <span className="text-xs text-gray-500">/ {videoTimeLimit}s</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Show Guide Toggle */}
                  {!showGuide && captureGuides.length > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => setShowGuide(true)}
                      data-testid="button-show-guide"
                    >
                      <Info className="h-4 w-4 mr-2" />
                      Guide
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* Existing photos indicator */}
        {existingPhotos.length > 0 && (
          <div className="absolute top-16 right-4">
            <Badge variant="secondary" className="text-xs">
              {existingPhotos.length} photo{existingPhotos.length > 1 ? 's' : ''} saved
            </Badge>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}