"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import building from '@/lib/images/building.webp'
import { zodResolver } from "@hookform/resolvers/zod";
import * as Dialog from "@radix-ui/react-dialog";
import { IconButton } from "@chakra-ui/react";

import { Form } from "@/components/ui/form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Box } from "@chakra-ui/react";
import { Constant } from "@/lib/constant";
import { warrantyType } from "@/lib/mockData";
import { organizationFormProp, organizationFormType, serviceFormProp, serviceFormType, userFormProp, UserFormType } from "@/lib/types";
import { organizationSchema, servicePlanSchema, userSchema } from "@/lib/schema";
import RHFSelect from "@/components/RHFSelect";
import { Textarea } from "@/components/ui/textarea";
import { unknown } from "zod";
import { useAuth } from "@/lib/auth";
import { fetchCityList, fetchStateList } from "@/lib/api";
import { Pencil, Trash2, X } from "lucide-react";
import { findIdByName } from "@/lib/utils";
import { RequiredMark } from "@/components/common/RequiredMark";

export default function OrganizationForm({
  mode,
  id,
  onClose,
  initialValues,
  isLoading = false,
  onSubmit,
}: organizationFormProp) {
  const { countries, user } = useAuth();
  const [existingOrgImage, setExistingOrgImage] = useState<string | null>(null);

  const form = useForm<organizationFormType>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      company_name: "",
      email: "",
      org_address: "",

      bank_name: "",
      company_name_in_bank: "",
      account_no: "",
      account_type: "",
      ifsc_code: "",
      branch_name: "",
      bank_address: "",

      company_gstin: "",
      company_pan_no: "",
      aadhar_no: "",

      invoice_prefix: "",
      service_prefix: "",

      country: "India",
      state: "",
      city: "",
      district: "",
      pin_code: "",

      org_image: "",
    },
    shouldUnregister: false,
  });
  
  useEffect(() => {
    if ((mode === "edit" || mode === "view") && initialValues?.org_image) {
      setExistingOrgImage(typeof initialValues.org_image === 'string' ? initialValues.org_image : "");
    }

  }, [mode, initialValues]);
  useEffect(() => {

  })
  const selectedCountry = form.watch("country");
  const selectedState = form.watch("state");
  const [states, setStates] = useState([])
  const [cities, setCities] = useState([])
  const [countryList, setCountryList] = useState<{ id: number; name: string; slug: string; }[]>([])
  const [loadingState, setLoadingState] = useState(false)
  const [loadingCity, setLoadingCity] = useState(false)
  const isHydratingRef = useRef(false);
  useEffect(() => {
    setCountryList(countries)
  }, [countries])
  useEffect(() => {
    if (mode == "create" &&
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
  const inputRef = useRef<HTMLInputElement | null>(null);
  const orgImageError = form.formState.errors.org_image;

  useEffect(() => {
    if (mode === "edit" || mode === "view") {

      form.reset({
        company_name: initialValues?.company_name ?? "",
        email: initialValues?.email ?? "",
        org_address: initialValues?.org_address ?? "",

        bank_name: initialValues?.bank_name ?? "",
        company_name_in_bank: initialValues?.company_name_in_bank ?? "",
        account_no: initialValues?.account_no ?? "",
        account_type: initialValues?.account_type ?? "",
        ifsc_code: initialValues?.ifsc_code ?? "",
        branch_name: initialValues?.branch_name ?? "",
        bank_address: initialValues?.bank_address ?? "",

        company_gstin: initialValues?.company_gstin ?? "",
        company_pan_no: initialValues?.company_pan_no ?? "",
        aadhar_no: initialValues?.aadhar_no ?? "",

        invoice_prefix: initialValues?.invoice_prefix ?? "",
        service_prefix: initialValues?.service_prefix ?? "",

        country: initialValues?.country ?? "",
        state: initialValues?.state ?? "",
        city: initialValues?.city ?? "",
        district: initialValues?.district ?? "",
        pin_code: initialValues?.pin_code ?? "",

        org_image: initialValues?.org_image ?? "",
      });
      setPreviewUrl(typeof initialValues?.org_image == 'string' ? initialValues.org_image : "");
    }
  }, [mode, initialValues, form]);

  const [previewUrl, setPreviewUrl] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      // if user exists and has avatar url (your API returns avatar path)
      return (initialValues as any)?.org_image || null;
    } catch { return null; }
  });

  const isView = mode === "view";
  const isCreate = mode === "create";
  return (
    <Form {...form}>
      <form
        id={id}
        onSubmit={form.handleSubmit((values) =>
          onSubmit(values, form.setError)
        )}
        className="space-y-3"
      >
        <div className="p-3 space-y-3 max-h-[60vh] overflow-y-auto">

          {/* ================= ROW 1 ================= */}
          <section className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="flex md:w-[25%] flex-col items-center gap-3 self-center">

              {/* <Box w={'30%'}> */}

              <FormField
                control={form.control}
                name="org_image"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-3 justify-center  flex-col">

                      {/* AVATAR WRAPPER */}
                      <div className="relative">
                        {/* CLICKABLE AVATAR */}
                        <div
                          role="button"
                          tabIndex={0}
                          aria-label="organization-logo"
                          onClick={() => !isView && inputRef.current?.click()}
                          onKeyDown={(e) => {
                            if ((e.key === "Enter" || e.key === " ") && !isView) {
                              e.preventDefault();
                              inputRef.current?.click();
                            }
                          }}
                          className={`w-20 h-20 rounded-full overflow-hidden bg-muted 
              flex items-center justify-center
              ${isView ? "cursor-not-allowed" : "cursor-pointer"}
              border-2
              ${orgImageError ? "border-destructive" : "hover:border-gray-300"}
              focus-visible:ring-2 focus-visible:ring-primary`}
                        >
                          {previewUrl ? (
                            <img
                              src={
                                previewUrl.startsWith("blob:")
                                  ? previewUrl
                                  : `${Constant.REACT_APP_BASE_URL}/${previewUrl}`
                              }
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <img
                              src={building}
                              alt="logo preview"
                              className="w-full h-full object-cover scale-125"
                            />
                          )}
                        </div>

                        {/* ✏️ EDIT ICON */}
                        {!isView && (
                          <button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            className="absolute -bottom-1 -right-1 bg-white border rounded-full p-1 shadow hover:bg-gray-100"
                            aria-label="Change image"
                          >
                            <Pencil size={12} />
                          </button>
                        )}

                      </div>

                      {/* HIDDEN FILE INPUT */}
                      {!isView && (
                        <input
                          ref={inputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            field.onChange(file); // RHF + Zod
                            const objectUrl = URL.createObjectURL(file);
                            setPreviewUrl(objectUrl);
                          }}
                        />
                      )}

                      {/* HINT / ERROR TEXT */}
                      {!orgImageError && (
                        <p className={`text-muted-foreground text-[12px] w-[150px] text-center ${orgImageError && 'text-destructive'}`} style={{ textAlign: 'center' }}>
                          Allowed: JPG, JPEG, PNG, WEBP. Max 1 MB
                          <RequiredMark show={!isView} />
                        </p>
                      )}

                    </div>

                    {/* ZOD ERROR */}
                    <FormMessage className="text-center !mt-6 !mr-4" />
                  </FormItem>
                )}
              />

              {/* </Box> */}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
              {/* <Box w="40%"> */}
              <FormField
                control={form.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: "#000" }}>Company Name<RequiredMark show={!isView} /></FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter company name" disabled={isView} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* </Box> */}

              {/* <Box w="40%"> */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: "#000" }}>Email<RequiredMark show={!isView} /></FormLabel>
                    <FormControl>
                      <Input type="email" {...field} placeholder={Constant.master.orgnaization.emailPlaceholder} disabled={isView} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="invoice_prefix"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: "#000" }}>Invoice Prefix<RequiredMark show={!isView} /></FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={Constant.master.orgnaization.invoicePrefixPlaceholder} disabled={isView} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="service_prefix"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: "#000" }}>Service Prefix<RequiredMark show={!isView} /></FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={Constant.master.orgnaization.servicePrefixPlaceholder} disabled={isView} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* </Box> */}
            </div>


          </section>
          <section>
             <h3 className="text-sm font-semibold mb-4 text-gray-700">
              Banking Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="company_name_in_bank"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: "#000" }}>Company Name in Bank<RequiredMark show={!isView} /></FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={Constant.master.orgnaization.companyNameInBank} disabled={isView} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bank_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: "#000" }}>Bank Name<RequiredMark show={!isView} /></FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={Constant.master.orgnaization.bankNamePlaceholder} disabled={isView} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="account_no"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: "#000" }}>Account No.<RequiredMark show={!isView} /></FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={Constant.master.orgnaization.accountNoPlaceholder} disabled={isView} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="account_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: "#000" }}>Account Type</FormLabel>
                    <FormControl>

                      <Input {...field} placeholder={Constant.master.orgnaization.accountTypePlaceholder} disabled={isView} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ifsc_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: "#000" }}>IFSC Code<RequiredMark show={!isView} /></FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={Constant.master.orgnaization.ifscCodePlaceholder} disabled={isView} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="branch_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: "#000" }}>Branch Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={Constant.master.orgnaization.branchNamePlaceholder} disabled={isView} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bank_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: "#000" }}>Bank Address<RequiredMark show={!isView} /></FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={Constant.master.orgnaization.bankAddressPlaceholder} disabled={isView} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </section>
          <section>
             <h3 className="text-sm font-semibold mb-4 text-gray-700">
              Tax Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="company_gstin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: "#000" }}>Company GSTIN<RequiredMark show={!isView} /></FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={Constant.master.orgnaization.companyGSTIN} disabled={isView} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="company_pan_no"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: "#000" }}>Company PAN No.<RequiredMark show={!isView} /></FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={Constant.master.orgnaization.companyPANPlaceholder} disabled={isView} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="aadhar_no"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: "#000" }}>Aadhaar Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={Constant.master.orgnaization.aadharPlaceholder} disabled={isView} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </section>
          <section>
             <h3 className="text-sm font-semibold mb-4 text-gray-700">
              Address
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: "#000" }}>Country<RequiredMark show={!isView} /></FormLabel>

                    <FormControl>
                      <RHFSelect
                        field={{
                          ...field,
                          onChange: async (value: string) => {
                            field.onChange(value); // RHF update

                            // USER action only → safe to reset
                            setStates([]);
                            setCities([]);
                            form.setValue("state", "");
                            form.setValue("city", "");

                            setLoadingState(true);
                            const stateList = await fetchStateList(Number(value));
                            setStates(stateList);
                            setLoadingState(false);
                          },
                        }}
                        creatable={false}

                        options={countryList.map(p => ({
                          value: String(p.id),
                          label: p.name,
                        }))}
                        placeholder={Constant.master.orgnaization.countryPlaceholder}
                        isDisabled={isView}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: "#000" }}>
                      State<RequiredMark show={!isView} />
                    </FormLabel>

                    <FormControl>
                      <RHFSelect
                        field={{
                          ...field,
                          onChange: async (value: string) => {
                            field.onChange(value);

                            // reset city on USER state change
                            setCities([]);
                            form.setValue("city", "");

                            setLoadingCity(true);
                            const cityList = await fetchCityList(Number(value));
                            setCities(cityList);
                            setLoadingCity(false);
                          },
                        }}
                        creatable={false}
                        options={states.map((s: any) => ({
                          value: String(s.id),
                          label: s.name,
                        }))}
                        placeholder={
                          loadingState
                            ? "Loading states..."
                            : "Select state"
                        }
                        isDisabled={
                          isView || !selectedCountry
                        }
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: "#000" }}>
                      City<RequiredMark show={!isView} />
                    </FormLabel>

                    <FormControl>
                      <RHFSelect
                        field={field}
                        creatable={false}
                        options={cities.map((c: any) => ({
                          value: String(c.id),
                          label: c.name,
                        }))}
                        placeholder={
                          loadingCity
                            ? "Loading cities..."
                            : "Select city"
                        }
                        isDisabled={
                          isView || !selectedState
                        }
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: "#000" }}>District<RequiredMark show={!isView} /></FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={Constant.master.orgnaization.districtPlaceholder} disabled={isView} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pin_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: "#000" }}>Pincode<RequiredMark show={!isView} /></FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={Constant.master.orgnaization.pincodePlaceholder} disabled={isView} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            </div>
            <div className="grid grid-cols-1 mt-[1rem] md:grid-cols-1 gap-4">

              <FormField
                control={form.control}
                name="org_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: "#000" }}>Company Address<RequiredMark show={!isView} /></FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder={Constant.master.orgnaization.companyAddressPlaceholder} disabled={isView} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </section>

          {/* ================= ADDRESS ================= */}

        </div>

        {/* ================= ACTIONS ================= */}
        {mode !== 'view' && <div className="">
          <div className="flex justify-end gap-3 pb-4 pr-4  border-t pt-[24px]">
            <Button
              variant="outline"
              disabled={isLoading}
              className={'hover:bg-[#E3EDF6] hover:text-[#000]'}
              onClick={onClose}
            >
              {'Cancel'}
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-[#FE0000] hover:bg-[rgb(238,6,6)]"
            >
              {isLoading && <svg
                className="h-6 w-6 animate-spin text-[#fff]"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>}
              {isLoading
                ? mode === "create" ? "Adding..." : "Updating..."
                : mode === "create"
                  ? "Add "
                  : "Update "}
            </Button>
          </div></div>}
      </form>
    </Form>
  );
}
