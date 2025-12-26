import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import POSLayout from "@/components/layout/pos-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  User,
  LogIn,
  LogOut,
  Calendar,
  Activity,
  MapPin,
  Timer,
  Star,
  DollarSign,
  Users,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Coffee,
  Briefcase,
  Target,
  TrendingUp
} from "lucide-react";
import { format, differenceInMinutes, differenceInHours } from "date-fns";

// Employee Card Component
const EmployeeCard = ({ employee, onClockAction }: { employee: any; onClockAction: (action: string, employee: any) => void }) => {
  const currentSession = employee.currentSession;
  const isActive = employee.status === 'clocked_in';
  
  const getTimeWorkedToday = () => {
    if (!employee.todayMinutes) return "0m";
    const hours = Math.floor(employee.todayMinutes / 60);
    const minutes = employee.todayMinutes % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const getCurrentSessionDuration = () => {
    if (!currentSession?.clockInTime) return "0m";
    const minutes = differenceInMinutes(new Date(), new Date(currentSession.clockInTime));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return hours > 0 ? `${hours}h ${remainingMinutes}m` : `${remainingMinutes}m`;
  };

  const getStatusBadge = () => {
    switch (employee.status) {
      case 'clocked_in':
        return <Badge className="bg-green-100 text-green-800 border-green-300">🟢 Active</Badge>;
      case 'on_break':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">☕ Break</Badge>;
      case 'clocked_out':
        return <Badge variant="secondary">⏸️ Off Duty</Badge>;
      default:
        return <Badge variant="outline">❓ Unknown</Badge>;
    }
  };

  const getPerformanceColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-blue-600';
    if (rating >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className={`transition-all duration-500 hover:shadow-lg hover:scale-[1.02] cursor-pointer border-l-4 transform-gpu ${
      isActive ? 'border-l-green-500 bg-green-50/50 dark:bg-green-900/10' : 
      employee.status === 'on_break' ? 'border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/10' :
      'border-l-gray-500 bg-gray-50/50 dark:bg-gray-900/10'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                {employee.firstName[0]}{employee.lastName[0]}
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">
                  {employee.firstName} {employee.lastName}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{employee.position}</p>
              </div>
              {getStatusBadge()}
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm mb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <div>
                  <span className="text-muted-foreground">Today: </span>
                  <span className="font-medium">{getTimeWorkedToday()}</span>
                </div>
              </div>
              
              {isActive && (
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4 text-green-500" />
                  <div>
                    <span className="text-muted-foreground">Session: </span>
                    <span className="font-medium text-green-600">{getCurrentSessionDuration()}</span>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <div>
                  <span className="text-muted-foreground">Rating: </span>
                  <span className={`font-medium ${getPerformanceColor(employee.performanceRating)}`}>
                    {employee.performanceRating.toFixed(1)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-500" />
                <div>
                  <span className="text-muted-foreground">Rate: </span>
                  <span className="font-medium">${employee.hourlyRate}/hr</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          
          {/* Current Session Info */}
          {isActive && currentSession && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded border-l-2 border-l-green-400">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-sm text-green-800 dark:text-green-300">Current Session</span>
                </div>
                <span className="text-xs text-green-700 dark:text-green-300">
                  Started {format(new Date(currentSession.clockInTime), "h:mm a")}
                </span>
              </div>
              {currentSession.location && (
                <div className="flex items-center gap-1 text-xs text-green-700 dark:text-green-300">
                  <MapPin className="h-3 w-3" />
                  {currentSession.location}
                </div>
              )}
            </div>
          )}

          {/* Weekly Summary */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
              <div className="text-sm font-medium text-blue-600">Week Hours</div>
              <div className="text-xs text-muted-foreground">{employee.weeklyHours}h</div>
            </div>
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
              <div className="text-sm font-medium text-purple-600">Tasks</div>
              <div className="text-xs text-muted-foreground">{employee.tasksCompleted}</div>
            </div>
            <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
              <div className="text-sm font-medium text-orange-600">Attendance</div>
              <div className="text-xs text-muted-foreground">{employee.attendanceRate}%</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {employee.status === 'clocked_out' && (
              <Button 
                size="sm" 
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => onClockAction('clock_in', employee)}
                data-testid={`button-clock-in-${employee.id}`}
              >
                <LogIn className="h-4 w-4 mr-2" />
                Clock In
              </Button>
            )}
            
            {employee.status === 'clocked_in' && (
              <>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="flex-1"
                  onClick={() => onClockAction('start_break', employee)}
                  data-testid={`button-break-${employee.id}`}
                >
                  <Coffee className="h-4 w-4 mr-2" />
                  Break
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  className="flex-1"
                  onClick={() => onClockAction('clock_out', employee)}
                  data-testid={`button-clock-out-${employee.id}`}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Clock Out
                </Button>
              </>
            )}
            
            {employee.status === 'on_break' && (
              <>
                <Button 
                  size="sm" 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => onClockAction('end_break', employee)}
                  data-testid={`button-return-${employee.id}`}
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Return to Work
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  className="flex-1"
                  onClick={() => onClockAction('clock_out', employee)}
                  data-testid={`button-clock-out-break-${employee.id}`}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Clock Out
                </Button>
              </>
            )}
          </div>
          
        </div>
      </CardContent>
    </Card>
  );
};

// Team Summary Card Component
const TeamSummaryCard = ({ title, value, icon, trend, color }: { 
  title: string; 
  value: string; 
  icon: React.ReactNode; 
  trend?: { value: string; positive: boolean }; 
  color: string; 
}) => {
  return (
    <Card className="transition-all duration-300 hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className={`p-2 rounded ${color} text-white`}>
            {icon}
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-xs ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className={`h-3 w-3 ${trend.positive ? '' : 'rotate-180'}`} />
              {trend.value}
            </div>
          )}
        </div>
        
        <div>
          <h3 className="text-2xl font-bold mb-1">{value}</h3>
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default function EmployeeManagement() {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedShift, setSelectedShift] = useState<string>('current');

  // Mock data for demonstration (replace with real API calls)
  const employees = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Smith',
      position: 'Senior Detailer',
      status: 'clocked_in',
      hourlyRate: 18.50,
      todayMinutes: 435, // 7h 15m
      weeklyHours: 38.5,
      performanceRating: 4.8,
      tasksCompleted: 23,
      attendanceRate: 96,
      currentSession: {
        clockInTime: new Date(Date.now() - 4.5 * 60 * 60 * 1000), // 4.5 hours ago
        location: 'Service Bay 1'
      }
    },
    {
      id: '2',
      firstName: 'Sarah',
      lastName: 'Johnson',
      position: 'Interior Specialist',
      status: 'on_break',
      hourlyRate: 16.00,
      todayMinutes: 305, // 5h 5m
      weeklyHours: 32.0,
      performanceRating: 4.6,
      tasksCompleted: 18,
      attendanceRate: 92,
      currentSession: {
        clockInTime: new Date(Date.now() - 5.2 * 60 * 60 * 1000), // 5.2 hours ago
        location: 'Detail Station 2'
      }
    },
    {
      id: '3',
      firstName: 'Mike',
      lastName: 'Wilson',
      position: 'Washing Tech',
      status: 'clocked_out',
      hourlyRate: 15.00,
      todayMinutes: 480, // 8h (completed shift)
      weeklyHours: 40.0,
      performanceRating: 4.2,
      tasksCompleted: 15,
      attendanceRate: 98,
      currentSession: null
    },
    {
      id: '4',
      firstName: 'Lisa',
      lastName: 'Davis',
      position: 'Quality Inspector',
      status: 'clocked_in',
      hourlyRate: 19.00,
      todayMinutes: 390, // 6h 30m
      weeklyHours: 35.5,
      performanceRating: 4.9,
      tasksCompleted: 12,
      attendanceRate: 100,
      currentSession: {
        clockInTime: new Date(Date.now() - 6.5 * 60 * 60 * 1000), // 6.5 hours ago
        location: 'Quality Station'
      }
    }
  ];

  const handleClockAction = (action: string, employee: any) => {
    
    const messages = {
      clock_in: `⏰ Clock In Successful!\n\n${employee.firstName} ${employee.lastName} has clocked in at ${format(new Date(), "h:mm a")}.\n\nLocation: Main Facility\nExpected shift: 8 hours`,
      clock_out: `⏰ Clock Out Successful!\n\n${employee.firstName} ${employee.lastName} has clocked out at ${format(new Date(), "h:mm a")}.\n\nTotal time today: ${Math.floor((employee.todayMinutes + 30) / 60)}h ${(employee.todayMinutes + 30) % 60}m\nGreat work today!`,
      start_break: `☕ Break Started!\n\n${employee.firstName} is now on break.\nStarted at ${format(new Date(), "h:mm a")}\n\nRemember to clock back in when ready!`,
      end_break: `✅ Break Ended!\n\n${employee.firstName} has returned to work.\nBreak duration: 15 minutes\n\nWelcome back!`
    };
    
    alert(messages[action as keyof typeof messages] || 'Action completed!');
  };

  const filteredEmployees = employees.filter(employee => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'active') return employee.status === 'clocked_in';
    if (filterStatus === 'break') return employee.status === 'on_break';
    if (filterStatus === 'off') return employee.status === 'clocked_out';
    return true;
  });

  // Calculate team metrics
  const activeEmployees = employees.filter(e => e.status === 'clocked_in').length;
  const onBreakEmployees = employees.filter(e => e.status === 'on_break').length;
  const totalHoursToday = employees.reduce((sum, e) => sum + (e.todayMinutes / 60), 0);
  const avgPerformance = employees.reduce((sum, e) => sum + e.performanceRating, 0) / employees.length;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className=" p-6">
          
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Employee Management
                </h1>
                <p className="text-muted-foreground">
                  {format(new Date(), "EEEE, MMMM d, yyyy")} • Time tracking and team management
                </p>
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {activeEmployees + onBreakEmployees} Active
              </Badge>
            </div>
          </div>

          {/* Team Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <TeamSummaryCard
              title="Active Now"
              value={activeEmployees.toString()}
              icon={<Users className="h-5 w-5" />}
              trend={{ value: "+2", positive: true }}
              color="bg-green-500"
            />
            <TeamSummaryCard
              title="On Break"
              value={onBreakEmployees.toString()}
              icon={<Coffee className="h-5 w-5" />}
              color="bg-yellow-500"
            />
            <TeamSummaryCard
              title="Hours Today"
              value={`${totalHoursToday.toFixed(1)}h`}
              icon={<Clock className="h-5 w-5" />}
              trend={{ value: "+5%", positive: true }}
              color="bg-blue-500"
            />
            <TeamSummaryCard
              title="Avg Performance"
              value={avgPerformance.toFixed(1)}
              icon={<Star className="h-5 w-5" />}
              trend={{ value: "+0.2", positive: true }}
              color="bg-purple-500"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex gap-2">
              <Button 
                variant={filterStatus === 'all' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilterStatus('all')}
                data-testid="filter-status-all"
              >
                All Team
              </Button>
              <Button 
                variant={filterStatus === 'active' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilterStatus('active')}
                data-testid="filter-status-active"
              >
                🟢 Active ({activeEmployees})
              </Button>
              <Button 
                variant={filterStatus === 'break' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilterStatus('break')}
                data-testid="filter-status-break"
              >
                ☕ Break ({onBreakEmployees})
              </Button>
              <Button 
                variant={filterStatus === 'off' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilterStatus('off')}
                data-testid="filter-status-off"
              >
                ⏸️ Off Duty
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant={selectedShift === 'current' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSelectedShift('current')}
                data-testid="filter-shift-current"
              >
                Current Shift
              </Button>
              <Button 
                variant={selectedShift === 'day' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSelectedShift('day')}
                data-testid="filter-shift-day"
              >
                Day Shift
              </Button>
              <Button 
                variant={selectedShift === 'evening' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSelectedShift('evening')}
                data-testid="filter-shift-evening"
              >
                Evening Shift
              </Button>
            </div>
          </div>

          {/* Employee Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-blue-500" />
                Team Members
              </h2>
              <Badge variant="outline" className="text-xs">
                {filteredEmployees.length} {filteredEmployees.length === 1 ? 'Employee' : 'Employees'}
              </Badge>
            </div>
            
            {filteredEmployees.map((employee) => (
              <EmployeeCard
                key={employee.id}
                employee={employee}
                onClockAction={handleClockAction}
              />
            ))}

            {filteredEmployees.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No employees found
                </h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters to see more team members.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}