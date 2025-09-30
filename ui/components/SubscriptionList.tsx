import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import {
  Search,
  MoreHorizontal,
  Edit,
  X,
  CheckCircle,
  Calendar,
  DollarSign,
  Clock,
  AlertTriangle,
  Plus,
  Eye,
  Loader2,
} from "lucide-react";

interface Subscription {
  _id: string;
  name: string;
  amount: number;
  category: string;
  billing_cycle: string;
  next_due_date: string;
  vendor_website?: string;
  notes?: string;
}

interface SubscriptionListProps {
  onAddNew?: () => void;
  onEditSubscription?: (subscription: Subscription) => void;
  refreshTrigger?: number;
}

const SubscriptionList = ({ onAddNew, onEditSubscription, refreshTrigger }: SubscriptionListProps) => {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscriptions();
  }, [refreshTrigger]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('http://localhost:1337/api/subscriptions', {
        withCredentials: true,
      });
      setSubscriptions(response.data || []);
    } catch (error: any) {
      console.error('Error fetching subscriptions:', error);
      setError('Failed to load subscriptions. Please try again.');
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubscription = async (subscriptionId: string) => {
    try {
      await axios.delete(`http://localhost:1337/api/subscriptions/${subscriptionId}`, {
        withCredentials: true,
      });
      await fetchSubscriptions(); // Refresh the list
      setDropdownOpen(null);
    } catch (error: any) {
      console.error('Error deleting subscription:', error);
      alert('Failed to delete subscription. Please try again.');
    }
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

  const filteredSubscriptions = subscriptions.filter((subscription) => {
    const matchesSearch = subscription.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || subscription.category.toLowerCase() === categoryFilter;
    return matchesSearch && matchesCategory;
  });

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

  const getStatusInfo = (daysUntil: number) => {
    if (daysUntil < 0) {
      return {
        text: "Overdue",
        color: "bg-red-100 text-red-800",
        icon: <AlertTriangle size={12} />
      };
    } else if (daysUntil <= 3) {
      return {
        text: "Due Soon",
        color: "bg-yellow-100 text-yellow-800",
        icon: <Clock size={12} />
      };
    } else {
      return {
        text: "Active",
        color: "bg-green-100 text-green-800",
        icon: <CheckCircle size={12} />
      };
    }
  };

  const handleViewDetails = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setIsDetailModalOpen(true);
    setDropdownOpen(null);
  };

  const handleEditSubscription = (subscription: Subscription) => {
    setDropdownOpen(null);
    if (onEditSubscription) {
      onEditSubscription(subscription);
    }
  };

  const handleCancelSubscription = (subscription: Subscription) => {
    setDropdownOpen(null);
    if (confirm(`Are you sure you want to delete the ${subscription.name} subscription?`)) {
      handleDeleteSubscription(subscription._id);
    }
  };

  const totalMonthlyAmount = subscriptions.reduce((sum, sub) => {
    const multiplier = sub.billing_cycle === 'yearly' ? 1/12 :
                     sub.billing_cycle === 'quarterly' ? 1/3 :
                     sub.billing_cycle === 'weekly' ? 4.33 : 1;
    return sum + (sub.amount * multiplier);
  }, 0);

  return (
    <div>
      {/* Loading State */}
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem' }}>
          <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
          <span style={{ marginLeft: '0.5rem', color: '#64748b' }}>Loading subscriptions...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="feature-card" style={{ padding: '2rem', textAlign: 'center', marginBottom: '2rem' }}>
          <AlertTriangle size={48} style={{ color: '#dc2626', margin: '0 auto 1rem' }} />
          <h3 style={{ color: '#dc2626', marginBottom: '0.5rem' }}>Error Loading Subscriptions</h3>
          <p style={{ color: '#64748b', marginBottom: '1rem' }}>{error}</p>
          <button className="btn btn-primary" onClick={fetchSubscriptions}>
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Page Header */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>
                  Subscriptions
                </h1>
                <p style={{ color: '#64748b', margin: '0.5rem 0 0 0' }}>
                  Manage all your subscriptions • Total: ${totalMonthlyAmount.toFixed(2)}/month
                </p>
              </div>
              <button className="btn btn-primary" onClick={onAddNew}>
                <Plus size={16} />
                Add Subscription
              </button>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="feature-card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Search */}
              <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                <input
                  type="text"
                  placeholder="Search subscriptions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem 0.5rem 2.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  minWidth: '140px'
                }}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
              {filteredSubscriptions.length} subscription(s) found
            </p>
          </div>

          {/* Subscription Cards */}
          {filteredSubscriptions.length === 0 ? (
            <div className="feature-card" style={{ padding: '3rem', textAlign: 'center' }}>
              <div style={{ color: '#9ca3af', marginBottom: '1rem' }}>
                <Search size={64} style={{ margin: '0 auto 1rem', color: '#d1d5db' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#64748b', marginBottom: '0.5rem' }}>
                  No subscriptions found
                </h3>
                <p style={{ color: '#9ca3af' }}>
                  {searchQuery || categoryFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "Get started by adding your first subscription"}
                </p>
              </div>
              {(!searchQuery && categoryFilter === "all") && (
                <button className="btn btn-primary" onClick={onAddNew} style={{ marginTop: '1rem' }}>
                  <Plus size={16} />
                  Add Your First Subscription
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
              {filteredSubscriptions.map((subscription) => {
                const daysUntil = getDaysUntil(subscription.next_due_date);
                const statusInfo = getStatusInfo(daysUntil);

                return (
                  <div
                    key={subscription._id}
                    className="feature-card"
                    style={{ position: 'relative', cursor: 'pointer' }}
                    onClick={() => handleViewDetails(subscription)}
                  >
                    {/* Service Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{
                        width: '3rem',
                        height: '3rem',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                        borderRadius: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.875rem'
                      }}>
                        {subscription.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontWeight: '600', color: '#1e293b', margin: 0 }}>
                          {subscription.name}
                        </h3>
                        <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0, textTransform: 'capitalize' }}>
                          {subscription.category} • {subscription.billing_cycle}
                        </p>
                      </div>
                    </div>

                    {/* Amount and Status */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <DollarSign size={16} style={{ color: '#9ca3af' }} />
                        <span style={{ fontWeight: 'bold', fontSize: '1.125rem', color: '#1e293b' }}>
                          ${subscription.amount}
                        </span>
                      </div>
                      <div
                        className={statusInfo.color}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.375rem',
                          fontSize: '0.75rem',
                          fontWeight: '500'
                        }}
                      >
                        {statusInfo.icon}
                        {statusInfo.text}
                      </div>
                    </div>

                    {/* Due Date */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                      <Calendar size={16} style={{ color: '#9ca3af' }} />
                      <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                        Due {formatDate(subscription.next_due_date)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                      <button
                        className="btn btn-outline"
                        style={{ padding: '0.5rem', minWidth: 'auto' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setDropdownOpen(dropdownOpen === subscription._id ? null : subscription._id);
                        }}
                      >
                        <MoreHorizontal size={16} />
                      </button>

                      {/* Dropdown Menu */}
                      {dropdownOpen === subscription._id && (
                        <>
                          <div
                            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 40 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setDropdownOpen(null);
                            }}
                          />
                          <div
                            className="dropdown"
                            style={{
                              position: 'absolute',
                              top: '100%',
                              right: 0,
                              marginTop: '0.5rem',
                              zIndex: 50
                            }}
                          >
                            <button
                              className="dropdown-item"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetails(subscription);
                              }}
                            >
                              <Eye size={16} />
                              View Details
                            </button>
                            <button
                              className="dropdown-item"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditSubscription(subscription);
                              }}
                            >
                              <Edit size={16} />
                              Edit Subscription
                            </button>
                            <button
                              className="dropdown-item danger"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancelSubscription(subscription);
                              }}
                            >
                              <X size={16} />
                              Cancel Subscription
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      {selectedSubscription && isDetailModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50
          }}
          onClick={() => setIsDetailModalOpen(false)}
        >
          <div
            className="feature-card"
            style={{
              maxWidth: '28rem',
              width: '100%',
              margin: '1rem',
              maxHeight: '80vh',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
              Subscription Details
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
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
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
              <button className="btn btn-outline" onClick={() => setIsDetailModalOpen(false)}>
                Close
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  handleEditSubscription(selectedSubscription);
                }}
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionList;