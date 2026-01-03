import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  LineChart, 
  Line,
  Legend,
  Area,
  AreaChart
} from "recharts";
import { 
  TrendingUp, 
  Users, 
  Target, 
  MapPin, 
  AlertTriangle,
  Crown,
  RefreshCw,
  Download
} from "lucide-react";

interface SegmentationAnalytics {
  segmentDistribution: Array<{segment: string; count: number; percentage: number; revenue: number}>;
  loyaltyTierDistribution: Array<{tier: string; count: number; percentage: number}>;
  customerSourceDistribution: Array<{source: string; count: number; percentage: number}>;
  geographicDistribution: Array<{city: string; state: string; count: number}>;
}

interface RetentionAnalytics {
  retentionRate: number;
  churnRate: number;
  customersByLifecycleStage: Array<{stage: string; count: number; percentage: number}>;
  churnRiskCustomers: any[];
  customerAcquisitionTrend: Array<{month: string; newCustomers: number; churnedCustomers: number}>;
}

interface CustomerAnalyticsChartsProps {
  className?: string;
}

export default function CustomerAnalyticsCharts({ className = "" }: CustomerAnalyticsChartsProps) {
  const { data: segmentation, isLoading: segmentationLoading } = useQuery<SegmentationAnalytics>({
    queryKey: ["/api/customers/analytics/segmentation"],
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const { data: retention, isLoading: retentionLoading } = useQuery<RetentionAnalytics>({
    queryKey: ["/api/customers/analytics/retention"],
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Color schemes for charts
  const SEGMENT_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
  const TIER_COLORS = ['#CD7F32', '#C0C0C0', '#FFD700', '#E5E4E2']; // Bronze, Silver, Gold, Platinum
  const LIFECYCLE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  if (segmentationLoading || retentionLoading) {
    return (
      <div className={`grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 ${className}`}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Customer Analytics</h2>
          <p className="text-muted-foreground">Insights into customer behavior and trends</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" data-testid="button-refresh-analytics">
            <RefreshCw size={16} className="mr-1" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" data-testid="button-export-analytics">
            <Download size={16} className="mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* Customer Segment Distribution */}
        <Card data-testid="chart-segment-distribution">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users size={18} />
              Customer Segments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {segmentation?.segmentDistribution && segmentation.segmentDistribution.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={segmentation.segmentDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      label={(data) => `${data?.payload?.segment}: ${data?.payload?.percentage}%`}
                    >
                      {segmentation.segmentDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={SEGMENT_COLORS[index % SEGMENT_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any, name: any, props: any) => [
                        `${value} customers`, 
                        props.payload.segment
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {segmentation.segmentDistribution.slice(0, 4).map((segment, index) => (
                    <div key={segment.segment} className="flex items-center gap-2 text-sm">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: SEGMENT_COLORS[index % SEGMENT_COLORS.length] }}
                      />
                      <span className="truncate">{segment.segment}</span>
                      <Badge variant="outline" className="text-xs">{segment.count}</Badge>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No segmentation data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Loyalty Tier Distribution */}
        <Card data-testid="chart-loyalty-tiers">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown size={18} />
              Loyalty Tiers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {segmentation?.loyaltyTierDistribution && segmentation.loyaltyTierDistribution.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={segmentation.loyaltyTierDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="tier" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: any) => [`${value} customers`, 'Count']}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {segmentation.loyaltyTierDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={TIER_COLORS[index % TIER_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex justify-between mt-4 text-sm">
                  {segmentation.loyaltyTierDistribution.map((tier, index) => (
                    <div key={tier.tier} className="text-center">
                      <div className="font-medium">{tier.tier}</div>
                      <div className="text-muted-foreground">{tier.percentage}%</div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No loyalty tier data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer Lifecycle Stages */}
        <Card data-testid="chart-lifecycle-stages">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target size={18} />
              Customer Lifecycle
            </CardTitle>
          </CardHeader>
          <CardContent>
            {retention?.customersByLifecycleStage && retention.customersByLifecycleStage.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={retention.customersByLifecycleStage}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ payload }) => `${payload.stage}: ${payload.percentage}%`}
                    >
                      {retention.customersByLifecycleStage.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={LIFECYCLE_COLORS[index % LIFECYCLE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any, name: any, props: any) => [
                        `${value} customers`, 
                        props.payload.stage
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-4">
                  {retention.customersByLifecycleStage.map((stage, index) => (
                    <div key={stage.stage} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: LIFECYCLE_COLORS[index % LIFECYCLE_COLORS.length] }}
                        />
                        <span>{stage.stage}</span>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline">{stage.count}</Badge>
                        <span className="text-muted-foreground">{stage.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No lifecycle data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer Acquisition Trend */}
        <Card className="lg:col-span-2" data-testid="chart-acquisition-trend">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp size={18} />
              Customer Acquisition Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {retention?.customerAcquisitionTrend && retention.customerAcquisitionTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={retention.customerAcquisitionTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any, name: any) => [
                      `${value} customers`, 
                      name === 'newCustomers' ? 'New Customers' : 'Churned Customers'
                    ]}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="newCustomers" 
                    stackId="1"
                    stroke="#10B981" 
                    fill="#10B981" 
                    fillOpacity={0.6}
                    name="New Customers"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="churnedCustomers" 
                    stackId="2"
                    stroke="#EF4444" 
                    fill="#EF4444" 
                    fillOpacity={0.6}
                    name="Churned Customers"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No acquisition trend data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer Source Distribution */}
        <Card data-testid="chart-customer-sources">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin size={18} />
              Customer Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            {segmentation?.customerSourceDistribution && segmentation.customerSourceDistribution.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={segmentation.customerSourceDistribution} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="source" type="category" width={80} />
                    <Tooltip 
                      formatter={(value: any) => [`${value} customers`, 'Count']}
                    />
                    <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {segmentation.customerSourceDistribution.slice(0, 3).map((source) => (
                    <div key={source.source} className="flex items-center justify-between text-sm">
                      <span className="font-medium">{source.source}</span>
                      <div className="flex gap-2">
                        <Badge variant="outline">{source.count}</Badge>
                        <span className="text-muted-foreground">{source.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No customer source data available
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Retention & Churn Risk Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Retention Summary */}
        <Card data-testid="card-retention-summary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp size={18} />
              Retention Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            {retention ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {retention.retentionRate}%
                    </div>
                    <div className="text-sm text-muted-foreground">Retention Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {retention.churnRate}%
                    </div>
                    <div className="text-sm text-muted-foreground">Churn Rate</div>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span>Retention Health</span>
                    <Badge 
                      variant={retention.retentionRate >= 70 ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {retention.retentionRate >= 70 ? "Healthy" : "Needs Attention"}
                    </Badge>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No retention data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Churn Risk Customers */}
        <Card data-testid="card-churn-risk">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle size={18} />
              Churn Risk Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            {retention?.churnRiskCustomers && retention.churnRiskCustomers.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">High Risk Customers</span>
                  <Badge variant="destructive" className="text-xs">
                    {retention.churnRiskCustomers.length}
                  </Badge>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {retention.churnRiskCustomers.slice(0, 3).map((customer, index) => (
                    <div key={customer.id || index} className="flex items-center justify-between text-sm">
                      <span className="font-medium">{customer.fullName || 'Unknown'}</span>
                      <Badge variant="outline" className="text-xs">
                        {customer.churnRisk ? `${(parseFloat(customer.churnRisk) * 100).toFixed(0)}%` : 'High'}
                      </Badge>
                    </div>
                  ))}
                </div>
                {retention.churnRiskCustomers.length > 3 && (
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    View All {retention.churnRiskCustomers.length} Customers
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p>No high-risk customers identified</p>
                <p className="text-xs">All customers appear healthy!</p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}