import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { type Customer, type Vehicle, type JobCard } from "@/lib/types";
import { 
  Phone, 
  User, 
  Car, 
  Wrench, 
  CreditCard, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Clock,
  DollarSign,
  Zap,
  UserPlus,
  Search,
  Plus,
  Loader2,
  X
} from "lucide-react";
import { z } from "zod";
import POSLayout from "@/components/layout/pos-layout";

// Walk-in entry form schema
const walkInSchema = z.object({
  // Phone lookup
  phoneNumber: z.string().min(10, "Phone number must be 10 digits"),
  
  // Customer details
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  
  // Vehicle details
  vehicleMake: z.string().min(1, "Vehicle make is required"),
  vehicleModel: z.string().min(1, "Vehicle model is required"),
  vehicleColor: z.string().min(1, "Vehicle color is required"),
  registrationNumber: z.string().min(1, "Registration number is required"),
  
  // Service selection
  selectedService: z.string().min(1, "Please select a service"),
  
  // Payment and timing
  paymentMethod: z.string().min(1, "Please select payment method"),
  estimatedReadyTime: z.string().min(1, "Please select estimated ready time"),
  
  // Optional fields
  notes: z.string().optional(),
});

type WalkInFormData = z.infer<typeof walkInSchema>;

// Quick service options for walk-ins
const quickServices = [
  { id: 'basic-wash', name: 'Basic Wash & Vacuum', price: 500, duration: 45, description: 'Quick exterior wash and interior vacuum' },
  { id: 'premium-detail', name: 'Premium Detailing', price: 1500, duration: 120, description: 'Complete interior and exterior detailing' },
  { id: 'express-wash', name: 'Express Wash', price: 300, duration: 30, description: 'Fast exterior wash only' },
  { id: 'ceramic-coating', name: 'Ceramic Coating', price: 4500, duration: 240, description: '6-month ceramic protection' },
  { id: 'interior-detail', name: 'Interior Deep Clean', price: 1200, duration: 90, description: 'Deep interior cleaning and sanitization' },
  { id: 'paint-correction', name: 'Paint Correction', price: 3000, duration: 180, description: 'Remove scratches and restore paint' }
];

// Payment methods for walk-ins
const paymentMethods = [
  { id: 'cash', name: 'Cash', icon: DollarSign },
  { id: 'card', name: 'Card/UPI', icon: CreditCard },
  { id: 'advance-50', name: '50% Advance', icon: CreditCard },
  { id: 'full-advance', name: 'Full Advance', icon: CreditCard }
];

// Vehicle makes for quick selection
const popularMakes = ['Maruti Suzuki', 'Hyundai', 'Honda', 'Toyota', 'Tata', 'Mahindra', 'Ford', 'BMW', 'Mercedes-Benz', 'Audi'];
const vehicleModels = {
  'Maruti Suzuki': ['Swift', 'Baleno', 'Dzire', 'Vitara Brezza', 'Alto', 'WagonR'],
  'Hyundai': ['i20', 'Creta', 'Verna', 'Venue', 'Santro', 'Tucson'],
  'Honda': ['City', 'Civic', 'Amaze', 'CR-V', 'Jazz', 'WR-V'],
  'Toyota': ['Innova', 'Fortuner', 'Camry', 'Corolla', 'Etios', 'Glanza'],
  'Tata': ['Nexon', 'Harrier', 'Safari', 'Altroz', 'Tiago', 'Punch'],
  'Mahindra': ['XUV500', 'Scorpio', 'Bolero', 'Thar', 'XUV300', 'KUV100']
};

// Common vehicle colors
const vehicleColors = ['White', 'Black', 'Silver', 'Red', 'Blue', 'Grey', 'Brown', 'Green', 'Yellow', 'Orange'];

// Walk-in entry steps
type WalkInStep = 'phone-lookup' | 'customer-data' | 'vehicle-info' | 'service-selection' | 'payment-booking' | 'confirmation';

export default function WalkInEntry() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState<WalkInStep>('phone-lookup');
  const [phoneSearch, setPhoneSearch] = useState("");
  const [existingCustomer, setExistingCustomer] = useState<Customer | null>(null);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [selectedVehicleMake, setSelectedVehicleMake] = useState("");
  const [createdJobCard, setCreatedJobCard] = useState<JobCard | null>(null);
  const [stepTimer, setStepTimer] = useState(0);

  const form = useForm<WalkInFormData>({
    resolver: zodResolver(walkInSchema),
    defaultValues: {
      phoneNumber: "",
      customerName: "",
      customerEmail: "",
      vehicleMake: "",
      vehicleModel: "",
      vehicleColor: "",
      registrationNumber: "",
      selectedService: "",
      paymentMethod: "",
      estimatedReadyTime: "",
      notes: "",
    },
  });

  // Timer for tracking step completion time
  useEffect(() => {
    const timer = setInterval(() => {
      setStepTimer(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [currentStep]);

  // Customer lookup by phone
  const { data: customerLookup, isLoading: isLookingUp, error: lookupError } = useQuery<Customer>({
    queryKey: ["/api/walk-in/lookup-customer", phoneSearch],
    enabled: phoneSearch.length === 10,
    retry: false,
  });

  // Create walk-in job card mutation
  const createWalkInJobMutation = useMutation({
    mutationFn: async (data: WalkInFormData) => {
      const response = await apiRequest("POST", "/api/walk-in/create-booking", data);
      return response.json();
    },
    onSuccess: (jobCard) => {
      setCreatedJobCard(jobCard);
      setCurrentStep('confirmation');
      toast({
        title: "Walk-In Booking Created!",
        description: `Job card ${jobCard.id} created successfully. Total time: ${stepTimer}s`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/job-cards"] });
    },
    onError: (error) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to create walk-in booking",
        variant: "destructive",
      });
    },
  });

  // Handle phone number input
  const handlePhoneInput = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 10);
    setPhoneSearch(cleaned);
    form.setValue('phoneNumber', cleaned);
    
    if (cleaned.length === 10 && customerLookup) {
      // Auto-fill customer data
      setExistingCustomer(customerLookup);
      setIsNewCustomer(false);
      form.setValue('customerName', customerLookup.fullName);
      form.setValue('customerEmail', customerLookup.email || "");
    } else if (cleaned.length === 10 && lookupError) {
      // New customer
      setIsNewCustomer(true);
      setExistingCustomer(null);
    }
  };

  // Navigate to next step
  const goToNextStep = () => {
    const stepOrder: WalkInStep[] = ['phone-lookup', 'customer-data', 'vehicle-info', 'service-selection', 'payment-booking', 'confirmation'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  };

  // Navigate to previous step
  const goToPreviousStep = () => {
    const stepOrder: WalkInStep[] = ['phone-lookup', 'customer-data', 'vehicle-info', 'service-selection', 'payment-booking', 'confirmation'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  // Calculate estimated ready time
  const calculateReadyTime = (serviceId: string) => {
    const service = quickServices.find(s => s.id === serviceId);
    if (!service) return "";
    
    const now = new Date();
    const readyTime = new Date(now.getTime() + service.duration * 60000);
    return readyTime.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Handle service selection
  const handleServiceSelect = (serviceId: string) => {
    form.setValue('selectedService', serviceId);
    const readyTime = calculateReadyTime(serviceId);
    form.setValue('estimatedReadyTime', readyTime);
  };

  // Handle form submission
  const handleSubmit = (data: WalkInFormData) => {
    createWalkInJobMutation.mutate(data);
  };

  // Get step progress percentage
  const getProgressPercentage = () => {
    const steps = ['phone-lookup', 'customer-data', 'vehicle-info', 'service-selection', 'payment-booking', 'confirmation'];
    const currentIndex = steps.indexOf(currentStep);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  // Reset form for new entry
  const startNewEntry = () => {
    setCurrentStep('phone-lookup');
    setPhoneSearch("");
    setExistingCustomer(null);
    setIsNewCustomer(false);
    setSelectedVehicleMake("");
    setCreatedJobCard(null);
    setStepTimer(0);
    form.reset();
  };

  return (
    <>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
              <Zap className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Lightning Walk-In Entry</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Register customers and book services in under 60 seconds</p>
          
          {/* Progress Bar */}
          <div className="mt-4 max-w-md mx-auto">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>Progress</span>
              <span>{stepTimer}s</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            
            {/* Step 1: Phone Lookup */}
            {currentStep === 'phone-lookup' && (
              <Card className="border-2 border-blue-200 dark:border-blue-800">
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center gap-2 text-xl">
                    <Phone className="text-blue-600" size={24} />
                    Enter Customer Phone Number
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="max-w-sm mx-auto">
                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Enter 10-digit phone number"
                              value={phoneSearch}
                              onChange={(e) => handlePhoneInput(e.target.value)}
                              className="text-center text-2xl h-16 font-mono tracking-wider"
                              maxLength={10}
                              autoFocus
                              data-testid="input-phone-lookup"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Phone number status */}
                  {phoneSearch.length === 10 && (
                    <div className="text-center">
                      {isLookingUp && (
                        <div className="flex items-center justify-center gap-2 text-blue-600">
                          <Loader2 className="animate-spin" size={16} />
                          <span>Searching customer...</span>
                        </div>
                      )}
                      
                      {customerLookup && !isLookingUp && (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                          <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-300 mb-2">
                            <CheckCircle size={20} />
                            <span className="font-medium">Existing Customer Found!</span>
                          </div>
                          <p className="text-green-600 dark:text-green-400 font-medium">{customerLookup.fullName}</p>
                          {customerLookup.email && (
                            <p className="text-green-600 dark:text-green-400 text-sm">{customerLookup.email}</p>
                          )}
                          <Button 
                            onClick={goToNextStep}
                            className="mt-3 bg-green-600 hover:bg-green-700"
                            data-testid="button-continue-existing"
                          >
                            Continue with Existing Customer
                            <ArrowRight className="ml-2" size={16} />
                          </Button>
                        </div>
                      )}

                      {lookupError && !isLookingUp && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                          <div className="flex items-center justify-center gap-2 text-blue-700 dark:text-blue-300 mb-2">
                            <UserPlus size={20} />
                            <span className="font-medium">New Customer</span>
                          </div>
                          <p className="text-blue-600 dark:text-blue-400 text-sm mb-3">This phone number is not in our system</p>
                          <Button 
                            onClick={goToNextStep}
                            className="bg-blue-600 hover:bg-blue-700"
                            data-testid="button-create-new"
                          >
                            Create New Customer
                            <ArrowRight className="ml-2" size={16} />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 2: Customer Data */}
            {currentStep === 'customer-data' && (
              <Card className="border-2 border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="text-blue-600" size={20} />
                    {existingCustomer ? 'Confirm Customer Details' : 'Customer Information'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="customerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Enter customer name"
                              className="h-12 text-lg"
                              data-testid="input-customer-name"
                              autoFocus={!existingCustomer}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="customerEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              placeholder="customer@email.com"
                              className="h-12 text-lg"
                              data-testid="input-customer-email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {existingCustomer && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                      <p className="text-green-700 dark:text-green-300 text-sm">
                        ✅ Existing customer data loaded. You can edit if needed.
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={goToPreviousStep}
                      className="flex-1"
                    >
                      <ArrowLeft className="mr-2" size={16} />
                      Back
                    </Button>
                    <Button 
                      type="button" 
                      onClick={goToNextStep}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      disabled={!form.watch('customerName')}
                      data-testid="button-continue-customer"
                    >
                      Continue
                      <ArrowRight className="ml-2" size={16} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Vehicle Information */}
            {currentStep === 'vehicle-info' && (
              <Card className="border-2 border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="text-blue-600" size={20} />
                    Vehicle Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="vehicleMake"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vehicle Make *</FormLabel>
                          <Select onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedVehicleMake(value);
                            form.setValue('vehicleModel', '');
                          }} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12 text-lg" data-testid="select-vehicle-make">
                                <SelectValue placeholder="Select make" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {popularMakes.map((make) => (
                                <SelectItem key={make} value={make}>{make}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="vehicleModel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vehicle Model *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12 text-lg" data-testid="select-vehicle-model">
                                <SelectValue placeholder="Select model" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {selectedVehicleMake && vehicleModels[selectedVehicleMake as keyof typeof vehicleModels]?.map((model) => (
                                <SelectItem key={model} value={model}>{model}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="vehicleColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vehicle Color *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12 text-lg" data-testid="select-vehicle-color">
                                <SelectValue placeholder="Select color" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {vehicleColors.map((color) => (
                                <SelectItem key={color} value={color}>{color}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="registrationNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Registration Number *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="DL 3C AB 1234"
                              className="h-12 text-lg font-mono tracking-wider"
                              style={{ textTransform: 'uppercase' }}
                              onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                              data-testid="input-registration"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={goToPreviousStep}
                      className="flex-1"
                    >
                      <ArrowLeft className="mr-2" size={16} />
                      Back
                    </Button>
                    <Button 
                      type="button" 
                      onClick={goToNextStep}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      disabled={!form.watch('vehicleMake') || !form.watch('vehicleModel') || !form.watch('registrationNumber')}
                      data-testid="button-continue-vehicle"
                    >
                      Continue
                      <ArrowRight className="ml-2" size={16} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Service Selection */}
            {currentStep === 'service-selection' && (
              <Card className="border-2 border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="text-blue-600" size={20} />
                    Select Service
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {quickServices.map((service) => (
                      <div
                        key={service.id}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          form.watch('selectedService') === service.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                        }`}
                        onClick={() => handleServiceSelect(service.id)}
                        data-testid={`service-${service.id}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-lg">{service.name}</h3>
                          <Badge variant="secondary">₹{service.price}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{service.description}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <Clock size={14} />
                          <span>{service.duration} minutes</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {form.watch('selectedService') && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                      <p className="text-blue-700 dark:text-blue-300 text-sm">
                        ✅ Service selected. Estimated ready time: {form.watch('estimatedReadyTime')}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={goToPreviousStep}
                      className="flex-1"
                    >
                      <ArrowLeft className="mr-2" size={16} />
                      Back
                    </Button>
                    <Button 
                      type="button" 
                      onClick={goToNextStep}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      disabled={!form.watch('selectedService')}
                      data-testid="button-continue-service"
                    >
                      Continue
                      <ArrowRight className="ml-2" size={16} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 5: Payment & Booking */}
            {currentStep === 'payment-booking' && (
              <Card className="border-2 border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="text-blue-600" size={20} />
                    Payment & Booking
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Payment Method Selection */}
                  <div>
                    <h3 className="font-medium mb-3">Payment Method</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {paymentMethods.map((method) => {
                        const IconComponent = method.icon;
                        return (
                          <div
                            key={method.id}
                            className={`border-2 rounded-lg p-3 cursor-pointer text-center transition-all ${
                              form.watch('paymentMethod') === method.id
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                            }`}
                            onClick={() => form.setValue('paymentMethod', method.id)}
                            data-testid={`payment-${method.id}`}
                          >
                            <IconComponent className="mx-auto mb-2 text-gray-600 dark:text-gray-400" size={24} />
                            <p className="text-sm font-medium">{method.name}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Booking Summary */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h3 className="font-medium mb-3">Booking Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Customer:</span>
                        <span className="font-medium">{form.watch('customerName')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Vehicle:</span>
                        <span className="font-medium">
                          {form.watch('vehicleMake')} {form.watch('vehicleModel')} ({form.watch('vehicleColor')})
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Registration:</span>
                        <span className="font-medium font-mono">{form.watch('registrationNumber')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Service:</span>
                        <span className="font-medium">
                          {quickServices.find(s => s.id === form.watch('selectedService'))?.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ready Time:</span>
                        <span className="font-medium">{form.watch('estimatedReadyTime')}</span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total Amount:</span>
                        <span>₹{quickServices.find(s => s.id === form.watch('selectedService'))?.price}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={goToPreviousStep}
                      className="flex-1"
                    >
                      <ArrowLeft className="mr-2" size={16} />
                      Back
                    </Button>
                    <Button 
                      type="submit"
                      className="flex-2 bg-green-600 hover:bg-green-700 h-12 text-lg"
                      disabled={!form.watch('paymentMethod') || createWalkInJobMutation.isPending}
                      data-testid="button-create-booking"
                    >
                      {createWalkInJobMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 animate-spin" size={16} />
                          Creating Booking...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2" size={16} />
                          Create Booking
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 6: Confirmation */}
            {currentStep === 'confirmation' && createdJobCard && (
              <Card className="border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center gap-2 text-green-700 dark:text-green-300">
                    <CheckCircle size={24} />
                    Booking Confirmed!
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-center">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-green-200 dark:border-green-800">
                    <h2 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-2">
                      Job Card: {createdJobCard.id}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Walk-in booking completed in {stepTimer} seconds
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left text-sm">
                      <div>
                        <h4 className="font-medium mb-2">Customer Details</h4>
                        <p>{form.watch('customerName')}</p>
                        <p>{form.watch('phoneNumber')}</p>
                        {form.watch('customerEmail') && <p>{form.watch('customerEmail')}</p>}
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Vehicle Details</h4>
                        <p>{form.watch('vehicleMake')} {form.watch('vehicleModel')}</p>
                        <p>{form.watch('registrationNumber')}</p>
                        <p>Color: {form.watch('vehicleColor')}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Service Details</h4>
                        <p>{quickServices.find(s => s.id === form.watch('selectedService'))?.name}</p>
                        <p>Ready by: {form.watch('estimatedReadyTime')}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Payment</h4>
                        <p>Method: {paymentMethods.find(p => p.id === form.watch('paymentMethod'))?.name}</p>
                        <p className="font-bold">Amount: ₹{quickServices.find(s => s.id === form.watch('selectedService'))?.price}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => window.print()}
                      className="flex-1"
                      data-testid="button-print"
                    >
                      Print Job Card
                    </Button>
                    <Button 
                      onClick={startNewEntry}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      data-testid="button-new-entry"
                    >
                      <Plus className="mr-2" size={16} />
                      New Walk-In Entry
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

          </form>
        </Form>
      </div>
    </>
  );
}