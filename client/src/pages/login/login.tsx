// src/pages/login.tsx
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Employee from '@/lib/images/employee.png'
import JobCard from '@/lib/images/job-card.png'
import Logo from '@/lib/images/logo.png'
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Eye, EyeOff } from "lucide-react";
import { Box, HStack } from "@chakra-ui/react";
import { LoginFormValues, } from "@/lib/types";
import { Constant } from "@/lib/constant";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { loginSchema } from "@/lib/schema";

export default function LoginPage() {
  const [location, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {

    if (!isLoading && user) {
      setLocation("/home");
      localStorage.removeItem('sidebar_active_parent')
    }
  }, [isLoading, user, setLocation]);

  const [showPwd, setShowPwd] = useState(false);
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const { login } = useAuth();
  useEffect(() => {
    const expired = sessionStorage.getItem("sessionExpired");

    if (expired) {
      toast({
        title: "Session expired",
        description: "Your session has expired. Please log in again.",
        variant: "error",
      });

      sessionStorage.removeItem("sessionExpired");
    }
  }, []);
  const onSubmit = async (vals: { email: string; password: string }) => {
    setIsSubmitting(true);
    try {
      await login(vals);
      toast?.({
        title: "Login Success",
        description: Constant.login.loginSuccessMessage,
        variant: "success",
      });
      setLocation("/home");
    } catch (err: any) {
      console.error(err);
      toast?.({
        title: "Login failed",
        description: err?.response?.data?.message ?? Constant.login.loginFailureMessage,
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="min-h-screen">
      <HStack
        gap={0}
        align="stretch"
        className="w-full h-screen"
      >
        {/* LEFT*/}

        <Box
          w={{ base: "0%", xl: "65%" }}
          display="flex"
          justifyContent="center"
          alignItems="center"
          className="relative hidden md:flex" // hide on small screens (form will be full width then)
          style={{ borderRight: "1px solid rgba(226,232,240,0.8)" }}
        >
          {/* background / bottom image (full area) */}
          <div className="w-full h-full relative hidden xl:flex overflow-hidden bg-[#fff2f2]">
            <div
              style={{
                position: "absolute",
                left: ' -0%',
                bottom: '0%',
                // transform: "translate(-50%, -20%)",
                width: "80%",
                boxShadow: "0 20px 40px rgba(0,0,0,0.18)",
                borderRadius: 12,
                overflow: "hidden",
                background: "white",
              }}
            >

              <img

                src={Employee}
                alt="Job card background"
                className="w-[70%] h-[70%] object-cover opacity-95"
                style={{ filter: "saturate(1.05) contrast(0.95)", width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            {/* overlay (top) image centered, slightly smaller and elevated */}
            <div
              style={{
                position: "absolute",
                top: "15%",
                height: "70%",
                boxShadow: "rgba(0, 0, 0, 0.18) 0px 20px 40px",


                borderRadius: "12px",
                overflow: "hidden",
                background: "white",
                right: "-40%",
              }}
            >

              <img
                src={JobCard}
                alt="Employee"
                className="w-full h-full object-cover"
              />
            </div>


          </div>
        </Box>

        {/* RIGHT: login form (on small screens this is full width) */}

        <Box className="relative w-full h-screen xl:hidden overflow-hidden">
          <Box
            w={{ base: "100%", xl: "0%" }}
            display="flex"
            justifyContent="center"
            alignItems="center"
            className="absolute  blur-sm z-10 h-full top-0 left-0  xl:hidden" // hide on small screens (form will be full width then)
            style={{ borderRight: "1px solid rgba(226,232,240,0.8)" }}
          >
            {/* background / bottom image (full area) */}
           <div className="w-full h-full relative xl:hidden overflow-hidden bg-[#fff2f2] flex items-center justify-center">

              {/* 🔽 SCALE WRAPPER */}
              <div className="relative w-full h-full scale-[0.6] origin-center">

                <div
                  style={{
                    position: "absolute",
                    top: "-68px",
                    right: " -3%",
                    width: "249%",
                    height: " 100%",
                    background: "white",
                    borderRadius: 12,
                    overflow: "hidden",
                    boxShadow: "rgba(0, 0, 0, 0.18) 0px 20px 40px",

                    transform: "skew(-10deg) scale(0.95)",
                    transformOrigin: "center center",
                  }}
                >


                  <img

                    src={Employee}
                    alt="Job card background"
                    className=" object-cover opacity-95"
                    style={{ filter: "saturate(1.05) contrast(0.95)", width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    right: "-100%",
                    width: "160%",
                    height: "70%",

                    boxShadow: "rgba(0, 0, 0, 0.18) 0px 20px 40px",
                    transform: "skew(8deg) scale(0.9)",
                    transformOrigin: "center",

                    borderRadius: "12px",
                    overflow: "hidden",
                    background: "white",
                  }}

                >

                  <img
                    src={JobCard}
                    alt="Employee"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>


            </div>
          </Box>
          <Box
            // w={'35%'}
            className="absolute top-1/2 w-full p-0 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2"
            justifyContent="center"
            alignItems="center"
            p={{ base: 12, md: 12 }}
          >
            <div className="w-[100%] flex justify-center  z-10">
              <Card className="drop-shadow-[0_3px_8px_rgba(254,0,0,0.4)] md:w-[40%]">
                <CardHeader className="pt-6">
                  <img src={Logo} alt="Detailing Devils" className="h-10 pl-4 object-contain my-4" />

                  <CardTitle className="text-xl text-center">Login</CardTitle>
                </CardHeader>

                <CardContent className="px-8 pb-8">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => {
                          const hasError = !!form.formState.errors.email;
                          return (
                            <FormItem>
                              {/* force black label even when error present */}
                              <FormLabel style={{ color: "#000" }} className="text-sm font-medium">
                                Email
                              </FormLabel>

                              <FormControl>
                                <div className="relative group">


                                  <Input
                                    {...field}
                                    placeholder="official@example.com"
                                    className="pl-4"
                                    data-testid="input-email"
                                    autoComplete="email"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />


                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel style={{ color: "#000" }} className="text-sm font-medium">
                              Password</FormLabel>
                            <FormControl>
                              <div className="relative">

                                <Input
                                  {...field}
                                  type={showPwd ? "text" : "password"}
                                  placeholder="Enter your password"
                                  className="pl-4 pr-4"
                                  autoComplete="current-password"
                                  data-testid="input-password"
                                />

                                <button
                                  type="button"
                                  onClick={() => setShowPwd((s) => !s)}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded focus:outline-none"
                                  aria-label={showPwd ? "Hide password" : "Show password"}
                                >
                                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />



                      <div>
                        <Button
                          type="submit"
                          className="
                          w-full 
                          bg-[#FE0000] 
                          border border-[#000] 
                          stroke-logo
                          hover:bg-[rgb(238,6,6)]
                          hover:border-black
                          transition-all duration-200
                          flex items-center justify-center gap-2
                        "
                          data-testid="button-login"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <svg
                                className="h-4 w-4 animate-spin text-white"
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
                              </svg>
                              <span className="text-white">Loading...</span>
                            </>
                          ) : (
                            <span className="text-white">Login</span>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>

            </div>
          </Box>
        </Box>
        <Box
          w={{ base: "0%", xl: "35%" }}
          className="hidden xl:flex"
          justifyContent="center"
          alignItems="center"
          p={{ base: 6, md: 12 }}
        >
          <div className="w-full max-w-md mx-4 z-10">
            <Card className="drop-shadow-[0_3px_8px_rgba(254,0,0,0.4)]">
              <CardHeader className="pt-6">
                <img src={Logo} alt="Detailing Devils" className="h-10 pl-4 object-contain my-4" />

                <CardTitle className="text-xl text-center">Login</CardTitle>
              </CardHeader>

              <CardContent className="px-8 pb-8">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => {
                        const hasError = !!form.formState.errors.email;
                        return (
                          <FormItem>
                            {/* force black label even when error present */}
                            <FormLabel style={{ color: "#000" }} className="text-sm font-medium">
                              Email
                            </FormLabel>

                            <FormControl>
                              <div className="relative group">


                                <Input
                                  {...field}
                                  placeholder="official@example.com"
                                  className="pl-4"
                                  data-testid="input-email"
                                  autoComplete="email"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />


                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel style={{ color: "#000" }} className="text-sm font-medium">
                            Password</FormLabel>
                          <FormControl>
                            <div className="relative">

                              <Input
                                {...field}
                                type={showPwd ? "text" : "password"}
                                placeholder="Enter your password"
                                className="pl-4 pr-4"
                                autoComplete="current-password"
                                data-testid="input-password"
                              />

                              <button
                                type="button"
                                onClick={() => setShowPwd((s) => !s)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded focus:outline-none"
                                aria-label={showPwd ? "Hide password" : "Show password"}
                              >
                                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />



                    <div>
                      <Button
                        type="submit"
                        className="
                          w-full 
                          bg-[#FE0000] 
                          border border-[#000] 
                          stroke-logo
                          hover:bg-[rgb(238,6,6)]
                          hover:border-black
                          transition-all duration-200
                          flex items-center justify-center gap-2
                        "
                        data-testid="button-login"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <svg
                              className="h-4 w-4 animate-spin text-white"
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
                            </svg>
                            <span className="text-white">Loading...</span>
                          </>
                        ) : (
                          <span className="text-white">Login</span>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

          </div>
        </Box>
      </HStack>
    </div >
  );
}
