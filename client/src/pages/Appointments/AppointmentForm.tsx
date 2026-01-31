"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FloatingField } from "@/components/common/FloatingField";
import { FloatingTextarea } from "@/components/common/FloatingTextarea";
import { FloatingRHFSelect } from "@/components/common/FloatingRHFSelect";
import { SectionCard } from "@/components/common/card";
import { AppointmentSchema } from "@/lib/schema";
import { AppointmentFormValues, JobCardFormUnion, option, ServiceCard } from "@/lib/types";
import { Check, ChevronLeft } from "lucide-react";
import { useLocation, useSearchParams } from "wouter";
import { useState, useEffect, useRef } from "react";
import { Loader } from "@/components/common/loader";
import { appointmentFilterMeta } from "@/lib/constant";
import { useAuth } from "@/lib/auth";
import { appointmentSave, appointmentUpdate, fetchStoreCrispList, getServiceOptionByTypeVehicle, jobCardMetaInfo, jobCardModelInfo } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function AppointmentForm() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [searchParams] = useSearchParams();

  const id = searchParams.get("id");
  const mode = searchParams.get("mode");
  const isView = mode === "view";

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [services, setServices] = useState<ServiceCard[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(AppointmentSchema),
    defaultValues: {
      role: user?.role,
      store_id: "",
      consumer_mobile: "",

      vehicle_company_id: "",
      vehicle_model_id: "",
      vehicle_type: "",
      color: "",
      year: "",
      reg_no: "",
      service_type: [],
      service_ids: [],

      appointment_type: "service",
      scheduled_at: "",
      scheduled_end_at: "",

      priority: "normal",
      source: "walk_in",
      notes: "",
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isInfoLoading, setIsInfoLoading] = useState(false);
  const startTime = form.watch("scheduled_at");
  const endTime = form.watch("scheduled_end_at");

  const nowIso = () => {
    const d = new Date();
    d.setSeconds(0, 0);
    return d.toISOString().slice(0, 16); // yyyy-MM-ddTHH:mm
  };
  /** set role automatically */
  useEffect(() => {
    if (user?.role) {
      form.setValue("role", user.role);
    }
  }, [user, form]);


  const toggleService = (serviceId: string) => {
    const newSelection = selectedServices.includes(serviceId)
      ? selectedServices.filter(id => Number(id) !== Number(serviceId))
      : [...selectedServices, serviceId];

    setSelectedServices(newSelection);
    form.setValue("service_ids", newSelection, {
      shouldValidate: true,
    });
  };
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

  const [meta, setMeta] = useState({
    vehicleCompanies: [] as option[],
    vehicleModels: [] as option[],

    vehicleTypes: [] as option[],
    serviceTypes: [] as option[],
    years: [] as option[],
    srsCondition: [] as option[],

    loadingModels: false,
  });
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

  const isHydratingRef = useRef(false);
  useEffect(() => {

    setCountryList(countries)
  }, [countries])

  const [initialValues, setInitialValues] = useState<any | null>(null)


  // useEffect(() => {

  //   if (!initialValues || !countryList.length) return;
  //   if (mode !== "edit" && mode !== "view") return;

  //   const hydrate = async () => {
  //     /* ===== STORE ===== */
  //     if (isAdmin) {
  //       form.setValue("store_id", String(initialValues.job_card.store_id));
  //     }
  //     form.setValue("consumer_id", String(initialValues.job_card.consumer_id));
  //     /* ===== JOB CARD ===== */
  //     form.setValue(
  //       "jobcard_date",
  //       initialValues.job_card.jobcard_date
  //         ? new Date(initialValues.job_card.jobcard_date)
  //           .toISOString()
  //           .split("T")[0]
  //         : ""
  //     );


  //     form.setValue("vehicle_type", initialValues.job_card.vehicle_type);
  //     hasInitializedModelsRef.current = true;
  //     form.setValue("vehicle_company_id", String(initialValues.job_card.vehicle_company_id));
  //     form.setValue("color", initialValues.job_card.color ?? "");
  //     form.setValue("year", String(initialValues.job_card.year ?? ""));
  //     form.setValue("reg_no", initialValues.job_card.reg_no ?? "");
  //     form.setValue("chasis_no", initialValues.job_card.chasis_no ?? "");
  //     form.setValue("vehicle_condition", initialValues.job_card.vehicle_condition ?? "");
  //     form.setValue("remarks", initialValues.job_card.remarks ?? "");

  //     /* ===== CHECKBOXES ===== */
  //     form.setValue("isRepainted", Boolean(initialValues.job_card.isRepainted));
  //     form.setValue("isSingleStagePaint", Boolean(initialValues.job_card.isSingleStagePaint));
  //     form.setValue("isPaintThickness", Boolean(initialValues.job_card.isPaintThickness));
  //     form.setValue("isVehicleOlder", Boolean(initialValues.job_card.isVehicleOlder));

  //     /* ===== SERVICES ===== */
  //     const serviceTypeValues = (initialValues.opted_services || []).map(
  //       (item: any) => String(item.category_type)
  //     );

  //     const serviceIds = (initialValues.job_card.service_ids || []).map(String);


  //     isHydratingJobRef.current = true;

  //     form.setValue("service_type", serviceTypeValues);
  //     form.setValue("service_ids", serviceIds);
  //     setSelectedServices(serviceIds);

  //     isHydratingJobRef.current = false;

  //     /* ===== VEHICLE MODELS ===== */
  //     const models = await jobCardModelInfo(
  //       String(initialValues.job_card.vehicle_company_id)
  //     );


  //     setMeta(prev => ({
  //       ...prev,
  //       vehicleModels: toSelectOptions(models),
  //     }));

  //     form.setValue(
  //       "vehicle_model_id",
  //       String(initialValues.job_card.vehicle_model_id)
  //     );
  //   };

  //   hydrate();
  // }, [initialValues, countryList, mode]);


  const onSubmit = (data: AppointmentFormValues) => {
  };


  const isAdmin =
    user?.role === "admin" || user?.role === "super-admin";


  const isHydratingJobRef = useRef(false);
  async function handleAppointmentSubmission(values: AppointmentFormValues) {
    setIsLoading(true);

    try {
      console.log(values, 'valuesvalues');

      const { role, ...rest } = values

      if (mode === "edit") {
        await appointmentUpdate(rest);
      } else {
        await appointmentSave(rest);
      }


      toast({
        title: !mode ? "Appointment Created" : "Appointment Updated",
        description: !mode ? "Appointment created successfully" : "Appointment updated successfully",
        variant: "success",
      });
      // ✅ Open invoice modal
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
    <div className="mx-auto px-3 py-3 space-y-3">
      {/* HEADER */}
      <div className="inline-flex items-center gap-4">
        <button
          onClick={() => window.history.back()}
          disabled={isLoading || isInfoLoading}
          className="text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft size={18} />
        </button>

        <h1 className="text-lg font-semibold">
          {isView
            ? "View Appointment"
            : id
              ? "Edit Appointment"
              : "Create New Appointment"}
        </h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {isInfoLoading && id ? (
            <div className="min-h-[150px] flex justify-center items-center">
              <Loader />
            </div>
          ) : (
            <>
              {/* BASIC DETAILS */}
              <Card className="mb-4 pb-4">
                <SectionCard title="Appointment Details">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {isAdmin && <FloatingRHFSelect
                      name="store_id"
                      label="Select Store"
                      control={form.control}
                      isDisabled={isView}
                      isRequired
                      options={storeList.map((s: any) => ({
                        label: s.label,
                        value: String(s.value),
                      }))}
                    />}
                    <FloatingField
                      name="consumer_mobile"
                      label="Customer Mobile"
                      isRequired
                      isView={isView}
                      control={form.control}
                    />

                    <FloatingRHFSelect
                      name="appointment_type"
                      label="Type"
                      isRequired
                      isDisabled={isView}
                      control={form.control}
                      options={appointmentFilterMeta.type}
                    />

                    <FloatingRHFSelect
                      name="priority"
                      label="Priority"
                      isRequired
                      isDisabled={isView}
                      control={form.control}
                      options={appointmentFilterMeta.priority}
                    />
                  </div>
                </SectionCard>
              </Card>

              {/* VEHICLE INFO */}
              <Card className="mb-4 pb-4">
                <SectionCard title="Vehicle Information">

                  {/* MAKE & MODEL */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
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
                      label="Vehicle Color"
                      isRequired
                      isDisabled={isView}
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
                  </div>

                  {/* VEHICLE DETAILS */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">


                    <FloatingField
                      name="reg_no"
                      label="Registration No"
                      isRequired
                      isDisabled={isView}
                      control={form.control}
                    />
                    <FloatingRHFSelect
                      name="vehicle_type"
                      label="Vehicle Type"
                      isDisabled={isView}
                      isRequired
                      control={form.control}
                      options={meta.vehicleTypes}
                    />
                    <FloatingRHFSelect
                      name="service_type"
                      label="Service Type"
                      isMulti
                      isRequired
                      isDisabled={isView}
                      control={form.control}
                      options={meta.serviceTypes}
                    />
                  </div>

                  {/* DIVIDER */}
                  <div className="border-t pt-4 mt-2">
                    <p className="mb-3 text-sm font-medium text-gray-600">
                      Select Services <span className="text-red-500">*</span>
                    </p>

                    {/* LOADING */}
                    {loadingServices && (
                      <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                        <Loader loaderSize={4} isShowLoadingText={false} />
                        Loading services…
                      </div>
                    )}

                    {/* EMPTY STATES */}
                    {!loadingServices &&
                      !form.getValues("vehicle_type") &&
                      form.getValues("service_ids").length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Select a vehicle and service type to see available services
                        </p>
                      )}

                    {!loadingServices &&
                      services.length === 0 &&
                      form.getValues("vehicle_type") && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No services available for the selected configuration
                        </p>
                      )}

                    {/* SERVICES GRID */}
                    {!loadingServices && services.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {services.map(service => {
                          const isSelected = selectedServices.includes(service.id);

                          return (
                            <Card
                              key={service.id}
                              onClick={() => !isView && toggleService(service.id)}
                              className={cn(
                                "cursor-pointer transition-all border rounded-lg",
                                isSelected
                                  ? "border-primary bg-primary/5 shadow-sm"
                                  : "hover:border-muted-foreground/30"
                              )}
                            >
                              <CardContent className="p-3">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-start gap-2">
                                    <div
                                      className={cn(
                                        "mt-0.5 h-4 w-4 rounded border flex items-center justify-center",
                                        isSelected
                                          ? "bg-primary border-primary text-white"
                                          : "border-muted-foreground"
                                      )}
                                    >
                                      {isSelected && <Check className="h-3 w-3" />}
                                    </div>

                                    <div>
                                      <p className="font-semibold text-xs leading-tight">
                                        {service.label}
                                      </p>
                                      <p className="text-[10px] text-muted-foreground mt-1">
                                        {service.description}
                                      </p>
                                    </div>
                                  </div>

                                  <p className="font-semibold text-xs text-green-600 whitespace-nowrap">
                                    ₹{service.price}
                                  </p>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    )}

                    {/* VALIDATION ERROR */}
                    <FormMessage className="pt-2 text-xs">
                      {form.formState.errors.service_ids?.message}
                    </FormMessage>
                  </div>
                </SectionCard>
              </Card>

              <Card className="mb-4 pb-4">
                <SectionCard title="Schedule & Source">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* START TIME */}
                    <FloatingField
                      name="scheduled_at"
                      label="Start Time"
                      type="datetime-local"
                      isRequired
                      isView={isView}
                      control={form.control}
                      min={nowIso()}
                      onChange={(e) => {
                        const value = e.target.value;
                        form.setValue("scheduled_at", value, { shouldValidate: true });

                        // clear invalid end time
                        if (endTime && value && endTime < value) {
                          form.setValue("scheduled_end_at", "");
                        }
                      }}
                    />

                    {/* END TIME */}
                    <FloatingField
                      name="scheduled_end_at"
                      label="End Time"
                      type="datetime-local"
                      isRequired
                      isView={isView}
                      isDisabled={!startTime}   // ✅ works now
                      control={form.control}
                      min={startTime || nowIso()}
                    />

                    {/* SOURCE */}
                    <FloatingRHFSelect
                      name="source"
                      label="Appointment Source"
                      isRequired
                      isDisabled={isView}
                      control={form.control}
                      options={[
                        { label: "Walk In", value: "walk_in" },
                        { label: "Phone", value: "phone" },
                        { label: "WhatsApp", value: "whatsapp" },
                        { label: "Website", value: "website" },
                        { label: "Referral", value: "referral" },
                      ]}
                    />
                  </div>
                </SectionCard>
              </Card>




              {/* NOTES */}
              <Card className="mb-4 pb-4">
                <SectionCard title="Notes">
                  <FloatingTextarea
                    name="notes"
                    label="Notes"
                    isRequired
                    isView={isView}
                    control={form.control}
                  />
                </SectionCard>
              </Card>
            </>
          )}

          {/* ACTIONS */}
          {mode !== 'view' &&
            <div className="  pb-3 flex justify-end gap-4 mt-3">
              <Button
                variant="outline"
                disabled={isLoading || isInfoLoading}
                className={'hover:bg-[#E3EDF6] hover:text-[#000] h-8 text-xs'}
                onClick={() => navigate("/new-appointments")}
              >
                {'Cancel'}
              </Button>

              {(
                <Button type="button"
                  disabled={isLoading || isInfoLoading}
                  onClick={form.handleSubmit(handleAppointmentSubmission)}
                  className="bg-[#FE0000] hover:bg-[rgb(238,6,6)] h-8 text-xs">
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
  );
}
