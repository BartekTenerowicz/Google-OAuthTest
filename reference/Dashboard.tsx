import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Plus,
  Settings,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  CreditCard,
  Bell,
  User,
  LogOut,
  Search,
  Filter,
  Scan,
  Loader2,
  Edit,
  X,
  MoreHorizontal,
} from "lucide-react";
import AddSubscriptionForm from "./AddSubscriptionForm";
import { GmailAuthPopup } from "./GmailAuthPopup";
import { useNavigate } from "react-router-dom";
import { useSubscriptions, type Subscription } from "@/hooks/useSubscriptions";
import { useGmailAuth } from "@/hooks/useGmailAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Layout from "./Layout";

const Dashboard = () => {
  const navigate = useNavigate();
  const { subscriptions, loading } = useSubscriptions();
  const { hasGmailAuth, loading: gmailLoading } = useGmailAuth();
  const { toast } = useToast();
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [showGmailPopup, setShowGmailPopup] = useState(false);
  const [user] = useState({
    name: "Alex Johnson",
    email: "alex.johnson@email.com",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"
  });

  // Show Gmail auth popup for new users without Gmail permission
  useEffect(() => {
    if (!gmailLoading && !hasGmailAuth) {
      // Check if user has subscriptions (returning user) or no subscriptions (new user)
      if (subscriptions.length === 0 && !loading) {
        // New user - show popup immediately
        setShowGmailPopup(true);
      }
    }
  }, [gmailLoading, hasGmailAuth, subscriptions.length, loading]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const handleEditSubscription = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setIsAddFormOpen(true);
  };

  const handleCancelSubscription = async (subscription: Subscription) => {
    if (!subscription.vendor_website) {
      toast({
        title: "Cannot cancel subscription",
        description: "No vendor website URL found for this subscription.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('cancel-subscription', {
        body: {
          subscriptionName: subscription.name,
          vendorUrl: subscription.vendor_website,
          subscriptionId: subscription.id,
          amount: subscription.amount,
          category: subscription.category
        }
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        toast({
          title: "Cancellation request sent",
          description: `Cancellation request for ${subscription.name} has been sent successfully.`
        });
      } else {
        throw new Error(data?.error || 'Failed to send cancellation request');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast({
        title: "Error cancelling subscription",
        description: "Failed to send cancellation request. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Calculate summary data from real subscriptions
  const summaryData = {
    totalSubscriptions: subscriptions.length,
    monthlySpend: subscriptions.reduce((sum, sub) => sum + sub.amount, 0),
    yearlySavings: 324.50, // This would need to be calculated based on cancelled subscriptions
    activeServices: subscriptions.length
  };

  // Get next 5 upcoming payments
  const upcomingPayments = subscriptions
    .sort((a, b) => new Date(a.next_due_date).getTime() - new Date(b.next_due_date).getTime())
    .slice(0, 5);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getDaysUntil = (dateString: string) => {
    const today = new Date();
    const dueDate = new Date(dateString);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleAddSubscription = () => {
    setEditingSubscription(null);
    setIsAddFormOpen(true);
  };

  const handleManageSubscriptions = () => {
    navigate("/subscriptions");
  };

  return (
    <Layout onAddSubscription={handleAddSubscription}>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user.name.split(' ')[0]}!
        </h1>
        <p className="text-gray-600">Here's an overview of your subscription activity</p>
      </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-elegant transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Subscriptions
              </CardTitle>
              <CreditCard className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{summaryData.totalSubscriptions}</div>
              <p className="text-xs text-gray-500 mt-1">
                {summaryData.activeServices} active services
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-elegant transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Monthly Spend
              </CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                ${summaryData.monthlySpend}
              </div>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingDown className="h-3 w-3 mr-1" />
                12% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-elegant transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Yearly Savings
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${summaryData.yearlySavings}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                From cancelled subscriptions
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-elegant transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Next Payment
              </CardTitle>
              <Calendar className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                ${upcomingPayments[0]?.amount || '0.00'}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {upcomingPayments[0] 
                  ? `${upcomingPayments[0].name} in ${getDaysUntil(upcomingPayments[0].next_due_date)} days`
                  : 'No upcoming payments'
                }
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Payments Section */}
        <div className="grid lg:grid-cols-1 gap-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Upcoming Payments</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    {upcomingPayments.length > 0 
                      ? `Your next ${upcomingPayments.length} subscription renewals` 
                      : 'No upcoming payments scheduled'
                    }
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="ml-2 text-gray-600">Loading subscriptions...</span>
                </div>
              ) : upcomingPayments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No subscriptions found. Add your first subscription to get started!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingPayments.map((payment) => (
                    <div 
                      key={payment.id} 
                      className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          {payment.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{payment.name}</h4>
                          <div className="flex items-center space-x-3 text-sm text-gray-500">
                            <span>Due {formatDate(payment.next_due_date)}</span>
                            <Badge variant="secondary" className="text-xs capitalize">
                              {payment.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">
                            ${payment.amount}
                          </div>
                          <div className="text-sm text-gray-500">
                            {getDaysUntil(payment.next_due_date)} days
                          </div>
                        </div>
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
                              onClick={() => handleEditSubscription(payment)}
                              className="cursor-pointer"
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Subscription
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleCancelSubscription(payment)}
                              className="cursor-pointer text-red-600"
                            >
                              <X className="mr-2 h-4 w-4" />
                              Cancel Subscription
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-6 pt-4 border-t border-gray-100">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate("/subscriptions")}
                >
                  View All Subscriptions
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

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

      {/* Gmail Authorization Popup */}
      <GmailAuthPopup
        isOpen={showGmailPopup}
        onClose={() => setShowGmailPopup(false)}
        onSuccess={() => {
          toast({
            title: "Gmail connected!",
            description: "You can now send automated cancellation emails."
          });
        }}
      />
    </Layout>
  );
};

export default Dashboard;