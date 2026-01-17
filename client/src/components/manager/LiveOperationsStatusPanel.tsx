import { Activity, Users, Wrench, Building, Clock, CheckCircle, AlertTriangle, Car, RefreshCw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../ui/button";

interface LiveOperationsStatus {
  servicePipeline: {
    checkIn: Array<{customerId: string; vehicleInfo: string; waitTime: number}>;
    washBay1: {jobCardId?: string; vehicleInfo?: string; timeRemaining?: number; status: 'occupied' | 'available'};
    washBay2: {jobCardId?: string; vehicleInfo?: string; timeRemaining?: number; status: 'occupied' | 'available'};
    qualityCheck: Array<{jobCardId: string; vehicleInfo: string; waitTime: number}>;
    readyForPickup: Array<{jobCardId: string; vehicleInfo: string; waitTime: number}>;
  };
  resourceStatus: {
    staffOnDuty: number;
    staffTotal: number;
    equipmentStatus: Array<{name: string; status: 'operational' | 'maintenance' | 'down'}>;
    parkingOccupied: number;
    parkingTotal: number;
  };
  nextPriority: {customerId?: string; customerName?: string; appointmentTime?: Date; serviceType?: string};
}

function ServiceBayCard({ 
  bayName, 
  bayData 
}: { 
  bayName: string; 
  bayData: {jobCardId?: string; vehicleInfo?: string; timeRemaining?: number; status: 'occupied' | 'available'} 
}) {
  const isOccupied = bayData.status === 'occupied';
  
  return (
    <Card className={`border-2 ${isOccupied ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20' : 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20'}`}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Car className={`h-4 w-4 ${isOccupied ? 'text-blue-600' : 'text-green-600'}`} />
            <span className="font-medium text-sm">{bayName}</span>
          </div>
          <Badge variant={isOccupied ? 'default' : 'secondary'} className="text-xs">
            {isOccupied ? 'Occupied' : 'Available'}
          </Badge>
        </div>
        
        {isOccupied ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
              {bayData.vehicleInfo}
            </p>
            {bayData.timeRemaining && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span>Time Remaining</span>
                  <span className="font-medium">{bayData.timeRemaining} min</span>
                </div>
                <Progress 
                  value={Math.max(0, 100 - (bayData.timeRemaining / 60) * 100)} 
                  className="h-1"
                />
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-green-700 dark:text-green-300">
            Ready for next vehicle
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function QueueSection({ 
  title, 
  icon: Icon, 
  items, 
  emptyMessage 
}: { 
  title: string; 
  icon: React.ComponentType<any>; 
  items: Array<{vehicleInfo?: string; waitTime?: number; customerId?: string; jobCardId?: string}>; 
  emptyMessage: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">{title}</span>
        <Badge variant="outline" className="text-xs">
          {items.length}
        </Badge>
      </div>
      
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground pl-6">{emptyMessage}</p>
      ) : (
        <div className="space-y-2 pl-6">
          {items.slice(0, 3).map((item, index) => (
            <div key={index} className="flex items-center justify-between text-xs p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <span className="font-medium">
                {item.vehicleInfo || `Job ${item.jobCardId}`}
              </span>
              {item.waitTime !== undefined && (
                <span className={`font-bold ${item.waitTime > 15 ? 'text-red-600' : item.waitTime > 10 ? 'text-amber-600' : 'text-green-600'}`}>
                  {item.waitTime}m
                </span>
              )}
            </div>
          ))}
          {items.length > 3 && (
            <p className="text-xs text-muted-foreground">
              +{items.length - 3} more in queue
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function LiveOperationsStatusPanel() {
  const { data: liveStatus, isLoading, isError, error, refetch } = useQuery<LiveOperationsStatus>({
    queryKey: ["/api/manager/live-operations"],
    refetchInterval: 10000, // Refresh every 10 seconds for real-time updates
    retry: 3,
    retryDelay: 1000,
  });

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-500" />
            Live Operations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="h-full border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
            <AlertTriangle className="h-5 w-5" />
            Operations Monitor Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-medium mb-2 text-red-800 dark:text-red-200">Live Operations Unavailable</h3>
            <p className="text-red-600 dark:text-red-400 mb-4 text-sm">
              {error?.message || 'Unable to fetch live operations data. Real-time monitoring is offline.'}
            </p>
            <Button onClick={() => refetch()} variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!liveStatus) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-500" />
            Live Operations Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!liveStatus) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-500" />
            Live Operations Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No live operations data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const parkingUtilization = (liveStatus.resourceStatus.parkingOccupied / liveStatus.resourceStatus.parkingTotal) * 100;
  const staffUtilization = (liveStatus.resourceStatus.staffOnDuty / liveStatus.resourceStatus.staffTotal) * 100;
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-500" />
            Live Operations Monitor
          </div>
          <Badge variant="outline" className="text-xs animate-pulse">
            Live • {new Date().toLocaleTimeString()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Service Pipeline */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Service Pipeline
          </h3>
          
          {/* Service Bays */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <ServiceBayCard 
              bayName="Wash Bay 1" 
              bayData={liveStatus.servicePipeline.washBay1} 
            />
            <ServiceBayCard 
              bayName="Wash Bay 2" 
              bayData={liveStatus.servicePipeline.washBay2} 
            />
          </div>

          {/* Queue Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <QueueSection
              title="Check-in Queue"
              icon={Clock}
              items={liveStatus.servicePipeline.checkIn}
              emptyMessage="No customers waiting"
            />
            <QueueSection
              title="Quality Check"
              icon={CheckCircle}
              items={liveStatus.servicePipeline.qualityCheck}
              emptyMessage="No jobs pending QC"
            />
            <QueueSection
              title="Ready for Pickup"
              icon={Car}
              items={liveStatus.servicePipeline.readyForPickup}
              emptyMessage="No vehicles ready"
            />
          </div>
        </div>

        {/* Resource Status */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Resource Status
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Staff Status */}
            <Card className="border">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Staff on Duty</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">
                      {liveStatus.resourceStatus.staffOnDuty}/{liveStatus.resourceStatus.staffTotal}
                    </span>
                    <Badge variant={staffUtilization >= 80 ? 'default' : 'secondary'}>
                      {staffUtilization.toFixed(0)}%
                    </Badge>
                  </div>
                  <Progress value={staffUtilization} className="h-1" />
                </div>
              </CardContent>
            </Card>

            {/* Equipment Status */}
            <Card className="border">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Wrench className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">Equipment</span>
                </div>
                <div className="space-y-1">
                  {liveStatus.resourceStatus.equipmentStatus.map((equipment, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <span>{equipment.name}</span>
                      <Badge 
                        variant={equipment.status === 'operational' ? 'default' : equipment.status === 'maintenance' ? 'secondary' : 'destructive'}
                        className="text-xs"
                      >
                        {equipment.status === 'operational' ? 'OK' : equipment.status === 'maintenance' ? 'MAINT' : 'DOWN'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Parking Status */}
            <Card className="border">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Building className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">Parking</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">
                      {liveStatus.resourceStatus.parkingOccupied}/{liveStatus.resourceStatus.parkingTotal}
                    </span>
                    <Badge variant={parkingUtilization >= 80 ? 'destructive' : parkingUtilization >= 60 ? 'secondary' : 'default'}>
                      {parkingUtilization.toFixed(0)}%
                    </Badge>
                  </div>
                  <Progress value={parkingUtilization} className="h-1" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Next Priority */}
        {liveStatus.nextPriority.customerId && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Next Priority
            </h3>
            <Card className="border-2 border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-medium text-yellow-800 dark:text-yellow-200">
                        {liveStatus.nextPriority.customerName}
                      </p>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        {liveStatus.nextPriority.serviceType} • {liveStatus.nextPriority.appointmentTime ? new Date(liveStatus.nextPriority.appointmentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Walk-in'}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100">
                    VIP
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}