import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Plus, Minus, Search, Filter, Package, AlertTriangle, CheckCircle, RefreshCw, Truck, DollarSign, TrendingUp, BarChart3, Edit, Calendar, MapPin, Box } from "lucide-react";
import POSLayout from "@/components/layout/pos-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface InventoryItem {
  id: string;
  itemCode: string;
  itemName: string;
  category: string;
  currentStock: string;
  minStockLevel: string;
  maxStockLevel: string;
  unitPrice: string;
  unit: string;
  supplier?: string;
  storageLocation?: string;
  expiryDate?: string;
  isActive: boolean;
  averageCostPerUnit?: string;
  totalValueAtCost?: string;
}

interface InventoryMetrics {
  totalItems: number;
  lowStockItems: number;
  criticalStockItems: number;
  expiringItems: number;
  totalValue: number;
  recentTransactions: number;
}

interface ShipmentItem {
  itemId: string;
  quantity: number;
  unitCost: number;
  batchNumber?: string;
  expiryDate?: string;
}

export default function Inventory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [stockAdjustment, setStockAdjustment] = useState("");
  const [adjustmentReason, setAdjustmentReason] = useState("");
  const [shipmentItems, setShipmentItems] = useState<ShipmentItem[]>([]);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const { toast } = useToast();

  const ITEMS_PER_PAGE = 12; // 4x3 grid to fit tablet screen without scrolling

  // Main inventory query
  const { data: inventoryItems = [], isLoading, refetch } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory", { 
      category: selectedCategory !== "all" ? selectedCategory : undefined, 
      [filterType]: filterType !== "all" ? "true" : undefined 
    }],
    refetchInterval: 30000, // Refresh every 30 seconds for real-time updates
  });

  // Dashboard metrics
  const { data: metrics } = useQuery<InventoryMetrics>({
    queryKey: ["/api/inventory/dashboard-metrics"],
    refetchInterval: 30000,
  });

  // Quick stock update mutation
  const updateStockMutation = useMutation({
    mutationFn: async ({ itemId, quantity, transactionType, notes }: { 
      itemId: string; 
      quantity: number; 
      transactionType: string; 
      notes?: string 
    }) =>
      apiRequest(`/api/inventory/${itemId}/stock`, "PUT", { quantity, transactionType, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/dashboard-metrics"] });
      toast({ title: "Stock updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update stock", variant: "destructive" });
    },
  });

  // Stock adjustment mutation
  const adjustStockMutation = useMutation({
    mutationFn: async ({ itemId, newStock, reason }: { 
      itemId: string; 
      newStock: number; 
      reason: string 
    }) =>
      apiRequest(`/api/inventory/${itemId}/adjust`, "PUT", { 
        newStock, 
        reason, 
        performedBy: "Manager" 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/dashboard-metrics"] });
      setSelectedItem(null);
      setStockAdjustment("");
      setAdjustmentReason("");
      toast({ title: "Stock adjusted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to adjust stock", variant: "destructive" });
    },
  });

  // Receive shipment mutation
  const receiveShipmentMutation = useMutation({
    mutationFn: async (shipmentData: ShipmentItem[]) =>
      apiRequest("/api/inventory/receive-shipment", "POST", { shipmentData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/dashboard-metrics"] });
      setShipmentItems([]);
      setShowReceiveModal(false);
      toast({ title: "Shipment received successfully" });
    },
    onError: () => {
      toast({ title: "Failed to receive shipment", variant: "destructive" });
    },
  });

  const getStockStatus = (item: InventoryItem) => {
    const current = Number(item.currentStock);
    const min = Number(item.minStockLevel);
    
    if (current <= min * 0.5) return { 
      status: "critical", 
      color: "bg-red-500", 
      textColor: "text-red-700", 
      bgColor: "bg-red-50 dark:bg-red-950/20",
      borderColor: "border-red-200 dark:border-red-800"
    };
    if (current <= min) return { 
      status: "low", 
      color: "bg-yellow-500", 
      textColor: "text-yellow-700", 
      bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
      borderColor: "border-yellow-200 dark:border-yellow-800"
    };
    return { 
      status: "good", 
      color: "bg-green-500", 
      textColor: "text-green-700", 
      bgColor: "bg-green-50 dark:bg-green-950/20",
      borderColor: "border-green-200 dark:border-green-800"
    };
  };

  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.itemCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const paginatedItems = filteredItems.slice(
    currentPage * ITEMS_PER_PAGE, 
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const categories = Array.from(new Set(inventoryItems.map(item => item.category)));

  const quickAdjust = (item: InventoryItem, change: number) => {
    updateStockMutation.mutate({
      itemId: item.id,
      quantity: change,
      transactionType: change > 0 ? "manual_add" : "manual_remove",
      notes: `Quick adjustment: ${change > 0 ? "+" : ""}${change} ${item.unit}`
    });
  };

  const handleStockAdjustment = () => {
    if (!selectedItem || !stockAdjustment || !adjustmentReason) return;
    
    adjustStockMutation.mutate({
      itemId: selectedItem.id,
      newStock: Number(stockAdjustment),
      reason: adjustmentReason
    });
  };

  const addShipmentItem = () => {
    setShipmentItems([...shipmentItems, {
      itemId: "",
      quantity: 0,
      unitCost: 0,
      batchNumber: "",
      expiryDate: ""
    }]);
  };

  const updateShipmentItem = (index: number, field: keyof ShipmentItem, value: any) => {
    const updated = [...shipmentItems];
    updated[index] = { ...updated[index], [field]: value };
    setShipmentItems(updated);
  };

  const removeShipmentItem = (index: number) => {
    setShipmentItems(shipmentItems.filter((_, i) => i !== index));
  };

  const handleReceiveShipment = () => {
    const validItems = shipmentItems.filter(item => 
      item.itemId && item.quantity > 0 && item.unitCost > 0
    );
    
    if (validItems.length === 0) {
      toast({ title: "Please add at least one valid item", variant: "destructive" });
      return;
    }

    receiveShipmentMutation.mutate(validItems);
  };

  return (
    <>
      <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
        {/* Fixed Header with Metrics */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory Management</h1>
              <p className="text-gray-600 dark:text-gray-400">Real-time stock tracking and management</p>
            </div>
            <div className="flex gap-2">
              <Dialog open={showReceiveModal} onOpenChange={setShowReceiveModal}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" data-testid="button-receive-inventory">
                    <Truck className="w-4 h-4 mr-2" />
                    Receive Inventory
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Receive Inventory Shipment</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {shipmentItems.map((item, index) => (
                      <div key={index} className="grid grid-cols-6 gap-4 p-4 border rounded-lg">
                        <div>
                          <Label>Item</Label>
                          <Select 
                            value={item.itemId} 
                            onValueChange={(value) => updateShipmentItem(index, "itemId", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select item" />
                            </SelectTrigger>
                            <SelectContent>
                              {inventoryItems.map(inv => (
                                <SelectItem key={inv.id} value={inv.id}>
                                  {inv.itemName} ({inv.itemCode})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateShipmentItem(index, "quantity", Number(e.target.value))}
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <Label>Unit Cost (₹)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.unitCost}
                            onChange={(e) => updateShipmentItem(index, "unitCost", Number(e.target.value))}
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <Label>Batch #</Label>
                          <Input
                            value={item.batchNumber}
                            onChange={(e) => updateShipmentItem(index, "batchNumber", e.target.value)}
                            placeholder="Optional"
                          />
                        </div>
                        <div>
                          <Label>Expiry Date</Label>
                          <Input
                            type="date"
                            value={item.expiryDate}
                            onChange={(e) => updateShipmentItem(index, "expiryDate", e.target.value)}
                          />
                        </div>
                        <div className="flex items-end">
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => removeShipmentItem(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <Button onClick={addShipmentItem} variant="outline">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Item
                      </Button>
                      <Button 
                        onClick={handleReceiveShipment}
                        disabled={receiveShipmentMutation.isPending}
                        className="ml-auto"
                      >
                        {receiveShipmentMutation.isPending ? "Receiving..." : "Receive Shipment"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Button onClick={() => refetch()} variant="outline" size="sm" data-testid="button-refresh-inventory">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Metrics Dashboard */}
          <div className="grid grid-cols-6 gap-4 mb-4">
            <Card className="shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-center">
                  <Package className="w-5 h-5 text-blue-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Items</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white" data-testid="metric-total-items">
                      {metrics?.totalItems || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Critical</p>
                    <p className="text-xl font-bold text-red-600" data-testid="metric-critical-items">
                      {metrics?.criticalStockItems || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Low Stock</p>
                    <p className="text-xl font-bold text-yellow-600" data-testid="metric-low-stock">
                      {metrics?.lowStockItems || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-orange-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Expiring Soon</p>
                    <p className="text-xl font-bold text-orange-600" data-testid="metric-expiring">
                      {metrics?.expiringItems || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Value</p>
                    <p className="text-lg font-bold text-green-600" data-testid="metric-total-value">
                      ₹{metrics?.totalValue?.toLocaleString() || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-center">
                  <BarChart3 className="w-5 h-5 text-purple-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Transactions (24h)</p>
                    <p className="text-xl font-bold text-purple-600" data-testid="metric-transactions">
                      {metrics?.recentTransactions || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-inventory"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48" data-testid="select-category-filter">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48" data-testid="select-stock-filter">
                <SelectValue placeholder="Filter by stock level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="lowStock">Low Stock</SelectItem>
                <SelectItem value="critical">Critical Stock</SelectItem>
                <SelectItem value="expiring">Expiring Soon</SelectItem>
              </SelectContent>
            </Select>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  data-testid="button-prev-page"
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage === totalPages - 1}
                  data-testid="button-next-page"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Grid - No Scrolling */}
        <div className="flex-1 p-4 overflow-hidden">
          {isLoading ? (
            <div className="grid grid-cols-4 gap-4 h-full">
              {Array.from({ length: 12 }).map((_, i) => (
                <Card key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700" />
              ))}
            </div>
          ) : paginatedItems.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No items found</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchQuery || filterType !== "all" ? "Try adjusting your search or filters" : "Add your first inventory item"}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4 h-full">
              {paginatedItems.map((item) => {
                const stockStatus = getStockStatus(item);
                return (
                  <Card 
                    key={item.id} 
                    className={`h-full transition-all duration-200 hover:shadow-lg cursor-pointer border-2 ${stockStatus.borderColor} ${stockStatus.bgColor}`}
                    data-testid={`inventory-item-${item.id}`}
                  >
                    <CardContent className="p-4 h-full flex flex-col">
                      {/* Header with Status */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate text-lg">
                            {item.itemName}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{item.itemCode}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className={`w-3 h-3 rounded-full ${stockStatus.color}`} />
                          <Badge variant="secondary" className={stockStatus.textColor}>
                            {item.category}
                          </Badge>
                        </div>
                      </div>

                      {/* Stock Level */}
                      <div className="mb-3">
                        <div className="flex items-baseline justify-between mb-1">
                          <span className="text-2xl font-bold text-gray-900 dark:text-white">
                            {Number(item.currentStock).toLocaleString()}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{item.unit}</span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Min: {Number(item.minStockLevel).toLocaleString()} • Max: {Number(item.maxStockLevel).toLocaleString()}
                        </div>
                        {item.storageLocation && (
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-1">
                            <MapPin className="w-3 h-3 mr-1" />
                            {item.storageLocation}
                          </div>
                        )}
                      </div>

                      {/* Quick Actions */}
                      <div className="mt-auto">
                        <div className="flex items-center gap-2 mb-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => quickAdjust(item, -1)}
                            disabled={updateStockMutation.isPending}
                            className="flex-1"
                            data-testid={`button-decrease-${item.id}`}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => quickAdjust(item, 1)}
                            disabled={updateStockMutation.isPending}
                            className="flex-1"
                            data-testid={`button-increase-${item.id}`}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Detailed Actions */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              className="w-full"
                              onClick={() => setSelectedItem(item)}
                              data-testid={`button-edit-${item.id}`}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Adjust Stock
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Adjust Stock - {item.itemName}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Current Stock: {item.currentStock} {item.unit}</Label>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Min: {item.minStockLevel} • Max: {item.maxStockLevel}
                                </p>
                              </div>
                              <div>
                                <Label htmlFor="newStock">New Stock Level</Label>
                                <Input
                                  id="newStock"
                                  type="number"
                                  value={stockAdjustment}
                                  onChange={(e) => setStockAdjustment(e.target.value)}
                                  placeholder={item.currentStock}
                                  data-testid="input-new-stock"
                                />
                              </div>
                              <div>
                                <Label htmlFor="reason">Reason for Adjustment</Label>
                                <Textarea
                                  id="reason"
                                  value={adjustmentReason}
                                  onChange={(e) => setAdjustmentReason(e.target.value)}
                                  placeholder="e.g., Physical count correction, Damaged goods, etc."
                                  data-testid="textarea-adjustment-reason"
                                />
                              </div>
                              <Button 
                                onClick={handleStockAdjustment}
                                disabled={adjustStockMutation.isPending || !stockAdjustment || !adjustmentReason}
                                className="w-full"
                                data-testid="button-confirm-adjustment"
                              >
                                {adjustStockMutation.isPending ? "Adjusting..." : "Confirm Adjustment"}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}