import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { InsertCustomerSchema, type Customer } from "@/schema";
import { Loader2, User, Phone, Mail, CheckCircle, X } from "lucide-react";
import { z } from "zod";

interface InlineCustomerFormProps {
  phoneNumber: string;
  onSuccess: (customer: Customer) => void;
  onCancel: () => void;
  className?: string;
}

// Simplified schema for inline customer creation
const inlineCustomerSchema = InsertCustomerSchema.pick({
  fullName: true,
  phoneNumber: true,
  email: true,
}).extend({
  phoneNumber: z.string().min(10, "Valid phone number required"),
  email: z.string().email().optional().or(z.literal("")),
});

type InlineCustomerData = z.infer<typeof inlineCustomerSchema>;

export default function InlineCustomerForm({ 
  phoneNumber, 
  onSuccess, 
  onCancel, 
  className = "" 
}: InlineCustomerFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InlineCustomerData>({
    resolver: zodResolver(inlineCustomerSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: phoneNumber.replace(/\D/g, ''),
      email: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InlineCustomerData) => {
      const customerData = {
        ...data,
        phoneNumber: data.phoneNumber.replace(/\D/g, ''),
        whatsappConsent: true, // Default to true for POS workflow
        vipStatus: false,
        lifetimeValue: "0.00",
      };

      const response = await apiRequest("POST", "/api/customers", customerData);
      return response.json();
    },
    onSuccess: (newCustomer) => {
      toast({
        title: "Success!",
        description: "Customer created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      onSuccess(newCustomer);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create customer",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (data: InlineCustomerData) => {
    setIsSubmitting(true);
    try {
      await createMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhoneChange = (value: string) => {
    // Format phone number as user types (allow only digits)
    const digits = value.replace(/\D/g, '');
    return digits.slice(0, 10); // Limit to 10 digits
  };

  return (
    <Card className={`bg-blue-50 border-blue-200 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-blue-800 flex items-center gap-2">
            <User size={18} />
            New Customer Details
          </CardTitle>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
            data-testid="button-cancel-inline-customer"
          >
            <X size={16} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Phone Number (Read-only, auto-filled) */}
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600" size={16} />
                        <Input
                          {...field}
                          readOnly
                          className="pl-10 bg-blue-100 border-blue-300 text-blue-800 font-medium"
                          data-testid="input-inline-phone"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Full Name */}
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
                        className="focus:ring-blue-500 focus:border-blue-500"
                        data-testid="input-inline-fullname"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Email (Full width, optional) */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address (Optional)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <Input
                        type="email"
                        placeholder="customer@example.com"
                        {...field}
                        className="pl-10 focus:ring-blue-500 focus:border-blue-500"
                        data-testid="input-inline-email"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
                className="border-gray-300"
                data-testid="button-cancel-customer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
                data-testid="button-create-customer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Create Customer & Continue
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>

        {/* Helpful note */}
        <div className="mt-4 p-3 bg-blue-100 rounded-lg">
          <p className="text-sm text-blue-700">
            ℹ️ Customer will be created with default settings. You can edit details later from the customer management page.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}