"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, UseFormSetError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useSearchParams } from "wouter";

import {
  Form,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { StoreSchema } from "@/lib/schema";
import { storeFormApi, storeFormType } from "@/lib/types";
import { FloatingField } from "@/components/common/FloatingField";
import { FloatingTextarea } from "@/components/common/FloatingTextarea";
import { FloatingRHFSelect } from "@/components/common/FloatingRHFSelect";
import { SectionCard } from "@/components/common/card";
import { Loader } from "@/components/common/loader";
import { useAuth } from "@/lib/auth";
import {
  baseUrl,
  EditStore,
  fetchCityList,
  fetchStateList,
  fetchStoreById,
  fetchTerritoryOrganizationList,
  SaveStore,
} from "@/lib/api";
import { findIdByName, isPdfFile } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { storeFormKeys } from "@/lib/constant";

export default function StoreForm() {
  const [searchParams] = useSearchParams();
  const [, navigate] = useLocation();

  const id = searchParams.get("id");
  const mode = searchParams.get("mode");
  const isView = mode === "view";

  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<storeFormType>({
    resolver: zodResolver(StoreSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      organization_id: "",
      territory_id: "",
      registered_address: "",
      shipping_address: "",
      notes: "",
      gst_no: "",
      pan_no: "",
      invoice_prefix: "",
      country: "India",
      state: "",
      city: "",
      pincode: "",
      opening_date: "",
      pan_card_file: "",
      registration_file: "",
      gstin_file: "",
    },
  });
  const [isInfoLoading, setIsInfoLoading] = useState(false);
  const { toast } = useToast();
  const { control, handleSubmit, watch, setValue } = form;
  const [initialValues, setInitialValues] = useState<storeFormApi | null>(null)
  const [filePreview, setFilePreview] = useState<
    Record<
      string,
      {
        url: string;
        file?: File;
      } | null
    >
  >({});

  const { countries } = useAuth();
  const fetchStoreInfo = async () => {
    try {
      setIsInfoLoading(true);
      const res =
        await fetchStoreById(id ?? "");

      const updatedInfo = { ...res?.data, territory_id: res?.data?.territory?.id ?? "" }
      setInitialValues(updatedInfo)
    } catch (e) {
      console.error(e);

    } finally {
      setIsInfoLoading(false);
    }
  };
  useEffect(() => {
    if (id) {
      fetchStoreInfo();

    }
  }, [id]);
  const [countryList, setCountryList] = useState<
    { id: number; name: string; slug?: string }[]
  >([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);

  const [loadingState, setLoadingState] = useState(false);
  const [loadingCity, setLoadingCity] = useState(false);

  const isHydratingRef = useRef(false);
  useEffect(() => {

    setCountryList(countries)
  }, [countries])
  useEffect(() => {

    if ((mode == "create" || !mode) &&
      countryList.length) {
      const hydrateLocation = async () => {
        // 1️⃣ COUNTRY
        isHydratingRef.current = true;
        try {
          const countryId = findIdByName(countryList, '101');

          if (!countryId) return;

          form.setValue("country", String(countryId));

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

        form.setValue("country", String(countryId));

        // 2️⃣ STATES
        setLoadingState(true);
        const stateList = await fetchStateList(countryId);
        setStates(stateList);
        setLoadingState(false);

        const stateId = findIdByName(stateList, initialValues.state);

        if (!stateId) return;

        form.setValue("state", String(stateId));

        // 3️⃣ CITIES
        setLoadingCity(true);
        const cityList = await fetchCityList(stateId);
        setCities(cityList);
        setLoadingCity(false);

        const cityId = findIdByName(cityList, initialValues.city);
        if (!cityId) return;

        form.setValue("city", String(cityId));

        // ORGANIZATION
        if (initialValues.organization_id) {
          form.setValue("organization_id", String(initialValues.organization_id));
        }

        // TERRITORY
        if (initialValues.territory_id) {
          form.setValue("territory_id", String(initialValues.territory_id));
        }
      } finally {
        // ✅ hydration completed
        isHydratingRef.current = false;
      }
    };

    hydrateLocation();
  }, [mode, initialValues, countryList]);
  useEffect(() => {
    if (mode !== "create" || !countryList.length) return;

    const india = countryList.find(c => c.name === "India");
    if (!india) return;

    form.setValue("country", String(india.id));
  }, [mode, countryList]);

  const [organizationTerritoryList, setOrganizationTerritoryList] = useState<any>({
    territories: [],
    organizations: []
  });
  const fetchOrganizationsTerritory = async () => {
    try {
      const res = await fetchTerritoryOrganizationList();

      setOrganizationTerritoryList({
        territories: res.territories.map((t: any) => {
          const isAssigned = t.store_id !== null;
          const isSelected = String(t.id) === String(selectedTerritoryId);

          return {
            value: String(t.id),
            label: isAssigned && !isSelected
              ? `${t.name} (Assigned)`
              : t.name,
            isDisabled: isAssigned && !isSelected,
          };
        }),
        organizations: res.organizations,
      });
    } catch (e) {
      console.error(e);
    }
  };
  const selectedTerritoryId = form.watch("territory_id");

  useEffect(() => {
    fetchOrganizationsTerritory();
  }, [selectedTerritoryId]);


  /* -------------------- HYDRATE -------------------- */
  useEffect(() => {
    if (!initialValues) return;

    const previews: Record<string, string> = {};

    (["pan_card_file", "registration_file", "gstin_file"] as const).forEach(key => {
      const val = initialValues[key];
      if (typeof val === "string" && val) {
        setFilePreview(prev => ({
          ...prev,
          [key]: {
            url: `${baseUrl}/${val}`,
          },
        }));
      }
    });

    if (mode === "edit" || mode === "view") {

      form.reset({
        name: initialValues?.name ?? "",
        email: initialValues?.email ?? "",
        organization_id: initialValues?.organization_id ?? "",
        phone: initialValues?.phone ?? "",
        territory_id: initialValues?.territory_id.toString() ?? "",
        registered_address: initialValues?.registered_address ?? "",

        shipping_address: initialValues?.shipping_address ?? "",
        notes: initialValues?.notes ?? "",
        gst_no: initialValues?.gst_no ?? "",
        pan_no: initialValues?.pan_no ?? "",
        invoice_prefix: initialValues?.invoice_prefix ?? "",

        country: initialValues?.country.toString() ?? "",
        state: initialValues?.state ?? "",
        city: initialValues?.city ?? "",
        opening_date: initialValues?.opening_date
          ? new Date(initialValues.opening_date)
            .toISOString()
            .slice(0, 10)
          : "",
        // city: initialValues?.city ?? "",
        pincode: initialValues?.pincode ?? "",
        pan_card_file: initialValues?.pan_card_file ?? "",
        registration_file: initialValues?.registration_file ?? "",
        gstin_file: initialValues?.gstin_file ?? "",
      });
    }
  }, [mode, initialValues, form]);
  /* -------------------- FILE HANDLER -------------------- */
  const handleFile = (key: keyof storeFormType, file: File | null) => {
    if (!file) return;

    form.setValue(key, file, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });

    const url = URL.createObjectURL(file);

    setFilePreview(prev => ({
      ...prev,
      [key]: {
        url,
        file,
      },
    }));
  };
  const onSubmit = (values: storeFormType) => {
    StoreCommonHandler(values, form.setError)
  };
  const buildOrganizationFormData = (
    value: storeFormType, id?: string | null,) => {
    const formData = new FormData();

    if (id) {
      formData.append("id", String(id));
    }

    formData.append("name", value.name);
    formData.append("organization_id", value.organization_id);
    formData.append("email", value.email);
    formData.append("gst_no", value.gst_no);
    formData.append("pan_no", value.pan_no);
    formData.append("invoice_prefix", value.invoice_prefix);
    formData.append("country", (value.country) ?? "");
    formData.append("state", value.state);
    formData.append("pincode", value.pincode);
    formData.append("registered_address", value.registered_address);
    formData.append("shipping_address", value.shipping_address ?? "");
    formData.append("territory_id", value.territory_id);
    formData.append("phone", value.phone ?? "");
    formData.append("opening_date", value.opening_date);
    formData.append("city", value.city.toString());
    formData.append("notes", value.notes ?? "");
    if (value.gstin_file instanceof File) {
      formData.append("gstin_file", value.gstin_file);
    }

    if (value.pan_card_file instanceof File) {
      formData.append("pan_card_file", value.pan_card_file);
    }

    if (value.registration_file instanceof File) {
      formData.append("registration_file", value.registration_file);
    }


    return formData;
  };
  const StoreCommonHandler = async (
    value: storeFormType,
    setError: UseFormSetError<storeFormType>
  ) => {
    try {

      setIsLoading(true);

      if (mode === "edit") {
        const formData = buildOrganizationFormData(
          value,
          id
        );
        await EditStore(formData);

        toast({
          title: "Edit Store",
          description: "Store updated successfully",
          variant: "success",
        });
      } else {
        const formData = buildOrganizationFormData(value);

        await SaveStore(formData);

        toast({
          title: "Add Store",
          description: "Store added successfully",
          variant: "success",
        });
      }
      navigate("/master")
    } catch (err: any) {
      const apiErrors = err?.response?.data?.errors;


      // 👇 THIS IS THE KEY PART
      if (apiErrors && err?.response?.status === 422) {
        Object.entries(apiErrors).forEach(([field, messages]) => {
          setError(field as keyof storeFormType, {
            type: "server",
            message: (messages as string[])[0],
          });
        });
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
  };

  return (
    <div className="mx-auto px-3 py-3 space-y-3">
      {/* HEADER */}
      <div className="inline-flex items-center gap-4">
        <button
          onClick={() => {
            sessionStorage.removeItem('sidebar_active_parent')
            window.history.back()
          }}

          disabled={isLoading || isInfoLoading}
          className="text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft size={18} />
        </button>
        <h1 className="text-lg font-semibold">
          {isView ? "View Store" : id ? "Edit Store" : "Create New Store"}
        </h1>
      </div>

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          {
            isInfoLoading && id ? <div className="min-h-[150px] flex justify-center items-center">
              <div className="p-3 text-sm "><Loader /></div>
            </div> :
              <div>
                {/* STORE INFO */}
                <Card className="mb-4 pb-4">
                  <SectionCard title="Store Information">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* "name", "email", "phone" */}
                      {[{ label: "Store Name", fieldName: "name", isRequired: true },
                      { label: "Email", fieldName: "email", isRequired: true },
                      { label: "Phone", fieldName: "phone", isRequired: false }
                      ].map((item) => (
                        <FloatingField
                          isView={isView}
                          isRequired={item.isRequired}
                          name={item.fieldName}
                          label={item.label}
                          control={form.control}
                        />
                      ))}
                    </div>
                  </SectionCard>
                </Card>

                {/* LOCATION */}
                <Card className="mb-4 pb-4">
                  <SectionCard title="Location & Operations">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <FloatingRHFSelect
                        name="organization_id"
                        label="Organization"
                        control={form.control}
                        isRequired
                        isDisabled={isView}
                        options={organizationTerritoryList.organizations.map((o: any) => ({
                          value: String(o.id),
                          label: o.org_name,
                        }))}
                      />
                      <FloatingRHFSelect
                        name="territory_id"
                        label="Location"
                        control={form.control}
                        isRequired
                        isDisabled={isView}
                        options={organizationTerritoryList.territories}
                      />
                      <FloatingField
                        name="opening_date"
                        label="Opening Date"
                        type="date"
                        control={form.control}
                        isRequired
                        isView={isView}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <FloatingField
                        name="pincode"
                        label="Pincode"
                        control={form.control}
                        isRequired
                        isView={isView}
                      />
                      <FloatingRHFSelect
                        name="country"
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
                          form.setValue("state", "");
                          form.setValue("city", "");

                          setLoadingState(true);
                          const stateList = await fetchStateList(Number(value));
                          setStates(stateList);
                          setLoadingState(false);
                        }}
                      />

                      <FloatingRHFSelect
                        name="state"
                        label="State"
                        control={form.control}
                        isRequired
                        isDisabled={isView || !form.getValues("country")}
                        options={states.map(s => ({
                          value: String(s.id),
                          label: s.name,
                        }))}
                        onValueChange={async (value) => {
                          if (isHydratingRef.current) return;

                          setCities([]);
                          form.setValue("city", "");

                          setLoadingCity(true);
                          const cityList = await fetchCityList(Number(value));
                          setCities(cityList);
                          setLoadingCity(false);
                        }}
                      />
                      <FloatingRHFSelect
                        name="city"
                        label="City"
                        control={form.control}
                        isRequired
                        isDisabled={isView || !form.getValues("state")}
                        options={cities.map(c => ({
                          value: String(c.id),
                          label: c.name,
                        }))}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <FloatingTextarea
                        name="registered_address"
                        label="Permanent Address"
                        control={form.control}
                        isRequired
                        isView={isView}
                      />

                      <FloatingTextarea
                        name="shipping_address"
                        label="Shipping Address"
                        control={form.control}
                        isRequired
                        isView={isView}
                      />
                    </div>
                  </SectionCard>
                </Card>

                {/* BILLING */}
                <Card className="mb-4 pb-4">
                  <SectionCard title="Billing & Tax">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {storeFormKeys.billingTaxFieldList.map(item => (
                        <FloatingField
                          isView={isView}
                          isRequired={true}
                          name={item.fieldName}
                          label={item.label}
                          control={form.control}
                        />
                      ))}
                    </div>
                  </SectionCard>
                </Card>

                {/* DOCUMENTS */}
                <Card className="mb-4 pb-4">
                  <SectionCard title="Documents">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {storeFormKeys.file.map((item) => {
                        const preview = filePreview[item.key];

                        return (
                          <FormField
                            key={item.key}
                            name={item.key as any}
                            control={form.control}
                            render={({ fieldState }) => {

                              const hasError = !!fieldState.error;
                              return (
                                <FormItem>
                                  <p className="text-sm font-medium capitalize">
                                    {item.label}
                                  </p>

                                  <div className="relative h-32 rounded-lg border bg-gray-50 overflow-hidden group">

                                    {/* PREVIEW */}
                                    {preview ? (
                                      isPdfFile(preview.file, preview.url) ? (
                                        <div className="absolute inset-0  overflow-hidden">
                                          <iframe
                                            src={preview.url}
                                            className="w-[120%] h-[120%] "
                                            scrolling="no"
                                          />
                                        </div>
                                      ) : (
                                        <img
                                          src={preview.url}
                                          className="w-full h-full object-contain pointer-events-none"
                                        />
                                      )
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <span className="text-xs text-gray-400">No preview</span>
                                      </div>
                                    )}

                                  </div>



                                  {!isView && (
                                    <Input
                                      className={hasError ? "border-red-500 focus-visible:ring-red-500" : ""}

                                      type="file"
                                      onChange={(e) =>
                                        handleFile(
                                          item.key as any,
                                          e.target.files?.[0] ?? null
                                        )
                                      }
                                    />
                                  )}
                                  <FormMessage />
                                </FormItem>
                              )
                            }}
                          />
                        )
                      })}
                    </div>
                  </SectionCard>
                </Card>

                {/* NOTES */}
                <Card className="mb-4 pb-4">
                  <SectionCard title="Additional Notes">
                    <FloatingTextarea
                      name="notes"
                      label="Notes"
                      isView={isView}
                      control={form.control}
                    />
                  </SectionCard>
                </Card>
              </div>
          }

          {/* ACTIONS */}
          {mode !== 'view' && <div className="">
            <div className="  flex justify-end gap-3">
              <Button
                variant="outline"
                disabled={isLoading || isInfoLoading}
                className={'hover:bg-[#E3EDF6] hover:text-[#000] h-8 text-xs'}
                onClick={() => navigate("/master")}
              >
                {'Cancel'}
              </Button>
              <Button
                type="submit"
                disabled={isLoading || isInfoLoading}
                className="bg-[#FE0000] hover:bg-[rgb(238,6,6)] h-8 text-xs"
              >
                {isLoading && <Loader isShowLoadingText={false} color="#fff" />}
                {isLoading
                  ? id ? "Updating..." : "Adding..."
                  : id ? "Update " : "Add "}
              </Button>
            </div></div>}

        </form>
      </Form>
    </div>
  );
}
