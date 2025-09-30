import { useEffect } from 'react';
import { useRouter } from 'next/router';
import useSwr from 'swr';
import fetcher from '../utils/fetcher';

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

interface Subscription {
  _id: string;
  user: string;
  name: string;
  amount: number;
  category: string;
  billing_cycle: 'monthly' | 'yearly' | 'weekly' | 'quarterly';
  next_due_date: string;
  vendor_website?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const Dashboard = () => {
  const router = useRouter();

  // Check authentication
  const { data: user, error } = useSwr<User | null>(
    `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/api/me`,
    fetcher
  );

  // Fetch subscriptions
  const { data: subscriptions } = useSwr<Subscription[]>(
    user ? `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/api/subscriptions` : null,
    fetcher
  );

  // Redirect to landing page if not authenticated
  useEffect(() => {
    if (error || (user === null && !error)) {
      router.push('/');
    }
  }, [user, error, router]);

  // Calculate metrics
  const calculateMetrics = () => {
    if (!subscriptions || subscriptions.length === 0) {
      return {
        totalSubscriptions: 0,
        monthlySpending: 0,
        yearlySpending: 0,
        nextPaymentDate: null,
        nextPaymentName: null,
      };
    }

    const monthlySpending = subscriptions.reduce((total, sub) => {
      const amount = sub.amount;
      switch (sub.billing_cycle) {
        case 'monthly':
          return total + amount;
        case 'yearly':
          return total + amount / 12;
        case 'weekly':
          return total + (amount * 52) / 12;
        case 'quarterly':
          return total + amount / 3;
        default:
          return total;
      }
    }, 0);

    const yearlySpending = subscriptions.reduce((total, sub) => {
      const amount = sub.amount;
      switch (sub.billing_cycle) {
        case 'monthly':
          return total + amount * 12;
        case 'yearly':
          return total + amount;
        case 'weekly':
          return total + amount * 52;
        case 'quarterly':
          return total + amount * 4;
        default:
          return total;
      }
    }, 0);

    // Find the closest next payment date
    const now = new Date();
    const upcomingSubscriptions = subscriptions
      .map(sub => ({
        ...sub,
        dueDate: new Date(sub.next_due_date),
      }))
      .filter(sub => sub.dueDate >= now)
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

    const nextPayment = upcomingSubscriptions[0];

    return {
      totalSubscriptions: subscriptions.length,
      monthlySpending,
      yearlySpending,
      nextPaymentDate: nextPayment?.dueDate || null,
      nextPaymentName: nextPayment?.name || null,
    };
  };

  const metrics = calculateMetrics();

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

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>
          Dashboard
        </h1>
        <p style={{ color: '#64748b', margin: '0.5rem 0 0 0' }}>
          Welcome back, {user.name}! • Here's an overview of your subscription activity
        </p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Total Subscriptions */}
        <div className="feature-card" style={{ padding: '1.5rem', textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#64748b' }}>
              Total Subscriptions
            </div>
            <div style={{
              width: '2.5rem',
              height: '2.5rem',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.25rem' }}>
            {metrics.totalSubscriptions}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            {metrics.totalSubscriptions} active services
          </div>
        </div>

        {/* Monthly Spending */}
        <div className="feature-card" style={{ padding: '1.5rem', textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#64748b' }}>
              Monthly Spend
            </div>
            <div style={{
              width: '2.5rem',
              height: '2.5rem',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.25rem' }}>
            ${metrics.monthlySpending.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Per month average
          </div>
        </div>

        {/* Yearly Costs */}
        <div className="feature-card" style={{ padding: '1.5rem', textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#64748b' }}>
              Yearly Costs
            </div>
            <div style={{
              width: '2.5rem',
              height: '2.5rem',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.25rem' }}>
            ${metrics.yearlySpending.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Total annual cost
          </div>
        </div>

        {/* Next Payment */}
        <div className="feature-card" style={{ padding: '1.5rem', textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#64748b' }}>
              Next Payment
            </div>
            <div style={{
              width: '2.5rem',
              height: '2.5rem',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          {metrics.nextPaymentDate ? (
            <>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.25rem' }}>
                {metrics.nextPaymentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {metrics.nextPaymentName}
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.25rem' }}>
                --
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                No upcoming payments
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;