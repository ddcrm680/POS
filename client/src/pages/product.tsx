// src/components/profile/password.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {CustomerAnalyticsOverview} from '@/schema'
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { PasswordForm, passwordSchema } from "@/schema";
import { UpdatePassword } from "@/lib/api";
import { Box } from "@chakra-ui/react";
import { Eye, EyeOff } from "lucide-react";

export default function Product() {
 const { data: analytics, isLoading, error } = useQuery<CustomerAnalyticsOverview>({
    queryKey: ["/api/customers/analytics/overview"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (error || !analytics) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 `}>
        <Card className="col-span-full">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No product data available
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card className="w-full ">
      <CardContent>
      </CardContent>
    </Card>
  );
}
