// src/components/profile/password.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { PasswordForm, } from "@/lib/types";
import { UpdatePassword } from "@/lib/api";
import { Box } from "@chakra-ui/react";
import { Eye, EyeOff } from "lucide-react";
import { passwordSchema } from "@/lib/schema";
import { FloatingPasswordField } from "./FloatingPasswordField";

export default function Password() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const form = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (vals: PasswordForm) => {
      setIsLoading(true)
      const value = {
        current_password: vals.currentPassword,
        password: vals.newPassword,
        password_confirmation: vals.newPassword,
      }
      const res = await UpdatePassword(value);
    },
    onSuccess: () => {
      toast({ title: "Password updated", description: "Your password was changed successfully.", variant: "success" });
      form.reset();
      setIsLoading(false)
    },
    onError: (err: any) => {
      toast({
        title: "Update failed",
        description: err?.message || "Failed to update password",
        variant: "destructive",
      });
      setIsLoading(false)
    },
  });

  const onSubmit = (vals: PasswordForm) => {
    changePasswordMutation.mutate(vals);
  };

  return (
    <Card className="w-full">
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2  gap-3">

              <FloatingPasswordField
                name="currentPassword"
                label="Current Password"
                control={form.control}
                isRequired
              />

              <FloatingPasswordField
                name="newPassword"
                label="New Password"
                control={form.control}
                isRequired
              />

              <FloatingPasswordField
                name="confirmPassword"
                label="Confirm Password"
                control={form.control}
                isRequired
              />

            </div>
            <div className="flex justify-end gap-3  ">
              <Button
                type="button"
                variant="outline"
                className='hover:bg-[#E3EDF6] hover:text-[#000]'
                disabled={isLoading}
                 onClick={() => {
 localStorage.removeItem('sidebar_active_parent')
              window.history.back()
            }}
                data-testid="button-back"
              >
                ← Back
              </Button>
              <Button type="submit"
                className="
                          bg-[#FE0000] 
                          hover:bg-[rgb(238,6,6)]
                          hover:border-black
                          transition-all duration-200
                          flex items-center justify-center gap-2
                        "
                disabled={isLoading}
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
                </svg>}  {isLoading ? "Updating..." : "Update"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
