import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Star,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  Car,
  Heart,
  AlertTriangle,
  Shield,
  Edit,
  MessageSquare,
  Gift,
  Target,
  Award,
  Activity,
  Clock4
} from "lucide-react";
import { type Customer } from "@/lib/types";

interface CustomerProfileHeaderProps {
  customer: Customer;
  onEditCustomer?: () => void;
  onSendMessage?: () => void;
  className?: string;
}

interface CustomerMetrics {
  lifetimeValueTrend: number;
  serviceFrequency: number;
  satisfactionScore: number;
  loyaltyPoints: number;
  churnRisk: "low" | "medium" | "high";
  nextServicePrediction: string;
  customerScore: number;
  totalReferrals: number;
}

export default function CustomerProfileHeader({ 
  customer, 
  onEditCustomer,
  onSendMessage,
  className = ""
}: CustomerProfileHeaderProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Fetch customer-specific metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery<CustomerMetrics>({
    queryKey: ["/api/customers", customer.id, "metrics"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(numAmount);
  };

  const formatDate = (dateStr: string | null | undefined | Date) => {
    if (!dateStr) return 'Never';
    try {
      const date = dateStr instanceof Date ? dateStr : new Date(dateStr);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'Invalid';
    }
  };

  const formatDateRelative = (dateStr: string | null | undefined | Date) => {
    if (!dateStr) return 'Never';
    try {
      const date = dateStr instanceof Date ? dateStr : new Date(dateStr);
      const now = new Date();
      const diffTime = now.getTime() - date.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 30) return `${diffDays} days ago`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
      return `${Math.floor(diffDays / 365)} years ago`;
    } catch {
      return 'Invalid';
    }
  };

  const getCustomerInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getLoyaltyTierConfig = (tier: string | null) => {
    switch (tier) {
      case 'Platinum':
        return {
          color: 'bg-purple-100 text-purple-800 border-purple-300',
          icon: <Award className="w-3 h-3" />,
          description: 'Platinum Elite Member'
        };
      case 'Gold':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
          icon: <Award className="w-3 h-3" />,
          description: 'Gold Premier Member'
        };
      case 'Silver':
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-300',
          icon: <Award className="w-3 h-3" />,
          description: 'Silver Member'
        };
      case 'Bronze':
        return {
          color: 'bg-orange-100 text-orange-800 border-orange-300',
          icon: <Award className="w-3 h-3" />,
          description: 'Bronze Member'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-600 border-gray-200',
          icon: <User className="w-3 h-3" />,
          description: 'Standard Member'
        };
    }
  };

  const getLifecycleStageConfig = (stage: string | null) => {
    switch (stage) {
      case 'New':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: <Star className="w-3 h-3" />,
          description: 'New Customer - Recently Acquired'
        };
      case 'Active':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: <Activity className="w-3 h-3" />,
          description: 'Active Customer - Regular Services'
        };
      case 'At-Risk':
        return {
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: <AlertTriangle className="w-3 h-3" />,
          description: 'At-Risk - Needs Attention'
        };
      case 'Churned':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: <TrendingDown className="w-3 h-3" />,
          description: 'Churned - Win-Back Required'
        };
      case 'Won-Back':
        return {
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: <TrendingUp className="w-3 h-3" />,
          description: 'Won-Back - Recently Returned'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-600 border-gray-200',
          icon: <User className="w-3 h-3" />,
          description: 'Unknown Status'
        };
    }
  };

  const getChurnRiskConfig = (risk: string) => {
    switch (risk) {
      case 'low':
        return {
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          icon: <Shield className="w-4 h-4" />,
          label: 'Low Risk'
        };
      case 'medium':
        return {
          color: 'text-orange-600',
          bgColor: 'bg-orange-100',
          icon: <AlertTriangle className="w-4 h-4" />,
          label: 'Medium Risk'
        };
      case 'high':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          icon: <AlertTriangle className="w-4 h-4" />,
          label: 'High Risk'
        };
      default:
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          icon: <Shield className="w-4 h-4" />,
          label: 'Unknown'
        };
    }
  };

  const loyaltyTier = getLoyaltyTierConfig(customer.loyaltyTier);
  const lifecycleStage = getLifecycleStageConfig(customer.customerLifecycleStage);
  const churnRisk = getChurnRiskConfig(metrics?.churnRisk || 'low');

  const customerAge = customer.createdAt ? 
    Math.floor((new Date().getTime() - new Date(customer.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Profile Card */}
      <Card className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-blue-200 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              {/* Customer Avatar */}
              <div className="relative">
                <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl font-bold">
                    {getCustomerInitials(customer.fullName)}
                  </AvatarFallback>
                </Avatar>
                {customer.vipStatus && (
                  <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1">
                    <Star className="w-4 h-4 text-yellow-800" fill="currentColor" />
                  </div>
                )}
              </div>

              {/* Customer Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl font-bold text-gray-900" data-testid="text-customer-name">
                    {customer.fullName}
                  </h1>
                  
                  {customer.vipStatus && (
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 font-medium">
                      <Star size={12} className="mr-1" fill="currentColor" />
                      VIP Customer
                    </Badge>
                  )}
                  
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge className={loyaltyTier.color}>
                        {loyaltyTier.icon}
                        <span className="ml-1">{customer.loyaltyTier || 'Bronze'}</span>
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{loyaltyTier.description}</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant="outline" className={lifecycleStage.color}>
                        {lifecycleStage.icon}
                        <span className="ml-1">{customer.customerLifecycleStage || 'New'}</span>
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{lifecycleStage.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                
                {/* Contact Information */}
                <div className="flex items-center gap-6 text-gray-600">
                  <div className="flex items-center gap-2">
                    <Phone size={16} />
                    <span className="font-medium" data-testid="text-customer-phone">
                      {customer.phoneNumber}
                    </span>
                    {customer.whatsappConsent && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                        WhatsApp
                      </Badge>
                    )}
                  </div>
                  
                  {customer.email && (
                    <div className="flex items-center gap-2">
                      <Mail size={16} />
                      <span data-testid="text-customer-email">{customer.email}</span>
                    </div>
                  )}
                  
                  {(customer.city || customer.state) && (
                    <div className="flex items-center gap-2">
                      <MapPin size={16} />
                      <span>{[customer.city, customer.state].filter(Boolean).join(', ')}</span>
                    </div>
                  )}
                </div>

                {/* Customer Timeline */}
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    <span>Customer since {formatDate(customer.createdAt)}</span>
                    <Badge variant="outline" className="text-xs">
                      {customerAge} days
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock size={14} />
                    <span>Last service {formatDateRelative(customer.lastServiceDate)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={onSendMessage}
                data-testid="button-send-message-header"
              >
                <MessageSquare size={16} className="mr-2" />
                Message
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={onEditCustomer}
                data-testid="button-edit-customer"
              >
                <Edit size={16} className="mr-2" />
                Edit
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Lifetime Value */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Lifetime Value</p>
                <p className="text-2xl font-bold text-green-600" data-testid="text-lifetime-value">
                  {formatCurrency(customer.lifetimeValue || '0')}
                </p>
                {metrics && (
                  <div className="flex items-center gap-1 text-xs">
                    {metrics.lifetimeValueTrend > 0 ? (
                      <>
                        <TrendingUp size={12} className="text-green-500" />
                        <span className="text-green-600">+{metrics.lifetimeValueTrend}%</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown size={12} className="text-red-500" />
                        <span className="text-red-600">{metrics.lifetimeValueTrend}%</span>
                      </>
                    )}
                    <span className="text-gray-500">vs last period</span>
                  </div>
                )}
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Services */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Total Services</p>
                <p className="text-2xl font-bold text-blue-600" data-testid="text-total-services">
                  {customer.totalServicesCount || 0}
                </p>
                {metrics && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock4 size={12} />
                    <span>Every {metrics.serviceFrequency} months</span>
                  </div>
                )}
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Car className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Score */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <p className="text-sm text-gray-600">Customer Score</p>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-purple-600">
                    {metrics?.customerScore || 85}%
                  </p>
                  <Progress 
                    value={metrics?.customerScore || 85} 
                    className="h-2"
                  />
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Heart size={12} />
                  <span>Satisfaction: {metrics?.satisfactionScore || 4.2}/5</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center ml-3">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Churn Risk & Health */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Account Health</p>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${churnRisk.bgColor}`}></div>
                  <span className={`text-sm font-medium ${churnRisk.color}`}>
                    {churnRisk.label}
                  </span>
                </div>
                {metrics && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Gift size={12} />
                      <span>{metrics.loyaltyPoints} points</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {metrics.totalReferrals} referrals made
                    </div>
                  </div>
                )}
              </div>
              <div className={`w-12 h-12 ${churnRisk.bgColor} rounded-full flex items-center justify-center`}>
                {churnRisk.icon}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Details Toggle */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Customer Details</CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              data-testid="button-toggle-details"
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </Button>
          </div>
        </CardHeader>
        
        {showDetails && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Customer Segment & Source */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Segment & Source</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Segment:</span>
                    <Badge variant="outline">{customer.customerSegment || 'Regular'}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Source:</span>
                    <span>{customer.customerSource || 'Walk-in'}</span>
                  </div>
                  {customer.referredBy && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Referred by:</span>
                      <span>{customer.referredBy}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Vehicle Information */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Vehicle Info</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Registered Vehicles:</span>
                    <span className="font-medium">{customer.vehicleCount || 0}</span>
                  </div>
                  {customer.preferredServiceDay && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Preferred Day:</span>
                      <span>{customer.preferredServiceDay}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Communication Preferences */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Communication</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Language:</span>
                    <span>{customer.preferredLanguage || 'English'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">WhatsApp:</span>
                    <Badge variant={customer.whatsappConsent ? "default" : "outline"}>
                      {customer.whatsappConsent ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Marketing:</span>
                    <Badge variant={customer.marketingConsent ? "default" : "outline"}>
                      {customer.marketingConsent ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Address Information */}
            {customer.address && (
              <div className="pt-4 border-t">
                <h4 className="font-medium text-gray-900 mb-2">Address</h4>
                <p className="text-sm text-gray-600">{customer.address}</p>
                {customer.pincode && (
                  <p className="text-sm text-gray-600">PIN: {customer.pincode}</p>
                )}
              </div>
            )}

            {/* Next Service Prediction */}
            {metrics?.nextServicePrediction && (
              <div className="pt-4 border-t">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-900">Next Service Prediction</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Based on service history, next service likely on {formatDate(metrics.nextServicePrediction)}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}