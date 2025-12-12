import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { type Customer, POSJobData, posJobSchema } from "@/schema";
import {
  Car,
  CheckCircle,
  Loader2,
  BarChart3,
  EditIcon,
  Key
} from "lucide-react";
import { availableServices } from "@/lib/constant";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Password from "./password";
import Profile from "./profile";

export default function ProfileDetails() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");

  const [step, setStep] = useState<'job-creation' | 'confirmation' | "customer-lookup">('job-creation');
  const [phoneSearch, setPhoneSearch] = useState("");
  const [showServiceHistory, setShowServiceHistory] = useState(false);
  const [existingCustomer, setExistingCustomer] = useState<Customer | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

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

       await apiRequest("POST", "/api/job-cards", jobCardData);
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
  return (
    <>
      <div className="  p-6">
        <div className=" mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Details</h1>
          <p className="text-gray-600">Access and edit complete profile details</p>
        </div>

        <div className={`grid gap-6 transition-all duration-300 ${showServiceHistory ? 'grid-cols-12' : 'grid-cols-1'
          }`}>
          <div className="p-6">
            <div className=" mx-auto space-y-6 ">

              {/* Main Content Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2  lg:w-max  lg:inline-grid">

                  <TabsTrigger
                    value="overview"
                    className="flex items-center gap-3"
                    data-testid="tab-overview"
                  >
                    <BarChart3 size={16} />
                    <span className="hidden sm:inline">Overview</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="password"
                    className="flex items-center gap-3"
                    data-testid="tab-vehicles"
                  >
                    <Key size={16}/>
                    <span className="hidden sm:inline">Password</span>
                  </TabsTrigger>

                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  <Profile />
                </TabsContent>

                {/* Vehicle Information Tab */}
                <TabsContent value="password" className="space-y-6">
                  <Password />
                </TabsContent>


              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}