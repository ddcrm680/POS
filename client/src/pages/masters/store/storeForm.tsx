"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useSearchParams } from "wouter";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import { StoreSchema } from "@/lib/schema";
import { storeFormProp, storeFormType } from "@/lib/types";
import { countryOptions, stateOptions, cityOptions } from "@/lib/mockData";
import { RequiredMark } from "@/components/common/RequiredMark";
import { Field } from "@chakra-ui/react";
import { FloatingField } from "@/components/common/FloatingField";
import { FloatingTextarea } from "@/components/common/FloatingTextarea";
import { FloatingRHFSelect } from "@/components/common/FloatingRHFSelect";
import { SectionCard } from "@/components/common/card";
import { Loader } from "@/components/common/loader";
import { useAuth } from "@/lib/auth";
import { fetchCityList, fetchStateList } from "@/lib/api";
import { findIdByName } from "@/lib/utils";
import { ArrowLeft, ArrowLeftIcon, ChevronLeft } from "lucide-react";

/* -------------------- CARD -------------------- */


export default function StoreForm({
  initialValues,
  isLoading = false,
  onSubmit,
}: storeFormProp) {
  const [searchParams] = useSearchParams();
  const [, navigate] = useLocation();

  const id = searchParams.get("id");
  const mode = searchParams.get("mode");
  const isView = mode === "view";

  const form = useForm<storeFormType>({
    resolver: zodResolver(StoreSchema),
    defaultValues: {
      store_name: "",
      email: "",
      phone: "",
      location_name: "",
      address: "",
      notes: "",
      gstin: "",
      pan_no: "",
      invoice_prefix: "",
      country: "India",
      state: "",
      city: "",
      pincode: "",
      opening_date: "",
      registration_file: "",
      cancelled_cheque: "",
      agreement_file: "",
    },
  });

  const [filePreview, setFilePreview] = useState<Record<string, string | null>>(
    {}
  );
  const { countries } = useAuth();

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

  /* -------------------- HYDRATE -------------------- */
  useEffect(() => {
    if (mode === "edit" || mode === "view") {

      form.reset({
        store_name: initialValues?.store_name ?? "",
        email: initialValues?.email ?? "",
        phone: initialValues?.phone ?? "",
        location_name: initialValues?.location_name ?? "",
        address: initialValues?.address ?? "",
        notes: initialValues?.notes ?? "",
        gstin: initialValues?.gstin ?? "",
        pan_no: initialValues?.pan_no ?? "",
        invoice_prefix: initialValues?.invoice_prefix ?? "",
        country: initialValues?.country ?? "India",
        state: initialValues?.state ?? "",
        city: initialValues?.city ?? "",
        opening_date: initialValues?.opening_date ?? "",
        pincode: initialValues?.pincode ?? "",
        registration_file: initialValues?.registration_file ?? "",
        cancelled_cheque: initialValues?.cancelled_cheque ?? "",
        agreement_file: initialValues?.agreement_file ?? "",
      });
    }
  }, [mode, initialValues, form]);
  /* -------------------- FILE HANDLER -------------------- */
  const handleFile = (key: keyof storeFormType, file: File | null) => {
    if (!file) return;
    form.setValue(key, file);
    if (file.type.startsWith("image/")) {
      setFilePreview((p) => ({
        ...p,
        [key]: URL.createObjectURL(file),
      }));
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((v) => onSubmit(v, form.setError))}
        className="min-h-screen bg-gray-100 p-4 md:p-10"
      >
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg">

          {/* HEADER */}
          <div className="border-b px-6 py-4 flex items-center gap-3">
            {/* Back Button */}
            <button
            type="button"
            disabled={isLoading}
              onClick={() => window.history.back()}
              className="
      flex items-center gap-1 justify-start -ml-2
      text-sm font-medium
      text-muted-black
      hover:text-foreground
      transition
    "
            >
              <ChevronLeft size={20} />
            </button>

            {/* Title */}
            <h1 className="text-xl font-semibold">
              {isView ? "View Store" : id ? "Edit Store" : "Create New Store"}
            </h1>
          </div>

          <div className=" pb-4">

            {/* STORE INFO */}
            <SectionCard title="Store Information">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* "store_name", "email", "phone" */}
                {[{ label: "Store Name", fieldName: "store_name", isRequired: true },
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

            {/* LOCATION */}
            <SectionCard title="Location & Operations">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FloatingField
                  isView={isView}
                  isRequired={true}
                  name={'location_name'}
                  label={'Location Name'}
                  control={form.control}
                />
                <FloatingField
                  isView={isView}
                  isRequired={true}
                  name={'pincode'}
                  label={'Pincode'}
                  control={form.control}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* OPENING DATE */}

                  <FloatingField
                    name="opening_date"
                    label="Opening Date"
                    type="date"
                    isRequired
                    isView={isView}
                    control={form.control}
                  />

                  {/* COUNTRY */}
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
                      if (isHydratingRef.current) return

                      setStates([])
                      setCities([])
                      form.setValue("state", "")
                      form.setValue("city", "")

                      setLoadingState(true)
                      const stateList = await fetchStateList(Number(value))
                      setStates(stateList)
                      setLoadingState(false)
                    }}
                  />





                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* STATE */}
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
                      if (isHydratingRef.current) return

                      setCities([])
                      form.setValue("city", "")

                      setLoadingCity(true)
                      const cityList = await fetchCityList(Number(value))
                      setCities(cityList)
                      setLoadingCity(false)
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
                <div className="md:col-span-2">
                  <FloatingTextarea
                    name="address"
                    label="Address"
                    isView={isView}
                    isRequired
                    control={form.control}
                  />

                </div>
              </div>
            </SectionCard>

            {/* BILLING */}
            <SectionCard title="Billing & Tax">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[{ label: "Invoice prefix", fieldName: "invoice_prefix" },
                { label: "GSTIN", fieldName: "gstin" },
                { label: "PAN number", fieldName: "pan_no" }
                ].map((item) => (
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

            {/* DOCUMENTS */}
            <SectionCard title="Documents">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  "registration_file",
                  "cancelled_cheque",
                  "agreement_file",
                ].map((key) => (
                  <FormField
                    key={key}
                    name={key as any}
                    control={form.control}
                    render={() => (
                      <FormItem>
                        <p className="text-sm font-medium capitalize">
                          {key.replace("_", " ")}
                        </p>

                        <div className="h-32 rounded-lg border bg-gray-50 flex items-center justify-center overflow-hidden">
                          {filePreview[key] ? (
                            <img
                              src={filePreview[key]!}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xs text-gray-400">
                              No preview
                            </span>
                          )}
                        </div>

                        {!isView && (
                          <Input
                            type="file"
                            onChange={(e) =>
                              handleFile(
                                key as any,
                                e.target.files?.[0] ?? null
                              )
                            }
                          />
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </SectionCard>

            {/* NOTES */}
            <SectionCard title="Additional Notes">
              <FloatingTextarea
                name="notes"
                label="Notes"
                isView={isView}
                control={form.control}
              />

            </SectionCard>
          </div>
          {mode !== 'view' && <div className="">
            <div className="border-t px-6 py-4 flex justify-end gap-3">
              <Button
                variant="outline"
                disabled={isLoading}
                className={'hover:bg-[#E3EDF6] hover:text-[#000]'}
                onClick={() => navigate("/master")}
              >
                {'Cancel'}
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-[#FE0000] hover:bg-[rgb(238,6,6)]"
              >
                {isLoading && <Loader />}
                {isLoading
                  ? mode === "create" ? "Adding..." : "Updating..."
                  : id ? "Update " : "Add "}
              </Button>
            </div></div>}

        </div>
      </form>
    </Form>
  );
}
