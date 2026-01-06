import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form, FormField } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/common/card";
import { FloatingField } from "@/components/common/FloatingField";
import { FloatingTextarea } from "@/components/common/FloatingTextarea";
import { FloatingRHFSelect } from "@/components/common/FloatingRHFSelect";
import { Checkbox } from "@/components/ui/checkbox";

import Datepicker from "react-tailwindcss-datepicker";
import { JobCardFormValues } from "@/lib/types";
import { JobCardSchema } from "@/lib/schema";


export default function JobCardForm() {
  const form = useForm<any>({
    resolver: zodResolver(JobCardSchema),
    defaultValues: {
      service_type: [],
      repainted_vehicle: false,
      single_stage_paint: false,
      paint_thickness_below_2mil: false,
      vehicle_older_than_5_years: false,
    },
  });

  const onSubmit = (data: JobCardFormValues) => {
    console.log("JOB CARD PAYLOAD", data);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

          {/* ================= CUSTOMER + DATE ================= */}
          <SectionCard title="Job Card Information">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FloatingRHFSelect
                name="customer_id"
                label="Customer"
                control={form.control}
                options={[
                  { label: "Add New", value: "new" },
                  { label: "Jatin Chopra", value: "1" },
                ]}
              />

              <FormField
                control={form.control}
                name="jobcard_date"
                render={() => (
                  <div className="relative">
                    <label className="text-sm font-medium">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <Datepicker
                      asSingle
                      useRange={false}
                      value={{
                        startDate: form.watch("jobcard_date")
                          ? new Date(form.watch("jobcard_date"))
                          : null,
                        endDate: null,
                      }}
                      onChange={(val) =>
                        form.setValue(
                          "jobcard_date",
                          val?.startDate
                            ? new Date(val.startDate)
                                .toISOString()
                                .split("T")[0]
                            : ""
                        )
                      }
                      inputClassName="w-full border rounded-md px-3 py-2"
                    />
                  </div>
                )}
              />
            </div>
          </SectionCard>

          {/* ================= VEHICLE ================= */}
          <SectionCard title="Vehicle Details">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FloatingRHFSelect
                name="vehicle_type"
                label="Vehicle Type"
                control={form.control}
                options={[
                  { label: "Bike", value: "bike" },
                  { label: "Hatchback", value: "hatchback" },
                  { label: "Sedan", value: "sedan" },
                  { label: "SUV", value: "suv" },
                ]}
              />

              <FloatingRHFSelect
                name="vehicle_make"
                label="Vehicle Make"
                control={form.control}
                options={[
                  { label: "Hyundai", value: "HYUNDAI" },
                  { label: "Honda", value: "HONDA" },
                ]}
              />

              <FloatingRHFSelect
                name="vehicle_model"
                label="Vehicle Model"
                control={form.control}
                options={[
                  { label: "Verna", value: "VERNA" },
                  { label: "City", value: "CITY" },
                ]}
              />

              <FloatingField
                name="vehicle_color"
                label="Vehicle Color"
                control={form.control}
              />

              <FloatingField
                name="make_year"
                label="Make Year"
                control={form.control}
              />

              <FloatingField
                name="registration_no"
                label="Registration No"
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
                control={form.control}
                options={[
                  { label: "Brand New", value: "brand_new" },
                  { label: "Minor Damage", value: "minor_damage" },
                  { label: "Major Damage", value: "major_damage" },
                ]}
              />
            </div>
          </SectionCard>

          {/* ================= SERVICE ================= */}
          <SectionCard title="Service Details">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FloatingRHFSelect
                name="service_type"
                label="Service Type"
                isMulti
                control={form.control}
                options={[
                  { label: "Exterior Detailing", value: "exterior" },
                  { label: "Interior Detailing", value: "interior" },
                  { label: "PPF / Ceramic", value: "ppf" },
                ]}
              />

              <FloatingRHFSelect
                name="service_opted"
                label="Service Opted"
                control={form.control}
                options={[
                  { label: "Standard", value: "standard" },
                  { label: "Premium", value: "premium" },
                ]}
              />

              <FloatingField
                name="service_amount"
                label="Servicing Amount"
                control={form.control}
              />
            </div>

            <div className="mt-4">
              <FloatingTextarea
                name="remark"
                label="Remark"
                control={form.control}
              />
            </div>
          </SectionCard>

          {/* ================= PAINT CONDITION ================= */}
          <SectionCard title="Vehicle Paint Condition">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox {...form.register("repainted_vehicle")} />
                Repainted Vehicle
              </label>

              <label className="flex items-center gap-2 text-sm">
                <Checkbox {...form.register("single_stage_paint")} />
                Single Stage Paint
              </label>

              <label className="flex items-center gap-2 text-sm">
                <Checkbox {...form.register("paint_thickness_below_2mil")} />
                Paint Thickness below 2 MIL
              </label>

              <label className="flex items-center gap-2 text-sm">
                <Checkbox {...form.register("vehicle_older_than_5_years")} />
                Vehicle older than 5 years
              </label>
            </div>
          </SectionCard>

          {/* ================= FOOTER ================= */}
          <div className="flex justify-end gap-3 border-t pt-4">
            <Button variant="outline">Cancel</Button>
            <Button className="bg-primary">Save Job Card</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}