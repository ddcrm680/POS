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
import { type Customer, type Vehicle, JobServiceOption, JobCard, JobCardFormValues, option, ServiceCard, CustomerFormValues } from "@/lib/types";
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
import { consumerSave, consumerUpdate, fetchCityList, fetchStateList, fetchStoreCrispList, getCustomerView, getServiceOptionByTypeVehicle, jobCardMetaInfo, jobCardModelInfo, jobFormSubmission, lookupCustomerByPhone } from "@/lib/api";
import { NewCustomerSchema, NewJobCardSchema } from "@/lib/schema";
import { useAuth } from "@/lib/auth";
import CommonDeleteModal from "@/components/common/CommonDeleteModal";


export default function CustomerForm() {
  const [step, setStep] = useState(1);
  const [, navigate] = useLocation();

  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const mode = searchParams.get("mode");
  const isView = mode === "view";

  const [isInfoLoading, setIsInfoLoading] = useState(false);

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);


  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(NewCustomerSchema),
    defaultValues: {
      consumer_id: undefined,
      type: "individual",
      name: "",
      company_contact_no: "",
      company_gstin: "",
      phone: "",
      email: "",
      country_id: "India",
      store_id: "",
      state_id: "",
      address: "",
    },
  });

  const { toast } = useToast();
  const { countries } = useAuth();

  const [customerFound, setCustomerFound] = useState<boolean | null>(null);
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
        const countryId = findIdByName(countryList, initialValues.country.id);

        if (!countryId) return;

        form.setValue("country_id", String(countryId));

        // 2️⃣ STATES
        setLoadingState(true);
        const stateList = await fetchStateList(countryId);
        setStates(stateList);
        setLoadingState(false);

        const stateId = findIdByName(stateList, initialValues.state.id);

        if (!stateId) return;

        form.setValue("state_id", String(stateId));


      } finally {
        // ✅ hydration completed
        isHydratingRef.current = false;
      }
    };

    hydrateLocation();
  }, [mode, initialValues, countryList]);

  const fetchCustomerFormInfo = async () => {
    try {
      setIsInfoLoading(true);
      const res =
        await getCustomerView(id ?? "");
      setInitialValues(res?.data)
    } catch (e) {
      console.error(e);

    } finally {
      setIsInfoLoading(false);
    }
  };
  useEffect(() => {
    if (id) {
      fetchCustomerFormInfo();

    }
  }, [id]);
  useEffect(() => {
    console.log(initialValues, 'initialValues');

  })
  useEffect(() => {
    if (mode !== "create" || !countryList.length) return;

    const india = countryList.find(c => c.name === "India");
    if (!india) return;

    form.setValue("country_id", String(india.id));
  }, [mode, countryList]);
  const onSubmit = (data: CustomerFormValues) => {
  };
 
  useEffect(() => {
    if (!initialValues) return;

    form.reset({
      // 🔑 IMPORTANT: backend sends `id`, not `consumer_id`
      consumer_id: String(initialValues.id),

      name: initialValues.name ?? "",
      phone: initialValues.phone ?? "",
      email: initialValues.email ?? "",
      address: initialValues.address ?? "",

      type: initialValues.type ?? "individual",

      country_id: initialValues.country_id
        ? String(initialValues.country_id)
        : "",

      state_id: initialValues.state_id
        ? String(initialValues.state_id)
        : "",

      store_id: initialValues.store_id
        ? String(initialValues.store_id)
        : "",

      // ✅ GST / COMPANY FIELDS
      company_country_id: initialValues.company_country_id
        ? String(initialValues.company_country_id)
        : "",

      company_state_id: initialValues.company_state_id
        ? String(initialValues.company_state_id)
        : "",

      company_contact_no: initialValues.company_contact_no ?? "",
      company_gstin: initialValues.company_gstin ?? "",
    });
  }, [initialValues, form]);

  const isAdmin =
    user?.role === "admin" || user?.role === "super-admin";

  useEffect(() => {

    if ((mode == "create" || !mode) &&
      countryList.length) {
      const hydrateLocation = async () => {
        // 1️⃣ COUNTRY
        isGstHydratingRef.current = true;
        try {
          const countryId = findIdByName(countryList, initialValues?.company_country?.id || '101');

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
        const countryId = findIdByName(countryList, initialValues.company_country?.id);
        if (!countryId) return;

        form.setValue("company_country_id", String(countryId));

        setLoadingGstState(true);
        const stateList = await fetchStateList(countryId);
        setGstStates(stateList);
        setLoadingGstState(false);

        const stateId = findIdByName(stateList, initialValues.company_state?.id);
        if (!stateId) return;

        form.setValue("company_state_id", String(stateId));

        // form.setValue("gst_city_id", String(cityId));
      } finally {
        isGstHydratingRef.current = false;
      }
    };

    hydrateGstLocation();
  }, [initialValues, countryList]);

  async function handleJobCardSubmission(values: CustomerFormValues) {
    setIsLoading(true);

    try {
      let customerId = values.consumer_id;

      // 🔹 STEP 1: HANDLE CUSTOMER
      const customerPayload = {
        ...(customerId ? { id: customerId } : {}),
        name: values.name,
        phone: values.phone,
        email: values.email,
        address: values.address,
        type: values.type,

        country_id: values.country_id,
        ...(values.type === "company" && {
          company_country_id: values.company_country_id,
          company_state_id: values.company_state_id,
          company_contact_no: values.company_contact_no,
          company_gstin: values.company_gstin,
        }),
        state_id: values.state_id,
        store_id: !isAdmin ? user?.store_id : values.store_id,
      }

      await consumerUpdate(customerPayload);

      toast({
        title: "Customer updated",
        description: "Customer updated successfully",
        variant: "success",
      });

      navigate("/customers")
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
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-semibold">
              {isView ? "View Customer" : id ? "Edit Customer" : "Create New Customer"}
            </h1>

          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 rounded-xl ">



          {/* Main Job Creation Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="">

              {/* Customer Lookup Section */}
              {<Card className="mb-6">

                <SectionCard className="pb-4 grid gap-4" headingMarginBottom={"mb-0"}>
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
                      isDisabled={isView}
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
                        label="Billing Type"
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
                            control={form.control}
                            isDisabled={isView}
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
              }


              {mode !== 'view' && <div className="  pb-4 flex justify-end gap-3 mt-4">
                <Button
                  variant="outline"
                  disabled={isLoading || isInfoLoading}
                  className={'hover:bg-[#E3EDF6] hover:text-[#000]'}
                  onClick={() => navigate("/customers")}
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

      </div>
    </>
  );
}