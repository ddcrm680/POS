export interface ServiceItem {
  id: string;
  name: string;
  price: number;
  description?: string;
}

export interface KanbanCard {
  id: string;
  jobCardId: string;
  title: string;
  customerName: string;
  vehicleInfo: string;
  amount?: number;
  progress?: number;
  timeRemaining?: string;
  status: 'check-in' | 'inspect' | 'prep' | 'service' | 'qc' | 'billing' | 'pickup';
}

export interface DashboardMetrics {
  todayRevenue: number;
  servicesCompleted: number;
  customerSatisfaction: number;
  cashPosition: number;
  activeJobs: number;
}

export interface TaskPriority {
  id: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  dueDate?: Date;
  estimatedRevenueLoss?: number;
}

export interface InventoryAlert {
  id: string;
  itemName: string;
  currentStock: number;
  minStockLevel: number;
  status: 'critical' | 'low' | 'ok';
  category: string;
}

export interface FacilityMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  trend?: 'up' | 'down' | 'stable';
}
