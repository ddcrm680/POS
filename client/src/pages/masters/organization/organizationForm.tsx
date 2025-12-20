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
import { warrantyType } from "@/lib/mockData";
import { organizationFormProp, organizationFormType, serviceFormProp, serviceFormType, userFormProp, UserFormType } from "@/lib/types";
import { organizationSchema, servicePlanSchema, userSchema } from "@/lib/schema";
import RHFSelect from "@/components/RHFSelect";
import { Textarea } from "@/components/ui/textarea";
import { unknown } from "zod";
export const RequiredMark = ({ show }: { show: boolean }) =>
  show ? <span className="text-red-500 ml-1">*</span> : null;

export default function OrganizationForm({
  mode,
  id,
  organizationMetaInfo,
  onClose,
  initialValues,
  isLoading = false,
  onSubmit,
}: organizationFormProp) {
  console.log(initialValues, 'initialValues');
  const form = useForm<organizationFormType>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      company_name: "",
      email: "",
      company_address: "",

      bank_name: "",
      company_name_in_bank: "",
      account_no: "",
      account_type: "",
      ifsc_code: "",
      branch_name: "",
      bank_address: "",

      gstin: "",
      pan_no: "",
      aadhar_no: "",

      invoice_prefix: "",
      service_prefix: "",

      country: "India",
      state: "",
      city: "",
      district: "",
      pincode: "",

      document: "",
    },
    shouldUnregister: false,
  });

  useEffect(() => {
    if (mode === "edit" || mode === "view") {
      console.log(initialValues, 'initialValues');

      form.reset({
        company_name: initialValues?.company_name ?? "",
        email: initialValues?.email ?? "",
        company_address: initialValues?.company_address ?? "",

        bank_name: initialValues?.bank_name ?? "",
        company_name_in_bank: initialValues?.company_name_in_bank ?? "",
        account_no: initialValues?.account_no ?? "",
        account_type: initialValues?.account_type ?? "",
        ifsc_code: initialValues?.ifsc_code ?? "",
        branch_name: initialValues?.branch_name ?? "",
        bank_address: initialValues?.bank_address ?? "",

        gstin: initialValues?.gstin ?? "",
        pan_no: initialValues?.pan_no ?? "",
        aadhar_no: initialValues?.aadhar_no ?? "",

        invoice_prefix: initialValues?.invoice_prefix ?? "",
        service_prefix: initialValues?.service_prefix ?? "",

        country: initialValues?.country ?? "India",
        state: initialValues?.state ?? "",
        city: initialValues?.city ?? "",
        district: initialValues?.district ?? "",
        pincode: initialValues?.pincode ?? "",

        document: initialValues?.document ?? "",
      });
    }
  }, [mode, initialValues, form]);

  const isView = mode === "view";
  const isCreate = mode === "create";
  return (
    <Form {...form}>
      <form
        id={id}
        onSubmit={form.handleSubmit((values) =>
          onSubmit(values, form.setError)
        )}
        className="space-y-6"
      >
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">

          {/* ================= ROW 1 ================= */}
          <Box className="flex gap-3">
            <Box w="33%">
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
            </Box>

            <Box w="33%">
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
          </Box>

          {/* ================= ROW 2 ================= */}
          <Box className="flex gap-3">
            <Box w="33%">
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
            </Box>

            <Box w="33%">
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
            </Box>

            <Box w="33%">
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
            </Box>
          </Box>

          {/* ================= ROW 3 ================= */}
          <Box className="flex gap-3">
            <Box w="33%">
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
            </Box>

            <Box w="33%">
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
            </Box>

            <Box w="33%">
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
            </Box>
          </Box>

          {/* ================= ADDRESS ================= */}
          <FormField
            control={form.control}
            name="company_address"
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

          {/* ================= TAX ================= */}
          <Box className="flex gap-3">
            <Box w="33%">
              <FormField
                control={form.control}
                name="gstin"
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
            </Box>

            <Box w="33%">
              <FormField
                control={form.control}
                name="pan_no"
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
            </Box>

            <Box w="33%">
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
            </Box>
          </Box>

          {/* ================= INVOICE ================= */}
          <Box className="flex gap-3">
            <Box w="50%">
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
            </Box>

            <Box w="50%">
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
            </Box>
          </Box>

          {/* ================= LOCATION ================= */}
          <Box className="flex gap-3">
            <Box w="25%">
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
                        options={organizationMetaInfo.country.map(p => ({
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

            <Box w="25%">
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
                        options={organizationMetaInfo.state.map(p => ({
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

            <Box w="25%">
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
                        options={organizationMetaInfo.city.map(p => ({
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

            <Box w="25%">
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
            </Box>
          </Box>

          {/* ================= PIN + FILE ================= */}
          <Box className="flex gap-3">
            <Box w="50%">
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

            <Box w="50%">
              <FormField
                control={form.control}
                name="document"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: "#000" }}>Upload Document<RequiredMark show={!isView} /></FormLabel>
                    <FormControl>
                      <Input
                        type="file"
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
        </div>

        {/* ================= ACTIONS ================= */}
        {mode !== 'view' && <div className="">
          <div className="flex justify-end gap-3 pb-6 pr-6  border-t pt-[24px]">
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
