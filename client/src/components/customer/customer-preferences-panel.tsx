import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Settings, 
  Clock, 
  CreditCard, 
  Bell, 
  MapPin, 
  Star,
  Save,
  RotateCcw,
  User,
  Heart,
  Calendar,
  DollarSign,
  Smartphone,
  Mail,
  Phone,
  MessageSquare,
  Shield,
  Globe,
  Car,
  Home,
  Building,
  Gift,
  Award,
  AlertTriangle,
  CheckCircle,
  Info,
  Edit,
  Plus,
  Trash2
} from "lucide-react";
import { type Customer } from "@/lib/types";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface CustomerPreferencesPanelProps {
  customer: Customer;
  className?: string;
}

interface ServicePreferences {
  preferredServiceDay: string;
  preferredServiceTime: string;
  favoriteServices: string[];
  specialInstructions: string;
  serviceLocation: "home" | "business" | "shop";
  serviceLocationAddress?: string;
  recurringServiceFrequency?: "weekly" | "biweekly" | "monthly" | "quarterly" | "custom";
  customFrequencyDays?: number;
  autoBookingEnabled: boolean;
  serviceReminders: boolean;
  reminderDaysBefore: number;
  priceAlerts: boolean;
  promotionalOffers: boolean;
}

interface BillingPreferences {
  preferredPaymentMethod: "cash" | "card" | "upi" | "net_banking" | "wallet";
  creditTerms?: number; // days
  billingAddress: string;
  gstNumber?: string;
  invoiceEmail?: string;
  autoPayEnabled: boolean;
  paymentReminders: boolean;
  discountEligibility: boolean;
  loyaltyPointsAutoRedeem: boolean;
}

interface PersonalPreferences {
  preferredLanguage: string;
  timeZone: string;
  dateFormat: "dd/mm/yyyy" | "mm/dd/yyyy" | "yyyy-mm-dd";
  currencyFormat: "INR" | "USD" | "EUR";
  theme: "light" | "dark" | "auto";
  accessibility: {
    largeFonts: boolean;
    highContrast: boolean;
    screenReader: boolean;
  };
  privacy: {
    shareDataForImprovement: boolean;
    marketingEmails: boolean;
    smsMarketing: boolean;
    whatsappMarketing: boolean;
    thirdPartySharing: boolean;
  };
}

interface NotificationPreferences {
  appointmentReminders: {
    enabled: boolean;
    channels: string[];
    timing: number; // hours before
  };
  serviceReminders: {
    enabled: boolean;
    channels: string[];
    frequency: "monthly" | "quarterly" | "custom";
  };
  promotionalOffers: {
    enabled: boolean;
    channels: string[];
    categories: string[];
  };
  loyaltyUpdates: {
    enabled: boolean;
    channels: string[];
  };
  emergencyAlerts: {
    enabled: boolean;
    channels: string[];
  };
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
}

const servicePreferencesSchema = z.object({
  preferredServiceDay: z.string(),
  preferredServiceTime: z.string(),
  favoriteServices: z.array(z.string()),
  specialInstructions: z.string(),
  serviceLocation: z.enum(["home", "business", "shop"]),
  serviceLocationAddress: z.string().optional(),
  recurringServiceFrequency: z.enum(["weekly", "biweekly", "monthly", "quarterly", "custom"]).optional(),
  customFrequencyDays: z.number().optional(),
  autoBookingEnabled: z.boolean(),
  serviceReminders: z.boolean(),
  reminderDaysBefore: z.number(),
  priceAlerts: z.boolean(),
  promotionalOffers: z.boolean(),
});

const billingPreferencesSchema = z.object({
  preferredPaymentMethod: z.enum(["cash", "card", "upi", "net_banking", "wallet"]),
  creditTerms: z.number().optional(),
  billingAddress: z.string(),
  gstNumber: z.string().optional(),
  invoiceEmail: z.string().email().optional(),
  autoPayEnabled: z.boolean(),
  paymentReminders: z.boolean(),
  discountEligibility: z.boolean(),
  loyaltyPointsAutoRedeem: z.boolean(),
});

const personalPreferencesSchema = z.object({
  preferredLanguage: z.string(),
  timeZone: z.string(),
  dateFormat: z.enum(["dd/mm/yyyy", "mm/dd/yyyy", "yyyy-mm-dd"]),
  currencyFormat: z.enum(["INR", "USD", "EUR"]),
  theme: z.enum(["light", "dark", "auto"]),
  accessibility: z.object({
    largeFonts: z.boolean(),
    highContrast: z.boolean(),
    screenReader: z.boolean(),
  }),
  privacy: z.object({
    shareDataForImprovement: z.boolean(),
    marketingEmails: z.boolean(),
    smsMarketing: z.boolean(),
    whatsappMarketing: z.boolean(),
    thirdPartySharing: z.boolean(),
  }),
});

type ServicePreferencesFormData = z.infer<typeof servicePreferencesSchema>;
type BillingPreferencesFormData = z.infer<typeof billingPreferencesSchema>;
type PersonalPreferencesFormData = z.infer<typeof personalPreferencesSchema>;

export default function CustomerPreferencesPanel({ 
  customer, 
  className = ""
}: CustomerPreferencesPanelProps) {
  const [activeTab, setActiveTab] = useState("service");
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch service preferences
  const { data: servicePrefs, isLoading: serviceLoading } = useQuery<ServicePreferences>({
    queryKey: ["/api/customers", customer.id, "preferences", "service"],
    queryFn: async () => {
      // Mock data for now - will be replaced with actual API call
      return {
        preferredServiceDay: customer.preferredServiceDay || "Saturday",
        preferredServiceTime: "10:00",
        favoriteServices: ["Full Detail", "Exterior Wash", "Interior Cleaning"],
        specialInstructions: "Please handle leather seats with care. Park in the shade.",
        serviceLocation: "home",
        serviceLocationAddress: customer.address || "",
        recurringServiceFrequency: "monthly",
        autoBookingEnabled: false,
        serviceReminders: true,
        reminderDaysBefore: 2,
        priceAlerts: true,
        promotionalOffers: customer.marketingConsent || false,
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch billing preferences
  const { data: billingPrefs, isLoading: billingLoading } = useQuery<BillingPreferences>({
    queryKey: ["/api/customers", customer.id, "preferences", "billing"],
    queryFn: async () => {
      return {
        preferredPaymentMethod: "upi",
        billingAddress: customer.address || "",
        gstNumber: customer.gstNumber || "",
        invoiceEmail: customer.email || "",
        autoPayEnabled: false,
        paymentReminders: true,
        discountEligibility: true,
        loyaltyPointsAutoRedeem: false,
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch personal preferences
  const { data: personalPrefs, isLoading: personalLoading } = useQuery<PersonalPreferences>({
    queryKey: ["/api/customers", customer.id, "preferences", "personal"],
    queryFn: async () => {
      return {
        preferredLanguage: customer.preferredLanguage || "English",
        timeZone: "Asia/Kolkata",
        dateFormat: "dd/mm/yyyy",
        currencyFormat: "INR",
        theme: "light",
        accessibility: {
          largeFonts: false,
          highContrast: false,
          screenReader: false,
        },
        privacy: {
          shareDataForImprovement: true,
          marketingEmails: customer.marketingConsent || false,
          smsMarketing: customer.whatsappConsent || false,
          whatsappMarketing: customer.whatsappConsent || false,
          thirdPartySharing: false,
        },
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch notification preferences
  const { data: notificationPrefs, isLoading: notificationLoading } = useQuery<NotificationPreferences>({
    queryKey: ["/api/customers", customer.id, "preferences", "notifications"],
    queryFn: async () => {
      return {
        appointmentReminders: {
          enabled: true,
          channels: ["whatsapp", "sms"],
          timing: 24,
        },
        serviceReminders: {
          enabled: true,
          channels: ["whatsapp"],
          frequency: "monthly",
        },
        promotionalOffers: {
          enabled: customer.marketingConsent || false,
          channels: ["whatsapp", "email"],
          categories: ["discounts", "new_services"],
        },
        loyaltyUpdates: {
          enabled: true,
          channels: ["whatsapp"],
        },
        emergencyAlerts: {
          enabled: true,
          channels: ["phone", "sms"],
        },
        quietHours: {
          enabled: true,
          startTime: "22:00",
          endTime: "08:00",
        },
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  // Update preferences mutations
  const updateServicePrefsMutation = useMutation({
    mutationFn: async (data: ServicePreferencesFormData) => {
      const response = await apiRequest("PUT", `/api/customers/${customer.id}/preferences`, { servicePreferences: data });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers", customer.id, "preferences", "service"] });
      toast({
        title: "Service Preferences Updated",
        description: "Your service preferences have been saved successfully.",
      });
      setIsEditing(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update service preferences. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateBillingPrefsMutation = useMutation({
    mutationFn: async (data: BillingPreferencesFormData) => {
      const response = await apiRequest("PUT", `/api/customers/${customer.id}/preferences`, { billingPreferences: data });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers", customer.id, "preferences", "billing"] });
      toast({
        title: "Billing Preferences Updated",
        description: "Your billing preferences have been saved successfully.",
      });
      setIsEditing(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update billing preferences. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updatePersonalPrefsMutation = useMutation({
    mutationFn: async (data: PersonalPreferencesFormData) => {
      const response = await apiRequest("PUT", `/api/customers/${customer.id}/preferences`, { personalPreferences: data });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers", customer.id, "preferences", "personal"] });
      toast({
        title: "Personal Preferences Updated",
        description: "Your personal preferences have been saved successfully.",
      });
      setIsEditing(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update personal preferences. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Forms
  const serviceForm = useForm<ServicePreferencesFormData>({
    resolver: zodResolver(servicePreferencesSchema),
    defaultValues: servicePrefs,
  });

  const billingForm = useForm<BillingPreferencesFormData>({
    resolver: zodResolver(billingPreferencesSchema),
    defaultValues: billingPrefs,
  });

  const personalForm = useForm<PersonalPreferencesFormData>({
    resolver: zodResolver(personalPreferencesSchema),
    defaultValues: personalPrefs,
  });

  // Update forms when data loads
  useEffect(() => {
    if (servicePrefs) serviceForm.reset(servicePrefs);
  }, [servicePrefs]);

  useEffect(() => {
    if (billingPrefs) billingForm.reset(billingPrefs);
  }, [billingPrefs]);

  useEffect(() => {
    if (personalPrefs) personalForm.reset(personalPrefs);
  }, [personalPrefs]);

  const onServiceSubmit = (data: ServicePreferencesFormData) => {
    updateServicePrefsMutation.mutate(data);
  };

  const onBillingSubmit = (data: BillingPreferencesFormData) => {
    updateBillingPrefsMutation.mutate(data);
  };

  const onPersonalSubmit = (data: PersonalPreferencesFormData) => {
    updatePersonalPrefsMutation.mutate(data);
  };

  const availableServices = [
    "Full Detail", "Exterior Wash", "Interior Cleaning", "Waxing", "Polishing",
    "Engine Cleaning", "Ceramic Coating", "Paint Protection", "Headlight Restoration",
    "Leather Treatment", "Steam Cleaning", "Odor Removal", "Scratch Removal"
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings size={20} />
            Customer Preferences & Settings
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Preferences Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger 
            value="service" 
            className="flex items-center gap-2"
            data-testid="tab-service-preferences"
          >
            <Car size={16} />
            <span className="hidden sm:inline">Service</span>
          </TabsTrigger>
          <TabsTrigger 
            value="billing" 
            className="flex items-center gap-2"
            data-testid="tab-billing-preferences"
          >
            <CreditCard size={16} />
            <span className="hidden sm:inline">Billing</span>
          </TabsTrigger>
          <TabsTrigger 
            value="notifications" 
            className="flex items-center gap-2"
            data-testid="tab-notification-preferences"
          >
            <Bell size={16} />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger 
            value="personal" 
            className="flex items-center gap-2"
            data-testid="tab-personal-preferences"
          >
            <User size={16} />
            <span className="hidden sm:inline">Personal</span>
          </TabsTrigger>
        </TabsList>

        {/* Service Preferences Tab */}
        <TabsContent value="service" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Car size={18} />
                  Service Preferences
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(isEditing === "service" ? null : "service")}
                  data-testid="button-edit-service-preferences"
                >
                  {isEditing === "service" ? (
                    <>
                      <RotateCcw size={16} className="mr-1" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Edit size={16} className="mr-1" />
                      Edit
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              {serviceLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : isEditing === "service" ? (
                <Form {...serviceForm}>
                  <form onSubmit={serviceForm.handleSubmit(onServiceSubmit)} className="space-y-6">
                    {/* Service Timing */}
                    <div className="space-y-3">
                      <h4 className="font-medium">Service Timing</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={serviceForm.control}
                          name="preferredServiceDay"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Preferred Day</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-preferred-day">
                                    <SelectValue placeholder="Select day" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Monday">Monday</SelectItem>
                                  <SelectItem value="Tuesday">Tuesday</SelectItem>
                                  <SelectItem value="Wednesday">Wednesday</SelectItem>
                                  <SelectItem value="Thursday">Thursday</SelectItem>
                                  <SelectItem value="Friday">Friday</SelectItem>
                                  <SelectItem value="Saturday">Saturday</SelectItem>
                                  <SelectItem value="Sunday">Sunday</SelectItem>
                                  <SelectItem value="Weekdays">Any Weekday</SelectItem>
                                  <SelectItem value="Weekends">Any Weekend</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={serviceForm.control}
                          name="preferredServiceTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Preferred Time</FormLabel>
                              <FormControl>
                                <Input type="time" {...field} data-testid="input-preferred-time" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Service Location */}
                    <div className="space-y-3">
                      <h4 className="font-medium">Service Location</h4>
                      <FormField
                        control={serviceForm.control}
                        name="serviceLocation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-service-location">
                                  <SelectValue placeholder="Select location type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="home">Home Service</SelectItem>
                                <SelectItem value="business">Business Location</SelectItem>
                                <SelectItem value="shop">Come to Shop</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {(serviceForm.watch("serviceLocation") === "home" || serviceForm.watch("serviceLocation") === "business") && (
                        <FormField
                          control={serviceForm.control}
                          name="serviceLocationAddress"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Service Address</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Enter the full address where service should be performed"
                                  {...field}
                                  data-testid="textarea-service-address"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>

                    {/* Favorite Services */}
                    <div className="space-y-3">
                      <h4 className="font-medium">Favorite Services</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {availableServices.map((service) => (
                          <FormField
                            key={service}
                            control={serviceForm.control}
                            name="favoriteServices"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(service)}
                                    onCheckedChange={(checked) => {
                                      const updatedServices = checked
                                        ? [...(field.value || []), service]
                                        : (field.value || []).filter((s) => s !== service);
                                      field.onChange(updatedServices);
                                    }}
                                    data-testid={`checkbox-service-${service.toLowerCase().replace(/\s+/g, '-')}`}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  {service}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Special Instructions */}
                    <FormField
                      control={serviceForm.control}
                      name="specialInstructions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Special Instructions</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Any special instructions for service staff..."
                              {...field}
                              data-testid="textarea-special-instructions"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Service Options */}
                    <div className="space-y-3">
                      <h4 className="font-medium">Service Options</h4>
                      <div className="space-y-3">
                        <FormField
                          control={serviceForm.control}
                          name="autoBookingEnabled"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between">
                              <div>
                                <FormLabel>Auto Booking</FormLabel>
                                <p className="text-sm text-gray-600">Automatically book recurring services</p>
                              </div>
                              <FormControl>
                                <Switch 
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="switch-auto-booking"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={serviceForm.control}
                          name="serviceReminders"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between">
                              <div>
                                <FormLabel>Service Reminders</FormLabel>
                                <p className="text-sm text-gray-600">Receive reminders for upcoming services</p>
                              </div>
                              <FormControl>
                                <Switch 
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="switch-service-reminders"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        {serviceForm.watch("serviceReminders") && (
                          <FormField
                            control={serviceForm.control}
                            name="reminderDaysBefore"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Reminder Timing (days before)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    min="1" 
                                    max="30"
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                    data-testid="input-reminder-days"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        <FormField
                          control={serviceForm.control}
                          name="priceAlerts"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between">
                              <div>
                                <FormLabel>Price Alerts</FormLabel>
                                <p className="text-sm text-gray-600">Get notified about pricing changes</p>
                              </div>
                              <FormControl>
                                <Switch 
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="switch-price-alerts"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={serviceForm.control}
                          name="promotionalOffers"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between">
                              <div>
                                <FormLabel>Promotional Offers</FormLabel>
                                <p className="text-sm text-gray-600">Receive promotional offers and discounts</p>
                              </div>
                              <FormControl>
                                <Switch 
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="switch-promotional-offers"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button 
                        type="submit" 
                        disabled={updateServicePrefsMutation.isPending}
                        data-testid="button-save-service-preferences"
                      >
                        {updateServicePrefsMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsEditing(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              ) : (
                <div className="space-y-6">
                  {/* Service Timing Display */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-medium">Service Timing</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Preferred Day:</span>
                          <span className="font-medium">{servicePrefs?.preferredServiceDay}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Preferred Time:</span>
                          <span className="font-medium">{servicePrefs?.preferredServiceTime}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium">Service Location</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Location Type:</span>
                          <Badge variant="outline" className="capitalize">
                            {servicePrefs?.serviceLocation?.replace('_', ' ')}
                          </Badge>
                        </div>
                        {servicePrefs?.serviceLocationAddress && (
                          <div>
                            <span className="text-gray-600">Address:</span>
                            <p className="mt-1 text-sm">{servicePrefs.serviceLocationAddress}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Favorite Services */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Favorite Services</h4>
                    <div className="flex flex-wrap gap-2">
                      {servicePrefs?.favoriteServices?.map((service) => (
                        <Badge key={service} variant="outline">
                          <Star size={12} className="mr-1" />
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Special Instructions */}
                  {servicePrefs?.specialInstructions && (
                    <div className="space-y-3">
                      <h4 className="font-medium">Special Instructions</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {servicePrefs.specialInstructions}
                      </p>
                    </div>
                  )}

                  <Separator />

                  {/* Service Options */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Service Options</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Auto Booking:</span>
                        <Badge variant={servicePrefs?.autoBookingEnabled ? "default" : "outline"}>
                          {servicePrefs?.autoBookingEnabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Service Reminders:</span>
                        <Badge variant={servicePrefs?.serviceReminders ? "default" : "outline"}>
                          {servicePrefs?.serviceReminders ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Price Alerts:</span>
                        <Badge variant={servicePrefs?.priceAlerts ? "default" : "outline"}>
                          {servicePrefs?.priceAlerts ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Promotional Offers:</span>
                        <Badge variant={servicePrefs?.promotionalOffers ? "default" : "outline"}>
                          {servicePrefs?.promotionalOffers ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Preferences Tab */}
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard size={18} />
                  Billing & Payment Preferences
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(isEditing === "billing" ? null : "billing")}
                  data-testid="button-edit-billing-preferences"
                >
                  {isEditing === "billing" ? (
                    <>
                      <RotateCcw size={16} className="mr-1" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Edit size={16} className="mr-1" />
                      Edit
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              {billingLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : isEditing === "billing" ? (
                <Form {...billingForm}>
                  <form onSubmit={billingForm.handleSubmit(onBillingSubmit)} className="space-y-6">
                    <FormField
                      control={billingForm.control}
                      name="preferredPaymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Payment Method</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-payment-method">
                                <SelectValue placeholder="Select payment method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="cash">Cash</SelectItem>
                              <SelectItem value="card">Credit/Debit Card</SelectItem>
                              <SelectItem value="upi">UPI</SelectItem>
                              <SelectItem value="net_banking">Net Banking</SelectItem>
                              <SelectItem value="wallet">Digital Wallet</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={billingForm.control}
                      name="billingAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Billing Address</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter billing address"
                              {...field}
                              data-testid="textarea-billing-address"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={billingForm.control}
                        name="gstNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>GST Number (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="GST Number"
                                {...field}
                                data-testid="input-gst-number"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={billingForm.control}
                        name="invoiceEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Invoice Email (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                type="email"
                                placeholder="Invoice email address"
                                {...field}
                                data-testid="input-invoice-email"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium">Payment Options</h4>
                      <div className="space-y-3">
                        <FormField
                          control={billingForm.control}
                          name="autoPayEnabled"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between">
                              <div>
                                <FormLabel>Auto Pay</FormLabel>
                                <p className="text-sm text-gray-600">Automatically charge for recurring services</p>
                              </div>
                              <FormControl>
                                <Switch 
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="switch-auto-pay"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={billingForm.control}
                          name="paymentReminders"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between">
                              <div>
                                <FormLabel>Payment Reminders</FormLabel>
                                <p className="text-sm text-gray-600">Receive payment due reminders</p>
                              </div>
                              <FormControl>
                                <Switch 
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="switch-payment-reminders"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={billingForm.control}
                          name="loyaltyPointsAutoRedeem"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between">
                              <div>
                                <FormLabel>Auto Redeem Loyalty Points</FormLabel>
                                <p className="text-sm text-gray-600">Automatically apply loyalty points to bills</p>
                              </div>
                              <FormControl>
                                <Switch 
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="switch-auto-redeem-points"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button 
                        type="submit" 
                        disabled={updateBillingPrefsMutation.isPending}
                        data-testid="button-save-billing-preferences"
                      >
                        {updateBillingPrefsMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsEditing(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-medium">Payment Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Method:</span>
                          <Badge variant="outline" className="capitalize">
                            {billingPrefs?.preferredPaymentMethod?.replace('_', ' ')}
                          </Badge>
                        </div>
                        {billingPrefs?.gstNumber && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">GST Number:</span>
                            <span className="font-medium">{billingPrefs.gstNumber}</span>
                          </div>
                        )}
                        {billingPrefs?.invoiceEmail && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Invoice Email:</span>
                            <span className="font-medium">{billingPrefs.invoiceEmail}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium">Payment Options</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Auto Pay:</span>
                          <Badge variant={billingPrefs?.autoPayEnabled ? "default" : "outline"}>
                            {billingPrefs?.autoPayEnabled ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Reminders:</span>
                          <Badge variant={billingPrefs?.paymentReminders ? "default" : "outline"}>
                            {billingPrefs?.paymentReminders ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Auto Redeem Points:</span>
                          <Badge variant={billingPrefs?.loyaltyPointsAutoRedeem ? "default" : "outline"}>
                            {billingPrefs?.loyaltyPointsAutoRedeem ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {billingPrefs?.billingAddress && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <h4 className="font-medium">Billing Address</h4>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                          {billingPrefs.billingAddress}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell size={18} />
                Notification Preferences
              </CardTitle>
            </CardHeader>

            <CardContent>
              {notificationLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Appointment Reminders */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Appointment Reminders</h4>
                      <Switch 
                        checked={notificationPrefs?.appointmentReminders.enabled}
                        disabled
                      />
                    </div>
                    <div className="pl-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Channels:</span>
                        <div className="flex gap-1">
                          {notificationPrefs?.appointmentReminders.channels.map((channel) => (
                            <Badge key={channel} variant="outline" className="text-xs">
                              {channel}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Timing:</span>
                        <span>{notificationPrefs?.appointmentReminders.timing} hours before</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Service Reminders */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Service Reminders</h4>
                      <Switch 
                        checked={notificationPrefs?.serviceReminders.enabled}
                        disabled
                      />
                    </div>
                    <div className="pl-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Channels:</span>
                        <div className="flex gap-1">
                          {notificationPrefs?.serviceReminders.channels.map((channel) => (
                            <Badge key={channel} variant="outline" className="text-xs">
                              {channel}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Frequency:</span>
                        <span className="capitalize">{notificationPrefs?.serviceReminders.frequency}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Promotional Offers */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Promotional Offers</h4>
                      <Switch 
                        checked={notificationPrefs?.promotionalOffers.enabled}
                        disabled
                      />
                    </div>
                    <div className="pl-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Channels:</span>
                        <div className="flex gap-1">
                          {notificationPrefs?.promotionalOffers.channels.map((channel) => (
                            <Badge key={channel} variant="outline" className="text-xs">
                              {channel}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Categories:</span>
                        <div className="flex gap-1">
                          {notificationPrefs?.promotionalOffers.categories.map((category) => (
                            <Badge key={category} variant="outline" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Quiet Hours */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Quiet Hours</h4>
                      <Switch 
                        checked={notificationPrefs?.quietHours.enabled}
                        disabled
                      />
                    </div>
                    <div className="pl-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Time Range:</span>
                        <span>
                          {notificationPrefs?.quietHours.startTime} - {notificationPrefs?.quietHours.endTime}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button variant="outline" size="sm">
                      <Edit size={16} className="mr-1" />
                      Edit Notification Settings
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Personal Preferences Tab */}
        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User size={18} />
                  Personal Preferences
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(isEditing === "personal" ? null : "personal")}
                  data-testid="button-edit-personal-preferences"
                >
                  {isEditing === "personal" ? (
                    <>
                      <RotateCcw size={16} className="mr-1" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Edit size={16} className="mr-1" />
                      Edit
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              {personalLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : isEditing === "personal" ? (
                <Form {...personalForm}>
                  <form onSubmit={personalForm.handleSubmit(onPersonalSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={personalForm.control}
                        name="preferredLanguage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preferred Language</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-language">
                                  <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="English">English</SelectItem>
                                <SelectItem value="Hindi">Hindi</SelectItem>
                                <SelectItem value="Marathi">Marathi</SelectItem>
                                <SelectItem value="Tamil">Tamil</SelectItem>
                                <SelectItem value="Telugu">Telugu</SelectItem>
                                <SelectItem value="Kannada">Kannada</SelectItem>
                                <SelectItem value="Malayalam">Malayalam</SelectItem>
                                <SelectItem value="Bengali">Bengali</SelectItem>
                                <SelectItem value="Gujarati">Gujarati</SelectItem>
                                <SelectItem value="Punjabi">Punjabi</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={personalForm.control}
                        name="dateFormat"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date Format</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-date-format">
                                  <SelectValue placeholder="Select date format" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                                <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                                <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium">Privacy Settings</h4>
                      <div className="space-y-3">
                        <FormField
                          control={personalForm.control}
                          name="privacy.shareDataForImprovement"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between">
                              <div>
                                <FormLabel>Share Data for Service Improvement</FormLabel>
                                <p className="text-sm text-gray-600">Help us improve our services</p>
                              </div>
                              <FormControl>
                                <Switch 
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="switch-share-data"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={personalForm.control}
                          name="privacy.marketingEmails"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between">
                              <div>
                                <FormLabel>Marketing Emails</FormLabel>
                                <p className="text-sm text-gray-600">Receive promotional emails</p>
                              </div>
                              <FormControl>
                                <Switch 
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="switch-marketing-emails"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={personalForm.control}
                          name="privacy.smsMarketing"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between">
                              <div>
                                <FormLabel>SMS Marketing</FormLabel>
                                <p className="text-sm text-gray-600">Receive promotional SMS messages</p>
                              </div>
                              <FormControl>
                                <Switch 
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="switch-sms-marketing"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={personalForm.control}
                          name="privacy.whatsappMarketing"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between">
                              <div>
                                <FormLabel>WhatsApp Marketing</FormLabel>
                                <p className="text-sm text-gray-600">Receive promotional WhatsApp messages</p>
                              </div>
                              <FormControl>
                                <Switch 
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="switch-whatsapp-marketing"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium">Accessibility</h4>
                      <div className="space-y-3">
                        <FormField
                          control={personalForm.control}
                          name="accessibility.largeFonts"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between">
                              <div>
                                <FormLabel>Large Fonts</FormLabel>
                                <p className="text-sm text-gray-600">Use larger text for better readability</p>
                              </div>
                              <FormControl>
                                <Switch 
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="switch-large-fonts"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={personalForm.control}
                          name="accessibility.highContrast"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between">
                              <div>
                                <FormLabel>High Contrast</FormLabel>
                                <p className="text-sm text-gray-600">Use high contrast colors</p>
                              </div>
                              <FormControl>
                                <Switch 
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="switch-high-contrast"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button 
                        type="submit" 
                        disabled={updatePersonalPrefsMutation.isPending}
                        data-testid="button-save-personal-preferences"
                      >
                        {updatePersonalPrefsMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsEditing(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-medium">Regional Settings</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Language:</span>
                          <span className="font-medium">{personalPrefs?.preferredLanguage}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Date Format:</span>
                          <span className="font-medium">{personalPrefs?.dateFormat}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Currency:</span>
                          <span className="font-medium">{personalPrefs?.currencyFormat}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium">Accessibility</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Large Fonts:</span>
                          <Badge variant={personalPrefs?.accessibility.largeFonts ? "default" : "outline"}>
                            {personalPrefs?.accessibility.largeFonts ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">High Contrast:</span>
                          <Badge variant={personalPrefs?.accessibility.highContrast ? "default" : "outline"}>
                            {personalPrefs?.accessibility.highContrast ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-medium">Privacy & Marketing</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Marketing Emails:</span>
                        <Badge variant={personalPrefs?.privacy.marketingEmails ? "default" : "outline"}>
                          {personalPrefs?.privacy.marketingEmails ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">SMS Marketing:</span>
                        <Badge variant={personalPrefs?.privacy.smsMarketing ? "default" : "outline"}>
                          {personalPrefs?.privacy.smsMarketing ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">WhatsApp Marketing:</span>
                        <Badge variant={personalPrefs?.privacy.whatsappMarketing ? "default" : "outline"}>
                          {personalPrefs?.privacy.whatsappMarketing ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Data Sharing:</span>
                        <Badge variant={personalPrefs?.privacy.shareDataForImprovement ? "default" : "outline"}>
                          {personalPrefs?.privacy.shareDataForImprovement ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}