"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// import { Box, Input, Textarea } from "@chakra-ui/react";
import { Eye, EyeOff } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import { Constant } from "@/lib/constant";
import { planName } from "@/lib/mockData";
import { serviceFormProp, serviceFormType, userFormProp, UserFormType } from "@/lib/types";
import { servicePlanSchema, userSchema } from "@/lib/schema";
export const RequiredMark = ({ show }: { show: boolean }) =>
  show ? <span className="text-red-500 ml-1">*</span> : null;

export default function ServiceForm({
  mode,
  roles,
  id,
  onClose,
  initialValues,
  isLoading = false,
  onSubmit,
}: serviceFormProp) {

  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<serviceFormType>({
    resolver: zodResolver(servicePlanSchema(mode)),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      plan_name:"",
      vehicle_type:"",
      role_id: -1,
      ...(mode === "create" ? { password: "" } : {}),
      address: "",
      ...initialValues,
    },
  });


  // Reset form when initialValues change (important for edit)
  useEffect(() => {
    if (mode === 'edit' || mode === "view") {

      form.reset({
          plan_name:"",
        vehicle_type:"",
        name: "",
        email: "",
        phone: "",
      
        role_id: -1,
        // ...(mode === "create" ? { password: "" } : {}),
        address: "",
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
            {/* <Box w={`${mode === 'edit' || mode === "view" ? '50%' : '33%'}`}>
              <FormField
                control={form.control}
                disabled={mode === 'view'}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: "#000" }}>Full Name<RequiredMark show={!isView} /></FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter full name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Box> */}

            {/* <Box w={`${mode === 'edit' || mode === "view" ? '50%' : '33%'}`}>
              <FormField
                control={form.control}
                name="email"
                disabled={mode === 'view'}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: "#000" }}>Email<RequiredMark show={!isView} /></FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Box> */}

            {/* {mode !== 'view' && <Box w="33%">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: "#000" }}>Phone<RequiredMark show={!isView} /></FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        inputMode="numeric"
                        maxLength={10}
                        placeholder="Enter phone number"
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, "");
                          if (value.startsWith("0")) value = value.replace(/^0+/, "");
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Box>} */}
          </Box>

          {/* Row 2 */}
          <Box className="flex gap-3">
            {/* {(mode === "view") && <Box w="50%">
              <FormField
                control={form.control}
                name="phone"
                disabled={mode === 'view'}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: "#000" }}>Phone</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        inputMode="numeric"
                        maxLength={10}
                        placeholder="Enter phone number"
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, "");
                          if (value.startsWith("0")) value = value.replace(/^0+/, "");
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Box>} */}
            {/* {mode !== 'view' && <Box w="50%">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: "#000" }}>
                      {"Password"}<RequiredMark show={isCreate} />
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((s) => !s)}
                          className="absolute right-2 top-1/2 -translate-y-1/2"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Box>} */}

            {/* <Box w="50%">
              <FormField
                control={form.control}
                name="role_id"
                disabled={mode === 'view'}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: "#000" }}>Role<RequiredMark show={!isView} /></FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="w-full h-10 rounded-md border border-input px-3 text-sm focus:ring-2 focus:ring-ring"
                      >
                        <option value="">Select role</option>
                        {roles.map((r) => (
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
            </Box> */}
          </Box>

          {/* Address */}
          {/* <Box>
            <FormField
              control={form.control}
              disabled={mode === 'view'}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel style={{ color: "#000" }}>Address</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Enter address (optional)"
                      minLength={10}
                      maxLength={300}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Box> */}
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
