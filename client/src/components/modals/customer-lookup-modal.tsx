import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Search, Phone, Star } from "lucide-react";
import { Customer } from "../../lib/types";

interface CustomerLookupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCustomerSelect?: (customer: Customer) => void;
}

export default function CustomerLookupModal({ open, onOpenChange, onCustomerSelect }: CustomerLookupModalProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  
  const { data: customer, isLoading, error }:any = {
    data: undefined,
    isLoading: false,
    error: null
  }; // Dummy values to avoid errors
  //  useQuery<Customer>({
  //   queryKey: ["/api/customers/phone", phoneNumber],
  //   enabled: phoneNumber.length >= 10,
  //   retry: false,
  // });

  const handlePhoneChange = (value: string) => {
    // Remove non-numeric characters and limit to 10 digits
    const cleaned = value.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(cleaned);
  };

  const handleCustomerSelect = () => {
    if (customer && onCustomerSelect) {
      onCustomerSelect(customer);
      onOpenChange(false);
      setPhoneNumber("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search size={20} />
            Customer Lookup
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3">
          <div>
            <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                id="phone"
                type="tel"
                placeholder="+91 98765 43210"
                value={phoneNumber}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className="pl-10"
                data-testid="input-phone-lookup"
              />
            </div>
          </div>

          {/* Customer Details */}
          {isLoading && phoneNumber.length >= 10 && (
            <Card>
              <CardContent className="p-3">
                <p className="text-sm text-muted-foreground">Searching for customer...</p>
              </CardContent>
            </Card>
          )}

          {error && phoneNumber.length >= 10 && (
            <Card>
              <CardContent className="p-3">
                <p className="text-sm text-muted-foreground">
                  Customer not found. Would you like to create a new customer?
                </p>
                <Button className="mt-2 h-12" data-testid="button-create-customer">
                  Create New Customer
                </Button>
              </CardContent>
            </Card>
          )}

          {customer && (
            <Card className="border-primary/20">
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{customer.fullName}</h4>
                      {customer.vipStatus && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Star size={12} className="mr-1" />
                          VIP
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Phone: {customer.phoneNumber}
                    </p>
                    {customer.email && (
                      <p className="text-sm text-muted-foreground">
                        Email: {customer.email}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Lifetime Value: ₹{Number(customer.lifetimeValue).toLocaleString()}
                    </p>
                  </div>
                  <Button 
                    onClick={handleCustomerSelect}
                    data-testid="button-select-customer"
                  >
                    Select Customer
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
