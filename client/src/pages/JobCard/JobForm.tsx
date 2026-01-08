import { useState, useEffect, useRef } from "react";
import { useForm, UseFormSetError } from "react-hook-form";
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
import { type Customer, type Vehicle, JobCard, JobCardFormValues } from "@/lib/types";
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
  Loader2,
  ChevronLeft
} from "lucide-react";
import { z } from "zod";
import POSLayout from "@/components/layout/pos-layout";
import InlineCustomerForm from "@/components/forms/inline-customer-form";
import ServiceHistoryPanel from "@/components/customer/service-history-panel";
import { useLocation, useSearchParams } from "wouter";
import { FloatingField } from "@/components/common/FloatingField";
import { FloatingTextarea } from "@/components/common/FloatingTextarea";
import { FloatingRHFSelect } from "@/components/common/FloatingRHFSelect";
import { SectionCard } from "@/components/common/card";
import { Loader } from "@/components/common/loader";
import { FloatingDateField } from "@/components/common/FloatingDateField";
import { findIdByName } from "@/lib/utils";
import { fetchCityList, fetchStateList } from "@/lib/api";
import { NewJobCardSchema } from "@/lib/schema";
import { useAuth } from "@/lib/auth";
import CommonDeleteModal from "@/components/common/CommonDeleteModal";

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


export default function JobForm() {
  const [step, setStep] = useState(1);
  const [, navigate] = useLocation();

  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const mode = searchParams.get("mode");
  const isView = mode === "view";

  const [isInfoLoading, setIsInfoLoading] = useState(false);

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const toggleService = (serviceId: string) => {
    const newSelection = selectedServices.includes(serviceId)
      ? selectedServices.filter(id => id !== serviceId)
      : [...selectedServices, serviceId];

    setSelectedServices(newSelection);
    form.setValue('service_opted', newSelection);
  };

  const form = useForm<JobCardFormValues>({
    resolver: zodResolver(NewJobCardSchema),
    defaultValues: {
      customer_id: undefined,

      service_date: "",

      vehicle_type: "",
      vehicle_make: "",
      vehicle_model: "",
      vehicle_color: "",

      make_year: "",
      registration_no: "",
      chassis_no: "",
      srs: "",

      service_opted: [],
      // service_amount: "",

      vehicle_remark: "",

      repainted_vehicle: false,
      single_stage_paint: false,
      paint_thickness_below_2mil: false,
      vehicle_older_than_5_years: false,
      service_type: [],
      name: "",
      mobile_no: "",
      email: "",
      country_id: "India",
      // district: "",
      // city_id: "",
      state_id: "",
      // pincode: "",
      address: "",
      // message: "",

      add_gst: false,
    },
  });

  const { toast } = useToast();
  const addGST = form.watch("add_gst");
  const { countries } = useAuth();
  const [countryList, setCountryList] = useState<
    { id: number; name: string; slug?: string }[]
  >([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [gstStates, setGstStates] = useState<any[]>([]);
  const [gstCities, setGstCities] = useState<any[]>([]);
  const [loadingGstState, setLoadingGstState] = useState(false);
  const [loadingGstCity, setLoadingGstCity] = useState(false);

  const isGstHydratingRef = useRef(false);

  useEffect(() => {
    if (!addGST || !countryList.length) return;

    const india = countryList.find(c => c.name === "India");
    if (!india) return;

    isGstHydratingRef.current = true;

    form.setValue("gst_country_id", String(india.id));
    form.setValue("gst_state_id", "");
    // form.setValue("gst_city_id", "");

    setGstStates([]);
    setGstCities([]);

    isGstHydratingRef.current = false;
  }, [addGST, countryList]);
  const [loadingState, setLoadingState] = useState(false);
  const [loadingCity, setLoadingCity] = useState(false);

  const isHydratingRef = useRef(false);
  useEffect(() => {

    setCountryList(countries)
  }, [countries])

  const [initialValues, setInitialValues] = useState<any | null>(null)
  useEffect(() => {

    if ((mode == "create" || !mode) &&
      countryList.length) {
      const hydrateLocation = async () => {
        // 1️⃣ COUNTRY
        isHydratingRef.current = true;
        try {
          const countryId = findIdByName(countryList, '101');

          if (!countryId) return;

          form.setValue("country_id", String(countryId));

          // 2️⃣ STATES
          setLoadingState(true);
          const stateList = await fetchStateList(countryId);
          setStates(stateList);
          setLoadingState(false);

        } catch (e) {
          console.error(e)
        } finally {
          // ✅ hydration completed
          isHydratingRef.current = false;
        }
      };
      hydrateLocation()
    }
    if (
      (mode !== "edit" && mode !== "view") ||
      !initialValues ||
      !countryList.length
    ) return;

    const hydrateLocation = async () => {
      // 1️⃣ COUNTRY
      isHydratingRef.current = true;
      try {
        const countryId = findIdByName(countryList, initialValues.country);

        if (!countryId) return;

        form.setValue("country_id", String(countryId));

        // 2️⃣ STATES
        setLoadingState(true);
        const stateList = await fetchStateList(countryId);
        setStates(stateList);
        setLoadingState(false);

        const stateId = findIdByName(stateList, initialValues.state);

        if (!stateId) return;

        form.setValue("state_id", String(stateId));

        // 3️⃣ CITIES
        setLoadingCity(true);
        const cityList = await fetchCityList(stateId);
        setCities(cityList);
        setLoadingCity(false);

        const cityId = findIdByName(cityList, initialValues.city);
        if (!cityId) return;

        // form.setValue("city_id", String(cityId));

      } finally {
        // ✅ hydration completed
        isHydratingRef.current = false;
      }
    };

    hydrateLocation();
  }, [mode, initialValues, countryList]);

  const fetchJobFormInfo = async () => {
    try {
      setIsInfoLoading(true);
      //  const res =
      //    await fetchStoreById(id ?? "");

      //  const updatedInfo = { ...res?.data, territory_id: res?.data?.territory?.id ?? "" }
      //  setInitialValues(updatedInfo)
    } catch (e) {
      console.error(e);

    } finally {
      setIsInfoLoading(false);
    }
  };
  useEffect(() => {
    if (id) {
      fetchJobFormInfo();

    }
  }, [id]);
  useEffect(() => {
    if (mode !== "create" || !countryList.length) return;

    const india = countryList.find(c => c.name === "India");
    if (!india) return;

    form.setValue("country_id", String(india.id));
  }, [mode, countryList]);
  const onSubmit = (data: JobCardFormValues) => {
  };
  const [isJobCardSubmissionDeleteModalInfo, setIsJobCardSubmissionModalOpenInfo] = useState<{ open: boolean, info: any }>({
    open: false,
    info: {}
  });
  useEffect(() => {
    if (!initialValues) return;

    if (mode === "edit" || mode === "view") {
      form.reset({
        /* ===== CUSTOMER ===== */
        customer_id: initialValues.customer_id ?? undefined,

        name: initialValues.name ?? "",
        mobile_no: initialValues.mobile_no ?? "",
        email: initialValues.email ?? "",

        country_id: initialValues.country_id
          ? String(initialValues.country_id)
          : "India",

        state_id: initialValues.state_id
          ? String(initialValues.state_id)
          : "",

        // city_id: initialValues.city_id
        //   ? String(initialValues.city_id)
        //   : "",

        // district: initialValues.district ?? "",
        // pincode: initialValues.pincode ?? "",
        address: initialValues.address ?? "",
        // message: initialValues.message ?? "",


        service_date: initialValues.service_date
          ? new Date(initialValues.service_date).toISOString().slice(0, 10)
          : "",

        /* ===== VEHICLE ===== */
        vehicle_type: initialValues.vehicle_type ?? "",
        vehicle_make: initialValues.vehicle_make ?? "",
        vehicle_model: initialValues.vehicle_model ?? "",
        vehicle_color: initialValues.vehicle_color ?? "",

        make_year: initialValues.make_year ?? "",
        registration_no: initialValues.registration_no ?? "",
        chassis_no: initialValues.chassis_no ?? "",
        srs: initialValues.srs ?? "",

        service_opted: initialValues.service_opted ?? [],
        // service_amount: initialValues.service_amount ?? "",

        vehicle_remark: initialValues.vehicle_remark ?? "",

        /* ===== VEHICLE CONDITION ===== */
        repainted_vehicle: Boolean(initialValues.repainted_vehicle),
        single_stage_paint: Boolean(initialValues.single_stage_paint),
        paint_thickness_below_2mil: Boolean(initialValues.paint_thickness_below_2mil),
        vehicle_older_than_5_years: Boolean(initialValues.vehicle_older_than_5_years),

        /* ===== GST ===== */
        service_type: initialValues.service_type ?? [],
        add_gst: Boolean(initialValues.add_gst),
      });
    }
  }, [mode, initialValues, form]);
  useEffect(() => {

    if ((mode == "create" || !mode) &&
      countryList.length) {
      const hydrateLocation = async () => {
        // 1️⃣ COUNTRY
        isGstHydratingRef.current = true;
        try {
          const countryId = findIdByName(countryList, '101');

          if (!countryId) return;

          form.setValue("gst_country_id", String(countryId));

          // 2️⃣ STATES
          setLoadingGstState(true);
          const stateList = await fetchStateList(countryId);
          setGstStates(stateList);
          setLoadingGstState(false);

        } catch (e) {
          console.error(e)
        } finally {
          // ✅ hydration completed
          isGstHydratingRef.current = false;
        }
      };
      hydrateLocation()
    }
    if (!initialValues || !addGST || !countryList.length) return;

    const hydrateGstLocation = async () => {
      isGstHydratingRef.current = true;

      try {
        const countryId = findIdByName(countryList, initialValues.gst_country);
        if (!countryId) return;

        form.setValue("gst_country_id", String(countryId));

        setLoadingGstState(true);
        const stateList = await fetchStateList(countryId);
        setGstStates(stateList);
        setLoadingGstState(false);

        const stateId = findIdByName(stateList, initialValues.gst_state);
        if (!stateId) return;

        form.setValue("gst_state_id", String(stateId));

        setLoadingGstCity(true);
        const cityList = await fetchCityList(stateId);
        setGstCities(cityList);
        setLoadingGstCity(false);

        const cityId = findIdByName(cityList, initialValues.gst_city);
        if (!cityId) return;

        // form.setValue("gst_city_id", String(cityId));
      } finally {
        isGstHydratingRef.current = false;
      }
    };

    hydrateGstLocation();
  }, [initialValues, addGST, countryList]);
  useEffect(() => {
    console.log(form.formState.errors, form.getValues(), 'form.formState.errors');

  })

  async function handleJobCardSubmission(values: JobCardFormValues) {
    setIsLoading(true);

    try {
      if (mode === "edit") {
        // await EditStore(value);

        toast({
          title: "Edit Job Card",
          description: "Job Card updated successfully",
          variant: "success",
        });

        navigate("/job-cards")
      } else {

        //const res= await SaveStore(value);

        toast({
          title: "Add Job Card",
          description: " Job Card added successfully",
          variant: "success",
        });
        // ✅ ONLY open modal here
        setIsJobCardSubmissionModalOpenInfo({
          open: true,
          info: id,
        });
      }


    } catch (err: any) {
      const apiErrors = err?.response?.data?.errors;


      // 👇 THIS IS THE KEY PART
      if (apiErrors && err?.response?.status === 422) {
        // Object.entries(apiErrors).forEach(([field, messages]) => {
        //   setError(field as keyof any, {
        //     type: "server",
        //     message: (messages as string[])[0],
        //   });
        // });
        return;
      }
      if (err?.response?.status === 403) {
        navigate("/master")
      }
      toast({
        title: "Error",
        description:
          err?.response?.data?.message ||
          err.message ||
          `Failed to ${mode === "create" ? "add" : "update"
          } store`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <div className="max-w-7xl  mx-auto px-4 py-4 space-y-4">
        {/* HEADER */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-semibold">
              {isView ? "View Job Card" : id ? "Edit Job Card" : "Create New Job Card"}
            </h1>

          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 rounded-xl ">



          {/* Main Job Creation Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="">

              {/* Customer Lookup Section */}
              <Card className="mb-6">
                <SectionCard title="Customer Information" className="pb-4">
                  {/* BASIC INFO */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FloatingField
                      name="name"
                      label="Name"
                      isRequired
                      control={form.control}
                    />


                    <FloatingField
                      name="mobile_no"
                      label="Mobile No"
                      isRequired
                      control={form.control}
                    />

                    <FloatingField
                      name="email"
                      label="Email"
                      isRequired
                      control={form.control}
                    />

                    {/* COUNTRY */}
                    <FloatingRHFSelect
                      name="country_id"
                      label="Country"
                      control={form.control}
                      isRequired
                      isDisabled={isView}
                      options={countryList.map(c => ({
                        value: String(c.id),
                        label: c.name,
                      }))}
                      onValueChange={async (value) => {
                        if (isHydratingRef.current) return;

                        setStates([]);
                        setCities([]);
                        form.setValue("state_id", "");
                        // form.setValue("city_id", "");

                        setLoadingState(true);
                        const stateList = await fetchStateList(Number(value));
                        setStates(stateList);
                        setLoadingState(false);
                      }}
                    />

                    {/* STATE */}
                    <FloatingRHFSelect
                      name="state_id"
                      label="State"
                      control={form.control}
                      isRequired
                      isDisabled={isView || !form.getValues("country_id")}
                      options={states.map(s => ({
                        value: String(s.id),
                        label: s.name,
                      }))}
                      onValueChange={async (value) => {
                        if (isHydratingRef.current) return;

                        setCities([]);
                        // form.setValue("city_id", "");

                        setLoadingCity(true);
                        const cityList = await fetchCityList(Number(value));
                        setCities(cityList);
                        setLoadingCity(false);
                      }}
                    />
{/* 
                    <FloatingRHFSelect
                      name="city_id"
                      label="City"
                      control={form.control}
                      isRequired
                      isDisabled={isView || !form.getValues("state_id")}
                      options={cities.map(c => ({
                        value: String(c.id),
                        label: c.name,
                      }))}
                    /> */}

                    {/* <FloatingField
                      name="district"
                      label="District"
                      isRequired
                      control={form.control}
                    />

                    <FloatingField
                      name="pincode"
                      label="Pincode"
                      isRequired
                      control={form.control}
                    /> */}
                  </div>

                  {/* ADDRESS + MESSAGE */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <FloatingTextarea
                      name="address"
                      label="Address"
                      isRequired
                      control={form.control}
                    />

                    {/* <FloatingTextarea
                      name="message"
                      label="Message"
                      control={form.control}
                    /> */}
                  </div>

                  {/* GST OPTIONAL */}

                  <div className="mt-4 flex items-center gap-2">
                    <FormField
                      control={form.control}
                      name="add_gst"
                      render={({ field }) => (
                        <label className="flex items-center gap-2 font-bold text-sm cursor-pointer">
                          <Checkbox
                            checked={addGST}
                            onCheckedChange={(val) => form.setValue("add_gst", Boolean(val))}
                          />
                          Add GST Details (Optional)
                        </label>
                      )}
                    />

                  </div>
                  {
                    addGST
                    &&
                    (
                      <div className="pt-4">
                        <h4 className="text-sm font-semibold mb-4">
                          GST Information
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FloatingField
                            name="gst_company_name"
                            label="Company Name"
                            control={form.control}
                          />

                          <FloatingField
                            name="gst_contact_no"
                            label="Company Contact No."
                            control={form.control}
                          />

                          <FloatingField
                            name="gstin"
                            label="GSTIN"
                            control={form.control}
                          />

                          <FloatingRHFSelect
                            name="gst_country_id"
                            label="Country"
                            control={form.control}
                            isDisabled={isView}
                            options={countryList.map(c => ({
                              value: String(c.id),
                              label: c.name,
                            }))}
                            onValueChange={async (value) => {
                              if (isGstHydratingRef.current) return;

                              setGstStates([]);
                              setGstCities([]);
                              form.setValue("gst_state_id", "");
                              // form.setValue("gst_city_id", "");

                              setLoadingGstState(true);
                              const stateList = await fetchStateList(Number(value));
                              setGstStates(stateList);
                              setLoadingGstState(false);
                            }}
                          />
                          <FloatingRHFSelect
                            name="gst_state_id"
                            label="State"
                            control={form.control}
                            isDisabled={isView || !form.getValues("gst_country_id")}
                            options={gstStates.map(s => ({
                              value: String(s.id),
                              label: s.name,
                            }))}
                            onValueChange={async (value) => {
                              if (isGstHydratingRef.current) return;

                              setGstCities([]);
                              // form.setValue("gst_city_id", "");

                              setLoadingGstCity(true);
                              const cityList = await fetchCityList(Number(value));
                              setGstCities(cityList);
                              setLoadingGstCity(false);
                            }}
                          />

                          {/* <FloatingRHFSelect
                            name="gst_city_id"
                            label="City"
                            control={form.control}
                            isDisabled={isView || !form.getValues("gst_state_id")}
                            options={gstCities.map(c => ({
                              value: String(c.id),
                              label: c.name,
                            }))}
                          />
                          <FloatingField
                            name="gst_district"
                            label="District"
                            control={form.control}
                          /> */}

                          {/* <FloatingField
                            name="gst_pincode"
                            label="Pincode"
                            control={form.control}
                          /> */}
                        </div>

                        {/* <div className="mt-4">
                          <FloatingTextarea
                            name="gst_address"
                            label="Company Address"
                            control={form.control}
                          />
                        </div> */}
                      </div>
                    )}
                </SectionCard>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">


                {/* Vehicle Information */}
                <Card>
                  <SectionCard title="Vehicle Information" className="pb-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                      <FloatingRHFSelect
                        name="vehicle_make"
                        label="Vehicle Make"
                        isRequired
                        control={form.control}
                        options={[
                          { value: "HYUNDAI", label: "Hyundai" },
                          { value: "HONDA", label: "Honda" },
                          { value: "TOYOTA", label: "Toyota" },
                        ]}
                      />

                      <FloatingRHFSelect
                        name="vehicle_model"
                        label="Vehicle Model"
                        isRequired
                        control={form.control}
                        options={[
                          { value: "VERNA", label: "Verna" },
                          { value: "CITY", label: "City" },
                          { value: "INNOVA", label: "Innova" },
                        ]}
                      />

                      <FloatingField
                        name="vehicle_color"
                        label="Vehicle Color"
                        isRequired
                        control={form.control}
                      />

                      <FloatingRHFSelect
                        name="make_year"
                        label="Make Year"
                        isRequired
                        control={form.control}
                        options={[
                          { value: "2025", label: "2025" },
                          { value: "2024", label: "2024" },
                          { value: "2023", label: "2023" },
                        ]}
                      />

                      <FloatingField
                        name="registration_no"
                        label="Registration No"
                        isRequired
                        control={form.control}
                      />

                      <FloatingField
                        name="chassis_no"
                        label="Chassis No"
                        control={form.control}
                      />

                      <FloatingRHFSelect
                        name="srs"
                        label="SRS Condition"
                        isRequired
                        control={form.control}
                        options={[
                          { value: "brand_new", label: "Brand New" },
                          { value: "minor_damage", label: "Minor Damage" },
                          { value: "major_damage", label: "Major Damage" },
                        ]}
                      />

                      {/* <FloatingField
                        name="service_amount"
                        label="Service Amount"
                        control={form.control}
                      /> */}
                    </div>
  {/* PAINT CONDITION */}
                    <div className="mt-4">
                          <p className="mb-3 block text-sm font-medium text-[gray]">
                     Vehicle Paint Condition
                      </p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <FormField
                          control={form.control}
                          name="repainted_vehicle"
                          render={({ field }) => (
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={(val) => field.onChange(Boolean(val))}
                              />
                              Repainted Vehicle
                            </label>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="single_stage_paint"
                          render={({ field }) => (
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={(val) => field.onChange(Boolean(val))}
                              />
                              Single Stage Paint
                            </label>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="paint_thickness_below_2mil"
                          render={({ field }) => (
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={(val) => field.onChange(Boolean(val))}
                              />
                              Paint Thickness below 2 MIL
                            </label>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="vehicle_older_than_5_years"
                          render={({ field }) => (
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={(val) => field.onChange(Boolean(val))}
                              />
                              Vehicle older than 5 years
                            </label>
                          )}
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <FloatingTextarea
                        name="vehicle_remark"
                        label="Remark"
                        control={form.control}
                      />
                    </div>

                  
                  </SectionCard>
                </Card>

                {/* Service Selection & Summary */}
                <Card>
                  <SectionCard title="Service Information" className="pb-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Vehicle Type */}
                      <FloatingRHFSelect
                        name="vehicle_type"
                        label="Vehicle Type"
                        isRequired
                        control={form.control}
                        options={[
                          { label: "Bike", value: "bike" },
                          { label: "Hatchback", value: "hatchback" },
                          { label: "Sedan", value: "sedan" },
                          { label: "SUV", value: "suv" },
                        ]}
                      />

                      {/* Service Date */}
                      <FloatingDateField
                        name="service_date"
                        label="Service Date"
                        isRequired
                        control={form.control}
                      />
                      {/* Service Type */}
                       <FloatingRHFSelect
                    name="service_type"
                    label="Service Type"
                    isMulti
                    isRequired
                    control={form.control}
                    options={[
                      { label: "Exterior Detailing", value: "exterior_detailing" },
                      { label: "Interior Detailing", value: "interior_detailing" },
                      { label: "Exterior Protection", value: "exterior_protection" },
                      { label: "PPF / Ceramic", value: "ppf_ceramic" },
                    ]}
                  />

                      {/* Service Type (Multi) */}

                    </div>
                    <div className="mt-4">
                      <p className="mb-3 block text-sm font-medium text-[gray]">
                       Select Services <span className="text-red-500">*</span>
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {availableServices.map(service => {
                          const isSelected = selectedServices.includes(service.id);

                          return (
                            <Card
                              key={service.id}
                              onClick={() => toggleService(service.id)}
                              className={`
    cursor-pointer transition-all border
    ${isSelected
                                  ? "border-primary bg-primary/5 shadow-sm"
                                  : "hover:border-muted-foreground/30"}
  `}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-start gap-2">
                                    <Checkbox
                                      checked={isSelected}
                                      onCheckedChange={() => toggleService(service.id)}
                                      onClick={(e) => e.stopPropagation()} // 🔴 IMPORTANT
                                    />

                                    <div>
                                      <p className="font-medium leading-tight">
                                        {service.name}
                                      </p>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {service.description}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="text-right">
                                    <p className="text-lg font-semibold text-green-600">
                                      ₹{service.price}
                                    </p>
                                    <Badge variant="outline" className="mt-1">
                                      {service.category}
                                    </Badge>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>

                      {/* Validation error */}
                      <FormMessage className="pt-1 text-[0.75rem]">
                        {form.formState.errors.service_opted?.message}
                      </FormMessage>
                    </div>

                  </SectionCard>
                </Card>
              </div>


              <div className="  pb-4 flex justify-end gap-3 mt-4">
                <Button
                  variant="outline"
                  disabled={isLoading || isInfoLoading}
                  className={'hover:bg-[#E3EDF6] hover:text-[#000]'}
                  onClick={() => navigate("/job-cards")}
                >
                  {'Cancel'}
                </Button>

                {(
                  <Button type="button"
                    disabled={isLoading || isInfoLoading}
                    onClick={form.handleSubmit(handleJobCardSubmission)}
                    className="bg-[#FE0000] hover:bg-[rgb(238,6,6)]">
                    {isLoading && <Loader color="#fff" isShowLoadingText={false} />}
                    {isLoading
                      ? id ? "Updating..." : "Adding..."
                      : id ? "Update " : "Add "}
                  </Button>
                )}

              </div>
            </form>
          </Form>
        </div>
        <CommonDeleteModal
          isOpen={isJobCardSubmissionDeleteModalInfo.open}
          title="Job Card Created"
          description="Would you like to proceed with invoice creation for this job card?"
          confirmText="Yes, create invoice"
          cancelText="No"
          onCancel={() => navigate("/job-cards")}
          onConfirm={() =>
            navigate(`/invoice/manage?job_card_id=${isJobCardSubmissionDeleteModalInfo.info}`)
          }
        />
      </div>
    </>
  );
}