import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {  type Customer, type Vehicle, JobCard } from "@/lib/types";
import { 
  User, 
  Phone, 
  Mail, 
  Car, 
  Key, 
  MapPin, 
  Calculator, 
  Search,
  Plus,
  UserPlus,
  CheckCircle,
  ArrowRight,
  DollarSign,
  Percent,
  Receipt,
  Clock,
  Loader2
} from "lucide-react";
import { z } from "zod";
import POSLayout from "@/components/layout/pos-layout";
import InlineCustomerForm from "@/components/forms/inline-customer-form";
import ServiceHistoryPanel from "@/components/customer/service-history-panel";

interface ServiceItem {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  selected?: boolean;
}

// Available services for POS
const availableServices: ServiceItem[] = [
  { id: '1', name: 'Basic Exterior Wash', price: 500, description: 'Exterior wash and dry', category: 'Basic' },
  { id: '2', name: 'Premium Interior Detailing', price: 1200, description: 'Complete interior cleaning and protection', category: 'Premium' },
  { id: '3', name: 'Ceramic Coating Kit', price: 4500, description: '6-month ceramic protection', category: 'Protection' },
  { id: '4', name: 'Paint Correction Service', price: 3000, description: 'Remove scratches and swirl marks', category: 'Correction' },
  { id: '5', name: 'Full Car PPF Installation', price: 18000, description: 'Complete paint protection film', category: 'Protection' },
  { id: '6', name: 'Engine Bay Cleaning', price: 800, description: 'Professional engine compartment cleaning', category: 'Detailing' }
];

// Vehicle makes and models
const vehicleMakes = ['Honda', 'Toyota', 'Maruti Suzuki', 'Hyundai', 'Tata', 'Mahindra', 'Ford', 'BMW', 'Mercedes-Benz', 'Audi'];
const vehicleModels = {
  'Honda': ['City', 'Civic', 'Accord', 'CR-V', 'Amaze'],
  'Toyota': ['Innova', 'Fortuner', 'Camry', 'Corolla', 'Etios'],
  'Maruti Suzuki': ['Swift', 'Baleno', 'Dzire', 'Vitara Brezza', 'Alto'],
  'Hyundai': ['i20', 'Creta', 'Verna', 'Santro', 'Tucson'],
  'Tata': ['Nexon', 'Harrier', 'Safari', 'Altroz', 'Tiago'],
  'Mahindra': ['XUV500', 'Scorpio', 'Bolero', 'Thar', 'KUV100'],
  'Ford': ['EcoSport', 'Endeavour', 'Figo', 'Aspire', 'Mustang'],
  'BMW': ['3 Series', '5 Series', 'X3', 'X5', 'Z4'],
  'Mercedes-Benz': ['C-Class', 'E-Class', 'GLC', 'GLE', 'A-Class'],
  'Audi': ['A4', 'A6', 'Q3', 'Q5', 'Q7']
};

// const customerTypes = ['Regular', 'Premium', 'VIP', 'Corporate'];

const posJobSchema = z.object({
  // Customer fields
  customerName: z.string().min(1, "Customer name is required"),
  customerPhone: z.string().min(10, "Valid phone number required"),
  customerEmail: z.string().email().optional().or(z.literal("")),
  // customerType: z.string().min(1, "Customer type is required"),
  
  // Vehicle fields
  vehicleMake: z.string().min(1, "Vehicle make is required"),
  vehicleModel: z.string().min(1, "Vehicle model is required"),
  vehicleColor: z.string().min(1, "Vehicle color is required"),
  registrationNumber: z.string().min(1, "Registration number is required"),
  
  // Job details
  selectedServices: z.array(z.string()).min(1, "At least one service must be selected"),
  discountPercent: z.string().optional(),
  notes: z.string().optional(),
  promisedReadyAt: z.string().min(1, "Promised ready time is required"),
});

type POSJobData = z.infer<typeof posJobSchema>;

export default function POSJobCreation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<'job-creation' | 'confirmation'|"customer-lookup">('job-creation');
  const [phoneSearch, setPhoneSearch] = useState("");
  const [showServiceHistory, setShowServiceHistory] = useState(false);
  const [customerServiceHistory, setCustomerServiceHistory] = useState<JobCard[]>([]);
  const [existingCustomer, setExistingCustomer] = useState<Customer | null>(null);
  const [isInlineCustomerCreation, setIsInlineCustomerCreation] = useState(false);
  const [isCreateNewCustomer, setIsCreateNewCustomer] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedVehicleMake, setSelectedVehicleMake] = useState("");

  const form = useForm<POSJobData>({
    resolver: zodResolver(posJobSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      // customerType: "Regular",
      vehicleMake: "",
      vehicleModel: "",
      vehicleColor: "",
      registrationNumber: "",
      selectedServices: [],
      discountPercent: "0",
      notes: "",
      promisedReadyAt: "",
    },
  });

  // Search customer by phone
  const { data: searchedCustomer, isLoading: isSearching } = useQuery<Customer>({
    queryKey: ["/api/customers/phone", phoneSearch],
    enabled: phoneSearch.length >= 10,
    retry: false,
  });

  // Get customer service history
  const { data: serviceHistory = [], isLoading: historyLoading } = useQuery({
    queryKey: ["/api/customers", existingCustomer?.id || searchedCustomer?.id, "history"],
    queryFn: async () => {
      const customerId = existingCustomer?.id || searchedCustomer?.id;
      if (!customerId) return [];
      const response = await apiRequest("GET", `/api/customers/${customerId}/job-cards`);
      return response.json();
    },
    enabled: !!(existingCustomer?.id || searchedCustomer?.id),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create job card mutation
  const createJobMutation = useMutation({
    mutationFn: async (data: POSJobData) => {
      // First create/update customer
      const customerData = {
        fullName: data.customerName,
        phoneNumber: data.customerPhone,
        email: data.customerEmail || undefined,
      };

      let customer = existingCustomer;
      if (!customer) {
        const customerResponse = await apiRequest("POST", "/api/customers", customerData);
        customer = await customerResponse.json();
      }
      
      if (!customer) {
        throw new Error("Failed to create or find customer");
      }

      // Create vehicle if needed
      const vehicleData = {
        customerId: customer.id,
        make: data.vehicleMake,
        model: data.vehicleModel,
        color: data.vehicleColor,
        registrationNumber: data.registrationNumber,
      };

      const vehicleResponse = await apiRequest("POST", "/api/vehicles", vehicleData);
      const vehicle = await vehicleResponse.json();

      // Calculate totals
      const services = availableServices.filter(s => data.selectedServices.includes(s.id));
      const subtotal = services.reduce((sum, service) => sum + service.price, 0);
      const discountAmount = (subtotal * parseFloat(data.discountPercent || "0")) / 100;
      const discountedTotal = subtotal - discountAmount;
      const cgst = discountedTotal * 0.09; // 9% CGST
      const sgst = discountedTotal * 0.09; // 9% SGST
      const finalAmount = discountedTotal + cgst + sgst;

      // Create job card
      const jobCardData = {
        customerId: customer.id,
        vehicleId: vehicle.id,
        serviceType: services.map(s => s.name).join(", "),
        totalAmount: finalAmount.toFixed(2),
        finalAmount: finalAmount.toFixed(2),
        discountPercent: data.discountPercent || "0",
        discountAmount: discountAmount.toFixed(2),
        cgst: cgst.toFixed(2),
        sgst: sgst.toFixed(2),
        notes: data.notes || "",
        promisedReadyAt: data.promisedReadyAt,
        serviceStatus: "check-in",
        keyTag: `KEY-${Date.now()}`,
        parkingLocation: "Auto-assigned",
      };

      const jobResponse = await apiRequest("POST", "/api/job-cards", jobCardData);
      return jobResponse.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Job card created successfully. Car is ready for check-in.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/job-cards"] });
      setStep('confirmation');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create job card",
        variant: "destructive",
      });
    },
  });

  const handlePhoneSearch = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '').slice(0, 10);
    setPhoneSearch(cleaned);
    form.setValue('customerPhone', cleaned);
  };

  const handleCustomerFound = (customer: Customer) => {
    setExistingCustomer(customer);
    form.setValue('customerName', customer.fullName);
    form.setValue('customerPhone', customer.phoneNumber);
    form.setValue('customerEmail', customer.email || "");
    setIsInlineCustomerCreation(false);
    setShowServiceHistory(true);
  };

  const handleCreateNewCustomer = () => {
    setIsInlineCustomerCreation(true);
    setShowServiceHistory(false);
    form.setValue('customerPhone', phoneSearch);
    // Clear form for new customer
    form.setValue('customerName', '');
    form.setValue('customerEmail', '');
    setExistingCustomer(null);
  };

  const handleCustomerCreated = (customer: Customer) => {
    setExistingCustomer(customer);
    setIsInlineCustomerCreation(false);
    setShowServiceHistory(true);
    
    // Update form with customer data
    form.setValue('customerName', customer.fullName);
    form.setValue('customerPhone', customer.phoneNumber);
    form.setValue('customerEmail', customer.email || "");
    
    // Invalidate customer search to refresh cache
    queryClient.invalidateQueries({ queryKey: ["/api/customers/phone", customer.phoneNumber] });
    
    toast({
      title: "Customer Created!",
      description: "Customer created successfully. Continue with vehicle and service details.",
    });
  };

  const handleUseLastVehicle = (vehicle: Vehicle) => {
    // Auto-fill vehicle information from the last vehicle
    form.setValue('vehicleMake', vehicle.make);
    form.setValue('vehicleModel', vehicle.model);
    form.setValue('vehicleColor', vehicle.color ?? "");
    form.setValue('registrationNumber', vehicle.registrationNumber);
    setSelectedVehicleMake(vehicle.make);
    
    toast({
      title: "Vehicle Details Loaded",
      description: `${vehicle.make} ${vehicle.model} details have been pre-filled.`,
    });
  };

  const handleCopyLastService = (services: any[]) => {
    if (services.length === 0) return;
    
    // Extract service IDs from the service data
    // For now, we'll try to match service names to available services
    const matchedServiceIds: string[] = [];
    
    services.forEach(service => {
      const match = availableServices.find(
        availableService => availableService.name.toLowerCase().includes(service.name.toLowerCase())
      );
      if (match) {
        matchedServiceIds.push(match.id);
      }
    });
    
    if (matchedServiceIds.length > 0) {
      setSelectedServices(matchedServiceIds);
      form.setValue('selectedServices', matchedServiceIds);
      
      toast({
        title: "Services Copied",
        description: `${matchedServiceIds.length} service(s) from previous job have been selected.`,
      });
    } else {
      toast({
        title: "No Matching Services",
        description: "Could not match services from previous job to current available services.",
        variant: "destructive",
      });
    }
  };

  const toggleService = (serviceId: string) => {
    const newSelection = selectedServices.includes(serviceId)
      ? selectedServices.filter(id => id !== serviceId)
      : [...selectedServices, serviceId];
    
    setSelectedServices(newSelection);
    form.setValue('selectedServices', newSelection);
  };

  const calculateTotals = () => {
    const services = availableServices.filter(s => selectedServices.includes(s.id));
    const subtotal = services.reduce((sum, service) => sum + service.price, 0);
    const discountPercent = parseFloat(form.watch('discountPercent') || "0");
    const discountAmount = (subtotal * discountPercent) / 100;
    const discountedTotal = subtotal - discountAmount;
    const cgst = discountedTotal * 0.09;
    const sgst = discountedTotal * 0.09;
    const finalAmount = discountedTotal + cgst + sgst;

    return { subtotal, discountAmount, cgst, sgst, finalAmount };
  };

  const totals = calculateTotals();

  if (step === 'job-creation') {
    return (
      <>
        <div className="max-w-7xl mx-auto p-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Job Card</h1>
            <p className="text-gray-600">Complete service booking in one streamlined workflow</p>
          </div>

          <div className={`grid gap-6 transition-all duration-300 ${
            showServiceHistory ? 'grid-cols-12' : 'grid-cols-1'
          }`}>
            {/* Service History Sidebar */}
            {showServiceHistory && existingCustomer && (
              <div className="col-span-3">
                <ServiceHistoryPanel
                  customer={existingCustomer}
                  onUseLastVehicle={handleUseLastVehicle}
                  onCopyLastService={handleCopyLastService}
                  onClose={() => setShowServiceHistory(false)}
                />
              </div>
            )}

            {/* Main Job Creation Form */}
            <div className={showServiceHistory ? 'col-span-9' : 'col-span-1'}>

              {/* Customer Lookup Section */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search size={20} />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone-lookup" className="text-sm font-medium">Phone Number *</Label>
                      <div className="relative mt-1">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <Input
                          id="phone-lookup"
                          type="tel"
                          placeholder="Enter phone number"
                          value={phoneSearch}
                          onChange={(e) => handlePhoneSearch(e.target.value)}
                          className="pl-10"
                          data-testid="input-phone-lookup"
                        />
                      </div>
                      {isSearching && phoneSearch.length >= 10 && (
                        <p className="text-sm text-blue-600 mt-1 flex items-center gap-1">
                          <Loader2 className="animate-spin" size={12} />
                          Searching...
                        </p>
                      )}
                    </div>

                    {/* Customer Found/Create Buttons */}
                    {phoneSearch.length >= 10 && (
                      <div className="flex items-end gap-2">
                        {searchedCustomer && !existingCustomer && (
                          <Button
                            type="button"
                            onClick={() => handleCustomerFound(searchedCustomer)}
                            className="bg-green-600 hover:bg-green-700 flex-1"
                            data-testid="button-use-existing"
                          >
                            <CheckCircle size={16} className="mr-2" />
                            Use Existing
                          </Button>
                        )}
                        {!searchedCustomer && !isSearching && (
                          <Button
                            type="button"
                            onClick={handleCreateNewCustomer}
                            className="bg-blue-600 hover:bg-blue-700 flex-1"
                            data-testid="button-new-customer"
                          >
                            <Plus size={16} className="mr-2" />
                            Create New
                          </Button>
                        )}
                        {existingCustomer && (
                          <Button
                            type="button"
                            onClick={() => {
                              setExistingCustomer(null);
                              setShowServiceHistory(false);
                              form.reset();
                            }}
                            variant="outline"
                            className="flex-1"
                          >
                            Change Customer
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Inline Customer Creation or Selected Customer Display */}
                  {existingCustomer && (
                    <div className="border-t pt-4 mt-4">
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-green-800">{existingCustomer.fullName}</h4>
                            <p className="text-sm text-green-600">{existingCustomer.phoneNumber}</p>
                            {existingCustomer.email && (
                              <p className="text-sm text-green-600">{existingCustomer.email}</p>
                            )}
                          </div>
                          {serviceHistory.length > 0 && (
                            <Badge className="bg-green-200 text-green-800">
                              {serviceHistory.length} previous jobs
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Inline Customer Creation Form */}
                  {isInlineCustomerCreation && (
                    <div className="border-t pt-4 mt-4">
                      <InlineCustomerForm
                        phoneNumber={phoneSearch}
                        onSuccess={handleCustomerCreated}
                        onCancel={() => setIsInlineCustomerCreation(false)}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => createJobMutation.mutate(data))} className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                

                {/* Vehicle Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Car size={20} />
                      Vehicle Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
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
                              <SelectTrigger data-testid="select-vehicle-make">
                                <SelectValue placeholder="Select make" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {vehicleMakes.map((make) => (
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
                              <SelectTrigger data-testid="select-vehicle-model">
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
                      name="registrationNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Registration Number *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="DL 3C AB 1234" data-testid="input-registration" />
                          </FormControl>
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
                          <FormControl>
                            <Input {...field} placeholder="Pearl White" data-testid="input-vehicle-color" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Service Selection & Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator size={20} />
                      Cost Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>₹{totals.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Discount:</span>
                        <span>-₹{totals.discountAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>CGST (9%):</span>
                        <span>₹{totals.cgst.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>SGST (9%):</span>
                        <span>₹{totals.sgst.toFixed(2)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-xl font-bold">
                        <span>Total Amount:</span>
                        <span>₹{totals.finalAmount.toFixed(2)}</span>
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="discountPercent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discount %</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" min="0" max="100" placeholder="0" data-testid="input-discount" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="promisedReadyAt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Promised Ready Time *</FormLabel>
                          <FormControl>
                            <Input {...field} type="datetime-local" data-testid="input-ready-time" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Service Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Service Selection</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableServices.map((service) => (
                      <Card 
                        key={service.id} 
                        className={`cursor-pointer transition-all ${
                          selectedServices.includes(service.id) 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'hover:border-gray-300'
                        }`}
                        onClick={() => toggleService(service.id)}
                        data-testid={`service-card-${service.id}`}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Checkbox 
                                  checked={selectedServices.includes(service.id)}
                                  onChange={() => toggleService(service.id)}
                                />
                                <h3 className="font-semibold">{service.name}</h3>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                              <Badge variant="outline">{service.category}</Badge>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold text-green-600">₹{service.price}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              <Card>
                <CardHeader>
                  <CardTitle>Additional Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Any special instructions or notes about the vehicle or service..." 
                            data-testid="textarea-notes"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setStep('customer-lookup')}
                  data-testid="button-back"
                >
                  ← Back
                </Button>
                <Button 
                  type="submit" 
                  disabled={createJobMutation.isPending || selectedServices.length === 0}
                  className="bg-green-600 hover:bg-green-700 px-8"
                  data-testid="button-create-job"
                >
                  {createJobMutation.isPending ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={20} />
                      Creating Job Card...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2" size={20} />
                      Create Job Card
                    </>
                  )}
                </Button>
              </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (step === 'confirmation') {
    return (
      <>
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center">
            <CheckCircle size={80} className="mx-auto text-green-600 mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Job Card Created Successfully!</h1>
            <p className="text-gray-600 mb-8">The vehicle has been checked in and is ready to move through the workflow.</p>
            
            <div className="flex justify-center gap-4">
              <Button 
                onClick={() => window.location.href = '/job-cards'}
                className="bg-blue-600 hover:bg-blue-700"
                data-testid="button-view-workflow"
              >
                <ArrowRight className="mr-2" size={20} />
                View Workflow Board
              </Button>
              <Button 
                onClick={() => {
                  setStep('customer-lookup');
                  setPhoneSearch('');
                  setExistingCustomer(null);
                  setSelectedServices([]);
                  form.reset();
                }}
                variant="outline"
                data-testid="button-create-another"
              >
                Create Another Job Card
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return null;
}