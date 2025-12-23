"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
import { cityOptions, countryOptions, stateOptions, warrantyType } from "@/lib/mockData";
import { organizationFormProp, organizationFormType, serviceFormProp, serviceFormType, storeFormProp, storeFormType, userFormProp, UserFormType } from "@/lib/types";
import { organizationSchema, servicePlanSchema, StoreSchema, userSchema } from "@/lib/schema";
import RHFSelect from "@/components/RHFSelect";
import { Textarea } from "@/components/ui/textarea";
import { unknown } from "zod";
import { useLocation, useSearchParams } from "wouter";
export const RequiredMark = ({ show }: { show: boolean }) =>
  show ? <span className="text-red-500 ml-1">*</span> : null;

export default function StoreForm({
  onClose,
  initialValues,
  isLoading = false,
  onSubmit,
}: storeFormProp) {
  console.log(initialValues, 'initialValues');
  const [searchParams] = useSearchParams();
const [, navigate] = useLocation();

  const id = searchParams.get("id");      // "101"
  const mode = searchParams.get("mode");  // "view"
  const form = useForm<storeFormType>({
    resolver: zodResolver(StoreSchema),
    defaultValues: {
      store_name: "",
      email: "",
      address: "",
      phone: "",
      location_name: "",
      notes: "",

      gstin: "",
      pan_no: "",

      invoice_prefix: "",

      country: "India",
      state: "",
      city: "",
      pincode: "",

      registration_file: "",

      cancelled_cheque: "",

      agreement_file: "",
    },
    shouldUnregister: false,
  });

  useEffect(() => {
    if (mode === "edit" || mode === "view") {
      console.log(initialValues, 'initialValues');

      form.reset({
        store_name: initialValues?.store_name ?? "",
        email: initialValues?.email ?? "",
        address: initialValues?.address ?? "",

        notes: initialValues?.notes ?? "",
        phone: initialValues?.phone,
        location_name: initialValues?.location_name,
        gstin: initialValues?.gstin ?? "",
        pan_no: initialValues?.pan_no ?? "",

        invoice_prefix: initialValues?.invoice_prefix ?? "",

        country: initialValues?.country ?? "India",
        state: initialValues?.state ?? "",
        city: initialValues?.city ?? "",
        pincode: initialValues?.pincode ?? "",
        registration_file: initialValues?.registration_file ?? "",

        cancelled_cheque: initialValues?.cancelled_cheque ?? "",

        agreement_file: initialValues?.agreement_file ?? "",
      });
    }
  }, [mode, initialValues, form]);

  const isView = mode === "view";
  console.log(isView,mode,'isViewisViewisView');
  
  const isCreate = mode === "create";
  return (
    <Form {...form}>
      <form
        id={id ?? ""}
        onSubmit={form.handleSubmit((values) =>
          onSubmit(values, form.setError)
        )}
        className="space-y-6 h-full"
      >
        <div className="h-screen flex flex-col bg-white">

          <div className="sticky top-0 z-20 bg-white border-b">
            <h3 className="text-sm  my-6  px-6 text-lg font-semibold text-gray-800 text-[16px] uppercase tracking-wide">
              {isView ? "View" : id ? "Edit" : "Add"} Store {isView && "Details" } :
            </h3>
          </div>
          <div className="pb-6 space-y-6  ">

            {/* ================= STORE INFO ================= */}
            <h3 className="text-sm py-[0.5rem] bg-[#FFD3D385] px-6 font-semibold text-gray-800 uppercase tracking-wide">
              Store Information
            </h3>

            <Box className="flex gap-3 px-6">
              <Box w="33%">
                <FormField
                  control={form.control}
                  name="store_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel style={{ color: "#000" }}>Store Name<RequiredMark show={!isView} /></FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter Store name" disabled={isView} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Box>

              <Box w="33%">
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
              </Box>
              <Box w="33%">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel style={{ color: "#000" }}>Phone<RequiredMark show={!isView} /></FormLabel>
                      <FormControl>
                        <Input type="phone" {...field} placeholder={Constant.master.store.phonePlaceholder} disabled={isView} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Box>
            </Box>
            <h3 className="text-sm py-[0.5rem] bg-[#FFD3D385] px-6 font-semibold text-gray-800 uppercase tracking-wide">
              Location & Operational Details
            </h3>
            {/* ================= ADDRESS && OPENING INFO ================= */}

            <Box className="flex gap-3 px-6">
              <Box w="50%">
                <FormField
                  control={form.control}
                  name="location_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel style={{ color: "#000" }}>Location name<RequiredMark show={!isView} /></FormLabel>
                      <FormControl>
                        <Input type="location_name" {...field} placeholder={Constant.master.store.locationNamePlaceholder} disabled={isView} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Box>
              <Box w="50%">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel style={{ color: "#000" }}> Address<RequiredMark show={!isView} /></FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={Constant.master.store.addressPlaceholder} disabled={isView} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                /></Box>



            </Box>
            <Box className="flex gap-3 px-6">
              <Box w="33%">
                <FormField
                  control={form.control}
                  name="opening_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel style={{ color: "#000" }}>
                        Opening Date<RequiredMark show={!isView} />
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          disabled={isView}
                          max={new Date().toISOString().split("T")[0]} // prevents future date
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Box>
              <Box w="33%">
                <FormField
                  control={form.control}
                  name="pincode"
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
              </Box>

              <Box w="33%">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel style={{ color: "#000" }}>Country<RequiredMark show={!isView} /></FormLabel>

                      <FormControl>
                        <RHFSelect
                          field={field}
                          creatable={false}
                          options={countryOptions.map(p => ({
                            value: String(p.value),
                            label: p.label,
                          }))}
                          placeholder={Constant.master.orgnaization.countryPlaceholder}
                          isDisabled={isView}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              </Box>


              <Box w="33%">
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel style={{ color: "#000" }}>State<RequiredMark show={!isView} /></FormLabel>

                      <FormControl>
                        <RHFSelect
                          field={field}
                          creatable={false}
                          options={stateOptions.map(p => ({
                            value: String(p.value),
                            label: p.label,
                          }))}
                          placeholder={Constant.master.orgnaization.statePlaceholder}
                          isDisabled={isView}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Box>

              <Box w="33%">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel style={{ color: "#000" }}>City<RequiredMark show={!isView} /></FormLabel>

                      <FormControl>
                        <RHFSelect
                          field={field}
                          creatable={false}
                          options={cityOptions.map(p => ({
                            value: String(p.value),
                            label: p.label,
                          }))}
                          placeholder={Constant.master.orgnaization.cityPlaceholder}
                          isDisabled={isView}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Box>
            </Box>
            <h3 className="text-sm py-[0.5rem] bg-[#FFD3D385] px-6 font-semibold text-gray-800 uppercase tracking-wide">
              Billing & Invoicing
            </h3>

            <Box className="flex gap-3 px-6">
              <Box w="33%">
                <FormField
                  control={form.control}
                  name="invoice_prefix"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Invoice Prefix<RequiredMark show={!isView} />
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={Constant.master.orgnaization.invoicePrefixPlaceholder}
                          disabled={isView}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Box>
            </Box>
            <h3 className="text-sm py-[0.5rem] bg-[#FFD3D385] px-6 font-semibold text-gray-800 uppercase tracking-wide">
              Tax Information
            </h3>
            <Box className="flex gap-3 px-6">

              <Box w="50%">
                <FormField
                  control={form.control}
                  name="gstin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel style={{ color: "#000" }}> GSTIN<RequiredMark show={!isView} /></FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={Constant.master.store.GSTIN} disabled={isView} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Box>

              <Box w="50%">
                <FormField
                  control={form.control}
                  name="pan_no"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel style={{ color: "#000" }}>PAN No.<RequiredMark show={!isView} /></FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={Constant.master.store.PANPlaceholder} disabled={isView} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Box>

            </Box>
            <h3 className="text-sm py-[0.5rem] bg-[#FFD3D385] px-6 font-semibold text-gray-800 uppercase tracking-wide">
              Store Documents
            </h3>
            {/* =================  FILE ================= */}
            <Box className="flex gap-3 px-6">
              <Box w="50%">
                <FormField
                  control={form.control}
                  name="registration_file"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel style={{ color: "#000" }}>Upload registration file <RequiredMark show={!isView} /></FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/*"
                          disabled={isView}
                          placeholder={Constant.master.orgnaization.documentPlaceholder}
                          onChange={(e) =>
                            field.onChange(e.target.files?.[0] ?? null)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Box>
              <Box w="50%">
                <FormField
                  control={form.control}
                  name="cancelled_cheque"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel style={{ color: "#000" }}>Upload cancelled check <RequiredMark show={!isView} /></FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/*"
                          disabled={isView}
                          placeholder={Constant.master.orgnaization.documentPlaceholder}
                          onChange={(e) =>
                            field.onChange(e.target.files?.[0] ?? null)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Box>
              <Box w="50%">
                <FormField
                  control={form.control}
                  name="agreement_file"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel style={{ color: "#000" }}>Upload agreement file <RequiredMark show={!isView} /></FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/*"
                          disabled={isView}
                          placeholder={Constant.master.orgnaization.documentPlaceholder}
                          onChange={(e) =>
                            field.onChange(e.target.files?.[0] ?? null)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Box>
            </Box>
            <h3 className="text-sm py-[0.5rem] bg-[#FFD3D385] px-6 font-semibold text-gray-800 uppercase tracking-wide">
              Additional Notes
            </h3>
            {/* =================  NOTES ================= */}
            <Box className="flex gap-3 px-6">
              <Box w="100%">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel style={{ color: "#000" }}>Notes<RequiredMark show={!isView} /></FormLabel>
                      <FormControl>

                        <Textarea {...field} placeholder={Constant.master.store.notesPlaceholder} disabled={isView} />

                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Box>
            </Box>
          </div>
          
          {/* ================= ACTIONS ================= */}
          <div className="sticky bottom-0 z-20 bg-white border-t">
            {mode !== 'view' && <div className="">
              <div className="flex justify-end gap-3 pb-6 pr-6  border-t pt-[24px]">
                <Button
                  variant="outline"
                  type="button"
                  disabled={isLoading}
                  className={'hover:bg-[#E3EDF6] hover:text-[#000]'}
                  onClick={()=>{
                     navigate(`/master`)
                  }}
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
                    ? mode === "edit" ?  "Updating..." :"Adding..." 
                    : mode === "edit"
                      ?  "Update "
                      :"Add "}
                </Button>
              </div></div>}
          </div>
        </div>
      </form>
    </Form>
  );
}
