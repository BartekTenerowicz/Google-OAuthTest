import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import useSwr from 'swr';
import SubscriptionList from '../components/SubscriptionList';
import AddSubscriptionForm from '../components/AddSubscriptionForm';
import fetcher from '../utils/fetcher';

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

interface User {
  _id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
  session: string;
  iat: number;
  exp: number;
}

const Subscriptions = () => {
  const router = useRouter();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Check authentication
  const { data: user, error } = useSwr<User | null>(
    `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/api/me`,
    fetcher
  );

  // Redirect to landing page if not authenticated
  useEffect(() => {
    if (error || (user === null && !error)) {
      router.push('/');
    }
  }, [user, error, router]);

  // Show loading while checking authentication
  if (user === undefined) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem' }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '3px solid #f3f4f6',
          borderTop: '3px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <span style={{ marginLeft: '0.5rem', color: '#64748b' }}>Checking authentication...</span>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  const handleAddNew = () => {
    setEditingSubscription(null);
    setIsFormOpen(true);
  };

  const handleEditSubscription = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingSubscription(null);
  };

  const handleFormSubmit = (data: Subscription) => {
    console.log('Form submitted:', data);
  };

  const handleFormSuccess = () => {
    // Trigger refresh of subscription list
    setRefreshKey(prev => prev + 1);
  };

  return (
    <>
      <SubscriptionList
        onAddNew={handleAddNew}
        onEditSubscription={handleEditSubscription}
        refreshTrigger={refreshKey}
      />
      <AddSubscriptionForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        editingSubscription={editingSubscription}
        onSuccess={handleFormSuccess}
      />
    </>
  );
};

export default Subscriptions;