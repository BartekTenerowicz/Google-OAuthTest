import type { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";
import useSwr from "swr";
import {
  CreditCard,
  BarChart3,
  Bell,
  Shield,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import fetcher from "../utils/fetcher";
import getGoogleOAuthURL from "../utils/getGoogleUrl";

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

const LandingPage: NextPage<{ fallbackData: User }> = ({ fallbackData }) => {
  const router = useRouter();
  const { data } = useSwr<User | null>(
    `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/api/me`,
    fetcher,
    { fallbackData }
  );

  // If user is logged in, redirect to dashboard (client-side only)
  useEffect(() => {
    if (data) {
      router.push('/dashboard');
    }
  }, [data, router]);

  const handleGoogleSignIn = () => {
    window.location.href = getGoogleOAuthURL();
  };

  // Show loading state if user is logged in and redirecting
  if (data) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div className="logo-section">
          <div className="logo-icon">
            <CreditCard size={20} />
          </div>
          <span className="logo-text">Wardn</span>
        </div>
        <p style={{ color: '#64748b' }}>Redirecting to dashboard...</p>
      </div>
    );
  }

  const features = [
    {
      icon: CreditCard,
      title: "Track All Subscriptions",
      description: "Monitor all your recurring payments in one centralized dashboard"
    },
    {
      icon: BarChart3,
      title: "Smart Analytics",
      description: "Get insights into your spending patterns and optimize your subscriptions"
    },
    {
      icon: Bell,
      title: "Renewal Alerts",
      description: "Never miss a renewal date with intelligent notification system"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Bank-level security to protect your financial information"
    }
  ];

  const benefits = [
    "Cancel unwanted subscriptions easily",
    "Save money with spending insights",
    "Never get surprised by charges",
    "Manage family subscriptions"
  ];

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Header */}
      <header className="container" style={{ padding: '1.5rem' }}>
        <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="logo-section">
            <div className="logo-icon">
              <CreditCard size={20} />
            </div>
            <span className="logo-text">Wardn</span>
          </div>
          <button className="btn btn-outline" onClick={handleGoogleSignIn}>
            Sign In
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container section">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', alignItems: 'center' }}>
          <div style={{ maxWidth: '600px' }}>
            <h1 className="hero-title">
              Take Control of Your
              <span className="hero-gradient"> Subscriptions</span>
            </h1>
            <p className="hero-subtitle">
              Stop wasting money on forgotten subscriptions. Track, manage, and optimize all your recurring payments in one beautiful dashboard.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <button className="google-btn" onClick={handleGoogleSignIn}>
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
                <ArrowRight size={20} />
              </button>
              <button className="btn btn-outline">
                Learn More
              </button>
            </div>

            <div>
              {benefits.map((benefit, index) => (
                <div key={index} className="benefit-item">
                  <CheckCircle size={20} className="benefit-check" />
                  <span className="benefit-text">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <div style={{
              background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
              borderRadius: '1rem',
              padding: '2rem',
              textAlign: 'center',
              minHeight: '400px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div>
                <CreditCard size={64} style={{ color: '#3b82f6', marginBottom: '1rem' }} />
                <h3 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>Dashboard Preview</h3>
                <p style={{ color: '#64748b' }}>Beautiful subscription management interface</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section" style={{ background: 'rgba(255, 255, 255, 0.5)', backdropFilter: 'blur(12px)' }}>
        <div className="container">
          <h2 className="section-title">
            Everything you need to manage subscriptions
          </h2>
          <p className="section-subtitle">
            Powerful features designed to help you take control of your recurring payments
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  <feature.icon size={32} color="white" />
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section">
        <div className="container">
          <div className="cta-section">
            <div className="cta-content">
              <h2 className="cta-title">Ready to take control?</h2>
              <p className="cta-subtitle">
                Join thousands of users who have already saved money and time managing their subscriptions with Wardn.
              </p>
              <button className="google-btn" onClick={handleGoogleSignIn}>
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Get Started with Google
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container" style={{ padding: '3rem 1.5rem', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ textAlign: 'center', color: '#64748b' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <div style={{
              width: '1.5rem',
              height: '1.5rem',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              borderRadius: '0.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CreditCard size={16} color="white" />
            </div>
            <span style={{ fontWeight: 600 }}>Wardn</span>
          </div>
          <p>&copy; 2024 Wardn. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const data = await fetcher(
    `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/api/me`,
    context.req.headers
  );

  return { props: { fallbackData: data } };
};

export default LandingPage;
