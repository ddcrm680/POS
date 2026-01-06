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
    console.log("FINAL PAYLOAD", data);
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

