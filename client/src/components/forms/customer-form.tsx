import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {  type InsertCustomer, type Customer } from "@/lib/types";
import { Loader2, User, Phone, Mail, Star } from "lucide-react";
import { InsertCustomerSchema } from "@/lib/schema";

interface CustomerFormProps {
  customer?: Customer;
  onSuccess?: (customer: Customer) => void;
  onCancel?: () => void;
}

const customerFormSchema = InsertCustomerSchema.extend({
  phoneNumber: InsertCustomerSchema.shape.phoneNumber.refine(
    (val) => /^\d{10}$/.test(val.replace(/\D/g, '')),
    { message: "Phone number must be 10 digits" }
  ),
});

export default function CustomerForm({ customer, onSuccess, onCancel }: CustomerFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<any>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      fullName: customer?.fullName || "",
      phoneNumber: customer?.phoneNumber || "",
      email: customer?.email || "",
      whatsappConsent: customer?.whatsappConsent ?? false,
      vipStatus: customer?.vipStatus ?? false,
      lifetimeValue: customer?.lifetimeValue || "0.00",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertCustomer) => {
      const response = await apiRequest("POST", "/api/customers", data);
      return response.json();
    },
    onSuccess: (newCustomer) => {
      toast({
        title: "Success",
        description: "Customer created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      onSuccess?.(newCustomer);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create customer",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<InsertCustomer>) => {
      if (!customer?.id) throw new Error("Customer ID is required");
      const response = await apiRequest("PUT", `/api/customers/${customer.id}`, data);
      return response.json();
    },
    onSuccess: (updatedCustomer) => {
      toast({
        title: "Success",
        description: "Customer updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      onSuccess?.(updatedCustomer);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update customer",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (data: InsertCustomer) => {
    setIsSubmitting(true);
    try {
      // Clean phone number - remove any non-digits
      const cleanedData = {
        ...data,
        phoneNumber: data.phoneNumber.replace(/\D/g, ''),
        lifetimeValue: data.lifetimeValue || "0.00",
      };

      if (customer) {
        await updateMutation.mutateAsync(cleanedData);
      } else {
        await createMutation.mutateAsync(cleanedData);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhoneChange = (value: string) => {
    // Format phone number as user types
    const digits = value.replace(/\D/g, '');
    let formatted = digits;
    
    if (digits.length >= 6) {
      formatted = `${digits.slice(0, 5)} ${digits.slice(5, 10)}`;
    }
    
    return formatted;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User size={20} />
          {customer ? 'Edit Customer' : 'New Customer'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter customer's full name"
                        {...field}
                        data-testid="input-full-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                        <Input
                          placeholder="98765 43210"
                          {...field}
                          onChange={(e) => {
                            const formatted = handlePhoneChange(e.target.value);
                            field.onChange(formatted);
                          }}
                          maxLength={11}
                          className="pl-10"
                          data-testid="input-phone-number"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                        <Input
                          type="email"
                          placeholder="customer@example.com"
                          {...field}
                          value={field.value || ""}
                          className="pl-10"
                          data-testid="input-email"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lifetimeValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lifetime Value (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                        value={field.value || "0.00"}
                        data-testid="input-lifetime-value"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-3">
              <FormField
                control={form.control}
                name="whatsappConsent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-whatsapp-consent"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>WhatsApp Communication Consent</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Customer agrees to receive service updates and promotional messages via WhatsApp
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vipStatus"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-vip-status"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="flex items-center gap-2">
                        <Star size={14} />
                        VIP Customer Status
                      </FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Provides special discounts and priority service
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                disabled={isSubmitting}
                data-testid="button-submit"
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {customer ? 'Update Customer' : 'Create Customer'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
