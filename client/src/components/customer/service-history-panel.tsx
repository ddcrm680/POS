import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { apiRequest } from "@/lib/queryClient";
import { type Customer, type JobCard, type Vehicle } from "@/schema";
import { 
  User, 
  Phone, 
  Mail, 
  Car, 
  Clock, 
  DollarSign, 
  Star,
  ChevronDown,
  ChevronRight,
  Copy,
  CarFront,
  RotateCcw,
  Calendar,
  Loader2,
  X
} from "lucide-react";

interface ServiceHistoryPanelProps {
  customer: Customer;
  onUseLastVehicle?: (vehicle: Vehicle) => void;
  onCopyLastService?: (services: any[]) => void;
  onClose?: () => void;
  className?: string;
}

export default function ServiceHistoryPanel({ 
  customer, 
  onUseLastVehicle, 
  onCopyLastService, 
  onClose,
  className = "" 
}: ServiceHistoryPanelProps) {
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(true);
  const [showAllHistory, setShowAllHistory] = useState(false);

  // Get customer service history
  const { data: serviceHistory = [], isLoading: historyLoading } = useQuery<JobCard[]>({
    queryKey: ["/api/customers", customer.id, "job-cards"],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/customers/${customer.id}/job-cards`);
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get customer vehicles
  const { data: vehicles = [], isLoading: vehiclesLoading } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles/customer", customer.id],
    enabled: !!customer.id,
  });

  const handleUseLastVehicle = () => {
    if (vehicles.length > 0 && onUseLastVehicle) {
      // Use the most recent vehicle (first one assuming they're sorted by date)
      onUseLastVehicle(vehicles[0]);
    }
  };

  const handleCopyLastService = () => {
    if (serviceHistory.length > 0 && onCopyLastService) {
      const lastJob = serviceHistory[0]; // Most recent job
      // Convert the service type back to service items (this would need enhancement based on your service structure)
      const services = lastJob.serviceType ? [
        { 
          id: `service_${lastJob.id}`, 
          name: lastJob.serviceType, 
          price: parseFloat(lastJob.finalAmount || '0') 
        }
      ] : [];
      onCopyLastService(services);
    }
  };

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(numAmount);
  };

  const formatDate = (dateStr: string | null | undefined | Date) => {
    if (!dateStr) return 'Recent';
    try {
      const date = dateStr instanceof Date ? dateStr : new Date(dateStr);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'Recent';
    }
  };

  const visibleHistory = showAllHistory ? serviceHistory : serviceHistory.slice(0, 3);

  return (
    <Card className={`bg-green-50 border-green-200 h-fit sticky top-6 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-green-800 flex items-center gap-2">
            <User size={18} />
            Customer Found!
          </CardTitle>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              data-testid="button-close-history"
            >
              <X size={16} />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Customer Info */}
        <div className="bg-green-100 p-3 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-green-800 flex items-center gap-2">
                {customer.fullName}
                {customer.vipStatus && (
                  <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                    <Star size={12} className="mr-1" />
                    VIP
                  </Badge>
                )}
              </h4>
              <p className="text-sm text-green-700 flex items-center gap-1 mt-1">
                <Phone size={12} />
                {customer.phoneNumber}
              </p>
              {customer.email && (
                <p className="text-sm text-green-700 flex items-center gap-1">
                  <Mail size={12} />
                  {customer.email}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-green-800">
                {serviceHistory.length} previous jobs
              </p>
              <p className="text-xs text-green-600">
                {vehicles.length} registered vehicles
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <h5 className="font-medium text-sm text-gray-700">Quick Actions</h5>
          <div className="grid grid-cols-1 gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-xs justify-start"
              onClick={handleUseLastVehicle}
              disabled={vehiclesLoading || vehicles.length === 0}
              data-testid="button-use-last-vehicle"
            >
              {vehiclesLoading ? (
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              ) : (
                <CarFront className="mr-2 h-3 w-3" />
              )}
              Use Last Vehicle
              {vehicles.length > 0 && (
                <span className="ml-1 text-gray-500">
                  ({vehicles[0]?.make} {vehicles[0]?.model})
                </span>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-xs justify-start"
              onClick={handleCopyLastService}
              disabled={historyLoading || serviceHistory.length === 0}
              data-testid="button-copy-last-service"
            >
              {historyLoading ? (
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              ) : (
                <Copy className="mr-2 h-3 w-3" />
              )}
              Copy Last Service
              {serviceHistory.length > 0 && (
                <span className="ml-1 text-gray-500 truncate">
                  ({serviceHistory[0]?.serviceType?.slice(0, 20)}...)
                </span>
              )}
            </Button>
          </div>
        </div>

        <Separator />

        {/* Service History */}
        <Collapsible open={isHistoryExpanded} onOpenChange={setIsHistoryExpanded}>
          <CollapsibleTrigger className="flex items-center justify-between w-full group">
            <h5 className="font-medium text-sm text-gray-700 flex items-center gap-2">
              <Clock size={14} />
              Service History
            </h5>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              {serviceHistory.length} jobs
              {isHistoryExpanded ? (
                <ChevronDown className="h-4 w-4 group-hover:text-gray-700 transition-colors" />
              ) : (
                <ChevronRight className="h-4 w-4 group-hover:text-gray-700 transition-colors" />
              )}
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-2 mt-3">
            {historyLoading ? (
              <div className="text-center py-4">
                <Loader2 className="animate-spin mx-auto mb-2" size={20} />
                <p className="text-sm text-gray-600">Loading history...</p>
              </div>
            ) : serviceHistory.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <p className="text-sm">No previous services found</p>
              </div>
            ) : (
              <ScrollArea className="max-h-64">
                <div className="space-y-2 pr-2">
                  {visibleHistory.map((job, index) => (
                    <div 
                      key={job.id} 
                      className={`bg-white p-3 rounded-lg border transition-all hover:shadow-sm ${
                        index === 0 ? 'border-green-200' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h6 className="font-medium text-sm text-gray-800 line-clamp-1">
                              {job.serviceType}
                            </h6>
                            {index === 0 && (
                              <Badge variant="outline" className="text-xs text-green-600 border-green-300">
                                Latest
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-xs text-gray-600">
                            <span className="flex items-center gap-1">
                              <DollarSign size={10} />
                              {formatCurrency(job.finalAmount || '0')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar size={10} />
                              {formatDate(job.createdAt)}
                            </span>
                          </div>
                          
                          {job.serviceStatus && (
                            <Badge 
                              variant="outline" 
                              className="text-xs mt-1 h-5"
                            >
                              {job.serviceStatus}
                            </Badge>
                          )}
                        </div>
                        
                        {job.vehicleId && vehicles.find(v => v.id === job.vehicleId) && (
                          <div className="text-xs text-gray-500 text-right">
                            <Car size={12} className="inline mr-1" />
                            {vehicles.find(v => v.id === job.vehicleId)?.make} {vehicles.find(v => v.id === job.vehicleId)?.model}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {serviceHistory.length > 3 && !showAllHistory && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAllHistory(true)}
                      className="w-full text-xs text-gray-600 hover:text-gray-800"
                      data-testid="button-show-more-history"
                    >
                      Show {serviceHistory.length - 3} more services
                    </Button>
                  )}
                  
                  {showAllHistory && serviceHistory.length > 3 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAllHistory(false)}
                      className="w-full text-xs text-gray-600 hover:text-gray-800"
                    >
                      Show less
                    </Button>
                  )}
                </div>
              </ScrollArea>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}