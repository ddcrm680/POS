import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Filter, 
  X, 
  Search, 
  MapPin, 
  Users, 
  Crown, 
  Calendar,
  DollarSign,
  Target,
  RotateCcw
} from "lucide-react";

interface CustomerFilters {
  search: string;
  segment: string;
  loyaltyTier: string;
  customerSource: string;
  vipStatus: string;
  city: string;
  state: string;
  customerLifecycleStage: string;
  lastServiceDateFrom: string;
  lastServiceDateTo: string;
  lifetimeValueRange: {
    min: string;
    max: string;
  };
  totalServicesRange: {
    min: string;
    max: string;
  };
  whatsappConsent: string;
  marketingConsent: string;
}

interface CustomerFiltersSidebarProps {
  filters: CustomerFilters;
  onFiltersChange: (filters: CustomerFilters) => void;
  onClearFilters: () => void;
  className?: string;
  isOpen?: boolean;
  onToggle?: () => void;
}

export default function CustomerFiltersSidebar({ 
  filters, 
  onFiltersChange, 
  onClearFilters, 
  className = "",
  isOpen = true,
  onToggle
}: CustomerFiltersSidebarProps) {
  const [localFilters, setLocalFilters] = useState<CustomerFilters>(filters);

  const updateFilter = (key: keyof CustomerFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const updateRangeFilter = (
    rangeKey: 'lifetimeValueRange' | 'totalServicesRange',
    subKey: 'min' | 'max',
    value: string
  ) => {
    const newFilters = {
      ...localFilters,
      [rangeKey]: {
        ...localFilters[rangeKey],
        [subKey]: value
      }
    };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (localFilters.search) count++;
    if (localFilters.segment) count++;
    if (localFilters.loyaltyTier) count++;
    if (localFilters.customerSource) count++;
    if (localFilters.vipStatus) count++;
    if (localFilters.city) count++;
    if (localFilters.state) count++;
    if (localFilters.customerLifecycleStage) count++;
    if (localFilters.lastServiceDateFrom || localFilters.lastServiceDateTo) count++;
    if (localFilters.lifetimeValueRange.min || localFilters.lifetimeValueRange.max) count++;
    if (localFilters.totalServicesRange.min || localFilters.totalServicesRange.max) count++;
    if (localFilters.whatsappConsent) count++;
    if (localFilters.marketingConsent) count++;
    return count;
  };

  const handleClearFilters = () => {
    const clearedFilters: CustomerFilters = {
      search: "",
      segment: "",
      loyaltyTier: "",
      customerSource: "",
      vipStatus: "",
      city: "",
      state: "",
      customerLifecycleStage: "",
      lastServiceDateFrom: "",
      lastServiceDateTo: "",
      lifetimeValueRange: { min: "", max: "" },
      totalServicesRange: { min: "", max: "" },
      whatsappConsent: "",
      marketingConsent: ""
    };
    setLocalFilters(clearedFilters);
    onClearFilters();
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onToggle}
        className={`fixed left-4 top-1/2 transform -translate-y-1/2 z-50 ${className}`}
        data-testid="button-open-filters"
      >
        <Filter size={16} className="mr-1" />
        Filters
        {getActiveFiltersCount() > 0 && (
          <Badge variant="destructive" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
            {getActiveFiltersCount()}
          </Badge>
        )}
      </Button>
    );
  }

  return (
    <Card className={`w-80 h-fit sticky top-6 ${className}`} data-testid="sidebar-customer-filters">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter size={18} />
            Customer Filters
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary" className="text-xs">
                {getActiveFiltersCount()} active
              </Badge>
            )}
          </CardTitle>
          {onToggle && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              data-testid="button-close-filters"
            >
              <X size={16} />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Search size={14} />
            Search
          </Label>
          <Input
            placeholder="Name, phone, email..."
            value={localFilters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            data-testid="input-search-filter"
          />
        </div>

        <Separator />

        {/* Customer Segment */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Users size={14} />
            Customer Segment
          </Label>
          <Select 
            value={localFilters.segment} 
            onValueChange={(value) => updateFilter('segment', value)}
          >
            <SelectTrigger data-testid="select-segment-filter">
              <SelectValue placeholder="All segments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Segments</SelectItem>
              <SelectItem value="Premium">Premium</SelectItem>
              <SelectItem value="Regular">Regular</SelectItem>
              <SelectItem value="Budget">Budget</SelectItem>
              <SelectItem value="VIP">VIP</SelectItem>
              <SelectItem value="Corporate">Corporate</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Loyalty Tier */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Crown size={14} />
            Loyalty Tier
          </Label>
          <Select 
            value={localFilters.loyaltyTier} 
            onValueChange={(value) => updateFilter('loyaltyTier', value)}
          >
            <SelectTrigger data-testid="select-loyalty-tier-filter">
              <SelectValue placeholder="All tiers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              <SelectItem value="Bronze">Bronze</SelectItem>
              <SelectItem value="Silver">Silver</SelectItem>
              <SelectItem value="Gold">Gold</SelectItem>
              <SelectItem value="Platinum">Platinum</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Customer Source */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Target size={14} />
            Customer Source
          </Label>
          <Select 
            value={localFilters.customerSource} 
            onValueChange={(value) => updateFilter('customerSource', value)}
          >
            <SelectTrigger data-testid="select-customer-source-filter">
              <SelectValue placeholder="All sources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="Walk-in">Walk-in</SelectItem>
              <SelectItem value="Referral">Referral</SelectItem>
              <SelectItem value="Online">Online</SelectItem>
              <SelectItem value="Marketing">Marketing</SelectItem>
              <SelectItem value="Social Media">Social Media</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lifecycle Stage */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Customer Lifecycle Stage</Label>
          <Select 
            value={localFilters.customerLifecycleStage} 
            onValueChange={(value) => updateFilter('customerLifecycleStage', value)}
          >
            <SelectTrigger data-testid="select-lifecycle-stage-filter">
              <SelectValue placeholder="All stages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="At-Risk">At-Risk</SelectItem>
              <SelectItem value="Churned">Churned</SelectItem>
              <SelectItem value="Won-Back">Won-Back</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Location Filters */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <MapPin size={14} />
            Location
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">City</Label>
              <Input
                placeholder="City"
                value={localFilters.city}
                onChange={(e) => updateFilter('city', e.target.value)}
                data-testid="input-city-filter"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">State</Label>
              <Input
                placeholder="State"
                value={localFilters.state}
                onChange={(e) => updateFilter('state', e.target.value)}
                data-testid="input-state-filter"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Lifetime Value Range */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <DollarSign size={14} />
            Lifetime Value (₹)
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">Min</Label>
              <Input
                type="number"
                placeholder="0"
                value={localFilters.lifetimeValueRange.min}
                onChange={(e) => updateRangeFilter('lifetimeValueRange', 'min', e.target.value)}
                data-testid="input-ltv-min-filter"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Max</Label>
              <Input
                type="number"
                placeholder="∞"
                value={localFilters.lifetimeValueRange.max}
                onChange={(e) => updateRangeFilter('lifetimeValueRange', 'max', e.target.value)}
                data-testid="input-ltv-max-filter"
              />
            </div>
          </div>
        </div>

        {/* Total Services Range */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Total Services</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">Min</Label>
              <Input
                type="number"
                placeholder="0"
                value={localFilters.totalServicesRange.min}
                onChange={(e) => updateRangeFilter('totalServicesRange', 'min', e.target.value)}
                data-testid="input-services-min-filter"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Max</Label>
              <Input
                type="number"
                placeholder="∞"
                value={localFilters.totalServicesRange.max}
                onChange={(e) => updateRangeFilter('totalServicesRange', 'max', e.target.value)}
                data-testid="input-services-max-filter"
              />
            </div>
          </div>
        </div>

        {/* Last Service Date Range */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Calendar size={14} />
            Last Service Date
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">From</Label>
              <Input
                type="date"
                value={localFilters.lastServiceDateFrom}
                onChange={(e) => updateFilter('lastServiceDateFrom', e.target.value)}
                data-testid="input-last-service-from-filter"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">To</Label>
              <Input
                type="date"
                value={localFilters.lastServiceDateTo}
                onChange={(e) => updateFilter('lastServiceDateTo', e.target.value)}
                data-testid="input-last-service-to-filter"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* VIP Status */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Special Status</Label>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="vip-only"
                checked={localFilters.vipStatus === "true"}
                onCheckedChange={(checked) => 
                  updateFilter('vipStatus', checked ? "true" : "")
                }
                data-testid="checkbox-vip-filter"
              />
              <Label htmlFor="vip-only" className="text-sm">VIP Customers Only</Label>
            </div>
          </div>
        </div>

        {/* Communication Preferences */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Communication Consent</Label>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="whatsapp-consent"
                checked={localFilters.whatsappConsent === "true"}
                onCheckedChange={(checked) => 
                  updateFilter('whatsappConsent', checked ? "true" : "")
                }
                data-testid="checkbox-whatsapp-consent-filter"
              />
              <Label htmlFor="whatsapp-consent" className="text-sm">WhatsApp Consent</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="marketing-consent"
                checked={localFilters.marketingConsent === "true"}
                onCheckedChange={(checked) => 
                  updateFilter('marketingConsent', checked ? "true" : "")
                }
                data-testid="checkbox-marketing-consent-filter"
              />
              <Label htmlFor="marketing-consent" className="text-sm">Marketing Consent</Label>
            </div>
          </div>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearFilters}
            className="w-full"
            disabled={getActiveFiltersCount() === 0}
            data-testid="button-clear-all-filters"
          >
            <RotateCcw size={14} className="mr-2" />
            Clear All Filters
          </Button>
          
          {getActiveFiltersCount() > 0 && (
            <div className="text-center">
              <Badge variant="outline" className="text-xs">
                {getActiveFiltersCount()} filters applied
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}