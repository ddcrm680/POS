"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// import { Box, Input, Textarea } from "@chakra-ui/react";
import { Check, Copy, Eye, EyeOff, RefreshCcw } from "lucide-react";

import { Form } from "@/components/ui/form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { userFormProp, UserForm as UserFormType, } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Box } from "@chakra-ui/react";
import { Textarea } from "@/components/ui/textarea";
import { userSchema } from "@/lib/schema";
import { RequiredMark } from "@/components/common/RequiredMark";
import { generateStrongPassword } from "@/lib/utils";
import { CopyButton } from "@/components/common/CopyButton";
import { FloatingField } from "@/components/common/FloatingField";
import { FloatingPasswordField } from "@/pages/profile/FloatingPasswordField";
import { FloatingTextarea } from "@/components/common/FloatingTextarea";
import { FloatingRHFSelect } from "@/components/common/FloatingRHFSelect";

export default function UserFormInfo({
  mode,
  roles,
  id,
  onClose,
  initialValues,
  isLoading = false,
  onSubmit,
}: userFormProp) {
  const [copied, setCopied] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<UserFormType>({
    resolver: zodResolver(userSchema(mode)),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
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
        name: "",
        email: "",
        phone: "",
        role_id: -1,
        // ...(mode === "create" ? { password: "" } : {}),

        ...initialValues,
        address: initialValues?.address ?? "",
      });
    }
  }, [mode]);
  const isView = mode === "view";
  const isCreate = mode === "create";
  const handleGeneratePassword = () => {
    const pwd = generateStrongPassword();
    form.setValue("password", pwd, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const handleCopyPassword = async () => {
    const password = form.getValues("password");
    if (!password) return;

    await navigator.clipboard.writeText(password);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1500);
  };
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <FloatingField
              isView={mode === 'view'}
              isRequired={true}
              name={'name'}
              label={'Full Name'}
              control={form.control}
            />
            <FloatingField
              isView={mode === 'view'}
              isRequired={true}
              name={'email'}
              label={'Email'}
              control={form.control}
            />


          </div>

          {/* Row 2 */}
          <div className={`grid grid-cols-1 ${mode !== 'view' ? "md:grid-cols-3" : "md:grid-cols-2"} gap-4`}>
            {mode !== 'view' &&
              <FloatingField
                isView={false}
                isRequired={true}
                name={'phone'}
                label={'Phone'}
                control={form.control}
              />

            }
            {(mode === "view") &&
              <FloatingField
                isView={mode === 'view'}
                isRequired={true}
                name={'phone'}
                label={'Phone'}
                control={form.control}
              />

            }
            {mode !== "view" && (
              <FloatingPasswordField
                name="password"
                label="Password"
                control={form.control}
                isRequired
              />

            )}
            <FloatingRHFSelect
              name="role_id"
              label="Role"
              control={form.control}
              isDisabled={mode === 'view'}
              options={[ ...roles,].map((r) => ({
                value: String(r.id),
                label: r.name.charAt(0).toUpperCase() + r.name.slice(1),
              }))}
            />

            {/* </Box> */}
          </div>

          {/* Address */}
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">

            <FloatingTextarea
              name="address"
              label="Address"
              control={form.control}
              isRequired
              isView={mode === 'view'}
            />
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
