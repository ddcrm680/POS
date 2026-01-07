 import { useEffect, useState } from "react";
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
import { FloatingDateField } from "@/components/common/FloatingDateField";

export function JobForm(){
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
      service_date:"",
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
useEffect(()=>{
  console.log(form.getValues(),'asdfgdsdfgwe');

},[form])
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
            <Stepper step={step} />

            {/* STEP 1 */}
            {step === 1 && (
              <SectionCard title="Customer Information">
                {/* BASIC INFO */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FloatingField
                    name="first_name"
                    label="First Name"
                    isRequired
                    control={form.control}
                  />

                  <FloatingField
                    name="last_name"
                    label="Last Name"
                    isRequired
                    control={form.control}
                  />

                  <FloatingField
                    name="mobile_no"
                    label="Mobile No"
                    isRequired
                    control={form.control}
                  />

                  <FloatingField
                    name="email"
                    label="Email"
                    isRequired
                    control={form.control}
                  />

                  {/* COUNTRY */}
                  <FloatingRHFSelect
                    name="country_id"
                    label="Country"
                    isRequired
                    control={form.control}
                    options={[
                      { value: "India", label: "India" },
                    ]}
                  />

                  {/* STATE */}
                  <FloatingRHFSelect
                    name="state_ids"
                    label="State"
                    isRequired
                    control={form.control}
                    options={[
                      { value: "Andaman and Nicobar Islands", label: "Andaman and Nicobar Islands" },
                    ]}
                  />

                  {/* CITY */}
                  <FloatingRHFSelect
                    name="city_ids"
                    label="City"
                    isRequired
                    control={form.control}
                    options={[
                      { value: "Nicobar", label: "Nicobar" },
                    ]}
                  />

                  <FloatingField
                    name="district"
                    label="District"
                    isRequired
                    control={form.control}
                  />

                  <FloatingField
                    name="pincode"
                    label="Pincode"
                    isRequired
                    control={form.control}
                  />
                </div>

                {/* ADDRESS + MESSAGE */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <FloatingTextarea
                    name="address"
                    label="Address"
                    isRequired
                    control={form.control}
                  />

                  <FloatingTextarea
                    name="message"
                    label="Message"
                    control={form.control}
                  />
                </div>

                {/* GST OPTIONAL */}
                <div className="mt-4 flex items-center gap-2">
                  <Checkbox
                    checked={addGST}
                    onCheckedChange={(val) => form.setValue("add_gst", Boolean(val))}
                  />
                  <label
                    htmlFor="add_gst"
                    className="text-sm font-bold cursor-pointer"
                  >
                    Add GST Details (Optional)
                  </label>
                </div>
                {addGST && (
                  <div className="pt-4">
                    <h4 className="text-sm font-semibold mb-4">
                      GST Information
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FloatingField
                        name="gst_company_name"
                        label="Company Name"
                        control={form.control}
                      />

                      <FloatingField
                        name="gst_contact_no"
                        label="Company Contact No."
                        control={form.control}
                      />

                      <FloatingField
                        name="gstin"
                        label="GSTIN"
                        control={form.control}
                      />

                      <FloatingRHFSelect
                        name="gst_country_id"
                        label="Country"
                        control={form.control}
                        options={[
                          { value: "India", label: "India" },
                        ]}
                      />

                      <FloatingRHFSelect
                        name="gst_state_id"
                        label="State"
                        control={form.control}
                        options={[]}
                      />

                      <FloatingRHFSelect
                        name="gst_city_id"
                        label="City"
                        control={form.control}
                        options={[]}
                      />

                      <FloatingField
                        name="gst_district"
                        label="District"
                        control={form.control}
                      />

                      <FloatingField
                        name="gst_pincode"
                        label="Pincode"
                        control={form.control}
                      />
                    </div>

                    <div className="mt-4">
                      <FloatingTextarea
                        name="gst_address"
                        label="Company Address"
                        control={form.control}
                      />
                    </div>
                  </div>
                )}
              </SectionCard>

            )}

            {/* STEP 2 */}
            {step === 2 && (
              <SectionCard title="Vehicle Information">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                  <FloatingRHFSelect
                    name="vehicle_make"
                    label="Vehicle Make"
                    isRequired
                    control={form.control}
                    options={[
                      { value: "HYUNDAI", label: "Hyundai" },
                      { value: "HONDA", label: "Honda" },
                      { value: "TOYOTA", label: "Toyota" },
                    ]}
                  />

                  <FloatingRHFSelect
                    name="vehicle_model"
                    label="Vehicle Model"
                    isRequired
                    control={form.control}
                    options={[
                      { value: "VERNA", label: "Verna" },
                      { value: "CITY", label: "City" },
                      { value: "INNOVA", label: "Innova" },
                    ]}
                  />

                  <FloatingField
                    name="vehicle_color"
                    label="Vehicle Color"
                    isRequired
                    control={form.control}
                  />

                  <FloatingRHFSelect
                    name="make_year"
                    label="Make Year"
                    isRequired
                    control={form.control}
                    options={[
                      { value: "2025", label: "2025" },
                      { value: "2024", label: "2024" },
                      { value: "2023", label: "2023" },
                    ]}
                  />

                  <FloatingField
                    name="registration_no"
                    label="Registration No"
                    isRequired
                    control={form.control}
                  />

                  <FloatingField
                    name="chassis_no"
                    label="Chassis No"
                    control={form.control}
                  />

                  <FloatingRHFSelect
                    name="srs"
                    label="SRS Condition"
                    isRequired
                    control={form.control}
                    options={[
                      { value: "brand_new", label: "Brand New" },
                      { value: "minor_damage", label: "Minor Damage" },
                      { value: "major_damage", label: "Major Damage" },
                    ]}
                  />

                  <FloatingField
                    name="service_amount"
                    label="Service Amount"
                    control={form.control}
                  />
                </div>

                <div className="mt-4">
                  <FloatingTextarea
                    name="vehicle_remark"
                    label="Remark"
                    control={form.control}
                  />
                </div>

                {/* PAINT CONDITION */}
                <div className="mt-4">
                  <p className="text-sm font-semibold mb-3">Vehicle Paint Condition</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox /> Repainted Vehicle
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox /> Single Stage Paint
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox /> Paint Thickness below 2 MIL
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox /> Vehicle older than 5 years
                    </label>
                  </div>
                </div>
              </SectionCard>
            )}


            {/* STEP 3 */}
            {step === 3 && (
              <SectionCard title="Service Information">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Vehicle Type */}
                  <FloatingRHFSelect
                    name="vehicle_type"
                    label="Vehicle Type"
                    isRequired
                    control={form.control}
                    options={[
                      { label: "Bike", value: "bike" },
                      { label: "Hatchback", value: "hatchback" },
                      { label: "Sedan", value: "sedan" },
                      { label: "SUV", value: "suv" },
                    ]}
                  />

                  {/* Service Type (Multi) */}
                  <FloatingRHFSelect
                    name="service_type"
                    label="Service Type"
                    isMulti
                    isRequired
                    control={form.control}
                    options={[
                      { label: "Exterior Detailing", value: "exterior_detailing" },
                      { label: "Interior Detailing", value: "interior_detailing" },
                      { label: "Exterior Protection", value: "exterior_protection" },
                      { label: "PPF / Ceramic", value: "ppf_ceramic" },
                    ]}
                  />

                  {/* Service Opted */}
                  <FloatingRHFSelect
                    name="service_opted"
                    label="Service Opted"
                    isRequired
                    control={form.control}
                    options={[
                      { label: "Standard", value: "standard" },
                      { label: "Premium", value: "premium" },
                      { label: "Custom", value: "custom" },
                    ]}
                  />
                </div>

                {/* Service Date */}
                <FloatingDateField
                  name="service_date"
                  label="Service Date"
                  isRequired
                  control={form.control}
                  className="max-w-xs mt-6"
                />
              </SectionCard>
            )}

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

/* ============================
   STEPPER
============================ */
function Stepper({ step }: { step: number }) {
  const steps = [
    { id: 1, label: "Customer Info", desc: "Basic details" },
    { id: 2, label: "Vehicle Info", desc: "Vehicle details" },
    { id: 3, label: "Service Info", desc: "Service selection" },
  ];

  return (
    <div className="flex justify-center py-6 border-b">
      <div className="relative w-full max-w-2xl">
        {/* Connector line (perfectly aligned) */}
        <div className="absolute top-[14px] left-[24px] right-[24px] h-[1.5px] bg-border" />

        <div className="relative flex justify-between">
          {steps.map((s) => {
            const isActive = step === s.id;
            const isDone = step > s.id;

            return (
              <div key={s.id} className="flex flex-col items-center">
                {/* STEP DOT */}
                <div
                  className={`
                    h-7 w-7 rounded-full flex items-center justify-center
                    text-xs font-semibold border z-10
                    ${isDone
                      ? "bg-green-600 text-white border-green-600"
                      : isActive
                        ? "bg-primary text-white border-primary"
                        : "bg-muted text-muted-foreground border-border"
                    }
                  `}
                >
                  {isDone ? "✓" : s.id}
                </div>

                {/* LABEL */}
                <div className="mt-1 text-center">
                  <p
                    className={`text-xs font-medium ${isActive
                      ? "text-primary"
                      : isDone
                        ? "text-foreground"
                        : "text-muted-foreground"
                      }`}
                  >
                    {s.label}
                  </p>
                  <p className="text-[11px] text-muted-foreground hidden sm:block">
                    {s.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}