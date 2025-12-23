"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useSearchParams } from "wouter";

import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import RHFSelect from "@/components/RHFSelect";

import { StoreSchema } from "@/lib/schema";
import { storeFormProp, storeFormType } from "@/lib/types";
import { Constant } from "@/lib/constant";
import { countryOptions, stateOptions, cityOptions } from "@/lib/mockData";
import { Card } from "@/components/common/card";
import { RequiredMark } from "@/components/common/RequiredMark";

export default function StoreForm({
  onClose,
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
      registration_file: "",
      cancelled_cheque: "",
      agreement_file: "",
    },
  });

  /* ---------------- HYDRATE EDIT / VIEW ---------------- */
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
        pincode: initialValues?.pincode ?? "",
        registration_file: initialValues?.registration_file ?? "",
        cancelled_cheque: initialValues?.cancelled_cheque ?? "",
        agreement_file: initialValues?.agreement_file ?? "",
      });
    }
  }, [mode, initialValues, form]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => onSubmit(values, form.setError))}
        className="min-h-screen bg-gray-50"
      >
        {/* ---------------- HEADER ---------------- */}
        <div className="bg-white border-b sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-6 py-3 flex justify-center items-center">
            <h2 className="text-lg font-semibold">
              {isView ? "View Store" : id ? "Edit Store" : "Add Store"}
            </h2>
          </div>
        </div>

        {/* ---------------- CONTENT ---------------- */}
        <div className="max-w-7xl pb-4 bg-white mx-auto rounded-xl ">

          {/* STORE INFO */}
          <Card title="Store Information">
            <div className="grid grid-cols-3 gap-4">
              <FormField name="store_name" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Store Name<RequiredMark show={!isView} /></FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isView} placeholder="Enter store name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField name="email" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Email<RequiredMark show={!isView} /></FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isView} placeholder="Enter email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField name="phone" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone<RequiredMark show={!isView} /></FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isView} placeholder="Enter phone" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </Card>

          {/* BILLING + TAX */}
          <div className="grid grid-cols-2 gap-6">
            <Card title="Billing & Invoicing">
              <FormField name="invoice_prefix" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Invoice Prefix<RequiredMark show={!isView} /></FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isView} placeholder="Eg: DD/INV" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </Card>

            <Card title="Tax Information">
              <div className="grid grid-cols-2 gap-4">
                <FormField name="gstin" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>GSTIN<RequiredMark show={!isView} /></FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isView} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField name="pan_no" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>PAN No.<RequiredMark show={!isView} /></FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isView} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </Card>
          </div>

          {/* DOCUMENTS */}
          <Card title="Store Documents">
            <div className="grid grid-cols-3 gap-4">
              {["registration_file", "cancelled_cheque", "agreement_file"].map((name) => (
                <FormField key={name} name={name as any} control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>{name.replace("_", " ")}<RequiredMark show={!isView} /></FormLabel>
                    <FormControl>
                      <Input type="file" disabled={isView} onChange={(e) => field.onChange(e.target.files?.[0] ?? null)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              ))}
            </div>
          </Card>

          {/* LOCATION */}
          <Card title="Location & Operational Details">
            <div className="grid grid-cols-3 gap-4">
              <FormField name="location_name" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Location Name<RequiredMark show={!isView} /></FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isView} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField name="pincode" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Pincode<RequiredMark show={!isView} /></FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isView} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField name="country" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Country<RequiredMark show={!isView} /></FormLabel>
                  <FormControl>
                    <RHFSelect field={field} options={countryOptions} isDisabled={isView} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4">
              <FormField name="state" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>State<RequiredMark show={!isView} /></FormLabel>
                  <FormControl>
                    <RHFSelect field={field} options={stateOptions} isDisabled={isView} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField name="city" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>City<RequiredMark show={!isView} /></FormLabel>
                  <FormControl>
                    <RHFSelect field={field} options={cityOptions} isDisabled={isView} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="mt-4">
              <FormField name="address" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Address<RequiredMark show={!isView} /></FormLabel>
                  <FormControl>
                    <Textarea {...field} disabled={isView} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </Card>

          {/* NOTES */}
          <Card title="Additional Notes">
            <FormField name="notes" control={form.control} render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea {...field} disabled={isView} rows={3} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </Card>
        </div>

        {/* ---------------- FOOTER ---------------- */}
        {mode !== "view" && (
          <div className="sticky bottom-0  bg-white border-t">
            <div className="max-w-7xl mx-auto px-6 py-3 flex justify-end gap-3">
              <Button variant="outline" onClick={() => navigate("/master")}>
                Cancel
              </Button>
              <Button className="bg-red-500 hover:bg-red-600">
                {id ? "Update" : "Add"}
              </Button>
            </div>
          </div>
        )}
      </form>
    </Form>
  );
}
