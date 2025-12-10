import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  Send, 
  Plus, 
  Calendar, 
  Clock, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  MessageCircle,
  PhoneCall,
  Smartphone,
  Star,
  Filter,
  Search,
  Settings,
  Bell,
  Target,
  BarChart3,
  Activity,
  Users,
  ThumbsUp,
  ThumbsDown,
  User,
  Bot,
  Headphones,
  ExternalLink,
  Eye,
  Download
} from "lucide-react";
import { type Customer } from "@/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface CommunicationHistoryPanelProps {
  customer: Customer;
  className?: string;
}

interface CommunicationRecord {
  id: string;
  type: "sms" | "whatsapp" | "email" | "phone_call" | "appointment_reminder" | "marketing" | "feedback_request" | "service_reminder";
  direction: "outbound" | "inbound";
  subject?: string;
  content: string;
  status: "sent" | "delivered" | "read" | "replied" | "failed" | "pending";
  sentAt: Date;
  readAt?: Date;
  repliedAt?: Date;
  responseContent?: string;
  sentBy: string; // staff member name
  channelDetails?: {
    phoneNumber?: string;
    emailAddress?: string;
    campaignId?: string;
    templateId?: string;
  };
  metadata?: {
    deliveryId?: string;
    messageId?: string;
    cost?: number;
    provider?: string;
  };
}

interface CommunicationStats {
  totalMessages: number;
  responseRate: number;
  averageResponseTime: number; // in hours
  preferredChannel: string;
  engagementScore: number;
  lastCommunication: Date;
  communicationFrequency: number; // messages per month
  marketingOptIn: boolean;
  bestTimeToContact: string;
  channelBreakdown: {
    sms: number;
    whatsapp: number;
    email: number;
    phone: number;
  };
  monthlyTrends: Array<{
    month: string;
    sent: number;
    received: number;
    responseRate: number;
  }>;
}

interface CommunicationPreferences {
  preferredChannel: "sms" | "whatsapp" | "email" | "phone";
  marketingConsent: boolean;
  appointmentReminders: boolean;
  serviceReminders: boolean;
  promotionalMessages: boolean;
  bestTimeStart: string;
  bestTimeEnd: string;
  frequency: "immediate" | "daily" | "weekly" | "monthly";
  language: string;
  doNotDisturbDays: string[];
}

const messageFormSchema = z.object({
  type: z.enum(["sms", "whatsapp", "email", "phone_call"]),
  subject: z.string().optional(),
  content: z.string().min(1, "Message content is required"),
  scheduledFor: z.string().optional(),
});

type MessageFormData = z.infer<typeof messageFormSchema>;

const preferencesFormSchema = z.object({
  preferredChannel: z.enum(["sms", "whatsapp", "email", "phone"]),
  marketingConsent: z.boolean(),
  appointmentReminders: z.boolean(),
  serviceReminders: z.boolean(),
  promotionalMessages: z.boolean(),
  bestTimeStart: z.string(),
  bestTimeEnd: z.string(),
  frequency: z.enum(["immediate", "daily", "weekly", "monthly"]),
  language: z.string(),
});

type PreferencesFormData = z.infer<typeof preferencesFormSchema>;

export default function CommunicationHistoryPanel({ 
  customer, 
  className = ""
}: CommunicationHistoryPanelProps) {
  const [selectedRecord, setSelectedRecord] = useState<CommunicationRecord | null>(null);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [isPreferencesDialogOpen, setIsPreferencesDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  // Fetch communication history
  const { data: communications = [], isLoading: communicationsLoading } = useQuery<CommunicationRecord[]>({
    queryKey: ["/api/customers", customer.id, "communications"],
    staleTime: 2 * 60 * 1000,
  });

  // Fetch communication statistics
  const { data: stats, isLoading: statsLoading } = useQuery<CommunicationStats>({
    queryKey: ["/api/customers", customer.id, "communications", "stats"],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/customers/${customer.id}/communications/stats`);
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch communication preferences
  const { data: preferences, isLoading: preferencesLoading } = useQuery<CommunicationPreferences>({
    queryKey: ["/api/customers", customer.id, "communication-preferences"],
    queryFn: async () => {
      // Mock data based on customer schema
      return {
        preferredChannel: "whatsapp",
        marketingConsent: customer.marketingConsent || false,
        appointmentReminders: true,
        serviceReminders: true,
        promotionalMessages: customer.marketingConsent || false,
        bestTimeStart: "09:00",
        bestTimeEnd: "18:00",
        frequency: "weekly",
        language: customer.preferredLanguage || "English",
        doNotDisturbDays: ["Sunday"],
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: MessageFormData) => {
      const response = await apiRequest("POST", `/api/customers/${customer.id}/send-message`, messageData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers", customer.id, "communications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/customers", customer.id, "communication-stats"] });
      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully.",
      });
      setIsMessageDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (preferencesData: PreferencesFormData) => {
      const response = await apiRequest("PUT", `/api/customers/${customer.id}/communication-preferences`, preferencesData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers", customer.id, "communication-preferences"] });
      toast({
        title: "Preferences Updated",
        description: "Communication preferences have been updated successfully.",
      });
      setIsPreferencesDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive",
      });
    },
  });

  const messageForm = useForm<MessageFormData>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: {
      type: "whatsapp",
      content: "",
    },
  });

  const preferencesForm = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesFormSchema),
    defaultValues: preferences,
  });

  // Update form when preferences load
  useEffect(() => {
    if (preferences) {
      preferencesForm.reset(preferences);
    }
  }, [preferences]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case "sms":
        return <MessageSquare className="w-4 h-4" />;
      case "whatsapp":
        return <MessageCircle className="w-4 h-4" />;
      case "email":
        return <Mail className="w-4 h-4" />;
      case "phone_call":
        return <PhoneCall className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "text-blue-600";
      case "delivered":
        return "text-green-600";
      case "read":
        return "text-purple-600";
      case "replied":
        return "text-green-700";
      case "failed":
        return "text-red-600";
      case "pending":
        return "text-orange-600";
      default:
        return "text-gray-600";
    }
  };

  const getEngagementColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const filteredCommunications = communications.filter(comm => {
    const matchesType = filterType === "all" || comm.type === filterType;
    const matchesSearch = searchQuery === "" || 
      comm.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comm.subject?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const onSendMessage = (data: MessageFormData) => {
    sendMessageMutation.mutate(data);
  };

  const onUpdatePreferences = (data: PreferencesFormData) => {
    updatePreferencesMutation.mutate(data);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Communication Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare size={20} />
              Communication History
              {!communicationsLoading && (
                <Badge variant="outline" className="ml-2">
                  {communications.length} messages
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Dialog open={isPreferencesDialogOpen} onOpenChange={setIsPreferencesDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" data-testid="button-communication-preferences">
                    <Settings size={16} className="mr-1" />
                    Preferences
                  </Button>
                </DialogTrigger>
              </Dialog>
              
              <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" data-testid="button-send-message">
                    <Send size={16} className="mr-1" />
                    Send Message
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </div>
        </CardHeader>

        {/* Communication Stats */}
        <CardContent>
          {statsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Total Messages */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600">Total Messages</p>
                    <p className="text-2xl font-bold text-blue-700">{stats.totalMessages}</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-blue-500" />
                </div>
              </div>

              {/* Response Rate */}
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600">Response Rate</p>
                    <p className="text-2xl font-bold text-green-700">{stats.responseRate}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </div>

              {/* Engagement Score */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600">Engagement</p>
                    <p className={`text-2xl font-bold ${getEngagementColor(stats.engagementScore)}`}>
                      {stats.engagementScore}%
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-purple-500" />
                </div>
              </div>

              {/* Preferred Channel */}
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-600">Preferred Channel</p>
                    <div className="flex items-center gap-2">
                      {getChannelIcon(stats.preferredChannel)}
                      <span className="text-lg font-bold text-orange-700 capitalize">
                        {stats.preferredChannel}
                      </span>
                    </div>
                  </div>
                  <Target className="h-8 w-8 text-orange-500" />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Communication Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Messages & Interactions</CardTitle>
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                  data-testid="input-search-messages"
                />
              </div>
              
              {/* Filter */}
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40" data-testid="select-filter-type">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone_call">Phone Call</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <ScrollArea className="h-96">
            {communicationsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 border rounded-lg">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredCommunications.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Messages Found</h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery || filterType !== "all" 
                    ? "No messages match your search criteria." 
                    : "No communication history with this customer yet."
                  }
                </p>
                {!searchQuery && filterType === "all" && (
                  <Button onClick={() => setIsMessageDialogOpen(true)}>
                    <Send size={16} className="mr-2" />
                    Send First Message
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCommunications.map((comm) => (
                  <div 
                    key={comm.id}
                    className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedRecord(comm)}
                    data-testid={`message-${comm.id}`}
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      {getChannelIcon(comm.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="font-medium capitalize">{comm.type.replace('_', ' ')}</span>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getStatusColor(comm.status)}`}
                          >
                            {comm.status}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {comm.direction === "outbound" ? "Sent" : "Received"}
                          </Badge>
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(comm.sentAt)}
                        </span>
                      </div>
                      
                      {comm.subject && (
                        <p className="font-medium text-gray-900 mb-1">{comm.subject}</p>
                      )}
                      
                      <p className="text-gray-600 text-sm line-clamp-2">{comm.content}</p>
                      
                      {comm.responseContent && (
                        <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                          <span className="font-medium text-blue-900">Customer Response: </span>
                          <span className="text-blue-700">{comm.responseContent}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>By: {comm.sentBy}</span>
                        {comm.readAt && <span>Read: {formatDate(comm.readAt)}</span>}
                        {comm.repliedAt && <span>Replied: {formatDate(comm.repliedAt)}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Channel Performance */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Channel Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Channel Breakdown */}
              <div className="space-y-4">
                <h4 className="font-medium">Messages by Channel</h4>
                <div className="space-y-3">
                  {Object.entries(stats.channelBreakdown).map(([channel, count]) => (
                    <div key={channel} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getChannelIcon(channel)}
                        <span className="capitalize">{channel}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(count / stats.totalMessages) * 100}%` }}
                          ></div>
                        </div>
                        <span className="font-medium w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Communication Insights */}
              <div className="space-y-4">
                <h4 className="font-medium">Insights</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Response Time:</span>
                    <span className="font-medium">{stats.averageResponseTime}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Best Time to Contact:</span>
                    <span className="font-medium">{stats.bestTimeToContact}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Communication Frequency:</span>
                    <span className="font-medium">{stats.communicationFrequency}/month</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Marketing Opt-in:</span>
                    <Badge variant={stats.marketingOptIn ? "default" : "outline"}>
                      {stats.marketingOptIn ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Send Message Dialog */}
      <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send Message to {customer.fullName}</DialogTitle>
          </DialogHeader>
          <Form {...messageForm}>
            <form onSubmit={messageForm.handleSubmit(onSendMessage)} className="space-y-4">
              <FormField
                control={messageForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Channel</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-message-type">
                          <SelectValue placeholder="Select channel" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="phone_call">Phone Call</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {messageForm.watch("type") === "email" && (
                <FormField
                  control={messageForm.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input placeholder="Email subject" {...field} data-testid="input-message-subject" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={messageForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Type your message here..."
                        rows={4}
                        {...field}
                        data-testid="textarea-message-content"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-4">
                <Button 
                  type="submit" 
                  disabled={sendMessageMutation.isPending}
                  className="flex-1"
                  data-testid="button-send-message-submit"
                >
                  {sendMessageMutation.isPending ? "Sending..." : "Send Message"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsMessageDialogOpen(false)}
                  data-testid="button-cancel-message"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Communication Preferences Dialog */}
      <Dialog open={isPreferencesDialogOpen} onOpenChange={setIsPreferencesDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Communication Preferences</DialogTitle>
          </DialogHeader>
          {preferencesLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Form {...preferencesForm}>
              <form onSubmit={preferencesForm.handleSubmit(onUpdatePreferences)} className="space-y-4">
                <FormField
                  control={preferencesForm.control}
                  name="preferredChannel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Channel</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-preferred-channel">
                            <SelectValue placeholder="Select preferred channel" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="sms">SMS</SelectItem>
                          <SelectItem value="whatsapp">WhatsApp</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="phone">Phone</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={preferencesForm.control}
                    name="bestTimeStart"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Best Time (Start)</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} data-testid="input-best-time-start" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={preferencesForm.control}
                    name="bestTimeEnd"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Best Time (End)</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} data-testid="input-best-time-end" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <Label>Communication Preferences</Label>
                  
                  <FormField
                    control={preferencesForm.control}
                    name="marketingConsent"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <FormLabel>Marketing Messages</FormLabel>
                        <FormControl>
                          <Switch 
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-marketing-consent"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={preferencesForm.control}
                    name="appointmentReminders"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <FormLabel>Appointment Reminders</FormLabel>
                        <FormControl>
                          <Switch 
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-appointment-reminders"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={preferencesForm.control}
                    name="serviceReminders"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <FormLabel>Service Reminders</FormLabel>
                        <FormControl>
                          <Switch 
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-service-reminders"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={preferencesForm.control}
                    name="promotionalMessages"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <FormLabel>Promotional Messages</FormLabel>
                        <FormControl>
                          <Switch 
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-promotional-messages"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={preferencesForm.control}
                  name="frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Communication Frequency</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-communication-frequency">
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="immediate">Immediate</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-3 pt-4">
                  <Button 
                    type="submit" 
                    disabled={updatePreferencesMutation.isPending}
                    className="flex-1"
                    data-testid="button-update-preferences"
                  >
                    {updatePreferencesMutation.isPending ? "Updating..." : "Update Preferences"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsPreferencesDialogOpen(false)}
                    data-testid="button-cancel-preferences"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}