import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import POSLayout from "@/components/layout/pos-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Camera, 
  CheckCircle2, 
  Clock, 
  MapPin,
  User,
  AlertTriangle,
  Upload,
  Eye,
  Calendar,
  Wrench,
  Brush,
  Shield,
  Zap,
  ChevronRight,
  Star
} from "lucide-react";
import { format } from "date-fns";

// Task Completion Card Component with Photo Documentation
const TaskCard = ({ task, onAction }: { task: any; onAction: (action: string, task: any) => void }) => {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'cleaning': return <Brush className="h-4 w-4" />;
      case 'maintenance': return <Wrench className="h-4 w-4" />;
      case 'inspection': return <Eye className="h-4 w-4" />;
      case 'safety_check': return <Shield className="h-4 w-4" />;
      default: return <CheckCircle2 className="h-4 w-4" />;
    }
  };

  const getTaskTypeColor = (type: string) => {
    switch (type) {
      case 'cleaning': return 'text-blue-600';
      case 'maintenance': return 'text-orange-600';
      case 'inspection': return 'text-purple-600';
      case 'safety_check': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50/50 dark:bg-red-900/10';
      case 'medium': return 'border-l-orange-500 bg-orange-50/50 dark:bg-orange-900/10';
      case 'low': return 'border-l-green-500 bg-green-50/50 dark:bg-green-900/10';
      default: return 'border-l-gray-500 bg-gray-50/50 dark:bg-gray-900/10';
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
      
      // In production, upload to storage service
      setTimeout(() => {
        onAction('photo_uploaded', { ...task, photoUrl: URL.createObjectURL(file) });
      }, 1000);
    }
  };

  return (
    <Card className={`transition-all duration-500 hover:shadow-lg hover:scale-[1.02] cursor-pointer border-l-4 transform-gpu ${getPriorityColor(task.priority)}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className={`${getTaskTypeColor(task.taskType)}`}>
                {getTaskTypeIcon(task.taskType)}
              </div>
              <CardTitle className="text-lg font-semibold">{task.taskName}</CardTitle>
              <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'secondary' : 'outline'} className="text-xs">
                {task.priority.toUpperCase()}
              </Badge>
              {task.status === 'completed' && (
                <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  DONE
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {task.areaName}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {task.estimatedDuration}min
              </div>
              {task.completedBy && (
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {task.completedBy}
                </div>
              )}
            </div>
          </div>
          
          {task.status === 'completed' && task.qualityRating && (
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map((star) => (
                <Star 
                  key={star} 
                  className={`h-4 w-4 ${star <= task.qualityRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                />
              ))}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Task Description */}
          <p className="text-sm text-muted-foreground">{task.taskDescription}</p>
          
          {/* Safety Notes */}
          {task.safetyNotes && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border-l-2 border-l-yellow-400">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="font-medium text-sm text-yellow-800 dark:text-yellow-300">Safety Note</span>
              </div>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">{task.safetyNotes}</p>
            </div>
          )}

          {/* Equipment Needed */}
          {task.equipmentNeeded && task.equipmentNeeded.length > 0 && (
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-muted-foreground">Equipment:</span>
              <div className="flex gap-1 flex-wrap">
                {task.equipmentNeeded.map((item: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">{item}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Photo Documentation Section */}
          {task.requiresPhoto && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Camera className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Photo Documentation</span>
                  <Badge variant="outline" className="text-xs">Required</Badge>
                </div>
              </div>
              
              {task.photoInstructions && (
                <p className="text-xs text-muted-foreground mb-3 italic">📸 {task.photoInstructions}</p>
              )}

              {task.status === 'completed' && task.photoUrl ? (
                <div className="space-y-2">
                  <img 
                    src={task.photoUrl} 
                    alt={`${task.taskName} completion photo`}
                    className="w-full h-32 object-cover rounded border"
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>✅ Photo submitted</span>
                    <span>{format(new Date(task.completedAt), "MMM dd, h:mm a")}</span>
                  </div>
                </div>
              ) : photoPreview ? (
                <div className="space-y-2">
                  <img 
                    src={photoPreview} 
                    alt="Photo preview"
                    className="w-full h-32 object-cover rounded border"
                  />
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => onAction('complete', task)}
                    data-testid={`button-submit-${task.id}`}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Submit Task Completion
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <label htmlFor={`photo-upload-${task.id}`} className="block">
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-3 text-center hover:border-blue-400 transition-colors cursor-pointer">
                      {isUploading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span className="text-sm">Uploading...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="h-6 w-6 text-gray-400" />
                          <span className="text-sm text-muted-foreground">Tap to take photo</span>
                        </div>
                      )}
                    </div>
                  </label>
                  <input
                    id={`photo-upload-${task.id}`}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handlePhotoUpload}
                    data-testid={`input-photo-${task.id}`}
                  />
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          {task.status !== 'completed' && !task.requiresPhoto && (
            <Button 
              size="sm" 
              className="w-full"
              onClick={() => onAction('complete', task)}
              data-testid={`button-complete-${task.id}`}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Mark as Complete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Area Summary Card Component
const AreaSummaryCard = ({ area }: { area: any }) => {
  const completionRate = (area.completedTasks / area.totalTasks) * 100;
  
  return (
    <Card className="transition-all duration-300 hover:shadow-md">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-sm">{area.areaName}</h3>
            <p className="text-xs text-muted-foreground">{area.areaType.replace('_', ' ')}</p>
          </div>
          <Badge variant={completionRate === 100 ? 'default' : completionRate >= 50 ? 'secondary' : 'outline'}>
            {Math.round(completionRate)}%
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>Progress</span>
            <span>{area.completedTasks}/{area.totalTasks} tasks</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                completionRate === 100 ? 'bg-green-500' : 
                completionRate >= 50 ? 'bg-blue-500' : 'bg-orange-500'
              }`}
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function FacilityManagement() {
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Mock data for demonstration (replace with real API calls)
  const facilityAreas = [
    { id: '1', areaName: 'Service Bay 1', areaType: 'service_bay', totalTasks: 5, completedTasks: 4 },
    { id: '2', areaName: 'Customer Washroom', areaType: 'washroom', totalTasks: 3, completedTasks: 3 },
    { id: '3', areaName: 'Equipment Storage', areaType: 'equipment_area', totalTasks: 4, completedTasks: 2 },
    { id: '4', areaName: 'Office Area', areaType: 'office', totalTasks: 2, completedTasks: 1 }
  ];

  const facilityTasks = [
    {
      id: '1',
      taskName: 'Clean Service Bay Floor',
      taskDescription: 'Sweep and mop the entire service bay floor, remove oil stains',
      taskType: 'cleaning',
      areaName: 'Service Bay 1',
      priority: 'high',
      status: 'pending',
      estimatedDuration: 15,
      requiresPhoto: true,
      photoInstructions: 'Take photo of clean floor from bay entrance',
      safetyNotes: 'Ensure proper ventilation and wear slip-resistant shoes',
      equipmentNeeded: ['Industrial mop', 'Floor cleaner', 'Degreaser']
    },
    {
      id: '2',
      taskName: 'Check Vacuum Filter',
      taskDescription: 'Inspect and clean the main vacuum system filter',
      taskType: 'maintenance',
      areaName: 'Equipment Storage',
      priority: 'medium',
      status: 'completed',
      estimatedDuration: 10,
      requiresPhoto: true,
      photoUrl: 'https://via.placeholder.com/400x200/4ade80/ffffff?text=Clean+Filter',
      completedBy: 'John Smith',
      completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      qualityRating: 5,
      photoInstructions: 'Show before and after filter condition'
    },
    {
      id: '3',
      taskName: 'Sanitize Customer Washroom',
      taskDescription: 'Deep clean and sanitize all surfaces, restock supplies',
      taskType: 'cleaning',
      areaName: 'Customer Washroom',
      priority: 'high',
      status: 'completed',
      estimatedDuration: 20,
      requiresPhoto: true,
      photoUrl: 'https://via.placeholder.com/400x200/06b6d4/ffffff?text=Clean+Washroom',
      completedBy: 'Sarah Johnson',
      completedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      qualityRating: 4,
      safetyNotes: 'Use appropriate PPE and ensure proper ventilation'
    },
    {
      id: '4',
      taskName: 'Safety Equipment Inspection',
      taskDescription: 'Check fire extinguisher, first aid kit, and emergency exits',
      taskType: 'safety_check',
      areaName: 'Office Area',
      priority: 'high',
      status: 'pending',
      estimatedDuration: 25,
      requiresPhoto: true,
      photoInstructions: 'Photo of each safety equipment with status check',
      equipmentNeeded: ['Inspection checklist', 'Flashlight']
    },
    {
      id: '5',
      taskName: 'Equipment Calibration',
      taskDescription: 'Calibrate pressure washer and air compressor',
      taskType: 'maintenance',
      areaName: 'Equipment Storage',
      priority: 'medium',
      status: 'pending',
      estimatedDuration: 30,
      requiresPhoto: true,
      photoInstructions: 'Photo of equipment gauges and calibration readings'
    }
  ];

  const handleTaskAction = (action: string, task: any) => {
    
    if (action === 'complete') {
      alert(`✅ Task Completed!\n\n"${task.taskName}" has been marked as complete.\n\nGreat work maintaining facility standards!`);
    } else if (action === 'photo_uploaded') {
      alert(`📸 Photo Uploaded!\n\nPhoto documentation for "${task.taskName}" has been saved.\n\nTask is ready for completion.`);
    }
  };

  const filteredTasks = facilityTasks.filter(task => {
    const areaMatch = selectedArea === 'all' || task.areaName.includes(selectedArea);
    const statusMatch = filterStatus === 'all' || task.status === filterStatus;
    return areaMatch && statusMatch;
  });

  const overallProgress = facilityAreas.reduce((acc, area) => {
    return {
      total: acc.total + area.totalTasks,
      completed: acc.completed + area.completedTasks
    };
  }, { total: 0, completed: 0 });

  const overallCompletionRate = (overallProgress.completed / overallProgress.total) * 100;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="  p-3">
          
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold">
                  Facility Management
                </h1>
                <p className="text-muted-foreground text-sm">
                 Daily checklist and maintenance tracking
                </p>
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {Math.round(overallCompletionRate)}% Complete
              </Badge>
            </div>
          </div>

          {/* Area Summary Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {facilityAreas.map((area) => (
              <AreaSummaryCard key={area.id} area={area} />
            ))}
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex gap-2">
              <Button 
                variant={selectedArea === 'all' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSelectedArea('all')}
                data-testid="filter-area-all"
              >
                All Areas
              </Button>
              <Button 
                variant={selectedArea === 'Service Bay' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSelectedArea('Service Bay')}
                data-testid="filter-area-bay"
              >
                Service Bay
              </Button>
              <Button 
                variant={selectedArea === 'Washroom' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSelectedArea('Washroom')}
                data-testid="filter-area-washroom"
              >
                Washroom
              </Button>
              <Button 
                variant={selectedArea === 'Equipment' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSelectedArea('Equipment')}
                data-testid="filter-area-equipment"
              >
                Equipment
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant={filterStatus === 'all' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilterStatus('all')}
                data-testid="filter-status-all"
              >
                All Status
              </Button>
              <Button 
                variant={filterStatus === 'pending' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilterStatus('pending')}
                data-testid="filter-status-pending"
              >
                Pending
              </Button>
              <Button 
                variant={filterStatus === 'completed' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilterStatus('completed')}
                data-testid="filter-status-completed"
              >
                Completed
              </Button>
            </div>
          </div>

          {/* Task Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                Today's Tasks
              </h2>
              <Badge variant="outline" className="text-xs">
                {filteredTasks.length} {filteredTasks.length === 1 ? 'Task' : 'Tasks'}
              </Badge>
            </div>
            
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onAction={handleTaskAction}
              />
            ))}

            {filteredTasks.length === 0 && (
              <div className="text-center py-12">
                <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  All tasks completed!
                </h3>
                <p className="text-muted-foreground">
                  Great work! All facility maintenance tasks for today are done.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}