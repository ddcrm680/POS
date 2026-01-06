"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form, FormField } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/common/card";
import { FloatingField } from "@/components/common/FloatingField";
import { FloatingTextarea } from "@/components/common/FloatingTextarea";

import { Checkbox } from "@/components/ui/checkbox";
import { CustomerNewSchema } from "@/lib/schema";
import { CustomerFormValues } from "@/lib/types";
import { ChevronLeft } from "lucide-react";
import { useLocation, useSearchParams } from "wouter";
import { Loader } from "@/components/common/loader";
import { FloatingRHFSelect } from "@/components/common/FloatingRHFSelect";
import Datepicker from "react-tailwindcss-datepicker";

/* ============================
   MAIN FORM
============================ */
export default function JobCardForm() {
  const [step, setStep] = useState(1);
  const [, navigate] = useLocation();

  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const mode = searchParams.get("mode");
  const isView = mode === "view";

  const [isInfoLoading, setIsInfoLoading] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<any>({
    resolver: zodResolver(CustomerNewSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      mobile_no: "",
      email: "",
      country_id: "",
      state_ids: [],
      city_ids: [],
      district: "",
      pincode: "",
      address: "",
      message: "",

      vehicle_make: "",
      vehicle_model: "",
      vehicle_color: "",
      make_year: "",
      registration_no: "",
      chassis_no: "",
      srs: "",
      service_amount: "",
      vehicle_remark: "",

      vehicle_type: "",
      service_type: "",
      service_opted: "",
      service_date: "",
    },
  });
  const [serviceDate, setServiceDate] = useState<{
  startDate: Date | null;
  endDate: Date | null;
}>({
  startDate: null,
  endDate: null,
});
  const addGST = form.watch("add_gst");
  const onSubmit = (data: CustomerFormValues) => {
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
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
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 rounded-xl bg-white">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="">

      {/*content  */}
<SectionCard title="Customer & Job Details">
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    {/* Customer selector */}
    <FloatingRHFSelect
      name="customer_id"
      label="Customer"
      isRequired
      control={form.control}
      options={[
        { label: "Add New", value: "new" },
        { label: "Jatin Chopra", value: "1" },
      ]}
    />

    <FloatingField
      name="first_name"
      label="Name"
      isRequired
      control={form.control}
    />

    {/* Job Date */}
    <div className="relative">
      <label className="text-sm font-medium">
        Date <span className="text-red-500">*</span>
      </label>
      <Datepicker
        asSingle
        useRange={false}
        value={serviceDate}
        onChange={(val) => {
          setServiceDate(val as any);
          form.setValue(
            "service_date",
            val?.startDate
              ? val.startDate.toISOString().split("T")[0]
              : "",
            { shouldValidate: true }
          );
        }}
        placeholder="Select date"
        showShortcuts={false}
        popoverDirection="down"
        inputClassName="w-full border rounded-md py-2.5 px-3 text-sm"
      />
    </div>

    <FloatingField
      name="mobile_no"
      label="Contact No."
      isRequired
      control={form.control}
    />
  </div>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
    <FloatingField name="email" label="Email" control={form.control} />
    <FloatingField name="aadhar" label="Aadhar" control={form.control} />
    <FloatingField name="pan" label="PAN Card" control={form.control} />
  </div>

  <div className="mt-4">
    <FloatingTextarea
      name="address"
      label="Address"
      isRequired
      control={form.control}
    />
  </div>
</SectionCard>

{/* =========================
   VEHICLE DETAILS
========================= */}
<SectionCard title="Vehicle Details">
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    <FloatingRHFSelect
      name="vehicle_type"
      label="Vehicle Type"
      isRequired
      control={form.control}
      options={[
        { label: "Mini SUV", value: "mini_suv" },
        { label: "SUV", value: "suv" },
        { label: "Sedan", value: "sedan" },
      ]}
    />

    <FloatingRHFSelect
      name="vehicle_make"
      label="Vehicle Make"
      isRequired
      control={form.control}
      options={[
        { label: "Hyundai", value: "HYUNDAI" },
        { label: "Honda", value: "HONDA" },
      ]}
    />

    <FloatingRHFSelect
      name="vehicle_model"
      label="Vehicle Model"
      isRequired
      control={form.control}
      options={[
        { label: "Creta", value: "CRETA" },
        { label: "Verna", value: "VERNA" },
      ]}
    />

    <FloatingField
      name="vehicle_color"
      label="Vehicle Color"
      control={form.control}
    />

    <FloatingRHFSelect
      name="make_year"
      label="Make Year"
      isRequired
      control={form.control}
      options={[
        { label: "2025", value: "2025" },
        { label: "2024", value: "2024" },
      ]}
    />

    <FloatingField
      name="registration_no"
      label="Registration No."
      isRequired
      control={form.control}
    />

    <FloatingField
      name="chassis_no"
      label="Chassis No."
      control={form.control}
    />

    <FloatingRHFSelect
      name="srs"
      label="SRS (Required)"
      isRequired
      control={form.control}
      options={[
        { label: "Brand New", value: "brand_new" },
        { label: "Used", value: "used" },
      ]}
    />

    <FloatingField
      name="service_amount"
      label="Servicing Amount"
      control={form.control}
    />

    <FloatingField
      name="vehicle_remark"
      label="Remark"
      control={form.control}
    />
  </div>
</SectionCard>

{/* =========================
   PAINT CONDITION
========================= */}
<SectionCard title="Vehicle Paint Condition">
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
    <label className="flex items-center gap-2">
      <Checkbox /> Repainted Vehicle
    </label>
    <label className="flex items-center gap-2">
      <Checkbox /> Single Stage Paint
    </label>
    <label className="flex items-center gap-2">
      <Checkbox /> Paint Thickness below 2 MIL
    </label>
    <label className="flex items-center gap-2">
      <Checkbox /> Vehicle older than 5 years
    </label>
  </div>
</SectionCard>
            {/* FOOTER */}
            <div className="border-t px-5 py-4 flex justify-end gap-3 mt-4">
              <Button
                variant="outline"
                disabled={isLoading || isInfoLoading}
                className={'hover:bg-[#E3EDF6] hover:text-[#000]'}
                onClick={() => navigate("/customers")}
              >
                {'Cancel'}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={step === 1}
                onClick={() => setStep((s) => s - 1)}
              >
                Previous
              </Button>
              {step < 3 ? (
                <Button className="bg-[#FE0000] hover:bg-[rgb(238,6,6)]" type="button" onClick={() => setStep((s) => s + 1)}>
                  Next
                </Button>
              ) : (
                <Button type="submit"
                  disabled={isLoading || isInfoLoading}
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
    </div>
  );
}

