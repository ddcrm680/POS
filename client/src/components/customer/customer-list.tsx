import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Search,
  Filter, 
  SortAsc, 
  SortDesc, 
  Eye, 
  Phone, 
  Mail, 
  MapPin,
  Calendar,
  DollarSign,
  Star,
  User,
  Plus,
  Download
} from "lucide-react";
import { type Customer } from "@/lib/types";

interface CustomerListResponse {
  customers: Customer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface CustomerListProps {
  className?: string;
  onCustomerSelect?: (customer: Customer) => void;
  selectedCustomerId?: string;
}

interface CustomerFilters {
  search: string;
  segment: string;
  loyaltyTier: string;
  customerSource: string;
  vipStatus: string;
  city: string;
  state: string;
  customerLifecycleStage: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

export default function CustomerList({ 
  className = "", 
  onCustomerSelect,
  selectedCustomerId 
}: CustomerListProps) {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [filters, setFilters] = useState<CustomerFilters>({
    search: "",
    segment: "",
    loyaltyTier: "",
    customerSource: "",
    vipStatus: "",
    city: "",
    state: "",
    customerLifecycleStage: "",
    sortBy: "fullName",
    sortOrder: "asc"
  });

  // Build query parameters
  const queryParams = useMemo(() => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder
    });

    // Add non-empty filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && key !== 'sortBy' && key !== 'sortOrder') {
        params.append(key, value);
      }
    });

    return params.toString();
  }, [page, limit, filters]);

  const { data, isLoading, error } = useQuery<CustomerListResponse>({
    queryKey: ["/api/customers/list", queryParams],
    queryFn: async () => {
      const response = await fetch(`/api/customers/list?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch customers');
      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getLoyaltyTierColor = (tier: string | null) => {
    switch (tier) {
      case 'Platinum': return 'bg-purple-100 text-purple-800';
      case 'Gold': return 'bg-yellow-100 text-yellow-800';
      case 'Silver': return 'bg-gray-100 text-gray-800';
      case 'Bronze': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getLifecycleStageColor = (stage: string | null) => {
    switch (stage) {
      case 'New': return 'bg-blue-100 text-blue-800';
      case 'Active': return 'bg-green-100 text-green-800';
      case 'At-Risk': return 'bg-orange-100 text-orange-800';
      case 'Churned': return 'bg-red-100 text-red-800';
      case 'Won-Back': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const handleFilterChange = (key: keyof CustomerFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page when filtering
  };

  const handleSort = (column: string) => {
    setFilters(prev => ({
      ...prev,
      sortBy: column,
      sortOrder: prev.sortBy === column && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      segment: "",
      loyaltyTier: "",
      customerSource: "",
      vipStatus: "",
      city: "",
      state: "",
      customerLifecycleStage: "",
      sortBy: "fullName",
      sortOrder: "asc"
    });
    setPage(1);
  };

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Failed to load customers. Please try again later.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User size={20} />
            Customer List
            {data && (
              <Badge variant="outline" className="ml-2">
                {data.total} customers
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" data-testid="button-export">
              <Download size={16} className="mr-1" />
              Export
            </Button>
            <Button size="sm" data-testid="button-add-customer">
              <Plus size={16} className="mr-1" />
              Add Customer
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="space-y-4">
          {/* Search and quick filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="Search customers by name, phone, or email..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
                data-testid="input-search-customers"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filters.segment} onValueChange={(value) => handleFilterChange('segment', value)}>
                <SelectTrigger className="w-40" data-testid="select-segment">
                  <SelectValue placeholder="Segment" />
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

              <Select value={filters.loyaltyTier} onValueChange={(value) => handleFilterChange('loyaltyTier', value)}>
                <SelectTrigger className="w-32" data-testid="select-loyalty-tier">
                  <SelectValue placeholder="Tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="Bronze">Bronze</SelectItem>
                  <SelectItem value="Silver">Silver</SelectItem>
                  <SelectItem value="Gold">Gold</SelectItem>
                  <SelectItem value="Platinum">Platinum</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.vipStatus} onValueChange={(value) => handleFilterChange('vipStatus', value)}>
                <SelectTrigger className="w-32" data-testid="select-vip-status">
                  <SelectValue placeholder="VIP" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">VIP Only</SelectItem>
                  <SelectItem value="false">Non-VIP</SelectItem>
                </SelectContent>
              </Select>

              {Object.values(filters).some(Boolean) && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearFilters}
                  data-testid="button-clear-filters"
                >
                  <Filter size={16} className="mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSort('fullName')}
                    className="h-auto p-0 font-medium"
                    data-testid="sort-name"
                  >
                    Customer
                    {filters.sortBy === 'fullName' && (
                      filters.sortOrder === 'asc' ? <SortAsc className="ml-1 h-4 w-4" /> : <SortDesc className="ml-1 h-4 w-4" />
                    )}
                  </Button>
                </TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Tier & Status</TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSort('lifetimeValue')}
                    className="h-auto p-0 font-medium"
                    data-testid="sort-lifetime-value"
                  >
                    Lifetime Value
                    {filters.sortBy === 'lifetimeValue' && (
                      filters.sortOrder === 'asc' ? <SortAsc className="ml-1 h-4 w-4" /> : <SortDesc className="ml-1 h-4 w-4" />
                    )}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSort('lastServiceDate')}
                    className="h-auto p-0 font-medium"
                    data-testid="sort-last-service"
                  >
                    Last Service
                    {filters.sortBy === 'lastServiceDate' && (
                      filters.sortOrder === 'asc' ? <SortAsc className="ml-1 h-4 w-4" /> : <SortDesc className="ml-1 h-4 w-4" />
                    )}
                  </Button>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                  </TableRow>
                ))
              ) : data?.customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="text-muted-foreground">
                      <User className="mx-auto h-12 w-12 mb-4 opacity-50" />
                      <p className="text-lg font-medium">No customers found</p>
                      <p className="text-sm">Try adjusting your search criteria</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data?.customers.map((customer, index) => (
                  <TableRow 
                    key={customer.id}
                    className={`cursor-pointer hover:bg-muted/50 ${
                      selectedCustomerId === customer.id ? 'bg-muted' : ''
                    }`}
                    onClick={() => onCustomerSelect?.(customer)}
                    data-testid={`row-customer-${customer.id}`}
                  >
                    <TableCell className="font-medium">
                      {(page - 1) * limit + index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(customer.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium" data-testid={`text-customer-name-${customer.id}`}>
                              {customer.fullName}
                            </span>
                            {customer.vipStatus && (
                              <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                                <Star size={10} className="mr-1" />
                                VIP
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {customer.customerSegment || 'Regular'} • {customer.vehicleCount || 0} vehicles
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Phone size={12} />
                          {customer.phoneNumber}
                        </div>
                        {customer.email && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Mail size={12} />
                            {customer.email}
                          </div>
                        )}
                        {(customer.city || customer.state) && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin size={12} />
                            {[customer.city, customer.state].filter(Boolean).join(', ')}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <Badge className={getLoyaltyTierColor(customer.loyaltyTier)}>
                          {customer.loyaltyTier || 'Bronze'}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={getLifecycleStageColor(customer.customerLifecycleStage)}
                        >
                          {customer.customerLifecycleStage || 'New'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium" data-testid={`text-ltv-${customer.id}`}>
                          {formatCurrency(customer.lifetimeValue || '0')}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {customer.totalServicesCount || 0} services
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar size={12} />
                          {formatDate(customer.lastServiceDate)}
                        </div>
                        {customer.nextServicePrediction && (
                          <div className="text-xs text-muted-foreground">
                            Next: {formatDate(customer.nextServicePrediction)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `/customers/${customer.id}`;
                        }}
                        data-testid={`button-view-${customer.id}`}
                      >
                        <Eye size={14} className="mr-1" />
                        View Profile
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, data.total)} of {data.total} customers
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setPage(Math.max(1, page - 1))}
                    className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(data.totalPages - 4, page - 2)) + i;
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        onClick={() => setPage(pageNum)}
                        isActive={pageNum === page}
                        className="cursor-pointer"
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setPage(Math.min(data.totalPages, page + 1))}
                    className={page === data.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
}