// src/pages/login.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Employee from '@/lib/images/employee.png'
import JobCard from '@/lib/images/job-card.png'
import { toast as toastRaw, useToast } from "@/hooks/use-toast";
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
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Box, HStack, VStack, Image as ChakraImage } from "@chakra-ui/react";

// Zod schema (same as you had)
const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
});
type LoginFormValues = z.infer<typeof loginSchema>;

const LOGO_URL = "https://mycrm.detailingdevils.com/assets/images/logo.png";

export default function LoginPage() {
  const [showPwd, setShowPwd] = useState(false);
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormValues) => {
      await new Promise((r) => setTimeout(r, 800));
      if (data.email !== "admin@example.com" || data.password !== "Admin@123") {
        throw new Error("Invalid credentials");
      }
      return { token: "demo-token", user: { name: "Admin" } };
    },
    onSuccess: (payload) => {
      toast({ title: "Logged in", description: "Welcome back — redirecting..." });
    },
    onError: (err: any) => {
      toast({ title: "Login failed", description: err?.message ?? "Unable to login", variant: "destructive" });
    },
  });

  const onSubmit = (data: LoginFormValues) => loginMutation.mutate(data);

  return (
    <div className="min-h-screen bg-white">
      {/* Main content: left images, right login */}
    <HStack
      gap={0}
      align="stretch"
      className="w-full h-screen"  // <-- this makes HStack full height
    >        {/* LEFT: stacked images area */}
          <Box
            w={{ base: "100%", md: "60%" }}
            display="flex"
            justifyContent="center"
            alignItems="center"
            className="relative hidden md:flex" // hide on small screens (form will be full width then)
            style={{ borderRight: "1px solid rgba(226,232,240,0.8)" }}
          >
            {/* background / bottom image (full area) */}
            <div className="w-full h-full relative overflow-hidden bg-[#eff6ff]">
                 <div
                style={{
                  position: "absolute",
                      left:' -0%',
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
                style={{ filter: "saturate(1.05) contrast(0.95)",width:"100%",height:"100%", objectFit:"cover" }}
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
          <Box
            w={{ base: "100%", md: "40%" }}
            display="flex"
            justifyContent="center"
            alignItems="center"
            p={{ base: 6, md: 12 }}
          >
            <div className="w-full max-w-md mx-4 z-10">
              <Card className="shadow-xl">
                <CardHeader className="pt-6">
                    <img src={LOGO_URL} alt="Detailing Devils" className="h-10 pl-4 object-contain my-4" />
      
                  <CardTitle className="text-xl text-center">Login</CardTitle>
                </CardHeader>

                <CardContent className="px-8 pb-8">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                        <Button type="submit" className="w-full bg-[#FE0000] border border-[#000] stroke-logo" data-testid="button-login">
                          <p>Login</p>
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>

            </div>
          </Box>
        </HStack>
    </div>
  );
}
