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
import { serviceFormProp, serviceFormType, userFormProp, UserFormType } from "@/lib/types";
import { servicePlanSchema, userSchema } from "@/lib/schema";
import RHFSelect from "@/components/RHFSelect";
import { Textarea } from "@/components/ui/textarea";
import { RequiredMark } from "@/components/common/RequiredMark";

export default function ServiceForm({
  mode,
  id,
  serviceMetaInfo,
  onClose,
  initialValues,
  isLoading = false,
  onSubmit,
}: serviceFormProp) {

  const form = useForm<serviceFormType>({
    resolver: zodResolver(servicePlanSchema(serviceMetaInfo)),
    defaultValues: {
      vehicle_type: "",
      category_type: "",
      plan_name: "",
      invoice_name: "",

      number_of_visits: "",
      price: 0,

      gst: 0,

      warranty_period: "",
      warranty_in: "months",

      raw_materials: [],

      description: "",
      sac: "",
      ...initialValues,
    },
    shouldUnregister: false,
  });


  // Reset form when initialValues change (important for edit)
  useEffect(() => {
    if (mode === 'edit' || mode === "view") {

      form.reset({
        vehicle_type: "",
        category_type: "",
        plan_name: "",
        invoice_name: "",

        number_of_visits: "",
        price: 0,

        gst: initialValues?.gst ?? 0,

        warranty_period: "",
        warranty_in: "months",
        description: initialValues?.description ?? "",
        sac: initialValues?.sac ?? "",
        raw_materials: [],
        // ...(mode === "create" ? { password: "" } : {}),
        ...initialValues,
      } as serviceFormType);

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
        className="space-y-4 "
      >  <div className="p-4 space-y-4 max-h-[500px] overflow-auto">
          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* <Box w="33%"> */}
            <FormField
              control={form.control}
              name="plan_name"
              disabled={mode === 'view'}
              render={({ field }) => (
                <FormItem>
                  <FormLabel style={{ color: "#000" }}>{Constant.master.servicePlan.planName}<RequiredMark show={!isView} /></FormLabel>
                  <FormControl>
                    <RHFSelect
                      field={field}
                      options={serviceMetaInfo.servicePlans.map(p => ({
                        value: String(p.value),
                        label: p.label,
                      }))}
                      placeholder={Constant.master.servicePlan.selectPlanName}
                      isDisabled={isView}
                    />


                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* </Box> */}


            {/* <Box w="33%"> */}

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
                    <RHFSelect
                      field={field}
                      options={serviceMetaInfo.categoryTypes.map(p => ({
                        value: String(p.value),
                        label: p.label,
                      }))}
                      placeholder={Constant.master.servicePlan.selectVehicleType.replace('vehicle',
                        'category'
                      )}
                      isDisabled={isView}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* </Box> */}
            {/* <Box w="33%"> */}

            <FormField
              control={form.control}
              name="vehicle_type"
              disabled={mode === 'view'}
              render={({ field }) => (
                <FormItem>
                  <FormLabel style={{ color: "#000" }}>{Constant.master.servicePlan.vehicleType}<RequiredMark show={!isView} /></FormLabel>
                  <FormControl>
                    <RHFSelect
                      field={field}
                      options={serviceMetaInfo.vehicleTypes.map(p => ({
                        value: String(p.value),
                        label: p.label,
                      }))}
                      placeholder={Constant.master.servicePlan.selectVehicleType}
                      isDisabled={isView}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* </Box> */}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="invoice_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: "#000" }}>
                      Invoice Name<RequiredMark show={!isView} />
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Enter invoice name"
                        {...field}
                        disabled={isView}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: "#000" }}>
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
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sac"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: "#000" }}>

                      Sac
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Enter sac"

                        {...field}
                        value={field.value ?? ""}
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
              <FormField
                control={form.control}
                name="gst"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: "#000" }}>
                      GST (%)<RequiredMark show={!isView} />
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
            </div>
          </div>
          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">


            {/* <Box w={'33%'}>  */}
            <FormField
              control={form.control}
              name="warranty_period"
              render={({ field }) => (
                <FormItem>
                  <FormLabel style={{ color: "#000" }}>

                    Warranty Period<RequiredMark show={!isView} />
                  </FormLabel>
                  <FormControl>
                    <RHFSelect
                      field={field}
                      creatable={false}
                      options={serviceMetaInfo.warrantyPeriods.map(p => ({
                        value: String(p.value),
                        label: p.label,
                      }))}
                      placeholder={Constant.master.servicePlan.selectWarrantyPeriod}
                      isDisabled={isView}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* </Box> */}
            {/* <Box w={'33%'}>  */}
            <FormField
              control={form.control}
              name="warranty_in"
              render={({ field }) => (
                <FormItem>
                  <FormLabel style={{ color: "#000" }}>
                    Warranty Type<RequiredMark show={!isView} />
                  </FormLabel>
                  <FormControl>
                    <RHFSelect
                      field={field}
                      creatable={false}
                      options={warrantyType.map(p => ({
                        value: String(p.id),
                        label: p.name,
                      }))}
                      placeholder={Constant.master.servicePlan.selectVehicleType.replace('vehicle',
                        'warranty'
                      )}
                      isDisabled={isView}
                    />

                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* </Box> */}
            {/* <Box w={'33%'}> */}
            <FormField
              control={form.control}
              name="number_of_visits"
              render={({ field }) => (
                <FormItem >
                  <FormLabel style={{ color: "#000" }}>
                    Number of visit<RequiredMark show={!isView} />
                  </FormLabel>
                  <FormControl>
                    <RHFSelect
                      field={field}
                      creatable={false}
                      options={serviceMetaInfo.numberOfVisits.map(p => ({
                        value: String(p.value),
                        label: p.label,
                      }))}
                      placeholder={Constant.master.servicePlan.noOfVisit}
                      isDisabled={isView}
                    />

                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* </Box> */}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1  gap-4">

            {/* <Box w={'100%'}>  */}
            <FormField
              control={form.control}
              name="raw_materials"
              render={({ field }) => (
                <FormItem>
                  <FormLabel style={{ color: "#000" }}>

                    Raw Material Consumption (Type raw material name and Press Enter)
                  </FormLabel>
                  <FormControl>
                    <RHFSelect
                      field={field}
                      isMulti
                      options={[]}
                      placeholder={Constant.master.servicePlan.mentionRawMaterial}
                      isDisabled={isView}
                    />

                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* </Box> */}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1   gap-4">

            {/* <Box w={'100%'} mt={0}>  */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel style={{ color: "#000" }}>

                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value ?? ""}
                      placeholder="Enter description (optional)"
                      minLength={0}
                      maxLength={200}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* </Box> */}
          </div>

        </div>
        {/* Submit */}
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
