import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Car, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  Clock, 
  Settings, 
  AlertTriangle,
  CheckCircle,
  Info,
  Fuel,
  Gauge,
  Car as CarIcon,
  Bike,
  Truck,
  Wrench,
  Star,
  BarChart3,
  TrendingUp,
  MapPin,
  Camera,
  FileText,
  Bell,
  Heart
} from "lucide-react";
import { type Vehicle, type JobCard,  } from "@/lib/types";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { InsertVehicleSchema } from "@/lib/schema";

interface VehicleInformationPanelProps {
  customerId: string;
  className?: string;
  onVehicleSelect?: (vehicle: Vehicle) => void;
}

interface VehicleWithStats extends Vehicle {
  totalServices?: number;
  lastServiceDate?: string;
  nextServiceDue?: string;
  totalSpent?: number;
  averageServiceInterval?: number;
  overdueDays?: number;
  maintenanceScore?: number;
  preferredServices?: string[];
}

interface VehicleServiceHistory {
  jobCards: JobCard[];
  totalServices: number;
  totalSpent: number;
  averageInterval: number;
  lastService?: JobCard;
  nextServicePrediction?: Date;
}

const vehicleFormSchema = InsertVehicleSchema.extend({
  registrationNumber: z.string().min(1, "Registration number is required"),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  color:z.string(),
  fuelType:z.string(),
  year: z.coerce.number().min(1900).max(new Date().getFullYear() + 1),
  vehicleType: z.string().min(1, "Vehicle type is required"),
});

type VehicleFormData = z.infer<typeof vehicleFormSchema>;

export default function VehicleInformationPanel({ 
  customerId, 
  className = "",
  onVehicleSelect 
}: VehicleInformationPanelProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleWithStats | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const { toast } = useToast();

  // Fetch customer vehicles with enhanced data
  const { data: vehicles = [], isLoading, error } = useQuery<VehicleWithStats[]>({
    queryKey: ["/api/vehicles/customer", customerId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/vehicles/customer/${customerId}`);
      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch vehicle service history when a vehicle is selected
  const { data: vehicleHistory, isLoading: historyLoading } = useQuery<VehicleServiceHistory>({
    queryKey: ["/api/vehicles", selectedVehicle?.id, "service-history"],
    queryFn: async () => {
      if (!selectedVehicle?.id) return null;
      const response = await apiRequest("GET", `/api/vehicles/${selectedVehicle.id}/service-history`);
      return response.json();
    },
    enabled: !!selectedVehicle?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Add vehicle mutation
  const addVehicleMutation = useMutation({
    mutationFn: async (vehicleData: VehicleFormData) => {
      const response = await apiRequest("POST", "/api/vehicles", {
        ...vehicleData,
        customerId
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles/customer", customerId] });
      toast({
        title: "Vehicle Added",
        description: "The vehicle has been successfully registered.",
      });
      setIsAddDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add vehicle. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update vehicle mutation
  const updateVehicleMutation = useMutation({
    mutationFn: async (vehicleData: VehicleFormData) => {
      if (!editingVehicle?.id) throw new Error("No vehicle to update");
      const response = await apiRequest("PUT", `/api/vehicles/${editingVehicle.id}`, vehicleData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles/customer", customerId] });
      toast({
        title: "Vehicle Updated",
        description: "The vehicle information has been successfully updated.",
      });
      setIsEditDialogOpen(false);
      setEditingVehicle(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update vehicle. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete vehicle mutation
  const deleteVehicleMutation = useMutation({
    mutationFn: async (vehicleId: string) => {
      const response = await apiRequest("DELETE", `/api/vehicles/${vehicleId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles/customer", customerId] });
      toast({
        title: "Vehicle Removed",
        description: "The vehicle has been successfully removed.",
      });
      if (selectedVehicle?.id === editingVehicle?.id) {
        setSelectedVehicle(null);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to remove vehicle. Please try again.",
        variant: "destructive",
      });
    },
  });

  const addForm = useForm<any>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      registrationNumber: "",
      make: "",
      model: "",
      year: new Date().getFullYear(),
      vehicleType: "Car",
      color: "",
      fuelType: "Petrol",
      customerId
    },
  });

  const editForm = useForm<any>({
    resolver: zodResolver(vehicleFormSchema),
  });

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(numAmount);
  };

  const formatDate = (dateStr: string | null | undefined | Date) => {
    if (!dateStr) return 'Never';
    try {
      const date = dateStr instanceof Date ? dateStr : new Date(dateStr);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'Invalid';
    }
  };

  const getVehicleTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'bike':
      case 'motorcycle':
        return <Bike className="w-5 h-5" />;
      case 'truck':
      case 'van':
        return <Truck className="w-5 h-5" />;
      default:
        return <CarIcon className="w-5 h-5" />;
    }
  };

  const getMaintenanceStatusColor = (score: number | undefined) => {
    if (!score) return 'text-gray-500';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getServiceStatusBadge = (vehicle: VehicleWithStats) => {
    if (vehicle.overdueDays && vehicle.overdueDays > 0) {
      return (
        <Badge variant="destructive" className="text-xs">
          <AlertTriangle size={10} className="mr-1" />
          {vehicle.overdueDays} days overdue
        </Badge>
      );
    }
    if (vehicle.nextServiceDue) {
      const daysUntilService = Math.ceil(
        (new Date(vehicle.nextServiceDue).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysUntilService <= 7) {
        return (
          <Badge variant="outline" className="text-orange-600 border-orange-600 text-xs">
            <Clock size={10} className="mr-1" />
            Due in {daysUntilService} days
          </Badge>
        );
      }
    }
    return (
      <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
        <CheckCircle size={10} className="mr-1" />
        Up to date
      </Badge>
    );
  };

  const handleVehicleSelect = (vehicle: VehicleWithStats) => {
    setSelectedVehicle(vehicle);
    onVehicleSelect?.(vehicle);
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    editForm.reset({
      registrationNumber: vehicle.registrationNumber,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      vehicleType: vehicle.vehicleType,
      color: vehicle.color || "",
      fuelType: vehicle.fuelType || "Petrol",
      customerId: vehicle.customerId
    });
    setIsEditDialogOpen(true);
  };

  const onAddSubmit = (data: VehicleFormData) => {
    addVehicleMutation.mutate(data);
  };

  const onEditSubmit = (data: VehicleFormData) => {
    updateVehicleMutation.mutate(data);
  };

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <p className="text-muted-foreground">Failed to load vehicle information</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Vehicle Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Car size={20} />
              Vehicle Information
              {vehicles.length > 0 && (
                <Badge variant="outline" className="ml-2">
                  {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" data-testid="button-add-vehicle">
                  <Plus size={16} className="mr-1" />
                  Add Vehicle
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Vehicle</DialogTitle>
                </DialogHeader>
                <Form {...addForm}>
                  <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-3">
                    <FormField
                      control={addForm.control}
                      name="registrationNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Registration Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., MH01AB1234" {...field} data-testid="input-registration" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={addForm.control}
                        name="make"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Make *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Honda" {...field} data-testid="input-make" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={addForm.control}
                        name="model"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Model *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., City" {...field} data-testid="input-model" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={addForm.control}
                        name="year"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Year *</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="2023" {...field} data-testid="input-year" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={addForm.control}
                        name="vehicleType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-vehicle-type">
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Car">Car</SelectItem>
                                <SelectItem value="SUV">SUV</SelectItem>
                                <SelectItem value="Hatchback">Hatchback</SelectItem>
                                <SelectItem value="Sedan">Sedan</SelectItem>
                                <SelectItem value="Bike">Bike</SelectItem>
                                <SelectItem value="Truck">Truck</SelectItem>
                                <SelectItem value="Van">Van</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={addForm.control}
                        name="color"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Color</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., White" {...field} data-testid="input-color" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={addForm.control}
                        name="fuelType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fuel Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-fuel-type">
                                  <SelectValue placeholder="Select fuel type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Petrol">Petrol</SelectItem>
                                <SelectItem value="Diesel">Diesel</SelectItem>
                                <SelectItem value="CNG">CNG</SelectItem>
                                <SelectItem value="Electric">Electric</SelectItem>
                                <SelectItem value="Hybrid">Hybrid</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button 
                        type="submit" 
                        disabled={addVehicleMutation.isPending}
                        className="flex-1"
                        data-testid="button-submit-add-vehicle"
                      >
                        {addVehicleMutation.isPending ? "Adding..." : "Add Vehicle"}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsAddDialogOpen(false)}
                        data-testid="button-cancel-add-vehicle"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="border rounded-lg p-3">
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-12 h-12 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : vehicles.length === 0 ? (
            <div className="text-center py-12">
              <Car className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Vehicles Registered</h3>
              <p className="text-gray-500 mb-4">
                This customer hasn't registered any vehicles yet.
              </p>
              <Button 
                onClick={() => setIsAddDialogOpen(true)}
                data-testid="button-add-first-vehicle"
              >
                <Plus size={16} className="mr-2" />
                Add First Vehicle
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {vehicles.map((vehicle) => (
                <div 
                  key={vehicle.id}
                  className={`border rounded-lg p-3 transition-colors cursor-pointer hover:bg-gray-50 ${
                    selectedVehicle?.id === vehicle.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={() => handleVehicleSelect(vehicle)}
                  data-testid={`card-vehicle-${vehicle.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
                        {getVehicleTypeIcon(vehicle.vehicleType)}
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-medium text-gray-900" data-testid={`text-vehicle-name-${vehicle.id}`}>
                            {vehicle.make} {vehicle.model} ({vehicle.year})
                          </h4>
                          {getServiceStatusBadge(vehicle)}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="font-mono">{vehicle.registrationNumber}</span>
                          <span>{vehicle.vehicleType}</span>
                          {vehicle.color && <span>{vehicle.color}</span>}
                          {vehicle.fuelType && (
                            <div className="flex items-center gap-1">
                              <Fuel size={12} />
                              {vehicle.fuelType}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-6 text-xs text-gray-500">
                          <span>{vehicle.totalServices || 0} services</span>
                          <span>Last: {formatDate(vehicle.lastServiceDate)}</span>
                          {vehicle.totalSpent && (
                            <span>Spent: {formatCurrency(vehicle.totalSpent)}</span>
                          )}
                          {vehicle.maintenanceScore && (
                            <div className="flex items-center gap-1">
                              <Gauge size={12} />
                              <span className={getMaintenanceStatusColor(vehicle.maintenanceScore)}>
                                {vehicle.maintenanceScore}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditVehicle(vehicle);
                        }}
                        data-testid={`button-edit-vehicle-${vehicle.id}`}
                      >
                        <Edit size={14} />
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          // eslint-disable-next-line no-restricted-globals
                          if (confirm('Are you sure you want to remove this vehicle?')) {
                            deleteVehicleMutation.mutate(vehicle.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-700"
                        data-testid={`button-delete-vehicle-${vehicle.id}`}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Vehicle Details */}
      {selectedVehicle && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getVehicleTypeIcon(selectedVehicle.vehicleType)}
              {selectedVehicle.make} {selectedVehicle.model} Details
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="service-history">Service History</TabsTrigger>
                <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Vehicle Information */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Vehicle Information</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Registration:</span>
                        <span className="font-mono">{selectedVehicle.registrationNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Make & Model:</span>
                        <span>{selectedVehicle.make} {selectedVehicle.model}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Year:</span>
                        <span>{selectedVehicle.year}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span>{selectedVehicle.vehicleType}</span>
                      </div>
                      {selectedVehicle.color && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Color:</span>
                          <span>{selectedVehicle.color}</span>
                        </div>
                      )}
                      {selectedVehicle.fuelType && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Fuel Type:</span>
                          <span>{selectedVehicle.fuelType}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Service Statistics */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Service Statistics</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Services:</span>
                        <span className="font-medium">{selectedVehicle.totalServices || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Spent:</span>
                        <span className="font-medium">
                          {formatCurrency(selectedVehicle.totalSpent || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Service:</span>
                        <span>{formatDate(selectedVehicle.lastServiceDate)}</span>
                      </div>
                      {selectedVehicle.averageServiceInterval && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Service Interval:</span>
                          <span>Every {selectedVehicle.averageServiceInterval} days</span>
                        </div>
                      )}
                      {selectedVehicle.maintenanceScore && (
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Maintenance Score:</span>
                            <span className={`font-medium ${getMaintenanceStatusColor(selectedVehicle.maintenanceScore)}`}>
                              {selectedVehicle.maintenanceScore}%
                            </span>
                          </div>
                          <Progress value={selectedVehicle.maintenanceScore} className="h-2" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="service-history" className="space-y-3">
                {historyLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : vehicleHistory?.jobCards?.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">No service history available for this vehicle</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {vehicleHistory?.jobCards?.map((jobCard) => (
                      <div key={jobCard.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Job #{jobCard.jobCardNumber}</span>
                          <Badge variant="outline">{jobCard.status}</Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>Date: {formatDate(jobCard.createdAt)}</div>
                          <div>Service: {jobCard.serviceType}</div>
                          <div>Amount: {formatCurrency(jobCard.finalAmount || '0')}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="maintenance" className="space-y-3">
                <div className="space-y-3">
                  <h4 className="font-medium">Maintenance Schedule</h4>
                  {selectedVehicle.nextServiceDue ? (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Bell className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-blue-900">Next Service Due</span>
                      </div>
                      <p className="text-blue-700">
                        Scheduled for {formatDate(selectedVehicle.nextServiceDue)}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-500">No scheduled maintenance</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="analytics" className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium">Service Trends</h4>
                    <div className="text-center py-8 text-gray-500">
                      <BarChart3 className="mx-auto h-12 w-12 mb-2" />
                      <p>Service analytics coming soon</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium">Preferred Services</h4>
                    {selectedVehicle.preferredServices?.length ? (
                      <div className="space-y-2">
                        {selectedVehicle.preferredServices.map((service, index) => (
                          <Badge key={index} variant="outline" className="mr-2">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No preferred services identified yet</p>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Edit Vehicle Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Vehicle</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-3">
              <FormField
                control={editForm.control}
                name="registrationNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Registration Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., MH01AB1234" {...field} data-testid="input-edit-registration" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="make"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Make *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Honda" {...field} data-testid="input-edit-make" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., City" {...field} data-testid="input-edit-model" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year *</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="2023" {...field} data-testid="input-edit-year" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="vehicleType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-edit-vehicle-type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Car">Car</SelectItem>
                          <SelectItem value="SUV">SUV</SelectItem>
                          <SelectItem value="Hatchback">Hatchback</SelectItem>
                          <SelectItem value="Sedan">Sedan</SelectItem>
                          <SelectItem value="Bike">Bike</SelectItem>
                          <SelectItem value="Truck">Truck</SelectItem>
                          <SelectItem value="Van">Van</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., White" {...field} data-testid="input-edit-color" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="fuelType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fuel Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-edit-fuel-type">
                            <SelectValue placeholder="Select fuel type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Petrol">Petrol</SelectItem>
                          <SelectItem value="Diesel">Diesel</SelectItem>
                          <SelectItem value="CNG">CNG</SelectItem>
                          <SelectItem value="Electric">Electric</SelectItem>
                          <SelectItem value="Hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  type="submit" 
                  disabled={updateVehicleMutation.isPending}
                  className="flex-1"
                  data-testid="button-submit-edit-vehicle"
                >
                  {updateVehicleMutation.isPending ? "Updating..." : "Update Vehicle"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                  data-testid="button-cancel-edit-vehicle"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}