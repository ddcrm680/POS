import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  CreditCard, 
  Banknote, 
  Smartphone, 
  Search, 
  Receipt, 
  CheckCircle,
  Clock,
  Car,
  User,
  DollarSign
} from "lucide-react";

interface JobCard {
  id: string;
  customerId: string;
  vehicleInfo: string;
  customerName: string;
  phoneNumber: string;
  serviceType: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: string;
  createdAt: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: any;
  color: string;
}

const paymentMethods: PaymentMethod[] = [
  { id: 'cash', name: 'Cash', icon: Banknote, color: 'bg-green-500' },
  { id: 'card', name: 'Card', icon: CreditCard, color: 'bg-blue-500' },
  { id: 'upi', name: 'UPI', icon: Smartphone, color: 'bg-purple-500' },
];

export default function CashierPaymentSystem() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJobCard, setSelectedJobCard] = useState<JobCard | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [cashReceived, setCashReceived] = useState<string>("");
  const { toast } = useToast();

  // Fetch job cards ready for payment (billing status)
 const { data: jobCards = [], isLoading } = useQuery<JobCard[]>({
  queryKey: ['/api/job-cards?status=billing'],
  queryFn: async () => {
    const res = await fetch('/api/job-cards?status=billing');
    if (!res.ok) throw new Error('Failed to fetch job cards');
    return res.json() as Promise<JobCard[]>;
  },
  enabled: true
});
  // Process payment mutation
  const processPaymentMutation = useMutation({
    mutationFn: (paymentData: any) => apiRequest('POST','/api/payments', JSON.stringify(paymentData)),
    onSuccess: () => {
      toast({ title: "Payment processed successfully!" });
      setSelectedJobCard(null);
      setSelectedPaymentMethod("");
      setPaymentAmount("");
      setCashReceived("");
      queryClient.invalidateQueries({ queryKey: ['/api/job-cards'] });
    },
    onError: () => {
      toast({ title: "Payment processing failed", variant: "destructive" });
    }
  });

  const filteredJobCards = jobCards.filter((card: JobCard) =>
    card.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.phoneNumber.includes(searchTerm) ||
    card.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateChange = () => {
    if (selectedPaymentMethod === 'cash' && cashReceived && paymentAmount) {
      return parseFloat(cashReceived) - parseFloat(paymentAmount);
    }
    return 0;
  };

  const processPayment = () => {
    if (!selectedJobCard || !selectedPaymentMethod || !paymentAmount) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (amount <= 0 || amount > selectedJobCard.remainingAmount) {
      toast({ title: "Invalid payment amount", variant: "destructive" });
      return;
    }

    if (selectedPaymentMethod === 'cash') {
      const received = parseFloat(cashReceived);
      if (received < amount) {
        toast({ title: "Cash received is less than payment amount", variant: "destructive" });
        return;
      }
    }

    processPaymentMutation.mutate({
      jobCardId: selectedJobCard.id,
      paymentMethod: selectedPaymentMethod,
      amount: amount,
      cashReceived: selectedPaymentMethod === 'cash' ? parseFloat(cashReceived) : amount,
      processedBy: "manager"
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Payment Processing</h2>
          <p className="text-muted-foreground">Select job card and process customer payments</p>
        </div>
        <div className="flex items-center gap-2">
          <Receipt className="h-6 w-6 text-blue-600" />
          <span className="text-lg font-semibold text-blue-600">Cashier Terminal</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Job Cards Selection */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Select Job Card
            </CardTitle>
            <div className="relative">
              <Input
                placeholder="Search by customer name, phone, or job card ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-4"
                data-testid="input-search-jobcard"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="text-center py-8">Loading job cards...</div>
              ) : filteredJobCards.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No job cards ready for payment
                </div>
              ) : (
                filteredJobCards.map((card: JobCard) => (
                  <Card 
                    key={card.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedJobCard?.id === card.id 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
                        : 'hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedJobCard(card)}
                    data-testid={`card-jobcard-${card.id}`}
                  >
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-semibold text-sm">{card.id}</div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="h-3 w-3" />
                            {card.customerName}
                          </div>
                        </div>
                        <Badge variant={card.remainingAmount > 0 ? "destructive" : "default"}>
                          {card.remainingAmount > 0 ? "Pending" : "Paid"}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1">
                          <Car className="h-3 w-3" />
                          {card.vehicleInfo}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          ₹{card.remainingAmount.toLocaleString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Processing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Process Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {selectedJobCard ? (
              <>
                {/* Selected Job Card Summary */}
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <h3 className="font-semibold mb-2">Job Card Details</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">ID:</span> {selectedJobCard.id}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Customer:</span> {selectedJobCard.customerName}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Service:</span> {selectedJobCard.serviceType}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Vehicle:</span> {selectedJobCard.vehicleInfo}
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Amount Due:</span> 
                      <span className="font-bold text-red-600 ml-2">
                        ₹{selectedJobCard.remainingAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div>
                  <Label className="text-base font-medium">Payment Method</Label>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    {paymentMethods.map((method) => {
                      const IconComponent = method.icon;
                      return (
                        <Card
                          key={method.id}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            selectedPaymentMethod === method.id
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                              : 'hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedPaymentMethod(method.id)}
                          data-testid={`button-payment-${method.id}`}
                        >
                          <CardContent className="p-3 text-center">
                            <div className={`w-8 h-8 rounded-full ${method.color} flex items-center justify-center mx-auto mb-2`}>
                              <IconComponent className="h-4 w-4 text-white" />
                            </div>
                            <div className="text-sm font-medium">{method.name}</div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                {/* Payment Amount */}
                <div>
                  <Label htmlFor="payment-amount" className="text-base font-medium">Payment Amount</Label>
                  <Input
                    id="payment-amount"
                    type="number"
                    placeholder="Enter amount"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    max={selectedJobCard.remainingAmount}
                    className="mt-2"
                    data-testid="input-payment-amount"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>Max: ₹{selectedJobCard.remainingAmount.toLocaleString()}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPaymentAmount(selectedJobCard.remainingAmount.toString())}
                      data-testid="button-full-payment"
                    >
                      Full Payment
                    </Button>
                  </div>
                </div>

                {/* Cash Received (if cash payment) */}
                {selectedPaymentMethod === 'cash' && (
                  <div>
                    <Label htmlFor="cash-received" className="text-base font-medium">Cash Received</Label>
                    <Input
                      id="cash-received"
                      type="number"
                      placeholder="Enter cash received"
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                      className="mt-2"
                      data-testid="input-cash-received"
                    />
                    {calculateChange() > 0 && (
                      <div className="mt-2 p-2 bg-green-50 dark:bg-green-950 rounded text-sm">
                        <span className="font-medium">Change to return: </span>
                        <span className="font-bold text-green-600">₹{calculateChange().toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                )}

                <Separator />

                {/* Process Payment Button */}
                <Button
                  onClick={processPayment}
                  disabled={processPaymentMutation.isPending}
                  className="w-full"
                  size="lg"
                  data-testid="button-process-payment"
                >
                  {processPaymentMutation.isPending ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Process Payment
                    </>
                  )}
                </Button>
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a job card to process payment</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}