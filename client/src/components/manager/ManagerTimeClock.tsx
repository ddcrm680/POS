import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { 
  Clock,
  LogIn,
  LogOut,
  Coffee,
  AlertTriangle,
  CheckCircle,
  User,
  Timer,
  Calendar,
  MapPin,
  Camera,
  Shield,
  Lock,
  Unlock
} from "lucide-react";
import { format, differenceInMinutes, differenceInHours } from "date-fns";
import { apiRequest } from "@/lib/queryClient";

const clockInSchema = z.object({
  notes: z.string().optional(),
  location: z.string().default("main_store"),
  shiftType: z.enum(["regular", "overtime", "holiday", "weekend"]).default("regular")
});

const clockOutSchema = z.object({
  notes: z.string().optional(),
  eodCompleted: z.boolean().refine(val => val === true, "Must complete End of Day procedures before clocking out")
});

type ClockInData = z.infer<typeof clockInSchema>;
type ClockOutData = z.infer<typeof clockOutSchema>;

interface TimeClockRecord {
  id: string;
  employeeId: string;
  clockInTime: string;
  clockOutTime?: string;
  totalHoursWorked?: number;
  shiftType: string;
  location: string;
  notes?: string;
  status: string;
  isApproved: boolean;
  breaks: any[];
  totalBreakTime?: number;
}

interface EODStatus {
  isCompleted: boolean;
  completedBy?: string;
  completedAt?: string;
  pendingTasks: string[];
}

interface ManagerSession {
  currentRecord?: TimeClockRecord;
  todayHours: number;
  weekHours: number;
  isOnBreak: boolean;
  canClockOut: boolean;
  eodStatus: EODStatus;
}

export default function ManagerTimeClock() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const clockInForm = useForm<any>({
    resolver: zodResolver(clockInSchema),
    defaultValues: {
      location: "main_store",
      shiftType: "regular"
    }
  });

  const clockOutForm = useForm<ClockOutData>({
    resolver: zodResolver(clockOutSchema),
    defaultValues: {
      eodCompleted: false
    }
  });

  // Get manager session data
  const { data: managerSession, isLoading } = useQuery<ManagerSession>({
    queryKey: ["/api/manager/time-clock/session"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Get EOD status
  const { data: eodStatus } = useQuery<EODStatus>({
    queryKey: ["/api/manager/eod/status", format(new Date(), 'yyyy-MM-dd')],
    refetchInterval: 60000, // Refresh every minute
  });

  // Clock in mutation
  const clockInMutation = useMutation({
    mutationFn: async (data: ClockInData) => {
      return apiRequest("POST", "/api/manager/time-clock/clock-in", data);
    },
    onSuccess: () => {
      toast({
        title: "Clocked In Successfully",
        description: "Your shift has started. Have a productive day!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/manager/time-clock/session"] });
      clockInForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Clock In Failed",
        description: error.message || "Unable to clock in. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Clock out mutation with EOD validation
  const clockOutMutation = useMutation({
    mutationFn: async (data: ClockOutData) => {
      // Validate EOD completion before allowing clock out
      if (!eodStatus?.isCompleted) {
        throw new Error("You must complete End of Day procedures before clocking out");
      }
      return apiRequest("POST", "/api/manager/time-clock/clock-out", data);
    },
    onSuccess: () => {
      toast({
        title: "Clocked Out Successfully",
        description: "Thank you for completing your shift and EOD procedures!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/manager/time-clock/session"] });
      clockOutForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Clock Out Failed",
        description: error.message || "Unable to clock out. Please complete EOD procedures first.",
        variant: "destructive",
      });
    }
  });

  // Start break mutation
  const startBreakMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/manager/time-clock/start-break", {});
    },
    onSuccess: () => {
      toast({
        title: "Break Started",
        description: "Enjoy your break!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/manager/time-clock/session"] });
    }
  });

  // End break mutation
  const endBreakMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/manager/time-clock/end-break", {});
    },
    onSuccess: () => {
      toast({
        title: "Break Ended",
        description: "Welcome back! Your shift has resumed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/manager/time-clock/session"] });
    }
  });

  const getCurrentSessionDuration = () => {
    if (!managerSession?.currentRecord?.clockInTime) return "0h 0m";
    const minutes = differenceInMinutes(currentTime, new Date(managerSession.currentRecord.clockInTime));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const getStatusBadge = () => {
    if (!managerSession?.currentRecord) {
      return <Badge variant="secondary" className="bg-gray-100 text-gray-800"><LogOut className="h-3 w-3 mr-1" />Clocked Out</Badge>;
    }
    if (managerSession.isOnBreak) {
      return <Badge className="bg-yellow-100 text-yellow-800"><Coffee className="h-3 w-3 mr-1" />On Break</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800"><LogIn className="h-3 w-3 mr-1" />Active</Badge>;
  };

  const formatTime = (date: Date) => {
    return format(date, 'h:mm:ss a');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
            <span className="ml-2">Loading time clock...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" data-testid="manager-time-clock">
      
      {/* Current Status Card */}
      <Card className="enhanced-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Manager Time Clock
              </CardTitle>
              <CardDescription>
                {format(currentTime, 'EEEE, MMMM do, yyyy')} - {formatTime(currentTime)}
              </CardDescription>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Time Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Timer className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900 dark:text-blue-300">Current Session</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {getCurrentSessionDuration()}
              </div>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-900 dark:text-green-300">Today's Hours</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {Math.round((managerSession?.todayHours || 0) * 10) / 10}h
              </div>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900 dark:text-purple-300">Week Hours</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {Math.round((managerSession?.weekHours || 0) * 10) / 10}h
              </div>
            </div>
          </div>

          {/* Current Session Details */}
          {managerSession?.currentRecord && (
            <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <User className="h-4 w-4" />
                Current Session Details
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Clock In Time:</span>
                  <div className="font-medium">
                    {format(new Date(managerSession.currentRecord.clockInTime), 'h:mm a')}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Location:</span>
                  <div className="font-medium flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {managerSession.currentRecord.location}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Shift Type:</span>
                  <div className="font-medium">{managerSession.currentRecord.shiftType}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <div className="font-medium">{managerSession.currentRecord.status}</div>
                </div>
              </div>
            </div>
          )}

          {/* EOD Status Alert */}
          {managerSession?.currentRecord && !eodStatus?.isCompleted && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-orange-900 dark:text-orange-300">EOD Procedures Required</h4>
                  <p className="text-sm text-orange-700 dark:text-orange-400 mt-1">
                    You must complete End of Day procedures before clocking out.
                  </p>
                  {eodStatus?.pendingTasks && eodStatus.pendingTasks.length > 0 && (
                    <div className="mt-2">
                      <span className="text-xs font-medium text-orange-800 dark:text-orange-300">Pending Tasks:</span>
                      <ul className="text-xs text-orange-700 dark:text-orange-400 mt-1">
                        {eodStatus.pendingTasks.map((task, index) => (
                          <li key={index} className="flex items-center gap-1">
                            <span className="w-1 h-1 bg-orange-500 rounded-full" />
                            {task}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            {!managerSession?.currentRecord ? (
              // Clock In Form
              <Form {...clockInForm}>
                <form onSubmit={clockInForm.handleSubmit((data) => clockInMutation.mutate(data))} className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={clockInForm.control}
                      name="shiftType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Shift Type</FormLabel>
                          <FormControl>
                            <select {...field} className="w-full rounded-md border border-input bg-background px-3 py-2">
                              <option value="regular">Regular</option>
                              <option value="overtime">Overtime</option>
                              <option value="holiday">Holiday</option>
                              <option value="weekend">Weekend</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={clockInForm.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Store location" data-testid="input-clock-in-location" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={clockInForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Any notes for this shift..." rows={2} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button
                    type="submit"
                    disabled={clockInMutation.isPending}
                    className="w-full md:w-auto"
                    data-testid="button-clock-in"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    {clockInMutation.isPending ? "Clocking In..." : "Clock In"}
                  </Button>
                </form>
              </Form>
            ) : (
              // Clock Out and Break Controls
              <div className="flex flex-wrap gap-3 w-full">
                {!managerSession.isOnBreak ? (
                  <>
                    <Button
                      onClick={() => startBreakMutation.mutate()}
                      disabled={startBreakMutation.isPending}
                      variant="outline"
                      data-testid="button-start-break"
                    >
                      <Coffee className="h-4 w-4 mr-2" />
                      Start Break
                    </Button>
                    
                    <Form {...clockOutForm}>
                      <form onSubmit={clockOutForm.handleSubmit((data) => clockOutMutation.mutate(data))} className="flex gap-3 items-end">
                        <FormField
                          control={clockOutForm.control}
                          name="eodCompleted"
                          render={({ field }) => (
                            <FormItem className="flex items-center gap-2">
                              <FormControl>
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  disabled={!eodStatus?.isCompleted}
                                  className="rounded"
                                  data-testid="checkbox-eod-completed"
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                EOD Completed
                              </FormLabel>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button
                          type="submit"
                          disabled={clockOutMutation.isPending || !eodStatus?.isCompleted}
                          variant={eodStatus?.isCompleted ? "default" : "secondary"}
                          data-testid="button-clock-out"
                        >
                          {eodStatus?.isCompleted ? (
                            <><CheckCircle className="h-4 w-4 mr-2" />Clock Out</>
                          ) : (
                            <><Lock className="h-4 w-4 mr-2" />Complete EOD First</>
                          )}
                        </Button>
                      </form>
                    </Form>
                  </>
                ) : (
                  <Button
                    onClick={() => endBreakMutation.mutate()}
                    disabled={endBreakMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                    data-testid="button-end-break"
                  >
                    <Timer className="h-4 w-4 mr-2" />
                    End Break
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}