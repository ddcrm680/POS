import { useState } from "react";
import POSLayout from "../components/layout/pos-layout";
  import KanbanBoard from "../components/dashboard/kanban-board";
  import JobCardDetail from "../components/forms/job-card-detail";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { type JobCard } from "@/lib/types";
import { 
  Plus, 
  Search, 
  Filter, 
  ClipboardList, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Car,
  Calendar
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

type ViewMode = 'workflow' | 'details' | 'list';

export default function JobCards() {
  const [viewMode, setViewMode] = useState<ViewMode>('workflow');
  const [selectedJobCard, setSelectedJobCard] = useState<JobCard | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch job cards for statistics and list view
  const { data: jobCards = [], isLoading } = useQuery<JobCard[]>({
    queryKey: ["/api/job-cards"],
    refetchInterval: 30000,
  });

  // Calculate statistics
  const activeJobs = jobCards.filter(jc => jc.serviceStatus !== 'pickup').length;
  const overdueJobs = jobCards.filter(jc => 
    jc.promisedReadyAt && 
    new Date(jc.promisedReadyAt) < new Date() && 
    jc.serviceStatus !== 'pickup'
  ).length;
  const completedToday = jobCards.filter(jc => {
    const today = new Date();
    const cardDate = jc.updatedAt ? new Date(jc.updatedAt) : new Date();
    return jc.serviceStatus === 'pickup' && 
           cardDate.toDateString() === today.toDateString();
  }).length;

  // Filter job cards based on search
  const filteredJobCards = jobCards.filter(jc => 
    jc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    searchQuery === ""
  );

  const handleJobCardSelect = (jobCard: JobCard) => {
    setSelectedJobCard(jobCard);
    setViewMode('details');
  };

  const handleCheckInSuccess = (jobCard: JobCard) => {
    setViewMode('workflow');
    // Optionally show the new job card in detail view
    // setSelectedJobCard(jobCard);
    // setViewMode('details');
  };

  const handleStatusUpdate = (updatedJobCard: JobCard) => {
    if (selectedJobCard?.id === updatedJobCard.id) {
      setSelectedJobCard(updatedJobCard);
    }
  };

  const renderStatisticsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Jobs</p>
              <p className="text-2xl font-bold">{activeJobs}</p>
            </div>
            <Car className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{overdueJobs}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completed Today</p>
              <p className="text-2xl font-bold text-green-600">{completedToday}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Jobs</p>
              <p className="text-2xl font-bold">{jobCards.length}</p>
            </div>
            <ClipboardList className="h-8 w-8 text-purple-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderJobCardsList = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>All Job Cards</CardTitle>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search job cards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-jobs"
              />
            </div>
            <Button variant="outline" className="h-12 w-12" data-testid="button-filter">
              <Filter className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading job cards...</p>
          </div>
        ) : filteredJobCards.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchQuery ? 'No job cards found matching your search.' : 'No job cards found.'}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredJobCards.map((jobCard) => (
              <div
                key={jobCard.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                onClick={() => handleJobCardSelect(jobCard)}
                data-testid={`job-card-row-${jobCard.id}`}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium">{jobCard.id}</p>
                    <p className="text-sm text-muted-foreground">
                      {jobCard.createdAt ? new Date(jobCard.createdAt).toLocaleDateString() : 'No date'}
                    </p>
                  </div>
                  
                  <Badge variant={jobCard.serviceStatus === 'pickup' ? 'default' : 'secondary'}>
                    {jobCard.serviceStatus}
                  </Badge>
                  
                  {jobCard.promisedReadyAt && new Date(jobCard.promisedReadyAt) < new Date() && jobCard.serviceStatus !== 'pickup' && (
                    <Badge variant="destructive">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Overdue
                    </Badge>
                  )}
                </div>

                <div className="text-right">
                  {jobCard.finalAmount && parseFloat(jobCard.finalAmount) > 0 && (
                    <p className="font-medium">₹{parseFloat(jobCard.finalAmount).toLocaleString()}</p>
                  )}
                  {jobCard.promisedReadyAt && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(jobCard.promisedReadyAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <>
      <div className="p-3">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">Job Card Management</h1>
              <p className="text-muted-foreground">Manage service workflow and track vehicles</p>
            </div>
            
            <div className="flex gap-2">
              
              <Button
                variant={viewMode === 'workflow' ? 'default' : 'outline'}
                onClick={() => setViewMode('workflow')}
                data-testid="button-workflow-view"
              >
                <ClipboardList className="h-4 w-4 mr-2" />
                Workflow Board
              </Button>
              
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                onClick={() => setViewMode('list')}
                data-testid="button-list-view"
              >
                <Search className="h-4 w-4 mr-2" />
                List View
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {renderStatisticsCards()}

        {/* Main Content Based on View Mode */}

        {viewMode === 'workflow' && (
          <KanbanBoard
            onCardClick={handleJobCardSelect}
onCreateService={() => window.location.href = '/pos-job-creation'}
          />
        )}

        {viewMode === 'details' && selectedJobCard && (
          <JobCardDetail
            jobCardId={selectedJobCard.id}
            onStatusUpdate={handleStatusUpdate}
            onClose={() => setViewMode('workflow')}
          />
        )}

        {viewMode === 'list' && renderJobCardsList()}
      </div>
    </>
  );
}
