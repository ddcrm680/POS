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
import { consumerSave, consumerUpdate, fetchCityList, fetchStateList, fetchStoreCrispList, jobFormSubmission, lookupCustomerByPhone } from "@/lib/api";
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
      billing_type: "individual",

      vehicle_remark: "",

      repainted_vehicle: false,
      single_stage_paint: false,
      paint_thickness_below_2mil: false,
      vehicle_older_than_5_years: false,
      service_type: [],
      name: "",
      gst_contact_no: "",
      search_mobile: "",
      gstin: "",
      mobile_no: "",
      email: "",
      country_id: "India",
      store_id: "",
      // district: "",
      // city_id: "",
      state_id: "",
      // pincode: "",
      address: "",
      // message: "",

    },
  });

  const { toast } = useToast();
  const { countries } = useAuth();

  const [isLookingUp, setIsLookingUp] = useState(false);
  const [customerFound, setCustomerFound] = useState<boolean | null>(null);
  const disablePhone = customerFound === true;
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
  const { user, } = useAuth();

  useEffect(() => {
    form.setValue('role', user?.role);
  }, [user])
  useEffect(() => {
    if (!countryList.length) return;

    const india = countryList.find(c => c.name === "India");
    if (!india) return;

    isGstHydratingRef.current = true;

    form.setValue("gst_country_id", String(india.id));
    form.setValue("gst_state_id", "");
    // form.setValue("gst_city_id", "");

    setGstStates([]);
    setGstCities([]);

    isGstHydratingRef.current = false;
  }, [countryList]);
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
        store_id: initialValues.store_id ?? "",
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
      });
    }
  }, [mode, initialValues, form]);

  const isAdmin =
    user?.role === "admin" || user?.role === "super-admin";
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
    if (!initialValues || !countryList.length) return;

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
  }, [initialValues, countryList]);
  useEffect(() => {
    console.log(form.formState.errors, form.getValues(), 'form.formState.errors');

  })

  async function handleJobCardSubmission(values: JobCardFormValues) {
    setIsLoading(true);

    try {
      let customerId = values.customer_id;

      // 🔹 STEP 1: HANDLE CUSTOMER
      const customerPayload = {
        ...(customerId ? { id: customerId } : {}),
        name: values.name,
        phone: values.mobile_no,
        email: values.email,
        address: values.address,
        type: values.billing_type,
        ...(values.billing_type === "company" && {
          country_id: values.country_id,
          company_country_id: values.gst_country_id,
          company_state_id: values.gst_state_id,
          company_contact_no: values.gst_contact_no,
          company_gstin: values.gstin,
        }),
        state_id: values.state_id,
        store_id: values.store_id,
      }
      if (customerFound === true && customerId) {
        // ✅ Existing customer → UPDATE
        await consumerUpdate(customerPayload);
      }

      if (customerFound === false) {
        // ✅ New customer → SAVE
        const res = await consumerSave(customerPayload);

        customerId = res.data.id; // 🔑 IMPORTANT
      }

      if (!customerId) {
        throw new Error("Customer could not be resolved");
      }

      // 🔹 STEP 2: SAVE JOB CARD
      const jobCardPayload = {
        ...(id ? { id } : {}),
        store_id: values.store_id,
        consumer_id: values.customer_id,
        "vehicle_type": values.vehicle_type,
        "service_ids": values.service_opted,
        "vehicle_company_id": values.vehicle_make,
        "vehicle_model_id": values.vehicle_model,
        "color": values.vehicle_color,
        "year": values.make_year,
        "reg_no": values.registration_no,
        jobcard_date: values.service_date,
        "chasis_no": values.chassis_no,
        "vehicle_condition": values.srs,
        "remarks": values.vehicle_remark,
        "isRepainted": values.repainted_vehicle,
        "isSingleStagePaint": values.single_stage_paint,
        "isPaintThickness": values.paint_thickness_below_2mil,
        "isVehicleOlder": values.vehicle_older_than_5_years,

      }
      const jobRes = await jobFormSubmission(jobCardPayload);

      toast({
        title: "Job Card Created",
        description: "Job card created successfully",
        variant: "success",
      });

      // ✅ Open invoice modal
      setIsJobCardSubmissionModalOpenInfo({
        open: true,
        info: jobRes.data.id,
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description:
          err?.response?.data?.message ||
          err.message ||
          "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }
  const searchMobile = form.watch("search_mobile");
  const customerMobile = form.watch("mobile_no");
  const store_id = form.watch("store_id");
  useEffect(() => {
    setCustomerFound(null);
    form.setValue("customer_id", undefined);
  }, [searchMobile]);
  useEffect(() => {
    if (!searchMobile || searchMobile.length !== 10 || !store_id) return;

    let cancelled = false;

    const lookup = async () => {
      setIsLookingUp(true);
      setCustomerFound(null);

      try {
        const customer = await lookupCustomerByPhone(searchMobile, store_id);
        if (cancelled) return;

        if (!customer) {
          // 🔸 New customer
          setCustomerFound(false);
           form.setValue("customer_id", "");
        form.setValue("mobile_no", "");
        form.setValue("name",  "");
        form.setValue("email",  "");
        form.setValue("address",  "");
        form.setValue("country_id", "");
        form.setValue("state_id", "");
        form.setValue(
          "billing_type",
         "individual"
        );

          form.setValue("gstin",  "");
        form.setValue("gst_contact_no",  "");
        form.setValue("gst_country_id", "");
        form.setValue("gst_state_id", "");
   
          form.setValue("customer_id", undefined);

          // ⚠️ DO NOT touch user-typed fields
          return;
        }

        // 🔹 Existing customer
        setCustomerFound(true);
        form.setValue("customer_id", String(customer.id));
        form.setValue("mobile_no", customer.mobile_no || searchMobile);
        form.setValue("name", customer.name || "");
        form.setValue("email", customer.email || "");
        form.setValue("address", customer.address || "");
        form.setValue("country_id", String(customer.country_id));
        form.setValue("state_id", String(customer.state_id));
        form.setValue(
          "billing_type",
          customer.type === "company" ? "company" : "individual"
        );

          form.setValue("gstin", customer.company_gstin || "");
        form.setValue("gst_contact_no", customer.company_contact_no || "");
        form.setValue("gst_country_id", String(customer.company_country_id));
        form.setValue("gst_state_id", String(customer.company_state_id));
   

        toast({
          title: "Customer found",
          description: "Customer details auto-filled",
          variant: "success",
        });
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setIsLookingUp(false);
      }
    };

    lookup();

    return () => {
      cancelled = true;
    };
  }, [searchMobile, store_id]);
  useEffect(() => {
    console.log(customerFound, 'customerFound');

  }, [customerFound])
  const [storeList, setStoreList] = useState<
    { value: string; label: string; isDisabled?: boolean }[]
  >([]);
  const fetchStoreList = async () => {
    try {
      const res = await fetchStoreCrispList();

      let options = res.data.map((store: any) => ({
        value: String(store.id),
        label: store.name,
      }));

      console.log(options, 'optionsoptions');

      setStoreList(options);
    } catch (e) {
      console.error(e);
    }
  };
  useEffect(() => {
    if (isAdmin) {
      fetchStoreList();
    }
  }, [isAdmin]);
  useEffect(() => {
    console.log(form.getValues(), 'getValues');

  })
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

              <Card className="mb-6 grid grid-cols-1 md:grid-cols-2 md:gap-4">
                {isAdmin && <SectionCard title="Store Information" className="pb-4 md:pr-0 ">
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                    <FloatingRHFSelect
                      name="store_id"
                      label="Select Store"
                      control={form.control}
                      isRequired
                      options={storeList.map((s: any) => ({
                        label: s.label,
                        value: String(s.value),
                      }))}
                    />
                  </div>
                </SectionCard>}
                <SectionCard title="Customer Lookup" className="pb-4 md:pl-0 pt-0 md:pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-1 items-end">
                    <FloatingField
                      name="search_mobile"
                      label="Search Mobile Number"
                      isRequired
                      control={form.control}
                    />

                    {(isLookingUp || customerFound !== null) && <div className="text-sm h-[38px] flex items-center">
                      {isLookingUp && (
                        <span className="text-muted-foreground flex items-center gap-2">
                          <Loader2 className="animate-spin h-4 w-4" />
                          Looking up customer…
                        </span>
                      )}

                      {!isLookingUp && customerFound === true && (
                        <span className="text-green-600 flex items-center gap-2">
                          <CheckCircle size={16} />
                          Existing customer found
                        </span>
                      )}

                      {!isLookingUp && customerFound === false && (
                        <span className="text-orange-500">
                          New customer
                        </span>
                      )}
                    </div>}
                  </div>
                </SectionCard>

              </Card>

              {/* Customer Lookup Section */}
              {customerFound !== null && <Card className="mb-6">

                <SectionCard title="Customer Information" className="pb-4 grid gap-4" headingMarginBottom={"mb-0"}>
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
                      isDisabled={customerFound === true}
                    />

                    <FloatingField
                      name="email"
                      label="Email"
                      isRequired
                      control={form.control}
                    />



                  </div>
                  {/* ADDRESS + MESSAGE */}
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                    <FloatingTextarea
                      name="address"
                      label="Address"
                      isRequired
                      control={form.control}
                    />

                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

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
                    <div className="flex flex-col items-start">
                      <FloatingRHFSelect
                        name="billing_type"
                        label="Billing Type"
                        control={form.control}
                        isRequired
                        options={[
                          { label: "Company", value: "company" },
                          { label: "Individual", value: "individual" },
                        ]}
                        onValueChange={(value) => {
                          if (typeof value !== "string") return;
                          const billingType = value as "company" | "individual";
                          form.setValue("billing_type", billingType);
                        }}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Select <b>Company</b> if you need GST invoice
                      </p>
                    </div>

                  </div>



                  {/* GST OPTIONAL */}

                  {
                    form.watch("billing_type") === "company" &&
                    (
                      <div className="">
                        <h4 className="text-sm font-semibold mb-4">
                          GST Information
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        

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

                        </div>

                      </div>
                    )}
                </SectionCard>
              </Card>
              }
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
                              className={`
    transition-all border
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