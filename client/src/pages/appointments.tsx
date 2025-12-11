import { useState, useMemo } from "react";
import { 
  Calendar, Clock, Users, Plus, Filter, Search, CheckCircle, AlertCircle, 
  Phone, Calendar as CalendarIcon, 
  MessageCircle, MessageSquare, Navigation, Zap, Timer, Eye, 
  ChevronRight, TrendingUp, List, 
  ChevronLeft, CalendarDays
} from "lucide-react";
import POSLayout from "@/components/layout/pos-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isSameDay, eachDayOfInterval } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { CloseButton, ColorPicker, HStack, parseColor, Portal } from "@chakra-ui/react";

// Mock Data - Advanced Appointment Dataset
const MOCK_APPOINTMENTS = [
  {
    id: "apt-001",
    title: "PPF Demo & Consultation",
    customerId: "cust-001",
    customerName: "Rajesh Kumar",
    customerPhone: "+91-9876543210",
    customerEmail: "rajesh.kumar@email.com",
    scheduledAt: new Date().toISOString(),
    status: "scheduled" as const,
    priority: "high" as const,
    type: "sales_call" as const,
    location: "on_site" as const,
    notes: "Customer interested in PPF for new BMW X5. High-value potential customer.",
    estimatedDuration: 60,
    assignedTo: "HQ Sales Team",
    serviceRequired: "Paint Protection Film Demo",
    vehicleInfo: "BMW X5 2024 - Black",
    urgencyLevel: "urgent",
    lastContact: null,
    followUpRequired: true,
    leadScore: 95,
    estimatedValue: 85000,
    customerType: "premium",
    tags: ["high-value", "new-customer", "bmw", "ppf"]
  },
  {
    id: "apt-002", 
    title: "Ceramic Coating Appointment",
    customerId: "cust-002",
    customerName: "Priya Sharma",
    customerPhone: "+91-9876543211",
    customerEmail: "priya.sharma@email.com",
    scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    status: "confirmed" as const,
    priority: "medium" as const,
    type: "customer_visit" as const,
    location: "showroom" as const,
    notes: "Regular customer. Quick ceramic coating service.",
    estimatedDuration: 45,
    assignedTo: "Store Manager",
    serviceRequired: "9H Ceramic Coating",
    vehicleInfo: "Audi A4 2023 - White",
    urgencyLevel: "normal",
    lastContact: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    followUpRequired: false,
    leadScore: 75,
    estimatedValue: 25000,
    customerType: "regular",
    tags: ["ceramic", "returning-customer", "audi"]
  },
  {
    id: "apt-003",
    title: "Premium Wash & Detail",
    customerId: "cust-003", 
    customerName: "Amit Patel",
    customerPhone: "+91-9876543212",
    customerEmail: "amit.patel@email.com",
    scheduledAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours from now
    status: "in_progress" as const,
    priority: "low" as const,
    type: "vip_service" as const,
    location: "customer_location" as const,
    notes: "VIP customer. Premium service at customer location.",
    estimatedDuration: 120,
    assignedTo: "Senior Technician",
    serviceRequired: "Premium Wash & Detail",
    vehicleInfo: "Mercedes S-Class 2024 - Silver",
    urgencyLevel: "low",
    lastContact: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    followUpRequired: false,
    leadScore: 60,
    estimatedValue: 15000,
    customerType: "vip",
    tags: ["vip", "wash", "mercedes", "home-service"]
  },
  {
    id: "apt-004",
    title: "URGENT: PPF Installation",
    customerId: "cust-004",
    customerName: "Suresh Reddy", 
    customerPhone: "+91-9876543213",
    customerEmail: "suresh.reddy@email.com",
    scheduledAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
    status: "scheduled" as const,
    priority: "critical" as const,
    type: "delivery" as const,
    location: "on_site" as const,
    notes: "URGENT: Customer traveling tomorrow. Needs PPF installed today.",
    estimatedDuration: 180,
    assignedTo: "Emergency Team",
    serviceRequired: "Full Body PPF Installation",
    vehicleInfo: "Porsche 911 2024 - Red",
    urgencyLevel: "critical",
    lastContact: null,
    followUpRequired: true,
    leadScore: 100,
    estimatedValue: 120000,
    customerType: "premium",
    tags: ["urgent", "ppf", "porsche", "same-day"]
  },
  {
    id: "apt-005",
    title: "Follow-up: Coating Maintenance",
    customerId: "cust-005",
    customerName: "Kavya Singh",
    customerPhone: "+91-9876543214", 
    customerEmail: "kavya.singh@email.com",
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    status: "scheduled" as const,
    priority: "medium" as const,
    type: "follow_up" as const,
    location: "showroom" as const,
    notes: "6-month follow-up for ceramic coating maintenance check.",
    estimatedDuration: 30,
    assignedTo: "Service Team",
    serviceRequired: "Coating Maintenance Check",
    vehicleInfo: "Honda City 2023 - Blue",
    urgencyLevel: "normal",
    lastContact: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    followUpRequired: false,
    leadScore: 40,
    estimatedValue: 5000,
    customerType: "regular",
    tags: ["maintenance", "follow-up", "honda"]
  },
  // Add more appointments for calendar demo
  {
    id: "apt-006",
    title: "Interior Detailing",
    customerId: "cust-006",
    customerName: "Vikram Singh",
    customerPhone: "+91-9876543215",
    customerEmail: "vikram.singh@email.com",
    scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
    status: "scheduled" as const,
    priority: "low" as const,
    type: "customer_visit" as const,
    location: "showroom" as const,
    notes: "Complete interior detailing service.",
    estimatedDuration: 90,
    assignedTo: "Detailing Team",
    serviceRequired: "Premium Interior Detailing",
    vehicleInfo: "Toyota Camry 2023 - Gray",
    urgencyLevel: "normal",
    lastContact: null,
    followUpRequired: false,
    leadScore: 55,
    estimatedValue: 12000,
    customerType: "regular",
    tags: ["interior", "detailing", "toyota"]
  },
  {
    id: "apt-007",
    title: "PPF Installation Follow-up",
    customerId: "cust-007",
    customerName: "Deepika Rao",
    customerPhone: "+91-9876543216",
    customerEmail: "deepika.rao@email.com",
    scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    status: "confirmed" as const,
    priority: "high" as const,
    type: "follow_up" as const,
    location: "customer_location" as const,
    notes: "Follow-up for PPF installation quality check.",
    estimatedDuration: 30,
    assignedTo: "Quality Team",
    serviceRequired: "PPF Quality Check",
    vehicleInfo: "Jaguar XF 2024 - White",
    urgencyLevel: "normal",
    lastContact: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    followUpRequired: false,
    leadScore: 80,
    estimatedValue: 5000,
    customerType: "premium",
    tags: ["ppf", "follow-up", "jaguar", "quality"]
  }
];

// Advanced UI Components

// Priority indicator with animation
const PriorityIndicator = ({ priority, size = "md" }: { priority: string; size?: "sm" | "md" | "lg" }) => {
  const sizeClasses = {
    sm: "h-2 w-2",
    md: "h-3 w-3", 
    lg: "h-4 w-4"
  };

  const colors = {
    critical: "bg-red-500 shadow-red-500/50",
    high: "bg-orange-500 shadow-orange-500/50", 
    medium: "bg-blue-500 shadow-blue-500/50",
    low: "bg-gray-500 shadow-gray-500/50"
  };

  return (
    <div className={`${sizeClasses[size]} ${colors[priority as keyof typeof colors]} rounded-full animate-pulse shadow-lg`} />
  );
};

// Urgency badge with special styling
const UrgencyBadge = ({ urgency }: { urgency: string }) => {
  if (urgency === "critical") {
    return (
      <Badge className="bg-red-500 text-white animate-pulse border-red-300 shadow-lg">
        <Zap className="h-3 w-3 mr-1" />
        CRITICAL
      </Badge>
    );
  }
  if (urgency === "urgent") {
    return (
      <Badge className="bg-orange-500 text-white border-orange-300">
        <Timer className="h-3 w-3 mr-1" />
        URGENT
      </Badge>
    );
  }
  return null;
};

// Communication action buttons - Touch optimized
const CommunicationActions = ({ appointment, onAction }: { 
  appointment: any; 
  onAction: (action: string, appointment: any) => void 
}) => {
  return (
    <div className="flex gap-2 mt-3">
      {/* WhatsApp Button */}
      <Button
        size="sm"
        variant="outline" 
        className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300 touch-manipulation min-h-10 px-4"
        onClick={() => onAction('whatsapp', appointment)}
        data-testid={`button-whatsapp-${appointment.id}`}
      >
        <MessageCircle className="h-4 w-4 mr-2" />
        WhatsApp
      </Button>

      {/* Call Button */}
      <Button
        size="sm"
        variant="outline"
        className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300 touch-manipulation min-h-10 px-4"
        onClick={() => onAction('call', appointment)}
        data-testid={`button-call-${appointment.id}`}
      >
        <Phone className="h-4 w-4 mr-2" />
        Call
      </Button>

      {/* SMS Button */}
      <Button
        size="sm" 
        variant="outline"
        className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-300 touch-manipulation min-h-10 px-4"
        onClick={() => onAction('sms', appointment)}
        data-testid={`button-sms-${appointment.id}`}
      >
        <MessageSquare className="h-4 w-4 mr-2" />
        SMS
      </Button>

      {/* Location Button */}
      <Button
        size="sm"
        variant="outline"
        className="bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300 touch-manipulation min-h-10 px-4"
        onClick={() => onAction('location', appointment)}
        data-testid={`button-location-${appointment.id}`}
      >
        <Navigation className="h-4 w-4 mr-2" />
        Location
      </Button>
    </div>
  );
};

// Advanced appointment card with animations and touch optimization
const AppointmentCard = ({ appointment, onAction, onViewDetails }: {
  appointment: any;
  onAction: (action: string, appointment: any) => void;
  onViewDetails: (appointment: any) => void;
}) => {
  const timeUntil = new Date(appointment.scheduledAt).getTime() - Date.now();
  const isUpcoming = timeUntil < 60 * 60 * 1000; // Less than 1 hour
  const isOverdue = timeUntil < 0;

  return (
    <Card className={`transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer border-l-4 ${
      appointment.priority === 'critical' ? 'border-l-red-500 bg-red-50/50 dark:bg-red-900/10' :
      appointment.priority === 'high' ? 'border-l-orange-500 bg-orange-50/50 dark:bg-orange-900/10' :
      appointment.priority === 'medium' ? 'border-l-blue-500 bg-blue-50/50 dark:bg-blue-900/10' :
      'border-l-gray-500 bg-gray-50/50 dark:bg-gray-900/10'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <PriorityIndicator priority={appointment.priority} />
              <CardTitle className="text-lg font-semibold">{appointment.title}</CardTitle>
              {appointment.urgencyLevel && <UrgencyBadge urgency={appointment.urgencyLevel} />}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-4 w-4" />
                {format(new Date(appointment.scheduledAt), "MMM dd, yyyy")}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {format(new Date(appointment.scheduledAt), "h:mm a")}
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {appointment.customerName}
              </div>
              {isUpcoming && !isOverdue && (
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                  <Timer className="h-3 w-3 mr-1" />
                  Soon
                </Badge>
              )}
              {isOverdue && (
                <Badge variant="destructive" className="animate-pulse">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Overdue
                </Badge>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetails(appointment)}
            className="touch-manipulation"
            data-testid={`button-view-details-${appointment.id}`}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Service and Vehicle Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="font-medium text-muted-foreground">Service:</span>
              <p className="font-medium">{appointment.serviceRequired}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Vehicle:</span>
              <p className="font-medium">{appointment.vehicleInfo}</p>
            </div>
          </div>

          {/* Customer Info Row */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                {appointment.customerName.charAt(0)}
              </div>
              <div>
                <p className="font-medium">{appointment.customerName}</p>
                <p className="text-sm text-muted-foreground">{appointment.customerPhone}</p>
              </div>
            </div>
            <div className="text-right">
              <Badge variant="secondary">{appointment.customerType}</Badge>
              {appointment.leadScore && (
                <p className="text-xs text-muted-foreground mt-1">Score: {appointment.leadScore}%</p>
              )}
            </div>
          </div>

          {/* Value and Duration */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
                ₹{appointment.estimatedValue?.toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-blue-600" />
                {appointment.estimatedDuration}min
              </span>
            </div>
            <Badge variant="outline" className={`${
              appointment.status === 'scheduled' ? 'border-blue-300 text-blue-700' :
              appointment.status === 'confirmed' ? 'border-green-300 text-green-700' :
              appointment.status === 'in_progress' ? 'border-yellow-300 text-yellow-700' :
              appointment.status === 'completed' ? 'border-purple-300 text-purple-700' :
              'border-gray-300 text-gray-700'
            }`}>
              {appointment.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>

          {/* Notes */}
          {appointment.notes && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-300">{appointment.notes}</p>
            </div>
          )}

          {/* Communication Actions */}
          <CommunicationActions appointment={appointment} onAction={onAction} />
        </div>
      </CardContent>
    </Card>
  );
};

// Calendar Component
const CalendarView = ({ appointments, onAppointmentClick }: {
  appointments: any[];
  onAppointmentClick: (appointment: any) => void;
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Generate calendar days
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  });
  
  // Group appointments by date
  const appointmentsByDate = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    appointments.forEach(apt => {
      const dateKey = format(new Date(apt.scheduledAt), 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(apt);
    });
    return grouped;
  }, [appointments]);
  
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border shadow-sm">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentMonth(addDays(currentMonth, -30))}
          className="touch-manipulation"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentMonth(addDays(currentMonth, 30))}
          className="touch-manipulation"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Calendar Grid */}
      <div className="p-4">
        {/* Week Headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, index) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayAppointments = appointmentsByDate[dateKey] || [];
            const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
            const isToday = isSameDay(day, new Date());
            
            return (
              <div
                key={index}
                className={`min-h-[100px] p-2 border rounded-lg cursor-pointer transition-all hover:bg-muted/50 ${
                  isCurrentMonth ? 'bg-white dark:bg-gray-900' : 'bg-muted/20'
                } ${
                  isToday ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                <div className={`text-sm font-medium mb-1 ${
                  isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
                } ${
                  isToday ? 'text-blue-600 dark:text-blue-400' : ''
                }`}>
                  {format(day, 'd')}
                </div>
                
                {/* Appointments for this day */}
                <div className="space-y-1">
                  {dayAppointments.slice(0, 3).map((apt, idx) => (
                    <div
                      key={idx}
                      onClick={() => onAppointmentClick(apt)}
                      className={`text-xs p-1 rounded truncate cursor-pointer hover:scale-105 transition-transform ${
                        apt.priority === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200' :
                        apt.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200' :
                        apt.priority === 'medium' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <div className={`h-1.5 w-1.5 rounded-full ${
                          apt.priority === 'critical' ? 'bg-red-500' :
                          apt.priority === 'high' ? 'bg-orange-500' :
                          apt.priority === 'medium' ? 'bg-blue-500' :
                          'bg-gray-500'
                        }`} />
                        <span className="truncate">{apt.title}</span>
                      </div>
                      <div className="text-xs opacity-75 mt-0.5">
                        {format(new Date(apt.scheduledAt), 'HH:mm')}
                      </div>
                    </div>
                  ))}
                  
                  {/* Show +X more if there are more appointments */}
                  {dayAppointments.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center">
                      +{dayAppointments.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Main component
export default function AppointmentsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<"today" | "upcoming" | "week" | "month" | "calendar">("today");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Filter appointments based on current view and search
  const filteredAppointments = useMemo(() => {
    let filtered = [...MOCK_APPOINTMENTS];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(apt => 
        apt.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.serviceRequired.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.vehicleInfo.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply view filter
    const now = new Date();
    if (currentView === "today") {
      filtered = filtered.filter(apt => isSameDay(new Date(apt.scheduledAt), now));
    } else if (currentView === "upcoming") {
      filtered = filtered.filter(apt => {
        const aptDate = new Date(apt.scheduledAt);
        return aptDate >= now && aptDate <= addDays(now, 7);
      });
    }

    // Sort by priority and time
    filtered.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
      
      if (aPriority !== bPriority) return bPriority - aPriority;
      return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
    });

    return filtered;
  }, [currentView, searchQuery]);

  // Calculate metrics
  const appointmentMetrics = useMemo(() => {
    return {
      total: MOCK_APPOINTMENTS.length,
      critical: MOCK_APPOINTMENTS.filter(apt => apt.priority === 'critical').length,
      urgent: MOCK_APPOINTMENTS.filter(apt => apt.urgencyLevel === 'urgent' || apt.urgencyLevel === 'critical').length,
      confirmed: MOCK_APPOINTMENTS.filter(apt => apt.status === 'confirmed').length,
      pending: MOCK_APPOINTMENTS.filter(apt => apt.status === 'scheduled').length,
      totalValue: MOCK_APPOINTMENTS.reduce((sum, apt) => sum + (apt.estimatedValue || 0), 0)
    };
  }, []);

  // Handle communication actions
  const handleCommunicationAction = async (action: string, appointment: any) => {
    switch (action) {
      case 'whatsapp':
        // Mock WhatsApp integration
        toast({
          title: "WhatsApp Message",
          description: `Opening WhatsApp to message ${appointment.customerName}...`,
        });
        // In real implementation: window.open(`https://wa.me/${appointment.customerPhone}`)
        break;
      case 'call':
        // Mock call integration  
        toast({
          title: "Initiating Call", 
          description: `Calling ${appointment.customerName} at ${appointment.customerPhone}...`,
        });
        // In real implementation: Use Twilio or similar service
        break;
      case 'sms':
        // Mock SMS integration
        toast({
          title: "SMS Message",
          description: `Opening SMS to ${appointment.customerName}...`,
        });
        break;
      case 'location':
        // Mock location sharing
        toast({
          title: "Location Shared",
          description: `Sending store location to ${appointment.customerName}...`,
        });
        break;
    }
  };

  const handleViewDetails = (appointment: any) => {
    setSelectedAppointment(appointment);
    setIsDetailModalOpen(true);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section with Metrics */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Appointment Management
              </h1>
              <p className="text-muted-foreground mt-2">
                Advanced appointment system with real-time communication
              </p>
            </div>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg touch-manipulation min-h-12 px-6"
              data-testid="button-create-appointment"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Appointment
            </Button>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">Total</p>
                    <p className="text-2xl font-bold">{appointmentMetrics.total}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100">Critical</p>
                    <p className="text-2xl font-bold">{appointmentMetrics.critical}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-red-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100">Urgent</p>
                    <p className="text-2xl font-bold">{appointmentMetrics.urgent}</p>
                  </div>
                  <Zap className="h-8 w-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100">Confirmed</p>
                    <p className="text-2xl font-bold">{appointmentMetrics.confirmed}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100">Pending</p>
                    <p className="text-2xl font-bold">{appointmentMetrics.pending}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100">Total Value</p>
                    <p className="text-xl font-bold">₹{(appointmentMetrics.totalValue / 1000).toFixed(0)}K</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* View Controls and Search */}
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="touch-manipulation"
                data-testid="button-list-view"
              >
                <List className="h-4 w-4 mr-2" />
                List View
              </Button>
              <Button
                variant={viewMode === "calendar" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("calendar")}
                className="touch-manipulation"
                data-testid="button-calendar-view"
              >
                <CalendarDays className="h-4 w-4 mr-2" />
                Calendar View
              </Button>
            </div>
            
            {/* Filter Tabs - Only show for list view */}
            {viewMode === "list" && (
              <Tabs value={currentView} onValueChange={(value: any) => setCurrentView(value)}>
                <TabsList className="grid w-full md:w-auto grid-cols-4 bg-white/50 backdrop-blur-sm border shadow-sm">
                  <TabsTrigger value="today" className="touch-manipulation" data-testid="tab-today">Today</TabsTrigger>
                  <TabsTrigger value="upcoming" className="touch-manipulation" data-testid="tab-upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="week" className="touch-manipulation" data-testid="tab-week">Week</TabsTrigger>
                  <TabsTrigger value="month" className="touch-manipulation" data-testid="tab-month">Month</TabsTrigger>
                </TabsList>
              </Tabs>
            )}

            
            {/* Search and Filter */}
            <div className="flex gap-2 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search appointments, customers, services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/50 backdrop-blur-sm border shadow-sm touch-manipulation min-h-10"
                  data-testid="input-search-appointments"
                />
              </div>
              <Button variant="outline" size="sm" className="touch-manipulation min-h-10">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="space-y-4">
          {viewMode === "calendar" ? (
            /* Calendar View */
            <CalendarView 
              appointments={searchQuery ? filteredAppointments : MOCK_APPOINTMENTS}
              onAppointmentClick={handleViewDetails}
            />
          ) : (
            /* List View */
            filteredAppointments.length === 0 ? (
              <Card className="p-12 text-center bg-white/50 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-4">
                  <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center">
                    <Calendar className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">No appointments found</h3>
                    <p className="text-muted-foreground">Try adjusting your search or view filters</p>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onAction={handleCommunicationAction}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            )
          )}
        </div>

        {/* Appointment Detail Modal */}
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedAppointment && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-3">
                    <PriorityIndicator priority={selectedAppointment.priority} size="lg" />
                    <div>
                      <DialogTitle className="text-xl">{selectedAppointment.title}</DialogTitle>
                      <DialogDescription className="flex items-center gap-2 mt-1">
                        <Clock className="h-4 w-4" />
                        {format(new Date(selectedAppointment.scheduledAt), "PPpp")}
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>
                
                <div className="space-y-6 py-4">
                  {/* Customer Section */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-lg">Customer Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <p className="font-medium">{selectedAppointment.customerName}</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <p className="font-medium">{selectedAppointment.customerPhone}</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <p className="font-medium">{selectedAppointment.customerEmail}</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Customer Type</Label>
                        <Badge variant="secondary">{selectedAppointment.customerType}</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Service Section */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-lg">Service Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Service Required</Label>
                        <p className="font-medium">{selectedAppointment.serviceRequired}</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Vehicle Information</Label>
                        <p className="font-medium">{selectedAppointment.vehicleInfo}</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Estimated Duration</Label>
                        <p className="font-medium">{selectedAppointment.estimatedDuration} minutes</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Estimated Value</Label>
                        <p className="font-medium text-green-600">₹{selectedAppointment.estimatedValue?.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Notes Section */}
                  {selectedAppointment.notes && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-lg">Notes</h4>
                      <div className="p-4 bg-muted rounded-lg">
                        <p>{selectedAppointment.notes}</p>
                      </div>
                    </div>
                  )}

                  {/* Communication Actions */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-lg">Quick Actions</h4>
                    <CommunicationActions 
                      appointment={selectedAppointment} 
                      onAction={handleCommunicationAction} 
                    />
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
    </>
  );
}