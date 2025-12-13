// src/components/profile/password.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { PasswordForm, passwordSchema } from "@/schema";
import { UpdatePassword } from "@/lib/api";
import { Box } from "@chakra-ui/react";
import { Eye, EyeOff } from "lucide-react";

export default function Password() {
  const { toast } = useToast();
   const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showNew, setShowNew] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-6">
            <Box w={'100%'} className="gap-3 flex">
              <Box w={'50%'} >
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel style={{ color: "#000" }}>Current Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input {...field} type={showCurrent ? "text" : "password"} placeholder="Current password" />
                          <button
                            type="button"
                            onClick={() => setShowCurrent((s) => !s)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded focus:outline-none"
                            aria-label={showCurrent ? "Hide password" : "Show password"}
                          >
                            {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>

                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Box>
              <Box w={'50%'} >

                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel style={{ color: "#000" }}>New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input {...field} type={showNew ? "text" : "password"} placeholder="New password" />
                          <button
                            type="button"
                            onClick={() => setShowNew((s) => !s)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded focus:outline-none"
                            aria-label={showCurrent ? "Hide password" : "Show password"}
                          >
                            {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>

                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Box>
            </Box>
            <Box w={'50%'} >

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: "#000" }}>Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input {...field} type={showConfirm ? "text" : "password"} placeholder="Confirm new password" />
                        <button
                          type="button"
                          onClick={() => setShowConfirm((s) => !s)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded focus:outline-none"
                          aria-label={showCurrent ? "Hide password" : "Show password"}
                        >
                          {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>

                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Box>
            <div className="flex justify-end gap-3  ">
              <Button
                type="button"
                variant="outline"
                className='hover:bg-[#E3EDF6] hover:text-[#000]'
   disabled={isLoading}
                onClick={() => window.history.back()}
                data-testid="button-back"
              >
                ← Back
              </Button>
              <Button type="submit"
                 disabled={isLoading}
              >
               {isLoading &&  <svg
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
          </svg>}  {isLoading ? "Updating...":"Update"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
