import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  X,
  CheckCircle,
  Calendar,
  DollarSign,
  Clock,
  AlertTriangle,
  Trash2,
  Plus,
  SortAsc,
  SortDesc,
  Grid3X3,
  List,
  Eye,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useSubscriptions, type Subscription } from "@/hooks/useSubscriptions";
import { supabase } from "@/integrations/supabase/client";
import AddSubscriptionForm from "./AddSubscriptionForm";
import { CancelSubscriptionDialog } from "./CancelSubscriptionDialog";
import Layout from "./Layout";

interface SubscriptionListProps {
  onAddNew?: () => void;
  onEditSubscription?: (subscription: Subscription) => void;
}

const SubscriptionList = ({ onAddNew, onEditSubscription }: SubscriptionListProps) => {
  const { toast } = useToast();
  const { subscriptions, loading, error } = useSubscriptions();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("next_due_date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);

  const handleEditSubscription = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setIsAddFormOpen(true);
  };

  const [cancellingSubscription, setCancellingSubscription] = useState<Subscription | null>(null);
  
  const handleCancelSubscription = (subscription: Subscription) => {
    setCancellingSubscription(subscription);
  };

  const categories = [
    "all",
    "entertainment",
    "music", 
    "productivity",
    "development",
    "storage",
    "fitness",
    "education",
    "news",
    "business",
    "other",
  ];

  const statuses = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
  ];

  const sortOptions = [
    { value: "next_due_date", label: "Due Date" },
    { value: "name", label: "Service Name" },
    { value: "amount", label: "Amount" },
    { value: "category", label: "Category" },
  ];

  const filteredAndSortedSubscriptions = useMemo(() => {
    let filtered = subscriptions.filter((subscription) => {
      const matchesSearch = subscription.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        categoryFilter === "all" || subscription.category.toLowerCase() === categoryFilter;
      const matchesStatus = statusFilter === "all"; // All subscriptions are considered active

      return matchesSearch && matchesCategory && matchesStatus;
    });

    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Subscription];
      let bValue: any = b[sortBy as keyof Subscription];

      if (sortBy === "next_due_date") {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (sortBy === "amount") {
        aValue = parseFloat(String(aValue));
        bValue = parseFloat(String(bValue));
      } else if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [subscriptions, searchQuery, categoryFilter, statusFilter, sortBy, sortOrder]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getDaysUntil = (dateString: string) => {
    const today = new Date();
    const dueDate = new Date(dateString);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (daysUntil: number) => {
    if (daysUntil < 0) {
      return "bg-red-100 text-red-800 hover:bg-red-200"; // Overdue
    } else if (daysUntil <= 3) {
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"; // Due soon
    } else {
      return "bg-green-100 text-green-800 hover:bg-green-200"; // Active
    }
  };

  const getStatusIcon = (daysUntil: number) => {
    if (daysUntil < 0) {
      return <AlertTriangle className="w-3 h-3" />; // Overdue
    } else if (daysUntil <= 3) {
      return <Clock className="w-3 h-3" />; // Due soon
    } else {
      return <CheckCircle className="w-3 h-3" />; // Active
    }
  };

  const getStatusText = (daysUntil: number) => {
    if (daysUntil < 0) {
      return "Overdue";
    } else if (daysUntil <= 3) {
      return "Due Soon";
    } else {
      return "Active";
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-gray-600">Loading subscriptions...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <Card className="p-12 text-center">
          <div className="text-red-500 mb-4">
            <AlertTriangle className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Error loading subscriptions</h3>
            <p>{error}</p>
          </div>
        </Card>
      </div>
    );
  }

  const handleViewDetails = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setIsDetailModalOpen(true);
  };

  const totalMonthlyAmount = subscriptions.reduce((sum, sub) => sum + sub.amount, 0);

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === "asc" ? "desc" : "asc");
  };

  return (
    <Layout onAddSubscription={onAddNew}>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Subscriptions</h1>
            <p className="text-gray-600 mt-1">
              Manage all your subscriptions • Total: ${totalMonthlyAmount.toFixed(2)}/month
            </p>
          </div>
          <Button onClick={onAddNew} variant="hero">
            <Plus className="w-4 h-4 mr-2" />
            Add Subscription
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search subscriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[160px] bg-white">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-lg z-50">
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === "all" ? "All Categories" : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] bg-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-lg z-50">
                  {statuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px] bg-white">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-lg z-50">
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={toggleSortOrder}
                className="px-3"
              >
                {sortOrder === "asc" ? (
                  <SortAsc className="w-4 h-4" />
                ) : (
                  <SortDesc className="w-4 h-4" />
                )}
              </Button>

              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none border-l"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {filteredAndSortedSubscriptions.length} subscription(s) found
        </p>
      </div>

      {/* Subscription Cards */}
      {filteredAndSortedSubscriptions.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-gray-400 mb-4">
            <Search className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No subscriptions found</h3>
            <p className="text-gray-500">
              {searchQuery || categoryFilter !== "all" || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Get started by adding your first subscription"}
            </p>
          </div>
          {(!searchQuery && categoryFilter === "all" && statusFilter === "all") && (
            <Button onClick={onAddNew} variant="hero" className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Subscription
            </Button>
          )}
        </Card>
      ) : (
        <div className={cn(
          "grid gap-6",
          viewMode === "grid" 
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
            : "grid-cols-1"
        )}>
          {filteredAndSortedSubscriptions.map((subscription) => {
            const daysUntil = getDaysUntil(subscription.next_due_date);
            const isOverdue = daysUntil < 0;
            const isDueSoon = daysUntil <= 3 && daysUntil >= 0;
            const statusColor = getStatusColor(daysUntil);
            const statusIcon = getStatusIcon(daysUntil);
            const statusText = getStatusText(daysUntil);

            return (
              <Card 
                key={subscription.id} 
                className={cn(
                  "hover:shadow-elegant transition-shadow duration-200",
                  viewMode === "list" && "flex-row",
                  isOverdue && "ring-2 ring-red-200",
                  isDueSoon && "ring-2 ring-yellow-200"
                )}
              >
                <CardContent className={cn(
                  "p-6",
                  viewMode === "list" && "flex items-center justify-between w-full"
                )}>
                  <div className={cn(
                    "space-y-4",
                    viewMode === "list" && "flex items-center space-y-0 space-x-4 flex-1"
                  )}>
                    {/* Service Info */}
                    <div className={cn(
                      "flex items-center space-x-4",
                      viewMode === "list" && "flex-1"
                    )}>
                      <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {subscription.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {subscription.name}
                        </h3>
                        <p className="text-sm text-gray-500 capitalize">
                          {subscription.category} • {subscription.billing_cycle}
                        </p>
                      </div>
                    </div>

                    {/* Amount and Due Date */}
                    <div className={cn(
                      "space-y-2",
                      viewMode === "list" && "flex items-center space-y-0 space-x-6"
                    )}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span className="font-bold text-lg text-gray-900">
                            ${subscription.amount}
                          </span>
                        </div>
                        {viewMode === "grid" && (
                          <Badge className={statusColor}>
                            {statusIcon}
                            <span className="ml-1">{statusText}</span>
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Due {formatDate(subscription.next_due_date)}
                        </span>
                        {isOverdue && (
                          <Badge className="bg-red-100 text-red-800 text-xs">
                            {Math.abs(daysUntil)} days overdue
                          </Badge>
                        )}
                        {isDueSoon && (
                          <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                            Due in {daysUntil} days
                          </Badge>
                        )}
                      </div>
                    </div>

                    {viewMode === "list" && (
                      <Badge className={statusColor}>
                        {statusIcon}
                        <span className="ml-1">{statusText}</span>
                      </Badge>
                    )}
                  </div>

                  {/* Actions */}
                  <div className={cn(
                    "flex justify-end",
                    viewMode === "list" && "ml-4"
                  )}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent 
                        align="end" 
                        className="w-48 bg-white border shadow-lg z-50"
                      >
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleViewDetails(subscription)}
                          className="cursor-pointer"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleEditSubscription(subscription)}
                          className="cursor-pointer"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Subscription
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleCancelSubscription(subscription)}
                          className="cursor-pointer text-red-600"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Cancel Subscription
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      
      {/* Simple Detail Modal - using Dialog instead of SubscriptionDetailModal */}
      {selectedSubscription && (
        <div 
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 ${isDetailModalOpen ? 'block' : 'hidden'}`}
          onClick={() => setIsDetailModalOpen(false)}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">Subscription Details</h3>
            <div className="space-y-3">
              <div><strong>Name:</strong> {selectedSubscription.name}</div>
              <div><strong>Amount:</strong> ${selectedSubscription.amount}</div>
              <div><strong>Due Date:</strong> {formatDate(selectedSubscription.next_due_date)}</div>
              <div><strong>Category:</strong> {selectedSubscription.category}</div>
              <div><strong>Billing Cycle:</strong> {selectedSubscription.billing_cycle}</div>
              {selectedSubscription.vendor_website && (
                <div><strong>Website:</strong> {selectedSubscription.vendor_website}</div>
              )}
              {selectedSubscription.notes && (
                <div><strong>Notes:</strong> {selectedSubscription.notes}</div>
              )}
            </div>
            <div className="flex justify-end mt-6 space-x-2">
              <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
                Close
              </Button>
              <Button onClick={() => {
                setIsDetailModalOpen(false);
                handleEditSubscription(selectedSubscription);
              }}>
                Edit
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Subscription Form Modal */}
      <AddSubscriptionForm 
        open={isAddFormOpen}
        onOpenChange={(open) => {
          setIsAddFormOpen(open);
          if (!open) {
            setEditingSubscription(null);
          }
        }}
        editingSubscription={editingSubscription}
        onSubmit={(data) => {
          console.log("Subscription saved:", data);
        }}
      />

      <CancelSubscriptionDialog
        isOpen={!!cancellingSubscription}
        onClose={() => setCancellingSubscription(null)}
        subscription={cancellingSubscription}
      />
    </Layout>
  );
};

export default SubscriptionList;