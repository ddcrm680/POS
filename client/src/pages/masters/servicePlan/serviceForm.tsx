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
import { categoryType, numberOfVisit, planName, warrantyPeriod } from "@/lib/mockData";
import { serviceFormProp, serviceFormType, userFormProp, UserFormType } from "@/lib/types";
import { servicePlanSchema, userSchema } from "@/lib/schema";
export const RequiredMark = ({ show }: { show: boolean }) =>
  show ? <span className="text-red-500 ml-1">*</span> : null;

export default function ServiceForm({
  mode,
  id,
  onClose,
  initialValues,
  isLoading = false,
  onSubmit,
}: serviceFormProp) {

  const form = useForm<serviceFormType>({
    resolver: zodResolver(servicePlanSchema(mode)),
    defaultValues: {
      vehicle_type: "",
      category_type: "",
      plan_name: "",
      invoice_name: "",

      number_of_visit: "",
      price: 0,

      sac: "",
      gst: undefined,

      warranty_period: "",
      warranty_type: "month",

      description: "",
      raw_materials: [],

      ...initialValues,
    },
  });


  // Reset form when initialValues change (important for edit)
  useEffect(() => {
    if (mode === 'edit' || mode === "view") {

      form.reset({
        vehicle_type: "",
        category_type: "",
        plan_name: "",
        invoice_name: "",

        number_of_visit: "",
        price: 0,

        sac: "",
        gst: undefined,

        warranty_period: "",
        warranty_type: "month",

        description: "",
        raw_materials: [],
        // ...(mode === "create" ? { password: "" } : {}),
        ...initialValues,
      });
    }
  }, [mode]);
  const isView = mode === "view";
  const isCreate = mode === "create";
  return (
    <Form {...form}>
      <form
        id={id}
        onSubmit={form.handleSubmit((values) =>
          onSubmit(values, form.setError)
        )}
        className="space-y-6 "
      >  <div className="p-6 space-y-6">
          {/* Row 1 */}
          <Box className="flex gap-3 ">
            <Box w="33%">
              <FormField
                control={form.control}
                name="plan_name"
                disabled={mode === 'view'}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: "#000" }}>{Constant.master.servicePlan.planName}<RequiredMark show={!isView} /></FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="w-full h-10 rounded-md border border-input px-3 text-sm focus:ring-2 focus:ring-ring"
                      >
                        <option value="">{Constant.master.servicePlan.selectPlanName}</option>
                        {planName.map((r) => (
                          <option key={r.id} value={Number(r.id)}>
                            {r.name.charAt(0).toUpperCase() + r.name.slice(1)}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Box>
            <Box w="33%">

              <FormField
                control={form.control}
                name="vehicle_type"
                disabled={mode === 'view'}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: "#000" }}>{Constant.master.servicePlan.vehicleType}<RequiredMark show={!isView} /></FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="w-full h-10 rounded-md border border-input px-3 text-sm focus:ring-2 focus:ring-ring"
                      >
                        <option value="">{Constant.master.servicePlan.selectVehicleType}</option>
                        {planName.map((r) => (
                          <option key={r.id} value={Number(r.id)}>
                            {r.name.charAt(0).toUpperCase() + r.name.slice(1)}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Box>
            <Box w="33%">

              <FormField
                control={form.control}
                name="category_type"
                disabled={mode === 'view'}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: "#000" }}>{Constant.master.servicePlan.vehicleType.replace('Vehicle',
                      'Category'
                    )}<RequiredMark show={!isView} /></FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="w-full h-10 rounded-md border border-input px-3 text-sm focus:ring-2 focus:ring-ring"
                      >
                        <option value="">{Constant.master.servicePlan.selectVehicleType.replace('vehicle',
                          'category'
                        )}</option>
                        {categoryType.map((r) => (
                          <option key={r.id} value={Number(r.id)}>
                            {r.name.charAt(0).toUpperCase() + r.name.slice(1)}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Box>

          </Box>

          {/* Row 2 */}
          <Box className="flex gap-3">
            <Box w={'33%'}>
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Price (₹)<RequiredMark show={!isView} />
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Enter price"
                        {...field}
                        onChange={(e) => {
                          let value = e.target.value;

                          // 1️⃣ allow only digits
                          value = value.replace(/\D/g, "");
                          value = value.replace(/^0+/, "");

                          // allow single zero
                          if (value === "") {
                            value = "0";
                          }
                          field.onChange(value);
                        }}

                        disabled={isView}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            </Box>
            <Box w={'33%'}> <FormField
              control={form.control}
              name="warranty_period"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>

                    Warranty Period<RequiredMark show={!isView} />
                  </FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="w-full h-10 rounded-md border px-3"
                      disabled={isView}
                    >
                      <option value="">{Constant.master.servicePlan.selectWarrantyPeriod}</option>
                      {warrantyPeriod.map((period) => {
                        return <option value={period.id}>{period.name}</option>
                      })}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            </Box>
            <Box w={'33%'}> <FormField
              control={form.control}
              name="warranty_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Warranty Type<RequiredMark show={!isView} />
                  </FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="w-full h-10 rounded-md border px-3"
                      disabled={isView}
                    >
                      <option value="">{Constant.master.servicePlan.selectVehicleType.replace('vehicle',
                        'warranty'
                      )}</option>
                      {warrantyPeriod.map((period) => {
                        return <option value={period.id}>{period.name}</option>
                      })}

                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            </Box>
          </Box>
          <Box className="flex gap-3">
            <Box w={'33%'}>
              <FormField
                control={form.control}
                name="number_of_visit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Visit<RequiredMark show={!isView} />
                    </FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="w-full h-10 rounded-md border px-3"
                        disabled={isView}
                      >
                        <option value="">{Constant.master.servicePlan.noOfVisit}</option>
                        {numberOfVisit.map((visit) => {
                          return <option value={visit.id}>{visit.name}</option>
                        })}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Box>
            <Box w={'33%'}> <FormField
              control={form.control}
              name="sac"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>

                    Sac<RequiredMark show={!isView} />
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter sac"
                      {...field}
                      onChange={(e) => {
                        let value = e.target.value;

                        // allow only letters and numbers (no special characters)
                        value = value.replace(/[^a-zA-Z0-9]/g, "");

                        field.onChange(value);
                      }}

                      disabled={isView}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            </Box>
            <Box w={'33%'}> <FormField
              control={form.control}
              name="gst"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    GST(%)<RequiredMark show={!isView} />
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter gst"
                      {...field}
                      onChange={(e) => {
                        let value = e.target.value;

                        // allow only digits and dot
                        value = value.replace(/[^0-9.]/g, "");
                        value = value.replace(/^0+/, "");

                        // allow single zero
                        if (value === "") {
                          value = "0";
                        }

                        // allow only ONE decimal point
                        if ((value.match(/\./g) || []).length > 1) {
                          return;
                        }

                        // restrict to 2 decimal places
                        if (value.includes(".")) {
                          const [int, dec] = value.split(".");
                          value = int + "." + dec.slice(0, 2);
                        }

                        // convert to number for validation
                        const num = Number(value);

                        // prevent negative
                        if (num < 0) return;

                        // max allowed is 100
                        if (num > 100) return;

                        field.onChange(value);
                      }}

                      disabled={isView}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            </Box>
          </Box>
          <Box className="flex gap-3">
            <Box w={'50%'}> <FormField
              control={form.control}
              name="sac"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>

                    Description<RequiredMark show={!isView} />
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter description"
                      {...field}
                      disabled={isView}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            </Box>
             <Box w={'50%'}> <FormField
              control={form.control}
              name="sac"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>

                    Raw Material Consumption<RequiredMark show={!isView} />
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter raw material consumption"
                      {...field}
                      disabled={isView}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            </Box>
          </Box>
        </div>
        {/* Submit */}
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
