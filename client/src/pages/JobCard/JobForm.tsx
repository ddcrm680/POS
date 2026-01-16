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
import { type Customer, type Vehicle, JobServiceOption, JobCard, JobCardFormValues, option, ServiceCard, JobCardFormUnion } from "@/lib/types";
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
import { cn, findIdByName } from "@/lib/utils";
import { consumerSave, consumerUpdate, fetchCityList, fetchStateList, fetchStoreCrispList, getJobCardItem, getServiceOptionByTypeVehicle, jobCardMetaInfo, jobCardModelInfo, jobFormSubmission, lookupCustomerByPhone } from "@/lib/api";
import { JobCardOnlySchema, NewJobCardSchema } from "@/lib/schema";
import { useAuth } from "@/lib/auth";
import CommonDeleteModal from "@/components/common/CommonDeleteModal";

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
      ? selectedServices.filter(id => Number(id) !== Number(serviceId))
      : [...selectedServices, serviceId];

    setSelectedServices(newSelection);
    form.setValue("service_ids", newSelection, {
      shouldValidate: true,
    });
  };

  const form = useForm<JobCardFormUnion>({
    resolver: zodResolver((mode !== "view" && mode !== 'edit') ? NewJobCardSchema : JobCardOnlySchema),
    defaultValues: {
      consumer_id: undefined,

      jobcard_date: "",

      vehicle_type: "",
      vehicle_company_id: "",
      vehicle_model_id: "",
      color: "",

      year: "",
      reg_no: "",
      chasis_no: "",
      vehicle_condition: "",

      service_ids: [],
      // service_amount: "",
      type: "individual",

      remarks: "",

      isRepainted: false,
      isSingleStagePaint: false,
      isPaintThickness: false,
      isVehicleOlder: false,
      service_type: [],
      name: "",
      company_contact_no: "",
      search_mobile: "",
      company_gstin: "",
      phone: "",
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

  const [services, setServices] = useState<ServiceCard[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
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

  const [meta, setMeta] = useState({
    vehicleCompanies: [] as option[],
    vehicleModels: [] as option[],

    vehicleTypes: [] as option[],
    serviceTypes: [] as option[],
    years: [] as option[],
    srsCondition: [] as option[],

    loadingModels: false,
  });
  const isGstHydratingRef = useRef(false);
  const { user, } = useAuth();
  const toSelectOptions = <T extends { value: any; label: string }>(
    list: T[] = []
  ) =>
    list.map(item => ({
      label: item.label,
      value: String(item.value), // 🔑 force string
    }));
  const vehicleType = form.watch("vehicle_type");
  const serviceTypes = form.watch("service_type"); // multi select (string[])
  useEffect(() => {
    const loadMeta = async () => {
      const data = await jobCardMetaInfo();
      if (!data) return;
      const value = {

        vehicleCompanies: toSelectOptions(data.vehicleCompanies),
        vehicleTypes: toSelectOptions(data.vehicleTypes),
        serviceTypes: toSelectOptions(data.serviceTypes),
        years: toSelectOptions(data.years),
        srsCondition: toSelectOptions(data.srsCondition),
      }

      setMeta(prev => (({ ...prev, ...value })));
    };

    loadMeta();
  }, []);
  useEffect(() => {
    if (!vehicleType || !serviceTypes?.length) {
      if (!isHydratingJobRef.current) {
        setServices([]);
        setSelectedServices([]);
        form.setValue("service_ids", []);
      }
      return;
    }

    const loadServices = async () => {
      setLoadingServices(true);

      const data = await getServiceOptionByTypeVehicle({
        vehicle_type: vehicleType,
        service_types: serviceTypes,
      });

      const normalized = data.map((item: any) => ({
        id: String(item.id),
        label: item.service_name,
        value: String(item.id),
        price: Number(item.price),
        description: item.description,
      }));

      setServices(normalized);

      setLoadingServices(false);
    };

    loadServices();
  }, [vehicleType, serviceTypes]);
  const vehicleCompanyId = form.watch("vehicle_company_id");
  const hasInitializedModelsRef = useRef(false);
  useEffect(() => {
    if (!vehicleCompanyId) {
      setMeta(prev => ({ ...prev, vehicleModels: [] }));
      return;
    }

    // 🚫 Skip ONLY hydration-triggered change
    if (hasInitializedModelsRef.current) {
      hasInitializedModelsRef.current = false;
      return;
    }

    let cancelled = false;

    const loadModels = async () => {
      setMeta(prev => ({ ...prev, loadingModels: true }));

      try {
        const models = await jobCardModelInfo(vehicleCompanyId);
        if (cancelled) return;

        setMeta(prev => ({
          ...prev,
          vehicleModels: toSelectOptions(models),
          loadingModels: false,
        }));

        // reset model ONLY when user changes make
        form.setValue("vehicle_model_id", "");
      } catch {
        if (!cancelled) {
          setMeta(prev => ({ ...prev, loadingModels: false }));
        }
      }
    };

    loadModels();

    return () => {
      cancelled = true;
    };
  }, [vehicleCompanyId]);
  useEffect(() => {
    form.setValue('role', user?.role);
  }, [user])
  useEffect(() => {
    if (!countryList.length) return;

    const india = countryList.find(c => c.name === "India");
    if (!india) return;

    isGstHydratingRef.current = true;

    form.setValue("company_country_id", String(india.id));
    form.setValue("company_state_id", "");
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
      const res =
        await getJobCardItem({ id: id ?? "" });

      setInitialValues(res)
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

    if (!initialValues || !countryList.length) return;
    if (mode !== "edit" && mode !== "view") return;

    const hydrate = async () => {
      /* ===== STORE ===== */
      if (isAdmin) {
        form.setValue("store_id", String(initialValues.job_card.store_id));
      }
      form.setValue("consumer_id", String(initialValues.job_card.consumer_id));
      /* ===== JOB CARD ===== */
      form.setValue(
        "jobcard_date",
        initialValues.job_card.jobcard_date
          ? new Date(initialValues.job_card.jobcard_date)
            .toISOString()
            .split("T")[0]
          : ""
      );


      form.setValue("vehicle_type", initialValues.job_card.vehicle_type);
      hasInitializedModelsRef.current = true;
      form.setValue("vehicle_company_id", String(initialValues.job_card.vehicle_company_id));
      form.setValue("color", initialValues.job_card.color ?? "");
      form.setValue("year", String(initialValues.job_card.year ?? ""));
      form.setValue("reg_no", initialValues.job_card.reg_no ?? "");
      form.setValue("chasis_no", initialValues.job_card.chasis_no ?? "");
      form.setValue("vehicle_condition", initialValues.job_card.vehicle_condition ?? "");
      form.setValue("remarks", initialValues.job_card.remarks ?? "");

      /* ===== CHECKBOXES ===== */
      form.setValue("isRepainted", Boolean(initialValues.job_card.isRepainted));
      form.setValue("isSingleStagePaint", Boolean(initialValues.job_card.isSingleStagePaint));
      form.setValue("isPaintThickness", Boolean(initialValues.job_card.isPaintThickness));
      form.setValue("isVehicleOlder", Boolean(initialValues.job_card.isVehicleOlder));

      /* ===== SERVICES ===== */
      const serviceTypeValues = (initialValues.opted_services || []).map(
        (item: any) => String(item.category_type)
      );

      const serviceIds = (initialValues.job_card.service_ids || []).map(String);


      isHydratingJobRef.current = true;

      form.setValue("service_type", serviceTypeValues);
      form.setValue("service_ids", serviceIds);
      setSelectedServices(serviceIds);

      isHydratingJobRef.current = false;

      /* ===== VEHICLE MODELS ===== */
      const models = await jobCardModelInfo(
        String(initialValues.job_card.vehicle_company_id)
      );


      setMeta(prev => ({
        ...prev,
        vehicleModels: toSelectOptions(models),
      }));

      form.setValue(
        "vehicle_model_id",
        String(initialValues.job_card.vehicle_model_id)
      );
    };

    hydrate();
  }, [initialValues, countryList, mode]);


  const onSubmit = (data: JobCardFormUnion) => {
  };
  const [isJobCardSubmissionDeleteModalInfo, setIsJobCardSubmissionModalOpenInfo] = useState<{ open: boolean, info: any }>({
    open: false,
    info: {}
  });

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

          form.setValue("company_country_id", String(countryId));

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

        form.setValue("company_country_id", String(countryId));

        setLoadingGstState(true);
        const stateList = await fetchStateList(countryId);
        setGstStates(stateList);
        setLoadingGstState(false);

        const stateId = findIdByName(stateList, initialValues.gst_state);
        if (!stateId) return;

        form.setValue("company_state_id", String(stateId));

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
  function isFullJobCard(
    values: JobCardFormUnion
  ): values is JobCardFormValues {
    return "phone" in values;
  }
  const isHydratingJobRef = useRef(false);
  async function handleJobCardSubmission(values: JobCardFormUnion) {
    setIsLoading(true);

    try {
      let customerId = values.consumer_id;

      // ✅ ONLY when full form
      if (isFullJobCard(values) && mode !== "view" && mode !== "edit") {

        const customerPayload = {
          ...(customerId ? { id: customerId } : {}),
          name: values.name,
          phone: values.phone,
          email: values.email,
          address: values.address,
          type: values.type,

          country_id: values.country_id,
          state_id: values.state_id,
          store_id: !isAdmin ? user?.store_id : values.store_id,

          ...(values.type === "company" && {
            company_country_id: values.company_country_id,
            company_state_id: values.company_state_id,
            company_contact_no: values.company_contact_no,
            company_gstin: values.company_gstin,
          }),
        };

        if (customerFound && customerId) {
          await consumerUpdate(customerPayload);
        } else {
          const res = await consumerSave(customerPayload);
          customerId = res.id;
        }
        if (!customerId) {
          throw new Error("Customer could not be resolved");
        }
      }

      // ✅ job card fields are COMMON → safe
      const jobCardPayload = {
        ...(id ? { id } : {}),
        store_id: !isAdmin ? user?.store_id : values.store_id,
        consumer_id: customerId,

        vehicle_type: values.vehicle_type,
        service_ids: values.service_ids.map(Number),
        vehicle_company_id: values.vehicle_company_id,
        vehicle_model_id: values.vehicle_model_id,
        color: values.color,
        year: values.year,
        reg_no: values.reg_no,
        chasis_no: values.chasis_no,
        vehicle_condition: values.vehicle_condition,
        jobcard_date: values.jobcard_date,
        remarks: values.remarks,

        isRepainted: values.isRepainted,
        isSingleStagePaint: values.isSingleStagePaint,
        isPaintThickness: values.isPaintThickness,
        isVehicleOlder: values.isVehicleOlder,
      };

      const jobRes = await jobFormSubmission(jobCardPayload);

      toast({
        title: !mode ? "Job Card Created" : "Job Card Updated",
        description: !mode ? "Job card created successfully" : "Job card updated successfully",
        variant: "success",
      });
      // ✅ Open invoice modal
      if (!mode) {
        setIsJobCardSubmissionModalOpenInfo({
          open: true,
          info: jobRes.id,
        });
      }
      else {
        navigate("/job-cards")
      }
    } catch (err: any) {
      const apiErrors = err?.response?.data?.errors;


      // 👇 THIS IS THE KEY PART
      if (apiErrors && err?.response?.status === 422) {
        Object.entries(apiErrors).forEach(([field, messages]) => {
          form.setError(field as any, {
            type: "server",
            message: (messages as string[])[0],
          });
        });
        return;
      }
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
  const customerMobile = form.watch("phone");
  const store_id = form.watch("store_id");
  useEffect(() => {
    setCustomerFound(null);
    form.setValue("consumer_id", undefined);
  }, [searchMobile]);
  const lookupToastShownRef = useRef(false);
  useEffect(() => {
    if (isAdmin) {
      const isAdminStoreMissing = isAdmin && !store_id;
      const hasMobile = searchMobile && searchMobile.length > 0;

      // 🔴 Case 1: Mobile typed but store not selected (admin)
      if (hasMobile && isAdminStoreMissing) {
        if (!lookupToastShownRef.current) {
          toast({
            title: "Select Store",
            description: "Please select a store before searching customer by mobile number.",
            variant: "destructive",
          });
          lookupToastShownRef.current = true;
        }
        return;
      }

      // 🔴 Case 2: Store selected but mobile missing
      if (store_id && !hasMobile) {
        if (!lookupToastShownRef.current) {
          toast({
            title: "Enter Mobile Number",
            description: "Please enter customer's mobile number to search.",
            variant: "destructive",
          });
          lookupToastShownRef.current = true;
        }
        return;
      }
    }

    // ✅ Reset toast guard when inputs are valid
    if (
      (!isAdmin || store_id) &&
      (!searchMobile || searchMobile.length === 10)
    ) {
      lookupToastShownRef.current = false;
    }
  }, [searchMobile, store_id, isAdmin, toast]);
  useEffect(() => {
    if (!searchMobile || searchMobile.length !== 10 || !(store_id || user?.store_id)) {
      setIsLookingUp(false);

      return;
    }

    let cancelled = false;

    const lookup = async () => {
      setIsLookingUp(true);
      setCustomerFound(null);

      try {
        const storeIdToUse = !isAdmin ? user?.store_id : store_id;

        const customer = await lookupCustomerByPhone(searchMobile, storeIdToUse);
        if (cancelled) return;

        if (!customer) {
          // 🔸 New customer
          setCustomerFound(false);
          form.setValue("consumer_id", "");
          form.setValue("phone", "");
          form.setValue("name", "");
          form.setValue("email", "");
          form.setValue("address", "");
          form.setValue("country_id", "101");
          form.setValue("state_id", "");
          form.setValue(
            "type",
            "individual"
          );

          form.setValue("company_gstin", "");
          form.setValue("company_contact_no", "");
          form.setValue("company_country_id", "101");
          form.setValue("company_state_id", "");

          form.setValue("consumer_id", undefined);

          // ⚠️ DO NOT touch user-typed fields
          return;
        }

        // 🔹 Existing customer
        setCustomerFound(true);
        form.setValue("consumer_id", String(customer.id));
        form.setValue("phone", customer.phone || searchMobile);
        form.setValue("name", customer.name || "");
        form.setValue("email", customer.email || "");
        form.setValue("address", customer.address || "");
        form.setValue("country_id", String(customer.country_id));
        form.setValue("state_id", String(customer.state_id));
        form.setValue(
          "type",
          customer.type === "company" ? "company" : "individual"
        );

        form.setValue("company_gstin", customer.company_gstin ?? "");
        form.setValue("company_contact_no", customer.company_contact_no ?? "");
        form.setValue("company_country_id", customer.company_country_id ? String(customer.company_country_id) : String(101));
        form.setValue("company_state_id", customer.company_state_id ? String(customer.company_state_id) : "");
        form.clearErrors([
          "name",
          "phone",
          "email",
          "address",
          "country_id",
          "state_id",
          "type",
          "company_gstin",
          "company_contact_no",
          "company_country_id",
          "company_state_id",
        ]);


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
  }, [searchMobile, store_id, user?.store_id]);

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

  return (
    <>
      <div className="max-w-7xl  mx-auto px-4 py-4 space-y-4">
        {/* HEADER */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              localStorage.removeItem('sidebar_active_parent')
              window.history.back()
            }}
            disabled={isLoading || isInfoLoading}
            className="text-muted-foreground hover:text-foreground "
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
              {
                isInfoLoading && id ?
                  <Card className="mb-6"><div className="min-h-[150px] flex justify-center items-center">
                    <div className="p-4 text-sm "><Loader /></div>
                  </div></Card> : <>
                    {(mode !== "view" && mode !== 'edit') && <>
                      <Card className="mb-6 p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                          {isAdmin && <div
                            className={cn(
                              "bg-white  rounded-xl p-0",
                            )} >
                            <h3 className={`text-sm font-semibold text-gray-700 mb-4`}>{"Store Information"}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                              <FloatingRHFSelect
                                name="store_id"
                                label="Select Store"
                                control={form.control}
                                isDisabled={isView}
                                isRequired
                                options={storeList.map((s: any) => ({
                                  label: s.label,
                                  value: String(s.value),
                                }))}
                              />
                            </div>
                          </div>}
                          <div
                            className={cn(
                              "bg-white  rounded-xl p-0",
                            )} >
                            <h3 className={`text-sm font-semibold text-gray-700 mb-4`}>{"Customer Lookup"}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-1 gap-1 items-end">
                              <FloatingField
                                name="search_mobile"
                                label="Search Mobile Number"
                                isDisabled={isView}
                                isRequired
                                control={form.control}
                              />

                              {(isLookingUp || customerFound !== null) && !isView && <div className="text-sm h-[38px] flex items-center">
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
                          </div>
                          {/* <SectionCard title="Customer Lookup" >
                  
                </SectionCard> */}
                        </div>
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
                              isDisabled={isView}
                              control={form.control}
                            />


                            <FloatingField
                              name="phone"
                              label="Mobile No"
                              isRequired
                              control={form.control}
                              isDisabled={customerFound === true || isView}
                            />

                            <FloatingField
                              name="email"
                              label="Email"
                              isDisabled={isView}
                              isRequired
                              control={form.control}
                            />



                          </div>
                          {/* ADDRESS + MESSAGE */}
                          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                            <FloatingTextarea
                              name="address"
                              label="Address"
                              isView={isView}
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
                                name="type"
                                label="Bill To"
                                control={form.control}
                                isRequired
                                isDisabled={isView}
                                options={[
                                  { label: "Company", value: "company" },
                                  { label: "Individual", value: "individual" },
                                ]}
                                onValueChange={(value) => {
                                  if (typeof value !== "string") return;
                                  const billingType = value as "company" | "individual";
                                  form.setValue("type", billingType);
                                }}
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                Select <b>Company</b> if you need GST invoice
                              </p>
                            </div>

                          </div>



                          {/* GST OPTIONAL */}

                          {
                            form.watch("type") === "company" &&
                            (
                              <div className="">
                                <h4 className="text-sm font-semibold mb-4">
                                  GST Information
                                </h4>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">


                                  <FloatingField
                                    name="company_contact_no"
                                    label="Company Contact No."
                                    isDisabled={isView}
                                    control={form.control}
                                  />

                                  <FloatingField
                                    name="company_gstin"
                                    label="GSTIN"
                                    control={form.control}
                                    isDisabled={isView}
                                  />

                                  <FloatingRHFSelect
                                    name="company_country_id"
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
                                      form.setValue("company_state_id", "");
                                      // form.setValue("gst_city_id", "");

                                      setLoadingGstState(true);
                                      const stateList = await fetchStateList(Number(value));
                                      setGstStates(stateList);
                                      setLoadingGstState(false);
                                    }}
                                  />
                                  <FloatingRHFSelect
                                    name="company_state_id"
                                    label="State"
                                    control={form.control}
                                    isDisabled={isView || !form.getValues("company_country_id")}
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
                      }</>}
                    <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">


                      {/* Vehicle Information */}
                      <Card>
                        <SectionCard title="Vehicle Information" className="pb-4">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <FloatingRHFSelect
                              name="vehicle_company_id"
                              label="Vehicle Make"
                              isDisabled={isView}
                              isRequired
                              control={form.control}
                              options={meta.vehicleCompanies}
                            />
                            <FloatingRHFSelect
                              name="vehicle_model_id"
                              label="Vehicle Model"
                              isRequired
                              control={form.control}
                              isDisabled={!meta.vehicleModels.length || isView}
                              options={meta.vehicleModels}
                            />

                            <FloatingField
                              name="color"
                              isDisabled={isView}
                              label="Vehicle Color"
                              isRequired
                              control={form.control}
                            />

                            <FloatingRHFSelect
                              name="year"
                              label="Make Year"
                              isDisabled={isView}
                              isRequired
                              control={form.control}
                              options={meta.years}
                            />

                            <FloatingField
                              isDisabled={isView}
                              name="reg_no"
                              label="Registration No"
                              isRequired
                              control={form.control}
                            />

                            <FloatingField
                              name="chasis_no"
                              isDisabled={isView}
                              label="Chassis No"
                              control={form.control}
                            />
                            <FloatingRHFSelect
                              name="vehicle_condition"
                              label="SRS Condition"
                              isRequired
                              isDisabled={isView}
                              control={form.control}
                              options={meta.srsCondition}
                            />

                          </div>
                          {/* PAINT CONDITION */}
                          <div className="mt-4">
                            <p className="mb-3 block text-sm font-medium text-[gray]">
                              Vehicle Paint Condition
                            </p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <FormField
                                control={form.control}
                                name="isRepainted"
                                render={({ field }) => (
                                  <label className={`flex items-center gap-2 text-sm ${isView ? '' : 'cursor-pointer'}  `}>
                                    <Checkbox
                                      disabled={isView}
                                      checked={field.value}
                                      onCheckedChange={(val) => field.onChange(Boolean(val))}
                                    />
                                    Repainted Vehicle
                                  </label>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="isSingleStagePaint"
                                render={({ field }) => (
                                  <label className={`flex items-center gap-2 text-sm ${isView ? '' : 'cursor-pointer'}  `}>
                                    <Checkbox
                                      disabled={isView}
                                      checked={field.value}
                                      onCheckedChange={(val) => field.onChange(Boolean(val))}
                                    />
                                    Single Stage Paint
                                  </label>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="isPaintThickness"
                                render={({ field }) => (
                                  <label className={`flex items-center gap-2 text-sm ${isView ? '' : 'cursor-pointer'}  `}>
                                    <Checkbox
                                      disabled={isView}
                                      checked={field.value}
                                      onCheckedChange={(val) => field.onChange(Boolean(val))}
                                    />
                                    Paint Thickness below 2 MIL
                                  </label>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="isVehicleOlder"
                                render={({ field }) => (
                                  <label className={`flex items-center gap-2 text-sm ${isView ? '' : 'cursor-pointer'}  `}>
                                    <Checkbox
                                      disabled={isView}
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
                              name="remarks"
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
                              isDisabled={isView}
                              label="Vehicle Type"
                              isRequired
                              control={form.control}
                              options={meta.vehicleTypes}
                            />
                            {/* Service Type */}
                            <FloatingRHFSelect
                              name="service_type"
                              label="Service Type"
                              isMulti
                              isDisabled={isView}
                              isRequired
                              control={form.control}
                              options={meta.serviceTypes}
                            />
                            {/* Service Date */}
                            <FloatingDateField
                              name="jobcard_date"
                              label="Service Date"
                              isRequired
                              isDisabled={isView}
                              control={form.control}
                            />

                            {/* Service Type (Multi) */}

                          </div>
                          <div className="mt-4">
                            <p className="mb-3 block text-sm font-medium text-[gray]">
                              Select Services <span className="text-red-500">*</span>
                            </p>
                            {loadingServices && (
                              <p className="text-sm text-muted-foreground text-center flex gap-2 items-center justify-center">
                                <Loader loaderSize={4} isShowLoadingText={false} />
                                Loading services…
                              </p>
                            )}
                            {!form.getValues("vehicle_type") &&
                              form.getValues("service_ids").length === 0 && (
                                <p className="text-sm text-muted-foreground text-center">
                                  Select a vehicle and service type to view available services
                                </p>
                              )}

                            {!loadingServices &&
                              services.length === 0 &&
                              form.getValues("vehicle_type") &&
                              form.getValues("service_ids").length > 0 && (
                                <p className="text-sm text-muted-foreground text-center">
                                  No services found for the selected vehicle and service type
                                </p>
                              )}
                            {!loadingServices && services.length > 0 && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {services.map(service => {
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
                                            disabled={isView}
                                            onCheckedChange={() => toggleService(service.id)}
                                            onClick={(e) => e.stopPropagation()} // 🔴 IMPORTANT
                                          />

                                          <div>
                                            <p className="font-medium leading-tight">
                                              {service.label}
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

                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                );
                              })}
                            </div>}

                            {/* Validation error */}
                            <FormMessage className="pt-1 text-[0.75rem]">
                              {form.formState.errors.service_ids?.message}
                            </FormMessage>
                          </div>

                        </SectionCard>
                      </Card>
                    </div>
                  </>}
              {mode !== 'view' &&
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
                      onClick={form.handleSubmit(handleJobCardSubmission,)}
                      className="bg-[#FE0000] hover:bg-[rgb(238,6,6)]">
                      {isLoading && <Loader color="#fff" isShowLoadingText={false} />}
                      {isLoading
                        ? id ? "Updating..." : "Adding..."
                        : id ? "Update " : "Add "}
                    </Button>
                  )}

                </div>}
            </form>
          </Form>
        </div>
        <CommonDeleteModal
          width="420px"
          maxWidth="420px"
          showCloseIcon={false}
          isOpen={isJobCardSubmissionDeleteModalInfo.open}
          title="Job Card Created"
          description="Would you like to proceed with invoice creation for this job card?"
          confirmText="Yes, create invoice"
          cancelText="No"
          shouldNotCancelOnOverlayClick={true}
          onCancel={() => navigate("/job-cards")}
          onConfirm={() => {
            localStorage.removeItem('sidebar_active_parent')
            navigate(`/invoices/manage?jobCardId=${isJobCardSubmissionDeleteModalInfo.info}&mode=create`)
          }}
        />
      </div>
    </>
  );
}